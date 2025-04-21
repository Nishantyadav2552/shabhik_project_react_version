import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../Components/Navbar/Navbar';
import CompanySidebar from '../../Components/Sidebar/CompanySidebar';
import Interview from './interview';

function QuestionBox() {
    const sampleQuestions = [
        'What is the capital of France?',
        'Explain the process of photosynthesis.',
        'What is Newton’s Second Law of Motion?',
        'Describe the structure of an atom.',
        'What are the different types of rocks?'
    ];

    const [selectedIndexes, setSelectedIndexes] = useState([]);
    const [addedQuestions, setAddedQuestions] = useState([]);
    const navigate = useNavigate();

    const handleCheckboxChange = (index) => {
        setSelectedIndexes((prev) =>
            prev.includes(index)
                ? prev.filter((i) => i !== index)
                : [...prev, index]
        );
    };

    const handleAddSelected = () => {
        const newQuestions = selectedIndexes.map((i) => sampleQuestions[i]);
        setAddedQuestions([...addedQuestions, ...newQuestions]);
        setSelectedIndexes([]);
        navigate('/selectedq');
    };

    return (
        <>
            {/* Optional: Navbar and Sidebar */}
            {/* <CompanySidebar selectedIndex={1} /> */}
            {/* <Navbar type={1} heading="Generate Questions" flag={1} className="m-10" /> */}

            <div className="w-450 ml-25 p-20">
                <div className="bg-[#dff4f4] border-[10px] border-[#034063] rounded-[30px] h-[700px] flex flex-col justify-between p-12 shadow-2xl overflow-y-auto">
                    {sampleQuestions.map((question, index) => (
                        <div key={index} className="flex items-center bg-white rounded-lg px-6 py-3 mb-4 shadow-md">
                            <input
                                type="checkbox"
                                className="mr-4 w-4 h-4"
                                checked={selectedIndexes.includes(index)}
                                onChange={() => handleCheckboxChange(index)}
                            />
                            <span className="text-lg ">{question}</span>
                        </div>
                    ))}
                    <div className="flex justify-between mt-6">
                        <button className="bg-[#034063] text-white px-8 py-3 rounded-lg shadow-lg">
                            Select All
                        </button>
                        <button className="bg-[#034063] text-white px-8 py-3 rounded-lg shadow-lg">
                            Add Custom Question
                        </button>
                        <button
                            onClick={() => {
                                setShowSelectedQuestions(true);
                                handleNavigateToSection('selected');
                            }}
                            className="bg-[#034063] text-white px-8 py-3 rounded-lg shadow-lg"
                        >
                            Add Selected
                        </button>
                    </div>
                </div>


            </div>
        </>
    );
}

export default QuestionBox;
