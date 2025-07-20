import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import VocabularyUpload from './pages/VocabularyUpload'
import VocabularyTable from './pages/VocabularyTable'
import Quiz from './pages/Quiz'
import Stats from './pages/Stats'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="vocabulary/upload" 
            element={
              <ProtectedRoute>
                <div className="container mx-auto px-4 py-8">
                  <VocabularyUpload />
                </div>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/vocabulary/table" 
            element={
              <ProtectedRoute>
                <div className="container mx-auto px-4 py-8">
                  <VocabularyTable />
                </div>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/quiz" 
            element={
              <ProtectedRoute>
                <div className="container mx-auto px-4 py-8">
                  <Quiz />
                </div>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/stats" 
            element={
              <ProtectedRoute>
                <div className="container mx-auto px-4 py-8">
                  <Stats />
                </div>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </AuthProvider>
  )
}

export default App 