import React, { useState, useEffect } from "react";
import { X } from "lucide-react"; // using Lucide icon for a clean X
import "./UploadModal.css";

export default function UploadModal({ open, onClose, onUpload }) {
    const [files, setFiles] = useState([]);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (open) {
            setVisible(true);
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
            setTimeout(() => setVisible(false), 300);
        }
    }, [open]);

    if (!open && !visible) return null;

    const handleChange = (e) => setFiles([...e.target.files]);
    const handleDrop = (e) => {
        e.preventDefault();
        setFiles([...e.dataTransfer.files]);
    };

    const handleUpload = () => {
        if (files.length === 0) return;
        onUpload(files);
        onClose();
    };

    return (
        <div className={`upload-modal-backdrop ${open ? "show" : ""}`}>
            <div
                className={`upload-modal-panel ${open ? "slide-in" : "slide-out"}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
            >
                {/* ❌ Top-right close icon */}
                <button className="upload-modal-close" onClick={onClose}>
                    <X size={18} />
                </button>

                <h3 className="upload-modal-title">Upload Resumes</h3>
                <p className="upload-modal-subtitle">
                    Drag & drop files here, or select manually.
                </p>

                <input
                    type="file"
                    multiple
                    accept=".pdf,.docx,.doc"
                    onChange={handleChange}
                    className="upload-modal-input"
                />

                <p className="upload-modal-note">
                    Supports PDF, DOCX, DOC. Max 50 resumes.
                </p>

                <ul className="upload-modal-file-list">
                    {files.map((f, i) => (
                        <li key={i}>{f.name}</li>
                    ))}
                </ul>

                <div className="upload-modal-actions">
                    <button className="upload-btn" onClick={handleUpload}>
                        Upload
                    </button>
                </div>
            </div>
        </div>
    );
}
