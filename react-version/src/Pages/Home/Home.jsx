import React, { useEffect , useState} from "react";
import { Briefcase, User } from "lucide-react";
import Navbar from "../../Components/Navbar/Navbar";
import Sidebar from "../../Components/Sidebar/Sidebar";
import HowItWorks from "./Howitworks";
import AIPortal from "./about";
import FaqSection from "./faq";
import Footer from "./Footer";
import { useNavigate } from "react-router-dom";

const openDialog = (dialogId) => {
    const dialog = document.getElementById(dialogId);
    if (dialog) {
        dialog.style.display = 'flex';
        if (!dialog.hasEventListenerAttached) {
            dialog.addEventListener('click', (event) => {
                if (event.target === dialog) {
                    closeDialog(dialogId);
                }
            });
            dialog.hasEventListenerAttached = true;
        }
    }
};

const closeDialog = (dialogId) => {
    const dialog = document.getElementById(dialogId);
    if (dialog) {
        dialog.style.display = 'none';
        dialog.classList.remove('dialog-overlay');
    }
};

const dialogWrapperClasses = "dialog-overlay fixed top-0 left-0 w-full h-full bg-black/70 flex items-center justify-center z-50 hidden";
const dialogBoxClasses = "bg-white p-8 rounded-md w-full max-w-md text-black";

const RegisterDialog = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState("candidate");

    const handleRegister = async (e) => {
        e.preventDefault();
        const form = new FormData(e.target);
        const new_username = form.get("new_username");
        const new_password = form.get("new_password");
        const role = form.get("role");
        const sieve_key = form.get("sieve_key");

        const payload = { username: new_username, password: new_password, role };
        if (role === "company") payload.sieve_key = sieve_key;

        try {
            const res = await fetch("https://aiinterviewer-d7c7.onrender.com/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (data.success) {
                document.getElementById("register-dialog").style.display = "none";
                alert("Account created successfully!");
                if (role === "candidate") navigate("/candidatedashboard");
                else navigate("/companydashboard");
            } else {
                alert(data.message || "Registration failed.");
            }
        } catch (err) {
            console.error("Register error:", err);
            alert("Something went wrong!");
        }
    };

    return (
        <div id="register-dialog" className={dialogWrapperClasses}>
            <div className={dialogBoxClasses}>
                <button className="float-right text-black text-lg" onClick={() => closeDialog('register-dialog')}>
                    <span>&times;</span>
                </button>
                <h3 className="text-2xl font-semibold mb-6">Register</h3>
                <form onSubmit={handleRegister} className="space-y-5">
                    <div className="flex flex-col">
                        <label htmlFor="new_username" className="text-base">Username</label>
                        <input type="text" name="new_username" placeholder="Create a username" required className="border p-3 rounded text-base" />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="new_password" className="text-base">Password</label>
                        <input type="password" name="new_password" placeholder="Create a password" required className="border p-3 rounded text-base" />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="new_password" className="text-base"> Confirm Password</label>
                        <input type="password" id="confirmpassword" placeholder="Re-enter your password" required className="border p-3 rounded text-base" />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="role" className="text-base">Select your role</label>
                        <select name="role" onChange={(e) => setRole(e.target.value)} className="border p-3 rounded text-base">
                            <option value="candidate">Candidate</option>
                            <option value="company">Company</option>
                        </select>
                    </div>
                    {role === "company" && (
                        <div className="flex flex-col">
                            <label htmlFor="sieve_key" className="text-base">Enter Sieve Key</label>
                            <input type="text" name="sieve_key" placeholder="Company registration key" required className="border p-3 rounded text-base" />
                        </div>
                    )}
                    <button type="submit" className="bg-[#13547a] text-white py-3 px-5 text-base rounded hover:bg-[#0d3a5e]">
                        Create Account
                    </button>
                </form>
            </div>
        </div>
    );
};

const CandidateDialog = () => {
    const navigate = useNavigate();

    const handleCandidateLogin = async (e) => {
        e.preventDefault();
        const form = new FormData(e.target);
        const username = form.get("username");
        const password = form.get("password");
    
        try {
            const res = await fetch("https://aiinterviewer-d7c7.onrender.com/login_candidate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ username, password }),
            });
    
            const data = await res.json();
    
            if (data.success) {
                navigate("/candidatedashboard",{ replace: true });
            } else {
                alert(data.message || "Login failed.");
            }
        } catch (err) {
            console.error("Login error:", err);
            alert("Something went wrong!");
        }
    };    

    return (
        <div id="candidate-dialog" className={dialogWrapperClasses}>
            <div className={dialogBoxClasses}>
                <button className="float-right text-black text-lg" onClick={() => closeDialog('candidate-dialog')}>
                    <span>&times;</span>
                </button>
                <h3 className="text-2xl font-semibold mb-6">Candidate Login</h3>
                <form onSubmit={handleCandidateLogin} className="space-y-5">
                    <div className="flex flex-col">
                        <label htmlFor="username" className="text-base">Username</label>
                        <input type="text" name="username" placeholder="Enter your username" required className="border p-3 rounded text-base" />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="password" className="text-base">Password</label>
                        <input type="password" name="password" placeholder="Enter your password" required className="border p-3 rounded text-base" />
                    </div>
                    <button type="submit" className="bg-[#13547a] text-white py-3 px-5 text-base rounded hover:bg-[#0d3a5e]">Login as Candidate</button>
                </form>
            </div>
        </div>
    );
};

