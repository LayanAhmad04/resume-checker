import React, { useState, useEffect } from "react";
import "./ScoreSettingsModal.css";

export default function ScoreSettingsModal({ open, onClose, onSave, initialWeights }) {
    const defaultWeights = {
        experience: 0.35,
        skills: 0.30,
        education: 0.15,
        portfolio: 0.15,
        location: 0.05
    };

    const [weights, setWeights] = useState(defaultWeights);

    // ✅ Always lock body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "";
    }, [open]);

    // ✅ Fix #1: Make sure weights are set when modal opens or props update
    useEffect(() => {
        if (open) {
            if (initialWeights && Object.keys(initialWeights).length > 0) {
                setWeights(initialWeights);
            } else {
                setWeights(defaultWeights);
            }
        }
    }, [open, initialWeights]);

    // ✅ Fix #2: Ensure weights update if initialWeights come later (async case)
    useEffect(() => {
        if (!open) return;
        if (initialWeights && Object.keys(initialWeights).length > 0) {
            setWeights(initialWeights);
        }
    }, [initialWeights]);

    const handleChange = (key, val) => {
        setWeights(prev => ({ ...prev, [key]: Number(val) }));
    };

    const resetWeights = () => {
        setWeights(defaultWeights);
    };

    const save = () => {
        const total = Object.values(weights).reduce((a, b) => a + b, 0);
        const normalized = Object.fromEntries(
            Object.entries(weights).map(([k, v]) => [k, (v / total).toFixed(4)])
        );
        onSave(normalized);
        onClose();
    };

    // ✅ Fix #3: Prevent rendering when modal is closed
    if (!open) return null;

    return (
        <div className={`score-modal-backdrop show`}>
            <div className="score-modal-panel slide-in">

                <div className="score-modal-header">
                    <h3>Score Settings</h3>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="score-sliders">
                    {Object.keys(weights).map(k => (
                        <div key={k} className="slider-row">
                            <label>
                                {k.charAt(0).toUpperCase() + k.slice(1)} ({weights[k]})
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
                    <button onClick={resetWeights} className="reset-btn">Reset</button>

                    <button onClick={save} className="save-btn">Save</button>

                </div>
            </div>
        </div>
    );
}
