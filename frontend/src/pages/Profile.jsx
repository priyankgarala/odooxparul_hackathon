import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [myTrips, setMyTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        };
        const { data } = await axios.get('/api/trips', config);
        setMyTrips(data);
      } catch (error) {
        console.error('Error fetching trips', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const preplannedTrips = myTrips.filter(trip => new Date(trip.startDate) >= today);
  const previousTrips = myTrips.filter(trip => new Date(trip.startDate) < today);

  return (
    <div className="min-h-[calc(100vh-73px)] bg-[#0d0f14] p-4 sm:p-8 text-white relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-5xl mx-auto relative z-10 space-y-12 border border-gray-800 rounded-3xl p-6 sm:p-10 bg-[#151821]/50 backdrop-blur-md">
        
        {/* User Info Section */}
        <div className="flex flex-col md:flex-row items-center md:items-stretch gap-8">
          <div className="w-48 h-48 rounded-full border-2 border-gray-600 overflow-hidden shrink-0 shadow-xl flex items-center justify-center bg-gray-900">
            <img 
              src={user?.profilePhoto || 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg'} 
              alt="User" 
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex-1 border border-gray-600 rounded-2xl p-6 flex flex-col justify-center bg-[#0d0f14]/50 shadow-lg relative">
            <h2 className="text-2xl font-bold mb-4">{user?.firstName} {user?.lastName}</h2>
            <div className="space-y-2 text-gray-300">
              <p><span className="font-semibold text-gray-400 w-24 inline-block">Email:</span> {user?.email}</p>
              <p><span className="font-semibold text-gray-400 w-24 inline-block">Phone:</span> {user?.phone || 'Not provided'}</p>
              <p><span className="font-semibold text-gray-400 w-24 inline-block">Location:</span> {user?.city || 'N/A'}, {user?.country || 'N/A'}</p>
            </div>
            
            <button className="absolute top-6 right-6 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 rounded-xl transition-colors border border-purple-500/50 text-sm font-medium">
              Edit Profile
            </button>
          </div>
        </div>

        {/* Preplanned Trips */}
        <div>
          <h2 className="text-2xl font-bold mb-6 tracking-wide text-white border-b border-gray-800 pb-2">Preplanned Trips</h2>
          <div className="flex flex-wrap gap-6">
            {loading ? (
              <p className="text-gray-500">Loading trips...</p>
            ) : preplannedTrips.length === 0 ? (
              <p className="text-gray-500">No preplanned trips.</p>
            ) : (
              preplannedTrips.map((trip) => (
                <div key={trip._id} className="w-48 h-72 border border-gray-700 rounded-2xl p-3 flex flex-col bg-[#1e2230]/50 shadow-md">
                  <div className="w-full h-40 rounded-xl overflow-hidden mb-3 relative">
                    <img src={trip.coverImage || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=300&q=80'} alt={trip.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    <h3 className="absolute bottom-2 left-2 right-2 text-white font-bold text-sm leading-tight truncate">{trip.title}</h3>
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wide">
                      {new Date(trip.startDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                    </p>
                    <Link to={`/builder/${trip._id}`} className="w-full py-2 border border-gray-600 hover:border-purple-500 hover:bg-purple-500/10 text-white font-medium rounded-xl text-center transition-colors text-sm">
                      View
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Previous Trips */}
        <div>
          <h2 className="text-2xl font-bold mb-6 tracking-wide text-white border-b border-gray-800 pb-2">Previous Trips</h2>
          <div className="flex flex-wrap gap-6">
            {loading ? (
              <p className="text-gray-500">Loading trips...</p>
            ) : previousTrips.length === 0 ? (
              <p className="text-gray-500">No previous trips.</p>
            ) : (
              previousTrips.map((trip) => (
                <div key={trip._id} className="w-48 h-72 border border-gray-700 rounded-2xl p-3 flex flex-col bg-[#1e2230]/30 shadow-md">
                  <div className="w-full h-40 rounded-xl overflow-hidden mb-3 relative">
                    <img src={trip.coverImage || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=300&q=80'} alt={trip.title} className="w-full h-full object-cover grayscale opacity-70" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    <h3 className="absolute bottom-2 left-2 right-2 text-gray-300 font-bold text-sm leading-tight truncate">{trip.title}</h3>
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">
                      {new Date(trip.startDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                    </p>
                    <Link to={`/builder/${trip._id}`} className="w-full py-2 border border-gray-600 hover:border-gray-500 hover:bg-gray-800 text-gray-300 font-medium rounded-xl text-center transition-colors text-sm">
                      View
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
