import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { CalendarDays, Eye, GripVertical, MapPin, Plus, Save, Trash2 } from 'lucide-react';

const initialSections = [
  {
    id: 'section-1',
    description: '',
    dateRange: '',
    budget: '',
  },
];

const ItineraryBuilder = () => {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
        setSections(
          data.sections?.length
            ? data.sections.map((section) => ({
                ...section,
                id: section._id || `section-${Date.now()}-${Math.random()}`,
              }))
            : initialSections
        );
      } catch (error) {
        console.error('Error fetching trip', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [id]);

  const saveTrip = async () => {
    setSaving(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      };
      const { data } = await axios.put(`/api/trips/${id}`, { sections }, config);
      setTrip(data);
      alert('Trip saved successfully!');
    } catch (error) {
      console.error('Error saving trip', error);
      alert('Failed to save trip.');
    } finally {
      setSaving(false);
    }
  };

  const addSection = () => {
    setSections([
      ...sections,
      {
        id: `section-${Date.now()}`,
        description: '',
        dateRange: '',
        budget: '',
      },
    ]);
  };

  const updateSection = (sectionId, field, value) => {
    setSections(sections.map((section) => (section.id === sectionId ? { ...section, [field]: value } : section)));
  };

  const deleteSection = (sectionId) => {
    setSections(sections.filter((section) => section.id !== sectionId));
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(sections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setSections(items);
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-73px)] bg-[#0d0f14] flex items-center justify-center text-white">
        <p className="text-xl">Loading trip details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-73px)] bg-[#0d0f14] p-4 sm:p-8 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 border-b border-gray-800 pb-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Itinerary Builder</h1>
              {trip && <p className="mt-1 text-gray-400">For: {trip.title}</p>}
            </div>
            <div className="flex flex-wrap gap-3">
              {trip && (
                <Link to={`/trips/${trip._id}/details`} className="flex items-center gap-2 rounded-xl border border-gray-700 bg-gray-800 px-4 py-2.5 font-medium text-white hover:bg-gray-700">
                  Trip Details
                </Link>
              )}
              <button
                onClick={saveTrip}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-2.5 font-medium text-white shadow-lg shadow-green-500/25 hover:from-green-400 hover:to-emerald-500 disabled:opacity-50"
              >
                <Save size={20} />
                {saving ? 'Saving...' : 'Save Trip'}
              </button>
              {trip && (
                <Link to={`/trips/${trip._id}`} className="flex items-center gap-2 rounded-xl border border-gray-700 bg-gray-800 px-4 py-2.5 font-medium text-white hover:bg-gray-700">
                  <Eye size={18} />
                  View
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="mb-8 grid gap-3 md:grid-cols-4">
          {['Trip Details', 'Itinerary Builder', 'Add Cities/Stops', 'Activities + Budget + Timeline'].map((step, index) => (
            <div
              key={step}
              className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
                index === 1 ? 'border-purple-500 bg-purple-500/20 text-purple-100' : 'border-gray-800 bg-[#151821] text-gray-400'
              }`}
            >
              <span className="mr-2 text-gray-500">{index + 1}</span>
              {step}
            </div>
          ))}
        </div>

        <div className="mb-8 rounded-2xl border border-gray-800 bg-[#151821] p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Add Cities/Stops</h2>
              <p className="mt-1 text-sm text-gray-400">Choose the cities this itinerary will cover before planning activities.</p>
            </div>
            {trip && (
              <Link to={`/cities?tripId=${trip._id}`} className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-500">
                Add Cities/Stops
              </Link>
            )}
          </div>

          {trip?.cities?.length > 0 ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {trip.cities.map((city) => (
                <div key={city.cityId} className="flex items-center gap-3 rounded-xl border border-gray-700 bg-[#0d0f14]/60 p-3">
                  <img src={city.image} alt={city.name} className="h-14 w-14 rounded-lg object-cover" />
                  <div>
                    <p className="font-semibold">{city.name}, {city.country}</p>
                    <p className="flex items-center gap-1 text-sm text-gray-400">
                      <MapPin size={14} />
                      Cost {city.costIndex}/100 | Popularity {city.popularity}/100
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 rounded-xl border border-gray-700 bg-[#0d0f14]/60 p-4 text-sm text-gray-400">
              No cities/stops yet. Add cities before filling in the itinerary.
            </p>
          )}
        </div>

        <div id="activities" className="mb-4 flex items-center gap-3">
          <h2 className="text-2xl font-bold">Add Activities</h2>
          <div className="h-px flex-1 bg-gray-800"></div>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="sections">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-6">
                {sections.map((section, index) => (
                  <Draggable key={section.id} draggableId={section.id} index={index}>
                    {(dragProvided, snapshot) => (
                      <div
                        ref={dragProvided.innerRef}
                        {...dragProvided.draggableProps}
                        className={`w-full rounded-2xl border border-gray-500 bg-[#151821] p-6 shadow-xl transition-transform duration-200 ${
                          snapshot.isDragging ? 'z-50 scale-105 border-purple-500 opacity-90' : ''
                        }`}
                      >
                        <div className="mb-4 flex items-start justify-between">
                          <h3 className="text-xl font-semibold">Activity Block {index + 1}</h3>
                          <div className="flex items-center gap-3">
                            <button onClick={() => deleteSection(section.id)} className="p-1 text-red-400 transition-colors hover:text-red-300">
                              <Trash2 size={18} />
                            </button>
                            <div {...dragProvided.dragHandleProps} className="cursor-grab rounded bg-gray-800 p-1 text-gray-400 hover:text-white active:cursor-grabbing">
                              <GripVertical size={20} />
                            </div>
                          </div>
                        </div>

                        <textarea
                          placeholder="Add activities, places to visit, hotels, food stops, travel notes, or anything planned for this part of the trip."
                          className="mb-6 min-h-[80px] w-full resize-none rounded-xl border border-gray-700 bg-[#0d0f14]/50 p-4 text-sm text-gray-300 placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                          value={section.description}
                          onChange={(e) => updateSection(section.id, 'description', e.target.value)}
                        />

                        <div className="flex flex-col gap-4 sm:flex-row">
                          <div className="flex flex-1 items-center gap-2 rounded-xl border border-gray-500 bg-[#0d0f14]/50 px-4 py-3 transition-colors focus-within:border-purple-500">
                            <CalendarDays size={16} className="text-purple-300" />
                            <span className="whitespace-nowrap text-sm font-medium text-gray-300">Timeline:</span>
                            <input
                              type="text"
                              placeholder="Day 1 morning, Jun 12, or 10 AM - 1 PM"
                              className="w-full bg-transparent text-sm text-white focus:outline-none"
                              value={section.dateRange}
                              onChange={(e) => updateSection(section.id, 'dateRange', e.target.value)}
                            />
                          </div>
                          <div className="flex flex-1 items-center gap-2 rounded-xl border border-gray-500 bg-[#0d0f14]/50 px-4 py-3 transition-colors focus-within:border-purple-500">
                            <input
                              type="text"
                              placeholder="Budget for this activity/block"
                              className="w-full bg-transparent text-center text-sm text-white placeholder-gray-400 focus:outline-none"
                              value={section.budget}
                              onChange={(e) => updateSection(section.id, 'budget', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <button
          onClick={addSection}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-gray-500 py-4 text-lg font-medium text-white shadow-lg transition-all hover:border-purple-500 hover:bg-purple-500/10"
        >
          <Plus size={24} />
          Add another Activity Block
        </button>
      </div>
    </div>
  );
};

export default ItineraryBuilder;
