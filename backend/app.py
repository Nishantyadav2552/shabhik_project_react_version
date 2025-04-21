from flask import Flask, render_template, request, jsonify, session, redirect, url_for
import google.generativeai as genai
from datetime import datetime, timedelta, timezone
import azure.cognitiveservices.speech as speechsdk
import random
import os
import pymongo
import bcrypt
import uuid 
import fitz 
import time
from flask_socketio import SocketIO, emit
import base64
from io import BytesIO
from PIL import Image
import cv2
import numpy as np
import mediapipe as mp
from google.cloud import storage  
from flask_cors import CORS


app = Flask(__name__, template_folder="templates")
app.config["TEMPLATES_AUTO_RELOAD"] = True
app.secret_key = "super_secret_key"
UPLOAD_FOLDER = os.path.join(os.getcwd(), "uploads")
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# API Keys
GEMINI_API_KEY = "AIzaSyDIdfe_-YL7NRnSIshidt_ZJIBYIStXKyM"
SPEECH_KEY = "2IXedd2ndFNphFk2yosIclLJD7ziXm0eMIbjiJrWTyTV91p5kNFUJQQJ99BCACGhslBXJ3w3AAAYACOGM802"
SPEECH_REGION = "Centralindia"

# Configure Gemini AI
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-2.0-flash")

GCS_BUCKET_NAME = "interview-uploads"

app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(minutes=30)  # Expires in 30 mins

CORS(app, supports_credentials=True, origins=["https://frontend-avsq.onrender.com/"])

# 🔗 Connect Flask to MongoDB
MONGO_URI = "mongodb+srv://123103054:TfUOHuLbpP5aONS6@cluster0.cssez.mongodb.net/interview_ai?retryWrites=true&w=majority&tls=true&tlsAllowInvalidCertificates=true"
mongo = pymongo.MongoClient(MONGO_URI)
db = mongo["interview_ai"]  # Database name

# Create Collections (like Tables in SQL)
company_collection = db["company"]           # name, password, interview_ids[]
candidate_collection = db["candidate"]       # name, password
interviews_collection = db["interviews"]     # interview_id, title, questions[], company_name
sessions_collection = db["session"]          # active sessions
interview_logs = db["interview_logs"]        # logs, scores etc.


@app.route("/login_candidate", methods=["POST"])
def login_candidate():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"success": False, "message": "Username and password required."}), 400

    user = candidate_collection.find_one({"candidate_name": username})

    if user and bcrypt.checkpw(password.encode("utf-8"), user["password"]):
        # ✅ Store session
        session["user"] = username
        session["role"] = "candidate"

        # ✅ Save session in DB
        sessions_collection.delete_many({"username": username})
        sessions_collection.insert_one({
            "username": username,
            "role": "candidate",
            "ip_address": request.remote_addr,
            "user_agent": request.headers.get("User-Agent"),
            "login_time": datetime.now(timezone.utc),
            "expires_at": datetime.now(timezone.utc) + timedelta(hours=1)
        })

        return jsonify({"success": True, "message": "Login successful."}), 200

    return jsonify({"success": False, "message": "Invalid candidate credentials."}), 401

@app.route("/login_company", methods=["POST"])
def login_company():
    """Handles company login (React-based frontend)"""
    try:
        data = request.get_json()
        username = data.get("username")
        password = data.get("password")

        if not username or not password:
            return jsonify({"success": False, "message": "Username and password are required."}), 400

        user = company_collection.find_one({"company_name": username})

        if user and bcrypt.checkpw(password.encode("utf-8"), user["password"]):
            session["user"] = username
            session["role"] = "company"

            # Remove old session and insert new
            sessions_collection.delete_many({"username": username})
            session_data = {
                "username": username,
                "role": "company",
                "ip_address": request.remote_addr,
                "user_agent": request.headers.get("User-Agent"),
                "login_time": datetime.now(timezone.utc),
                "expires_at": datetime.now(timezone.utc) + timedelta(hours=1)
            }
            sessions_collection.insert_one(session_data)

            return jsonify({"success": True, "message": "Login successful."})

        return jsonify({"success": False, "message": "Invalid company credentials."}), 401

    except Exception as e:
        print("⚠️ Error in login_company:", str(e))
        return jsonify({"success": False, "message": "Server error."}), 500

