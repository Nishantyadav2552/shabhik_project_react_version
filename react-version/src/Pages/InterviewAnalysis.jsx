import React from "react";
import { ArrowLeft } from "lucide-react";
import Navbar from "../Components/Navbar/Navbar";
import Sidebar from "../Components/Sidebar/Sidebar";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const InterviewAnalysis = ({ scores }) => {
    // Fallback test data if scores is undefined or empty
    const sampleScores = [
        { label: "Confidence", value: 50, description: "Great confidence level" },
        { label: "Clarity", value: 50, description: "Clear communication" },
        { label: "Body Language", value: 65, description: "Good posture" },
        { label: "Technical", value: 9, description: "Strong technical answers" },
    ];

    const validScores = Array.isArray(scores) && scores.length > 0 ? scores : sampleScores;

    return (
        <div className="flex min-h-screen bg-gradient-to-b from-[#6bc1c4] to-[#105775]">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Navbar type={1} flag={1} heading="Interview Analysis" />
                <div className="flex justify-end p-4">
                    <button className="bg-[#004d66] text-white px-4 py-2 rounded hover:bg-[#006d8e]">
                        Logout
                    </button>
                </div>

                {/* Scores Section */}
                <div className="bg-[#003c5c] mx-auto rounded-xl p-8 shadow-lg text-white max-w-6xl w-full mt-4">
                    <h3 className="text-2xl font-semibold text-center mb-6">Scores</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                        {validScores.map((score, index) => (
                            <div
                                key={index}
                                className="bg-white text-black rounded-lg flex flex-col items-center justify-center p-4 shadow-md"
                            >
                                <p className="font-bold mb-2">{score.label}</p>
                                <div className="w-24 h-24">
                                    <CircularProgressbar
                                        value={score.value}
                                        text={`${score.value}%`}
                                        styles={buildStyles({
                                            textColor: '#000',
                                            pathColor: '#147a6d',
                                            trailColor: '#d6d6d6',
                                        })}
                                    />
                                </div>
                                <p className="mt-2 text-sm text-center">{score.description}</p>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-6">
                        <button className="bg-[#147a6d] text-white px-4 py-2 rounded-2xl shadow-md hover:bg-[#00a3ba]">
                            Get Detailed Feedback
                        </button>
                    </div>
                </div>

                {/* Previous Responses Section */}
                <div className="bg-[#003c5c] mx-auto rounded-xl p-6 shadow-lg text-white max-w-6xl w-full mt-10">
                    <h3 className="text-2xl font-semibold text-center mb-4">
                        Your Previous Responses
                    </h3>
                    <div className="space-y-4">
                        <div className="bg-white text-black rounded-xl p-4 shadow">
                            <p><span className="font-semibold">Q:</span> Tell me about yourself.</p>
                            <p><span className="font-semibold">A:</span> I'm a passionate software developer with strong problem-solving skills and experience in web development.</p>
                        </div>
                        <div className="bg-white text-black rounded-xl p-4 shadow">
                            <p><span className="font-semibold">Q:</span> What are your strengths?</p>
                            <p><span className="font-semibold">A:</span> I am very detail-oriented and always ensure I understand requirements deeply before implementation.</p>
                        </div>
                        <div className="bg-white text-black rounded-xl p-4 shadow">
                            <p><span className="font-semibold">Q:</span> How do you handle pressure?</p>
                            <p><span className="font-semibold">A:</span> I stay calm and break tasks into smaller parts to manage time and focus better.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InterviewAnalysis;
