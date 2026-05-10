import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Profile = () => {
  const { user, updateProfile, error, setError } = useContext(AuthContext);
  const [myTrips, setMyTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    country: '',
    profilePhoto: '',
    additionalInfo: '',
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        city: user.city || '',
        country: user.country || '',
        profilePhoto: user.profilePhoto || '',
        additionalInfo: user.additionalInfo || '',
      });
    }
  }, [user]);

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

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileForm((currentForm) => ({
        ...currentForm,
        profilePhoto: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleEditProfile = () => {
    setError(null);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setError(null);
    setIsEditing(false);
    if (user) {
      setProfileForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        city: user.city || '',
        country: user.country || '',
        profilePhoto: user.profilePhoto || '',
        additionalInfo: user.additionalInfo || '',
      });
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    const success = await updateProfile(profileForm);
    setSaving(false);
    if (success) {
      setIsEditing(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] bg-[#0d0f14] p-4 sm:p-8 text-white relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-5xl mx-auto relative z-10 space-y-12 border border-gray-800 rounded-3xl p-6 sm:p-10 bg-[#151821]/50 backdrop-blur-md">
        
        {/* User Info Section */}
        <div className="flex flex-col md:flex-row items-center md:items-stretch gap-8">
          <div className="w-48 h-48 shrink-0">
            {isEditing ? (
              <label className="group relative flex w-48 h-48 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-purple-500/60 bg-gray-900 shadow-xl">
                <img
                  src={profileForm.profilePhoto || 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg'}
                  alt="Profile preview"
                  className="w-full h-full object-cover transition-opacity group-hover:opacity-60"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-black/45 px-4 text-center text-sm font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                  Change Photo
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="sr-only"
                />
              </label>
            ) : (
              <div className="w-48 h-48 rounded-full border-2 border-gray-600 overflow-hidden shadow-xl flex items-center justify-center bg-gray-900">
                <img
                  src={user?.profilePhoto || 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg'}
                  alt="User"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
          
          <div className="flex-1 border border-gray-600 rounded-2xl p-6 bg-[#0d0f14]/50 shadow-lg relative">
            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h2 className="text-2xl font-bold">Edit Profile</h2>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors border border-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-xl hover:bg-purple-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/50 text-red-300 px-4 py-3 rounded-xl text-sm">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={profileForm.firstName}
                    onChange={handleProfileChange}
                    className="w-full bg-[#1e2230] border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    placeholder="First name"
                  />
                  <input
                    type="text"
                    name="lastName"
                    required
                    value={profileForm.lastName}
                    onChange={handleProfileChange}
                    className="w-full bg-[#1e2230] border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    placeholder="Last name"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="email"
                    name="email"
                    required
                    value={profileForm.email}
                    onChange={handleProfileChange}
                    className="w-full bg-[#1e2230] border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    placeholder="Email"
                  />
                  <input
                    type="tel"
                    name="phone"
                    value={profileForm.phone}
                    onChange={handleProfileChange}
                    className="w-full bg-[#1e2230] border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    placeholder="Phone"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="city"
                    value={profileForm.city}
                    onChange={handleProfileChange}
                    className="w-full bg-[#1e2230] border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    placeholder="City"
                  />
                  <input
                    type="text"
                    name="country"
                    value={profileForm.country}
                    onChange={handleProfileChange}
                    className="w-full bg-[#1e2230] border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    placeholder="Country"
                  />
                </div>

                <textarea
                  name="additionalInfo"
                  rows="3"
                  value={profileForm.additionalInfo}
                  onChange={handleProfileChange}
                  className="w-full bg-[#1e2230] border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                  placeholder="Additional information"
                />
              </form>
            ) : (
              <div className="flex h-full flex-col justify-center">
                <h2 className="text-2xl font-bold mb-4 pr-28">{user?.firstName} {user?.lastName}</h2>
                <div className="space-y-2 text-gray-300">
                  <p><span className="font-semibold text-gray-400 w-24 inline-block">Email:</span> {user?.email}</p>
                  <p><span className="font-semibold text-gray-400 w-24 inline-block">Phone:</span> {user?.phone || 'Not provided'}</p>
                  <p><span className="font-semibold text-gray-400 w-24 inline-block">Location:</span> {user?.city || 'N/A'}, {user?.country || 'N/A'}</p>
                  {user?.additionalInfo && (
                    <p><span className="font-semibold text-gray-400 w-24 inline-block">About:</span> {user.additionalInfo}</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleEditProfile}
                  className="absolute top-6 right-6 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 rounded-xl transition-colors border border-purple-500/50 text-sm font-medium"
                >
                  Edit Profile
                </button>
              </div>
            )}
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
                    <Link to={`/trips/${trip._id}/details`} className="w-full py-2 border border-gray-600 hover:border-purple-500 hover:bg-purple-500/10 text-white font-medium rounded-xl text-center transition-colors text-sm">
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
                    <Link to={`/trips/${trip._id}/details`} className="w-full py-2 border border-gray-600 hover:border-gray-500 hover:bg-gray-800 text-gray-300 font-medium rounded-xl text-center transition-colors text-sm">
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
