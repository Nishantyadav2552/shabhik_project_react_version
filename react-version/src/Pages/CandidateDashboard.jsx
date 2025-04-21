import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Components/Navbar/Navbar';
import Sidebar from '../Components/Sidebar/Sidebar';
import { Percent } from 'lucide-react';

export default function CandidateDashboard() {
    const [interviewId, setInterviewId] = useState('');
    const [showDialog, setShowDialog] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const [resumeScore, setResumeScore] = useState(0);
    const [interviews, setInterviews] = useState([]);
    const [averageScore, setAverageScore] = useState(0);
    const [totalInterviews, setTotalInterviews] = useState(0);

    const [selectedInterviewId, setSelectedInterviewId] = useState(null);
    const [interviewLogs, setInterviewLogs] = useState([]);
    const [feedback, setFeedback] = useState("");
    const [finalScore, setFinalScore] = useState(null);
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);

    const [availableInterviews, setAvailableInterviews] = useState([]);
    
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await fetch("https://aiinterviewer-d7c7.onrender.com/candidate_dashboard_logs", {
                    method: "GET",
                    credentials: "include"
                });
                const data = await res.json();
    
                if (data.success) {
                    setInterviews(data.interviews);
                    setResumeScore(data.resume_score);
                    setAverageScore(data.average_score);
                    setTotalInterviews(data.total_interviews);
                } else {
                    console.error("Failed to fetch dashboard logs.");
                }
            } catch (err) {
                console.error("Error fetching dashboard:", err);
            }
        };

        // inside useEffect:
        const fetchCandidateName = async () => {
            try {
                const res = await fetch("https://aiinterviewer-d7c7.onrender.com/get_candidate_name", {
                    method: "GET",
                    credentials: "include",
                });
                const data = await res.json();
                if (data.success) {
                    setCandidateName(data.username);
                }
            } catch (err) {
                console.error("Error fetching candidate name:", err);
            }
        };

        const fetchAvailableInterviews = async () => {
            try {
                const res = await fetch("https://aiinterviewer-d7c7.onrender.com/get_all_interviews", {
                    method: "GET",
                    credentials: "include"
                });
                const data = await res.json();
                if (data.success) {
                    setAvailableInterviews(data.interviews);
                }
            } catch (err) {
                console.error("Error fetching available interviews:", err);
            }
        };

        const init = async () => {
            await fetchCandidateName();
            await fetchDashboardData();
            await fetchAvailableInterviews();
        };
        init();

    }, []);    

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const res = await fetch("https://aiinterviewer-d7c7.onrender.com/candidate_dashboard", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ interview_id: interviewId })
        });
        const data = await res.json();
        if (data.success) {
            navigate(`/uploadresume?id=${interviewId}`);
        } else {
            setError(data.message || "Invalid Interview ID");
        }
    };

    const [candidateName, setCandidateName] = useState("");

    const handleInterviewClick = async (item) => {
        setSelectedInterviewId(item.interview_id);
        setShowDetailsDialog(true);
    
        try {
            // Fetch Q&A logs
            const logsRes = await fetch("https://aiinterviewer-d7c7.onrender.com/get_feedback", {
                method: "GET",
                credentials: "include"
            });
            const logsData = await logsRes.json();
    
            if (logsData.feedback) {
                setFeedback(logsData.feedback);
            }
    
            const logs = logsData.logs || [];
            setInterviewLogs(logs);
    
            // Fetch final score
            const scoreRes = await fetch("https://aiinterviewer-d7c7.onrender.com/evaluate_response", {
                method: "GET",
                credentials: "include"
            });

            const scoreData = await scoreRes.json();
            setFinalScore(scoreData.final_score ?? "N/A");
    
        } catch (err) {
            console.error("Error fetching interview details:", err);
        }
    };    

    const handleInterviewSelect = async (interview_id) => {
        setError('');
        const res = await fetch("https://aiinterviewer-d7c7.onrender.com/candidate_dashboard", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ interview_id })
        });
        const data = await res.json();
        if (data.success) {
            navigate(`/uploadresume?id=${interview_id}`);
        } else {
            setError(data.message || "Invalid Interview ID");
        }
    };    

    return (
        <>
            <Navbar heading="Candidate Dashboard" type={1} flag={1} />
            <div className="flex min-h-screen bg-gradient-to-b from-[#6bc1c4] to-[#105775] text-white mt-12">
                <Sidebar />
                <div className="flex-1 p-4 md:p-6 ml-20">
                    {/* Profile and Button Section */}
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 max-w-[calc(100%-320px)] mx-auto">
                        <div className="flex items-center gap-4 mb-4 md:mb-0">
                            <img
                                src={`https://ui-avatars.com/api/?name=${candidateName}&background=13547a&color=ffffff&rounded=true`}
                                alt="User Avatar"
                                className="w-16 h-16"
                            />
                            <p className="text-2xl font-semibold text-white">{candidateName}</p>
                        </div>
                        <button
                            onClick={() => setShowDialog(true)}
                            className="bg-yellow-400 text-black font-semibold px-6 py-2 rounded-full shadow-md hover:scale-105 transition-transform"
                        >
                            Give Interview
                        </button>
                    </div>
    
                    {/* Main Layout */}
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Left Panel */}
                        <div className="flex-1 space-y-6">
                            {/* Progress */}
                            <div className="bg-white text-[#13547a] rounded-3xl shadow-lg p-6">
                                <h2 className="text-2xl font-extrabold mb-6 text-center">Your Progress</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                                    <div>
                                        <p className="uppercase text-sm text-black font-medium">No of Interviews Given</p>
                                        <p className="text-3xl font-bold mt-2">{totalInterviews}</p>
                                    </div>
                                    <div>
                                        <p className="uppercase text-sm font-medium text-black">Average Score</p>
                                        <p className="text-3xl font-bold mt-2">{averageScore}%</p>
                                    </div>
                                    <div>
                                        <p className="uppercase text-sm font-medium text-black">Total Interview Time (minutes)</p>
                                        <p className="text-3xl font-bold mt-2">{resumeScore}</p>
                                    </div>
                                </div>
                            </div>
    
                            {/* Interview History */}
                            <div className="bg-[#0d3c56] rounded-3xl p-6 shadow-lg">
                                <h3 className="text-2xl font-bold text-center mb-6">Interview History</h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-white text-sm">
                                        <thead className="bg-[#0b2e44]">
                                            <tr>
                                                <th className="p-3 text-left">Company</th>
                                                <th className="p-3 text-left">Job Title</th>
                                                <th className="p-3 text-left">Date</th>
                                                <th className="p-3 text-left">Score</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {interviews.length === 0 ? (
                                                <tr>
                                                    <td colSpan="4" className="p-4 text-center">No interviews found.</td>
                                                </tr>
                                            ) : (
                                                interviews
                                                    .filter(item =>
                                                        item.company !== "N/A" &&
                                                        item.post !== "N/A" &&
                                                        item.date !== "N/A" &&
                                                        item.score !== "N/A"
                                                    )
                                                    .map((item, index) => (
                                                        <tr
                                                            key={index}
                                                            className="border-t border-gray-600 cursor-pointer hover:bg-[#0c3248]"
                                                            onClick={() => handleInterviewClick(item)}
                                                        >
                                                            <td className="p-3">{item.company}</td>
                                                            <td className="p-3">{item.post}</td>
                                                            <td className="p-3">{item.date}</td>
                                                            <td className="p-3">{item.score}</td>
                                                        </tr>
                                                    ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
    
                        {/* Right Panel */}
                        <div className="w-full lg:w-[260px] xl:w-[280px]" >
                            <div className="bg-white text-[#13547a] rounded-3xl shadow-lg p-4 overflow-hidden">
                                <h2 className="text-xl font-extrabold mb-4 text-center">Available Interviews</h2>
                                {/* Inner scroll area with proper padding and scrollbar inside the box */}
                                <div
                                className="flex flex-col gap-4 pr-2 overflow-y-auto custom-scroll"
                                style={{ maxHeight: 'calc(100vh - 335px)' }} // Adjust height as needed
                                >
                                {availableInterviews.length === 0 ? (
                                    <p className="text-center text-gray-500">No interviews available.</p>
                                ) : (
                                    availableInterviews.map((interview, index) => (
                                    <div
                                        key={index}
                                        onClick={() => handleInterviewSelect(interview.interview_id)}
                                        className="cursor-pointer border border-blue-200 p-3 rounded-xl hover:bg-blue-50 transition"
                                    >
                                        <p className="font-semibold">
                                        {interview.company} &#123;{interview.job_title}&#125;
                                        </p>
                                        <p className="text-sm text-gray-600 mt-1">
                                        Interview ID: {interview.interview_id}
                                        </p>
                                    </div>
                                    ))
                                )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
    
            {/* Interview Code Dialog */}
            {showDialog && (
                <div className="fixed inset-0 backdrop-blur-sm bg-white/10 flex justify-center items-center z-50">
                    <div className="bg-white text-black rounded-xl shadow-2xl w-full max-w-sm p-6">
                        <h2 className="text-xl font-bold mb-4">Enter Interview Code</h2>
                        <form onSubmit={handleSubmit}>
                            <input
                                type="text"
                                value={interviewId}
                                onChange={(e) => setInterviewId(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="Interview ID"
                                required
                            />
                            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
                            <div className="flex justify-between mt-4">
                                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">Proceed</button>
                                <button onClick={() => setShowDialog(false)} type="button" className="text-gray-600 hover:text-gray-800">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );        
}


// //interview minutes
// avg score Percent resume score