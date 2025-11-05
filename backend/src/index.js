// backend/src/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');
const axios = require('axios');

// ---------- SETUP ----------
const uploadDir = path.resolve(__dirname, '..', process.env.UPLOAD_DIR || 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({
    storage,
    limits: { files: 50, fileSize: 10 * 1024 * 1024 } // 10MB per file
});

const app = express();
app.use(cors());
app.use(express.json());

// ---------- DATABASE ----------
const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    ssl: {
        require: true,
        rejectUnauthorized: false
    }
});

// ---------- JOBS ENDPOINTS ----------

// Create job
app.post('/api/jobs', async (req, res) => {
    const { title, description, criteria, location, experience_required } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO jobs (title, description, criteria, location, experience_required)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
            [title, description, criteria, location, experience_required]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error inserting job:', err);
        res.status(500).json({ error: 'db error' });
    }
});

// Get all jobs
app.get('/api/jobs', async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT id, title, description, criteria, created_at, location, experience_required
      FROM jobs
      ORDER BY created_at DESC
    `);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching jobs:', err);
        res.status(500).json({ error: 'db error' });
    }
});

// ---------- CANDIDATES ENDPOINTS ----------

// Get all candidates (for Landing.jsx)
app.get('/api/candidates', async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT c.*, j.title AS job_title
      FROM candidates c
      LEFT JOIN jobs j ON c.job_id = j.id
      ORDER BY c.created_at DESC
    `);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching candidates:', err);
        res.status(500).json({ error: 'db error' });
    }
});

// Get candidates for specific job
app.get('/api/jobs/:jobId/candidates', async (req, res) => {
    const jobId = req.params.jobId;
    try {
        const result = await pool.query(
            `SELECT * FROM candidates WHERE job_id=$1 ORDER BY score DESC NULLS LAST, created_at DESC`,
            [jobId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching job candidates:', err);
        res.status(500).json({ error: 'db error' });
    }
});

// Create a candidate manually (optional)
app.post('/api/candidates', async (req, res) => {
    const { name, job_id, score, filename } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO candidates (name, job_id, score, filename)
       VALUES ($1, $2, $3, $4) RETURNING *`,
            [name || null, job_id, score || null, filename || null]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error inserting candidate:', err);
        res.status(500).json({ error: 'db error' });
    }
});

// Re-evaluate candidate
app.post('/api/candidates/:id/reeval', async (req, res) => {
    const id = req.params.id;
    try {
        const candidate = (await pool.query('SELECT * FROM candidates WHERE id=$1', [id])).rows[0];
        if (!candidate) return res.status(404).json({ error: 'not found' });

        const resp = await axios.post(`${process.env.PARSER_SERVICE_URL.replace(/\/$/, '')}/process`, {
            jobId: candidate.job_id,
            candidateId: id,
            filePath: path.resolve(path.join(uploadDir, candidate.filename)),
            filename: candidate.filename
        }, { timeout: 120000 });

        console.log('Re-eval parser response:', resp.data);
        res.json({ ok: true });
    } catch (err) {
        console.error('Re-eval failed:', err?.response?.data || err.message || err);
        res.status(500).json({ error: 're-eval failed' });
    }
});

// ---------- FILE UPLOAD (Two-step) ----------
app.post('/api/jobs/:jobId/upload', upload.array('files', 50), async (req, res) => {
    const jobId = req.params.jobId;
    const files = req.files;
    if (!files || files.length === 0) return res.status(400).json({ error: 'no files' });

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Step 1: Insert minimal candidate rows
        const insertedRows = [];
        for (const f of files) {
            const result = await client.query(
                `INSERT INTO candidates (job_id, filename) VALUES ($1,$2) RETURNING *`,
                [jobId, f.filename]
            );
            insertedRows.push(result.rows[0]);
        }

        await client.query('COMMIT');

        // Step 2: Call parser service
        for (let i = 0; i < files.length; i++) {
            const f = files[i];
            const candidate = insertedRows[i];
            const absolutePath = f.path; // already absolute

            console.log('Processing file:', absolutePath, 'for candidate:', candidate.id);

            try {
                const resp = await axios.post(`${process.env.PARSER_SERVICE_URL.replace(/\/$/, '')}/process`, {
                    jobId,
                    candidateId: candidate.id,
                    filePath: absolutePath,
                    filename: f.filename
                }, { timeout: 120000 });

                console.log('Parser response for candidate', candidate.id, ':', resp.data);
            } catch (err) {
                console.error('Parser error for candidate', candidate.id, err?.response?.data || err.message);
            }
        }

        res.json({ ok: true, uploaded: files.length });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Upload error:', err);
        res.status(500).json({ error: 'upload error', details: err.message });
    } finally {
        client.release();
    }
});

// ---------- SERVER START ----------
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Backend listening on port ${PORT}`));
