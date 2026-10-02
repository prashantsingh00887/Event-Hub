import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import BookingModal from '../components/BookingModal';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  Clock,
  MapPin,
  Ticket,
  ShieldCheck,
  Share2,
  ChevronLeft,
  ArrowRight,
  AlertCircle,
  Users,
  Building,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

const EventDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data } = await API.get(`/events/${id}`);
        if (data.success) {
          setEvent(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch event:', err);
        setError('Event not found or has been removed.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-pulse space-y-6">
        <div className="h-8 bg-slate-200 rounded w-1/4"></div>
        <div className="h-96 bg-slate-200 rounded-3xl"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-10 bg-slate-200 rounded w-3/4"></div>
            <div className="h-24 bg-slate-200 rounded"></div>
          </div>
          <div className="h-64 bg-slate-200 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-4">
        <AlertCircle className="w-16 h-16 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-800">Event Not Found</h2>
        <p className="text-sm text-slate-500">{error || 'This event could not be found.'}</p>
        <Link
          to="/events"
          className="inline-block px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-sm"
        >
          Return to Events
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const isSoldOut = event.availableSeats === 0;
  const totalPrice = event.ticketPrice * ticketQuantity;
  const maxAllowedTickets = Math.min(event.availableSeats, 10);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: `Check out ${event.title} on EventHub!`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Event link copied to clipboard!');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back Button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors bg-white px-3 py-1.5 rounded-lg border border-slate-200"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Browse</span>
        </button>
      </div>

      {/* Hero Banner with Image */}
      <div className="relative rounded-3xl overflow-hidden aspect-[21/9] min-h-[300px] max-h-[500px] bg-slate-900 shadow-xl border border-slate-200">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover opacity-85"
          onError={(e) => {
            e.target.src =
              'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

        {/* Overlay Badges */}
        <div className="absolute top-6 left-6 flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-white text-slate-900 shadow-md">
            {event.category}
          </span>
          <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-slate-900/80 text-white backdrop-blur-md border border-white/20">
            {event.city}
          </span>
        </div>

        {/* Share Button */}
        <div className="absolute top-6 right-6">
          <button
            onClick={handleShare}
            className="p-2.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white transition-colors"
            title="Share Event"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        {/* Bottom Hero Info */}
        <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            {event.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-200">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-400" />
              {formattedDate}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-400" />
              {event.startTime} - {event.endTime}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-indigo-400" />
              {event.venue}, {event.city}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Details & Sticky Checkout Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Event Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Info Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Price Per Ticket
              </span>
              <p className="text-xl font-black text-slate-900">
                {event.ticketPrice === 0 ? 'Free' : `₹${event.ticketPrice.toLocaleString('en-IN')}`}
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Remaining Seats
              </span>
              <p className="text-xl font-black text-slate-900">
                {isSoldOut ? (
                  <span className="text-rose-600">Sold Out</span>
                ) : (
                  `${event.availableSeats} / ${event.totalSeats}`
                )}
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 space-y-1 col-span-2 sm:col-span-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Status
              </span>
              <p className="text-xl font-black text-emerald-600 capitalize">
                {event.status}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 space-y-4">
            <h2 className="text-xl font-bold text-slate-900">About This Event</h2>
            <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line space-y-3">
              {event.description}
            </div>
          </div>

          {/* Venue & Location Information */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Building className="w-5 h-5 text-indigo-600" />
              <span>Venue & Location</span>
            </h2>
            <div className="space-y-2 text-sm text-slate-600">
              <p className="font-bold text-slate-800 text-base">{event.venue}</p>
              <p className="text-slate-500">{event.address}</p>
              <p className="font-semibold text-slate-700">{event.city}, India</p>
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Booking Widget */}
        <div className="sticky top-24">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 block">
                Secure Reservation
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 mt-1">Book Tickets</h3>
            </div>

            {/* Seat Availability Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium text-slate-600">
                <span>Seat Capacity</span>
                <span className="font-bold text-slate-800">
                  {event.availableSeats} left of {event.totalSeats}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isSoldOut
                      ? 'bg-rose-500'
                      : event.availableSeats < 20
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{
                    width: `${((event.totalSeats - event.availableSeats) / event.totalSeats) * 100}%`
                  }}
                ></div>
              </div>
            </div>

            {/* Ticket Counter */}
            {!isSoldOut && (
              <div className="space-y-3 pt-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Select Quantity
                </label>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <div>
                    <span className="text-sm font-bold text-slate-800">Tickets</span>
                    <span className="text-[11px] text-slate-400 block">
                      Max {maxAllowedTickets} per order
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setTicketQuantity(Math.max(1, ticketQuantity - 1))}
                      disabled={ticketQuantity <= 1}
                      className="w-9 h-9 rounded-xl border border-slate-300 bg-white font-bold text-slate-700 flex items-center justify-center hover:bg-slate-100 disabled:opacity-30 transition-colors"
                    >
                      -
                    </button>
                    <span className="font-extrabold text-base w-6 text-center text-slate-900">
                      {ticketQuantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setTicketQuantity(Math.min(maxAllowedTickets, ticketQuantity + 1))}
                      disabled={ticketQuantity >= maxAllowedTickets}
                      className="w-9 h-9 rounded-xl border border-slate-300 bg-white font-bold text-slate-700 flex items-center justify-center hover:bg-slate-100 disabled:opacity-30 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Price Summary */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Price ({ticketQuantity}x)</span>
                <span>
                  {event.ticketPrice === 0 ? 'Free' : `₹${event.ticketPrice.toLocaleString('en-IN')}`}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Platform Convenience Fee</span>
                <span className="text-emerald-600 font-bold">₹0</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline font-bold text-slate-900">
                <span className="text-sm">Total Amount</span>
                <span className="text-xl font-extrabold text-indigo-600">
                  {totalPrice === 0 ? 'Free' : `₹${totalPrice.toLocaleString('en-IN')}`}
                </span>
              </div>
            </div>

            {/* Book Now Button */}
            <button
              onClick={() => setIsBookingModalOpen(true)}
              disabled={isSoldOut}
              className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 ${
                isSoldOut
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
              }`}
            >
              <Ticket className="w-4 h-4" />
              <span>{isSoldOut ? 'Event Sold Out' : 'Book Tickets Now'}</span>
            </button>

            <div className="text-[11px] text-slate-400 text-center space-y-1">
              <p className="flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                Guaranteed genuine QR tickets
              </p>
              <p>Instant confirmation delivered immediately to your account.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Checkout Modal */}
      <BookingModal
        event={event}
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onBookingSuccess={(booking) => {
          navigate(`/confirmation/${booking._id}`, { state: { booking } });
        }}
      />
    </div>
  );
};

export default EventDetailsPage;
