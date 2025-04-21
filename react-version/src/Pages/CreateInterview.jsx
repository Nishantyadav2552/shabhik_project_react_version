import React, { useState } from 'react';
import Navbar from '../Components/Navbar/Navbar';
import { useNavigate } from 'react-router-dom';

export default function CreateInterview() {
    const [jobTitle, setJobTitle] = useState('');
    const [experience, setExperience] = useState('');
    const [numQuestions, setNumQuestions] = useState('');
    const [difficulty, setDifficulty] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleGenerate = async () => {
        if (!jobTitle || !experience || !numQuestions || !difficulty) {
            alert("Please fill all fields.");
            return;
        }

        try {
            setLoading(true);

            // 1. Create Interview
            const formData = new FormData();
            formData.append("interview_title", jobTitle);

            const createRes = await fetch("http://localhost:5000/create_interview", {
                method: "POST",
                body: formData,
                credentials: "include"
            });

            const createData = await createRes.json();
            if (!createData.success || !createData.interview_id) {
                alert("Failed to create interview.");
                setLoading(false);
                return;
            }

            // 2. Generate Questions
            const genRes = await fetch("http://localhost:5000/generate_questions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    job_title: jobTitle,
                    difficulty,
                    min_exp: experience,
                    num_questions: numQuestions
                })
            });

            const genData = await genRes.json();
            if (!genData.questions || !Array.isArray(genData.questions)) {
                alert("Failed to generate questions.");
                setLoading(false);
                return;
            }

            // 3. Redirect to Add Questions page
            navigate("/addqs");

        } catch (error) {
            console.error("Error:", error);
            alert("Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar heading="Create Interview" type={1} flag={1} />
            <div className="min-h-screen bg-gradient-to-b from-[#6bc1c4] to-[#105775] bg-fixed relative flex items-center justify-center p-6">
                <div className="absolute inset-0 bg-black opacity-20 z-0"></div>
                <div className="bg-[#0c4a6e] text-white p-5 rounded-2xl shadow-lg w-full max-w-8xl min-h-[80vh] flex items-center mt-6 z-10">
                    <div className="ml-12 w-full">
                        <h2 className="text-3xl font-semibold mb-10">
                            Get <span className="text-yellow-300">Personalized</span> Questions<br />
                            with AI Powered Features
                        </h2>
                        <div className="max-w-md space-y-4">
                            <input
                                type="text"
                                placeholder="Enter Job Title"
                                className="w-full p-3 rounded-md text-black"
                                value={jobTitle}
                                onChange={(e) => setJobTitle(e.target.value)}
                            />
                            <input
                                type="number"
                                placeholder="Enter Experience (in years)"
                                className="w-full p-3 rounded-md text-black"
                                value={experience}
                                onChange={(e) => setExperience(e.target.value)}
                            />
                            <input
                                type="number"
                                placeholder="No. of Questions"
                                className="w-full p-3 rounded-md text-black"
                                value={numQuestions}
                                onChange={(e) => setNumQuestions(e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="Difficulty Level"
                                className="w-full p-3 rounded-md text-black"
                                value={difficulty}
                                onChange={(e) => setDifficulty(e.target.value)}
                            />
                            <button
                                onClick={handleGenerate}
                                className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-semibold py-3 rounded-md shadow"
                                disabled={loading}
                            >
                                {loading ? "Generating..." : "Generate"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
