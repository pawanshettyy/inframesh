#!/usr/bin/env bash
set -e

# Keep startup logs safe on hosts whose locale is not UTF-8.
export PYTHONUTF8=1
export PYTHONIOENCODING=utf-8

echo "========================================================"
echo "    Starting INFRAMESH Full-Stack Platform"
echo "========================================================"

# 1. Setup Python virtual environment if not present
VENV_DIR="${VENV_DIR:-.venv}"
if [ ! -d "$VENV_DIR" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv "$VENV_DIR"
    "$VENV_DIR/bin/pip" install -r backend/requirements.txt
fi

# 2. Check and install frontend packages
if [ ! -d "node_modules" ]; then
    echo "Installing Node.js dependencies..."
    npm ci
fi

# 3. Kill existing processes on ports 8000 and 3000
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# 4. Start FastAPI Backend in background
echo "Starting InframeSH Core Backend on http://localhost:8000..."
PYTHONPATH=. "$VENV_DIR/bin/python" -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Trap signals to clean up background backend process
trap "kill -9 $BACKEND_PID 2>/dev/null || true" EXIT

# 5. Start Next.js Frontend
echo "Starting InframeSH Frontend on http://localhost:3000..."
npm run dev

wait
