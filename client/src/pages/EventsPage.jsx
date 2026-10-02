import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../services/api';
import EventCard from '../components/EventCard';
import BookingModal from '../components/BookingModal';
import { EventCardSkeleton } from '../components/SkeletonLoader';
import {
  Search,
  Filter,
  SlidersHorizontal,
  Calendar,
  MapPin,
  RefreshCw,
  Sparkles,
  ArrowUpDown,
  X
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Music',
  'Concert',
  'Workshop',
  'Conference',
  'Sports',
  'Comedy',
  'Education',
  'Other'
];

const EventsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalEvents, setTotalEvents] = useState(0);
  const [cities, setCities] = useState([]);

  // Filter States
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [city, setCity] = useState(searchParams.get('city') || 'All');
  const [dateFilter, setDateFilter] = useState(searchParams.get('dateFilter') || 'all');
  const [sort, setSort] = useState(searchParams.get('sort') || 'date_asc');
  const [page, setPage] = useState(1);

  // Booking modal
  const [selectedEventForBooking, setSelectedEventForBooking] = useState(null);

  // Sync state with URL search parameters
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (search) queryParams.append('search', search);
        if (category && category !== 'All') queryParams.append('category', category);
        if (city && city !== 'All') queryParams.append('city', city);
        if (dateFilter && dateFilter !== 'all') queryParams.append('dateFilter', dateFilter);
        if (sort) queryParams.append('sort', sort);
        queryParams.append('page', page);
        queryParams.append('limit', 12);

        const { data } = await API.get(`/events?${queryParams.toString()}`);
        if (data.success) {
          setEvents(data.data);
          setTotalEvents(data.totalEvents);
          if (data.cities) {
            setCities(data.cities);
          }
        }
      } catch (err) {
        console.error('Failed to load events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [search, category, city, dateFilter, sort, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    updateUrlParams({ search, category, city, dateFilter, sort });
  };

  const updateUrlParams = (newFilters) => {
    const params = new URLSearchParams();
    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.category && newFilters.category !== 'All') params.set('category', newFilters.category);
    if (newFilters.city && newFilters.city !== 'All') params.set('city', newFilters.city);
    if (newFilters.dateFilter && newFilters.dateFilter !== 'all') params.set('dateFilter', newFilters.dateFilter);
    if (newFilters.sort) params.set('sort', newFilters.sort);
    setSearchParams(params);
  };

  const resetFilters = () => {
    setSearch('');
    setCategory('All');
    setCity('All');
    setDateFilter('all');
    setSort('date_asc');
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Explore All Events
        </h1>
        <p className="text-sm text-slate-500">
          Discover conferences, concerts, exhibitions, and standup shows across India.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm space-y-4">
        {/* Search input and Quick Filters */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by event title, description, or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 text-sm shadow-xs active:scale-95 transition-all"
          >
            Search
          </button>
        </form>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          {/* City Filter */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Location / City
            </label>
            <select
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                setPage(1);
              }}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 bg-white focus:outline-hidden focus:border-indigo-600 cursor-pointer"
            >
              <option value="All">All Cities</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              <option value="Bengaluru">Bengaluru</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Goa">Goa</option>
              <option value="Delhi">Delhi</option>
              <option value="Hyderabad">Hyderabad</option>
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Date Filter
            </label>
            <select
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setPage(1);
              }}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 bg-white focus:outline-hidden focus:border-indigo-600 cursor-pointer"
            >
              <option value="all">Any Date</option>
              <option value="today">Today</option>
              <option value="this_weekend">This Weekend</option>
              <option value="upcoming">Upcoming</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Sort By
            </label>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 bg-white focus:outline-hidden focus:border-indigo-600 cursor-pointer"
            >
              <option value="date_asc">Date: Soonest First</option>
              <option value="date_desc">Date: Latest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="newest">Recently Added</option>
            </select>
          </div>

          {/* Reset Filters Button */}
          <div className="flex items-end">
            <button
              type="button"
              onClick={resetFilters}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center justify-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="pt-2 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setCategory(cat);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                category === cat
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count Bar */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
        <span>
          Showing <strong>{events.length}</strong> of <strong>{totalEvents}</strong> events
        </span>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <EventCardSkeleton />
          <EventCardSkeleton />
          <EventCardSkeleton />
          <EventCardSkeleton />
          <EventCardSkeleton />
          <EventCardSkeleton />
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
          <Calendar className="w-16 h-16 text-slate-300 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-800">No events matched your search</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Try adjusting your category, city filter, or search keywords to find available events.
            </p>
          </div>
          <button
            onClick={resetFilters}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors shadow-xs"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((evt) => (
            <EventCard
              key={evt._id}
              event={evt}
              onBookNow={(e) => setSelectedEventForBooking(e)}
            />
          ))}
        </div>
      )}

      {/* Booking Checkout Modal */}
      {selectedEventForBooking && (
        <BookingModal
          event={selectedEventForBooking}
          isOpen={!!selectedEventForBooking}
          onClose={() => setSelectedEventForBooking(null)}
        />
      )}
    </div>
  );
};

export default EventsPage;
