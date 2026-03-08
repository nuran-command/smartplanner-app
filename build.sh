#!/usr/bin/env bash
# exit on error
set -o errexit

# 1. Build Frontend
echo "Building Frontend..."
cd frontend
npm install
npm run build
cd ..

# 2. Build Backend
echo "Building Backend..."
python3 -m pip install --upgrade pip
python3 -m pip install -r requirements.txt
python3 -m pip install gunicorn uvicorn[standard]
