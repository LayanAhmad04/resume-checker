import React, { useEffect, useState } from "react";
import "./CandidateDetailsModal.css";

export default function CandidateDetailsModal({ open, onClose, candidate, jobs }) {
    const [show, setShow] = useState(open);
    const [closing, setClosing] = useState(false);

    // handle modal open/close behavior
    useEffect(() => {
        if (open) {
            setShow(true);
            setClosing(false);
            document.body.style.overflow = "hidden";
        } else if (show) {
            setClosing(true);
            document.body.style.overflow = "auto";
        }
    }, [open]);

    const handleTransitionEnd = () => {
        if (closing) setShow(false);
    };

    if (!show || !candidate) return null;

    // find job title linked to candidate
    const jobTitle = jobs?.find((job) => job.id === candidate.job_id)?.title || "Unknown Job";

    // parse candidate subscores if provided
    const subscores = candidate.subscores
        ? typeof candidate.subscores === "string"
            ? JSON.parse(candidate.subscores)
            : candidate.subscores
        : {};

    return (
        <div
            className={`modal-overlay ${open && !closing ? "open" : ""}`}
            onClick={onClose}
        >
            <div
                className={`modal-panel ${closing ? "closing" : ""}`}
                onClick={(e) => e.stopPropagation()}
                onTransitionEnd={handleTransitionEnd}
            >
                <div className="modal-header">
                    <div className="modal-info">
                        <h2 className="candidate-name">{candidate.name || "Unknown Candidate"}</h2>
                        <p className="candidate-job">{jobTitle}</p>
                    </div>
                    <div className="modal-score">
                        <span>{candidate.score ? Number(candidate.score).toFixed(2) : "N/A"}</span>
                    </div>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="modal-content-box">
                    <p className="candidate-email">
                        <strong>Email:</strong> {candidate.email || "No email available"}
                    </p>

                    <div className="ai-summary">
                        <div className="section-title">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="icon"
                            >
                                <path d="M4 4h16v16H4z" />
                                <path d="M4 9h16" />
                                <path d="M9 4v16" />
                            </svg>
                            <strong>AI Summary:</strong>
                        </div>
                        <p className="candidate-email">
                            {typeof candidate.justification === "object"
                                ? candidate.justification.overall || "No summary available."
                                : candidate.justification || "No summary available."}
                        </p>
                    </div>

                    <div className="score-breakdown">
                        <div className="section-title">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="icon"
                            >
                                <rect x="4" y="3" width="16" height="18" rx="2" />
                                <line x1="8" y1="7" x2="16" y2="7" />
                                <line x1="8" y1="11" x2="16" y2="11" />
                                <line x1="8" y1="15" x2="10" y2="15" />
                            </svg>
                            <h3>Score Breakdown</h3>
                        </div>

                        {Object.keys(subscores).length === 0 ? (
                            <p>No breakdown available.</p>
                        ) : (
                            <table>
                                <thead>
                                    <tr>
                                        <th>Criterion</th>
                                        <th>Score / 10</th>
                                        <th>Weight Reasoning</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(subscores).map(([k, v]) => (
                                        <tr key={k}>
                                            <td>{k.charAt(0).toUpperCase() + k.slice(1)}</td>
                                            <td>{v?.score ? (v.score * 10).toFixed(1) : "N/A"}</td>
                                            <td>{v?.reason || "—"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
