import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import TicketCard from '../../components/TicketCard';
import {
  Ticket,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  AlertCircle,
  Edit,
  Eye,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [bookingStatus, setBookingStatus] = useState('All');
  const [paymentStatus, setPaymentStatus] = useState('All');
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Status Change Dialog
  const [editingBooking, setEditingBooking] = useState(null);
  const [newBookingStatus, setNewBookingStatus] = useState('Confirmed');
  const [newPaymentStatus, setNewPaymentStatus] = useState('Paid');
  const [updating, setUpdating] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (bookingStatus !== 'All') queryParams.append('bookingStatus', bookingStatus);
      if (paymentStatus !== 'All') queryParams.append('paymentStatus', paymentStatus);
      queryParams.append('limit', 100);

      const { data } = await API.get(`/admin/bookings?${queryParams.toString()}`);
      if (data.success) {
        setBookings(data.data);
      }
    } catch (err) {
      console.error('Error loading admin bookings:', err);
      toast.error('Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [bookingStatus, paymentStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBookings();
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!editingBooking) return;
    setUpdating(true);
    try {
      const { data } = await API.put(`/admin/bookings/${editingBooking._id}/status`, {
        bookingStatus: newBookingStatus,
        paymentStatus: newPaymentStatus
      });
      if (data.success) {
        toast.success('Booking status updated successfully.');
        setEditingBooking(null);
        fetchBookings();
      }
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error(err.response?.data?.message || 'Failed to update booking status.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Booking Management
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Track admissions, change booking statuses, and audit customer tickets across all events.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Booking ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-hidden focus:border-indigo-600"
          />
        </form>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Booking:
            </span>
            <select
              value={bookingStatus}
              onChange={(e) => setBookingStatus(e.target.value)}
              className="p-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 bg-white cursor-pointer"
            >
              <option value="All">All Bookings</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Pending">Pending</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Payment:
            </span>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="p-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 bg-white cursor-pointer"
            >
              <option value="All">All Payments</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>

          <button
            onClick={() => {
              setSearch('');
              setBookingStatus('All');
              setPaymentStatus('All');
              fetchBookings();
            }}
            className="p-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-500"
            title="Reset Filters"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Booking ID</th>
                <th className="py-3.5 px-3">Customer</th>
                <th className="py-3.5 px-3">Event</th>
                <th className="py-3.5 px-3">Tickets</th>
                <th className="py-3.5 px-3">Total Amount</th>
                <th className="py-3.5 px-3">Payment</th>
                <th className="py-3.5 px-3">Booking Status</th>
                <th className="py-3.5 px-3">Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                    <span>Loading bookings...</span>
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No bookings found matching selected filters.
                  </td>
                </tr>
              ) : (
                bookings.map((b) => {
                  const bookingDate = new Date(b.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  });

                  return (
                    <tr key={b._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {b.bookingId}
                      </td>
                      <td className="py-3.5 px-3">
                        <p className="font-bold text-slate-900">{b.user?.name || 'Customer'}</p>
                        <p className="text-[10px] text-slate-400">{b.user?.email}</p>
                      </td>
                      <td className="py-3.5 px-3 max-w-[180px]">
                        <p className="font-semibold text-slate-800 truncate">{b.event?.title || 'Event'}</p>
                        <p className="text-[10px] text-slate-400">{b.event?.city}</p>
                      </td>
                      <td className="py-3.5 px-3 font-bold text-slate-900">
                        {b.tickets}
                      </td>
                      <td className="py-3.5 px-3 font-extrabold text-slate-900">
                        {b.totalAmount === 0 ? 'Free' : `₹${b.totalAmount?.toLocaleString('en-IN')}`}
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            b.paymentStatus === 'Paid'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : b.paymentStatus === 'Refunded'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {b.paymentStatus}
                        </span>
                        {b.paymentMethod === 'upi_qr' && (
                          <span className="block mt-1 text-[9px] font-bold text-purple-700 font-mono">
                            📱 UPI {b.utrNumber ? `• ${b.utrNumber}` : ''}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            b.bookingStatus === 'Confirmed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : b.bookingStatus === 'Cancelled'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {b.bookingStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-[11px] text-slate-400">
                        {bookingDate}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedTicket(b)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                            title="View Ticket"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingBooking(b);
                              setNewBookingStatus(b.bookingStatus);
                              setNewPaymentStatus(b.paymentStatus);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                            title="Change Status"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Booking Status Modal */}
      {editingBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900">Update Booking Status</h3>
            <p className="text-xs text-slate-500">
              Modify booking state for ID <strong>{editingBooking.bookingId}</strong>
            </p>

            <form onSubmit={handleUpdateStatus} className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                  Booking Status
                </label>
                <select
                  value={newBookingStatus}
                  onChange={(e) => setNewBookingStatus(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800"
                >
                  <option value="Confirmed">Confirmed</option>
                  <option value="Pending">Pending</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                  Payment Status
                </label>
                <select
                  value={newPaymentStatus}
                  onChange={(e) => setNewPaymentStatus(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800"
                >
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Failed">Failed</option>
                  <option value="Refunded">Refunded</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingBooking(null)}
                  disabled={updating}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
                >
                  {updating ? 'Saving...' : 'Update Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Pass View Modal */}
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

export default AdminBookings;
