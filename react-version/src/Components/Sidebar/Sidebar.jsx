import React from "react";
import "bootstrap-icons/font/bootstrap-icons.css"; // Bootstrap Icons

function Sidebar({ selectedIndex = 0 }) {
    const menuItems = [
        { icon: "bi-house-door" },
        { icon: "bi-person-circle" },
        { icon: "bi-ui-checks-grid" },
        { icon: "bi-grid-3x3-gap-fill" },
        { icon: "bi-speedometer2" },
    ];

    return (
        <div className="fixed top-0 left-0 h-screen w-16 bg-gray-900 text-white flex flex-col items-center py-2 px-1 shadow-lg">
            {/* Logo */}
            <div className="mb-6 text-2xl">
                <i className="bi bi-braces"></i>
            </div>

            {/* Menu Items */}
            <div className="flex flex-col space-y-25 flex-1 mt-10">
                {menuItems.map((item, index) => (
                    <div
                        key={index}
                        className={`cursor-pointer text-xl ${selectedIndex === index
                            ? "text-cyan-400"
                            : "text-white hover:text-cyan-300"
                            }`}
                    >
                        <i className={`bi ${item.icon}`}></i>
                    </div>
                ))}
            </div>

            {/* Profile Section */}
            <div className="mb-4 flex flex-col items-center space-y-1">
                <img
                    src="https://i.pravatar.cc/40"
                    alt="User"
                    className="rounded-full w-10 h-10"
                />
                <i className="bi bi-caret-down-fill text-sm text-gray-400"></i>
            </div>
        </div>
    );
}

export default Sidebar;
