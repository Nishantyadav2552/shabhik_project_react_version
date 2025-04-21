import React, { useState } from "react";
import Sidebar from "../Components/Sidebar/Sidebar";
import Navbar from "../Components/Navbar/Navbar";
import { useNavigate } from "react-router-dom";

const Interviewnext = () => {
    const [agreed, setAgreed] = useState(false);
    const [active, setActive] = useState("Home");
    const navigate = useNavigate();

    const handleSelect = (item) => {
        setActive(item);
    };

    const handleLogout = () => {
        window.location.href = "/logout";
    };

    return (
        <>
            <Navbar heading=" Online Assessment Interview Instructions" flag={1} type={1} />

            <div className="flex h-screen overflow-hidden font-[Montserrat] bg-gradient-to-b from-[#6bc1c4] to-[#105775] ">
                {/* Main Content */}
                <Sidebar selectedIndex={1} />
                <div className="flex-1 flex flex-col items-center justify-center p-6 relative">

                    <div className="bg-white rounded-xl shadow-lg p-8 max-w-3xl w-full text-left mt-20">
                        <ul className="list-disc pl-5 space-y-3 max-h-[400px] overflow-y-auto text-gray-800">
                            {[
                                "Ensure a stable internet connection throughout the interview.",
                                "Use a laptop or desktop with a working webcam and microphone.",
                                "Prefer Google Chrome or Microsoft Edge for best results.",
                                "Be seated in a well-lit and quiet environment.",
                                "Keep your government-issued photo ID ready for verification.",
                                "Close all other programs and browser tabs before beginning.",
                                "Do not refresh or close the browser window during the interview.",
                                "Follow all on-screen instructions and timers strictly.",
                                "No headphones or earphones are allowed during the interview.",
                                "Ensure your face remains visible and centered in the camera.",
                                "Use only one monitor and one browser window.",
                                "Enable popups and grant camera/mic permissions when prompted.",
                                "Do not navigate away from the test window once it starts.",
                                "Background noise or second-person voice may result in disqualification.",
                                "AI will monitor your movements, sounds, and surroundings.",
                                "Any suspicious activity will lead to auto-submission and termination.",
                                "Keep your phone away to avoid distractions and alerts.",
                                "Have at least 60 minutes of uninterrupted time before starting.",
                                "Refresh your device before the interview to clear memory cache.",
                                "If technical issues occur, report them immediately via support chat.",
                            ].map((instruction, idx) => (
                                <li key={idx} className="text-[1.1rem]">{instruction}</li>
                            ))}
                        </ul>

                        <div className="flex justify-center">
                            <label className="flex items-center text-sm text-gray-700 cursor-pointer space-x-5 m-auto mt-5">
                                <input
                                    type="checkbox"
                                    className="w-auto p-[70px] mx-1 border border-[#ddd] rounded-[8px] text-[#13547a] transition-all duration-300 bg-[#f9f9f9]"
                                    checked={agreed}
                                    onChange={(e) => setAgreed(e.target.checked)}
                                />
                                <span>I agree to the terms and conditions</span>
                            </label>
                        </div>


                        <div className="mt-6 flex justify-center">
                            <button
                                disabled={!agreed}
                                onClick={() => navigate("/interviewpage", { replace: true })}
                                className={`px-6 py-3 text-white rounded-lg font-semibold transition-colors duration-300 ${agreed ? "bg-[#13547a] hover:bg-[#0f3f5c]" : "bg-gray-400 cursor-not-allowed"
                                    }`}
                            >
                                Start Interview
                            </button>
                        </div>
                    </div>

                    <button
                        className="absolute top-3 right-3 bg-[#13547a] hover:bg-[#0f3f5c] text-white px-4 py-2 rounded-lg font-semibold"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>
            </div>
        </>
    );
};

export default Interviewnext;
