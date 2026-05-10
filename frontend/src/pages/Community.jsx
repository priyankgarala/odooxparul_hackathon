import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { ArrowUpDown, Filter, Layers, MessageSquare, Plus, Search, Star } from 'lucide-react';

const Community = () => {
  const [posts, setPosts] = useState([]);
  const [countries, setCountries] = useState([]);
  const [types, setTypes] = useState([]);
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [country, setCountry] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [groupBy, setGroupBy] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'Trip',
    country: '',
    region: '',
    relatedName: '',
    rating: 5,
  });

  const config = useMemo(() => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  }), []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/community', {
        ...config,
        params: { q: query, type, country, sort: sortBy },
      });
      setPosts(data.posts);
      setCountries(data.countries);
      setTypes(data.types);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load community posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [config, country, query, sortBy, type]);

  const groupedPosts = useMemo(() => {
    if (!groupBy) {
      return { 'Community tab': posts };
    }

    return posts.reduce((groups, post) => {
      const key = post[groupBy] || 'Other';
      groups[key] = [...(groups[key] || []), post];
      return groups;
    }, {});
  }, [groupBy, posts]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await axios.post('/api/community', formData, config);
      setFormData({
        title: '',
        content: '',
        type: 'Trip',
        country: '',
        region: '',
        relatedName: '',
        rating: 5,
      });
      await fetchPosts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to share experience');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] bg-[#0d0f14] p-4 sm:p-8 text-white">
      <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[1fr_360px]">
        <div className="overflow-hidden rounded-3xl border border-gray-700 bg-[#10131a] shadow-2xl">
          <div className="flex items-center justify-between border-b border-gray-700 px-5 py-4 sm:px-7">
            <div>
              <p className="text-sm font-semibold text-gray-400">Traveloop</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight">Community</h1>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-500 bg-[#151821]">
              <MessageSquare size={20} className="text-purple-300" />
            </div>
          </div>

          <div className="border-b border-gray-800 p-4 sm:p-6">
            {error && (
              <div className="mb-4 rounded-xl border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto_auto]">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="h-12 w-full rounded-xl border border-gray-600 bg-[#0d0f14] pl-10 pr-4 text-white outline-none placeholder:text-gray-500 focus:border-purple-500"
                  placeholder="Search trips, activities, places, or users"
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
                  <option value="type">Type</option>
                  <option value="country">Country</option>
                  <option value="region">Region</option>
                </select>
              </label>

              <label className="relative block">
                <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-300" />
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="h-12 min-w-36 appearance-none rounded-xl border border-gray-600 bg-[#151821] pl-9 pr-8 text-sm font-medium text-white outline-none focus:border-purple-500"
                >
                  <option value="">Filter</option>
                  {types.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </label>

              <label className="relative block">
                <ArrowUpDown size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-300" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-12 min-w-36 appearance-none rounded-xl border border-gray-600 bg-[#151821] pl-9 pr-8 text-sm font-medium text-white outline-none focus:border-purple-500"
                >
                  <option value="newest">Sort by newest</option>
                  <option value="rating">Sort by rating</option>
                </select>
              </label>
            </div>

            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="h-12 flex-1 rounded-xl border border-gray-700 bg-[#151821] px-4 text-sm text-white outline-none focus:border-purple-500"
              >
                <option value="">All countries</option>
                {countries.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
              <div className="flex items-center rounded-xl border border-gray-700 bg-[#151821] px-4 py-3 text-sm text-gray-300">
                {loading ? 'Loading experiences...' : `${posts.length} experiences found`}
              </div>
            </div>
          </div>

          <div className="space-y-8 p-4 sm:p-6">
            {Object.entries(groupedPosts).map(([groupName, groupPosts]) => (
              <section key={groupName}>
                <h2 className="mb-5 text-center text-xl font-bold text-gray-200">{groupName}</h2>
                <div className="space-y-4">
                  {groupPosts.map((post) => (
                    <article key={post._id} className="grid gap-4 rounded-2xl border border-gray-700 bg-[#151821] p-4 md:grid-cols-[52px_1fr]">
                      <img
                        src={post.authorPhoto || 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg'}
                        alt={post.authorName}
                        className="h-12 w-12 rounded-full border border-gray-600 object-cover"
                      />
                      <div>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h3 className="text-lg font-bold">{post.title}</h3>
                            <p className="mt-1 text-sm text-gray-400">
                              {post.authorName} shared about {post.relatedName || post.type}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 rounded-full bg-purple-500/15 px-3 py-1 text-sm font-semibold text-purple-200">
                            <Star size={14} />
                            {post.rating}/5
                          </div>
                        </div>
                        <p className="mt-4 text-sm leading-6 text-gray-300">{post.content}</p>
                        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-gray-300">
                          <span className="rounded-full bg-gray-800 px-3 py-1">{post.type}</span>
                          {post.country && <span className="rounded-full bg-gray-800 px-3 py-1">{post.country}</span>}
                          {post.region && <span className="rounded-full bg-gray-800 px-3 py-1">{post.region}</span>}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}

            {!loading && posts.length === 0 && (
              <div className="rounded-2xl border border-gray-700 bg-[#151821] px-6 py-12 text-center text-gray-400">
                No community experiences match your search.
              </div>
            )}
          </div>
        </div>

        <aside className="h-fit rounded-3xl border border-gray-700 bg-[#10131a] p-5 shadow-2xl">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600">
              <Plus size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Share Experience</h2>
              <p className="text-sm text-gray-400">Trip or activity story</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-700 bg-[#151821] px-4 py-3 text-white outline-none focus:border-purple-500"
              placeholder="Title"
            />
            <div className="grid grid-cols-2 gap-3">
              <select name="type" value={formData.type} onChange={handleChange} className="rounded-xl border border-gray-700 bg-[#151821] px-4 py-3 text-white outline-none focus:border-purple-500">
                <option>Trip</option>
                <option>Activity</option>
              </select>
              <select name="rating" value={formData.rating} onChange={handleChange} className="rounded-xl border border-gray-700 bg-[#151821] px-4 py-3 text-white outline-none focus:border-purple-500">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <option key={rating} value={rating}>{rating} stars</option>
                ))}
              </select>
            </div>
            <input
              type="text"
              name="relatedName"
              value={formData.relatedName}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-700 bg-[#151821] px-4 py-3 text-white outline-none focus:border-purple-500"
              placeholder="Trip/activity name"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-700 bg-[#151821] px-4 py-3 text-white outline-none focus:border-purple-500"
                placeholder="Country"
              />
              <input
                type="text"
                name="region"
                value={formData.region}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-700 bg-[#151821] px-4 py-3 text-white outline-none focus:border-purple-500"
                placeholder="Region"
              />
            </div>
            <textarea
              name="content"
              required
              rows="6"
              value={formData.content}
              onChange={handleChange}
              className="w-full resize-none rounded-xl border border-gray-700 bg-[#151821] px-4 py-3 text-white outline-none focus:border-purple-500"
              placeholder="Share what happened, what helped, and what others should know..."
            />
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-purple-600 px-4 py-3 font-semibold text-white hover:bg-purple-500 disabled:opacity-60"
            >
              {submitting ? 'Sharing...' : 'Share Experience'}
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
};

export default Community;
