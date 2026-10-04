import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import toast from 'react-hot-toast';
import {
  X,
  Calendar,
  MapPin,
  Clock,
  Ticket,
  CreditCard,
  QrCode,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  User,
  Mail,
  Phone,
  Copy,
  Check,
  ExternalLink,
  Smartphone,
  Sparkles
} from 'lucide-react';

const BookingModal = ({ event, isOpen, onClose, onBookingSuccess }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [tickets, setTickets] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('upi_qr'); // 'upi_qr' or 'razorpay'
  const [utrNumber, setUtrNumber] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !event) return null;

  const totalAmount = event.ticketPrice * tickets;
  const maxAvailable = Math.min(event.availableSeats, 10); // cap per single booking at 10 or available seats
  const upiId = '9628676007@fam';
  const payeeName = 'Prashant singh';
  const upiDeepLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${totalAmount}&cu=INR&tn=${encodeURIComponent(`EventHub ${event.title}`)}`;

  const handleTicketChange = (delta) => {
    const nextVal = tickets + delta;
    if (nextVal >= 1 && nextVal <= maxAvailable) {
      setTickets(nextVal);
      setErrorMsg('');
    }
  };

  const handleCopyUPI = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(upiId);
    }
    setCopied(true);
    toast.success(`UPI ID copied: ${upiId}`);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleBooking = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to your account to book tickets.');
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    if (tickets <= 0 || tickets > event.availableSeats) {
      setErrorMsg(`Please select between 1 and ${event.availableSeats} tickets.`);
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      // 1. Create Booking on Backend
      const { data: bookingRes } = await API.post('/bookings', {
        eventId: event._id,
        tickets,
      });

      if (!bookingRes.success) {
        throw new Error(bookingRes.message || 'Failed to initiate booking');
      }

      const booking = bookingRes.data;

      // 2. If Event is Free, it was auto-confirmed on backend!
      if (totalAmount === 0 || booking.bookingStatus === 'Confirmed') {
        toast.success('Free event tickets booked successfully!');
        setLoading(false);
        onClose();
        if (onBookingSuccess) {
          onBookingSuccess(booking);
        } else {
          navigate(`/confirmation/${booking._id}`, { state: { booking } });
        }
        return;
      }

      // 3. Option A: UPI QR Payment Flow (Prashant singh QR)
      if (paymentMethod === 'upi_qr') {
        const { data: upiRes } = await API.post('/payments/confirm-upi', {
          bookingId: booking._id,
          utrNumber: utrNumber.trim() || `UPI-${Date.now()}`
        });

        if (!upiRes.success) {
          throw new Error(upiRes.message || 'UPI Payment confirmation failed');
        }

        toast.success('Payment verified! Your booking has been confirmed.');
        setLoading(false);
        onClose();
        if (onBookingSuccess) {
          onBookingSuccess(upiRes.data.booking);
        } else {
          navigate(`/confirmation/${booking._id}`, {
            state: { booking: upiRes.data.booking }
          });
        }
        return;
      }

      // 4. Option B: Razorpay Gateway Flow
      const { data: orderRes } = await API.post('/payments/create-order', {
        bookingId: booking._id,
      });

      if (!orderRes.success) {
        throw new Error(orderRes.message || 'Could not initiate payment order');
      }

      const orderData = orderRes.data;

      // Check if Razorpay Checkout script is loaded
      if (typeof window.Razorpay === 'undefined') {
        throw new Error('Razorpay payment gateway failed to load. Please use UPI QR payment above.');
      }

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'EventHub',
        description: `Booking for ${event.title}`,
        image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=128&q=80',
        order_id: orderData.orderId,
        prefill: {
          name: user?.name || orderData.userName,
          email: user?.email || orderData.userEmail,
          contact: user?.phone || orderData.userPhone,
        },
        theme: {
          color: '#4f46e5',
        },
        handler: async function (response) {
          try {
            setLoading(true);
            const { data: verifyRes } = await API.post('/payments/verify', {
              bookingId: booking._id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              isSimulated: orderData.isSimulated
            });

            if (verifyRes.success) {
              toast.success('Payment verified! Booking confirmed.');
              onClose();
              if (onBookingSuccess) {
                onBookingSuccess(verifyRes.data.booking);
              } else {
                navigate(`/confirmation/${booking._id}`, {
                  state: { booking: verifyRes.data.booking },
                });
              }
            } else {
              toast.error(verifyRes.message || 'Payment verification failed');
            }
          } catch (verifyErr) {
            console.error('Payment verification error:', verifyErr);
            toast.error(
              verifyErr.response?.data?.message ||
                'Payment verification failed on server. Please contact support.'
            );
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            toast('Payment window closed. Your booking is pending.', {
              icon: 'ℹ️',
            });
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on('payment.failed', function (response) {
        setLoading(false);
        toast.error(`Payment failed: ${response.error.description}`);
      });

      razorpayInstance.open();
    } catch (err) {
      console.error('Booking submission error:', err);
      const msg = err.response?.data?.message || err.message || 'Something went wrong while booking.';
      setErrorMsg(msg);
      toast.error(msg);
      setLoading(false);
    }
  };

  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white relative">
          <button
            onClick={onClose}
            disabled={loading}
            className="absolute top-5 right-5 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <Ticket className="w-5 h-5 text-indigo-200" />
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-200">
              Event Checkout
            </span>
          </div>
          <h2 className="text-xl font-bold line-clamp-1">{event.title}</h2>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-indigo-100 mt-2">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formattedDate}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {event.startTime} - {event.endTime}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {event.venue}, {event.city}
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* User Details Notice */}
          {isAuthenticated ? (
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 text-xs space-y-1.5">
              <p className="font-semibold text-slate-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-600" />
                <span>Ticket Holder: {user?.name}</span>
              </p>
              <div className="flex flex-wrap items-center gap-x-4 text-slate-500">
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3 text-slate-400" />
                  {user?.email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  {user?.phone}
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-2xl text-xs flex items-center justify-between">
              <span>You must be logged in to complete booking.</span>
              <button
                onClick={() => navigate('/login', { state: { from: window.location.pathname } })}
                className="px-3 py-1 font-semibold text-amber-900 bg-amber-200 hover:bg-amber-300 rounded-lg"
              >
                Login Now
              </button>
            </div>
          )}

          {/* Ticket Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-bold text-slate-900 block">
                  Select Tickets
                </label>
                <span className="text-xs text-slate-500">
                  {event.availableSeats} seat{event.availableSeats === 1 ? '' : 's'} remaining
                </span>
              </div>

              {/* Quantity Counter */}
              <div className="flex items-center border border-slate-300 rounded-xl bg-slate-50 p-1">
                <button
                  type="button"
                  onClick={() => handleTicketChange(-1)}
                  disabled={tickets <= 1 || loading}
                  className="w-8 h-8 flex items-center justify-center font-bold text-slate-700 hover:bg-white rounded-lg disabled:opacity-30 transition-colors"
                >
                  -
                </button>
                <span className="w-10 text-center font-bold text-sm text-slate-900">
                  {tickets}
                </span>
                <button
                  type="button"
                  onClick={() => handleTicketChange(1)}
                  disabled={tickets >= maxAvailable || loading}
                  className="w-8 h-8 flex items-center justify-center font-bold text-slate-700 hover:bg-white rounded-lg disabled:opacity-30 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {event.availableSeats <= 10 && event.availableSeats > 0 && (
              <p className="text-xs text-amber-600 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Hurry! Seats are filling up rapidly.
              </p>
            )}
          </div>

          {/* Payment Method Selector (Only for Paid Events) */}
          {totalAmount > 0 && (
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                Choose Payment Method
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {/* UPI QR Option */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi_qr')}
                  className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all ${
                    paymentMethod === 'upi_qr'
                      ? 'border-indigo-600 bg-indigo-50/70 shadow-xs ring-2 ring-indigo-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${paymentMethod === 'upi_qr' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block flex items-center gap-1">
                      UPI QR Code
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-extrabold">Instant</span>
                    </span>
                    <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">
                      GPay, PhonePe, Paytm, FamApp
                    </span>
                  </div>
                </button>

                {/* Razorpay Option */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('razorpay')}
                  className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all ${
                    paymentMethod === 'razorpay'
                      ? 'border-indigo-600 bg-indigo-50/70 shadow-xs ring-2 ring-indigo-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${paymentMethod === 'razorpay' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Card / NetBanking
                    </span>
                    <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">
                      Razorpay Gateway
                    </span>
                  </div>
                </button>
              </div>

              {/* UPI QR Display Card */}
              {paymentMethod === 'upi_qr' && (
                <div className="bg-gradient-to-b from-slate-900 to-slate-800 text-white rounded-3xl p-5 shadow-xl border border-slate-700/60 space-y-4">
                  <div className="text-center space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded-full border border-indigo-800/80">
                      Scan To Pay
                    </span>
                    <h3 className="text-base font-extrabold text-white">
                      {payeeName}
                    </h3>
                    <div className="flex items-center justify-center gap-2 pt-0.5">
                      <span className="font-mono text-xs text-slate-300 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
                        {upiId}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyUPI}
                        className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1 transition-colors"
                        title="Copy UPI ID"
                      >
                        {copied ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  {/* QR Image Box */}
                  <div className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl mx-auto max-w-[210px] shadow-lg">
                    <img
                      src="/upi-qr.png"
                      alt="UPI QR Code for Payment"
                      className="w-44 h-44 object-contain rounded-xl"
                      onError={(e) => {
                        // Fallback to dynamic qr if image fails
                        e.target.onerror = null;
                        e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiDeepLink)}`;
                      }}
                    />
                    <span className="text-[10px] font-bold text-slate-500 mt-1">
                      FamApp • GPay • PhonePe • Paytm
                    </span>
                  </div>

                  {/* Direct Mobile UPI Pay Link */}
                  <div className="text-center pt-1">
                    <a
                      href={upiDeepLink}
                      className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-indigo-300 hover:text-indigo-200 underline underline-offset-2"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Tap to open UPI app on mobile</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* UTR Input */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-700/60">
                    <label className="text-[11px] font-medium text-slate-300 block">
                      12-Digit UPI Transaction / UTR Number <span className="text-slate-400">(Optional)</span>:
                    </label>
                    <input
                      type="text"
                      maxLength={18}
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                      placeholder="e.g. 428172918291"
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-600 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-indigo-400 font-mono"
                    />
                    <p className="text-[10px] text-slate-400">
                      Scan QR & pay from any UPI app, then click below to confirm.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Price Calculation Card */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2 text-sm">
            <div className="flex justify-between text-slate-600 text-xs">
              <span>Ticket Price ({tickets}x)</span>
              <span>
                {event.ticketPrice === 0 ? 'Free' : `₹${event.ticketPrice.toLocaleString('en-IN')}`}
              </span>
            </div>
            <div className="flex justify-between text-slate-600 text-xs">
              <span>Booking Fee / Taxes</span>
              <span className="text-emerald-600 font-medium">₹0 (Waived)</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline font-bold text-slate-900">
              <span>Total Payable</span>
              <span className="text-xl font-extrabold text-indigo-600">
                {totalAmount === 0 ? 'Free' : `₹${totalAmount.toLocaleString('en-IN')}`}
              </span>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Secure Payment Footer Badges */}
          <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Instant Confirmation
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              Verified & Secure
            </span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-5 sm:p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleBooking}
            disabled={loading || event.availableSeats === 0}
            className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-md shadow-indigo-200 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : totalAmount === 0 ? (
              <span>Confirm Free Booking</span>
            ) : paymentMethod === 'upi_qr' ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>I Have Paid ₹{totalAmount.toLocaleString('en-IN')} — Confirm</span>
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                <span>Pay ₹{totalAmount.toLocaleString('en-IN')} & Book</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
