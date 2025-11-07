// frontend/components/ScoreSettingsModal.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ScoreSettingsModal.css";

const API = import.meta.env.VITE_API_BASE;

export default function ScoreSettingsModal({ open, onClose, jobId, initialWeights, onWeightsSaved }) {
    const defaultWeights = {
        experience: 0.35,
        skills: 0.30,
        education: 0.15,
        portfolio: 0.15,
        location: 0.05
    };

    const [weights, setWeights] = useState(defaultWeights);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "";
    }, [open]);

    // when modal opens, load initial weights or defaults
    useEffect(() => {
        if (open) {
            if (initialWeights && Object.keys(initialWeights).length > 0) {
                setWeights(initialWeights);
            } else {
                setWeights(defaultWeights);
            }
        }
    }, [open, initialWeights]);

    const handleChange = (key, val) => {
        setWeights(prev => ({ ...prev, [key]: Number(val) }));
    };

    const resetWeights = () => setWeights(defaultWeights);

    const save = async () => {
        setLoading(true);
        setError("");

        const total = Object.values(weights).reduce((a, b) => a + b, 0);
        const normalized = Object.fromEntries(
            Object.entries(weights).map(([k, v]) => [k, parseFloat((v / total).toFixed(4))])
        );

        try {
            await axios.put(`${API}/api/jobs/${jobId}/criteria`, { criteria: normalized });
            onWeightsSaved(normalized);
            onClose();
        } catch (err) {
            console.error("Error saving weights:", err);
            setError("Failed to save settings.");
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        <div className="score-modal-backdrop show">
            <div className="score-modal-panel slide-in">
                <div className="score-modal-header">
                    <h3>Score Settings</h3>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                {error && <p className="error-text">{error}</p>}

                <div className="score-sliders">
                    {Object.keys(weights).map(k => (
                        <div key={k} className="slider-row">
                            <label>
                                {k.charAt(0).toUpperCase() + k.slice(1)} ({weights[k].toFixed(2)})
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={weights[k]}
                                onChange={e => handleChange(k, e.target.value)}
                            />
                        </div>
                    ))}
                </div>

                <div className="score-modal-actions">
                    <button onClick={resetWeights} className="reset-btn" disabled={loading}>Reset</button>
                    <button onClick={save} className="save-btn" disabled={loading}>
                        {loading ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
}
