import { useState } from 'react'

const VocabularyUpload = () => {
  const [vocabularyText, setVocabularyText] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setLoading(true)

    try {
      const response = await fetch('/api/vocab/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ vocabularyText }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(`✅ ${data.message}`)
        setVocabularyText('')
      } else {
        setMessage(`❌ ${data.error}`)
      }
    } catch (error) {
      setMessage('❌ Network error. Please try again.')
    }

    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Upload Vocabulary</h1>
        
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Format Instructions:</h3>
          <p className="text-blue-800 text-sm">
            Enter your vocabulary in the following format (one word per line):
          </p>
          <pre className="mt-2 text-blue-700 text-sm bg-blue-100 p-2 rounded">
{`Kommen - To come - আসা
Laufen - To run - দৌড়ানো
Essen - To eat - খাওয়া`}
          </pre>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="vocabularyText" className="block text-sm font-medium text-gray-700 mb-2">
              Vocabulary Text
            </label>
            <textarea
              id="vocabularyText"
              rows="15"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your vocabulary here..."
              value={vocabularyText}
              onChange={(e) => setVocabularyText(e.target.value)}
              required
            />
          </div>

          {message && (
            <div className={`mb-4 p-3 rounded-md ${
              message.startsWith('✅') 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !vocabularyText.trim()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Uploading...' : 'Upload Vocabulary'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default VocabularyUpload 