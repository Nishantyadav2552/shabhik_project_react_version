import React from "react";
import { Globe } from "lucide-react";

const Footer = () => {
    return (
        <footer className=" text-sm font-[Montserrat] border-t border-t-[#8ad2cb] relative">
            <div className="max-w-screen-xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Logo */}
                <div className="flex items-start gap-2">
                    <span className="text-2xl">
                        <Globe className="text-white" />
                    </span>
                    <span className="text-white text-xl font-semibold">SieveAI</span>
                </div>

                {/* Resources */}
                <div>
                    <h4 className="text-white font-semibold mb-2">Resources</h4>
                    <ul className="space-y-1 text-[#6BC1C4]">
                        <li>Home</li>
                        <li>How it works</li>
                        <li>FAQs</li>
                        <li>Contact</li>
                    </ul>
                </div>

                {/* Info */}
                <div>
                    <h4 className="text-white font-semibold mb-2">Information</h4>
                    <p className="text-[#6BC1C4]">123-234-3456</p>
                    <p className="text-[#6BC1C4]">shabhiktechnologies@gmail.com</p>
                </div>

                {/* Language Selector + Copyright */}
                <div className="flex flex-col items-start gap-2">
                    <button className="bg-[#7EDCD8] text-white px-4 py-1 rounded text-sm">English ▾</button>
                    <p className="text-white text-xs mt-4">
                        Copyright © 2025 Shabhik Technologies.<br />All rights reserved.
                    </p>
                    <p className="text-[#6BC1C4] text-xs">Design: <span className="underline">ShabhikTech</span></p>
                </div>
            </div>

            {/* Bottom angled triangle */}
        </footer>
    );
};

export default Footer;
