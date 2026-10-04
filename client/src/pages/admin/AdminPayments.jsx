import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import {
  CreditCard,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Calendar,
  IndianRupee,
  ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (statusFilter !== 'All') queryParams.append('status', statusFilter);
      queryParams.append('limit', 100);

      const { data } = await API.get(`/admin/payments?${queryParams.toString()}`);
      if (data.success) {
        setPayments(data.data);
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
      toast.error('Failed to load payments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [statusFilter]);

  const totalRevenue = payments
    .filter((p) => p.status === 'Paid')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Payment Transactions & Revenue
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Cryptographically verified Razorpay payment logs and settlement receipts.
          </p>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-2xl flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
              Audited Total
            </span>
            <span className="text-base font-extrabold text-emerald-950">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Transaction Status:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 bg-white cursor-pointer"
          >
            <option value="All">All Transactions</option>
            <option value="Paid">Paid (Confirmed)</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
            <option value="Refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Transaction / Payment ID</th>
                <th className="py-3.5 px-3">Razorpay Order ID</th>
                <th className="py-3.5 px-3">Customer</th>
                <th className="py-3.5 px-3">Event</th>
                <th className="py-3.5 px-3">Amount</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                    <span>Loading payment audit log...</span>
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                payments.map((p) => {
                  const payDate = new Date(p.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <tr key={p._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-4">
                        <span className="font-mono font-bold text-slate-900 block">
                          {p.razorpayPaymentId || `PAY-${p._id.substring(18)}`}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Ref: {p.booking?.bookingId}
                        </span>
                      </td>

                      <td className="py-4 px-3 font-mono text-[11px] text-slate-600">
                        {p.paymentMethod === 'upi_qr' ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                              📱 UPI (9628676007@fam)
                            </span>
                            <span className="block text-[10px] text-slate-500 font-mono">
                              UTR: {p.utrNumber || 'N/A'}
                            </span>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                              💳 Razorpay
                            </span>
                            <span className="block text-[10px] text-slate-500 font-mono">
                              {p.razorpayOrderId}
                            </span>
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-3">
                        <p className="font-bold text-slate-900">{p.user?.name || 'Customer'}</p>
                        <p className="text-[10px] text-slate-400">{p.user?.email}</p>
                      </td>

                      <td className="py-4 px-3 max-w-[180px]">
                        <p className="font-semibold text-slate-800 truncate">{p.event?.title || 'Event'}</p>
                        <p className="text-[10px] text-slate-400">{p.event?.city}</p>
                      </td>

                      <td className="py-4 px-3 font-extrabold text-slate-900 text-sm">
                        ₹{p.amount?.toLocaleString('en-IN')}
                      </td>

                      <td className="py-4 px-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            p.status === 'Paid'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : p.status === 'Refunded'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-right text-[11px] text-slate-400">
                        {payDate}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPayments;
