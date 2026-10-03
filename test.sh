#!/usr/bin/env bash
set -e

echo "========================================================"
echo "    Running INFRAMESH Test Suite"
echo "========================================================"

PYTHONPATH=. ./backend/venv/bin/pytest backend/tests/ -v

echo "✓ All backend unit, integration, and E2E diagnostic tests passed successfully!"
