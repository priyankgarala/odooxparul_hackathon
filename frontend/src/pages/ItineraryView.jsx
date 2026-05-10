import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { ArrowUpDown, Copy, Edit3, Filter, Layers, Search, Share2 } from 'lucide-react';

const ItineraryView = () => {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [filterBy, setFilterBy] = useState('');
  const [sortBy, setSortBy] = useState('day');
  const [groupByDay, setGroupByDay] = useState(true);
  const [shareUrl, setShareUrl] = useState('');
  const [shareMessage, setShareMessage] = useState('');

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

  const rows = useMemo(() => {
    if (!trip) return [];

    const sectionRows = trip.sections?.map((section, index) => ({
      id: section._id || index,
      day: `Day ${index + 1}`,
      city: trip.cities?.[index % Math.max(trip.cities.length, 1)]?.name || trip.country || 'Selected place',
      activity: section.description || 'No activity added yet',
      timeline: section.dateRange || 'Timeline not set',
      expense: section.budget || 'Not estimated',
      type: section.budget ? 'Budgeted' : 'Unbudgeted',
    })) || [];

    return sectionRows.filter((row) => {
      const text = [row.day, row.city, row.activity, row.timeline, row.expense, row.type].join(' ').toLowerCase();
      const matchesQuery = text.includes(query.trim().toLowerCase());
      const matchesFilter = !filterBy || row.type === filterBy;
      return matchesQuery && matchesFilter;
    }).sort((a, b) => {
      if (sortBy === 'expense') return a.expense.localeCompare(b.expense);
      if (sortBy === 'activity') return a.activity.localeCompare(b.activity);
      return a.day.localeCompare(b.day);
    });
  }, [filterBy, query, sortBy, trip]);

  const groupedRows = useMemo(() => {
    if (!groupByDay) {
      return { 'Itinerary for a selected place': rows };
    }

    return rows.reduce((groups, row) => {
      groups[row.day] = [...(groups[row.day] || []), row];
      return groups;
    }, {});
  }, [groupByDay, rows]);

  const totalBudgetItems = rows.filter((row) => row.type === 'Budgeted').length;

  const createPublicShare = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      };
      const { data } = await axios.post(`/api/trips/${id}/share`, {}, config);
      const url = `${window.location.origin}/shared/${data.shareId}`;
      setTrip(data);
      setShareUrl(url);
      await navigator.clipboard.writeText(url);
      setShareMessage('Public URL copied');
    } catch (error) {
      setShareMessage(error.response?.data?.message || 'Failed to create public URL');
    }
  };

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
      <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-gray-700 bg-[#10131a] shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-700 px-5 py-4 sm:px-7">
          <div>
            <p className="text-sm font-semibold text-gray-400">Traveloop</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">Itinerary View</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={createPublicShare} className="flex items-center gap-2 rounded-xl border border-gray-600 px-4 py-2 text-sm font-semibold hover:border-purple-500">
              <Share2 size={16} />
              Share
            </button>
            <Link to={`/builder/${trip._id}`} className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold hover:bg-purple-500">
              <Edit3 size={16} />
              Edit
            </Link>
          </div>
        </div>

        {(shareUrl || trip.shareId) && (
          <div className="border-b border-gray-800 px-4 py-3 sm:px-6">
            <div className="flex flex-col gap-3 rounded-2xl border border-gray-700 bg-[#151821] p-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-200">Public URL</p>
                <p className="mt-1 break-all text-sm text-gray-400">{shareUrl || `${window.location.origin}/shared/${trip.shareId}`}</p>
                {shareMessage && <p className="mt-1 text-sm text-purple-200">{shareMessage}</p>}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={async () => {
                    const url = shareUrl || `${window.location.origin}/shared/${trip.shareId}`;
                    await navigator.clipboard.writeText(url);
                    setShareMessage('Public URL copied');
                  }}
                  className="flex items-center gap-2 rounded-xl border border-gray-600 px-4 py-2 text-sm font-semibold hover:border-purple-500"
                >
                  <Copy size={16} />
                  Copy
                </button>
                <Link to={`/shared/${trip.shareId}`} className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold hover:bg-purple-500">
                  Open Public
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="border-b border-gray-800 p-4 sm:p-6">
          <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto_auto]">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-12 w-full rounded-xl border border-gray-600 bg-[#0d0f14] pl-10 pr-4 text-white outline-none placeholder:text-gray-500 focus:border-purple-500"
                placeholder="Search bar ......"
              />
            </div>

            <button
              type="button"
              onClick={() => setGroupByDay(!groupByDay)}
              className={`flex h-12 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium ${
                groupByDay ? 'border-purple-500 bg-purple-500/20 text-purple-100' : 'border-gray-600 bg-[#151821] text-gray-200'
              }`}
            >
              <Layers size={16} />
              Group by
            </button>

            <label className="relative block">
              <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-300" />
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="h-12 min-w-32 appearance-none rounded-xl border border-gray-600 bg-[#151821] pl-9 pr-8 text-sm font-medium text-white outline-none focus:border-purple-500"
              >
                <option value="">Filter</option>
                <option value="Budgeted">Budgeted</option>
                <option value="Unbudgeted">Unbudgeted</option>
              </select>
            </label>

            <label className="relative block">
              <ArrowUpDown size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-300" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-12 min-w-32 appearance-none rounded-xl border border-gray-600 bg-[#151821] pl-9 pr-8 text-sm font-medium text-white outline-none focus:border-purple-500"
              >
                <option value="day">Sort by day</option>
                <option value="activity">Activity</option>
                <option value="expense">Expense</option>
              </select>
            </label>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold">Itinerary for {trip.country || trip.title}</h2>
            <p className="mt-2 text-sm text-gray-400">
              {trip.cities?.length || 0} cities/stops | {totalBudgetItems} budgeted activity blocks
            </p>
          </div>

          <div className="grid grid-cols-[96px_1fr_140px] gap-3 px-2 pb-3 text-sm font-semibold text-gray-300">
            <span></span>
            <span className="text-center">Physical Activity</span>
            <span className="text-center">Expense</span>
          </div>

          <div className="space-y-6">
            {Object.entries(groupedRows).map(([groupName, groupRows]) => (
              <section key={groupName} className="space-y-3">
                {groupRows.map((row, index) => (
                  <div key={row.id} className="grid grid-cols-[96px_1fr_140px] gap-3">
                    <div className="flex items-start justify-center pt-2">
                      {index === 0 && (
                        <span className="rounded-lg border border-gray-500 bg-[#151821] px-3 py-2 text-sm font-semibold">
                          {groupByDay ? groupName : row.day}
                        </span>
                      )}
                    </div>
                    <div className="rounded-xl border border-gray-600 bg-[#151821] p-4">
                      <p className="font-semibold text-white">{row.activity}</p>
                      <p className="mt-2 text-sm text-gray-400">{row.city} | {row.timeline}</p>
                    </div>
                    <div className="rounded-xl border border-gray-600 bg-[#151821] p-4 text-center text-sm font-semibold text-gray-200">
                      {row.expense}
                    </div>
                  </div>
                ))}
              </section>
            ))}

            {rows.length === 0 && (
              <div className="rounded-2xl border border-gray-700 bg-[#151821] px-6 py-12 text-center text-gray-400">
                No itinerary rows match your search.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItineraryView;
