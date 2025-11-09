# AI Resume Checker

## Overview
The AI Resume Checker is a full-stack application that automatically evaluates resumes using artificial intelligence.  
It allows recruiters or job platforms to efficiently analyze resumes against specific job descriptions and criteria such as skills, experience, education, portfolio, and location.  
Each candidate receives a detailed score breakdown and justification for how well they fit the role.

This project integrates Natural Language Processing (NLP) and large language models (OpenAI GPT) to provide semantic understanding and scoring.  
It is built using a modular microservice architecture consisting of a Node.js backend API, a Python-based parser service, and a React frontend.

---

## Features

### AI-Powered Resume Evaluation
Uses OpenAI’s GPT model to compare resumes with job descriptions and produce weighted scores and justifications.

### Resume Parsing and Information Extraction
Automatically extracts candidate name, email, and text content from PDF, DOCX, and TXT resumes using spaCy and PyMuPDF.

### Configurable Scoring Criteria
Define and adjust weights for categories like skills, experience, education, portfolio, and location through the dashboard.

### Job and Candidate Management
Add jobs, upload resumes, and view structured scoring outputs through an interactive UI.

### Secure and Modular Architecture
Separate backend and parser services improve maintainability and fault isolation.

### Dark, Modern Frontend
Built with React and TailwindCSS for a sleek and professional interface.

---

## Tech Stack

### Frontend
- React (Vite)
- TailwindCSS
- Axios

### Backend (API Server)
- Node.js (Express)
- PostgreSQL
- JWT Authentication
- OpenAI API

### Parser Service
- Python (Flask)
- spaCy (NLP)
- PyMuPDF (fitz) for PDF parsing
- python-docx for DOCX parsing
- psycopg2 for database communication
- OpenAI Python SDK

---

## Architecture Overview
The system consists of three main services that communicate over REST APIs:

1. **Frontend (React)** – User interface for managing jobs and candidates.  
2. **Backend (Node.js)** – Handles API requests, authentication, and data persistence in PostgreSQL.  
3. **Parser Service (Python)** – Processes uploaded resumes, extracts text, calls OpenAI for scoring, and updates the database.

### Flow
1. A recruiter uploads a candidate’s resume through the frontend.  
2. The backend sends the resume to the parser service.  
3. The parser extracts relevant text, analyzes it using OpenAI, computes weighted scores, and stores the results in the database.  
4. The frontend displays parsed data, subscores, and overall evaluation.

---

## Setup and Installation

### 1. Backend Setup
```bash
cd path/to/resume-checker/backend
npm install



Create a .env file:
Run database migrations:
Start the backend:
Expected output:
