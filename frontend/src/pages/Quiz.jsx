import { useState, useEffect } from 'react'
import Quiz1MultipleChoice from '../components/Quiz1MultipleChoice'
import Quiz2Swipe from '../components/Quiz2Swipe'
import { useAuth } from '../contexts/AuthContext'

const Quiz = () => {
  const { user } = useAuth ? useAuth() : { user: null }
  const [selectedQuiz, setSelectedQuiz] = useState('')
  const [quizLength, setQuizLength] = useState(10)
  const [quizStarted, setQuizStarted] = useState(false)
  const [sections, setSections] = useState([])
  const [selectedSection, setSelectedSection] = useState('')
  const [loadingSections, setLoadingSections] = useState(true)
  const [sectionError, setSectionError] = useState('')

  useEffect(() => {
    const fetchSections = async () => {
      setLoadingSections(true)
      setSectionError('')
      try {
        const localUser = user || JSON.parse(localStorage.getItem('user'))
        if (!localUser || !localUser.id) {
          setSectionError('Please log in to view your sections.')
          setLoadingSections(false)
          return
        }
        const res = await fetch(`/api/vocab/sections?userId=${localUser.id}`)
        if (res.ok) {
          const data = await res.json()
          setSections(data.sections)
        } else {
          setSectionError('Failed to load sections.')
        }
      } catch (e) {
        setSectionError('Network error.')
      } finally {
        setLoadingSections(false)
      }
    }
    fetchSections()
  }, [user])

  const handleStartQuiz = () => {
    if (selectedQuiz && selectedSection) {
      setQuizStarted(true)
    }
  }

  const handleBackToSelection = () => {
    setQuizStarted(false)
    setSelectedQuiz('')
  }

  if (quizStarted) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {selectedQuiz === 'quiz1' ? (
          <Quiz1MultipleChoice 
            quizLength={quizLength} 
            section={selectedSection}
            onBack={handleBackToSelection}
          />
        ) : (
          <Quiz2Swipe 
            quizLength={quizLength} 
            section={selectedSection}
            onBack={handleBackToSelection}
          />
        )}
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Choose Your Quiz
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
          Select your preferred quiz type and challenge yourself with vocabulary practice
        </p>
      </div>

      {/* Section Selection */}
      <div className="mb-8 sm:mb-12">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 text-center">Choose Section</h3>
        {loadingSections ? (
          <div className="text-center text-gray-500">Loading sections...</div>
        ) : sectionError ? (
          <div className="text-center text-red-500">{sectionError}</div>
        ) : sections.length === 0 ? (
          <div className="text-center text-gray-500">No sections found. Please upload vocabulary with sections.</div>
        ) : (
          <div className="flex flex-wrap justify-center gap-3">
            {sections.map(section => (
              <button
                key={section}
                onClick={() => setSelectedSection(section)}
                className={`px-5 py-2 rounded-xl border-2 font-semibold transition-all duration-200 ${
                  selectedSection === section
                    ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-md'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-purple-300 hover:bg-purple-50'
                }`}
              >
                {section}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quiz Type Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
        {/* Quiz 1 Card */}
        <div className={`relative p-6 sm:p-8 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
          selectedQuiz === 'quiz1' 
            ? 'border-blue-500 bg-blue-50 shadow-lg scale-105' 
            : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
        }`} onClick={() => setSelectedQuiz('quiz1')}>
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Quiz 1</h3>
              <p className="text-sm sm:text-base text-gray-600">Multiple Choice</p>
            </div>
          </div>
          <p className="text-sm sm:text-base text-gray-600 mb-4">
            Traditional multiple choice quiz with 4 options. Test your vocabulary knowledge with carefully crafted questions.
          </p>
          <ul className="text-sm text-gray-600 space-y-1 mb-4">
            <li className="flex items-center">
              <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Multiple choice questions
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Immediate feedback
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Detailed mistake tracking
            </li>
          </ul>
          {selectedQuiz === 'quiz1' && (
            <div className="absolute top-4 right-4">
              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>

        {/* Quiz 2 Card */}
        <div className={`relative p-6 sm:p-8 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
          selectedQuiz === 'quiz2' 
            ? 'border-purple-500 bg-purple-50 shadow-lg scale-105' 
            : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
        }`} onClick={() => setSelectedQuiz('quiz2')}>
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center mr-4">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Quiz 2</h3>
              <p className="text-sm sm:text-base text-gray-600">Swipe Game</p>
            </div>
          </div>
          <p className="text-sm sm:text-base text-gray-600 mb-4">
            Interactive swipe game. Swipe right if you know the word, left if you don't. Perfect for quick vocabulary review.
          </p>
          <ul className="text-sm text-gray-600 space-y-1 mb-4">
            <li className="flex items-center">
              <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Swipe gestures
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Quick review mode
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Unknown word tracking
            </li>
          </ul>
          {selectedQuiz === 'quiz2' && (
            <div className="absolute top-4 right-4">
              <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Quiz Length Selection */}
      {selectedQuiz && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200 mb-8">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 text-center">
            Choose Quiz Length
          </h3>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 max-w-md mx-auto">
            <button
              onClick={() => setQuizLength(10)}
              className={`p-4 sm:p-6 rounded-xl border-2 transition-all duration-300 ${
                quizLength === 10
                  ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                  : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold mb-2">10</div>
                <div className="text-sm sm:text-base">Questions</div>
              </div>
            </button>
            <button
              onClick={() => setQuizLength(15)}
              className={`p-4 sm:p-6 rounded-xl border-2 transition-all duration-300 ${
                quizLength === 15
                  ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                  : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold mb-2">15</div>
                <div className="text-sm sm:text-base">Questions</div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Start Button */}
      {selectedQuiz && selectedSection && (
        <div className="text-center">
          <button
            onClick={handleStartQuiz}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 sm:px-12 py-3 sm:py-4 rounded-xl text-lg sm:text-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            Start {selectedQuiz === 'quiz1' ? 'Quiz 1' : 'Quiz 2'} ({quizLength} questions)
          </button>
        </div>
      )}
    </div>
  )
}

export default Quiz 