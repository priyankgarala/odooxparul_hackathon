import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { Edit3, MapPin } from 'lucide-react';

const ItineraryView = () => {
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
        console.error('Error fetching trip', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-73px)] bg-[#0d0f14] flex items-center justify-center text-white">
        <p className="text-xl">Loading itinerary...</p>
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
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="overflow-hidden rounded-3xl border border-gray-800 bg-[#151821]">
          <div className="relative h-64">
            <img src={trip.coverImage} alt={trip.title} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#151821] via-black/20 to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-purple-200">Itinerary View</p>
                <h1 className="mt-1 text-3xl font-bold">{trip.title}</h1>
                <p className="mt-2 text-gray-300">{trip.description}</p>
              </div>
              <Link to={`/builder/${trip._id}`} className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold hover:bg-purple-500">
                <Edit3 size={16} />
                Edit Itinerary
              </Link>
            </div>
          </div>
        </div>

        <section className="rounded-2xl border border-gray-800 bg-[#151821] p-5">
          <h2 className="mb-4 text-xl font-semibold">Included Cities</h2>
          {trip.cities?.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {trip.cities.map((city) => (
                <article key={city.cityId} className="rounded-2xl border border-gray-700 bg-[#0d0f14]/60 p-4">
                  <div className="flex gap-4">
                    <img src={city.image} alt={city.name} className="h-20 w-20 rounded-xl object-cover" />
                    <div>
                      <h3 className="font-bold">{city.name}</h3>
                      <p className="text-sm text-gray-400">{city.country} · {city.region}</p>
                      <p className="mt-2 flex items-center gap-1 text-sm text-gray-300">
                        <MapPin size={14} />
                        Cost {city.costIndex}/100 · Popularity {city.popularity}/100
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-gray-400">{city.bestFor}</p>
                </article>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No cities added yet.</p>
          )}
        </section>

        <section className="rounded-2xl border border-gray-800 bg-[#151821] p-5">
          <h2 className="mb-4 text-xl font-semibold">Itinerary Sections</h2>
          {trip.sections?.length > 0 ? (
            <div className="space-y-4">
              {trip.sections.map((section, index) => (
                <article key={section._id || index} className="rounded-2xl border border-gray-700 bg-[#0d0f14]/60 p-4">
                  <h3 className="font-semibold">Section {index + 1}</h3>
                  <p className="mt-2 text-gray-300">{section.description || 'No description added.'}</p>
                  <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-400">
                    <span>Date: {section.dateRange || 'N/A'}</span>
                    <span>Budget: {section.budget || 'N/A'}</span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No itinerary sections yet.</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default ItineraryView;
