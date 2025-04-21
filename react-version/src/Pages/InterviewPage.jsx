import React, { useEffect, useState, useRef } from "react";
import Navbar from "../Components/Navbar/Navbar";
import Sidebar from "../Components/Sidebar/Sidebar";
import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';
import { useNavigate } from "react-router-dom";


let totalFrames = 0;
let smileFrames = 0;
let unsmile = 0;

// head movements
let prevNoseY = null;

function getMovement(landmarks) {
  const leftEye = landmarks[33];
  const rightEye = landmarks[263];
  const nose = landmarks[1];

  const distToLeftEye = Math.abs(nose.x - leftEye.x);
  const distToRightEye = Math.abs(nose.x - rightEye.x);

  let turn = "Facing Forward";
  if (distToLeftEye > distToRightEye + 0.04) turn = "Looking Right";
  else if (distToRightEye > distToLeftEye + 0.04) turn = "Looking Left";

  const eyeMid = {
    x: (leftEye.x + rightEye.x) / 2,
    y: (leftEye.y + rightEye.y) / 2,
    z: (leftEye.z + rightEye.z) / 2
  };
  const vector = {
    x: nose.x - eyeMid.x,
    y: nose.y - eyeMid.y,
    z: nose.z - eyeMid.z
  };
  const yawRadians = Math.atan2(vector.x, -vector.z);
  const yawDegrees = yawRadians * (180 / Math.PI);

  const dx = rightEye.x - leftEye.x;
  const dy = rightEye.y - leftEye.y;
  const tiltAngle = Math.atan2(dy, dx) * (180 / Math.PI);

  let movement = "Straight";
  if (tiltAngle > 5) movement = "Tilted Right";
  else if (tiltAngle < -5) movement = "Tilted Left";

  const eyeCenterY = (leftEye.y + rightEye.y) / 2;
  const nodAngle = (nose.y - eyeCenterY) * 100;
  let nod = "Straight";

  if (prevNoseY !== null) {
    const diffY = nose.y - prevNoseY;
    if (diffY > 0.015) nod = "Nodding Down";
    else if (diffY < -0.015) nod = "Nodding Up";
  }

  prevNoseY = nose.y;

  const msg = `${movement} | ${nod} | Tilt: ${tiltAngle.toFixed(2)}° | Nod: ${nodAngle.toFixed(2)}° | Yaw: ${yawDegrees.toFixed(2)}°`;

  const infoBox = document.getElementById("movement-info");
  if (infoBox) infoBox.innerText = msg;

  if (turn !== "Facing Forward") showLookStraightMessage();
  else hideLookStraightMessage();
}

function showLookStraightMessage() {
  if (!document.getElementById("look-straight-msg")) {
    const msg = document.createElement("div");
    msg.id = "look-straight-msg";
    msg.innerText = "👁️ Please look straight at the screen";
    msg.style.position = "fixed";
    msg.style.bottom = "210px";
    msg.style.right = "10px";
    msg.style.background = "#fff";
    msg.style.color = "red";
    msg.style.padding = "8px 12px";
    msg.style.borderRadius = "10px";
    msg.style.fontWeight = "bold";
    msg.style.boxShadow = "0px 2px 10px rgba(0,0,0,0.2)";
    document.body.appendChild(msg);
  }
}

function hideLookStraightMessage() {
  const msg = document.getElementById("look-straight-msg");
  if (msg) msg.remove();
}

