import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { ArrowUpDown, CheckSquare, Filter, Layers, Plus, Search } from 'lucide-react';

const defaultItems = [
  { label: 'Passport', category: 'Documents', packed: true },
  { label: 'Flight Tickets (Printed)', category: 'Documents', packed: true },
  { label: 'Travel insurance', category: 'Documents', packed: true },
  { label: 'Hotel booking confirmation', category: 'Documents', packed: false },
  { label: 'Casual Shirts', category: 'Clothing', packed: true },
  { label: 'Trousers / jeans', category: 'Clothing', packed: false },
  { label: 'Comfortable walking shoes', category: 'Clothing', packed: false },
  { label: 'Light jacket / windbreaker', category: 'Clothing', packed: false },
  { label: 'Phone charger', category: 'Electronics', packed: true },
  { label: 'Universal power adapter', category: 'Electronics', packed: false },
  { label: 'Earphone / headphones', category: 'Electronics', packed: false },
];

const PackingChecklist = () => {
  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [items, setItems] = useState(defaultItems);
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('category');
  const [groupByCategory, setGroupByCategory] = useState(true);
  const [newItem, setNewItem] = useState('');
  const [newCategory, setNewCategory] = useState('Documents');
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
          const firstTrip = data[0];
          setSelectedTripId(firstTrip._id);
          setItems(firstTrip.packingChecklist?.length ? firstTrip.packingChecklist : defaultItems);
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
    if (selectedTrip) {
      setItems(selectedTrip.packingChecklist?.length ? selectedTrip.packingChecklist : defaultItems);
    }
  }, [selectedTripId, trips]);

  const saveChecklist = async (nextItems) => {
    if (!selectedTripId) return;

    setSaving(true);
    setMessage('');
    try {
      const { data } = await axios.put(`/api/trips/${selectedTripId}`, { packingChecklist: nextItems }, config);
      setTrips((currentTrips) => currentTrips.map((trip) => (trip._id === data._id ? data : trip)));
      setMessage('Checklist saved');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to save checklist');
    } finally {
      setSaving(false);
    }
  };

  const categories = [...new Set(items.map((item) => item.category))];
  const packedCount = items.filter((item) => item.packed).length;
  const progress = items.length ? Math.round((packedCount / items.length) * 100) : 0;

  const visibleItems = useMemo(() => {
    return items
      .filter((item) => {
        const matchesQuery = item.label.toLowerCase().includes(query.trim().toLowerCase());
        const matchesCategory = !categoryFilter || item.category === categoryFilter;
        return matchesQuery && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === 'packed') return Number(b.packed) - Number(a.packed);
        if (sortBy === 'item') return a.label.localeCompare(b.label);
        return a.category.localeCompare(b.category);
      });
  }, [categoryFilter, items, query, sortBy]);

  const groupedItems = useMemo(() => {
    if (!groupByCategory) return { Checklist: visibleItems };

    return visibleItems.reduce((groups, item) => {
      groups[item.category] = [...(groups[item.category] || []), item];
      return groups;
    }, {});
  }, [groupByCategory, visibleItems]);

  const toggleItem = (targetItem) => {
    const nextItems = items.map((item) =>
      item.label === targetItem.label && item.category === targetItem.category
        ? { ...item, packed: !item.packed }
        : item
    );
    setItems(nextItems);
    saveChecklist(nextItems);
  };

  const addItem = () => {
    if (!newItem.trim()) return;

    const nextItems = [...items, { label: newItem.trim(), category: newCategory.trim() || 'Misc', packed: false }];
    setItems(nextItems);
    setNewItem('');
    saveChecklist(nextItems);
  };

  const resetAll = () => {
    const nextItems = items.map((item) => ({ ...item, packed: false }));
    setItems(nextItems);
    saveChecklist(nextItems);
  };

  const shareChecklist = async () => {
    const text = items.map((item) => `${item.packed ? '[x]' : '[ ]'} ${item.category}: ${item.label}`).join('\n');
    await navigator.clipboard.writeText(text);
    setMessage('Checklist copied to clipboard');
  };

  return (
    <div className="min-h-[calc(100vh-73px)] bg-[#0d0f14] p-4 sm:p-8 text-white">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-gray-700 bg-[#10131a] shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-700 px-5 py-4 sm:px-7">
          <div>
            <p className="text-sm font-semibold text-gray-400">Traveloop</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">Packing Checklist</h1>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-500 bg-[#151821]">
            <CheckSquare size={20} className="text-purple-300" />
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
            <button
              type="button"
              onClick={() => setGroupByCategory(!groupByCategory)}
              className={`flex h-12 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium ${
                groupByCategory ? 'border-purple-500 bg-purple-500/20 text-purple-100' : 'border-gray-600 bg-[#151821] text-gray-200'
              }`}
            >
              <Layers size={16} />
              Group by
            </button>
            <label className="relative block">
              <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-300" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-12 min-w-32 appearance-none rounded-xl border border-gray-600 bg-[#151821] pl-9 pr-8 text-sm font-medium text-white outline-none focus:border-purple-500"
              >
                <option value="">Filter</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </label>
            <label className="relative block">
              <ArrowUpDown size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-300" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-12 min-w-32 appearance-none rounded-xl border border-gray-600 bg-[#151821] pl-9 pr-8 text-sm font-medium text-white outline-none focus:border-purple-500"
              >
                <option value="category">Sort by category</option>
                <option value="item">Sort by item</option>
                <option value="packed">Packed first</option>
              </select>
            </label>
          </div>
        </div>

        <div className="space-y-5 p-4 sm:p-6">
          <p className="text-sm font-semibold text-gray-300">Packing checklist</p>

          <select
            value={selectedTripId}
            onChange={(e) => setSelectedTripId(e.target.value)}
            className="h-11 w-full max-w-md rounded-xl border border-gray-600 bg-[#151821] px-4 text-sm font-medium text-white outline-none focus:border-purple-500"
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

          <div className="max-w-2xl">
            <div className="mb-2 flex justify-between text-sm font-semibold text-gray-300">
              <span>Progress: {packedCount}/{items.length} items packed</span>
              <span>{progress}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full border border-gray-500 bg-[#0d0f14]">
              <div className="h-full bg-purple-400" style={{ width: `${progress}%` }}></div>
            </div>
          </div>

          {message && <p className="text-sm text-purple-200">{saving ? 'Saving...' : message}</p>}

          <div className="max-w-3xl space-y-5">
            {Object.entries(groupedItems).map(([category, groupItems]) => {
              const groupPacked = groupItems.filter((item) => item.packed).length;

              return (
                <section key={category}>
                  <div className="mb-2 flex max-w-2xl justify-between rounded-lg border border-gray-500 bg-[#151821] px-3 py-1 text-sm font-semibold">
                    <span>{category}</span>
                    <span>{groupPacked}/{groupItems.length}</span>
                  </div>
                  <div className="space-y-2 pl-3">
                    {groupItems.map((item) => (
                      <label key={`${item.category}-${item.label}`} className="flex cursor-pointer items-center gap-2 text-sm text-gray-200">
                        <input
                          type="checkbox"
                          checked={item.packed}
                          onChange={() => toggleItem(item)}
                          className="h-4 w-4 rounded border-gray-500 bg-transparent accent-purple-500"
                        />
                        <span className={item.packed ? 'text-gray-300 line-through decoration-gray-500' : ''}>{item.label}</span>
                      </label>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>

          <div className="grid max-w-3xl gap-3 md:grid-cols-[1fr_180px_auto]">
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              className="h-11 rounded-xl border border-gray-600 bg-[#0d0f14] px-4 text-sm text-white outline-none focus:border-purple-500"
              placeholder="+ add item to checklist"
            />
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="h-11 rounded-xl border border-gray-600 bg-[#0d0f14] px-4 text-sm text-white outline-none focus:border-purple-500"
              placeholder="Category"
            />
            <button onClick={addItem} className="flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-500 px-4 text-sm font-semibold hover:border-purple-500">
              <Plus size={16} />
              Add
            </button>
          </div>

          <div className="flex max-w-3xl flex-col gap-3 sm:flex-row">
            <button onClick={resetAll} className="flex-1 rounded-xl border border-gray-500 px-4 py-3 text-sm font-semibold hover:border-purple-500">
              Reset all
            </button>
            <button onClick={shareChecklist} className="flex-1 rounded-xl border border-gray-500 px-4 py-3 text-sm font-semibold hover:border-purple-500">
              Share Checklist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackingChecklist;
