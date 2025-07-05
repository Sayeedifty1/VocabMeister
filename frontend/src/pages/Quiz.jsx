import { useState, useEffect } from 'react'

const Quiz = () => {
  const [quizType, setQuizType] = useState('')
  const [quizLength, setQuizLength] = useState(null)
  const [question, setQuestion] = useState(null)
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [quizResults, setQuizResults] = useState(null)

  const handleQuizTypeSelect = (type) => {
    setQuizType(type)
    setQuizLength(null)
    setQuestion(null)
    setResult(null)
    setCurrentQuestionNumber(0)
    setCorrectAnswers(0)
    setQuizCompleted(false)
    setQuizResults(null)
  }

  const handleQuizLengthSelect = async (length) => {
    setQuizLength(length)
    setTotalQuestions(length)
    setCurrentQuestionNumber(1)
    await loadNextQuestion()
  }

  const loadNextQuestion = async () => {
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
      } else {
        const errorData = await response.json()
        setError(errorData.error)
      }
    } catch (error) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerSubmit = async () => {
    if (!selectedAnswer) return

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

      const data = await response.json()
      setResult(data)
      
      if (data.isCorrect) {
        setCorrectAnswers(prev => prev + 1)
      }
    } catch (error) {
      setError('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleNextQuestion = async () => {
    if (currentQuestionNumber >= totalQuestions) {
      // Quiz completed
      const score = Math.round((correctAnswers / totalQuestions) * 100)
      setQuizResults({
        totalQuestions,
        correctAnswers,
        score,
        completedAt: new Date().toLocaleString()
      })
      setQuizCompleted(true)
    } else {
      setCurrentQuestionNumber(prev => prev + 1)
      await loadNextQuestion()
    }
  }

  const startNewQuiz = () => {
    setQuizType('')
    setQuizLength(null)
    setQuestion(null)
    setResult(null)
    setCurrentQuestionNumber(0)
    setTotalQuestions(0)
    setCorrectAnswers(0)
    setQuizCompleted(false)
    setQuizResults(null)
    setError('')
  }

  // Quiz type selection screen
  if (!quizType) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Choose Quiz Type
          </h1>
          
          <div className="space-y-4">
            <button
              onClick={() => handleQuizTypeSelect('quiz1')}
              className="w-full p-6 text-left border-2 border-blue-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Quiz 1</h3>
              <p className="text-gray-600">Standard vocabulary quiz with multiple choice questions</p>
            </button>
            
            <button
              onClick={() => handleQuizTypeSelect('quiz2')}
              className="w-full p-6 text-left border-2 border-gray-200 rounded-lg hover:border-gray-500 hover:bg-gray-50 transition-all duration-200 opacity-50 cursor-not-allowed"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Quiz 2</h3>
              <p className="text-gray-600">Coming soon...</p>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Quiz length selection screen
  if (quizType && !quizLength) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Select Quiz Length
          </h1>
          
          <div className="space-y-4">
            <button
              onClick={() => handleQuizLengthSelect(10)}
              className="w-full p-6 text-left border-2 border-blue-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">10 Questions</h3>
              <p className="text-gray-600">Quick quiz - perfect for a short study session</p>
            </button>
            
            <button
              onClick={() => handleQuizLengthSelect(15)}
              className="w-full p-6 text-left border-2 border-blue-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">15 Questions</h3>
              <p className="text-gray-600">Extended quiz - more comprehensive practice</p>
            </button>
          </div>
          
          <button
            onClick={startNewQuiz}
            className="mt-6 w-full bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition-colors"
          >
            Back to Quiz Selection
          </button>
        </div>
      </div>
    )
  }

  // Quiz completed screen
  if (quizCompleted && quizResults) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Quiz Completed!
          </h1>
          
          <div className="text-center space-y-6">
            <div className="text-6xl font-bold text-blue-600">
              {quizResults.score}%
            </div>
            
            <div className="text-xl text-gray-600">
              You got {quizResults.correctAnswers} out of {quizResults.totalQuestions} questions correct!
            </div>
            
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold">Total Questions:</span> {quizResults.totalQuestions}
                </div>
                <div>
                  <span className="font-semibold">Correct Answers:</span> {quizResults.correctAnswers}
                </div>
                <div>
                  <span className="font-semibold">Score:</span> {quizResults.score}%
                </div>
                <div>
                  <span className="font-semibold">Completed:</span> {quizResults.completedAt}
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={startNewQuiz}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-semibold"
              >
                Start New Quiz
              </button>
              
              <button
                onClick={() => window.location.href = '/vocabulary'}
                className="w-full bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700 transition-colors"
              >
                View Vocabulary
              </button>
            </div>
          </div>
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
          <button
            onClick={startNewQuiz}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
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

        {question && (
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
        )}
      </div>
    </div>
  )
}

export default Quiz 