@app.route("/register", methods=["POST"])
def register():
    """Handles registration for both candidates and companies, with sieve_key validation for companies."""
    try:
        data = request.get_json()
        username = data.get("username")
        password = data.get("password")
        role = data.get("role")
        sieve_key = data.get("sieve_key")

        # Validate basic inputs
        if not username or not password or role not in ["candidate", "company"]:
            return jsonify({"success": False, "message": "Username, password, and valid role are required."}), 400

        # Check if username already exists
        if role == "candidate":
            if candidate_collection.find_one({"candidate_name": username}):
                return jsonify({"success": False, "message": "Candidate already exists."}), 409
        else:
            if company_collection.find_one({"company_name": username}):
                return jsonify({"success": False, "message": "Company already exists."}), 409

            # Company registration requires a valid sieve_key
            if not sieve_key:
                return jsonify({"success": False, "message": "Sieve key is required for company registration."}), 400
            
            if not mongo["interview_ai"]["sieve_keys"].find_one({"key": sieve_key}):
                return jsonify({"success": False, "message": "Invalid sieve key provided."}), 403

        # Hash the password securely
        hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())

        # Insert into the appropriate collection
        if role == "candidate":
            candidate_collection.insert_one({
                "candidate_name": username,
                "password": hashed_password,
                "created_at": datetime.now(timezone.utc)
            })
        else:
            company_collection.insert_one({
                "company_name": username,
                "password": hashed_password,
                "interview_ids": [],
                "created_at": datetime.now(timezone.utc)
            })

        # Set session variables
        session["user"] = username
        session["role"] = role

        # Save session to DB (replace existing ones)
        sessions_collection.delete_many({"username": username})
        sessions_collection.insert_one({
            "username": username,
            "role": role,
            "ip_address": request.remote_addr,
            "user_agent": request.headers.get("User-Agent"),
            "login_time": datetime.now(timezone.utc),
            "expires_at": datetime.now(timezone.utc) + timedelta(hours=1)
        })

        return jsonify({"success": True, "message": "Registration successful."})

    except Exception as e:
        print("⚠️ Error in /register:", str(e))
        return jsonify({"success": False, "message": "Server error."}), 500

def extract_text_from_pdf(pdf_path):
    """Extracts text from a given PDF file."""
    text = ""
    with fitz.open(pdf_path) as doc:
        for page in doc:
            text += page.get_text("text")
    return text.strip()

@app.route("/resume_upload", methods=["POST"])
def resume_upload():
    if "user" not in session or session["role"] != "candidate":
        return jsonify({"success": False, "message": "Unauthorized"}), 401

    username = session["user"]
    interview_id = request.form.get("interview_id")
    job_desc = request.form.get("job_desc", "Software Development Engineer")
    resume = request.files.get("resume")

    if not resume or not resume.filename.endswith(".pdf"):
        return jsonify({"success": False, "message": "Invalid file format. Please upload a PDF."}), 400

    try:
        filename = f"{username}_{interview_id}_resume.pdf"
        file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
        resume.save(file_path)

        # Extract resume text
        extracted_text = extract_text_from_pdf(file_path)

        # Generate score using AI model
        prompt = f"""
        You are an experienced hiring manager & technical interviewer with extensive experience in screening resumes for Software Development Engineer (SDE) roles.

        Analyze the following resume in depth based on the given job description.

        Candidate Resume:
        {extracted_text}

        Rate this resume out of 10. Only generate a numerical answer between 0 to 10. Do not generate any other text than the score.
        """

        try:
            response = model.generate_content(prompt)
            resume_score = response.text.strip()
            if not resume_score.isdigit():
                resume_score = "Error"
        except Exception as e:
            print(f"Model error: {e}")
            resume_score = "Error"

        # Store in MongoDB
        interview_logs.update_one(
            {"candidate_name": username, "interview_id": interview_id},
            {
                "$set": {
                    "resume_score": resume_score,
                    "resume_text": extracted_text,
                    "resume_uploaded_at": datetime.now(timezone.utc)
                }
            },
            upsert=True
        )

        print(f"✅ Resume score stored for {username} (Interview: {interview_id}) → Score: {resume_score}")

        return jsonify({"success": True, "score": resume_score})

    except Exception as e:
        print(f"Resume upload error: {e}")
        return jsonify({"success": False, "message": "Upload failed due to server error."}), 500

