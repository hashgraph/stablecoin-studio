#!/bin/bash

# Start backend in the background
(cd backend && npm run start:dev) &
BACKEND_PID=$!

# Wait for backend to start
echo "Waiting for backend to start..."
sleep 5

# Start frontend (this will run in the foreground and keep the deployment alive)
cd web && npm start

# If frontend exits, kill backend
kill $BACKEND_PID
