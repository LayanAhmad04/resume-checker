require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');
const axios = require('axios');

const uploadDir = path.resolve(__dirname, '..', process.env.UPLOAD_DIR || 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({
    storage,
    limits: { files: 50, fileSize: 10 * 1024 * 1024 }
});

const app = express();

// CORS Configuration
const allowedOrigins = [
    'https://resume-checker-gamma.vercel.app',
    'http://localhost:5173'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log('Blocked by CORS:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use(express.json());

// Database Configuration
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

app.get('/', (req, res) => {
    res.send('Resume Checker backend is running!');
});

// Create new job
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

// Fetch all jobs
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

// update job score criteria
app.put('/api/jobs/:jobId/criteria', async (req, res) => {
    const { jobId } = req.params;
    const { criteria } = req.body;
    if (!criteria || typeof criteria !== 'object') {
        return res.status(400).json({ error: 'Invalid criteria' });
    }

    try {
        const result = await pool.query(
            `UPDATE jobs SET criteria=$1 WHERE id=$2 RETURNING *`,
            [JSON.stringify(criteria), jobId]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Job not found' });
        }
        res.json({ message: 'Criteria updated', job: result.rows[0] });
    } catch (err) {
        console.error('Error updating criteria:', err);
        res.status(500).json({ error: 'Failed to update criteria' });
    }
});

// get job criteria
app.get('/api/jobs/:jobId/criteria', async (req, res) => {
    const { jobId } = req.params;
    try {
        const result = await pool.query(`SELECT criteria FROM jobs WHERE id=$1`, [jobId]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Job not found' });
        }
        const criteria = result.rows[0].criteria;
        res.json({ criteria: criteria ? JSON.parse(criteria) : {} });
    } catch (err) {
        console.error('Error fetching criteria:', err);
        res.status(500).json({ error: 'db error' });
    }
});



// Fetch all candidates
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

// Fetch candidates by job ID
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


// delete a job and all its candidates
app.delete('/api/jobs/:jobId', async (req, res) => {
    const jobId = req.params.jobId;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // delete related candidates first
        await client.query('DELETE FROM candidates WHERE job_id=$1', [jobId]);

        // delete the job itself
        const result = await client.query('DELETE FROM jobs WHERE id=$1 RETURNING *', [jobId]);

        await client.query('COMMIT');

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Job not found' });
        }

        res.json({ message: 'Job and related candidates deleted successfully' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error deleting job:', err);
        res.status(500).json({ error: 'Failed to delete job' });
    } finally {
        client.release();
    }
});


// Insert candidate
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

// Handles multiple candidate uploads for a specific job
app.post('/api/jobs/:jobId/upload', upload.array('files', 50), async (req, res) => {
    const jobId = req.params.jobId;
    const files = req.files;
    if (!files || files.length === 0) return res.status(400).json({ error: 'no files' });

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const insertedRows = [];
        for (const f of files) {
            const result = await client.query(
                `INSERT INTO candidates (job_id, filename) VALUES ($1,$2) RETURNING *`,
                [jobId, f.filename]
            );
            insertedRows.push(result.rows[0]);
        }

        await client.query('COMMIT');

        for (let i = 0; i < files.length; i++) {
            const f = files[i];
            const candidate = insertedRows[i];
            const absolutePath = f.path;

            console.log('Processing file:', absolutePath, 'for candidate:', candidate.id);

            const fileData = fs.readFileSync(absolutePath, { encoding: "base64" });

            try {
                const resp = await axios.post(
                    `${process.env.PARSER_SERVICE_URL.replace(/\/$/, '')}/process`,
                    {
                        jobId,
                        candidateId: candidate.id,
                        filename: f.filename,
                        fileData
                    },
                    { timeout: 120000 }
                );

                console.log("Parser response for candidate", candidate.id, ":", resp.data);
            } catch (err) {
                console.error("Parser error for candidate", candidate.id, err?.response?.data || err.message);
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

// Server Startup
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend listening on port ${PORT}`));