@app.route("/candidate_dashboard", methods=["POST"])
def candidate_dashboard():
    if "user" not in session or session["role"] != "candidate":
        return jsonify({"success": False, "message": "Unauthorized"}), 401

    candidate_name = session["user"]

    # ✅ Handle interview ID submission
    data = request.get_json()
    interview_id = data.get("interview_id", "").strip()
    interview = interviews_collection.find_one({"interview_id": interview_id})

    if not interview:
        return jsonify({"success": False, "message": "Invalid Interview ID"}), 404

    company_name = interview["company_name"]
    session["interview_id"] = interview_id
    session["company_name"] = company_name

    # ✅ Store active session
    sessions_collection.delete_many({"username": candidate_name})
    sessions_collection.insert_one({
        "username": candidate_name,
        "role": "candidate",
        "interview_id": interview_id,
        "company_name": company_name,
        "ip_address": request.remote_addr,
        "user_agent": request.headers.get("User-Agent"),
        "login_time": datetime.now(timezone.utc),
        "expires_at": datetime.now(timezone.utc) + timedelta(hours=1)
    })

    return jsonify({"success": True, "message": "Interview ID accepted."})


@app.route("/candidate_dashboard_logs", methods=["GET"])
def candidate_dashboard_logs():
    if "user" not in session or session["role"] != "candidate":
        return jsonify({"success": False, "message": "Unauthorized"}), 401

    candidate_name = session["user"]
    raw_logs = list(interview_logs.find({"candidate_name": candidate_name}))
    enriched_logs = []
    scores = []

    for log in raw_logs:
        interview_id = log.get("interview_id")
        interview = interviews_collection.find_one({"interview_id": interview_id})

        company = interview["company_name"] if interview else "Unknown"
        post = interview["job_title"] if interview else "N/A"
        final_score = log.get("overall_score", 0)
        scores.append(final_score)

        date = log.get("logs", [{}])[0].get("timestamp")
        formatted_date = date.strftime("%d-%b-%Y") if date else "N/A"
        result = "Pass" if final_score >= 6 else "Fail"

        enriched_logs.append({
            "company": company,
            "post": post,
            "score": final_score,
            "date": formatted_date,
            "result": result
        })

    total_interviews = len(enriched_logs)
    average_score = round(sum(scores) / len(scores), 2) if scores else 0
    resume_score = raw_logs[-1].get("resume_score", "Not available") if raw_logs else "Not available"

    return jsonify({
        "success": True,
        "interviews": enriched_logs,
        "total_interviews": total_interviews,
        "average_score": average_score,
        "resume_score": resume_score
    })

@app.route("/get_candidate_name", methods=["GET"])
def get_candidate_name():
    if "user" not in session or session.get("role") != "candidate":
        return jsonify({"success": False, "message": "Unauthorized"}), 401
    
    return jsonify({"success": True, "username": session["user"]})

@app.route("/start_interview", methods=["POST"])
def start_interview():
    global question_index, candidate_responses

    if "user" not in session or session["role"] != "candidate":
        return jsonify({"error": "Unauthorized"}), 403

    candidate_name = session["user"]
    interview_id = session.get("interview_id")

    # Ensure empty logs and get resume score
    interview_logs.update_one(
        {"candidate_name": candidate_name, "interview_id": interview_id},
        {"$set": {"logs": []}}, upsert=True
    )

    # Fetch resume score if present
    resume_data = interview_logs.find_one(
        {"candidate_name": candidate_name, "interview_id": interview_id},
        {"resume_score": 1}
    )
    session["resume_score"] = resume_data.get("resume_score", "Not available") if resume_data else "N/A"

    # Select 2 random questions
    interview = interviews_collection.find_one({"interview_id": interview_id})
    all_questions = interview.get("questions", []) if interview else []

    if not all_questions:
        return jsonify({"error": "No questions available"}), 404

    session["selected_questions"] = all_questions.copy()

    question_index = 0
    candidate_responses = []

    return jsonify({
        "success": True,
        "message": "Interview started",
        "selected_questions": session["selected_questions"]
    })

