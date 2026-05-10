import { Search, Filter, Layers, ArrowUpDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Dashboard = () => {
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

  // Mock data for UI (Regional selections don't have a backend model)
  const regionalSelections = [
    { id: 1, name: 'Europe', image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=300&h=300&q=80' },
    { id: 2, name: 'Asia', image: 'https://images.unsplash.com/photo-1535139262971-c51845709a48?auto=format&fit=crop&w=300&h=300&q=80' },
    { id: 3, name: 'South America', image: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=300&h=300&q=80' },
    { id: 4, name: 'North America', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=300&h=300&q=80' },
  ];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getDateOnly = (dateValue) => {
    const date = new Date(dateValue);
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const getTripEndDate = (trip) => getDateOnly(trip.endDate || trip.startDate);
  const ongoingTrips = myTrips.filter((trip) => {
    const startDate = getDateOnly(trip.startDate);
    const endDate = getTripEndDate(trip);
    return startDate <= today && endDate >= today;
  });
  const upcomingTrips = myTrips.filter((trip) => getDateOnly(trip.startDate) > today);
  const pastTrips = myTrips.filter((trip) => getTripEndDate(trip) < today);

  return (
    <div className="min-h-[calc(100vh-73px)] bg-[#0d0f14] p-4 sm:p-8 text-white relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto relative z-10 space-y-10">
        
        {/* Banner Image */}
        <div className="w-full h-64 md:h-80 lg:h-96 rounded-3xl overflow-hidden relative shadow-2xl border border-gray-800">
          <img 
            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1600&q=80" 
            alt="Travel Banner" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f14] via-transparent to-transparent"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-wider drop-shadow-2xl opacity-90 mix-blend-overlay">EXPLORE</h1>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#151821]/80 backdrop-blur-xl border border-gray-800 rounded-2xl p-4 shadow-lg">
          <div className="relative w-full md:flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-500" />
            </div>
            <input 
              type="text" 
              placeholder="Search bar ......" 
              className="w-full bg-[#1e2230] border border-gray-700 text-white rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder-gray-500"
            />
          </div>
          
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-[#1e2230] border border-gray-700 hover:border-gray-500 text-sm font-medium rounded-xl transition-colors">
              <Layers size={16} className="text-purple-400" />
              Group by
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-[#1e2230] border border-gray-700 hover:border-gray-500 text-sm font-medium rounded-xl transition-colors">
              <Filter size={16} className="text-purple-400" />
              Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-[#1e2230] border border-gray-700 hover:border-gray-500 text-sm font-medium rounded-xl transition-colors">
              <ArrowUpDown size={16} className="text-purple-400" />
              Sort by...
            </button>
          </div>
        </div>

        {/* Top Regional Selections */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-white tracking-wide">Top Regional Selections</h2>
            <div className="h-px bg-gradient-to-r from-gray-700 to-transparent flex-1"></div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {regionalSelections.map((region) => (
              <div key={region.id} className="group relative aspect-square rounded-2xl overflow-hidden border border-gray-800 shadow-lg cursor-pointer bg-gray-900">
                <img src={region.image} alt={region.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">{region.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ongoing Trips */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-white tracking-wide">Ongoing Trips</h2>
            <div className="h-px bg-gradient-to-r from-gray-700 to-transparent flex-1"></div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {loading ? (
              <p className="text-gray-500">Loading trips...</p>
            ) : ongoingTrips.length === 0 ? (
              <p className="text-gray-500 col-span-4">No ongoing trips right now.</p>
            ) : (
              ongoingTrips.map((trip) => (
                <Link to={`/trips/${trip._id}/details`} key={trip._id} className="group relative aspect-[2/3] rounded-2xl overflow-hidden border border-emerald-500/40 shadow-lg cursor-pointer bg-gray-900 block">
                  <img src={trip.coverImage || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=300&h=450&q=80'} alt={trip.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                  <div className="absolute top-3 left-3 rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-bold text-black">
                    Ongoing
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-emerald-300 text-xs font-semibold mb-1 uppercase tracking-wider">
                      {new Date(trip.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - {trip.endDate ? new Date(trip.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Open'}
                    </p>
                    <h3 className="text-lg font-bold text-white leading-tight">{trip.title}</h3>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Trips */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-white tracking-wide">Upcoming Trips</h2>
            <div className="h-px bg-gradient-to-r from-gray-700 to-transparent flex-1"></div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {loading ? (
              <p className="text-gray-500">Loading trips...</p>
            ) : upcomingTrips.length === 0 ? (
              <p className="text-gray-500 col-span-4">No upcoming trips found. Click 'Plan Trip' to start!</p>
            ) : (
              upcomingTrips.map((trip) => (
                <Link to={`/trips/${trip._id}/details`} key={trip._id} className="group relative aspect-[2/3] rounded-2xl overflow-hidden border border-gray-800 shadow-lg cursor-pointer bg-gray-900 block">
                  <img src={trip.coverImage || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=300&h=450&q=80'} alt={trip.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-emerald-400 text-xs font-semibold mb-1 uppercase tracking-wider">
                      {new Date(trip.startDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                    </p>
                    <h3 className="text-lg font-bold text-white leading-tight">{trip.title}</h3>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Previous Trips */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-white tracking-wide">Previous Trips</h2>
            <div className="h-px bg-gradient-to-r from-gray-700 to-transparent flex-1"></div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {loading ? (
              <p className="text-gray-500">Loading trips...</p>
            ) : pastTrips.length === 0 ? (
              <p className="text-gray-500 col-span-4">No past trips.</p>
            ) : (
              pastTrips.map((trip) => (
                <Link to={`/trips/${trip._id}/details`} key={trip._id} className="group relative aspect-[2/3] rounded-2xl overflow-hidden border border-gray-800 shadow-lg cursor-pointer bg-gray-900 block">
                  <img src={trip.coverImage || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=300&h=450&q=80'} alt={trip.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100 filter grayscale" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-gray-400 text-xs font-semibold mb-1 uppercase tracking-wider">
                      {new Date(trip.startDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                    </p>
                    <h3 className="text-lg font-bold text-white leading-tight">{trip.title}</h3>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
