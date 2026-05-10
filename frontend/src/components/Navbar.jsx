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
    <nav className="travel-nav px-4 py-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center">
        <Link to="/" className="flex items-center gap-3 text-2xl font-bold text-white hover:opacity-90 transition-opacity">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-300 to-amber-300 text-sm font-black text-slate-950 shadow-lg shadow-teal-500/20">
            T
          </span>
          <span>
            Traveloop
            <span className="block text-xs font-medium tracking-wide text-teal-100/70">Personalized travel planning</span>
          </span>
        </Link>
        <div className="flex flex-wrap gap-2 items-center">
          {user ? (
            <>
              <Link
                to="/cities"
                className="travel-nav-link"
              >
                Cities
              </Link>
              <Link
                to="/community"
                className="travel-nav-link"
              >
                Community
              </Link>
              <Link
                to="/packing"
                className="travel-nav-link"
              >
                Packing
              </Link>
              <Link
                to="/notes"
                className="travel-nav-link"
              >
                Notes
              </Link>
              <Link
                to="/expenses"
                className="travel-nav-link"
              >
                Expenses
              </Link>
              {user.isAdmin && (
                <Link
                  to="/admin"
                  className="travel-nav-link"
                >
                  Admin
                </Link>
              )}
              <Link 
                to="/create-trip"
                className="travel-primary-link"
              >
                Plan Trip
              </Link>
              <Link
                to="/profile"
                className="flex items-center gap-3 ml-1 rounded-2xl border border-white/10 bg-white/8 px-3 py-2 hover:bg-white/12 focus:outline-none focus:ring-2 focus:ring-teal-300/70 transition-colors"
              >
                <img
                  src={user.profilePhoto || 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg'}
                  alt="Profile"
                  className="w-8 h-8 rounded-full border border-teal-200/40"
                />
                <span className="text-teal-50 font-medium">{user.firstName}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white/90 bg-white/8 rounded-2xl hover:bg-white/12 transition-colors border border-white/10"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="travel-nav-link"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="travel-primary-link"
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
