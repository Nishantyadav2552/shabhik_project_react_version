import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Interview from './interview';

export default function CreateInterview() {
    const [jobTitle, setJobTitle] = useState('');
    const [experience, setExperience] = useState('');
    const [numQuestions, setNumQuestions] = useState('');
    const [difficulty, setDifficulty] = useState('');

    const navigate = useNavigate();

    const handleGenerate = () => {
        navigate('/#qbox');
    };

    return (
        <>
            <div className="bg-[#0c4a6e] rounded-4xl shadow-2xl flex  w-400 ml-25 p-20">


                {/* Left Side - Form */}
                <div className="w-1/2 text-white pr-10 font-[Montserrat]">
                    <h2 className="text-3xl font-semibold mb-4">
                        Get <span className="text-yellow-400">Personalized</span> Questions
                    </h2>
                    <h3 className="text-xl font-medium mb-10">with AI Powered Features</h3>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm text-white mb-1">Job Title</label>
                            <input
                                type="text"
                                placeholder="e.g., Software Engineer"
                                className="w-full p-3 rounded-lg border border-gray-300 bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                value={jobTitle}
                                onChange={(e) => setJobTitle(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-white mb-1">Experience (in years)</label>
                            <input
                                type="number"
                                placeholder="e.g., 2"
                                className="w-full p-3 rounded-lg border border-gray-300 bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                value={experience}
                                onChange={(e) => setExperience(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-white mb-1">Number of Questions</label>
                            <input
                                type="number"
                                placeholder="e.g., 10"
                                className="w-full p-3 rounded-lg border border-gray-300 bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                value={numQuestions}
                                onChange={(e) => setNumQuestions(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-white mb-1">Difficulty Level</label>
                            <input
                                type="text"
                                placeholder="e.g., Medium"
                                className="w-full p-3 rounded-lg border border-gray-300 bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                value={difficulty}
                                onChange={(e) => setDifficulty(e.target.value)}
                            />
                        </div>
                        <div className="flex justify-center pt-4">
                            <button
                                onClick={() => {
                                    setShowQuestionBox(true);
                                    handleNavigateToSection('qbox');
                                }}
                                className="px-8 py-3 bg-yellow-400 hover:bg-yellow-300 text-black font-semibold rounded-lg transition"
                            >
                                Generate
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Side - Illustration */}
                <div className="w-1/2 flex items-center justify-center">
                    <img
                        src="https://www.transparentpng.com/thumb/interview/interview-wonderful-picture-images-1.png" // Replace with actual path
                        alt="Illustration"
                        className="max-h-96 object-contain"
                    />
                </div>
            </div>

        </>
    );
}
