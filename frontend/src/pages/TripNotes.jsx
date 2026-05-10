import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { ArrowUpDown, Edit3, Filter, Layers, Plus, Search, Trash2 } from 'lucide-react';

const emptyForm = {
  title: '',
  content: '',
  day: '',
  stop: '',
};

const TripNotes = () => {
  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [notes, setNotes] = useState([]);
  const [query, setQuery] = useState('');
  const [viewMode, setViewMode] = useState('All');
  const [filterBy, setFilterBy] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [groupBy, setGroupBy] = useState('');
  const [formData, setFormData] = useState(emptyForm);
  const [editingNoteId, setEditingNoteId] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

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
        if (data.length > 0) {
          setSelectedTripId(data[0]._id);
          setNotes(data[0].notes || []);
        }
      } catch (error) {
        setMessage(error.response?.data?.message || 'Failed to load trips');
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, [config]);

  useEffect(() => {
    const selectedTrip = trips.find((trip) => trip._id === selectedTripId);
    setNotes(selectedTrip?.notes || []);
  }, [selectedTripId, trips]);

  const selectedTrip = trips.find((trip) => trip._id === selectedTripId);

  const saveNotes = async (nextNotes) => {
    if (!selectedTripId) return;

    setSaving(true);
    setMessage('');
    try {
      const { data } = await axios.put(`/api/trips/${selectedTripId}`, { notes: nextNotes }, config);
      setTrips((currentTrips) => currentTrips.map((trip) => (trip._id === data._id ? data : trip)));
      setNotes(data.notes || []);
      setMessage('Notes saved');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to save notes');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingNoteId('');
    setShowForm(false);
  };

  const submitNote = async (e) => {
    e.preventDefault();

    const now = new Date().toISOString();
    const notePayload = {
      ...formData,
      updatedAt: now,
      createdAt: editingNoteId ? notes.find((note) => note._id === editingNoteId)?.createdAt || now : now,
    };

    if (editingNoteId) {
      notePayload._id = editingNoteId;
    }

    const nextNotes = editingNoteId
      ? notes.map((note) => (note._id === editingNoteId ? notePayload : note))
      : [notePayload, ...notes];

    await saveNotes(nextNotes);
    resetForm();
  };

  const editNote = (note) => {
    setFormData({
      title: note.title || '',
      content: note.content || '',
      day: note.day || '',
      stop: note.stop || '',
    });
    setEditingNoteId(note._id);
    setShowForm(true);
  };

  const deleteNote = async (noteId) => {
    const nextNotes = notes.filter((note) => note._id !== noteId);
    await saveNotes(nextNotes);
  };

  const visibleNotes = useMemo(() => {
    return notes
      .filter((note) => {
        const searchText = [note.title, note.content, note.day, note.stop].join(' ').toLowerCase();
        const matchesQuery = searchText.includes(query.trim().toLowerCase());
        const matchesMode =
          viewMode === 'All' ||
          (viewMode === 'by Day' && note.day) ||
          (viewMode === 'by stop' && note.stop);
        const matchesFilter =
          !filterBy ||
          (filterBy === 'Day notes' && note.day) ||
          (filterBy === 'Stop notes' && note.stop) ||
          (filterBy === 'General' && !note.day && !note.stop);

        return matchesQuery && matchesMode && matchesFilter;
      })
      .sort((a, b) => {
        if (sortBy === 'oldest') return new Date(a.updatedAt || a.createdAt) - new Date(b.updatedAt || b.createdAt);
        if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
        return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
      });
  }, [filterBy, notes, query, sortBy, viewMode]);

  const groupedNotes = useMemo(() => {
    if (!groupBy) return { 'Trip notes': visibleNotes };

    return visibleNotes.reduce((groups, note) => {
      const key = groupBy === 'day' ? note.day || 'No day' : note.stop || 'No stop';
      groups[key] = [...(groups[key] || []), note];
      return groups;
    }, {});
  }, [groupBy, visibleNotes]);

  return (
    <div className="min-h-[calc(100vh-73px)] bg-[#0d0f14] p-4 sm:p-8 text-white">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-gray-700 bg-[#10131a] shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-700 px-5 py-4 sm:px-7">
          <div>
            <p className="text-sm font-semibold text-gray-400">Traveloop</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">Trip Notes / Journal</h1>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-500 bg-[#151821]">
            <Edit3 size={20} className="text-purple-300" />
          </div>
        </div>

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
            <label className="relative block">
              <Layers size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-300" />
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
                className="h-12 min-w-36 appearance-none rounded-xl border border-gray-600 bg-[#151821] pl-9 pr-8 text-sm font-medium text-white outline-none focus:border-purple-500"
              >
                <option value="">Group by</option>
                <option value="day">Day</option>
                <option value="stop">Stop</option>
              </select>
            </label>
            <label className="relative block">
              <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-300" />
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="h-12 min-w-32 appearance-none rounded-xl border border-gray-600 bg-[#151821] pl-9 pr-8 text-sm font-medium text-white outline-none focus:border-purple-500"
              >
                <option value="">Filter</option>
                <option>Day notes</option>
                <option>Stop notes</option>
                <option>General</option>
              </select>
            </label>
            <label className="relative block">
              <ArrowUpDown size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-300" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-12 min-w-32 appearance-none rounded-xl border border-gray-600 bg-[#151821] pl-9 pr-8 text-sm font-medium text-white outline-none focus:border-purple-500"
              >
                <option value="newest">Sort by newest</option>
                <option value="oldest">Oldest</option>
                <option value="title">Title</option>
              </select>
            </label>
          </div>
        </div>

        <div className="space-y-5 p-4 sm:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-3xl font-bold">Trip notes</h2>
              <select
                value={selectedTripId}
                onChange={(e) => setSelectedTripId(e.target.value)}
                className="mt-3 h-11 w-full min-w-64 rounded-xl border border-gray-600 bg-[#151821] px-4 text-sm font-medium text-white outline-none focus:border-purple-500 md:w-auto"
              >
                {loading ? (
                  <option>Loading trips...</option>
                ) : trips.length === 0 ? (
                  <option>No trips available</option>
                ) : (
                  trips.map((trip) => (
                    <option key={trip._id} value={trip._id}>Trip: {trip.title}</option>
                  ))
                )}
              </select>
            </div>
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="flex items-center justify-center gap-2 rounded-xl border border-gray-600 bg-[#151821] px-4 py-3 text-sm font-semibold hover:border-purple-500"
            >
              <Plus size={16} />
              Add Note
            </button>
          </div>

          <div className="flex flex-wrap gap-3">
            {['All', 'by Day', 'by stop'].map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                className={`rounded-xl border px-6 py-2 text-sm font-semibold ${
                  viewMode === mode ? 'border-purple-500 bg-purple-500/20 text-purple-100' : 'border-gray-600 bg-[#151821] text-gray-300'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {message && <p className="text-sm text-purple-200">{saving ? 'Saving...' : message}</p>}

          {showForm && (
            <form onSubmit={submitNote} className="max-w-3xl rounded-2xl border border-gray-700 bg-[#151821] p-4">
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="h-11 rounded-xl border border-gray-600 bg-[#0d0f14] px-4 text-sm text-white outline-none focus:border-purple-500"
                  placeholder="Note title"
                />
                <input
                  name="stop"
                  value={formData.stop}
                  onChange={handleChange}
                  className="h-11 rounded-xl border border-gray-600 bg-[#0d0f14] px-4 text-sm text-white outline-none focus:border-purple-500"
                  placeholder="Stop, e.g. Rome stop"
                />
                <input
                  name="day"
                  value={formData.day}
                  onChange={handleChange}
                  className="h-11 rounded-xl border border-gray-600 bg-[#0d0f14] px-4 text-sm text-white outline-none focus:border-purple-500"
                  placeholder="Day, e.g. Day 3"
                />
              </div>
              <textarea
                name="content"
                required
                rows="4"
                value={formData.content}
                onChange={handleChange}
                className="mt-3 w-full resize-none rounded-xl border border-gray-600 bg-[#0d0f14] px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                placeholder="Write hotel check-in info, reminders, contacts, or local details..."
              />
              <div className="mt-3 flex gap-3">
                <button type="submit" disabled={saving} className="rounded-xl bg-purple-600 px-5 py-2 text-sm font-semibold hover:bg-purple-500 disabled:opacity-60">
                  {editingNoteId ? 'Save Note' : 'Add Note'}
                </button>
                <button type="button" onClick={resetForm} className="rounded-xl border border-gray-600 px-5 py-2 text-sm font-semibold hover:border-purple-500">
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="max-w-4xl space-y-6">
            {Object.entries(groupedNotes).map(([group, groupNotes]) => (
              <section key={group}>
                <h3 className="mb-3 text-lg font-bold text-gray-200">{group}</h3>
                <div className="space-y-4">
                  {groupNotes.map((note) => (
                    <article key={note._id} className="relative rounded-2xl border border-gray-600 bg-[#151821] p-4 pr-24">
                      <div className="absolute right-3 top-3 flex gap-2">
                        <button onClick={() => editNote(note)} className="rounded-lg border border-gray-600 p-2 text-gray-300 hover:border-purple-500">
                          <Edit3 size={15} />
                        </button>
                        <button onClick={() => deleteNote(note._id)} className="rounded-lg border border-gray-600 p-2 text-red-300 hover:border-red-400">
                          <Trash2 size={15} />
                        </button>
                      </div>
                      <h4 className="text-xl font-bold">{note.title}</h4>
                      <p className="mt-2 text-sm leading-6 text-gray-300">{note.content}</p>
                      <div className="mt-3 flex flex-wrap gap-2 text-sm text-gray-400">
                        {note.stop && <span>{note.stop}</span>}
                        {note.day && <span>{note.day}</span>}
                        <span>{new Date(note.updatedAt || note.createdAt).toLocaleString()}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}

            {!loading && visibleNotes.length === 0 && (
              <div className="rounded-2xl border border-gray-700 bg-[#151821] px-6 py-12 text-center text-gray-400">
                No notes found for {selectedTrip?.title || 'this trip'}.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripNotes;