@app.route("/get_question", methods=["GET"])
def get_question():
    global question_index

    if "user" not in session or "interview_id" not in session:
        return jsonify({"error": "Unauthorized"}), 403

    selected = session.get("selected_questions", [])

    if question_index >= len(selected):
        return jsonify({"message": "Interview Completed!"})

    current_question = selected[question_index]

    # Log it
    interview_logs.update_one(
        {"candidate_name": session["user"], "interview_id": session["interview_id"]},
        {"$push": {
            "logs": {
                "question": current_question,
                "response": None,
                "timestamp": datetime.now(timezone.utc)
            }
        }},
        upsert=True
    )

    return jsonify({"question": current_question})

@app.route("/get_all_interviews", methods=["GET"])
def get_all_interviews():
    try:
        interviews = list(interviews_collection.find({}, {"_id": 0, "interview_id": 1, "job_title": 1, "company_name": 1}))
        formatted = [{"interview_id": i["interview_id"], "job_title": i.get("job_title", "N/A"), "company": i.get("company_name", "Unknown")} for i in interviews]
        return jsonify({"success": True, "interviews": formatted})
    except Exception as e:
        print("⚠️ Error in get_all_interviews:", e)
        return jsonify({"success": False, "message": "Server error"}), 500

@app.route("/submit_response", methods=["POST"])
def submit_response():
    global question_index, candidate_responses

    if "user" not in session or "interview_id" not in session:
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()
    response = data.get("answer", "").strip()
    is_followup = data.get("is_followup", False)

    if not response:
        return jsonify({"error": "Empty answer"}), 400

    candidate_responses.append(response)

    # Update response in logs
    updated = interview_logs.update_one(
        {
            "candidate_name": session["user"],
            "interview_id": session["interview_id"],
            "logs.response": None
        },
        {
            "$set": {
                "logs.$.response": response
            }
        }
    )

    if updated.modified_count == 0:
        return jsonify({"error": "No question found to update"}), 400

    if not is_followup:
        question_index += 1
    
    return jsonify({"success": True})

