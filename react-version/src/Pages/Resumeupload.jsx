import React, { useState } from "react";
import Sidebar from "../Components/Sidebar/Sidebar";
import Navbar from "../Components/Navbar/Navbar";
import { useNavigate, useLocation } from "react-router-dom";

const UploadResume = () => {
    const [fileName, setFileName] = useState("No file chosen");
    const [uploading, setUploading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const query = new URLSearchParams(location.search);
    const interviewId = query.get("id");

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setFileName(file ? file.name : "No file chosen");
    };

    const handleUpload = async (e) => {
        e.preventDefault();

        const fileInput = document.getElementById("resume");
        const file = fileInput.files[0];

        if (!file) {
            alert("Please select a PDF resume to upload.");
            return;
        }

        if (!interviewId) {
            alert("Interview ID is missing in URL.");
            return;
        }

        const formData = new FormData();
        formData.append("resume", file);
        formData.append("interview_id", interviewId);
        formData.append("job_desc", "Software Development Engineer");

        try {
            setUploading(true);
            const response = await fetch("https://aiinterviewer-d7c7.onrender.com/resume_upload", {
                method: "POST",
                body: formData,
                credentials: "include"
            });

            const data = await response.json();
            setUploading(false);

            if (data.success) {
                console.log("Resume uploaded successfully. Score:", data.score);
                navigate("/interviewnext",{ replace: true });
            } else {
                alert(data.message || "Upload failed.");
            }
        } catch (err) {
            console.error("Upload error:", err);
            setUploading(false);
            alert("Something went wrong during upload.");
        }
    };

    return (
        <>
            <Navbar heading="Upload Resume" type={1} flag={1} />
            <div className="flex h-screen bg-gradient-to-b from-[#6bc1c4] to-[#105775] bg-fixed">
                <Sidebar selectedIndex={2} />

                <div className="flex flex-1 items-center justify-center px-4 py-10">
                    <div className="bg-white p-14 rounded-4xl shadow-2xl text-center w-full max-w-3xl ">
                        <h2 className="mb-12 text-2xl font-bold font-[Montserrat] text-[#13547a]">
                            Upload Your Resume
                        </h2>

                        <form onSubmit={handleUpload}>
                            <div className="file-upload w-full">
                                <input
                                    type="file"
                                    name="resume"
                                    id="resume"
                                    accept=".pdf"
                                    className="hidden"
                                    onChange={handleFileChange}
                                    required
                                />

                                <label
                                    htmlFor="resume"
                                    className="w-full flex flex-col items-center justify-center border-2 border-dashed border-[#13547a] p-10 rounded-xl cursor-pointer transition duration-300 hover:bg-blue-100 text-gray-700 text-lg"
                                >
                                    <p className="text-center">
                                        Drag & drop your PDF resume here<br />
                                        <strong>or click to select</strong>
                                    </p>
                                </label>

                                <div className="mt-4 text-base text-gray-700 text-center">{fileName}</div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 bg-[#13547a] text-white rounded-xl font-semibold mt-6 text-lg transition duration-300 hover:bg-[#0f3f5c]"
                                disabled={uploading}
                            >
                                {uploading ? "Uploading..." : "Upload & Proceed"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default UploadResume;
