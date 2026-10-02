import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    toast.success('Your message has been received! Our support team will respond promptly.');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Get In Touch
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Have questions regarding ticketing, organizer partnerships, or refunds? We're here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Contact Info */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <h2 className="text-lg font-bold text-slate-900">Support Contacts</h2>
          <div className="space-y-4 text-xs text-slate-600">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-indigo-600 flex-shrink-0" />
              <div>
                <strong className="block text-slate-800">Email Inquiries</strong>
                <span>support@eventhub.com</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-indigo-600 flex-shrink-0" />
              <div>
                <strong className="block text-slate-800">Phone Support (Toll-Free)</strong>
                <span>+91 1800 123 4567</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-indigo-600 flex-shrink-0" />
              <div>
                <strong className="block text-slate-800">Headquarters</strong>
                <span>EventHub Technologies, Tech Park Phase 2, Whitefield, Bengaluru, India</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Send a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 block">Your Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:border-indigo-600"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 block">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:border-indigo-600"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 block">Message</label>
              <textarea
                rows={4}
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:border-indigo-600"
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Message</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
