import React, { useEffect, useState } from 'react';
import Navbar from '../Components/Navbar/Navbar';
import CompanySidebar from '../Components/Sidebar/CompanySidebar';

export default function Addqs() {
    const [generatedQuestions, setGeneratedQuestions] = useState([]);
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [checkedIndexes, setCheckedIndexes] = useState([]);
    const [customQuestion, setCustomQuestion] = useState("");
    const [searchParams] = useSearchParams();
    const interviewId = searchParams.get("id");


    // ✅ Load both generated (session) + existing (DB) questions
    useEffect(() => {
        fetchGeneratedQuestions();
        fetchExistingQuestions();
    }, []);

    const fetchGeneratedQuestions = async () => {
        const res = await fetch("https://aiinterviewer-d7c7.onrender.com/load_interview/temp", {
            method: "GET",
            credentials: "include"
        });
        const data = await res.json();
        if (data.success && data.generated_questions) {
            setGeneratedQuestions(data.generated_questions);
        }
    };

    const fetchExistingQuestions = async () => {
        const res = await fetch("https://aiinterviewer-d7c7.onrender.com/get_existing_questions", {
            method: "GET",
            credentials: "include"
        });
        const data = await res.json();
        if (data.questions) {
            setSelectedQuestions(data.questions);
        }
    };

    const toggleCheckbox = (index) => {
        setCheckedIndexes(prev =>
            prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index]
        );
    };

    const handleAddSelected = async () => {
        const toAdd = checkedIndexes.map(index => generatedQuestions[index]);
        const filtered = toAdd.filter(q => !selectedQuestions.includes(q));
        const updated = [...selectedQuestions, ...filtered];

        // Push each to backend
        for (const question of filtered) {
            await saveQuestionToBackend(question);
        }

        setSelectedQuestions(updated);
        setCheckedIndexes([]);
    };

    const handleAddCustom = async () => {
        const q = customQuestion.trim();
        if (!q || selectedQuestions.includes(q)) return;
        const updated = [...selectedQuestions, q];

        await saveQuestionToBackend(q);
        setSelectedQuestions(updated);
        setCustomQuestion("");
    };

    const saveQuestionToBackend = async (question) => {
        try {
            const res = await fetch("https://aiinterviewer-d7c7.onrender.com/save_question", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ question })
            });
            const data = await res.json();
            if (!data.success) {
                console.warn("Couldn't save question:", data.error);
            }
        } catch (err) {
            console.error("Error saving question:", err);
        }
    };

    const handleRemoveSelected = (index) => {
        const updated = [...selectedQuestions];
        updated.splice(index, 1);
        setSelectedQuestions(updated);
        // Optional: call backend to remove it too
    };

    const handleSelectAll = () => {
        const allIndexes = generatedQuestions.map((_, index) => index);
        setCheckedIndexes(allIndexes);
    };

    return (
        <>
            <Navbar heading="Add Questions" type={1} flag={1} />
            <div className="min-h-screen bg-gradient-to-b from-[#6bc1c4] to-[#105775] bg-fixed relative flex items-center justify-center p-6">
                <CompanySidebar selectedIndex={2} />
                <div className="absolute inset-0z-0"></div>
                <div className="relative z-10 bg-[#0c4a6e] text-white p-6 rounded-3xl shadow-lg w-full max-w-6xl flex flex-col gap-4">
                    <div className="bg-gray-100 text-black rounded-2xl p-6 overflow-y-auto max-h-[60vh] flex-1">
                        <ul className="space-y-4 text-base">
                            {generatedQuestions.map((question, index) => (
                                <li key={index} className="flex items-center space-x-3 border border-gray-300 rounded-lg p-3 bg-white shadow-sm">
                                    <input
                                        type="checkbox"
                                        checked={checkedIndexes.includes(index)}
                                        onChange={() => toggleCheckbox(index)}
                                    />
                                    <span>{index + 1}. {question}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="flex justify-between px-6 space-x-2 mt-6">
                        <button
                            onClick={handleSelectAll}
                            className="bg-[#003f6b] px-4 py-2 rounded-md shadow-md hover:bg-[#005a8c]"
                        >Select All</button>

                        <div className="flex space-x-2">
                            <input
                                type="text"
                                placeholder="Add custom question"
                                value={customQuestion}
                                onChange={(e) => setCustomQuestion(e.target.value)}
                                className="text-black px-3 py-2 rounded-md w-64"
                            />
                            <button
                                onClick={handleAddCustom}
                                className="bg-[#003f6b] px-4 py-2 rounded-md shadow-md hover:bg-[#005a8c]"
                            >Add</button>
                        </div>

                        <button
                            onClick={handleAddSelected}
                            className="bg-[#003f6b] px-4 py-2 rounded-md shadow-md hover:bg-[#005a8c]"
                        >Add Selected</button>
                    </div>
                </div>

                {/* SELECTED QUESTIONS */}
                <div className="bg-[#0c4a6e] p-6 rounded-3xl shadow-lg w-full max-w-5xl">
                    <h3 className="text-xl font-semibold mb-4">Selected Questions</h3>
                    <div className="bg-gray-100 text-black rounded-2xl p-6 overflow-y-auto max-h-[50vh]">
                        {selectedQuestions.length === 0 ? (
                            <p className="text-center text-gray-600">No questions selected yet.</p>
                        ) : (
                            <ul className="space-y-4 text-base">
                                {selectedQuestions.map((question, index) => (
                                    <li key={index} className="flex justify-between items-center border border-gray-300 rounded-lg p-3 bg-white shadow-sm">
                                        <span>{index + 1}. {question}</span>
                                        <button
                                            className="text-red-600 hover:text-red-800 font-bold text-xl"
                                            onClick={() => handleRemoveSelected(index)}
                                        >
                                            ×
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
