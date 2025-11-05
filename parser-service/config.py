import os
from dotenv import load_dotenv
load_dotenv()

DB_DSN = {
  'host': os.getenv('DB_HOST', '127.0.0.1'),
  'port': int(os.getenv('DB_PORT', 5432)),
  'user': os.getenv('DB_USER', 'postgres'),
  'password': os.getenv('DB_PASS', 'postgres'),
  'database': os.getenv('DB_NAME', 'resume_checker')
}
PARSER_PORT = int(os.getenv('PARSER_PORT', 5000))
OPENAI_KEY = os.getenv('OPENAI_API_KEY')
BACKEND_URL = os.getenv('BACKEND_URL', 'http://localhost:4000')  # optional