@app.route("/text_to_speech", methods=["POST"])
def text_to_speech():
    from azure.cognitiveservices.speech import SpeechConfig, SpeechSynthesizer, audio

    data = request.get_json()
    text = data.get("text", "")

    if not text:
        return jsonify({"error": "No text provided"}), 400

    try:
        file_path = "static/output.mp3"

        # Ensure the directory exists
        os.makedirs(os.path.dirname(file_path), exist_ok=True)

        # Remove old file if exists
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception as e:
                print("⚠️ Could not remove old file:", e)

        # Setup Azure Speech SDK
        speech_config = speechsdk.SpeechConfig(subscription=SPEECH_KEY, region=SPEECH_REGION)
        speech_config.speech_synthesis_voice_name = "en-IN-AashiNeural"
        audio_config = speechsdk.audio.AudioOutputConfig(filename=file_path)

        synthesizer = speechsdk.SpeechSynthesizer(speech_config=speech_config, audio_config=audio_config)
        result = synthesizer.speak_text_async(text).get()

        if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
            print(f"✅ TTS generated: {file_path}")
            return jsonify({"audio_url": f"/{file_path}"})
        else:
            print(f"❌ Azure TTS failed: {result.reason}")
            return jsonify({"error": "Azure synthesis failed", "reason": str(result.reason)}), 500

    except Exception as e:
        print(f"❌ Exception in TTS: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory('static', filename)

@app.route("/evaluate_response", methods=["GET"])
def evaluate_response():
    """Evaluates the final interview score based on all questions and responses."""
    if "user" not in session or session["role"] != "candidate":
        return jsonify({"error": "Unauthorized"}), 403

    candidate_name = session["user"]
    interview_id = session.get("interview_id")

    # ✅ Retrieve all logs for this candidate + interview
    logs = interview_logs.find_one(
        {"candidate_name": candidate_name, "interview_id": interview_id},
        {"_id": 0, "logs": 1}
    )

    if not logs or "logs" not in logs:
        return jsonify({"error": "No interview data found"}), 400

    completed_logs = [log for log in logs["logs"] if log.get("response")]

    if not completed_logs:
        return jsonify({"error": "No completed responses available for evaluation"}), 400

    interview_text = "\n".join([f"Q: {log['question']}\nA: {log['response']}" for log in completed_logs])

    prompt = f"""Analyze the following interview responses and provide a final score (0-10):

{interview_text}

Give only an integer value between 0 and 10, no explanation or extra text.
"""

    try:
        ai_response = model.generate_content(prompt)
        score_text = ai_response.text.strip()
        score = int(score_text)

        if 0 <= score <= 10:
            interview_score = score
        else:
            raise ValueError("Invalid score")

    except (ValueError, AttributeError):
        interview_score = 5  # fallback score

    # ✅ Save interview score
    interview_logs.update_one(
        {"candidate_name": candidate_name, "interview_id": interview_id},
        {"$set": {"final_score": interview_score}},
        upsert=True
    )

    # ✅ Resume Score from session
    resume_score = session.get("resume_score")
    try:
        resume_score = float(resume_score)
    except:
        resume_score = 0

    # ✅ Smile Score from face_metrics
    face_data = interview_logs.find_one(
        {"candidate_name": candidate_name, "interview_id": interview_id},
        {"face_metrics": 1}
    )

    smile_score = 0
    if face_data and "face_metrics" in face_data:
        face = face_data["face_metrics"]
        try:
            smile_ratio = face["smile_frames"] / max(face["smile_total"], 1)
            smile_score = round(smile_ratio * 10, 2)
            if smile_score > 10:
                smile_score = 10
        except:
            smile_score = 0

    # ✅ Overall score calculation
    overall_score = round(0.2 * resume_score + 0.1 * smile_score + 0.7 * interview_score, 2)

    # ✅ Save to DB
    interview_logs.update_one(
        {"candidate_name": candidate_name, "interview_id": interview_id},
        {"$set": {"overall_score": overall_score}},
        upsert=True
    )

    return jsonify({
        "success": True,
        "final_score": interview_score,
        "resume_score": resume_score,
        "smile_score": smile_score,
        "overall_score": overall_score
    })

@app.route("/get_feedback", methods=["GET"])
def get_feedback():
    """Retrieves all stored questions & responses for feedback analysis."""
    if "user" not in session or "interview_id" not in session:
        return jsonify({"error": "Unauthorized"}), 403

    candidate_name = session["user"]
    interview_id = session["interview_id"]

    # ✅ Fetch logs from MongoDB
    logs = interview_logs.find_one(
        {"candidate_name": candidate_name, "interview_id": interview_id},
        {"_id": 0, "logs": 1}
    )

    if not logs or "logs" not in logs:
        return jsonify({"error": "No interview data found"}), 400

    completed_logs = [log for log in logs["logs"] if log.get("response")]

    if not completed_logs:
        return jsonify({"error": "No completed responses available for feedback"}), 400

    # ✅ Format Q&A for prompt
    interview_text = "\n".join([f"Q: {log['question']}\nA: {log['response']}" for log in completed_logs])

    # ✅ Feedback prompt for Gemini
    prompt = f"""Analyze the following interview and provide feedback:

Interview Transcript:
{interview_text}

Please evaluate and provide:
- Overall performance
- Strengths
- Areas for improvement

Also, give a score out of 10 based on this breakdown:
- 3 points for relevance of answers to questions
- 3 points for communication skills
- 4 points for technical accuracy

Use simple, clear 5 line text in your feedback. Do not use bold formatting or headings."""

    try:
        ai_response = model.generate_content(prompt)
        feedback_text = ai_response.text.strip()
    except Exception as e:
        print("⚠️ Gemini AI feedback error:", e)
        feedback_text = "Feedback generation failed."

    return jsonify({"feedback": feedback_text})

@app.route("/generate_followup", methods=["POST"])
def generate_followup():
    """Generate a human-like follow-up question based on the candidate's last answer."""
    if "user" not in session or "interview_id" not in session:
        return jsonify({"error": "Unauthorized"}), 403

    candidate_name = session["user"]
    interview_id = session["interview_id"]

    # 🔍 Get the last answered log
    log = interview_logs.find_one(
        {"candidate_name": candidate_name, "interview_id": interview_id},
        {"logs": {"$slice": -1}}  # Only fetch last log
    )

    last_response = ""
    if log and "logs" in log and log["logs"]:
        last_entry = log["logs"][0]
        last_response = last_entry.get("response", "").strip()

    previous_answers = last_response or "No previous responses yet."

    # 🧠 Gemini prompt
    prompt = (
        f"The candidate previously responded: '{previous_answers}'. "
        f"Ask a natural, engaging one-line follow-up question, avoiding robotic phrasing. "
        f"Sound more like a human is asking. Only return the follow-up question."
    )

    try:
        follow_up_question = model.generate_content(prompt).text.strip()

        # ✅ Log into MongoDB
        interview_logs.update_one(
            {"candidate_name": candidate_name, "interview_id": interview_id},
            {
                "$push": {
                    "logs": {
                        "question": follow_up_question,
                        "response": None,
                        "timestamp": datetime.now(timezone.utc)
                    }
                }
            },
            upsert=True
        )

        return jsonify({"success": True, "follow_up_question": follow_up_question})

    except Exception as e:
        print("⚠️ Gemini follow-up error:", e)
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/save_face_stats", methods=["POST"])
def save_face_stats():
    if "user" not in session or "interview_id" not in session:
        return jsonify({"success": False, "message": "Unauthorized"}), 403

    data = request.get_json()
    stats = {
        "smile_frames": data.get("smileFrames", 0),
        "unsmile_frames": data.get("unsmileFrames", 0),
        "smile_total": data.get("smileTotal", 0),
        "eye_contact_frames": data.get("lookFrames", 0),
        "eye_contact_total": data.get("lookTotal", 0),
        "blink_count": data.get("blinkCount", 0),
        "recorded_at": datetime.now(timezone.utc)
    }

    interview_logs.update_one(
        {"candidate_name": session["user"], "interview_id": session["interview_id"]},
        {"$set": {"face_metrics": stats}},
        upsert=True
    )

    return jsonify({"success": True, "message": "Face metrics saved"})

@app.route("/upload_video", methods=["POST"])
def upload_video():
    if "video" not in request.files:
        return jsonify({"error": "No video file received"}), 400

    video_file = request.files["video"]
    print("🎥 Received video file:", video_file.filename)

    # Create a unique local filename
    timestamp = int(time.time())
    filename = f"interview_{timestamp}.webm"

    # Save locally to a folder like /recordings/
    local_folder = os.path.join(os.getcwd(), "recordings")
    os.makedirs(local_folder, exist_ok=True)

    local_path = os.path.join(local_folder, filename)
    try:
        video_file.save(local_path)
        print(f"✅ Video saved locally at: {local_path}")

        return jsonify({
            "success": True,
            "video_path": f"/recordings/{filename}"
        })

    except Exception as e:
        print("❌ Failed to save video locally:", e)
        return jsonify({"error": str(e)}), 500

@app.route("/create_interview", methods=["POST"])
def create_interview():
    if "user" not in session or session["role"] != "company":
        return jsonify({"error": "Unauthorized"}), 403

    # ❌ Clear old interview session data
    session.pop("interview_id", None)
    session.pop("interview_title", None)
    session.pop("job_title", None)
    session.pop("difficulty", None)
    session.pop("experience", None)
    session.pop("num_questions", None)
    session.pop("questions", None)
    session.pop("generated_questions", None)

    # ✅ Create new interview
    title = request.json.get("interview_title", "Untitled Interview")
    interview_id = f"I{random.randint(10000, 99999)}"

    company_collection.update_one(
        {"company_name": session["user"]},
        {"$push": {"interview_ids": interview_id}},
        upsert=True
    )

    interviews_collection.insert_one({
        "interview_id": interview_id,
        "interview_title": title,
        "company_name": session["user"],
        "questions": [],
        "created_at": datetime.utcnow()
    })

    session["interview_id"] = interview_id
    session["interview_title"] = title

    return jsonify({
        "success": True,
        "interview_id": interview_id
    })

@app.route("/generate_questions", methods=["POST"])
def generate_questions():
    if "user" not in session or session["role"] != "company":
        return jsonify({"error": "Unauthorized"}), 401

    try:
        data = request.get_json()
        job_title = data.get("job_title", "").strip()
        difficulty = data.get("difficulty", "Medium").strip()
        min_exp = data.get("min_exp", "0").strip()
        num_questions = int(data.get("num_questions", 5))

        if not job_title:
            return jsonify({"error": "Job title is required"}), 400

        num_questions = max(1, min(num_questions, 50))

        # ✅ Update interview meta fields only
        interview_id = session.get("interview_id")
        if interview_id:
            interviews_collection.update_one(
                {"interview_id": interview_id},
                {
                    "$set": {
                        "job_title": job_title,
                        "difficulty": difficulty,
                        "experience": min_exp,
                        "num_questions": num_questions
                    }
                }
            )

        # ✅ Generate questions
        prompt = f"""
        Generate {num_questions} technical and one-line interview questions for the job title: {job_title}.
        Difficulty level is {difficulty}. Experience required: {min_exp} years.

        - If the difficulty is Easy, make questions more theoretical and basic.
        - If Medium, include problem-solving and coding-related questions.
        - If Hard, include complex problem-solving, system design, and case studies.

        Only output questions in different lines. No extra text.
        """
        ai_response = model.generate_content(prompt)
        generated_questions = [q.strip() for q in ai_response.text.strip().split("\n") if q.strip()]
        generated_questions = generated_questions[:num_questions]

        # ✅ DO NOT SAVE QUESTIONS YET
        session["generated_questions"] = generated_questions

        return jsonify({"questions": generated_questions})

    except Exception as e:
        print("❌ Error in /generate_questions:", str(e))
        return jsonify({"error": "Failed to generate questions."}), 500

@app.route("/save_selected_questions", methods=["POST"])
def save_selected_questions():
    if "user" not in session or session["role"] != "company":
        return jsonify({"error": "Unauthorized"}), 403

    interview_id = session.get("interview_id")
    if not interview_id:
        return jsonify({"error": "No interview ID in session"}), 400

    try:
        data = request.get_json()
        selected_questions = data.get("questions", [])

        if not selected_questions:
            return jsonify({"error": "No questions to save"}), 400

        interviews_collection.update_one(
            {"interview_id": interview_id},
            {"$set": {"questions": selected_questions}}
        )

        return jsonify({"success": True, "message": "Questions saved successfully."})

    except Exception as e:
        print("❌ Error in save_selected_questions:", str(e))
        return jsonify({"error": "Failed to save questions."}), 500

@app.route("/get_company_interviews", methods=["GET"])
def get_company_interviews():
    if "user" not in session or session["role"] != "company":
        return jsonify({"success": False, "message": "Unauthorized"}), 401

    company_name = session["user"]

    try:
        interviews = list(interviews_collection.find(
            {"company_name": company_name},
            {"_id": 0, "interview_id": 1, "job_title": 1}
        ))

        return jsonify({"success": True, "interviews": interviews})

    except Exception as e:
        print(f"❌ Error in get_company_interviews: {e}")
        return jsonify({"success": False, "message": "Failed to fetch interviews."}), 500

@app.route("/load_interview_and_generate/<interview_id>", methods=["GET"])
def load_interview_and_generate(interview_id):
    if "user" not in session or session["role"] != "company":
        return jsonify({"success": False, "message": "Unauthorized"}), 401

    try:
        interview = interviews_collection.find_one({"interview_id": interview_id})
        if not interview:
            return jsonify({"success": False, "message": "Interview not found"}), 404

        # Store interview details in session
        session["interview_id"] = interview.get("interview_id")
        session["interview_title"] = interview.get("interview_title", "Untitled")
        session["job_title"] = interview.get("job_title", "")
        session["difficulty"] = interview.get("difficulty", "")
        session["experience"] = interview.get("experience", "")
        session["num_questions"] = interview.get("num_questions", 5)
        session["questions"] = interview.get("questions", [])

        return jsonify({"success": True})

    except Exception as e:
        print(f"❌ Error in /load_interview_and_generate/{interview_id}: {e}")
        return jsonify({"success": False, "message": "Server error."}), 500

@app.route("/get_current_interview_data", methods=["GET"])
def get_current_interview_data():
    if "user" not in session or session["role"] != "company":
        return jsonify({"success": False, "message": "Unauthorized"}), 401

    return jsonify({
        "success": True,
        "interview_id": session.get("interview_id"),
        "interview_title": session.get("interview_title"),
        "job_title": session.get("job_title"),
        "difficulty": session.get("difficulty"),
        "experience": session.get("experience"),
        "num_questions": session.get("num_questions"),
        "questions": session.get("questions", [])
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)