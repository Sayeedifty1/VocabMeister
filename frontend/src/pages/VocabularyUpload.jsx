import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

const VocabularyUpload = () => {
  const { user } = useAuth()
  const [file, setFile] = useState(null)
  const [manualInput, setManualInput] = useState('')
  const [uploadMethod, setUploadMethod] = useState('file')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    setFile(selectedFile)
    setError('')
    setMessage('')
  }

  const handleManualInputChange = (e) => {
    setManualInput(e.target.value)
    setError('')
    setMessage('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      let response

      if (uploadMethod === 'file' && file) {
        const formData = new FormData()
        formData.append('file', file)

        response = await fetch('/api/vocab/upload', {
          method: 'POST',
          credentials: 'include',
          body: formData
        })
      } else if (uploadMethod === 'manual' && manualInput.trim()) {
        response = await fetch('/api/vocab/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            content: manualInput
          })
        })
      } else {
        setError('Please select a file or enter vocabulary content')
        setLoading(false)
        return
      }

      if (response.ok) {
        const data = await response.json()
        setMessage(`Successfully uploaded ${data.count} vocabulary items!`)
        setFile(null)
        setManualInput('')
        // Reset file input
        const fileInput = document.getElementById('file-input')
        if (fileInput) fileInput.value = ''
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Upload failed')
      }
    } catch (error) {
      setError('Network error - please try again')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 sm:p-8 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-yellow-800 mb-4">Login Required</h2>
          <p className="text-yellow-700 mb-6">Please log in to upload vocabulary.</p>
          <a
            href="/login"
            className="bg-yellow-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Go to Login
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Upload Vocabulary
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
          Add new vocabulary to your collection by uploading a file or entering words manually
        </p>
      </div>

      {/* Upload Method Selection */}
      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Choose Upload Method</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <button
            onClick={() => setUploadMethod('file')}
            className={`p-4 sm:p-6 rounded-xl border-2 transition-all duration-300 ${
              uploadMethod === 'file'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
            }`}
          >
            <div className="flex items-center mb-3">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span className="text-lg sm:text-xl font-semibold">File Upload</span>
            </div>
            <p className="text-sm sm:text-base">Upload a text file with your vocabulary</p>
          </button>

          <button
            onClick={() => setUploadMethod('manual')}
            className={`p-4 sm:p-6 rounded-xl border-2 transition-all duration-300 ${
              uploadMethod === 'manual'
                ? 'border-purple-500 bg-purple-50 text-purple-700'
                : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-purple-300 hover:bg-purple-50'
            }`}
          >
            <div className="flex items-center mb-3">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span className="text-lg sm:text-xl font-semibold">Manual Entry</span>
            </div>
            <p className="text-sm sm:text-base">Type or paste your vocabulary directly</p>
          </button>
        </div>
      </div>

      {/* Upload Form */}
      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {uploadMethod === 'file' ? (
            <div>
              <label htmlFor="file-input" className="block text-lg sm:text-xl font-semibold text-gray-900 mb-4">
                Select Vocabulary File
              </label>
              
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 sm:p-8 text-center hover:border-blue-400 transition-colors">
                <input
                  id="file-input"
                  type="file"
                  accept=".txt,.csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="file-input" className="cursor-pointer">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-lg sm:text-xl font-medium text-gray-900 mb-2">
                    {file ? file.name : 'Click to select a file'}
                  </p>
                  <p className="text-sm sm:text-base text-gray-500">
                    {file ? 'File selected successfully!' : 'Supports .txt and .csv files'}
                  </p>
                </label>
              </div>

              <div className="mt-4 sm:mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">File Format Instructions:</h3>
                <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                  <p className="text-sm sm:text-base text-gray-700 mb-3">
                    Your file should contain vocabulary in one of these formats:
                  </p>
                  <ul className="text-sm sm:text-base text-gray-600 space-y-2">
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span><strong>Simple format:</strong> One word per line</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span><strong>Word-Meaning format:</strong> word = meaning (one per line)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span><strong>CSV format:</strong> word,meaning (comma-separated)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label htmlFor="manual-input" className="block text-lg sm:text-xl font-semibold text-gray-900 mb-4">
                Enter Vocabulary
              </label>
              <textarea
                id="manual-input"
                value={manualInput}
                onChange={handleManualInputChange}
                placeholder="Enter your vocabulary here...
Example:
hello = greeting
world = earth
vocabulary = words"
                rows={12}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
              <p className="mt-2 text-sm text-gray-500">
                Enter one word per line or use "word = meaning" format
              </p>
            </div>
          )}

          {/* Messages */}
          {message && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 sm:p-6">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-green-800 font-medium">{message}</span>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-red-800 font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-lg sm:text-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </div>
              ) : (
                'Upload Vocabulary'
              )}
            </button>
            
            <a
              href="/vocabulary/table"
              className="flex-1 bg-gray-200 text-gray-800 px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-lg sm:text-xl font-semibold hover:bg-gray-300 transition-colors text-center"
            >
              View Vocabulary
            </a>
          </div>
        </form>
      </div>

      {/* Sample File Download */}
      <div className="mt-8 sm:mt-12 bg-blue-50 rounded-2xl p-6 sm:p-8">
        <h3 className="text-lg sm:text-xl font-semibold text-blue-900 mb-4">Need a sample file?</h3>
        <p className="text-blue-800 mb-4">
          Download our sample vocabulary file to see the correct format:
        </p>
        <a
          href="/sample-vocabulary.txt"
          download
          className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download Sample File
        </a>
      </div>
    </div>
  )
}

export default VocabularyUpload 