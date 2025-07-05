import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

const Quiz2Swipe = ({ quizLength, onQuizComplete }) => {
  const { user } = useAuth()
  const [currentCard, setCurrentCard] = useState(null)
  const [showMeaning, setShowMeaning] = useState(false)
  const [swipedWords, setSwipedWords] = useState([])
  const [unknownWords, setUnknownWords] = useState([])
  const [cardPosition, setCardPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1)
  const [totalQuestions, setTotalQuestions] = useState(quizLength)

  useEffect(() => {
    setTotalQuestions(quizLength)
    if (user) {
      loadNextCard()
    }
  }, [quizLength, user])

  const loadNextCard = async () => {
    if (!user) {
      setError('Please log in to start the quiz')
      return
    }

    setLoading(true)
    setCurrentCard(null)
    setShowMeaning(false)
    setCardPosition({ x: 0, y: 0 })
    setError('')

    try {
      const response = await fetch('/api/quiz/next-card', {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setCurrentCard(data.card)
      } else if (response.status === 401) {
        setError('Please log in to continue')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to load quiz card')
      }
    } catch (error) {
      setError('Network error - please check your connection')
    } finally {
      setLoading(false)
    }
  }

  const handleSwipe = async (direction) => {
    if (!currentCard || !user) return

    const isKnown = direction === 'left' // left = known, right = unknown
    
    // Add to swiped words to prevent repetition
    setSwipedWords(prev => [...prev, currentCard.id])
    
    // Track the word as known or unknown
    try {
      const endpoint = isKnown ? '/api/quiz/mark-known' : '/api/quiz/mark-unknown'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          vocabId: currentCard.id
        }),
      })

      if (!response.ok && response.status !== 401) {
        console.error(`Failed to mark word as ${isKnown ? 'known' : 'unknown'}`)
      }
    } catch (error) {
      console.error(`Failed to mark word as ${isKnown ? 'known' : 'unknown'}:`, error)
    }
    
    // If unknown, add to unknown words list and show meaning
    if (!isKnown) {
      setUnknownWords(prev => [...prev, currentCard])
      setShowMeaning(true)
      
      // Wait a bit to show meaning if unknown
      setTimeout(() => {
        handleNextCard()
      }, 2000)
    } else {
      handleNextCard()
    }
  }

  const handleNextCard = async () => {
    if (currentQuestionNumber >= totalQuestions) {
      // Quiz completed
      const results = {
        totalQuestions,
        unknownWords: unknownWords.length,
        knownWords: totalQuestions - unknownWords.length,
        completedAt: new Date().toLocaleString()
      }
      onQuizComplete(results)
    } else {
      setCurrentQuestionNumber(prev => prev + 1)
      await loadNextCard()
    }
  }

  // Touch/Mouse handlers for swipe
  const handleTouchStart = (e) => {
    const touch = e.touches[0] || e
    setDragStart({ x: touch.clientX, y: touch.clientY })
    setIsDragging(true)
  }

  const handleTouchMove = (e) => {
    if (!isDragging) return
    e.preventDefault()
    
    const touch = e.touches[0] || e
    const deltaX = touch.clientX - dragStart.x
    const deltaY = touch.clientY - dragStart.y
    
    setCardPosition({ x: deltaX, y: deltaY })
  }

  const handleTouchEnd = () => {
    if (!isDragging) return
    setIsDragging(false)
    
    const threshold = 100
    if (Math.abs(cardPosition.x) > threshold) {
      if (cardPosition.x > 0) {
        handleSwipe('right') // unknown
      } else {
        handleSwipe('left') // known
      }
    } else {
      setCardPosition({ x: 0, y: 0 })
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

  if (!currentCard) {
    return null
  }

  return (
    <div className="max-w-md mx-auto">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-600">
            Word {currentQuestionNumber} of {totalQuestions}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentQuestionNumber - 1) / totalQuestions * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Swipe Card */}
      <div className="relative">
        <div
          className={`bg-white rounded-xl shadow-lg p-8 text-center cursor-grab active:cursor-grabbing transition-transform duration-200 ${
            isDragging ? 'scale-105' : ''
          }`}
          style={{
            transform: `translate(${cardPosition.x}px, ${cardPosition.y}px) rotate(${cardPosition.x * 0.1}deg)`,
            touchAction: 'none'
          }}
          onMouseDown={handleTouchStart}
          onMouseMove={handleTouchMove}
          onMouseUp={handleTouchEnd}
          onMouseLeave={handleTouchEnd}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {currentCard.german}
          </h2>
          
          {showMeaning && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-2">English:</div>
              <div className="text-lg font-semibold text-gray-900 mb-3">
                {currentCard.english}
              </div>
              <div className="text-sm text-gray-600 mb-2">Bengali:</div>
              <div className="text-lg font-semibold text-gray-900">
                {currentCard.bengali}
              </div>
            </div>
          )}
        </div>

        {/* Swipe Instructions */}
        {!showMeaning && (
          <div className="mt-6 text-center text-gray-600">
            <div className="flex justify-center space-x-8 mb-2">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm mr-2">
                  ←
                </div>
                <span>Known</span>
              </div>
              <div className="flex items-center">
                <span>Unknown</span>
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm ml-2">
                  →
                </div>
              </div>
            </div>
            <p className="text-sm">Swipe left if you know this word, right if you don't</p>
          </div>
        )}
      </div>

      {/* Manual Buttons */}
      <div className="mt-8 flex justify-center space-x-4">
        <button
          onClick={() => handleSwipe('left')}
          className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
        >
          I Know This
        </button>
        <button
          onClick={() => handleSwipe('right')}
          className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors"
        >
          I Don't Know
        </button>
      </div>
    </div>
  )
}

export default Quiz2Swipe 