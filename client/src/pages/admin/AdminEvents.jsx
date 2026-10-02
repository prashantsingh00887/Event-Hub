import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import API from '../../services/api';
import {
  PlusCircle,
  Search,
  Filter,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  Clock,
  Ticket,
  AlertCircle,
  X,
  Loader2,
  CheckCircle2,
  ExternalLink,
  UploadCloud,
  ImageIcon
} from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'Music',
  'Concert',
  'Workshop',
  'Conference',
  'Sports',
  'Comedy',
  'Education',
  'Other'
];

const AdminEvents = () => {
  const location = useLocation();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [editingEventId, setEditingEventId] = useState(null);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form State
  const initialForm = {
    title: '',
    description: '',
    category: 'Concert',
    image: '',
    venue: '',
    address: '',
    city: '',
    date: '',
    startTime: '18:00',
    endTime: '22:00',
    ticketPrice: 499,
    totalSeats: 100,
    status: 'active'
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/events?all=true&limit=100&sort=newest');
      if (data.success) {
        setEvents(data.data);
      }
    } catch (err) {
      console.error('Error fetching admin events:', err);
      toast.error('Failed to load events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    // If navigated from "Add Event" sidebar link
    if (location.pathname.endsWith('/new')) {
      handleOpenCreateModal();
    }
  }, [location.pathname]);

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setFormData(initialForm);
    setEditingEventId(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (event) => {
    setModalMode('edit');
    setEditingEventId(event._id);
    const dateFormatted = event.date ? new Date(event.date).toISOString().split('T')[0] : '';
    setFormData({
      title: event.title,
      description: event.description,
      category: event.category,
      image: event.image,
      venue: event.venue,
      address: event.address,
      city: event.city,
      date: dateFormatted,
      startTime: event.startTime,
      endTime: event.endTime,
      ticketPrice: event.ticketPrice,
      totalSeats: event.totalSeats,
      status: event.status
    });
    setIsModalOpen(true);
  };

  const handleImageFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPEG, PNG, WEBP, GIF).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds the 5MB limit.');
      return;
    }

    const uploadData = new FormData();
    uploadData.append('image', file);
    uploadData.append('folder', 'eventhub_events');

    setUploadingImage(true);
    try {
      const { data } = await API.post('/upload', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (data.success && data.url) {
        setFormData((prev) => ({ ...prev, image: data.url }));
        toast.success('Image successfully uploaded to Cloudinary!');
      }
    } catch (err) {
      console.error('Image upload failed:', err);
      toast.error(err.response?.data?.message || 'Failed to upload image to Cloudinary.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim() || !formData.image.trim()) {
      toast.error('Title, description, and image URL are required.');
      return;
    }

    if (Number(formData.ticketPrice) < 0) {
      toast.error('Ticket price cannot be negative.');
      return;
    }

    if (Number(formData.totalSeats) <= 0) {
      toast.error('Total seats must be greater than 0.');
      return;
    }

    setFormSubmitting(true);
    try {
      if (modalMode === 'create') {
        const { data } = await API.post('/events', formData);
        if (data.success) {
          toast.success('Event created successfully!');
          setIsModalOpen(false);
          fetchEvents();
        }
      } else {
        const { data } = await API.put(`/events/${editingEventId}`, formData);
        if (data.success) {
          toast.success('Event updated successfully!');
          setIsModalOpen(false);
          fetchEvents();
        }
      }
    } catch (err) {
      console.error('Error saving event:', err);
      toast.error(err.response?.data?.message || 'Failed to save event.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!eventToDelete) return;
    try {
      const { data } = await API.delete(`/events/${eventToDelete._id}`);
      if (data.success) {
        toast.success(data.message || 'Event deleted successfully.');
        setEventToDelete(null);
        fetchEvents();
      }
    } catch (err) {
      console.error('Error deleting event:', err);
      toast.error(err.response?.data?.message || 'Failed to delete event.');
    }
  };

  const filteredEvents = events.filter((e) => {
    const matchesCategory =
      selectedCategory === 'All' || e.category === selectedCategory;
    const matchesSearch =
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.venue.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Manage Events
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Create, update, monitor seats, and configure public events.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all text-xs flex items-center gap-1.5 shadow-sm shadow-indigo-200"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Event</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, city, venue..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-hidden focus:border-indigo-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Category:
          </span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 bg-white focus:outline-hidden focus:border-indigo-600 cursor-pointer"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Event Details</th>
                <th className="py-3.5 px-3">Category</th>
                <th className="py-3.5 px-3">Date & Time</th>
                <th className="py-3.5 px-3">Location</th>
                <th className="py-3.5 px-3">Price</th>
                <th className="py-3.5 px-3">Seats (Avail/Total)</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                    <span>Loading events...</span>
                  </td>
                </tr>
              ) : filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No events found.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((evt) => {
                  const eventDate = new Date(evt.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  });

                  return (
                    <tr key={evt._id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Image & Title */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={evt.image}
                            alt={evt.title}
                            className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                            onError={(e) => {
                              e.target.src =
                                'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=128&q=80';
                            }}
                          />
                          <div className="min-w-0 max-w-[200px]">
                            <p className="font-bold text-slate-900 truncate">{evt.title}</p>
                            <p className="text-[11px] text-slate-400 truncate">{evt.venue}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          {evt.category}
                        </span>
                      </td>

                      {/* Date & Time */}
                      <td className="py-4 px-3">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-slate-800">{eventDate}</p>
                          <p className="text-[11px] text-slate-400">
                            {evt.startTime} - {evt.endTime}
                          </p>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-4 px-3">
                        <p className="font-bold text-slate-800">{evt.city}</p>
                        <p className="text-[10px] text-slate-400 truncate max-w-[120px]">
                          {evt.address}
                        </p>
                      </td>

                      {/* Price */}
                      <td className="py-4 px-3 font-extrabold text-slate-900">
                        {evt.ticketPrice === 0 ? 'Free' : `₹${evt.ticketPrice.toLocaleString('en-IN')}`}
                      </td>

                      {/* Seats */}
                      <td className="py-4 px-3">
                        <div className="space-y-1">
                          <span className="font-bold text-slate-900">
                            {evt.availableSeats} / {evt.totalSeats}
                          </span>
                          <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-indigo-600 h-full rounded-full"
                              style={{
                                width: `${((evt.totalSeats - evt.availableSeats) / evt.totalSeats) * 100}%`
                              }}
                            ></div>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                            evt.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : evt.status === 'cancelled'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {evt.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(evt)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                            title="Edit Event"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEventToDelete(evt)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Event"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Event Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full my-8 p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {modalMode === 'create' ? 'Create New Event' : 'Edit Event Details'}
                </h3>
                <p className="text-xs text-slate-500">
                  Fill in all event details and specifications.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Event Name */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Goa Sunburn Musical Festival"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:border-indigo-600"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 bg-white focus:outline-hidden focus:border-indigo-600"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                    Event Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 bg-white focus:outline-hidden focus:border-indigo-600"
                  >
                    <option value="active">Active (Visible)</option>
                    <option value="draft">Draft (Hidden)</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                {/* Event Image Banner (Cloudinary Upload + URL Fallback) */}
                <div className="sm:col-span-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                      Event Banner Image (Cloudinary) *
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Upload from computer or paste URL
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                    {/* Cloudinary File Upload Button */}
                    <div>
                      <label className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-indigo-300 bg-indigo-50/60 hover:bg-indigo-100/60 text-indigo-700 text-xs font-bold cursor-pointer transition-colors shadow-2xs">
                        {uploadingImage ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Uploading to Cloudinary...</span>
                          </>
                        ) : (
                          <>
                            <UploadCloud className="w-4 h-4" />
                            <span>Choose Image File</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploadingImage}
                          onChange={handleImageFileUpload}
                        />
                      </label>
                    </div>

                    {/* Manual URL Input */}
                    <div>
                      <input
                        type="url"
                        required
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        placeholder="https://res.cloudinary.com/..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:border-indigo-600"
                      />
                    </div>
                  </div>

                  {/* Image Live Preview */}
                  {formData.image && (
                    <div className="relative mt-2 rounded-2xl overflow-hidden aspect-[21/9] max-h-36 bg-slate-100 border border-slate-200 shadow-xs">
                      <img
                        src={formData.image}
                        alt="Event Banner Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      <div className="absolute top-2 right-2 flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-slate-900/80 text-white text-[10px] font-semibold backdrop-blur-xs">
                          {formData.image.includes('cloudinary') ? 'Cloudinary Hosted' : 'External URL'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, image: '' })}
                          className="bg-rose-600 hover:bg-rose-700 text-white p-1 rounded-full text-xs shadow-xs"
                          title="Remove Image"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Venue Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                    Venue *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    placeholder="e.g. Vagator Beach Arena"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:border-indigo-600"
                  />
                </div>

                {/* City */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Mumbai, Goa, Bengaluru"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:border-indigo-600"
                  />
                </div>

                {/* Detailed Address */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                    Full Venue Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. Coastal Highway Sector 4"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:border-indigo-600"
                  />
                </div>

                {/* Date */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:border-indigo-600"
                  />
                </div>

                {/* Times */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                      Start Time *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      placeholder="18:00"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:border-indigo-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                      End Time *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      placeholder="23:00"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:border-indigo-600"
                    />
                  </div>
                </div>

                {/* Ticket Price */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                    Ticket Price (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.ticketPrice}
                    onChange={(e) => setFormData({ ...formData, ticketPrice: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:border-indigo-600"
                  />
                </div>

                {/* Total Seats */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                    Total Seats *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.totalSeats}
                    onChange={(e) => setFormData({ ...formData, totalSeats: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:border-indigo-600"
                  />
                </div>

                {/* Description */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                    Description *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Provide full description of the event..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:border-indigo-600"
                  ></textarea>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={formSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-6 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  {formSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>{modalMode === 'create' ? 'Create Event' : 'Save Changes'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {eventToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Confirm Deletion</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to remove <strong>{eventToDelete.title}</strong>?
              </p>
              <p className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200 mt-2">
                Note: If this event already has confirmed attendees, it will be safely marked as cancelled to preserve audit logs.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEventToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteEvent}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs"
              >
                Delete Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEvents;
