import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold text-blue-600">
            German Vocab
          </Link>
          
          {user ? (
            <div className="flex items-center space-x-6">
              <Link 
                to="/" 
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Home
              </Link>
              <Link 
                to="/vocabulary" 
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Vocabulary
              </Link>
              <Link 
                to="/upload" 
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Upload
              </Link>
              <Link 
                to="/quiz" 
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Quiz
              </Link>
              <Link 
                to="/stats" 
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Stats
              </Link>
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">Welcome, {user.username}!</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link 
                to="/login" 
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar 