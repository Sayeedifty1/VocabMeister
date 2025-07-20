import { useState, useEffect } from 'react'
// import { useAuth } from '../contexts/AuthContext'

const VocabularyTable = () => {
  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  const [vocabularies, setVocabularies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('word')
  const [sortOrder, setSortOrder] = useState('asc')
  const [selectedSection, setSelectedSection] = useState('all');

  useEffect(() => {
    if (user) {
      fetchVocabularies()
    } else {
      setLoading(false)
    }
  }, [user])

  const fetchVocabularies = async () => {
    try {
      if (!user || !user.id) {
        setError('User not found. Please log in again.');
        setLoading(false);
        return;
      }
      const response = await fetch(`/api/vocab/list?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setVocabularies(Array.isArray(data.vocabs) ? data.vocabs : []);
      } else {
        setError('Failed to load vocabulary');
      }
    } catch (error) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  // Combine section and search filters
  const filteredVocabs = vocabularies
    .filter(vocab =>
      (selectedSection === 'all' || vocab.section === selectedSection) &&
      (vocab.german || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

  const sections = Array.from(new Set(vocabularies.map(v => v.section).filter(Boolean)));

// Sort: numeric sections first (ascending), then non-numeric (alphabetical)
sections.sort((a, b) => {
  const aNum = Number(a);
  const bNum = Number(b);
  const aIsNum = !isNaN(aNum);
  const bIsNum = !isNaN(bNum);

  if (aIsNum && bIsNum) {
    return aNum - bNum;
  } else if (aIsNum) {
    return -1;
  } else if (bIsNum) {
    return 1;
  } else {
    return a.localeCompare(b);
  }
});

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 sm:p-8 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-yellow-800 mb-4">Login Required</h2>
          <p className="text-yellow-700 mb-6">Please log in to view your vocabulary.</p>
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

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 sm:p-8 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-red-800 mb-4">Error</h2>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
          Vocabulary Table
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          View and manage your vocabulary collection ({vocabularies.length} words)
        </p>
      </div>

      {/* Search and Controls */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search Vocabulary
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search by word or meaning..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="section" className="block text-sm font-medium text-gray-700 mb-2">
              Section
            </label>
            <select
              id="section"
              value={selectedSection}
              onChange={e => setSelectedSection(e.target.value)}
              className="px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All</option>
              {sections.map(section => (
                <option key={section} value={section}>{section}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Section Filter Dropdown */}
      <div className="mb-4">
        <label className="mr-2 font-semibold">Filter by Section:</label>
        <select
          value={selectedSection}
          onChange={e => setSelectedSection(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="all">All</option>
          {sections.map(section => (
            <option key={section} value={section}>{section}</option>
          ))}
        </select>
      </div>

      {/* Results Count */}
      <div className="mb-4 sm:mb-6">
        <p className="text-sm sm:text-base text-gray-600">
          Showing {filteredVocabs.length} of {vocabularies.length} words
        </p>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">German</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">English</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bengali</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVocabs.map((vocab, idx) => (
                <tr key={idx}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vocab.german}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vocab.english}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vocab.bengali}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vocab.section}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile/Tablet Cards */}
      <div className="lg:hidden space-y-4">
        {filteredVocabs.map((vocab) => (
          <div key={vocab.id} className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  {vocab.word}
                </h3>
                <p className="text-sm sm:text-base text-gray-700 mb-3">
                  {vocab.meaning}
                </p>
              </div>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-500">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Practice: {vocab.practiceCount || 0}</span>
              </div>
              <div>
                {new Date(vocab.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredVocabs.length === 0 && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No vocabulary found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding some vocabulary.'}
          </p>
          {!searchTerm && (
            <div className="mt-6">
              <a
                href="/vocabulary/upload"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Add Vocabulary
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default VocabularyTable 