import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { Copy, Share2, Sparkles } from 'lucide-react';

const PublicItineraryView = () => {
  const { shareId } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const { data } = await axios.get(`/api/trips/public/${shareId}`);
        setTrip(data);
      } catch (error) {
        setMessage(error.response?.data?.message || 'Public itinerary not found');
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [shareId]);

  const publicUrl = `${window.location.origin}/shared/${shareId}`;
  const rows = useMemo(() => {
    if (!trip) return [];

    return trip.sections?.map((section, index) => ({
      id: section._id || index,
      day: `Day ${index + 1}`,
      city: trip.cities?.[index % Math.max(trip.cities.length, 1)]?.name || trip.country || 'Selected place',
      activity: section.description || 'No activity added yet',
      timeline: section.dateRange || 'Timeline not set',
      expense: section.budget || 'Not estimated',
    })) || [];
  }, [trip]);

  const copyUrl = async () => {
    await navigator.clipboard.writeText(publicUrl);
    setMessage('Public URL copied');
  };

  const copyTrip = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      setMessage('Log in to copy this trip into your account');
      return;
    }

    try {
      const { data } = await axios.post(`/api/trips/public/${shareId}/copy`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMessage('Trip copied to your account');
      window.location.href = `/trips/${data._id}/details`;
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to copy trip');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-73px)] bg-[#0d0f14] flex items-center justify-center text-white">
        <p className="text-xl">Loading public itinerary...</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-[calc(100vh-73px)] bg-[#0d0f14] flex items-center justify-center text-white">
        <p className="text-xl">{message || 'Public itinerary not found'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-73px)] bg-[#0d0f14] p-4 sm:p-8 text-white">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="overflow-hidden rounded-3xl border border-gray-700 bg-[#10131a] shadow-2xl">
          <div className="relative min-h-80">
            <img src={trip.coverImage} alt={trip.title} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#10131a] via-black/55 to-black/20"></div>
            <div className="relative z-10 flex min-h-80 flex-col justify-end p-6 sm:p-8">
              <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-purple-200">
                <Sparkles size={16} />
                Public Itinerary
              </p>
              <h1 className="mt-2 text-4xl font-bold tracking-tight">{trip.title}</h1>
              <p className="mt-3 max-w-2xl text-gray-300">{trip.description || `A shared itinerary for ${trip.country || 'a trip'}.`}</p>
              <div className="mt-5 flex flex-wrap gap-3 text-sm text-gray-200">
                <span className="rounded-full bg-black/35 px-4 py-2">{trip.country || 'Selected destination'}</span>
                <span className="rounded-full bg-black/35 px-4 py-2">{trip.cities?.length || 0} cities/stops</span>
                <span className="rounded-full bg-black/35 px-4 py-2">{trip.sections?.length || 0} itinerary blocks</span>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-gray-700 bg-[#10131a] p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-bold">Shareable Public URL</h2>
              <p className="mt-1 break-all text-sm text-gray-400">{publicUrl}</p>
              {message && <p className="mt-2 text-sm text-purple-200">{message}</p>}
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={copyUrl} className="flex items-center gap-2 rounded-xl border border-gray-600 px-4 py-2 text-sm font-semibold hover:border-purple-500">
                <Share2 size={16} />
                Copy URL
              </button>
              <button onClick={copyTrip} className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold hover:bg-purple-500">
                <Copy size={16} />
                Copy Trip
              </button>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this itinerary: ${trip.title}`)}&url=${encodeURIComponent(publicUrl)}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-gray-600 px-4 py-2 text-sm font-semibold hover:border-purple-500"
              >
                X/Twitter
              </a>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`${trip.title} ${publicUrl}`)}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-gray-600 px-4 py-2 text-sm font-semibold hover:border-purple-500"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-gray-700 bg-[#10131a] p-5">
          <h2 className="mb-5 text-2xl font-bold">Itinerary Summary</h2>
          {trip.cities?.length > 0 && (
            <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {trip.cities.map((city) => (
                <article key={city.cityId} className="rounded-2xl border border-gray-700 bg-[#151821] p-3">
                  <img src={city.image} alt={city.name} className="h-28 w-full rounded-xl object-cover" />
                  <h3 className="mt-3 font-bold">{city.name}, {city.country}</h3>
                  <p className="mt-1 text-sm text-gray-400">{city.bestFor}</p>
                </article>
              ))}
            </div>
          )}

          <div className="space-y-3">
            {rows.map((row) => (
              <article key={row.id} className="grid gap-3 rounded-2xl border border-gray-700 bg-[#151821] p-4 md:grid-cols-[100px_1fr_150px]">
                <div className="font-semibold text-purple-200">{row.day}</div>
                <div>
                  <h3 className="font-bold">{row.activity}</h3>
                  <p className="mt-1 text-sm text-gray-400">{row.city} | {row.timeline}</p>
                </div>
                <div className="text-sm font-semibold text-gray-300">{row.expense}</div>
              </article>
            ))}
            {rows.length === 0 && <p className="text-gray-400">No itinerary blocks have been added yet.</p>}
          </div>
        </section>

        <div className="text-center">
          <Link to="/signup" className="text-sm font-semibold text-purple-300 hover:text-purple-200">
            Create your own trip on Traveloop
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PublicItineraryView;
