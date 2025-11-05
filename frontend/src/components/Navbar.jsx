import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import "./Navbar.css"; // ✅ link the CSS file

export default function Navbar() {
    const nav = useNavigate();
    const loc = useLocation();
    const links = [
        {
            label: "Dashboard",
            path: "/",
            icon: (
                // 4 squares 2x2 icon
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                </svg>
            ),
        },
        {
            label: "Jobs",
            path: "/jobs",
            icon: (
                // work bag icon
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M4 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z" />
                    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                </svg>
            ),
        },
        {
            label: "Candidates",
            path: "/candidates",
            icon: (
                // user icon
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <circle cx="12" cy="7" r="4" />
                    <path d="M5.5 21a8.38 8.38 0 0 1 13 0" />
                </svg>
            ),
        },
    ];

    return (
        <div className="navbar-container">
            <div className="navbar-top">
                <div className="navbar-logo">
                    <img src={logo} alt="Logo" />
                    <span>SmartRec</span>
                </div>

                <nav className="navbar-links">
                    {links.map((l) => {
                        const active = loc.pathname === l.path;
                        return (
                            <button
                                key={l.path}
                                onClick={() => nav(l.path)}
                                className={`navbar-button ${active ? "active" : ""}`}
                            >
                                <span className="navbar-icon">{l.icon}</span>
                                <span>{l.label}</span>
                            </button>
                        );
                    })}
                </nav>
            </div>

            <div className="navbar-footer">
                <p>© Resume Checker</p>
            </div>
        </div>
    );
}