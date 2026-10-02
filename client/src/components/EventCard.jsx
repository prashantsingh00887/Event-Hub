import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Clock, Users, ArrowRight, Tag } from 'lucide-react';

const EventCard = ({ event, onBookNow }) => {
  const navigate = useNavigate();

  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const isSoldOut = event.availableSeats === 0;
  const isLowSeats = event.availableSeats > 0 && event.availableSeats <= 15;

  const categoryColors = {
    Concert: 'bg-rose-50 text-rose-700 border-rose-200',
    Music: 'bg-violet-50 text-violet-700 border-violet-200',
    Conference: 'bg-blue-50 text-blue-700 border-blue-200',
    Workshop: 'bg-amber-50 text-amber-700 border-amber-200',
    Sports: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Comedy: 'bg-orange-50 text-orange-700 border-orange-200',
    Education: 'bg-teal-50 text-teal-700 border-teal-200',
    Other: 'bg-slate-50 text-slate-700 border-slate-200'
  };

  const pillClass = categoryColors[event.category] || categoryColors.Other;

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col hover:-translate-y-1">
      {/* Event Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80';
          }}
        />
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border backdrop-blur-md shadow-xs ${pillClass}`}>
            {event.category}
          </span>
        </div>

        {/* Seat Availability Badge */}
        <div className="absolute top-3 right-3">
          {isSoldOut ? (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-600 text-white shadow-sm">
              Sold Out
            </span>
          ) : isLowSeats ? (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500 text-white shadow-sm animate-pulse">
              Only {event.availableSeats} left!
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-900/70 text-white backdrop-blur-sm">
              {event.availableSeats} seats left
            </span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Date & Time */}
          <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1.5 text-indigo-600 font-semibold">
              <Calendar className="w-3.5 h-3.5" />
              {formattedDate}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {event.startTime}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
            <Link to={`/events/${event._id}`}>{event.title}</Link>
          </h3>

          {/* Venue & City */}
          <p className="flex items-center gap-1.5 text-xs text-slate-500 line-clamp-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span>{event.venue}, {event.city}</span>
          </p>

          {/* Description Snippet */}
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {event.description}
          </p>
        </div>

        {/* Pricing and Action Buttons */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Ticket from</span>
            <span className="text-lg font-black text-slate-900">
              {event.ticketPrice === 0 ? 'Free' : `₹${event.ticketPrice.toLocaleString('en-IN')}`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/events/${event._id}`}
              className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-indigo-600 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors"
            >
              Details
            </Link>

            <button
              onClick={() => {
                if (onBookNow) {
                  onBookNow(event);
                } else {
                  navigate(`/events/${event._id}`);
                }
              }}
              disabled={isSoldOut}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-1 shadow-sm transition-all active:scale-95 ${
                isSoldOut
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-md hover:shadow-indigo-200'
              }`}
            >
              <span>{isSoldOut ? 'Sold Out' : 'Book Now'}</span>
              {!isSoldOut && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
