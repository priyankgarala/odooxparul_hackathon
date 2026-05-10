import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
          Traveloop
        </Link>
        <div className="flex gap-4 items-center">
          {user ? (
            <>
              <Link
                to="/cities"
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Cities
              </Link>
              <Link
                to="/community"
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Community
              </Link>
              <Link 
                to="/create-trip"
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg transition-colors shadow-lg shadow-purple-500/25"
              >
                Plan Trip
              </Link>
              <Link
                to="/profile"
                className="flex items-center gap-3 ml-2 mr-4 border-l border-gray-700 pl-4 rounded-lg hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/70 transition-colors"
              >
                <img
                  src={user.profilePhoto || 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg'}
                  alt="Profile"
                  className="w-8 h-8 rounded-full border border-gray-700"
                />
                <span className="text-gray-300 font-medium">{user.firstName}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors border border-gray-700"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors shadow-lg shadow-purple-500/30"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
