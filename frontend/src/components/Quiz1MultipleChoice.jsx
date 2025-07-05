import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

const Quiz1MultipleChoice = ({ quizLength, onBack }) => {
  const { user } = useAuth()
  const [questions, setQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [isCorrect, setIsCorrect] = useState(null)
  const [score, setScore] = useState(0)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) {
      setError('Please log in to take the quiz')
      setLoading(false)
      return
    }
    fetchQuestions()
  }, [user])

  const fetchQuestions = async () => {
    try {
      const response = await fetch(`/api/quiz/quiz1?length=${quizLength}`, {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setQuestions(data.questions)
      } else {
        setError('Failed to load quiz questions')
      }
    } catch (error) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerSelect = (answer) => {
    if (selectedAnswer !== null) return // Prevent multiple selections
    
    setSelectedAnswer(answer)
    const currentQuestion = questions[currentQuestionIndex]
    const correct = answer === currentQuestion.correctAnswer
    
    setIsCorrect(correct)
    if (correct) {
      setScore(score + 1)
    }

    // Submit answer to backend
    submitAnswer(currentQuestion.id, correct)
  }

  const submitAnswer = async (vocabId, isCorrect) => {
    try {
      await fetch('/api/quiz/quiz1/answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          vocabId,
          isCorrect
        })
      })
    } catch (error) {
      console.error('Failed to submit answer:', error)
    }
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedAnswer(null)
      setIsCorrect(null)
    } else {
      setQuizCompleted(true)
    }
  }

  const handleRestart = () => {
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setIsCorrect(null)
    setScore(0)
    setQuizCompleted(false)
    fetchQuestions()
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto text-center p-6 sm:p-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-yellow-800 mb-4">Login Required</h2>
          <p className="text-yellow-700 mb-6">Please log in to take the quiz and track your progress.</p>
          <button
            onClick={onBack}
            className="bg-yellow-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto text-center p-6 sm:p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading quiz questions...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto text-center p-6 sm:p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-red-800 mb-4">Error</h2>
          <p className="text-red-700 mb-6">{error}</p>
          <button
            onClick={onBack}
            className="bg-red-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg hover:bg-red-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  if (quizCompleted) {
    const percentage = Math.round((score / questions.length) * 100)
    return (
      <div className="max-w-2xl mx-auto text-center p-4 sm:p-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Quiz Completed!</h2>
          
          <div className="mb-6 sm:mb-8">
            <div className="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              {percentage}%
            </div>
            <p className="text-lg sm:text-xl text-gray-600">
              You got {score} out of {questions.length} questions correct
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 sm:mb-8">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl sm:text-3xl font-bold text-green-600">{score}</div>
              <div className="text-sm sm:text-base text-green-700">Correct</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="text-2xl sm:text-3xl font-bold text-red-600">{questions.length - score}</div>
              <div className="text-sm sm:text-base text-red-700">Incorrect</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={handleRestart}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
            >
              Try Again
            </button>
            <button
              onClick={onBack}
              className="bg-gray-200 text-gray-800 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
            >
              Back to Quiz Selection
            </button>
          </div>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm sm:text-base">Back</span>
          </button>
          <div className="text-sm sm:text-base text-gray-600">
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
          <div 
            className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 sm:h-3 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
            What does "{currentQuestion.word}" mean?
          </h2>
        </div>

        {/* Answer Options */}
        <div className="space-y-3 sm:space-y-4">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(option)}
              disabled={selectedAnswer !== null}
              className={`w-full p-4 sm:p-6 rounded-xl border-2 text-left transition-all duration-300 ${
                selectedAnswer === null
                  ? 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                  : selectedAnswer === option
                  ? option === currentQuestion.correctAnswer
                    ? 'border-green-500 bg-green-50 text-green-800'
                    : 'border-red-500 bg-red-50 text-red-800'
                  : option === currentQuestion.correctAnswer
                  ? 'border-green-500 bg-green-50 text-green-800'
                  : 'border-gray-200 bg-gray-50 text-gray-600'
              }`}
            >
              <div className="flex items-center">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 flex items-center justify-center mr-3 sm:mr-4 ${
                  selectedAnswer === null
                    ? 'border-gray-300 text-gray-600'
                    : selectedAnswer === option
                    ? option === currentQuestion.correctAnswer
                      ? 'border-green-500 bg-green-500 text-white'
                      : 'border-red-500 bg-red-500 text-white'
                    : option === currentQuestion.correctAnswer
                    ? 'border-green-500 bg-green-500 text-white'
                    : 'border-gray-300 text-gray-600'
                }`}>
                  {selectedAnswer === null ? (
                    <span className="text-sm sm:text-base font-semibold">{String.fromCharCode(65 + index)}</span>
                  ) : selectedAnswer === option ? (
                    option === currentQuestion.correctAnswer ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    )
                  ) : option === currentQuestion.correctAnswer ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span className="text-sm sm:text-base font-semibold">{String.fromCharCode(65 + index)}</span>
                  )}
                </div>
                <span className="text-sm sm:text-base font-medium">{option}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Feedback */}
        {selectedAnswer !== null && (
          <div className={`mt-6 sm:mt-8 p-4 sm:p-6 rounded-xl ${
            isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center mb-2">
              {isCorrect ? (
                <svg className="w-6 h-6 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-red-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              <span className={`font-semibold text-sm sm:text-base ${
                isCorrect ? 'text-green-800' : 'text-red-800'
              }`}>
                {isCorrect ? 'Correct!' : 'Incorrect!'}
              </span>
            </div>
            <p className={`text-sm sm:text-base ${
              isCorrect ? 'text-green-700' : 'text-red-700'
            }`}>
              {isCorrect 
                ? `Great job! "${currentQuestion.word}" means "${currentQuestion.correctAnswer}"`
                : `The correct answer is "${currentQuestion.correctAnswer}". "${currentQuestion.word}" means "${currentQuestion.correctAnswer}"`
              }
            </p>
          </div>
        )}

        {/* Next Button */}
        {selectedAnswer !== null && (
          <div className="mt-6 sm:mt-8 text-center">
            <button
              onClick={handleNext}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 sm:px-12 py-3 sm:py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
            >
              {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Quiz1MultipleChoice 