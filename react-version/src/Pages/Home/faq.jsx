import React, { useState } from 'react';

const faqData = [
    {
        question: 'What is AI-Powered Interview Portal?',
        answer:
            'AI-Powered Interview Portal is a platform that uses AI technology to conduct interviews and provide detailed feedback to help recruiters shortlist candidates efficiently.',
    },
    {
        question: 'How does the AI interview work?',
        answer:
            'The AI interview assesses the candidate’s responses in real-time, providing a score based on various parameters such as communication skills, technical knowledge, and problem-solving abilities.',
    },
    {
        question: 'What kind of feedback does the dashboard provide?',
        answer:
            'The dashboard provides detailed feedback on the candidate’s resume, including scores for different sections, suggestions for improvement, and an overall evaluation.',
    },
    {
        question: 'Is the AI interview process secure?',
        answer:
            'Yes, the AI interview process is secure and ensures the privacy and confidentiality of the candidate’s data.',
    },
];

const FaqSection = () => {
    const [activeIndex, setActiveIndex] = useState(null);

    const toggle = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <section
            id="section_4"
            className="font-[Montserrat] py-20 text-gray-800"
        >
            <div className="max-w-7xl mx-auto px-4 lg:px-8">
                <h2 className="text-4xl font-bold  ml-80  mb-8 leading-snug text-black">
                    Frequently Asked Questions
                </h2>
                <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-10">
                    {/* Left Heading and Image */}
                    {/* <div className="w-full lg:w-1/2">

                        <img
                            src="https://static.vecteezy.com/system/resources/thumbnails/053/225/704/small/faq-banner-with-question-marks-in-speech-bubbles-showing-frequently-asked-questions-concept-png.png"
                            alt="FAQs"
                            className="w-auto h-auto rounded-xl   ml-25 hidden lg:block"
                        />
                    </div> */}

                    {/* Right Accordion */}
                    <div className="w-full lg:w-1/2 items-center">
                        <div className="space-y-4 ">
                            {faqData.map((item, index) => (
                                <div
                                    key={index}
                                    className={`border rounded-xl shadow-sm transition-all duration-300 ${activeIndex === index ? 'bg-[#f0faff]' : 'bg-white'
                                        }`}
                                >
                                    <button
                                        onClick={() => toggle(index)}
                                        className="w-full flex justify-between items-center px-6 py-4 text-left text-lg font-semibold focus:outline-none"
                                    >
                                        <span className="text-[#1D6A8C]">
                                            {item.question}
                                        </span>
                                        <span className="text-[#1D6A8C] text-2xl leading-none">
                                            {activeIndex === index ? '-' : '+'}
                                        </span>
                                    </button>
                                    {activeIndex === index && (
                                        <div className="px-6 pb-5 text-sm text-gray-600">
                                            {item.answer}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FaqSection;
