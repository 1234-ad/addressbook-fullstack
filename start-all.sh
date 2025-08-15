#!/bin/bash

# AddressBook Full-Stack Application Startup Script
echo "🚀 Starting AddressBook Full-Stack Application..."

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js v14 or higher."
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

if ! command_exists mysql; then
    echo "⚠️  MySQL command not found. Make sure MySQL is installed and running."
fi

echo "✅ Prerequisites check completed."

# Install dependencies if node_modules don't exist
echo "📦 Installing dependencies..."

# Backend dependencies
if [ ! -d "backend/node_modules" ]; then
    echo "Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

# User App dependencies
if [ ! -d "frontend/user-app/node_modules" ]; then
    echo "Installing user app dependencies..."
    cd frontend/user-app && npm install && cd ../..
fi

# Admin App dependencies
if [ ! -d "frontend/admin-app/node_modules" ]; then
    echo "Installing admin app dependencies..."
    cd frontend/admin-app && npm install && cd ../..
fi

echo "✅ Dependencies installed."

# Check if .env file exists
if [ ! -f "backend/.env" ]; then
    echo "⚠️  .env file not found. Copying from .env.example..."
    cp backend/.env.example backend/.env
    echo "📝 Please edit backend/.env with your database credentials before starting the servers."
    echo "Press any key to continue..."
    read -n 1 -s
fi

# Start all services
echo "🚀 Starting all services..."

# Start backend server
echo "Starting backend server on port 5000..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start user app
echo "Starting user app on port 3000..."
cd frontend/user-app
BROWSER=none npm start &
USER_APP_PID=$!
cd ../..

# Wait a moment
sleep 2

# Start admin app
echo "Starting admin app on port 3001..."
cd frontend/admin-app
BROWSER=none PORT=3001 npm start &
ADMIN_APP_PID=$!
cd ../..

echo ""
echo "🎉 All services started successfully!"
echo ""
echo "📱 Access your applications:"
echo "   👤 User App:  http://localhost:3000"
echo "   🔧 Admin App: http://localhost:3001"
echo "   🔌 API Server: http://localhost:5000"
echo ""
echo "🔑 Default admin credentials:"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "Press Ctrl+C to stop all services..."

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping all services..."
    kill $BACKEND_PID 2>/dev/null
    kill $USER_APP_PID 2>/dev/null
    kill $ADMIN_APP_PID 2>/dev/null
    echo "✅ All services stopped."
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for user to stop the script
wait