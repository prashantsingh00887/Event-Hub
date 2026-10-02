import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import TicketCard from '../components/TicketCard';
import {
  CheckCircle,
  Calendar,
  Ticket,
  ArrowRight,
  Printer,
  Sparkles,
  Loader2,
  Compass
} from 'lucide-react';

const BookingConfirmationPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(!booking);

  useEffect(() => {
    if (!booking && id) {
      const fetchBooking = async () => {
        try {
          const { data } = await API.get(`/bookings/${id}`);
          if (data.success) {
            setBooking(data.data);
          }
        } catch (err) {
          console.error('Failed to load booking:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchBooking();
    }
  }, [id, booking]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="text-sm font-medium text-slate-500">Generating digital pass...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Booking details unavailable</h2>
        <Link to="/events" className="text-indigo-600 font-semibold text-sm">
          &larr; Return to Events
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Confirmation Success Header */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
          <CheckCircle className="w-10 h-10" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Payment Verified & Confirmed</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Booking Confirmed!
        </h1>
        <p className="text-sm text-slate-500 max-w-lg mx-auto">
          Your reservation is successfully processed. Present your digital QR ticket at the event gate for seamless admission.
        </p>
      </div>

      {/* Digital Pass Ticket Card */}
      <TicketCard booking={booking} />

      {/* Quick Navigation Action Buttons */}
      <div className="no-print flex flex-wrap items-center justify-center gap-4 pt-6 border-t border-slate-200">
        <Link
          to="/my-bookings"
          className="px-6 py-3 rounded-xl font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 shadow-xs transition-colors text-xs sm:text-sm flex items-center gap-2"
        >
          <Ticket className="w-4 h-4 text-indigo-600" />
          <span>View All My Bookings</span>
        </Link>

        <Link
          to="/events"
          className="px-6 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-colors text-xs sm:text-sm flex items-center gap-2"
        >
          <Compass className="w-4 h-4" />
          <span>Explore More Events</span>
        </Link>
      </div>
    </div>
  );
};

export default BookingConfirmationPage;
