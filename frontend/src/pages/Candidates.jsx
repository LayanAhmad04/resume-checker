import { useState, useEffect } from "react";
import axios from "axios";
import CandidateDetailsModal from "../components/CandidateDetailsModal";
import "./Candidates.css";

const API = import.meta.env.VITE_API_BASE;

export default function Candidates() {
    const [jobs, setJobs] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [selectedJobId, setSelectedJobId] = useState(null);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const res = await axios.get(`${API}/jobs`);
            setJobs(res.data);
            if (res.data.length > 0) setSelectedJobId(res.data[0].id);
        } catch (err) {
            console.error("Failed to fetch jobs:", err);
        }
    };

    useEffect(() => {
        if (selectedJobId) fetchCandidates(selectedJobId);
    }, [selectedJobId]);

    const fetchCandidates = async (jobId) => {
        try {
            const res = await axios.get(`${API}/jobs/${jobId}/candidates`);
            setCandidates(res.data || []);
        } catch (err) {
            console.error("Failed to fetch candidates:", err);
        }
    };

    const openModal = (candidate) => {
        console.log("Opening modal for candidate:", candidate); // ✅ debug line
        setSelectedCandidate(candidate);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedCandidate(null);
    };

    return (
        <>
            {/* Blur background when modal is open */}
            <div className={`candidates-page ${modalOpen ? "blur-background" : ""}`}>
                <h1 className="candidates-page-title">Candidates</h1>

                <div className="candidates-layout">
                    {/* Sidebar */}
                    <div className="candidates-sidebar">
                        <div className="sidebar-header">Jobs at Greenstone</div>
                        <div className="sidebar-jobs-list">
                            {jobs.map((job, i) => (
                                <div key={job.id}>
                                    <div
                                        className={`sidebar-job-item ${selectedJobId === job.id ? "active" : ""}`}
                                        onClick={() => setSelectedJobId(job.id)}
                                    >
                                        <div className="sidebar-job-title">{job.title}</div>
                                        <div className="sidebar-job-date">
                                            {new Date(job.created_at).toLocaleDateString()}
                                        </div>
                                        <div className="sidebar-job-tags">
                                            <span className="tag">
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

                                            <span className="tag">
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
                                    {i !== jobs.length - 1 && <div className="sidebar-divider"></div>}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Candidates Table */}
                    <div className="candidates-table-section">
                        <div className="candidates-table-header">
                            <div>Candidate Name</div>
                            <div>Score</div>
                        </div>

                        <div className="candidates-table-list">
                            {candidates.length === 0 ? (
                                <div className="no-candidates-row">No candidates for this job yet.</div>
                            ) : (
                                candidates.map((c) => (
                                    <div
                                        key={c.id}
                                        className="candidates-table-row"
                                        onClick={() => openModal(c)} // ✅ opens modal
                                    >
                                        <div>{c.name || "—"}</div>
                                        <div>{c.score != null ? `⭐ ${c.score}` : "—"}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal renders outside blur wrapper */}
            <CandidateDetailsModal
                open={modalOpen}
                onClose={closeModal}
                candidate={selectedCandidate}
                jobs={jobs} // 👈 pass all job data
            />
        </>
    );
}
