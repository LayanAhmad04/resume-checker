import { useState, useEffect } from "react";
import axios from "axios";
import { X } from "lucide-react";
import "./JobForm.css";

const API = import.meta.env.VITE_API_BASE;

export default function JobForm({ open = true, onCreated, onClose }) {
    const [visible, setVisible] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");
    const [experience, setExperience] = useState("");
    const [weights, setWeights] = useState({
        experience: 0.35,
        skills: 0.3,
        education: 0.15,
        portfolio: 0.15,
        location: 0.05,
    });

    useEffect(() => {
        if (open) {
            setVisible(true);
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
            setTimeout(() => setVisible(false), 300);
        }
        return () => (document.body.style.overflow = "");
    }, [open]);

    function handleWeightChange(key, val) {
        setWeights((prev) => ({ ...prev, [key]: Number(val) }));
    }

    // create new job entry
    async function createJob() {
        const total = Object.values(weights).reduce((a, b) => a + b, 0);
        const normalized = Object.fromEntries(
            Object.entries(weights).map(([k, v]) => [k, (v / total).toFixed(4)])
        );

        // send job data to backend
        await axios.post(`${API}/jobs`, {
            title,
            description,
            criteria: normalized,
            location,
            experience_required: experience,
        });

        // reset form fields
        setTitle("");
        setDescription("");
        setLocation("");
        setExperience("");
        if (onCreated) onCreated();
        if (onClose) onClose();
    }

    if (!open && !visible) return null;

    return (
        <div className={`jobform-backdrop ${open ? "show" : ""}`}>
            <div className={`jobform-panel ${open ? "slide-in" : "slide-out"}`}>
                <button className="jobform-close" onClick={onClose} aria-label="Close">
                    <X size={18} />
                </button>

                <h3 className="jobform-title">Create Job</h3>

                <input
                    className="jobform-input"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />

                <textarea
                    className="jobform-textarea"
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                <input
                    className="jobform-input"
                    placeholder="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                />

                <input
                    className="jobform-input"
                    placeholder="Years of Experience"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                />

                <div className="jobform-weights">
                    <h4 className="jobform-subtitle">Score Settings</h4>
                    {Object.keys(weights).map((k) => (
                        <div key={k} className="jobform-weight-item">
                            <label className="jobform-weight-label">
                                {k} <span className="jobform-weight-value"> {weights[k]}</span>
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={weights[k]}
                                onChange={(e) => handleWeightChange(k, e.target.value)}
                            />
                        </div>
                    ))}
                </div>

                <div className="jobform-actions">
                    <button className="jobform-btn" onClick={createJob}>
                        Save Job
                    </button>
                </div>
            </div>
        </div>
    );
}
