import React, { useState } from "react";

export default function CandidateCard({ candidate }) {
    const [expanded, setExpanded] = useState(false);

    const subscores = candidate.subscores
        ? typeof candidate.subscores === "string"
            ? JSON.parse(candidate.subscores)
            : candidate.subscores
        : null;

    return (
        <div className="candidate-card" style={{
            border: "1px solid #ddd",
            borderRadius: 10,
            padding: 16,
            marginBottom: 12,
            backgroundColor: "#fafafa"
        }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h4 style={{ margin: 0 }}>{candidate.name || "Unknown Candidate"}</h4>
                    <p style={{ margin: "4px 0", fontSize: 13 }}>{candidate.email || "No email detected"}</p>
                </div>
                <div style={{
                    background: "#4f46e5",
                    color: "white",
                    padding: "6px 12px",
                    borderRadius: 8,
                    fontWeight: 600
                }}>
                    {candidate.score ? candidate.score.toFixed(2) : "Processing"}
                </div>
            </div>

            {subscores && (
                <div style={{ marginTop: 10 }}>
                    <button
                        style={{
                            background: "none",
                            color: "#4f46e5",
                            border: "none",
                            cursor: "pointer",
                            textDecoration: "underline"
                        }}
                        onClick={() => setExpanded(!expanded)}
                    >
                        {expanded ? "Hide details" : "View justification"}
                    </button>

                    {expanded && (
                        <div
                            style={{
                                marginTop: 10,
                                padding: 10,
                                background: "white",
                                borderRadius: 8,
                                border: "1px solid #eee"
                            }}
                        >
                            {Object.entries(subscores).map(([k, v]) => (
                                <div key={k} style={{ marginBottom: 8 }}>
                                    <strong>{k.charAt(0).toUpperCase() + k.slice(1)}:</strong>{" "}
                                    {v.score ? (v.score * 10).toFixed(1) : "N/A"} / 10
                                    <p style={{ margin: "2px 0 0 10px", fontSize: 13, color: "#555" }}>
                                        {v.reason}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
