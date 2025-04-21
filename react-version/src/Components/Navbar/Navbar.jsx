import React, { useState } from "react";
import { Menu, X } from "lucide-react";

function Navbar({ heading, flag, type }) {
    const [isOpen, setIsOpen] = useState(false);

    const navbarClasses = `
    ${type === 1
            ? "bg-[#6EC6C9] border-b border-white/30"
            : "bg-[#0B1224]/90 backdrop-blur-md shadow-md"
        } 
    fixed top-0 left-0 w-full z-50 font-[Montserrat]
`;

    return (
        <nav className={navbarClasses}>
            <div className="max-w-2xl ml-25 pr-2 py-2 flex items-center justify-between">

                {/* Left Side: Logo */}
                <div className="flex items-center space-x-10 text-white">
                    <a
                        href="/home"
                        className={`text-4xl font-bold tracking-wide z-10 ml-0 mr-0 pl-0 ${type === 1 ? "text-black" : "text-white"}`}
                    >
                        SieveAI
                    </a>

                </div>

                {/* Center Heading */}
                <div className="absolute left-1/2 transform -translate-x-1/2 text-white text-xl font-semibold hidden lg:block">
                    {heading}
                </div>

                {/* Right Side: Conditional Render */}
                <div className="ml-10 items-left">
                    {flag === 1 ? (
                        <div className="absolute top-2 right-4">
                            <button
                                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                                onClick={() => (window.location.href = "/logout")}
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        type === 1 && (
                            <ul className="flex items-center space-x-8 text-white text-sm font-semibold tracking-wide ml-1">
                                <li><a href="#top" className="hover:text-gray-300">HOME</a></li>
                                <li><a href="#section_3" className="hover:text-gray-300">HOW IT WORKS</a></li>
                                <li><a href="#section_4" className="hover:text-gray-300">FAQS</a></li>
                                <li><a href="#section_5" className="hover:text-gray-300">CONTACT</a></li>
                                <li><a href="#topics-detail" className="hover:text-gray-300">ABOUT</a></li>
                            </ul>
                        )
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
