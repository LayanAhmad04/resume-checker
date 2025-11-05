import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Landing.css';

const API = import.meta.env.VITE_API_BASE;

export default function Landing() {
    const nav = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchJobs();
        fetchCandidates();
    }, []);

    const fetchJobs = async () => {
        const res = await axios.get(`${API}/jobs`);
        setJobs(res.data);
    };

    const fetchCandidates = async () => {
        const res = await axios.get(`${API}/candidates`);
        setCandidates(res.data);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const term = searchTerm.trim().toLowerCase();
        if (!term) return;

        const job = jobs.find(j => j.title.toLowerCase().includes(term));
        if (job) {
            nav(`/jobs`, { state: { selectedJobId: job.id } });
            return;
        }

        const candidate = candidates.find(c => c.name?.toLowerCase().includes(term));
        if (candidate) {
            nav(`/candidates/${candidate.id}`);
            return;
        }

        alert("No matching job or candidate found.");
    };

    return (
        <div className="landing-container">
            <div className="search-form-container">
                <form className="search-form" onSubmit={handleSearch}>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Quick search jobs or candidates..."
                        className="search-input"
                    />
                    <button type="submit" className="search-button">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                            width="20" height="20" fill="none" stroke="#aaa"
                            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                    </button>
                </form>
            </div>

            <hr style={{ borderColor: "#000000ff" }} />

            <h2>Current Openings</h2>
            <div className="jobs-section">
                <div className="jobs-carousel">
                    {jobs.map(job => {
                        const applicantsCount = candidates.filter(c => c.job_id === job.id).length;
                        return (
                            <div
                                key={job.id}
                                className="job-card"
                                onClick={() => nav(`/jobs`, { state: { selectedJobId: job.id } })}
                            >
                                <h3 className="job-title">{job.title}</h3>
                                <div className="job-meta">
                                    <span className="job-bubble">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                                            fill="none" stroke="currentColor" strokeWidth="1.8"
                                            strokeLinecap="round" strokeLinejoin="round"
                                            className="job-icon">
                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z" />
                                            <circle cx="12" cy="10" r="3" />
                                        </svg>
                                        {job.location || "N/A"}
                                    </span>

                                    <span className="job-bubble">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                                            fill="none" stroke="currentColor" strokeWidth="1.8"
                                            strokeLinecap="round" strokeLinejoin="round"
                                            className="job-icon">
                                            <path d="M22 10l-10-5-10 5 10 5z" />
                                            <path d="M6 12v5c4 2 8 2 12 0v-5" />
                                        </svg>
                                        {job.experience_required ? `${job.experience_required} yrs` : "N/A"}
                                    </span>
                                </div>

                                <p className="job-applicants">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                                        fill="none" stroke="currentColor" strokeWidth="1.8"
                                        strokeLinecap="round" strokeLinejoin="round"
                                        className="job-icon">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                        <circle cx="9" cy="7" r="4" />
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                    </svg>
                                    Applicants: {applicantsCount}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>

            <h2>Candidates</h2>
            <div className="candidates-section">
                <div className="candidates-header">
                    <div>CANDIDATE NAME</div>
                    <div>SCORE</div>
                    <div>APPLIED ROLE</div>
                </div>
                <div className="candidates-list">
                    {candidates.map((c) => (
                        <div key={c.id} className="candidate-row">
                            <div>{c.name || "—"}</div>
                            <div>{c.score != null ? `⭐ ${c.score}` : "—"}</div>
                            <div>{c.job_title || "—"}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
