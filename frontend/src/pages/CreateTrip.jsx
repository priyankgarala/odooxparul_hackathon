import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CreateTrip = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    country: '',
    startDate: '',
    endDate: '',
  });
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const suggestions = [
    { id: 1, name: 'Mountain Hiking', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=300&q=80' },
    { id: 2, name: 'City Tour', image: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=300&q=80' },
    { id: 3, name: 'Beach Relaxing', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80' },
    { id: 4, name: 'Museum Visits', image: 'https://images.unsplash.com/photo-1518998053401-a488e0b6b666?auto=format&fit=crop&w=300&q=80' },
    { id: 5, name: 'Food Tasting', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=300&q=80' },
    { id: 6, name: 'Nightlife', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=300&q=80' },
  ];

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        };
        const { data } = await axios.get('/api/cities', config);
        setCountries(data.countries || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load countries');
      }
    };

    fetchCountries();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      };

      const response = await axios.post('/api/trips', {
        title: formData.title,
        description: `Trip to ${formData.country}`,
        country: formData.country,
        startDate: formData.startDate,
        endDate: formData.endDate,
      }, config);

      navigate(`/trips/${response.data._id}/details`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] bg-[#0d0f14] p-4 sm:p-8 text-white relative overflow-hidden flex flex-col md:flex-row gap-8">
      {/* Background decorations */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="flex-1 max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Create a new Trip</h1>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center gap-4 bg-[#151821] border border-gray-800 rounded-xl p-4 shadow-lg focus-within:border-purple-500 transition-colors">
            <label className="text-gray-400 font-medium whitespace-nowrap min-w-[120px]">Trip Title:</label>
            <input 
              type="text" 
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full bg-transparent border-b border-gray-700 text-white focus:outline-none focus:border-purple-500 pb-1"
            />
          </div>

          <div className="flex items-center gap-4 bg-[#151821] border border-gray-800 rounded-xl p-4 shadow-lg focus-within:border-purple-500 transition-colors">
            <label className="text-gray-400 font-medium whitespace-nowrap min-w-[120px]">Country:</label>
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
              className="w-full bg-transparent border-b border-gray-700 text-white focus:outline-none focus:border-purple-500 pb-1"
            >
              <option value="">Select country</option>
              {countries.map((country) => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4 bg-[#151821] border border-gray-800 rounded-xl p-4 shadow-lg focus-within:border-purple-500 transition-colors">
            <label className="text-gray-400 font-medium whitespace-nowrap min-w-[120px]">Start Date:</label>
            <input 
              type="date" 
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
              className="w-full bg-transparent border-b border-gray-700 text-white focus:outline-none focus:border-purple-500 pb-1 [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
            />
          </div>

          <div className="flex items-center gap-4 bg-[#151821] border border-gray-800 rounded-xl p-4 shadow-lg focus-within:border-purple-500 transition-colors">
            <label className="text-gray-400 font-medium whitespace-nowrap min-w-[120px]">End Date:</label>
            <input 
              type="date" 
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
              className="w-full bg-transparent border-b border-gray-700 text-white focus:outline-none focus:border-purple-500 pb-1 [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-500/25 mt-4 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Trip'}
          </button>
        </form>
      </div>

      <div className="flex-1 max-w-xl md:border-l md:border-gray-800 md:pl-8 mt-10 md:mt-0">
        <h2 className="text-xl font-semibold text-white tracking-wide mb-6">Suggestion for Places to Visit/Activities to perform</h2>
        
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {suggestions.map((item) => (
            <div key={item.id} className="group relative aspect-square rounded-2xl overflow-hidden border border-gray-800 shadow-lg cursor-pointer bg-gray-900">
              <img src={item.image} alt={item.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-70 group-hover:opacity-100" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="absolute bottom-3 left-3 right-3 text-center">
                <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">{item.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default CreateTrip;
