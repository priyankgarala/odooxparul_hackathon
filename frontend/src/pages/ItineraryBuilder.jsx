import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical, Plus, Trash2, Save } from 'lucide-react';

const initialSections = [
  {
    id: 'section-1',
    description: '',
    dateRange: '',
    budget: '',
  },
  {
    id: 'section-2',
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
        if (data.sections && data.sections.length > 0) {
          // map to ensure they have unique IDs for dnd
          setSections(data.sections.map(s => ({ ...s, id: s._id || `section-${Date.now()}-${Math.random()}` })));
        } else {
          setSections(initialSections);
        }
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
      await axios.put(`/api/trips/${id}`, { sections }, config);
      alert('Trip saved successfully!');
    } catch (error) {
      console.error('Error saving trip', error);
      alert('Failed to save trip.');
    } finally {
      setSaving(false);
    }
  };

  const addSection = () => {
    const newSection = {
      id: `section-${Date.now()}`,
      description: '',
      dateRange: '',
      budget: '',
    };
    setSections([...sections, newSection]);
  };

  const updateSection = (id, field, value) => {
    setSections(sections.map(sec => sec.id === id ? { ...sec, [field]: value } : sec));
  };

  const deleteSection = (id) => {
    setSections(sections.filter(sec => sec.id !== id));
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
    <div className="min-h-[calc(100vh-73px)] bg-[#0d0f14] p-4 sm:p-8 text-white relative overflow-hidden">
      <div className="max-w-4xl mx-auto relative z-10">
        
        <div className="mb-8 border-b border-gray-800 pb-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Build Itinerary</h1>
            {trip && <p className="text-gray-400 mt-1">For: {trip.title}</p>}
          </div>
          <button 
            onClick={saveTrip}
            disabled={saving}
            className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-medium rounded-xl transition-colors shadow-lg shadow-green-500/25 flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={20} />
            {saving ? 'Saving...' : 'Save Trip'}
          </button>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="sections">
            {(provided) => (
              <div 
                {...provided.droppableProps} 
                ref={provided.innerRef}
                className="space-y-6"
              >
                {sections.map((sec, index) => (
                  <Draggable key={sec.id} draggableId={sec.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`w-full bg-[#151821] border border-gray-500 rounded-2xl p-6 shadow-xl relative transition-transform duration-200 ${snapshot.isDragging ? 'z-50 scale-105 opacity-90 border-purple-500' : ''}`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-xl font-semibold">Section {index + 1}:</h3>
                          <div className="flex items-center gap-3">
                            <button onClick={() => deleteSection(sec.id)} className="text-red-400 hover:text-red-300 transition-colors p-1">
                              <Trash2 size={18} />
                            </button>
                            <div {...provided.dragHandleProps} className="text-gray-400 hover:text-white cursor-grab active:cursor-grabbing p-1 bg-gray-800 rounded">
                              <GripVertical size={20} />
                            </div>
                          </div>
                        </div>
                        
                        <textarea 
                          placeholder="All the necessary information about this section.&#10;This can be anything like travel section, hotel or any other activity"
                          className="w-full bg-transparent border-none rounded-xl p-0 text-sm text-gray-300 focus:outline-none focus:ring-0 min-h-[60px] mb-6 resize-none placeholder-gray-500"
                          value={sec.description}
                          onChange={(e) => updateSection(sec.id, 'description', e.target.value)}
                        ></textarea>

                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="flex-1 border border-gray-500 rounded-xl px-4 py-3 flex items-center gap-2 focus-within:border-purple-500 transition-colors bg-[#0d0f14]/50">
                            <span className="text-gray-300 whitespace-nowrap text-sm font-medium">Date Range:</span>
                            <input 
                              type="text" 
                              placeholder="xxx to yyy" 
                              className="bg-transparent text-white w-full focus:outline-none text-sm"
                              value={sec.dateRange}
                              onChange={(e) => updateSection(sec.id, 'dateRange', e.target.value)}
                            />
                          </div>
                          <div className="flex-1 border border-gray-500 rounded-xl px-4 py-3 flex items-center gap-2 focus-within:border-purple-500 transition-colors bg-[#0d0f14]/50">
                            <input 
                              type="text" 
                              placeholder="Budget of this section" 
                              className="bg-transparent text-white w-full focus:outline-none text-sm text-center placeholder-gray-400"
                              value={sec.budget}
                              onChange={(e) => updateSection(sec.id, 'budget', e.target.value)}
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
          className="mt-8 w-full py-4 border-2 border-gray-500 hover:border-purple-500 hover:bg-purple-500/10 text-white font-medium rounded-2xl transition-all flex items-center justify-center gap-2 text-lg shadow-lg"
        >
          <Plus size={24} />
          Add another Section
        </button>

      </div>
    </div>
  );
};

export default ItineraryBuilder;
