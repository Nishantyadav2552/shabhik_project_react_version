import React from 'react';

const AIPortal = () => {
    return (
        <section className=" text-black py-16 px-6 font-[Montserrat]">
            <div className="max-w-5xl mx-auto">
                <h3 className="text-4xl font-bold mb-8 text-white">
                    AI-Powered Interview Preparation and Testing Portal
                </h3>

                <p className="mb-5 text-lg leading-relaxed">
                    Welcome to our cutting-edge AI-powered interview preparation and testing platform, designed to bridge the gap between aspiring candidates and top-tier companies. Whether you're preparing for your first job or hiring top talent, our system offers a complete, intelligent solution.
                </p>

                <p className="mb-5 text-lg leading-relaxed">
                    Leveraging state-of-the-art AI, the platform provides real-time insights and intelligent assessments to help candidates sharpen their skills while giving employers a reliable tool for streamlined evaluation.
                </p>

                <h4 className="text-2xl font-semibold mb-4 text-white">Key Features & Benefits</h4>

                <ul className="list-disc list-inside space-y-4 text-base mb-8 text-black">
                    <li>
                        <strong >AI-Driven Interview Simulations:</strong> Real-world interview scenarios with dynamic questions based on your domain and performance.
                    </li>
                    <li>
                        <strong>Smart Resume Analyzer:</strong> AI-powered resume feedback with improvement suggestions for maximum impact.
                    </li>
                    <li>
                        <strong>Personalized Performance Feedback:</strong> Insights into communication, technical knowledge, confidence, and problem-solving.
                    </li>
                    <li>
                        <strong>Automated Scoring System:</strong> Objective response evaluations based on clarity, depth, and relevance.
                    </li>
                    <li>
                        <strong>Industry-Specific Question Bank:</strong> Practice with a vast library of domain-targeted questions (IT, Finance, Marketing, etc.).
                    </li>
                    <li>
                        <strong>Real-Time AI Coaching:</strong> Get instant feedback and suggestions to refine your interview skills on the spot.
                    </li>
                    <li>
                        <strong>Mock Interviews with AI & Experts:</strong> Choose between AI-led or expert-led interview simulations.
                    </li>
                </ul>

                <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-md text-blue-900 text-lg italic font-medium mb-10 leading-relaxed shadow-sm">
                    "Our AI-powered portal is designed to not only prepare candidates for interviews but also to revolutionize how companies identify top talent with accuracy and efficiency."
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10 text-sm text-gray-600">
                    <div>
                        <img
                            src="https://www.simplilearn.com/ice9/free_resources_article_thumb/Project_Management_Interview_Questions_and_Answers.jpg"
                            className="rounded-lg shadow-md mb-2 h-70"
                        />
                    </div>
                    <div>
                        <img
                            src="https://www.sefe-mt.com//wp-content/uploads/2020/05/iStock-1051777382.jpg"
                            className="rounded-lg shadow-md mb-2 h-70 ml-20"
                        />
                    </div>

                </div>

                <p className="mb-5 text-lg leading-relaxed">
                    Ideal for job seekers aiming to gain a competitive edge, our AI portal helps candidates build confidence and readiness through interactive and adaptive tools.
                </p>

                <p className="mb-5 text-lg leading-relaxed">
                    For companies, our solution streamlines hiring by automating screenings and delivering data-driven insights to select top-performing candidates quickly and efficiently.
                </p>

                <p className="text-lg leading-relaxed">
                    Start your journey toward smarter interviews — whether you're seeking your dream job or finding the perfect hire. Experience the future of interviews, today.
                </p>
            </div>
        </section>
    );
};

export default AIPortal;
