import React, { useState, useEffect } from 'react';
import API from '../services/api';
import TicketCard from '../components/TicketCard';
import {
  Ticket,
  Calendar,
  MapPin,
  Clock,
  Printer,
  XCircle,
  AlertCircle,
  CheckCircle2,
  Filter,
  Search,
  ExternalLink,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/bookings/my');
      if (data.success) {
        setBookings(data.data);
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
      toast.error('Failed to retrieve your bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async () => {
    if (!cancellingBooking) return;
    setCancelLoading(true);
    try {
      const { data } = await API.put(`/bookings/${cancellingBooking._id}/cancel`);
      if (data.success) {
        toast.success('Booking cancelled successfully. Seats have been restored.');
        setCancellingBooking(null);
        fetchBookings();
      }
    } catch (err) {
      console.error('Cancellation error:', err);
      toast.error(err.response?.data?.message || 'Could not cancel booking.');
    } finally {
      setCancelLoading(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = filterStatus === 'All' || b.bookingStatus === filterStatus;
    const title = b.event?.title?.toLowerCase() || '';
    const id = b.bookingId?.toLowerCase() || '';
    const matchesSearch =
      title.includes(searchTerm.toLowerCase()) || id.includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Bookings</h1>
          <p className="text-sm text-slate-500">
            View your event tickets, digital entry QR passes, and booking history.
          </p>
        </div>

        {/* Filter and Search */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by event or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-indigo-600 bg-white"
            />
          </div>

          <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-xl">
            {['All', 'Confirmed', 'Pending', 'Cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filterStatus === status
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <span>Retrieving your bookings...</span>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <Ticket className="w-16 h-16 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No bookings found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchTerm || filterStatus !== 'All'
              ? 'No bookings match your selected filter criteria.'
              : 'You have not booked any tickets yet. Explore upcoming events to reserve your spot!'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const event = booking.event || {};
            const eventDate = event.date
              ? new Date(event.date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })
              : 'Date TBA';

            const bookingDate = new Date(booking.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });

            const isPastEvent = event.date && new Date(event.date) < new Date();
            const canCancel =
              booking.bookingStatus === 'Confirmed' && !isPastEvent;

            return (
              <div
                key={booking._id}
                className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                {/* Event info */}
                <div className="flex items-start gap-4 sm:gap-6">
                  {event.image ? (
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <Ticket className="w-8 h-8 text-slate-400" />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {booking.bookingId}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          booking.bookingStatus === 'Confirmed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : booking.bookingStatus === 'Cancelled'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {booking.bookingStatus}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Booked on {bookingDate}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      {event.title || 'Event Name'}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                        {eventDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {event.startTime} - {event.endTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {event.venue}, {event.city}
                      </span>
                    </div>

                    <div className="pt-1 flex items-center gap-3 text-xs">
                      <span className="font-semibold text-slate-800">
                        Tickets: <strong>{booking.tickets}</strong>
                      </span>
                      <span>•</span>
                      <span className="text-slate-500">
                        Payment: <strong className="text-slate-700">{booking.paymentStatus}</strong>
                        {booking.paymentMethod === 'upi_qr' && (
                          <span className="ml-1 text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">UPI</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pricing & Actions */}
                <div className="flex lg:flex-col items-center lg:items-end justify-between gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  <div className="lg:text-right">
                    <span className="text-[11px] text-slate-400 block font-medium">Total Paid</span>
                    <span className="text-xl font-black text-slate-900">
                      {booking.totalAmount === 0 ? 'Free' : `₹${booking.totalAmount?.toLocaleString('en-IN')}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* View Digital Pass */}
                    <button
                      onClick={() => setSelectedTicket(booking)}
                      className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 active:scale-95"
                    >
                      <Ticket className="w-3.5 h-3.5" />
                      <span>View Pass</span>
                    </button>

                    {/* Cancel Booking option if eligible */}
                    {canCancel && (
                      <button
                        onClick={() => setCancellingBooking(booking)}
                        className="px-3.5 py-2 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

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

      {/* Cancellation Confirmation Dialog */}
      {cancellingBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Cancel Booking?</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to cancel booking <strong>{cancellingBooking.bookingId}</strong> for{' '}
                <em>{cancellingBooking.event?.title}</em>?
              </p>
              <p className="text-xs text-rose-600 font-medium pt-1">
                Your seats ({cancellingBooking.tickets}) will be immediately released back to the general pool.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setCancellingBooking(null)}
                disabled={cancelLoading}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Keep Booking
              </button>
              <button
                type="button"
                onClick={handleCancelBooking}
                disabled={cancelLoading}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl flex items-center gap-1.5"
              >
                {cancelLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <span>Confirm Cancellation</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
