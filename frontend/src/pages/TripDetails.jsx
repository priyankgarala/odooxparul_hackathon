import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { CalendarDays, Eye, MapPin, NotebookPen, PencilRuler, Plus } from 'lucide-react';

const TripDetails = () => {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        };
        const { data } = await axios.get(`/api/trips/${id}`, config);
        setTrip(data);
      } catch (error) {
        console.error('Error fetching trip details', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-73px)] bg-[#0d0f14] flex items-center justify-center text-white">
        <p className="text-xl">Loading trip details...</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-[calc(100vh-73px)] bg-[#0d0f14] flex items-center justify-center text-white">
        <p className="text-xl">Trip not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-73px)] bg-[#0d0f14] p-4 sm:p-8 text-white">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="overflow-hidden rounded-3xl border border-gray-800 bg-[#151821]">
          <div className="relative min-h-80">
            <img src={trip.coverImage} alt={trip.title} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#151821] via-black/55 to-black/20"></div>
            <div className="relative z-10 flex min-h-80 flex-col justify-end p-6 sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-wide text-purple-200">Trip Details</p>
              <h1 className="mt-2 text-4xl font-bold tracking-tight">{trip.title}</h1>
              <p className="mt-3 max-w-2xl text-gray-300">{trip.description || 'Build out this trip with cities, activities, budget, and timeline.'}</p>
              <div className="mt-5 flex flex-wrap gap-3 text-sm text-gray-200">
                <span className="flex items-center gap-2 rounded-full bg-black/35 px-4 py-2">
                  <CalendarDays size={16} />
                  {new Date(trip.startDate).toLocaleDateString()} - {trip.endDate ? new Date(trip.endDate).toLocaleDateString() : 'Open ended'}
                </span>
                <span className="flex items-center gap-2 rounded-full bg-black/35 px-4 py-2">
                  <MapPin size={16} />
                  {trip.country || 'No country selected'}
                </span>
                <span className="flex items-center gap-2 rounded-full bg-black/35 px-4 py-2">
                  <MapPin size={16} />
                  {trip.cities?.length || 0} cities/stops
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-5">
          <Link to={`/builder/${trip._id}`} className="rounded-2xl border border-purple-500/50 bg-purple-600 p-5 text-white shadow-lg shadow-purple-500/20 transition-colors hover:bg-purple-500">
            <PencilRuler size={24} />
            <h2 className="mt-4 text-lg font-bold">Itinerary Builder</h2>
            <p className="mt-2 text-sm text-purple-100">Add activities, budget, and timeline.</p>
          </Link>
          <Link to={`/cities?tripId=${trip._id}`} className="rounded-2xl border border-gray-700 bg-[#151821] p-5 transition-colors hover:border-purple-500">
            <Plus size={24} className="text-purple-300" />
            <h2 className="mt-4 text-lg font-bold">Add Cities/Stops</h2>
            <p className="mt-2 text-sm text-gray-400">Shows cities for {trip.country || 'the selected country'}.</p>
          </Link>
          <Link to={`/builder/${trip._id}#activities`} className="rounded-2xl border border-gray-700 bg-[#151821] p-5 transition-colors hover:border-purple-500">
            <PencilRuler size={24} className="text-purple-300" />
            <h2 className="mt-4 text-lg font-bold">Add Activities</h2>
            <p className="mt-2 text-sm text-gray-400">Capture plans for each stop or day.</p>
          </Link>
          <Link to={`/trips/${trip._id}`} className="rounded-2xl border border-gray-700 bg-[#151821] p-5 transition-colors hover:border-purple-500">
            <Eye size={24} className="text-purple-300" />
            <h2 className="mt-4 text-lg font-bold">Itinerary View</h2>
            <p className="mt-2 text-sm text-gray-400">Review the trip as a clean read-only plan.</p>
          </Link>
          <Link to="/notes" className="rounded-2xl border border-gray-700 bg-[#151821] p-5 transition-colors hover:border-purple-500">
            <NotebookPen size={24} className="text-purple-300" />
            <h2 className="mt-4 text-lg font-bold">Trip Notes</h2>
            <p className="mt-2 text-sm text-gray-400">Save reminders, contacts, and day notes.</p>
          </Link>
        </div>

        <section className="rounded-2xl border border-gray-800 bg-[#151821] p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">Cities and Stops</h2>
            <Link to={`/cities?tripId=${trip._id}`} className="text-sm font-medium text-purple-300 hover:text-purple-200">Add stops</Link>
          </div>
          {trip.cities?.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {trip.cities.map((city) => (
                <div key={city.cityId} className="rounded-2xl border border-gray-700 bg-[#0d0f14]/60 p-3">
                  <img src={city.image} alt={city.name} className="h-32 w-full rounded-xl object-cover" />
                  <h3 className="mt-3 font-bold">{city.name}, {city.country}</h3>
                  <p className="mt-1 text-sm text-gray-400">{city.region} | Cost {city.costIndex}/100 | Popularity {city.popularity}/100</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No cities added yet. Start by adding cities/stops to this trip.</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default TripDetails;
