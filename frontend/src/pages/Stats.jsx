import { useState, useEffect } from 'react'

const Stats = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Get user from localStorage
      const user = JSON.parse(localStorage.getItem('user'));
      
      if (!user || !user.id) {
        setError('User not found. Please log in again.');
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/stats?userId=${user.id}`, {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        setError('Failed to load statistics')
      }
    } catch (error) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    )
  }

  // Calculate combined statistics
  const totalMistakes = (stats.totalQuiz1Mistakes || 0) + (stats.totalQuiz2UnknownCount || 0)
  const totalAttempts = (stats.totalQuiz1Attempts || 0) + (stats.totalQuiz2Attempts || 0)
  const overallSuccessRate = totalAttempts > 0 ? (((stats.totalQuiz1CorrectAnswers || 0) + (stats.totalQuiz2KnownCount || 0)) / totalAttempts * 100).toFixed(2) : 0

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 rounded-full bg-blue-100">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-500">Total Vocabulary</p>
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">{stats.totalVocabs}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 rounded-full bg-red-100">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-500">Total Mistakes</p>
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">{totalMistakes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 rounded-full bg-green-100">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-500">Overall Success Rate</p>
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">{overallSuccessRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 rounded-full bg-purple-100">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-500">Total Practice</p>
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">{stats.totalPracticeCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Combined Mistakes Overview */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Combined Mistakes Overview</h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Total mistakes from both Quiz 1 and Quiz 2 combined</p>
        </div>
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="text-center p-3 sm:p-4 bg-red-50 rounded-lg">
              <p className="text-2xl sm:text-3xl font-bold text-red-600">{totalMistakes}</p>
              <p className="text-sm text-gray-600">Total Mistakes</p>
              <p className="text-xs text-gray-500 mt-1">
                Quiz 1: {stats.totalQuiz1Mistakes || 0} | Quiz 2: {stats.totalQuiz2UnknownCount || 0}
              </p>
            </div>
            <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl sm:text-3xl font-bold text-blue-600">{totalAttempts}</p>
              <p className="text-sm text-gray-600">Total Attempts</p>
              <p className="text-xs text-gray-500 mt-1">
                Quiz 1: {stats.totalQuiz1Attempts || 0} | Quiz 2: {stats.totalQuiz2Attempts || 0}
              </p>
            </div>
            <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg">
              <p className="text-2xl sm:text-3xl font-bold text-green-600">{overallSuccessRate}%</p>
              <p className="text-sm text-gray-600">Overall Success Rate</p>
              <p className="text-xs text-gray-500 mt-1">
                Combined performance across both quizzes
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz 1 Statistics */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Quiz 1 Statistics (Multiple Choice)</h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Performance in the traditional multiple choice quiz</p>
        </div>
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="text-center">
              <p className="text-lg sm:text-2xl font-bold text-blue-600">{stats.totalQuiz1Attempts || 0}</p>
              <p className="text-xs sm:text-sm text-gray-500">Total Attempts</p>
            </div>
            <div className="text-center">
              <p className="text-lg sm:text-2xl font-bold text-green-600">{stats.totalQuiz1CorrectAnswers || 0}</p>
              <p className="text-xs sm:text-sm text-gray-500">Correct Answers</p>
            </div>
            <div className="text-center">
              <p className="text-lg sm:text-2xl font-bold text-red-600">{stats.totalQuiz1Mistakes || 0}</p>
              <p className="text-xs sm:text-sm text-gray-500">Mistakes</p>
            </div>
            <div className="text-center">
              <p className="text-lg sm:text-2xl font-bold text-purple-600">{stats.wordsWithQuiz1Mistakes || 0}</p>
              <p className="text-xs sm:text-sm text-gray-500">Words with Mistakes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz 2 Statistics */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Quiz 2 Statistics (Swipe Game)</h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Performance in the swipe-based vocabulary review</p>
        </div>
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="text-center">
              <p className="text-lg sm:text-2xl font-bold text-blue-600">{stats.totalQuiz2Attempts || 0}</p>
              <p className="text-xs sm:text-sm text-gray-500">Total Attempts</p>
            </div>
            <div className="text-center">
              <p className="text-lg sm:text-2xl font-bold text-green-600">{stats.totalQuiz2KnownCount || 0}</p>
              <p className="text-xs sm:text-sm text-gray-500">Known Words</p>
            </div>
            <div className="text-center">
              <p className="text-lg sm:text-2xl font-bold text-red-600">{stats.totalQuiz2UnknownCount || 0}</p>
              <p className="text-xs sm:text-sm text-gray-500">Unknown Words</p>
            </div>
            <div className="text-center">
              <p className="text-lg sm:text-2xl font-bold text-orange-600">{stats.wordsWithQuiz2Unknown || 0}</p>
              <p className="text-xs sm:text-sm text-gray-500">Words Marked Unknown</p>
            </div>
          </div>
        </div>
      </div>

      {/* Learning Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Learning Tips</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-3 sm:p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Quiz 1 Strategy</h4>
            <p className="text-sm text-gray-600">
              Use Quiz 1 for active recall practice. Focus on words with high mistake counts to improve retention. 
              Your success rate is {stats.quiz1SuccessRate || 0}% - keep practicing to improve!
            </p>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Quiz 2 Strategy</h4>
            <p className="text-sm text-gray-600">
              Use Quiz 2 for quick vocabulary review. Mark unknown words to track what you need to study more. 
              Your success rate is {stats.quiz2SuccessRate || 0}% - focus on unknown words!
            </p>
          </div>
        </div>
      </div>

      {/* Progress Insights */}
      <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Progress Insights</h3>
        <div className="space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 rounded-lg">
            <div className="mb-2 sm:mb-0">
              <p className="font-medium text-gray-900 text-sm sm:text-base">Average Quiz 1 Mistakes per Word</p>
              <p className="text-xs sm:text-sm text-gray-500">How many mistakes you make on average per word in Quiz 1</p>
            </div>
            <span className="text-xl sm:text-2xl font-bold text-red-600">{stats.averageQuiz1Mistakes || 0}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 rounded-lg">
            <div className="mb-2 sm:mb-0">
              <p className="font-medium text-gray-900 text-sm sm:text-base">Average Quiz 2 Unknown Marks per Word</p>
              <p className="text-xs sm:text-sm text-gray-500">How many times you mark words as unknown on average in Quiz 2</p>
            </div>
            <span className="text-xl sm:text-2xl font-bold text-orange-600">{stats.averageQuiz2Unknown || 0}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 rounded-lg">
            <div className="mb-2 sm:mb-0">
              <p className="font-medium text-gray-900 text-sm sm:text-base">Combined Mistakes per Word</p>
              <p className="text-xs sm:text-sm text-gray-500">Average mistakes across both quiz types per word</p>
            </div>
            <span className="text-xl sm:text-2xl font-bold text-purple-600">
              {stats.totalVocabs > 0 ? (totalMistakes / stats.totalVocabs).toFixed(2) : 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Stats 