import React from 'react';
import { Upload, Video } from 'lucide-react';

const HowItWorks = () => {
    const steps = [
        {
            id: 1,
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>,
            title: "Select Role & Company",
            description: "The user chooses the job role and the company they want to apply for."
        },
        {
            id: 2,
            icon: <Upload size={24} />,
            title: "Upload Resume",
            description: "The user uploads their resume for evaluation and reference."
        },
        {
            id: 3,
            icon: <Video size={24} />,
            title: "Attend Online Interview",
            description: "The user participates in an AI-driven interview, which assesses their responses and provides a score."
        }
    ];

    return (
        <div className="flex min-h-screen w-full ">
            <div className="relative w-full">
                {/* Background image with overlay */}
                <div className="absolute inset-0 "></div>

                {/* Content container */}
                <div className="relative z-10 flex flex-col items-center justify-center px-4 py-16 md:px-8">
                    <h1 className="mb-16 text-4xl font-bold text-white">How does it work?</h1>

                    {/* Steps container */}
                    <div className="flex flex-col gap-6 w-full max-w-2xl">
                        {steps.map((step, index) => (
                            <div key={step.id} className="flex items-start gap-6">
                                {/* Step number with connecting line */}
                                <div className="flex flex-col items-center">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-900 text-white">

                                        {step.icon}
                                    </div>
                                    {index < steps.length - 1 && (
                                        <div className="h-24 w-0.5 bg-blue-900"></div>
                                    )}
                                </div>

                                {/* Step content */}
                                <div className="pt-3">
                                    <h3 className="text-xl font-semibold text-white">{step.title}</h3>
                                    <p className="mt-1 text-white">{step.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Learn more section */}
                    <div className="mt-12 flex items-center gap-4">
                        <p className="text-white">Want to learn more?</p>
                        <button className="rounded-full border border-white bg-transparent px-6 py-2 text-white hover:bg-white/10 transition">
                            Check out Youtube
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HowItWorks;