#!/bin/bash

echo "🚀 Setting up Vocabulary Learning App..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if MongoDB is running (optional check)
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB not found. Make sure MongoDB is installed and running."
fi

echo "📦 Installing backend dependencies..."
cd backend
npm install

echo "🔧 Setting up environment variables..."
if [ ! -f .env ]; then
    cat > .env << EOF
DATABASE_URL="mongodb://localhost:27017/vocabulary-app"
SESSION_SECRET="your-super-secret-session-key-change-this-in-production"
PORT=5000
EOF
    echo "✅ Created .env file"
else
    echo "✅ .env file already exists"
fi

echo "🗄️  Setting up database..."
npm run db:generate
npm run db:push

echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

echo "✅ Setup complete!"
echo ""
echo "🎯 To start the application:"
echo "1. Start MongoDB (if not already running)"
echo "2. Start backend: cd backend && npm run dev"
echo "3. Start frontend: cd frontend && npm run dev"
echo ""
echo "🌐 Access the app at: http://localhost:5173" 