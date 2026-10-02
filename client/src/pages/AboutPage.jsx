import React from 'react';
import { Calendar, Shield, Users, Award, Heart, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const AboutPage = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
          Our Mission
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Empowering Real-World Experiences
        </h1>
        <p className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto">
          EventHub is the premier ticketing and live event discovery platform connecting attendees with festivals, technology conferences, sports screenings, and intimate workshops.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Secure & Transparent</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Bank-grade payment security via Razorpay, instant HMAC cryptographic verification, and tamper-proof QR passes.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Community Focused</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            We partner with trusted creators, indie performers, tech organizations, and sports franchises across India.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Instant Digital Passes</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            No paper tickets required. Effortless QR code check-ins deliver instant venue admission.
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-indigo-900 to-violet-900 text-white rounded-3xl p-8 sm:p-12 text-center space-y-4">
        <h2 className="text-2xl sm:text-3xl font-extrabold">Join the EventHub Movement</h2>
        <p className="text-xs sm:text-sm text-indigo-100 max-w-xl mx-auto">
          Start discovering the most captivating live events near you today.
        </p>
        <div className="pt-2">
          <Link
            to="/events"
            className="px-6 py-3 rounded-xl font-bold bg-white text-indigo-900 hover:bg-slate-100 transition-colors inline-block text-xs sm:text-sm"
          >
            Browse Events Catalog
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