function calculateDistance(p1, p2) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function detectSmile(landmarks) {
  totalFrames++;

  const MOUTH_LEFT = 61, MOUTH_RIGHT = 291, NOSE = 1, CHEEK_LEFT = 234, CHEEK_RIGHT = 454;
  const mouthLeft = landmarks[MOUTH_LEFT];
  const mouthRight = landmarks[MOUTH_RIGHT];
  const nose = landmarks[NOSE];
  const cheekLeft = landmarks[CHEEK_LEFT];
  const cheekRight = landmarks[CHEEK_RIGHT];

  const mouthWidth = calculateDistance(mouthLeft, mouthRight);
  const noseToCheekAvg = (calculateDistance(nose, cheekLeft) + calculateDistance(nose, cheekRight)) / 2;
  const smileScore = mouthWidth / noseToCheekAvg;

  const isSmiling = smileScore > 0.76;

  if (isSmiling) {
    smileFrames++;
    const counter = document.getElementById("smile-counter");
    if (counter) counter.innerText = `😊 Smiles: ${smileFrames}`;
  } else {
    unsmile++;
    const counter = document.getElementById("unsmile-counter");
    if (counter) counter.innerText = `😐 Unsmiles: ${unsmile}`;
  }
}

const LEFT_IRIS = 468;
const RIGHT_IRIS = 473;
const LEFT_EYE_INNER = 133;
const LEFT_EYE_OUTER = 33;
const RIGHT_EYE_INNER = 362;
const RIGHT_EYE_OUTER = 263;
const NOSE_TIP = 1;

let lookFrames = 0;
let lookTotalFrames = 0;

function detectCameraLook(landmarks) {
  lookTotalFrames++;

  const leftIris = landmarks[LEFT_IRIS];
  const rightIris = landmarks[RIGHT_IRIS];
  const leftEyeInner = landmarks[LEFT_EYE_INNER];
  const leftEyeOuter = landmarks[LEFT_EYE_OUTER];
  const rightEyeInner = landmarks[RIGHT_EYE_INNER];
  const rightEyeOuter = landmarks[RIGHT_EYE_OUTER];
  const nose = landmarks[NOSE_TIP];

  const leftRatio = (leftIris.x - leftEyeOuter.x) / (leftEyeInner.x - leftEyeOuter.x);
  const rightRatio = (rightIris.x - rightEyeInner.x) / (rightEyeOuter.x - rightEyeInner.x);

  const eyeDirection =
    leftRatio < 0.42 && rightRatio < 0.42
      ? "Right"
      : leftRatio > 0.58 && rightRatio > 0.58
        ? "Left"
        : "Center";

  const eyeCenterX = (leftEyeOuter.x + rightEyeOuter.x) / 2;
  const headDirection =
    nose.x < eyeCenterX - 0.02
      ? "Looking Right"
      : nose.x > eyeCenterX + 0.02
        ? "Looking Left"
        : "Straight";

  const isLooking = headDirection === "Straight" && eyeDirection === "Center";

  if (isLooking) {
    lookFrames++;
  }
  // 🔴 Optional live status (append or overwrite existing info box)
  const infoBox = document.getElementById("movement-info");
  if (infoBox) {
    infoBox.innerText += ` | Eyes: ${eyeDirection} | ${isLooking ? "👀 Looking" : "🚫 Not Looking"}`;
  }
  const lookInfo = document.getElementById("look-info");
  if (lookInfo) {
    lookInfo.innerText = `👁️ Looking Frames: ${lookFrames} / ${lookTotalFrames}`;
  }
}
const LEFT_EYE_EAR = [33, 160, 158, 133, 153, 144];
const RIGHT_EYE_EAR = [362, 385, 387, 263, 373, 380];
const EAR_THRESHOLD = 0.22;  // 👁️ Tune this if needed

let blinkCounter = 0;
let blinkActive = false;

function distance(p1, p2) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function calculateEAR(eyeIndices, landmarks) {
  const p1 = landmarks[eyeIndices[0]];
  const p2 = landmarks[eyeIndices[1]];
  const p3 = landmarks[eyeIndices[2]];
  const p4 = landmarks[eyeIndices[3]];
  const p5 = landmarks[eyeIndices[4]];
  const p6 = landmarks[eyeIndices[5]];

  const vertical1 = distance(p2, p6);
  const vertical2 = distance(p3, p5);
  const horizontal = distance(p1, p4);

  return (vertical1 + vertical2) / (2.0 * horizontal);
}

