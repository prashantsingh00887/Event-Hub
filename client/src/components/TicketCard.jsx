import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Calendar,
  Clock,
  MapPin,
  Ticket,
  Printer,
  CheckCircle2,
  Share2,
  ShieldCheck,
  User
} from 'lucide-react';
import toast from 'react-hot-toast';

const TicketCard = ({ booking, onPrint }) => {
  if (!booking) return null;

  const event = booking.event || {};
  const formattedDate = event.date
    ? new Date(event.date).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : 'Date TBA';

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Event Ticket - ${event.title}`,
        text: `My booking for ${event.title} (Booking ID: ${booking.bookingId})`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Ticket link copied to clipboard!');
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-4">
      {/* Printable Digital Ticket */}
      <div
        id="printable-ticket"
        className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden relative"
      >
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 p-6 text-white relative">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-sm">
                EH
              </div>
              <span className="font-extrabold text-base tracking-tight">EventHub Pass</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 backdrop-blur-md">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{booking.bookingStatus.toUpperCase()}</span>
            </div>
          </div>

          <h2 className="text-xl font-black tracking-tight leading-snug">{event.title}</h2>
          <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/15 backdrop-blur-md">
            {event.category || 'General Admission'}
          </span>
        </div>

        {/* Ticket Perforated Divider */}
        <div className="relative flex items-center justify-between px-3 py-1 bg-white">
          <div className="w-6 h-6 rounded-full bg-slate-50 -ml-6 border-r border-slate-200"></div>
          <div className="flex-1 border-t-2 border-dashed border-slate-200 mx-2"></div>
          <div className="w-6 h-6 rounded-full bg-slate-50 -mr-6 border-l border-slate-200"></div>
        </div>

        {/* Ticket Details & QR Code */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Information Section */}
          <div className="md:col-span-2 space-y-3.5 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Booking ID
              </span>
              <span className="font-mono text-sm font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                {booking.bookingId}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Date
                </span>
                <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  {formattedDate}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Time
                </span>
                <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                  {event.startTime} - {event.endTime}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Venue Location
              </span>
              <span className="font-medium text-slate-800 flex items-start gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <span>{event.venue}, {event.address}, {event.city}</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Tickets Booked
                </span>
                <span className="font-bold text-slate-900 text-sm flex items-center gap-1">
                  <Ticket className="w-3.5 h-3.5 text-indigo-600" />
                  {booking.tickets} {booking.tickets === 1 ? 'Seat' : 'Seats'}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Total Paid
                </span>
                <span className="font-extrabold text-indigo-700 text-sm">
                  {booking.totalAmount === 0 ? 'Free' : `₹${booking.totalAmount?.toLocaleString('en-IN')}`}
                </span>
              </div>
            </div>

            {booking.user && (
              <div className="pt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
                <User className="w-3 h-3 text-slate-400" />
                <span>Ticket Holder: <strong>{booking.user.name || booking.user}</strong></span>
              </div>
            )}
          </div>

          {/* QR Code Section */}
          <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div className="p-2 bg-white rounded-xl shadow-xs border border-slate-200">
              <QRCodeSVG
                value={`EVENTHUB:${booking.bookingId}:${booking.user?._id || ''}`}
                size={110}
                level="H"
                includeMargin={false}
              />
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">
              Scan at Venue
            </span>
          </div>
        </div>

        {/* Security Badge Footer */}
        <div className="bg-slate-50/80 px-6 py-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Verified Digital Pass
          </span>
          <span>Payment: <strong>{booking.paymentStatus}</strong> {booking.paymentMethod === 'upi_qr' ? '(UPI)' : ''}</span>
        </div>
      </div>

      {/* Action Buttons (Hidden on Print) */}
      <div className="no-print flex items-center justify-center gap-3 pt-2">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl shadow-xs transition-colors"
        >
          <Printer className="w-4 h-4 text-indigo-600" />
          <span>Download / Print Ticket</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl shadow-xs transition-colors"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Share</span>
        </button>
      </div>
    </div>
  );
};

export default TicketCard;
