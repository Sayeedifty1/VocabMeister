import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'

const Quiz2Swipe = ({ quizLength, onBack }) => {
  const { user } = useAuth()
  const [cards, setCards] = useState([])
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [knownCount, setKnownCount] = useState(0)
  const [unknownCount, setUnknownCount] = useState(0)
  const [showMeaning, setShowMeaning] = useState(false)
  
  const cardRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (!user) {
      setError('Please log in to take the quiz')
      setLoading(false)
      return
    }
    fetchCards()
  }, [user])

  const fetchCards = async () => {
    try {
      const response = await fetch(`/api/quiz/quiz2?length=${quizLength}`, {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setCards(data.cards)
      } else {
        setError('Failed to load quiz cards')
      }
    } catch (error) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const handleSwipe = async (direction) => {
    if (currentCardIndex >= cards.length) return

    const currentCard = cards[currentCardIndex]
    const isKnown = direction === 'right'

    // Update counts
    if (isKnown) {
      setKnownCount(prev => prev + 1)
    } else {
      setUnknownCount(prev => prev + 1)
      setShowMeaning(true)
    }

    // Submit to backend
    try {
      await fetch('/api/quiz/quiz2/answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          vocabId: currentCard.id,
          isKnown
        })
      })
    } catch (error) {
      console.error('Failed to submit answer:', error)
    }

    // Move to next card
    setTimeout(() => {
      setShowMeaning(false)
      if (currentCardIndex + 1 >= cards.length) {
        setQuizCompleted(true)
      } else {
        setCurrentCardIndex(prev => prev + 1)
      }
    }, isKnown ? 300 : 2000) // Show meaning longer for unknown words
  }

  // Touch/Mouse handlers for swipe gestures
  const handleTouchStart = (e) => {
    const touch = e.touches[0] || e
    setDragStart({ x: touch.clientX, y: touch.clientY })
    setIsDragging(true)
  }

  const handleTouchMove = (e) => {
    if (!isDragging) return
    e.preventDefault()
    
    const touch = e.touches[0] || e
    const offsetX = touch.clientX - dragStart.x
    const offsetY = touch.clientY - dragStart.y
    
    setDragOffset({ x: offsetX, y: offsetY })
  }

  const handleTouchEnd = () => {
    if (!isDragging) return
    
    const threshold = 100
    if (Math.abs(dragOffset.x) > threshold) {
      handleSwipe(dragOffset.x > 0 ? 'right' : 'left')
    }
    
    setIsDragging(false)
    setDragOffset({ x: 0, y: 0 })
  }

  const handleRestart = () => {
    setCurrentCardIndex(0)
    setKnownCount(0)
    setUnknownCount(0)
    setShowMeaning(false)
    setQuizCompleted(false)
    fetchCards()
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading quiz cards...</p>
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
    const totalCards = cards.length
    const knownPercentage = Math.round((knownCount / totalCards) * 100)
    
    return (
      <div className="max-w-2xl mx-auto text-center p-4 sm:p-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Quiz Completed!</h2>
          
          <div className="mb-6 sm:mb-8">
            <div className="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              {knownPercentage}%
            </div>
            <p className="text-lg sm:text-xl text-gray-600">
              You knew {knownCount} out of {totalCards} words
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 sm:mb-8">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl sm:text-3xl font-bold text-green-600">{knownCount}</div>
              <div className="text-sm sm:text-base text-green-700">Known Words</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="text-2xl sm:text-3xl font-bold text-orange-600">{unknownCount}</div>
              <div className="text-sm sm:text-base text-orange-700">Unknown Words</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={handleRestart}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
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

  const currentCard = cards[currentCardIndex]
  const progress = ((currentCardIndex + 1) / cards.length) * 100

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
            Card {currentCardIndex + 1} of {cards.length}
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
          <div 
            className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 sm:h-3 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-green-50 rounded-xl p-3 sm:p-4 text-center">
          <div className="text-lg sm:text-xl font-bold text-green-600">{knownCount}</div>
          <div className="text-xs sm:text-sm text-green-700">Known</div>
        </div>
        <div className="bg-orange-50 rounded-xl p-3 sm:p-4 text-center">
          <div className="text-lg sm:text-xl font-bold text-orange-600">{unknownCount}</div>
          <div className="text-xs sm:text-sm text-orange-700">Unknown</div>
        </div>
      </div>

      {/* Card */}
      <div className="relative">
        <div
          ref={cardRef}
          className={`bg-white rounded-2xl shadow-lg p-6 sm:p-8 cursor-grab active:cursor-grabbing transition-transform duration-200 ${
            isDragging ? 'scale-105' : ''
          }`}
          style={{
            transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${dragOffset.x * 0.1}deg)`
          }}
          onMouseDown={handleTouchStart}
          onMouseMove={handleTouchMove}
          onMouseUp={handleTouchEnd}
          onMouseLeave={handleTouchEnd}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
              {currentCard.word}
            </h2>
            
            {showMeaning && (
              <div className="mt-4 sm:mt-6 p-4 sm:p-6 bg-purple-50 rounded-xl border border-purple-200">
                <h3 className="text-lg sm:text-xl font-semibold text-purple-800 mb-2">Meaning:</h3>
                <p className="text-base sm:text-lg text-purple-700">{currentCard.meaning}</p>
              </div>
            )}
          </div>
        </div>

        {/* Swipe Indicators */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold opacity-0 transition-opacity duration-300">
            Don't Know
          </div>
          <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold opacity-0 transition-opacity duration-300">
            Know
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 sm:gap-6 mt-6 sm:mt-8">
        <button
          onClick={() => handleSwipe('left')}
          className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
        >
          <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <button
          onClick={() => handleSwipe('right')}
          className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-colors"
        >
          <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-6 sm:mt-8 text-center">
        <p className="text-sm sm:text-base text-gray-600">
          <span className="font-semibold">Swipe right</span> if you know the word, <span className="font-semibold">swipe left</span> if you don't
        </p>
        <p className="text-xs sm:text-sm text-gray-500 mt-2">
          You can also use the buttons below or drag the card
        </p>
      </div>
    </div>
  )
}

export default Quiz2Swipe 