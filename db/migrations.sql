CREATE TABLE jobs (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  criteria JSONB NOT NULL,
  location TEXT,
  experience_required TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE candidates (
  id SERIAL PRIMARY KEY,
  job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
  filename TEXT,
  name TEXT,
  email TEXT,
  raw_text TEXT,
  parsed_data JSONB,
  score NUMERIC,
  subscores JSONB,
  justification JSONB,
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);