function detectBlink(landmarks) {
  const leftEAR = calculateEAR(LEFT_EYE_EAR, landmarks);
  const rightEAR = calculateEAR(RIGHT_EYE_EAR, landmarks);
  const avgEAR = (leftEAR + rightEAR) / 2.0;

  if (avgEAR < EAR_THRESHOLD) {
    if (!blinkActive) {
      blinkActive = true;
      blinkCounter++;
      console.log("👁️ Blink detected!", blinkCounter);
    }
  } else {
    blinkActive = false;
  }

  const blinkDisplay = document.getElementById("blink-counter");
  if (blinkDisplay) {
    blinkDisplay.innerText = `👁️ Blinks: ${blinkCounter}`;
  }
}

let cameraStream = null;
let screenRecorder;
let screenChunks = [];
let screenStream;

async function startScreenRecording() {
  try {
    screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true // 🔊 include system audio if user shares tab with audio
    });

    const micStream = await navigator.mediaDevices.getUserMedia({
      audio: true
    });

    const audioContext = new AudioContext();
    const destination = audioContext.createMediaStreamDestination();

    const systemSource = audioContext.createMediaStreamSource(screenStream);
    const micSource = audioContext.createMediaStreamSource(micStream);

    systemSource.connect(destination);
    micSource.connect(destination);

    const combinedStream = new MediaStream([
      ...screenStream.getVideoTracks(),
      ...destination.stream.getAudioTracks()
    ]);

    screenRecorder = new MediaRecorder(combinedStream, {
      mimeType: "video/webm"
    });

    screenChunks = [];

    screenRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) screenChunks.push(e.data);
    };

    screenRecorder.start();
    console.log("🎥 Screen + mic recording started.");
  } catch (err) {
    console.error("❌ Failed to start screen + mic recording:", err);
    alert("Permission denied or unsupported browser.");
  }
}

function stopScreenRecording() {
  if (!screenRecorder) {
    console.warn("📛 No screen recorder found.");
    return;
  }

  // ✅ Register this BEFORE calling .stop()
  screenRecorder.onstop = async () => {
    try {
      const screenBlob = new Blob(screenChunks, { type: "video/webm" });

      const formData = new FormData();
      formData.append("video", screenBlob, "screen_recording.webm");

      const response = await fetch("https://aiinterviewer-d7c7.onrender.com/upload_video", {
        method: "POST",
        body: formData
      });

      const result = await response.json();
      if (result.success) {
        console.log("✅ Video uploaded to GCS:", result.video_url);
        // Optionally: save URL to DB or show alert
        // alert("Interview recording uploaded successfully!");
      } else {
        console.error("❌ Upload failed:", result.error);
      }
    } catch (error) {
      console.error("❌ Upload error:", error);
    }
  };

  // ✅ Now stop the recorder
  screenRecorder.stop();
}

const dialogWrapperClasses = "fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50";
const dialogBoxClasses = "bg-white bg-opacity-50 backdrop-blur-lg p-8 rounded-lg shadow-lg max-w-md w-full";

const InterviewCompleteDialog = ({ closeDialog, score, feedback }) => (
    <div className={dialogWrapperClasses}>
        <div className={dialogBoxClasses}>
            <button className="float-right text-black text-lg" onClick={closeDialog}>
                <span>&times;</span>
            </button>
            <h3 className="text-2xl font-semibold mb-6">Interview Completed</h3>
            <p className="mb-2">Thank you for attending the interview!</p>
            <p className="mb-2">We appreciate your time and effort.The final score will be based on your overall interview performance, including factors such as confidence, accuracy, resume  and more.</p>
            {/* <p>We appreciate your time and effort.</p> */}
            <p className="text-lg mt-4">🧠 Overall Score: <strong>{score}/10</strong></p>
            {/* <p>Overall score is given by considering 20 resume score + 10 body gesture + 70% interview score</p> */}
            <p className="text-lg mt-4">📝 Feedback:</p>
            <p className="text-sm whitespace-pre-line text-gray-700 mt-2">{feedback}</p>
            <button
                className="mt-6 bg-[#13547a] text-white py-3 px-5 text-base rounded hover:bg-[#0d3a5e]"
                onClick={closeDialog}
            >
                Close
            </button>
        </div>
    </div>
);

