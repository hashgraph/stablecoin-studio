#!/bin/bash
set -e

echo "Building backend..."
cd backend && npm run build
cd ..

echo "Building frontend..."
cd web && npm run build
cd ..

echo "Starting backend in production mode..."
(cd backend && npm run start:prod) &
BACKEND_PID=$!

echo "Waiting for backend to start..."
sleep 10

echo "Starting production server on port 5000..."
node production-server.js

# If frontend exits, kill backend
kill $BACKEND_PID
