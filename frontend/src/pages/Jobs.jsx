import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import JobForm from "../components/JobForm";
import ScoreSettingsModal from "../components/ScoreSettingsModal";
import UploadModal from "../components/UploadModal";
import { Plus, Trash2 } from "lucide-react";
import { FaUpload, FaCog } from "react-icons/fa";
import "./Jobs.css";

const API = import.meta.env.VITE_API_BASE;

export default function Jobs() {
    const location = useLocation();
    const selectedJobIdFromNav = location.state?.selectedJobId || null;

    const [jobs, setJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [showScoreModal, setShowScoreModal] = useState(false);
    const [weights, setWeights] = useState({});
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showAddJobModal, setShowAddJobModal] = useState(false);

    // fetch job data
    useEffect(() => {
        fetchJobs();
    }, []);

    // fetch all jobs
    async function fetchJobs() {
        const res = await axios.get(`${API}/jobs`);
        const sortedJobs = res.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setJobs(sortedJobs);

        if (selectedJobIdFromNav) {
            const jobToSelect = sortedJobs.find((j) => j.id === selectedJobIdFromNav);
            if (jobToSelect) {
                setSelectedJob(jobToSelect);
                return;
            }
        }

        if (!selectedJob && sortedJobs.length > 0) {
            setSelectedJob(sortedJobs[0]);
        }
    }

    // delete job and its candidates
    async function handleDeleteJob(jobId) {
        if (!window.confirm("Are you sure you want to delete this job and all its candidates?")) return;

        try {
            await axios.delete(`${API}/jobs/${jobId}`);
            alert("Job and its candidates deleted successfully!");
            fetchJobs();
            setSelectedJob(null);
        } catch (err) {
            console.error("Error deleting job:", err);
            alert("Failed to delete job. Please try again.");
        }
    }

    // resume upload handler
    const handleUpload = async (files) => {
        if (!selectedJob) return;
        const fd = new FormData();
        files.forEach((f) => fd.append("files", f));
        await axios.post(`${API}/jobs/${selectedJob.id}/upload`, fd, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Resumes uploaded!");
    };

    return (
        <div className={`jobs-page ${showScoreModal ? "score-open" : ""}`}>
            <div className="jobs-header">
                <h1>Jobs</h1>
                <button className="add-job-btn" onClick={() => setShowAddJobModal(true)}>
                    <Plus className="add-job-icon" />
                </button>
            </div>

            <div className="jobs-layout">
                <div className="jobs-sidebar">
                    <div className="sidebar-title">Jobs at Greenstone</div>
                    <div className="jobs-list">
                        {jobs.map((job, i) => (
                            <div key={job.id}>
                                <div
                                    onClick={() => setSelectedJob(job)}
                                    className={`job-item ${selectedJob?.id === job.id ? "active" : ""}`}
                                >
                                    <div className="job-item-title">{job.title}</div>
                                    <div className="job-item-date">
                                        {new Date(job.created_at).toLocaleDateString()}
                                    </div>
                                    <div className="job-taggs">
                                        <span className="tagg">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="1.8"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="tag-icon"
                                            >
                                                <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z" />
                                                <circle cx="12" cy="10" r="3" />
                                            </svg>
                                            {job.location || "N/A"}
                                        </span>

                                        <span className="tagg">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="1.8"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="tag-icon"
                                            >
                                                <path d="M22 10L12 5 2 10l10 5 10-5z" />
                                                <path d="M6 12v5c0 1 2.7 2 6 2s6-1 6-2v-5" />
                                            </svg>
                                            {job.experience_required ? `${job.experience_required} yrs` : "N/A"}
                                        </span>
                                    </div>
                                </div>
                                {i !== jobs.length - 1 && <div className="divider"></div>}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="job-details">
                    {selectedJob ? (
                        <div className="job-content">
                            <div className="job-header">
                                <div>
                                    <h2>{selectedJob.title}</h2>
                                    <p>{new Date(selectedJob.created_at).toLocaleDateString()}</p>
                                </div>
                                <div className="job-header-tags">
                                    <span>{selectedJob.location || "N/A"}</span>
                                    <span>
                                        {selectedJob.experience_required
                                            ? `${selectedJob.experience_required} yrs`
                                            : "N/A"}
                                    </span>
                                    <button
                                        className="delete-btn"
                                        onClick={() => handleDeleteJob(selectedJob.id)}
                                        title="Delete Job"
                                    >
                                        <Trash2 className="delete-icon" />
                                    </button>
                                </div>
                            </div>

                            <div className="job-description">
                                <h4>Description</h4>
                                <p>{selectedJob.description}</p>
                            </div>

                            <div className="job-actions">
                                <button className="upload-btn" onClick={() => setShowUploadModal(true)}>
                                    <FaUpload style={{ marginRight: "15px" }} />
                                    Upload Resumes
                                </button>

                                <button className="score-btn" onClick={() => setShowScoreModal(true)}>
                                    <FaCog style={{ marginRight: "15px" }} />
                                    Score Settings
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className="no-job">Select a job to view details</p>
                    )}
                </div>
            </div>

            <ScoreSettingsModal
                open={showScoreModal}
                onClose={() => setShowScoreModal(false)}
                onSave={(newWeights) => setWeights(newWeights)}
                initialWeights={weights}
                jobId={selectedJobId?.id}
            />

            <UploadModal
                open={showUploadModal}
                onClose={() => setShowUploadModal(false)}
                onUpload={handleUpload}
            />

            <JobForm
                open={showAddJobModal}
                onCreated={() => fetchJobs()}
                onClose={() => setShowAddJobModal(false)}
            />
        </div>
    );
}
