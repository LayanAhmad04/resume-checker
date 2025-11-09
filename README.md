# AI Resume Checker

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Flow](#flow)
- [Setup and Installation](#setup-and-installation)
  - [1. Backend Setup](#1-backend-setup)
  - [2. Parser Service Setup](#2-parser-service-setup)
  - [3. Frontend Setup](#3-frontend-setup)
- [How the Parser Works](#how-the-parser-works)
  - [File Extraction](#file-extraction)
  - [Information Extraction](#information-extraction)
  - [Scoring Logic](#scoring-logic)
  - [Error Handling](#error-handling)
- [Workflow](#workflow)
- [Development Challenges](#development-challenges)
- [Favorite Features and Highlights](#favorite-features-and-highlights)

## Overview
The AI Resume Checker is a full-stack application that automatically evaluates resumes using artificial intelligence.  
It allows recruiters or job platforms to efficiently analyze resumes against specific job descriptions and criteria such as skills, experience, education, portfolio, and location.  
Each candidate receives a detailed score breakdown and justification for how well they fit the role.

## Features

### AI-Powered Resume Evaluation
- Uses OpenAI’s GPT model to compare resumes with job descriptions and produce weighted scores and justifications.

### Resume Parsing and Information Extraction
- Automatically extracts candidate name, email, and text content from PDF, DOCX, and TXT resumes using spaCy and PyMuPDF.

### Configurable Scoring Criteria
- Define and adjust weights for categories like skills, experience, education, portfolio, and location through the dashboard.

### Editable Scoring Weights
- Modify scoring weights even after they have been initially set. The updated weights can be saved and applied to future evaluations.

### Re-Evaluate Candidates
- Re-evaluate a candidate’s resume using the latest scoring weights without needing to re-upload the file. This ensures that changes in criteria are reflected in the candidate’s updated AI-generated score and justification.

### Job and Candidate Management
- Add jobs, delete jobs, upload resumes, and view structured scoring outputs through an interactive UI.

### Secure and Modular Architecture
- Separate backend and parser services improve maintainability and fault isolation.

## Workflow
1. A recruiter uploads a candidate’s resume through the frontend.  
2. The backend sends the resume to the parser service.  
3. The parser extracts relevant text, analyzes it using OpenAI, computes weighted scores, and stores the results in the database.  
4. The frontend displays parsed data, subscores, and overall evaluation.

## Setup and Installation

### 1. Backend Setup
```bash
cd path/to/resume-checker/backend
npm install
```
Create a .env file:
```bash
PORT=4000
DB_HOST=your_postgres_host
DB_PORT=5432
DB_USER=your_user
DB_PASS=your_password
DB_NAME=resume_checker
PARSER_SERVICE_URL=http://localhost:5000
OPENAI_API_KEY=your_openai_key
JWT_SECRET=replace_with_secure_val
UPLOAD_DIR=uploads
```
Run database migrations:
```bash
psql -U postgres -d resume_checker -f ../db/migrations.sql
```
Start the backend:
```bash
node src/index.js
```
Expected output:
```bash
Backend listening 4000
```
### 2. Parser Service Setup
```bash
cd ../parser-service
pip install -r requirements.txt
```
Create a .env file:
```bash
DB_HOST=your_postgres_host
DB_PORT=5432
DB_USER=your_user
DB_PASS=your_password
DB_NAME=resume_checker
PARSER_PORT=5000
OPENAI_API_KEY=your_openai_key
BACKEND_URL=http://localhost:4000
UPLOAD_DIR=../uploads
```
Download spaCy model:
```bash
python -m spacy download en_core_web_sm
```
Run the parser service:
```bash
python app.py
```
Expected output:
```bash
 * Running on http://0.0.0.0:5000
```
### 3. Frontend Setup
```bash
cd ../frontend
npm install
```
Create a .env file:
```bash
VITE_API_BASE=http://localhost:4000/api
````
Run the frontend:
```bash
npm run dev
```
Vite will start the app at:
```bash
http://localhost:5173
```

## How the Parser Works
### File Extraction
- PDF resumes are read using fitz (PyMuPDF).
- DOCX resumes are read using python-docx.
- Plain text resumes are read directly.
  
### Information Extraction
- Uses regex and pattern heuristics to identify candidate name and email.
- spaCy is available for more advanced NLP if needed.
  
### Scoring Logic
- The parser fetches the job’s criteria and description from the database.
- It sends the job description, resume text, and normalized criteria weights to OpenAI.
- OpenAI returns subscores, justifications, and an overall score out of 10 in structured JSON format.
- The parser validates the response and stores the results in PostgreSQL.
  
### Error Handling
- If OpenAI returns invalid JSON or fails, fallback scoring (neutral 0.5 per criterion) is used to maintain continuity.

## Development Challenges
1. Multi-Service Coordination
Synchronizing communication between Node.js (backend) and Flask (parser) services required handling asynchronous requests, error recovery, and consistent database updates.
2. Resume Parsing Accuracy
Handling different resume formats and file types was challenging. Some PDFs had poor text extraction, requiring multiple parsing strategies and fallback mechanisms.
3. Reliable AI Scoring
OpenAI sometimes returns responses with formatting errors or missing fields. The parser includes strict JSON validation and fallback scoring logic to handle such cases.

## Favorite Features and Highlights
Dynamic Scoring Weights
- The ability to dynamically adjust weight values for each evaluation criterion adds flexibility and makes the system highly customizable for different job roles.
AI Justification Texts
- Integrating OpenAI to generate concise and human-readable justifications for scores adds transparency and insight to the evaluation process.
Seamless Resume Parsing Flow
- Combining PDF parsing, NLP extraction, and OpenAI scoring in one unified pipeline was both complex and rewarding to implement.
Frontend Visualization
- Seeing AI scores and subscores visualized in the UI makes the experience intuitive and practical for recruiters.
