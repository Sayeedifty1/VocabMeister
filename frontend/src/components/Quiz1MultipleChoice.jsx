import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

const Quiz1MultipleChoice = ({ quizLength, onQuizComplete }) => {
  const { user } = useAuth()
  const [question, setQuestion] = useState(null)
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1)
  const [totalQuestions, setTotalQuestions] = useState(quizLength)
  const [correctAnswers, setCorrectAnswers] = useState(0)

  useEffect(() => {
    setTotalQuestions(quizLength)
    if (user) {
      loadNextQuestion()
    }
  }, [quizLength, user])

  const loadNextQuestion = async () => {
    if (!user) {
      setError('Please log in to start the quiz')
      return
    }

    setLoading(true)
    setQuestion(null)
    setSelectedAnswer('')
    setResult(null)
    setError('')

    try {
      const response = await fetch('/api/quiz/next', {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setQuestion(data.question)
      } else if (response.status === 401) {
        setError('Please log in to continue')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to load quiz question')
      }
    } catch (error) {
      setError('Network error - please check your connection')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerSubmit = async () => {
    if (!selectedAnswer || !user) return

    setSubmitting(true)

    try {
      const response = await fetch('/api/quiz/answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          vocabId: question.id,
          answer: selectedAnswer,
          questionType: question.questionType
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setResult(data)
        
        if (data.isCorrect) {
          setCorrectAnswers(prev => prev + 1)
        }
      } else if (response.status === 401) {
        setError('Please log in to continue')
      } else {
        setError('Failed to submit answer')
      }
    } catch (error) {
      setError('Network error - please check your connection')
    } finally {
      setSubmitting(false)
    }
  }

  const handleNextQuestion = async () => {
    if (currentQuestionNumber >= totalQuestions) {
      // Quiz completed
      const score = Math.round((correctAnswers / totalQuestions) * 100)
      const results = {
        totalQuestions,
        correctAnswers,
        score,
        completedAt: new Date().toLocaleString()
      }
      onQuizComplete(results)
    } else {
      setCurrentQuestionNumber(prev => prev + 1)
      await loadNextQuestion()
    }
  }

  // Show authentication error
  if (!user) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Authentication Required:</p>
          <p>Please log in to access the quiz.</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
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
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
          {error.includes('log in') && (
            <button
              onClick={() => window.location.href = '/login'}
              className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              Go to Login
            </button>
          )}
        </div>
      </div>
    )
  }

  if (!question) {
    return null
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow-lg rounded-lg p-8">
        {/* Quiz Progress */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">
              Question {currentQuestionNumber} of {totalQuestions}
            </span>
            <span className="text-sm font-medium text-gray-600">
              Score: {correctAnswers}/{currentQuestionNumber - 1}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentQuestionNumber - 1) / totalQuestions * 100}%` }}
            ></div>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Vocabulary Quiz
        </h1>

        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              What is the {question.questionType === 'english' ? 'English' : 'Bengali'} translation for:
            </h2>
            <div className="text-3xl font-bold text-blue-600">
              {question.german}
            </div>
          </div>

          {!result && (
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-gray-700">Select your answer:</h3>
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedAnswer(option)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${
                    selectedAnswer === option
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {result && (
            <div className={`p-4 rounded-lg ${
              result.isCorrect 
                ? 'bg-green-100 border border-green-400' 
                : 'bg-red-100 border border-red-400'
            }`}>
              <div className="text-center">
                <div className={`text-2xl font-bold mb-2 ${
                  result.isCorrect ? 'text-green-800' : 'text-red-800'
                }`}>
                  {result.isCorrect ? '✅ Correct!' : '❌ Incorrect!'}
                </div>
                <p className={`text-lg ${
                  result.isCorrect ? 'text-green-700' : 'text-red-700'
                }`}>
                  {result.message}
                </p>
                {!result.isCorrect && (
                  <p className="text-red-600 mt-2">
                    Correct answer: <span className="font-semibold">{result.correctAnswer}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-center space-x-4">
            {!result && (
              <button
                onClick={handleAnswerSubmit}
                disabled={!selectedAnswer || submitting}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {submitting ? 'Checking...' : 'Submit Answer'}
              </button>
            )}
            
            {result && (
              <button
                onClick={handleNextQuestion}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                {currentQuestionNumber >= totalQuestions ? 'Finish Quiz' : 'Next Question'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Quiz1MultipleChoice 