@echo off
echo 🚀 Starting AddressBook Full-Stack Application...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js v14 or higher.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm.
    pause
    exit /b 1
)

echo ✅ Prerequisites check completed.

REM Install dependencies if node_modules don't exist
echo 📦 Installing dependencies...

REM Backend dependencies
if not exist "backend\node_modules" (
    echo Installing backend dependencies...
    cd backend
    npm install
    cd ..
)

REM User App dependencies
if not exist "frontend\user-app\node_modules" (
    echo Installing user app dependencies...
    cd frontend\user-app
    npm install
    cd ..\..
)

REM Admin App dependencies
if not exist "frontend\admin-app\node_modules" (
    echo Installing admin app dependencies...
    cd frontend\admin-app
    npm install
    cd ..\..
)

echo ✅ Dependencies installed.

REM Check if .env file exists
if not exist "backend\.env" (
    echo ⚠️  .env file not found. Copying from .env.example...
    copy "backend\.env.example" "backend\.env"
    echo 📝 Please edit backend\.env with your database credentials before starting the servers.
    pause
)

REM Start all services
echo 🚀 Starting all services...

REM Start backend server
echo Starting backend server on port 5000...
cd backend
start "Backend Server" cmd /k "npm run dev"
cd ..

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start user app
echo Starting user app on port 3000...
cd frontend\user-app
start "User App" cmd /k "set BROWSER=none && npm start"
cd ..\..

REM Wait a moment
timeout /t 2 /nobreak >nul

REM Start admin app
echo Starting admin app on port 3001...
cd frontend\admin-app
start "Admin App" cmd /k "set BROWSER=none && set PORT=3001 && npm start"
cd ..\..

echo.
echo 🎉 All services started successfully!
echo.
echo 📱 Access your applications:
echo    👤 User App:  http://localhost:3000
echo    🔧 Admin App: http://localhost:3001
echo    🔌 API Server: http://localhost:5000
echo.
echo 🔑 Default admin credentials:
echo    Username: admin
echo    Password: admin123
echo.
echo Press any key to exit...
pause >nul