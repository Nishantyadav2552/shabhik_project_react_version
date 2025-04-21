import React, { useRef, useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Navbar from '../../Components/Navbar/Navbar';
import CompanySidebar from '../../Components/Sidebar/CompanySidebar';

export default function Interview() {
    const [jobTitle, setJobTitle] = useState('');
    const [experience, setExperience] = useState('');
    const [numQuestions, setNumQuestions] = useState('');
    const [difficulty, setDifficulty] = useState('');

    const [generatedQuestions, setGeneratedQuestions] = useState([]);

    const [selectedIndexes, setSelectedIndexes] = useState([]);
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [allSelected, setAllSelected] = useState(false);

    const handleToggleSelectAll = () => {
        if (allSelected) {
            // Deselect all
            setSelectedIndexes([]);
        } else {
            // Select all indexes
            const allIndexes = generatedQuestions.map((_, i) => i);
            setSelectedIndexes(allIndexes);
        }
        setAllSelected(!allSelected);
    };

    const qboxRef = useRef(null);
    const selectedRef = useRef(null);

    const scrollTo = (ref) => {
        if (ref?.current) {
            ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    useEffect(() => {
        const fetchInterviewData = async () => {
            try {
                const res = await fetch("https://aiinterviewer-d7c7.onrender.com/get_current_interview_data", {
                    method: "GET",
                    credentials: "include"
                });

                const data = await res.json();
                if (res.ok && data.success) {
                    setJobTitle(data.job_title || "");
                    setExperience(data.experience || "");
                    setDifficulty(data.difficulty || "");
                    setNumQuestions(data.num_questions || "");

                    if (Array.isArray(data.questions) && data.questions.length > 0) {
                        setSelectedQuestions(data.questions); // setQuestions should match your variable
                    }
                }
            } catch (err) {
                console.error("Failed to load interview data:", err);
            }
        };

        fetchInterviewData();
    }, []);

    const handleSaveQuestions = async () => {
        try {
            const response = await fetch("https://aiinterviewer-d7c7.onrender.com/save_selected_questions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    questions: selectedQuestions
                })
            });

            const data = await response.json();
            if (response.ok && data.success) {
                alert("Selected questions saved to database!");
            } else {
                alert(data.error || "Failed to save questions.");
            }
        } catch (err) {
            console.error("Save error:", err);
            alert("Server error.");
        }
    };

    const handleAddSelected = () => {
        const newQuestions = selectedIndexes.map((i) => generatedQuestions[i]);
        setSelectedQuestions((prev) => [...prev, ...newQuestions]);
        setSelectedIndexes([]);
        scrollTo(selectedRef);
    };

    const handleRemove = (index) => {
        setSelectedQuestions(prev => prev.filter((_, i) => i !== index));
    };

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchGeneratedQuestions = async () => {
        if (!jobTitle || !difficulty || !numQuestions) {
            setError("Please fill all fields before generating.");
            return;
        }

        setLoading(true);
        setError("");
        try {
            const response = await fetch("https://aiinterviewer-d7c7.onrender.com/generate_questions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include", // Required for session-based auth
                body: JSON.stringify({
                    job_title: jobTitle,
                    difficulty: difficulty,
                    min_exp: experience,
                    num_questions: numQuestions
                })
            });

            const data = await response.json();
            if (response.ok) {
                setGeneratedQuestions(data.questions || []);
                scrollTo(qboxRef);
            } else {
                setError(data.error || "Failed to generate questions.");
            }
        } catch (err) {
            console.error(err);
            setError("Server error. Please try again.");
        } finally {
            setLoading(false);
        }
    };
    return (
        <>
            <CompanySidebar selectedIndex={0} />
            <div className="min-h-screen w-full bg-gradient-to-b from-[#6bc1c4] to-[#105775] bg-fixed text-white overflow-x-hidden">
                <Navbar heading="Create Interview" flag={1} type={1} />
                <div className="flex flex-col gap-4 md:gap-5 lg:gap-6 py-10 px-6">

                    {/* ---------- Step 1: Job Details Form ---------- */}
                    <section className="flex justify-center items-center py-6">
                        <div className="bg-[#0c4a6e] rounded-4xl shadow-2xl flex w-400 ml-25 p-20">
                            <div className="w-1/2 text-white pr-10 font-[Montserrat]">
                                <h2 className="text-3xl font-semibold mb-4">
                                    Get <span className="text-yellow-400">Personalized</span> Questions
                                </h2>
                                <h3 className="text-xl font-medium mb-10">with AI Powered Features</h3>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm mb-1">Job Title</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., Software Engineer"
                                            className="w-full p-3 rounded-lg bg-white text-black"
                                            value={jobTitle}
                                            onChange={(e) => setJobTitle(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm mb-1">Experience (years)</label>
                                        <input
                                            type="number"
                                            placeholder="e.g., 2"
                                            className="w-full p-3 rounded-lg bg-white text-black"
                                            value={experience}
                                            onChange={(e) => setExperience(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm mb-1">Number of Questions</label>
                                        <input
                                            type="number"
                                            placeholder="e.g., 5"
                                            className="w-full p-3 rounded-lg bg-white text-black"
                                            value={numQuestions}
                                            onChange={(e) => setNumQuestions(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm mb-1">Difficulty Level</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., Medium"
                                            className="w-full p-3 rounded-lg bg-white text-black"
                                            value={difficulty}
                                            onChange={(e) => setDifficulty(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex justify-center pt-4">
                                        <button
                                            onClick={fetchGeneratedQuestions}
                                            className="px-8 py-3 bg-yellow-400 hover:bg-yellow-300 text-black font-semibold rounded-lg"
                                        >
                                            Generate
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="w-1/2 flex items-center justify-center">
                                <img
                                    src="https://www.transparentpng.com/thumb/interview/interview-wonderful-picture-images-1.png"
                                    alt="Illustration"
                                    className="max-h-96 object-contain"
                                />
                            </div>
                        </div>
                    </section>

                    {/* ---------- Step 2: Generated Questions ---------- */}
                    <section ref={qboxRef} className="flex justify-center items-center py-6">
                        <div className="w-450 ml-25 p-20">
                            <div className="bg-[#dff4f4] border-[10px] border-[#0c4a6e] rounded-[20px] h-[700px] flex flex-col justify-between p-12 shadow-2xl overflow-y-auto">
                                <h2 className="text-xl font-semibold mb-6 text-[#034063]">Generated Questions</h2>
                                {generatedQuestions.map((q, i) => (
                                    <div key={i} className="flex items-center bg-white rounded-2xl p-3 mb-2 shadow">
                                        <input
                                            type="checkbox"
                                            className="mr-4 w-4 h-4"
                                            checked={selectedIndexes.includes(i)}
                                            onChange={() => {
                                                setSelectedIndexes(prev =>
                                                    prev.includes(i)
                                                        ? prev.filter(index => index !== i)
                                                        : [...prev, i]
                                                );
                                            }}
                                        />
                                        <span className="text-black">{q}</span>
                                    </div>
                                ))}
                                <div className="flex justify-end gap-4 mt-4">
                                    <button
                                        onClick={handleToggleSelectAll}
                                        className="bg-[#034063] text-white px-8 py-3 rounded-lg shadow hover:bg-[#022b3a]"
                                    >
                                        {allSelected ? "Deselect All" : "Select All"}
                                    </button>
                                    <button
                                        onClick={handleAddSelected}
                                        className="bg-[#034063] text-white px-8 py-3 rounded-lg shadow hover:bg-[#022b3a]"
                                    >
                                        Add Selected
                                    </button>
                                </div>

                            </div>
                        </div>
                    </section>

                    {/* ---------- Step 3: Selected Questions ---------- */}
                    <section ref={selectedRef} className="flex justify-center items-center py-6">
                        <div className="w-450 ml-25 p-20">
                            <div className="bg-[#dff4f4] border-[10px] border-[#034063] rounded-[30px] h-[700px] flex flex-col justify-between p-12 shadow-2xl overflow-y-auto">
                                <h2 className="text-xl font-semibold mb-6 text-[#034063]">Selected Questions</h2>
                                {selectedQuestions.length === 0 ? (
                                    <p className="text-[#034063]">No questions selected.</p>
                                ) : (
                                    selectedQuestions.map((q, i) => (
                                        <div key={i} className="flex justify-between items-center bg-white rounded-2xl p-3 mb-2 shadow">
                                            <span className="text-black">{q}</span>
                                            <button onClick={() => handleRemove(i)} className="text-red-600 hover:text-red-800">
                                                <X size={20} />
                                            </button>
                                        </div>
                                    ))
                                )}
                                <div className="flex justify-center gap-6 mt-4">
                                    <button
                                        onClick={handleSaveQuestions}
                                        className="bg-green-600 text-white px-6 py-3 rounded-full text-lg shadow hover:bg-green-700 transition-all duration-300"
                                    >
                                        Save selected
                                    </button>
                                    <button
                                        onClick={() => window.location.href = '/companydashboard'}
                                        className="bg-[#034063] text-white px-6 py-3 rounded-full text-lg shadow hover:bg-[#022b3a]"
                                    >
                                        Submit
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ---------- Step 2 & 3: Generated + Selected Questions ---------- */}
                    {/* <section className="flex justify-center items-start min-h-screen px-4">
                    <div className="flex flex-col lg:flex-row gap-8 w-full max-w-7xl"> */}

                    {/* Generated Questions Box */}
                    {/* <div ref={qboxRef} className="w-full lg:w-1/2 p-4">
                        <div className="bg-[#dff4f4] border-[10px] border-[#034063] rounded-[30px] h-[700px] flex flex-col justify-between p-6 shadow-2xl overflow-y-auto">
                            <h2 className="text-xl font-semibold mb-6 text-[#034063]">Generated Questions</h2>
                            {generatedQuestions.map((q, i) => (
                            <div key={i} className="flex items-center bg-white rounded-2xl p-3 mb-2 shadow">
                                <input
                                type="checkbox"
                                className="mr-4 w-4 h-4"
                                checked={selectedIndexes.includes(i)}
                                onChange={() => {
                                    setSelectedIndexes(prev =>
                                    prev.includes(i)
                                        ? prev.filter(index => index !== i)
                                        : [...prev, i]
                                    );
                                }}
                                />
                                <span className="text-black">{q}</span>
                            </div>
                            ))}
                            <div className="flex justify-end gap-4 mt-4">
                            <button
                                onClick={handleToggleSelectAll}
                                className="bg-[#034063] text-white px-8 py-3 rounded-lg shadow hover:bg-[#022b3a]"
                            >
                                {allSelected ? "Deselect All" : "Select All"}
                            </button>
                            <button
                                onClick={handleAddSelected}
                                className="bg-[#034063] text-white px-8 py-3 rounded-lg shadow hover:bg-[#022b3a]"
                            >
                                Add Selected
                            </button>
                            </div>
                        </div>
                        </div> */}

                    {/* Selected Questions Box */}
                    {/* <div ref={selectedRef} className="w-full lg:w-1/2 p-4">
                        <div className="bg-[#dff4f4] border-[10px] border-[#034063] rounded-[30px] h-[700px] flex flex-col justify-between p-6 shadow-2xl overflow-y-auto">
                            <h2 className="text-xl font-semibold mb-6 text-[#034063]">Selected Questions</h2>
                            {selectedQuestions.length === 0 ? (
                            <p className="text-[#034063]">No questions selected.</p>
                            ) : (
                            selectedQuestions.map((q, i) => (
                                <div key={i} className="flex justify-between items-center bg-white rounded-2xl p-3 mb-2 shadow">
                                <span className="text-black">{q}</span>
                                <button
                                    onClick={() => handleRemove(i)}
                                    className="text-red-600 hover:text-red-800"
                                >
                                    <X size={20} />
                                </button>
                                </div>
                            ))
                            )}
                            <div className="flex justify-center gap-6 mt-4">
                            <button
                                onClick={handleSaveQuestions}
                                className="bg-green-600 text-white px-6 py-3 rounded-full text-lg shadow hover:bg-green-700 transition-all duration-300"
                            >
                                Save selected
                            </button>
                            <button
                                onClick={() => window.location.href = '/companydashboard'}
                                className="bg-[#034063] text-white px-6 py-3 rounded-full text-lg shadow hover:bg-[#022b3a]"
                            >
                                Submit
                            </button>
                            </div>
                        </div>
                        </div>

                    </div>
                    </section> */}

                </div>
            </div>
        </>
    );
}