const CompanyDialog = () => {
    const navigate = useNavigate();

    const handleCompanyLogin = async (e) => {
        e.preventDefault();
        const form = new FormData(e.target);
        const username = form.get("username");
        const password = form.get("password");

        try {
            const res = await fetch("https://aiinterviewer-d7c7.onrender.com/login_company", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();
            if (data.success) {
                document.getElementById("company-dialog").style.display = "none"; // close dialog
                navigate("/companydashboard");
            } else {
                alert(data.message || "Invalid credentials");
            }
        } catch (err) {
            console.error("Login error:", err);
            alert("Something went wrong!");
        }
    };

    return (
        <div id="company-dialog" className={dialogWrapperClasses}>
            <div className={dialogBoxClasses}>
                <button className="float-right text-black text-lg" onClick={() => closeDialog('company-dialog')}>
                    <span>&times;</span>
                </button>
                <h3 className="text-2xl font-semibold mb-6">Company Login</h3>
                <form onSubmit={handleCompanyLogin} className="space-y-5">
                    <div className="flex flex-col">
                        <label htmlFor="comp_username" className="text-base">Username</label>
                        <input type="text" id="comp_username" name="username" placeholder="Enter your username" required className="border p-3 rounded text-base" />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="comp_password" className="text-base">Password</label>
                        <input type="password" id="comp_password" name="password" placeholder="Enter your password" required className="border p-3 rounded text-base" />
                    </div>
                    <button type="submit" className="bg-[#13547a] text-white py-3 px-5 text-base rounded hover:bg-[#0d3a5e]">Login as Company</button>
                </form>
            </div>
        </div>
    );
};

const Home = () => {
    useEffect(() => {
        return () => {
            ["register-dialog", "candidate-dialog", "company-dialog"].forEach(id => {
                const dialog = document.getElementById(id);
                if (dialog) {
                    dialog.hasEventListenerAttached = false;
                }
            });
        };
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#6bc1c4] to-[#105775] bg-fixed font-[Montserrat] text-white overflow-x-hidden">
            <Navbar type={1} flag={0} />


            <div className="flex h-screen overflow-hidden px-20">
                <div className="flex w-full justify-between items-center gap-16">
                    <div className="max-w-lg ml-70">
                        <h1 className="text-5xl font-bold leading-snug">
                            AI-Powered<br />Interview Portal
                        </h1>
                        <div className="mt-6 flex items-center gap-4">
                            <button
                                className="border border-white text-white py-3 px-6 text-lg rounded-md font-semibold hover:bg-white hover:text-[#13547a] transition"
                                onClick={() => openDialog("register-dialog")}
                            >
                                Create New Account
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-6 w-full max-w-md mr-70 rounded-5">
                        <div
                            className="bg-white text-gray-800 rounded-xl shadow-lg p-5 flex justify-between items-center cursor-pointer"
                            onClick={() => openDialog("company-dialog")}
                        >
                            <div className="flex items-center gap-4">
                                <div className="bg-[#13547a] text-white rounded-full p-4">
                                    <Briefcase />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold">Recruiter</h3>
                                    <p className="text-base text-gray-500">
                                        Find top talent and conduct interviews effortlessly.
                                    </p>
                                </div>
                            </div>
                            <button className="bg-[#13547a] text-white px-5 py-3 text-base rounded-md hover:bg-[#0d3a5e]">Login</button>
                        </div>

                        <div
                            className="bg-white text-gray-800 rounded-xl shadow-lg p-6 flex justify-between items-center cursor-pointer"
                            onClick={() => openDialog("candidate-dialog")}
                        >
                            <div className="flex items-center gap-4">
                                <div className="bg-[#13547a] text-white rounded-full p-4">
                                    <User />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold">Student</h3>
                                    <p className="text-base text-gray-500">
                                        Prepare for your dream job with AI-powered tools.
                                    </p>
                                </div>
                            </div>
                            <button className="bg-[#13547a] text-white px-5 py-3 text-base rounded-md hover:bg-[#0d3a5e]">Login</button>
                        </div>
                    </div>
                </div>
            </div>

            <HowItWorks />
            <AIPortal />
            <FaqSection />
            <Footer />

            <RegisterDialog />
            <CandidateDialog />
            <CompanyDialog />
        </div>
    );
};

export default Home;
