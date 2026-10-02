import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Mail, Phone, MapPin, Heart, Shield, Lock } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="mt-auto bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">EventHub</span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Discover. Book. Experience. The trusted platform for live concerts, tech conferences, workshops, sports festivals, and comedy shows.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                Verified Events
              </span>
              <span className="flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-indigo-400" />
                Razorpay Secured
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Explore
            </h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/events" className="hover:text-white transition-colors">
                  All Events
                </Link>
              </li>
              <li>
                <Link to="/events?category=Concert" className="hover:text-white transition-colors">
                  Concerts & Live Shows
                </Link>
              </li>
              <li>
                <Link to="/events?category=Conference" className="hover:text-white transition-colors">
                  Tech Conferences
                </Link>
              </li>
              <li>
                <Link to="/events?category=Workshop" className="hover:text-white transition-colors">
                  Hands-On Workshops
                </Link>
              </li>
              <li>
                <Link to="/events?category=Comedy" className="hover:text-white transition-colors">
                  Standup Comedy
                </Link>
              </li>
            </ul>
          </div>

          {/* Useful Pages */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Platform
            </h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About EventHub
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Support & Help Center
                </Link>
              </li>
              <li>
                <Link to="/my-bookings" className="hover:text-white transition-colors">
                  Manage Bookings
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-white transition-colors">
                  User Account
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/login"
                  className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                >
                  Admin Portal Login &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Contact Us
            </h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <span>support@eventhub.com</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <span>+91 1800 123 4567</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                <span>EventHub Technologies, Tech Park Phase 2, Bengaluru, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>&copy; {new Date().getFullYear()} EventHub Inc. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with modern web standards & secure payment encryption.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
