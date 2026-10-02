import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import EventCard from '../components/EventCard';
import BookingModal from '../components/BookingModal';
import { EventCardSkeleton } from '../components/SkeletonLoader';
import {
  Sparkles,
  Search,
  MapPin,
  Calendar,
  Ticket,
  ShieldCheck,
  Zap,
  Headphones,
  Award,
  ArrowRight,
  Music,
  Mic2,
  Cpu,
  GraduationCap,
  Trophy,
  Smile,
  Compass
} from 'lucide-react';

const CATEGORIES = [
  { name: 'Concert', icon: Music, color: 'from-pink-500 to-rose-600', count: 'Live Shows' },
  { name: 'Conference', icon: Cpu, color: 'from-blue-500 to-indigo-600', count: 'Tech & Summits' },
  { name: 'Workshop', icon: Award, color: 'from-amber-500 to-orange-600', count: 'Skill Bootcamps' },
  { name: 'Comedy', icon: Smile, color: 'from-purple-500 to-violet-600', count: 'Standup Nights' },
  { name: 'Sports', icon: Trophy, color: 'from-emerald-500 to-teal-600', count: 'Matches & Fan Fests' },
  { name: 'Education', icon: GraduationCap, color: 'from-cyan-500 to-sky-600', count: 'Science & Robotics' },
];

const HomePage = () => {
  const navigate = useNavigate();
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [cities, setCities] = useState([]);

  // Booking modal state
  const [selectedEventForBooking, setSelectedEventForBooking] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await API.get('/events?limit=6&sort=newest');
        if (data.success) {
          setFeaturedEvents(data.data);
          if (data.cities) {
            setCities(data.cities);
          }
        }
      } catch (err) {
        console.error('Failed to load featured events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append('search', searchQuery.trim());
    if (selectedCity && selectedCity !== 'All') params.append('city', selectedCity);
    navigate(`/events?${params.toString()}`);
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-900/5 via-slate-50 to-slate-50 pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-slate-200/60">
        <div className="absolute inset-0 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs sm:text-sm font-semibold shadow-xs animate-fade-in">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Next-Gen Online Event Booking Platform</span>
          </div>

          {/* Heading */}
          <div className="max-w-4xl mx-auto space-y-4">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.1]">
              Discover. Book.{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
                Experience.
              </span>
            </h1>
            <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Find and book amazing events near you with a simple and secure online booking experience.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/events"
              className="px-8 py-3.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 transition-all active:scale-95 flex items-center gap-2 text-sm sm:text-base"
            >
              <Compass className="w-5 h-5" />
              <span>Explore Events</span>
            </Link>
            <Link
              to="/register"
              className="px-8 py-3.5 rounded-xl font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 shadow-xs hover:border-slate-400 transition-all text-sm sm:text-base"
            >
              Create Account
            </Link>
          </div>

          {/* Search Bar Form */}
          <div className="pt-6 max-w-3xl mx-auto">
            <form
              onSubmit={handleSearchSubmit}
              className="p-2 sm:p-3 bg-white rounded-2xl shadow-xl shadow-slate-200/70 border border-slate-200 flex flex-col sm:flex-row items-center gap-2"
            >
              <div className="flex-1 w-full flex items-center px-3 gap-2 border-b sm:border-b-0 sm:border-r border-slate-100 py-2 sm:py-0">
                <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search concert, comedy, AI summit..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
                />
              </div>

              <div className="w-full sm:w-48 flex items-center px-3 gap-2 py-2 sm:py-0">
                <MapPin className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full text-sm font-medium text-slate-700 bg-transparent focus:outline-hidden cursor-pointer"
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

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all text-sm flex items-center justify-center gap-1.5 shadow-md shadow-indigo-100"
              >
                <span>Find Events</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Featured / Upcoming Events */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
              <Calendar className="w-4 h-4" />
              <span>Handpicked For You</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Featured & Upcoming Events
            </h2>
          </div>
          <Link
            to="/events"
            className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group"
          >
            <span>View All Events</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <EventCardSkeleton />
            <EventCardSkeleton />
            <EventCardSkeleton />
          </div>
        ) : featuredEvents.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-base font-semibold text-slate-700">No events found at the moment.</p>
            <p className="text-xs text-slate-400 mt-1">Check back soon for upcoming experiences.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEvents.map((evt) => (
              <EventCard
                key={evt._id}
                event={evt}
                onBookNow={(e) => setSelectedEventForBooking(e)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Popular Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Browse By Interest
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Popular Categories
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            From stadium music festivals to intimate workshops, explore what inspires you.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.name}
                to={`/events?category=${cat.name}`}
                className="group bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-300 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center space-y-3 hover:-translate-y-1"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${cat.color} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                    {cat.name}
                  </h3>
                  <span className="text-[11px] text-slate-400">{cat.count}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-slate-100/70 border-y border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Seamless Experience
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              How EventHub Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Booking your tickets takes less than 60 seconds with instant verification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xs text-center space-y-4 relative">
              <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 font-black text-lg flex items-center justify-center mx-auto border border-indigo-200">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900">Explore Events</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Filter through live concerts, tech meetups, sports events, and workshops across cities.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xs text-center space-y-4 relative">
              <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 font-black text-lg flex items-center justify-center mx-auto border border-indigo-200">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900">Select Seats & Pay</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Choose your ticket count, view transparent pricing, and pay securely via Razorpay gateway.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xs text-center space-y-4 relative">
              <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 font-black text-lg flex items-center justify-center mx-auto border border-indigo-200">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900">Get Digital QR Pass</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Instant digital ticket generated with unique Booking ID & QR code for fast venue check-in.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Trust & Reliability
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Why Choose EventHub
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Designed for convenience, verified organizers, and uninterrupted safety.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 bg-white rounded-2xl border border-slate-200/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">100% Verified Organizers</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every event is vetted and verified to guarantee genuine tickets and real experiences.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Instant QR Entry</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              No paper printouts needed. Flash your digital ticket with encrypted QR code right on your phone.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Ticket className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Zero Hidden Surcharges</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              What you see is what you pay. Transparent pricing with complete itemized breakdown.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Headphones className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Dedicated Support</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Our 24/7 customer care team is always here to resolve booking issues or event updates.
            </p>
          </div>
        </div>
      </section>

      {/* Call To Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 text-white p-8 sm:p-14 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative max-w-2xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
              Get Started Today
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Experience Unforgettable Moments?
            </h2>
            <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed">
              Join thousands of enthusiastic attendees discovering the most vibrant events in India.
              Book in seconds with verified authenticity.
            </p>

            <div className="pt-4 flex flex-wrap gap-4">
              <Link
                to="/events"
                className="px-6 py-3 rounded-xl font-bold bg-white text-indigo-900 hover:bg-slate-100 transition-colors shadow-md text-sm"
              >
                Browse All Events
              </Link>
              <Link
                to="/register"
                className="px-6 py-3 rounded-xl font-bold text-white bg-indigo-600/80 hover:bg-indigo-600 border border-indigo-400/30 transition-colors text-sm"
              >
                Sign Up Free
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Checkout Modal */}
      {selectedEventForBooking && (
        <BookingModal
          event={selectedEventForBooking}
          isOpen={!!selectedEventForBooking}
          onClose={() => setSelectedEventForBooking(null)}
          onBookingSuccess={(booking) => {
            navigate(`/confirmation/${booking._id}`, { state: { booking } });
          }}
        />
      )}
    </div>
  );
};

export default HomePage;
