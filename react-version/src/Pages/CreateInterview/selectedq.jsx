import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../Components/Navbar/Navbar';
import CompanySidebar from '../../Components/Sidebar/CompanySidebar';
import Interview from './interview';


function SelectedQuestionsPage() {
    const [questions, setQuestions] = useState([
        'What is the capital of France?',
        'Explain the process of photosynthesis.',
        'What is Newton’s Second Law of Motion?',
        'Describe the structure of an atom.',
        'What are the different types of rocks?',
        'What are the different types of rocks?',
        'What are the different types of rocks?',
        'What are the different types of rocks?',
        'What are the different types of rocks?',
        'What are the different types of rocks?',
        'What are the different types of rocks?',
        'What is the capital of France?',
        'Explain the process of photosynthesis.',
        'What is Newton’s Second Law of Motion?',
        'Describe the structure of an atom.',
        'Describe the structure of an atom.',
        'What are the different types of rocks?'

    ]);

    const navigate = useNavigate();

    const handleRemove = (index) => {
        setQuestions(prev => prev.filter((_, i) => i !== index));
    };

    const handleGenerate = () => {
        navigate('/companydashboard'); // Navigate to the desired route
    };
    return (
        <>
            {/* <Navbar type={1} heading="Selected Questions" flag={1} className="m-10" /> */}
            {/* <CompanySidebar selectedIndex={3} /> */}
            {/* <div className="h-screen bg-gradient-to-b from-[#6bc1c4] to-[#105775] bg-fixed flex flex-col items-center gap-10 p-6 "> */}
            <div className="bg-[#dff4f4] rounded-[30px] w-400 h-200 mt-25 ml-25 p-16 rounded-2xl items-center">

                <h2 className="text-xl font-semibold mb-4 text-[#034063]">INTERVIEW CODE:</h2>

                <div className="overflow-y-auto max-h-[600px] pr-2">
                    {questions.length === 0 ? (
                        <p className="text-[#034063]">No questions selected.</p>
                    ) : (
                        questions.map((q, i) => (
                            <div key={i} className="flex justify-between items-center text-black font-serif bg-white rounded-2xl p-3 mb-2 shadow">
                                <span>{q}</span>
                                <button onClick={() => handleRemove(i)} className="text-red-600 hover:text-red-800">
                                    <X size={20} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
                <div className="flex justify-center mt-4">
                    <button
                        onClick={handleGenerate}
                        className="bg-[#034063] text-white px-6 py-3 rounded-full text-lg shadow hover:bg-[#022b3a] transition-all duration-300"
                    >
                        Submit
                    </button>
                </div>
            </div>
            {/* </div> */}
        </>
    );

}

export default SelectedQuestionsPage;
