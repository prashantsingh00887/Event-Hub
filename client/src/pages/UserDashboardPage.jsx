import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import TicketCard from '../components/TicketCard';
import {
  Ticket,
  Calendar,
  CreditCard,
  User,
  ArrowRight,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  Sparkles
} from 'lucide-react';

const UserDashboardPage = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data } = await API.get('/bookings/my');
        if (data.success) {
          setBookings(data.data);
        }
      } catch (err) {
        console.error('Error fetching user bookings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const confirmedCount = bookings.filter((b) => b.bookingStatus === 'Confirmed').length;
  const totalTickets = bookings
    .filter((b) => b.bookingStatus === 'Confirmed')
    .reduce((sum, b) => sum + (b.tickets || 0), 0);
  const totalSpent = bookings
    .filter((b) => b.paymentStatus === 'Paid')
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Member Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            Hello, {user?.name}!
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100 max-w-xl leading-relaxed">
            Manage your booked experiences, view digital passes with instant QR check-in, and explore upcoming events.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/events"
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-white text-indigo-900 hover:bg-indigo-50 shadow-md transition-all active:scale-95 flex items-center gap-1.5"
          >
            <span>Browse Events</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/profile"
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-500/30 hover:bg-indigo-500/50 border border-white/20 text-white transition-all"
          >
            Edit Profile
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Confirmed Bookings
            </span>
            <p className="text-3xl font-black text-slate-900">{confirmedCount}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Ticket className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Tickets
            </span>
            <p className="text-3xl font-black text-slate-900">{totalTickets}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Invested
            </span>
            <p className="text-3xl font-black text-slate-900">
              ₹{totalSpent.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Recent Bookings Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Recent Bookings & Passes
            </h2>
            <p className="text-xs text-slate-500">
              Your latest event tickets and passes
            </p>
          </div>
          <Link
            to="/my-bookings"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <span>View All ({bookings.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400 animate-pulse">
            Loading your bookings...
          </div>
        ) : bookings.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <Ticket className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">You haven't booked any events yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Discover concerts, hackathons, comedy nights and sports screenings happening near you.
            </p>
            <div className="pt-2">
              <Link
                to="/events"
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors inline-block"
              >
                Explore Events Now
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 overflow-x-auto">
            {bookings.slice(0, 5).map((booking) => {
              const event = booking.event || {};
              const eventDate = event.date
                ? new Date(event.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })
                : 'N/A';

              return (
                <div
                  key={booking._id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 p-2 rounded-2xl transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {event.image ? (
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <Ticket className="w-6 h-6 text-slate-400" />
                      </div>
                    )}

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {booking.bookingId}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            booking.bookingStatus === 'Confirmed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : booking.bookingStatus === 'Cancelled'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {booking.bookingStatus}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                        {event.title || 'Event Details'}
                      </h4>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {eventDate}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {event.city || 'Venue'}
                        </span>
                        <span>•</span>
                        <span className="font-semibold text-slate-700">
                          {booking.tickets} ticket(s)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Total</span>
                      <span className="text-sm font-black text-slate-900">
                        {booking.totalAmount === 0 ? 'Free' : `₹${booking.totalAmount?.toLocaleString('en-IN')}`}
                      </span>
                    </div>

                    <button
                      onClick={() => setSelectedTicket(booking)}
                      className="px-3.5 py-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors flex items-center gap-1"
                    >
                      <Ticket className="w-3.5 h-3.5" />
                      <span>Digital Pass</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Digital Pass Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl my-8">
            <button
              onClick={() => setSelectedTicket(null)}
              className="absolute -top-10 right-0 text-white hover:text-slate-200 text-xs font-bold bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-md"
            >
              Close [X]
            </button>
            <TicketCard booking={selectedTicket} />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboardPage;
