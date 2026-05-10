import { useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { ArrowUpDown, BarChart3, Filter, Layers, Search, Shield, Users } from 'lucide-react';
import AuthContext from '../context/AuthContext';

const StatCard = ({ label, value }) => (
  <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
    <p className="text-sm text-teal-100/70">{label}</p>
    <p className="mt-2 text-3xl font-bold">{value}</p>
  </div>
);

const AdminPanel = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('users');
  const [query, setQuery] = useState('');
  const [filterBy, setFilterBy] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const config = useMemo(() => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  }), []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get('/api/admin/stats', config);
        setStats(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load admin panel');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [config]);

  const toggleAdmin = async (targetUser) => {
    try {
      await axios.put(`/api/admin/users/${targetUser._id}/admin`, { isAdmin: !targetUser.isAdmin }, config);
      const { data } = await axios.get('/api/admin/stats', config);
      setStats(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user');
    }
  };

  const filteredUsers = useMemo(() => {
    const users = stats?.users || [];
    return users
      .filter((item) => {
        const matchesQuery = [item.name, item.email, item.country].join(' ').toLowerCase().includes(query.trim().toLowerCase());
        const matchesFilter = !filterBy || (filterBy === 'admins' ? item.isAdmin : !item.isAdmin);
        return matchesQuery && matchesFilter;
      })
      .sort((a, b) => {
        if (sortBy === 'trips') return b.trips - a.trips;
        if (sortBy === 'joined') return new Date(b.createdAt) - new Date(a.createdAt);
        return a.name.localeCompare(b.name);
      });
  }, [filterBy, query, sortBy, stats]);

  if (!user?.isAdmin) {
    return (
      <div className="min-h-[calc(100vh-73px)] p-8 text-white">
        <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/8 p-8 text-center">
          <Shield className="mx-auto text-teal-200" size={40} />
          <h1 className="mt-4 text-3xl font-bold">Admin access required</h1>
          <p className="mt-2 text-teal-100/70">Ask an existing admin to enable your account or add your email to ADMIN_EMAILS.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-73px)] p-4 sm:p-8 text-white">
      <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[1fr_340px]">
        <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/8 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-7">
            <div>
              <p className="text-sm font-semibold text-teal-100/70">Traveloop</p>
              <h1 className="mt-1 text-3xl font-bold">Admin Panel</h1>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10">
              <Shield size={22} className="text-teal-200" />
            </div>
          </div>

          <div className="border-b border-white/10 p-4 sm:p-6">
            {error && <div className="mb-4 rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}
            <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto_auto]">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-100/50" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} className="h-12 w-full rounded-xl border border-white/10 bg-black/20 pl-10 pr-4 outline-none focus:border-teal-300" placeholder="Search bar ......" />
              </div>
              <button className="flex h-12 items-center gap-2 rounded-xl border border-white/10 bg-white/8 px-4 text-sm font-semibold">
                <Layers size={16} />
                Group by
              </button>
              <label className="relative">
                <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-200" />
                <select value={filterBy} onChange={(e) => setFilterBy(e.target.value)} className="h-12 rounded-xl border border-white/10 bg-white/8 pl-9 pr-8 text-sm outline-none">
                  <option value="">Filter</option>
                  <option value="admins">Admins</option>
                  <option value="users">Users</option>
                </select>
              </label>
              <label className="relative">
                <ArrowUpDown size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-200" />
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="h-12 rounded-xl border border-white/10 bg-white/8 pl-9 pr-8 text-sm outline-none">
                  <option value="name">Sort by name</option>
                  <option value="trips">Trips</option>
                  <option value="joined">Joined</option>
                </select>
              </label>
            </div>
          </div>

          <div className="border-b border-white/10 p-3">
            <div className="grid gap-2 md:grid-cols-4">
              {[
                ['users', 'Manage Users'],
                ['cities', 'Popular Cities'],
                ['activities', 'Popular Activities'],
                ['analytics', 'User Trends and Analytics'],
              ].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
                    activeTab === key ? 'border-teal-300 bg-teal-300/15 text-teal-50' : 'border-white/10 bg-white/5 text-teal-100/75'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5 sm:p-7">
            {loading ? (
              <p className="text-teal-100/70">Loading admin analytics...</p>
            ) : (
              <>
                <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  <StatCard label="Users" value={stats.totals.users} />
                  <StatCard label="Trips" value={stats.totals.trips} />
                  <StatCard label="Public Trips" value={stats.totals.publicTrips} />
                  <StatCard label="Posts" value={stats.totals.communityPosts} />
                  <StatCard label="Notes" value={stats.totals.notes} />
                </div>

                {activeTab === 'users' && (
                  <div className="overflow-hidden rounded-2xl border border-white/10">
                    <div className="grid grid-cols-[1.4fr_1.8fr_1fr_0.8fr_0.8fr_1fr] bg-white/8 p-3 text-sm font-bold text-teal-100">
                      <span>User</span><span>Email</span><span>Country</span><span>Trips</span><span>Role</span><span>Action</span>
                    </div>
                    {filteredUsers.map((item) => (
                      <div key={item._id} className="grid grid-cols-[1.4fr_1.8fr_1fr_0.8fr_0.8fr_1fr] border-t border-white/10 p-3 text-sm text-teal-50/85">
                        <span>{item.name}</span>
                        <span>{item.email}</span>
                        <span>{item.country || 'N/A'}</span>
                        <span>{item.trips}</span>
                        <span>{item.isAdmin ? 'Admin' : 'User'}</span>
                        <button onClick={() => toggleAdmin(item)} className="rounded-lg border border-white/10 px-3 py-1 text-xs hover:border-teal-300">
                          {item.isAdmin ? 'Remove admin' : 'Make admin'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'cities' && (
                  <ChartList title="Popular Cities" data={stats.topCities} />
                )}

                {activeTab === 'activities' && (
                  <ChartList title="Popular Activities" data={stats.topActivities} />
                )}

                {activeTab === 'analytics' && (
                  <div className="grid gap-6 lg:grid-cols-2">
                    <ChartList title="Trip Creation Trend" data={stats.tripTrend} />
                    <ChartList title="Engagement Stats" data={stats.engagement} />
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        <aside className="h-fit rounded-3xl border border-white/10 bg-white/8 p-5 backdrop-blur-xl">
          <h2 className="text-xl font-bold">Manage User Section</h2>
          <p className="mt-3 text-sm leading-6 text-teal-50/75">
            This section is responsible for managing users and their admin access. Admins can review adoption, popular cities, activity trends, and engagement signals across the platform.
          </p>
          <div className="mt-6 space-y-4 text-sm text-teal-50/80">
            <p><span className="font-bold text-teal-100">Popular cities:</span> cities users add most often.</p>
            <p><span className="font-bold text-teal-100">Popular activities:</span> activity blocks created inside itineraries.</p>
            <p><span className="font-bold text-teal-100">User trends:</span> trips, shares, posts, and notes.</p>
          </div>
        </aside>
      </div>
    </div>
  );
};

const ChartList = ({ title, data }) => {
  const max = Math.max(...data.map((item) => item.count), 1);

  return (
    <section className="rounded-2xl border border-white/10 bg-white/6 p-5">
      <div className="mb-5 flex items-center gap-3">
        <BarChart3 className="text-teal-200" size={22} />
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
      <div className="space-y-4">
        {data.length === 0 ? (
          <p className="text-sm text-teal-100/65">No data yet.</p>
        ) : (
          data.map((item) => (
            <div key={item.name || item.label}>
              <div className="mb-1 flex justify-between text-sm">
                <span>{item.name || item.label}</span>
                <span>{item.count}</span>
              </div>
              <div className="h-3 rounded-full bg-black/30">
                <div className="h-full rounded-full bg-gradient-to-r from-teal-300 to-amber-300" style={{ width: `${(item.count / max) * 100}%` }}></div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default AdminPanel;
