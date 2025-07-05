import { useState } from 'react'
import Quiz1MultipleChoice from '../components/Quiz1MultipleChoice'
import Quiz2Swipe from '../components/Quiz2Swipe'

const Quiz = () => {
  const [quizType, setQuizType] = useState('')
  const [quizLength, setQuizLength] = useState(null)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [quizResults, setQuizResults] = useState(null)

  const handleQuizTypeSelect = (type) => {
    setQuizType(type)
    setQuizLength(null)
    setQuizCompleted(false)
    setQuizResults(null)
  }

  const handleQuizLengthSelect = (length) => {
    setQuizLength(length)
  }

  const handleQuizComplete = (results) => {
    setQuizResults(results)
    setQuizCompleted(true)
  }

  const startNewQuiz = () => {
    setQuizType('')
    setQuizLength(null)
    setQuizCompleted(false)
    setQuizResults(null)
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
              className="w-full p-6 text-left border-2 border-blue-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Quiz 2</h3>
              <p className="text-gray-600">Swipe game - mark words as known or unknown</p>
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
              <h3 className="text-xl font-semibold text-gray-900 mb-2">10 Words</h3>
              <p className="text-gray-600">Quick session - perfect for a short study break</p>
            </button>
            
            <button
              onClick={() => handleQuizLengthSelect(15)}
              className="w-full p-6 text-left border-2 border-blue-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">15 Words</h3>
              <p className="text-gray-600">Extended session - more comprehensive review</p>
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
            {quizType === 'quiz1' ? (
              <>
                <div className="text-6xl font-bold text-blue-600">
                  {quizResults.score}%
                </div>
                <div className="text-xl text-gray-600">
                  You got {quizResults.correctAnswers} out of {quizResults.totalQuestions} questions correct!
                </div>
              </>
            ) : (
              <>
                <div className="text-4xl font-bold text-blue-600 mb-4">
                  Great Job!
                </div>
                <div className="text-xl text-gray-600">
                  You reviewed {quizResults.totalQuestions} words
                </div>
                <div className="grid grid-cols-2 gap-4 text-lg">
                  <div className="bg-green-100 p-4 rounded-lg">
                    <div className="font-bold text-green-800">{quizResults.knownWords}</div>
                    <div className="text-green-600">Known</div>
                  </div>
                  <div className="bg-red-100 p-4 rounded-lg">
                    <div className="font-bold text-red-800">{quizResults.unknownWords}</div>
                    <div className="text-red-600">Unknown</div>
                  </div>
                </div>
              </>
            )}
            
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold">Total Words:</span> {quizResults.totalQuestions}
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

  // Render the appropriate quiz component
  if (quizType === 'quiz1') {
    return <Quiz1MultipleChoice quizLength={quizLength} onQuizComplete={handleQuizComplete} />
  }

  if (quizType === 'quiz2') {
    return <Quiz2Swipe quizLength={quizLength} onQuizComplete={handleQuizComplete} />
  }

  return null
}

export default Quiz 