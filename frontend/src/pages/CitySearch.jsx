import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowUpDown, Check, Filter, Globe2, Layers, MapPin, Plus, Search } from 'lucide-react';

const CitySearch = () => {
  const [searchParams] = useSearchParams();
  const tripIdFromUrl = searchParams.get('tripId') || '';
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState('');
  const [country, setCountry] = useState('');
  const [sortBy, setSortBy] = useState('popularity');
  const [groupByRegion, setGroupByRegion] = useState(false);
  const [cities, setCities] = useState([]);
  const [regions, setRegions] = useState([]);
  const [countries, setCountries] = useState([]);
  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingCityId, setSavingCityId] = useState('');
  const [error, setError] = useState('');
  const countryLockedToTrip = Boolean(tripIdFromUrl && selectedTrip?.country);

  const config = useMemo(() => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  }), []);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const { data } = await axios.get('/api/trips', config);
        setTrips(data);
        const requestedTrip = data.find((trip) => trip._id === tripIdFromUrl);
        const defaultTrip = requestedTrip || data[0];

        if (defaultTrip) {
          setSelectedTripId(defaultTrip._id);
          setSelectedTrip(defaultTrip);
          if (defaultTrip.country) {
            setCountry(defaultTrip.country);
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load trips');
      }
    };

    fetchTrips();
  }, [config, tripIdFromUrl]);

  useEffect(() => {
    const fetchCities = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get('/api/cities', {
          ...config,
          params: { q: query, region, country, sort: sortBy },
        });
        setCities(data.cities);
        setRegions(data.regions);
        setCountries(data.countries);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load cities');
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, [config, country, query, region, sortBy]);

  useEffect(() => {
    const trip = trips.find((item) => item._id === selectedTripId);
    setSelectedTrip(trip || null);
    if (trip?.country) {
      setCountry(trip.country);
    }
  }, [selectedTripId, trips]);

  const groupedCities = useMemo(() => {
    if (!groupByRegion) {
      return { Results: cities };
    }

    return cities.reduce((groups, city) => {
      groups[city.region] = [...(groups[city.region] || []), city];
      return groups;
    }, {});
  }, [cities, groupByRegion]);

  const selectedCityIds = selectedTrip?.cities?.map((city) => city.cityId) || [];

  const addCityToTrip = async (cityId) => {
    if (!selectedTripId) {
      setError('Create a trip before adding cities.');
      return;
    }

    setSavingCityId(cityId);
    setError('');

    try {
      const { data } = await axios.post(`/api/trips/${selectedTripId}/cities`, { cityId }, config);
      setTrips((currentTrips) => currentTrips.map((trip) => (trip._id === data._id ? data : trip)));
      setSelectedTrip(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add city to trip');
    } finally {
      setSavingCityId('');
    }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] bg-[#0d0f14] p-4 sm:p-8 text-white">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-gray-700 bg-[#10131a] shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-700 px-5 py-4 sm:px-7">
          <div>
            <p className="text-sm font-semibold text-gray-400">Traveloop</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">City Search</h1>
            {selectedTrip && (
              <p className="mt-1 text-sm text-gray-400">
                Adding cities/stops to {selectedTrip.title}
                {selectedTrip.country ? ` in ${selectedTrip.country}` : ''}
              </p>
            )}
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-500 bg-[#151821]">
            <Globe2 size={20} className="text-purple-300" />
          </div>
        </div>

        {selectedTrip && (
          <div className="flex flex-col gap-3 border-b border-gray-800 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-sm text-gray-400">
              Flow: Trip Details {'->'} Itinerary Builder {'->'} Add Cities/Stops {'->'} Add Activities {'->'} Budget + Timeline
            </p>
            <div className="flex gap-3">
              <Link to={`/trips/${selectedTrip._id}/details`} className="rounded-xl border border-gray-700 px-4 py-2 text-sm font-medium text-gray-200 hover:border-purple-500">
                Trip Details
              </Link>
              <Link to={`/builder/${selectedTrip._id}`} className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-500">
                Back to Builder
              </Link>
            </div>
          </div>
        )}

        <div className="border-b border-gray-800 p-4 sm:p-6">
          {error && (
            <div className="mb-4 rounded-xl border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="mb-3 rounded-xl border border-gray-700 bg-[#151821] px-4 py-3">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">Add cities to trip</label>
            <select
              value={selectedTripId}
              onChange={(e) => setSelectedTripId(e.target.value)}
              className="w-full bg-transparent text-sm font-medium text-white outline-none"
            >
              {trips.length === 0 ? (
                <option value="">No trips available</option>
              ) : (
                trips.map((trip) => (
                  <option key={trip._id} value={trip._id}>{trip.title}</option>
                ))
              )}
            </select>
          </div>

          <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto_auto]">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-12 w-full rounded-xl border border-gray-600 bg-[#0d0f14] pl-10 pr-4 text-white outline-none transition-colors placeholder:text-gray-500 focus:border-purple-500"
                placeholder="Search cities, countries, or interests"
              />
            </div>

            <button
              type="button"
              onClick={() => setGroupByRegion(!groupByRegion)}
              className={`flex h-12 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium transition-colors ${
                groupByRegion
                  ? 'border-purple-500 bg-purple-500/20 text-purple-200'
                  : 'border-gray-600 bg-[#151821] text-gray-200 hover:border-gray-500'
              }`}
            >
              <Layers size={16} />
              Group by
            </button>

            <label className="relative block">
              <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-300" />
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="h-12 min-w-40 appearance-none rounded-xl border border-gray-600 bg-[#151821] pl-9 pr-8 text-sm font-medium text-white outline-none focus:border-purple-500"
              >
                <option value="">All regions</option>
                {regions.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </label>

            <label className="relative block">
              <ArrowUpDown size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-300" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-12 min-w-40 appearance-none rounded-xl border border-gray-600 bg-[#151821] pl-9 pr-8 text-sm font-medium text-white outline-none focus:border-purple-500"
              >
                <option value="popularity">Popularity</option>
                <option value="name">City name</option>
                <option value="cost">Cost index</option>
              </select>
            </label>
          </div>

          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <label className="flex flex-1 items-center gap-3 rounded-xl border border-gray-700 bg-[#151821] px-4 py-3">
              <MapPin size={17} className="text-purple-300" />
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                disabled={countryLockedToTrip}
                className="w-full bg-transparent text-sm text-white outline-none"
              >
                <option value="">All countries</option>
                {countries.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </label>
            <div className="flex items-center rounded-xl border border-gray-700 bg-[#151821] px-4 py-3 text-sm text-gray-300">
              {loading ? 'Loading cities...' : `${cities.length} cities found`}
            </div>
          </div>
        </div>

        <div className="space-y-6 p-4 sm:p-6">
          {Object.entries(groupedCities).map(([groupName, groupCities]) => (
            <section key={groupName}>
              <h2 className="mb-4 text-lg font-semibold text-gray-200">{groupName}</h2>
              <div className="space-y-4">
                {groupCities.map((city) => {
                  const isAdded = selectedCityIds.includes(city.id);

                  return (
                    <article
                      key={city.id}
                      className="grid gap-4 rounded-2xl border border-gray-700 bg-[#151821] p-4 transition-colors hover:border-purple-500/70 md:grid-cols-[144px_1fr_auto]"
                    >
                      <img src={city.image} alt={city.name} className="h-36 w-full rounded-xl object-cover md:h-28 md:w-36" />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-xl font-bold">{city.name}</h3>
                          <span className="rounded-full bg-purple-500/15 px-3 py-1 text-xs font-semibold text-purple-200">{city.region}</span>
                        </div>
                        <p className="mt-2 text-sm text-gray-400">{city.country}</p>
                        <div className="mt-4 grid gap-3 text-sm text-gray-300 sm:grid-cols-4">
                          <p><span className="block text-xs uppercase tracking-wide text-gray-500">Cost index</span>{city.costIndex}/100</p>
                          <p><span className="block text-xs uppercase tracking-wide text-gray-500">Popularity</span>{city.popularity}/100</p>
                          <p><span className="block text-xs uppercase tracking-wide text-gray-500">Budget</span>{city.avgBudget}</p>
                          <p><span className="block text-xs uppercase tracking-wide text-gray-500">Best season</span>{city.season}</p>
                        </div>
                        <p className="mt-3 text-sm text-gray-400">{city.bestFor}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => addCityToTrip(city.id)}
                        disabled={isAdded || savingCityId === city.id}
                        className={`flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-colors md:self-center ${
                          isAdded
                            ? 'bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-500/40'
                            : 'bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-60'
                        }`}
                      >
                        {isAdded ? <Check size={16} /> : <Plus size={16} />}
                        {isAdded ? 'Added' : savingCityId === city.id ? 'Adding...' : 'Add to Trip'}
                      </button>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}

          {!loading && cities.length === 0 && (
            <div className="rounded-2xl border border-gray-700 bg-[#151821] px-6 py-12 text-center text-gray-400">
              No cities match your search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CitySearch;
