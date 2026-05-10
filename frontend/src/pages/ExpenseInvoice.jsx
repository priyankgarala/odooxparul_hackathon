import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { ArrowLeft, ArrowUpDown, Download, Filter, Search } from 'lucide-react';

const parseAmount = (value) => {
  const amount = Number(String(value || '').replace(/[^\d.]/g, ''));
  return Number.isFinite(amount) ? amount : 0;
};

const getCategory = (text) => {
  const value = text.toLowerCase();
  if (value.includes('flight') || value.includes('train') || value.includes('taxi') || value.includes('bus') || value.includes('travel')) return 'transport';
  if (value.includes('hotel') || value.includes('stay') || value.includes('hostel') || value.includes('room')) return 'stay';
  if (value.includes('food') || value.includes('meal') || value.includes('lunch') || value.includes('dinner') || value.includes('breakfast')) return 'meals';
  return 'activities';
};

const ExpenseInvoice = () => {
  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [query, setQuery] = useState('');
  const [filterBy, setFilterBy] = useState('');
  const [sortBy, setSortBy] = useState('category');
  const [targetBudget, setTargetBudget] = useState(20000);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        };
        const { data } = await axios.get('/api/trips', config);
        setTrips(data);
        if (data.length > 0) setSelectedTripId(data[0]._id);
      } catch (error) {
        console.error('Error fetching trips', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, []);

  const selectedTrip = trips.find((trip) => trip._id === selectedTripId);

  const invoiceItems = useMemo(() => {
    if (!selectedTrip) return [];

    const sectionItems = selectedTrip.sections?.map((section, index) => {
      const description = section.description || `Activity block ${index + 1}`;
      const category = getCategory(`${description} ${section.budget}`);
      const amount = parseAmount(section.budget);

      return {
        id: section._id || index,
        category,
        description,
        quantity: section.dateRange || '1',
        unitCost: amount,
        amount,
      };
    }).filter((item) => item.amount > 0) || [];

    if (sectionItems.length > 0) return sectionItems;

    return [
      { id: 'stay', category: 'stay', description: `Stay in ${selectedTrip.country || 'destination'}`, quantity: '3 nights', unitCost: 3000, amount: 9000 },
      { id: 'transport', category: 'transport', description: 'Flight / local transport bookings', quantity: '1', unitCost: 12000, amount: 12000 },
      { id: 'activities', category: 'activities', description: 'Tours and local activities', quantity: selectedTrip.cities?.length || 1, unitCost: 1500, amount: (selectedTrip.cities?.length || 1) * 1500 },
      { id: 'meals', category: 'meals', description: 'Meals and cafe stops', quantity: 'daily', unitCost: 1000, amount: 3000 },
    ];
  }, [selectedTrip]);

  const filteredItems = useMemo(() => {
    return invoiceItems
      .filter((item) => {
        const matchesQuery = [item.category, item.description, item.quantity].join(' ').toLowerCase().includes(query.trim().toLowerCase());
        const matchesFilter = !filterBy || item.category === filterBy;
        return matchesQuery && matchesFilter;
      })
      .sort((a, b) => {
        if (sortBy === 'amount') return b.amount - a.amount;
        if (sortBy === 'description') return a.description.localeCompare(b.description);
        return a.category.localeCompare(b.category);
      });
  }, [filterBy, invoiceItems, query, sortBy]);

  const breakdown = useMemo(() => {
    return invoiceItems.reduce((totals, item) => {
      totals[item.category] = (totals[item.category] || 0) + item.amount;
      return totals;
    }, { transport: 0, stay: 0, activities: 0, meals: 0 });
  }, [invoiceItems]);

  const subtotal = invoiceItems.reduce((total, item) => total + item.amount, 0);
  const tax = Math.round(subtotal * 0.05);
  const discount = 50;
  const grandTotal = subtotal + tax - discount;
  const days = selectedTrip?.startDate && selectedTrip?.endDate
    ? Math.max(1, Math.ceil((new Date(selectedTrip.endDate) - new Date(selectedTrip.startDate)) / 86400000) + 1)
    : 1;
  const averagePerDay = Math.round(grandTotal / days);
  const remaining = targetBudget - grandTotal;
  const overBudgetDays = averagePerDay > targetBudget / days;
  const pie = `conic-gradient(#a855f7 0 ${breakdown.transport / Math.max(subtotal, 1) * 100}%, #22c55e 0 ${(breakdown.transport + breakdown.stay) / Math.max(subtotal, 1) * 100}%, #f59e0b 0 ${(breakdown.transport + breakdown.stay + breakdown.activities) / Math.max(subtotal, 1) * 100}%, #ef4444 0 100%)`;

  const downloadInvoice = () => {
    const content = [
      `Invoice for ${selectedTrip?.title || 'Trip'}`,
      `Total: ${grandTotal}`,
      '',
      ...invoiceItems.map((item, index) => `${index + 1}. ${item.category} - ${item.description} - ${item.amount}`),
    ].join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedTrip?.title || 'trip'}-invoice.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-[calc(100vh-73px)] bg-[#0d0f14] p-4 sm:p-8 text-white">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl border border-gray-700 bg-[#10131a] shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-700 px-5 py-4 sm:px-7">
          <p className="text-lg font-bold">Traveloop</p>
          <div className="grid flex-1 gap-3 px-6 lg:grid-cols-[1fr_auto_auto]">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} className="h-10 w-full rounded-xl border border-gray-600 bg-[#0d0f14] pl-9 pr-3 text-sm outline-none focus:border-purple-500" placeholder="Search invoices......" />
            </div>
            <label className="relative">
              <Filter size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-300" />
              <select value={filterBy} onChange={(e) => setFilterBy(e.target.value)} className="h-10 rounded-xl border border-gray-600 bg-[#151821] pl-9 pr-8 text-sm outline-none">
                <option value="">Filter</option>
                <option value="transport">Transport</option>
                <option value="stay">Stay</option>
                <option value="activities">Activities</option>
                <option value="meals">Meals</option>
              </select>
            </label>
            <label className="relative">
              <ArrowUpDown size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-300" />
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="h-10 rounded-xl border border-gray-600 bg-[#151821] pl-9 pr-8 text-sm outline-none">
                <option value="category">Sort</option>
                <option value="amount">Amount</option>
                <option value="description">Description</option>
              </select>
            </label>
          </div>
          <div className="h-10 w-10 rounded-full border border-gray-500"></div>
        </div>

        <div className="p-5 sm:p-8">
          <button className="mb-5 flex items-center gap-2 text-sm text-gray-300 hover:text-white">
            <ArrowLeft size={16} />
            Back to My Trips
          </button>

          <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
            <div>
              <section className="rounded-2xl border border-gray-700 bg-[#151821] p-5">
                <div className="grid gap-6 lg:grid-cols-[180px_1fr_1fr]">
                  <div className="flex h-40 items-center justify-center rounded-2xl border border-gray-600 bg-[#0d0f14]">
                    <Download size={56} className="text-gray-400" />
                  </div>
                  <div>
                    <select value={selectedTripId} onChange={(e) => setSelectedTripId(e.target.value)} className="mb-4 h-10 w-full rounded-xl border border-gray-600 bg-[#0d0f14] px-3 text-sm outline-none">
                      {loading ? <option>Loading trips...</option> : trips.map((trip) => <option key={trip._id} value={trip._id}>{trip.title}</option>)}
                    </select>
                    <h1 className="font-bold">{selectedTrip?.title || 'Trip Invoice'}</h1>
                    <p className="mt-2 text-sm text-gray-400">
                      {selectedTrip?.startDate ? new Date(selectedTrip.startDate).toLocaleDateString() : 'Start'} - {selectedTrip?.endDate ? new Date(selectedTrip.endDate).toLocaleDateString() : 'End'} | {selectedTrip?.cities?.length || 0} cities
                    </p>
                    <p className="mt-2 text-sm text-gray-400">Average cost/day: {averagePerDay}</p>
                  </div>
                  <div className="space-y-5 text-sm text-gray-300">
                    <p><span className="block text-gray-500">Invoice Id</span> INV-{selectedTrip?._id?.slice(-8) || '00000000'}</p>
                    <p><span className="block text-gray-500">Generated date</span>{new Date().toLocaleDateString()}</p>
                    <p><span className="block text-gray-500">Payment status</span> pending</p>
                  </div>
                </div>
              </section>

              <section className="mt-6 overflow-hidden rounded-2xl border border-gray-700 bg-[#10131a]">
                <div className="grid grid-cols-[48px_1fr_2fr_1fr_1fr_1fr] border-b border-gray-600 text-sm font-semibold text-gray-300">
                  {['#', 'Category', 'Description', 'Qty/details', 'Unit', 'Amount'].map((header) => <div key={header} className="p-3">{header}</div>)}
                </div>
                {filteredItems.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-[48px_1fr_2fr_1fr_1fr_1fr] border-b border-gray-800 text-sm text-gray-300">
                    <div className="p-3">{index + 1}</div>
                    <div className="p-3 capitalize">{item.category}</div>
                    <div className="p-3">{item.description}</div>
                    <div className="p-3">{item.quantity}</div>
                    <div className="p-3">{item.unitCost}</div>
                    <div className="p-3">{item.amount}</div>
                  </div>
                ))}
                <div className="grid grid-cols-[1fr_220px] border-t border-gray-600 p-4 text-sm">
                  <div></div>
                  <div className="space-y-2">
                    <p className="flex justify-between"><span>Subtotal</span><span>{subtotal}</span></p>
                    <p className="flex justify-between"><span>Tax (5%)</span><span>{tax}</span></p>
                    <p className="flex justify-between"><span>Discount</span><span>{discount}</span></p>
                    <p className="flex justify-between border-t border-gray-700 pt-2 text-base font-bold"><span>Grand Total</span><span>{grandTotal}</span></p>
                  </div>
                </div>
              </section>

              <div className="mt-6 flex flex-wrap gap-4">
                <button onClick={downloadInvoice} className="rounded-xl border border-gray-500 px-8 py-3 text-sm font-semibold hover:border-purple-500">Download Invoice</button>
                <button onClick={downloadInvoice} className="rounded-xl border border-gray-500 px-8 py-3 text-sm font-semibold hover:border-purple-500">Export as PDF</button>
                <button className="rounded-xl border border-gray-500 px-8 py-3 text-sm font-semibold hover:border-purple-500">Mark as paid</button>
              </div>
            </div>

            <aside className="space-y-6">
              <section className="rounded-2xl border border-gray-700 bg-[#151821] p-5">
                <h2 className="font-bold">Budget Insights</h2>
                <div className="mt-6 grid grid-cols-[110px_1fr] gap-5">
                  <div className="h-24 w-24 rounded-full border border-gray-500" style={{ background: pie }}></div>
                  <div className="space-y-2 text-sm text-gray-300">
                    <label className="block">
                      <span className="text-gray-500">Total Budget</span>
                      <input value={targetBudget} onChange={(e) => setTargetBudget(Number(e.target.value) || 0)} className="mt-1 w-full rounded-lg border border-gray-600 bg-[#0d0f14] px-3 py-2 outline-none" />
                    </label>
                    <p>Total spent: {grandTotal}</p>
                    <p className={remaining < 0 ? 'text-red-300' : 'text-emerald-300'}>Remaining: {remaining}</p>
                  </div>
                </div>
                {overBudgetDays && (
                  <div className="mt-5 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
                    Alert: average daily cost is over the planned daily budget.
                  </div>
                )}
              </section>

              <section className="rounded-2xl border border-gray-700 bg-[#151821] p-5">
                <h2 className="mb-4 font-bold">Cost Breakdown</h2>
                {Object.entries(breakdown).map(([category, amount]) => (
                  <div key={category} className="mb-4">
                    <div className="mb-1 flex justify-between text-sm capitalize text-gray-300">
                      <span>{category}</span>
                      <span>{amount}</span>
                    </div>
                    <div className="h-3 rounded-full bg-[#0d0f14]">
                      <div className="h-full rounded-full bg-purple-500" style={{ width: `${Math.min(100, amount / Math.max(subtotal, 1) * 100)}%` }}></div>
                    </div>
                  </div>
                ))}
              </section>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseInvoice;
