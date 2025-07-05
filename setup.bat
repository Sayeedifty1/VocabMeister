@echo off
echo 🚀 Setting up Vocabulary Learning App...

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

echo 📦 Installing backend dependencies...
cd backend
call npm install

echo 🔧 Setting up environment variables...
if not exist .env (
    echo DATABASE_URL="mongodb://localhost:27017/vocabulary-app" > .env
    echo SESSION_SECRET="your-super-secret-session-key-change-this-in-production" >> .env
    echo PORT=5000 >> .env
    echo ✅ Created .env file
) else (
    echo ✅ .env file already exists
)

echo 🗄️ Setting up database...
call npm run db:generate
call npm run db:push

echo 📦 Installing frontend dependencies...
cd ..\frontend
call npm install

echo ✅ Setup complete!
echo.
echo 🎯 To start the application:
echo 1. Start MongoDB (if not already running)
echo 2. Start backend: cd backend ^&^& npm run dev
echo 3. Start frontend: cd frontend ^&^& npm run dev
echo.
echo 🌐 Access the app at: http://localhost:5173
pause 