# Vocabulary Learning App

A full-stack vocabulary learning application built with React, Node.js, Express, Prisma, and MongoDB. The app allows users to upload German vocabulary with English and Bengali translations, take quizzes, and track their learning progress.

## Features

- **User Authentication**: Simple login/register system with session-based authentication
- **Vocabulary Upload**: Bulk upload vocabulary in the format: `German - English - Bengali`
- **Vocabulary Table**: View all uploaded vocabulary with mistake tracking
- **Interactive Quiz**: Test your knowledge with random questions
- **Progress Tracking**: View statistics and most mistaken words
- **Responsive Design**: Modern UI built with Tailwind CSS

## Tech Stack

### Frontend
- React 18 with Vite
- Tailwind CSS for styling
- React Router for navigation
- Native fetch API for HTTP requests

### Backend
- Node.js with Express.js
- Prisma ORM for database operations
- MongoDB as the database
- Session-based authentication
- bcryptjs for password hashing

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## Setup Instructions

### 1. Clone the repository
```bash
git clone <repository-url>
cd vocabulary-app
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
echo "DATABASE_URL=\"mongodb://localhost:27017/vocabulary-app\"
SESSION_SECRET=\"your-super-secret-session-key-change-this-in-production\"
PORT=5000" > .env

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Start the development server
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

### 4. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user info

### Vocabulary
- `POST /api/vocab/upload` - Upload vocabulary (bulk)
- `GET /api/vocab/list` - Get user's vocabulary list

### Quiz
- `GET /api/quiz/next` - Get next quiz question
- `POST /api/quiz/answer` - Submit quiz answer

### Statistics
- `GET /api/stats` - Get user statistics and progress

## Database Schema

### User Model
```prisma
model User {
  id       String   @id @default(auto()) @map("_id") @db.ObjectId
  username String   @unique
  password String
  vocabs   Vocab[]
}
```

### Vocab Model
```prisma
model Vocab {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  german    String
  english   String
  bengali   String
  userId    String   @db.ObjectId
  user      User     @relation(fields: [userId], references: [id])
  mistakes  Int      @default(0)
  createdAt DateTime @default(now())
}
```

## Usage

1. **Register/Login**: Create an account or login with existing credentials
2. **Upload Vocabulary**: Go to the Upload page and paste vocabulary in the specified format
3. **View Vocabulary**: Check your uploaded words in the Vocabulary table
4. **Take Quizzes**: Test your knowledge with interactive quizzes
5. **Track Progress**: Monitor your learning progress and identify areas for improvement

## Vocabulary Format

Enter vocabulary in the following format (one word per line):
```
Kommen - To come - আসা
Laufen - To run - দৌড়ানো
Essen - To eat - খাওয়া
```

## Development

### Backend Development
```bash
cd backend
npm run dev  # Start with nodemon for auto-reload
npm run db:studio  # Open Prisma Studio for database management
```

### Frontend Development
```bash
cd frontend
npm run dev  # Start Vite development server
npm run build  # Build for production
```

## Environment Variables

Create a `.env` file in the backend directory:

```env
DATABASE_URL="mongodb://localhost:27017/vocabulary-app"
SESSION_SECRET="your-super-secret-session-key-change-this-in-production"
PORT=5000
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License. 