const InterviewPage = () => {
    const hasStarted = useRef(false);
    const hasStartedRecording = useRef(false);
    const recognitionRef = useRef(null);
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [loading, setLoading] = useState(true);
    const [isListening, setIsListening] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [finalScore, setFinalScore] = useState(null);
    const [feedback, setFeedback] = useState("");
    const [isFollowUp, setIsFollowUp] = useState(false);
    const [mainCount, setMainCount] = useState(0); 
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const navigate = useNavigate();

  const fetchFollowUpQuestion = async () => {
    try {
      const res = await fetch("https://aiinterviewer-d7c7.onrender.com/generate_followup", {
        method: "POST",
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        setQuestion(data.follow_up_question);
        setAnswer("");
        speakQuestion(data.follow_up_question);
      } else {
        console.error("Follow-up generation failed.");
      }
    } catch (err) {
      console.error("Follow-up fetch error:", err);
    }
  };

  const speakQuestion = async (text) => {
    try {
      const res = await fetch("https://aiinterviewer-d7c7.onrender.com/text_to_speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();
      if (data.audio_url) {
        const audio = new Audio(`https://aiinterviewer-d7c7.onrender.com${data.audio_url}?t=${Date.now()}`);
        setIsSpeaking(true); // ✅ Start speaking
        audio.play();

        // ✅ When speaking ends, allow submission again
        audio.onended = () => {
          setIsSpeaking(false);
        };

        audio.onerror = () => {
          console.error("Audio playback failed.");
          setIsSpeaking(false);
        };
      } else {
        console.error("TTS Error:", data.error || "Unknown error");
      }
    } catch (err) {
      console.error("TTS Request Failed:", err);
    }
  };



  const startLiveSpeechToText = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support real-time Speech Recognition.");
      return;
    }

    if (!recognitionRef.current) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setAnswer(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    if (!isListening) {
      recognitionRef.current.start();
      setIsListening(true);
    } else {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

    const fetchFinalScore = async () => {
      try {
        const res = await fetch("https://aiinterviewer-d7c7.onrender.com/evaluate_response", {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
          setFinalScore(data.overall_score ?? data.final_score); // show overall
        } else {
          setFinalScore("N/A");
        }
      } catch (err) {
        console.error("Failed to fetch final score:", err);
        setFinalScore("N/A");
      }
    };    

  const fetchFeedback = async () => {
    try {
      const res = await fetch("https://aiinterviewer-d7c7.onrender.com/get_feedback", {
        method: "GET",
        credentials: "include"
      });
      const data = await res.json();
      setFeedback(data.feedback || "No feedback available.");
    } catch (err) {
      console.error("Failed to fetch feedback:", err);
      setFeedback("Failed to load feedback.");
    }
  };

  const sendFaceStatsToServer = async () => {
    try {
      const res = await fetch("https://aiinterviewer-d7c7.onrender.com/save_face_stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          smileFrames: smileFrames,
          unsmileFrames: unsmile,
          smileTotal: totalFrames,
          lookFrames: lookFrames,
          lookTotal: lookTotalFrames,
          blinkCount: blinkCounter
        })
      });
      const result = await res.json();
      console.log("📊 Face stats sent:", result);
    } catch (err) {
      console.error("❌ Failed to send face stats:", err);
    }
  };

  const fetchNextQuestion = async () => {
    try {
      const res = await fetch("https://aiinterviewer-d7c7.onrender.com/get_question", {
        method: "GET",
        credentials: "include"
      });
      const data = await res.json();

      if (data.question) {
        setQuestion(data.question);
        setAnswer("");

        // ✅ Run TTS in background
        speakQuestion(data.question);  // Don't await here!
      } else {
        setQuestion("");
        await fetchFinalScore();
        await fetchFeedback();
        stopScreenRecording();
        setShowDialog(true);
      }
    } catch (err) {
      console.error("Failed to fetch question:", err);
      setQuestion("❌ Failed to load question.");
    }
  };

  const startInterview = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://aiinterviewer-d7c7.onrender.com/start_interview", {
        method: "POST",
        credentials: "include"
      });
  
      const data = await res.json();
      if (data.success) {
        // ✅ Update question count from session
        setTotalQuestions(data.selected_questions.length || 0);
        await fetchNextQuestion();
      } else {
        setQuestion("❌ Interview initialization failed.");
      }
    } catch (err) {
      console.error("Interview start failed:", err);
      setQuestion("❌ Interview initialization failed.");
    } finally {
      setLoading(false);
    }
  };  

  const handleSubmit = async () => {
    if (!answer.trim()) {
      alert("Please enter your answer.");
      return;
    }

    try {
      const res = await fetch("https://aiinterviewer-d7c7.onrender.com/submit_response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ answer, is_followup: isFollowUp })
      });

      const data = await res.json();
      if (data.success) {
        if (isFollowUp) {
          setIsFollowUp(false);
          if (mainCount < totalQuestions) {
            await fetchNextQuestion();
          } else {
            await fetchFinalScore();
            await fetchFeedback();
            await sendFaceStatsToServer();
            setShowDialog(true);
          }
        } else {
          await fetchFollowUpQuestion();
          setIsFollowUp(true);
          setMainCount(prev => prev + 1);
        }        
      } else {
        alert(data.message || "Failed to submit answer.");
      }
    } catch (err) {
      alert("Submission failed. Try again.");
      console.error(err);
    }
  };

  useEffect(() => {

    if (!hasStarted.current) {
      hasStarted.current = true;
      startInterview();
    }
    if (!hasStartedRecording.current) {
      hasStartedRecording.current = true;
      startScreenRecording(); // ✅ only once
    }

    const video = document.getElementById("userVideo");
    if (navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then((stream) => {
          cameraStream = stream;
          if (video) {
            video.srcObject = stream;
          }
        })
        .catch((err) => {
          console.error("Webcam access error:", err);
        });
    }
    const videoElement = document.getElementById("userVideo");

    const faceMesh = new FaceMesh({
      locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    faceMesh.onResults(results => {
      if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        const landmarks = results.multiFaceLandmarks[0];
        getMovement(landmarks);
        detectSmile(landmarks);
        detectCameraLook(landmarks);
        detectBlink(landmarks);
      }
    });

    if (videoElement) {
      const camera = new Camera(videoElement, {
        onFrame: async () => {
          await faceMesh.send({ image: videoElement });
        },
        width: 640,
        height: 480
      });

      camera.start();
    }
  }, []);

  return (
    <>
      <Navbar heading="Interview Page" type={1} flag={1} />
      <Sidebar selectedIndex={3} />

      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#6bc1c4] to-[#105775] text-white p-4 font-montserrat">
        <div className="flex justify-center gap-20 mb-4 mt-5">
          <div className="flex flex-col items-center gap-2 m-1">
            <img
              src="https://img.freepik.com/premium-vector/man-avatar-profile-picture-isolated-background-avatar-profile-picture-man_1293239-4853.jpg"
              alt="AI Coach"
              className="w-78 h-78 mr-25 mb-4 rounded-full border-4 border-white shadow-lg transition-all hover:shadow-[0_0_20px_5px_rgba(0,51,51,0.8)]"
            />
            <span className="text-sm mt-2 mr-30">AI Coach</span>
          </div>
          <div className="flex flex-col items-center">
            <video
              id="userVideo"
              autoPlay
              muted
              playsInline
              className="w-78 h-78 ml-25 mb-4 rounded-full border-4 border-white shadow-lg transition-all hover:shadow-[0_0_20px_5px_rgba(0,51,51,0.8)] object-cover bg-black"
            ></video>
            <span className="text-sm mt-2 ml-30">You</span>
          </div>
        </div>

        <div className="w-full max-w-4xl bg-[#13547A] text-white py-5 px-6 rounded-3xl text-lg font-semibold shadow-md text-center">
          {loading ? "Initializing..." : question || "Loading..."}
        </div>

        <div className="w-full max-w-4xl bg-white rounded-3xl shadow-lg py-4 px-5 mt-6 text-gray-900">
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            id="answer"
            className="w-full p-3 border rounded-lg resize-none border-blue-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="8"
            placeholder="Type your answer here..."
          />
        </div>

        <div className="flex justify-center gap-16 mt-5">
          <button
            id="speak"
            onClick={startLiveSpeechToText}
            className={`px-6 py-2.5 rounded-2xl text-sm shadow-lg shadow-black ${isListening
              ? "bg-red-600 text-white"
              : "bg-gradient-to-r from-[#13547A] to-[#80D0C7] text-white"
              }`}
          >
            {isListening ? "🛑 Stop Voice Input" : "🎤 Start Voice Input"}
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSpeaking} // ✅ Disable if TTS is active
            className={`px-6 py-2.5 rounded-lg text-sm shadow-lg shadow-black 
              ${isSpeaking ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-[#13547A] to-[#80D0C7] text-white hover:opacity-90"}
            `}
          >
            {isSpeaking ? "🔊 Speaking..." : "Submit Answer"}
          </button>
        </div>

        <div className="mt-6">
          <button
            onClick={async () => {
              await fetchFinalScore();
              await fetchFeedback();
              setShowDialog(true);
              stopScreenRecording();
            }}
            className="text-white hover:underline text-sm"
          >
            Go to Analysis
          </button>
        </div>
        <div className="mt-4 bg-white text-black px-4 py-2 rounded shadow flex gap-10 items-center text-sm font-semibold">
          <div id="smile-counter">😊 Smiles: 0</div>
          <div id="unsmile-counter">😐 Unsmiles: 0</div>
          <div id="look-info">👁️ Looking Frames: 0 / 0</div>
          <div id="blink-counter">👁️ Blinks: 0</div>
        </div>

      </div>

            {showDialog && (
              <InterviewCompleteDialog
              closeDialog={async () => {
                setShowDialog(false);
              
                // 🛑 Stop camera stream
                const video = document.getElementById("userVideo");
                if (video && video.srcObject) {
                  video.srcObject.getTracks().forEach(track => track.stop());
                  video.srcObject = null;
                }

                // Stop webcam stream
                if (cameraStream) {
                  cameraStream.getTracks().forEach(track => track.stop());
                  cameraStream = null;
                }
                // 🛑 Stop and upload screen recording
                await new Promise((resolve) => {
                  if (!screenRecorder || screenRecorder.state === "inactive") return resolve();
              
                  screenRecorder.onstop = async () => {
                    try {
                      const screenBlob = new Blob(screenChunks, { type: "video/webm" });
                      const formData = new FormData();
                      formData.append("video", screenBlob, "screen_recording.webm");
              
                      const res = await fetch("https://aiinterviewer-d7c7.onrender.com/upload_video", {
                        method: "POST",
                        body: formData,
                      });
              
                      const result = await res.json();
                      if (result.success) {
                        console.log("✅ Video uploaded:", result.video_path);
                      } else {
                        console.error("❌ Upload failed:", result.error);
                      }
                    } catch (err) {
                      console.error("❌ Error uploading video:", err);
                    }
              
                    // ✅ Stop the actual display stream to hide browser's screen sharing banner
                    if (screenStream) {
                      screenStream.getTracks().forEach(track => track.stop());
                      console.log("🛑 Screen stream tracks stopped");
                    }
              
                    resolve();
                  };
              
                  screenRecorder.stop();
                });
              
                // ✅ Navigate away
                navigate("/CandidateDashboard", { replace: true });
              }}                            
                score={finalScore}
                feedback={feedback}
              />
            )}
        </>
    );
};

export default InterviewPage;
