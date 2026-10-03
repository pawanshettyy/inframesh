#!/usr/bin/env bash
set -e

echo "========================================================"
echo "    Starting INFERMESH Full-Stack Platform"
echo "========================================================"

# 1. Setup Python virtual environment if not present
if [ ! -d "backend/venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv backend/venv
    ./backend/venv/bin/pip install -r backend/requirements.txt
fi

# 2. Check and install frontend packages
if [ ! -d "node_modules" ]; then
    echo "Installing Node.js dependencies..."
    npm install
fi

# 3. Kill existing processes on ports 8000 and 3000
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# 4. Start FastAPI Backend in background
echo "Starting InferMesh Core Backend on http://localhost:8000..."
PYTHONPATH=. ./backend/venv/bin/python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Trap signals to clean up background backend process
trap "kill -9 $BACKEND_PID 2>/dev/null || true" EXIT

# 5. Start Next.js Frontend
echo "Starting InferMesh Frontend on http://localhost:3000..."
npm run dev

wait
