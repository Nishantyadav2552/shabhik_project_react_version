import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar/Navbar";
import Sidebar from "../Components/Sidebar/Sidebar";
import { Pencil } from "lucide-react";

function CompanyDashboard() {
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetch("http://localhost:5000/get_company_interviews", {
            method: "GET",
            credentials: "include"
        })
            .then(res => res.json())
            .then(data => {
                if (data.interviews) {
                    setInterviews(data.interviews);
                }
            })
            .catch((err) => console.error("Failed to fetch interviews:", err))
            .finally(() => setLoading(false));
    }, []);

    const handleEdit = async (interviewId) => {
        try {
            const res = await fetch(`http://localhost:5000/load_interview_and_generate/${interviewId}`, {
                method: "GET",
                credentials: "include"
            });

            const data = await res.json();
            if (res.ok && data.success) {
                navigate("/interview"); // 👈 navigate to your full flow
            } else {
                alert(data.message || "Failed to load and generate questions.");
            }
        } catch (err) {
            console.error("Error:", err);
            alert("Server error.");
        }
    };

    const handleCreateNew = async () => {
        try {
            const res = await fetch("http://localhost:5000/create_interview", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    interview_title: "Untitled Interview", // or allow user to input it
                })
            });

            const data = await res.json();
            if (res.ok && data.success) {
                // Optionally pass ID via state or URL
                navigate("/interview");
            } else {
                alert(data.error || "Failed to create interview");
            }
        } catch (err) {
            console.error("Error creating interview:", err);
            alert("Server error.");
        }
    };

    return (
        <>
            <Navbar heading="Company Dashboard" type={1} flag={1} />
            <div className="flex h-screen bg-gradient-to-b from-[#6bc1c4] to-[#105775]">
                <Sidebar />

                <div className="flex flex-1 flex-col items-center px-10 py-10 overflow-y-auto mt-20">
                    <div className="w-full max-w-4xl">
                        <h2 className="text-3xl font-bold text-white mb-6">Interviews</h2>

                        <button
                            className="mb-6 bg-[#13547a] text-white px-6 py-3 rounded-md hover:bg-[#0f3f5c] transition"
                            onClick={handleCreateNew}
                        >
                            + Create New Interview
                        </button>

                        <div className="bg-white rounded-xl shadow-md p-6">
                            {loading ? (
                                <p className="text-gray-500">Loading interviews...</p>
                            ) : interviews.length === 0 ? (
                                <p className="text-gray-600">No interviews created yet.</p>
                            ) : (
                                <ul className="space-y-4">
                                    {interviews.map((interview) => (
                                        <li
                                            key={interview.interview_id}
                                            className="flex justify-between items-center p-4 border rounded hover:bg-gray-100 transition"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span
                                                    className="text-lg font-semibold text-[#13547a] cursor-pointer"
                                                    onClick={() => handleEdit(interview.interview_id)}
                                                >
                                                    {interview.job_title}
                                                </span>
                                                <button
                                                    onClick={() => handleEdit(interview.interview_id)}
                                                    className="text-[#13547a] hover:text-[#0f3f5c] transition"
                                                    title="Edit Interview"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                            </div>
                                            <span className="text-sm text-gray-500">
                                                ID: {interview.interview_id}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default CompanyDashboard;
