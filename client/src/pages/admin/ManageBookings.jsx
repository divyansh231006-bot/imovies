import React, { useState, useEffect } from 'react';
import { Ticket, Search, ArrowLeft, Filter, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const ManageBookings = () => {
  const { showToast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const { data } = await api.get('/admin/bookings', { params });
      if (data.success) {
        setBookings(data.data);
      }
    } catch (err) {
      showToast('Failed to load bookings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [search, statusFilter]);

  const handleCancelBooking = async (id, bookingCode) => {
    if (!window.confirm(`Are you sure you want to cancel booking ${bookingCode}?`)) {
      return;
    }
    try {
      await api.patch(`/bookings/${id}/cancel`, {
        reason: 'Cancelled by Administrator'
      });
      showToast(`Booking ${bookingCode} cancelled and marked refunded`, 'success');
      fetchBookings();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to cancel booking', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#080B11] text-gray-100 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-6">
          <div className="flex items-center gap-3">
            <Link
              to="/admin"
              className="p-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                All <span className="text-red-500">Bookings</span>
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                Inspect customer ticket reservations, payments, and cancellations
              </p>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-[#131B2A] rounded-2xl p-4 border border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by Booking ID, Pay Ref..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#161F30] border border-gray-700 rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#161F30] border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="confirmed">Confirmed Only</option>
              <option value="cancelled">Cancelled Only</option>
            </select>

            <button
              onClick={() => { setSearch(''); setStatusFilter(''); }}
              className="p-2 rounded-xl bg-gray-800 text-gray-400 hover:text-white"
              title="Reset Filters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-[#131B2A] rounded-2xl border border-gray-800 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#161F30] text-gray-400 uppercase text-[10px] font-bold">
                <tr>
                  <th className="py-3 px-4">Booking ID</th>
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-4">Movie & Theatre</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Seats</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 text-gray-300">
                {bookings.map((b) => {
                  const show = b.showtimeId;
                  const isCancelled = b.bookingStatus === 'cancelled';

                  return (
                    <tr key={b._id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-white">{b.bookingId}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-white block">{b.userId?.name || 'Customer'}</span>
                        <span className="text-[10px] text-gray-400">{b.userId?.email}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-white block">{show?.movieId?.title}</span>
                        <span className="text-[10px] text-gray-400">{show?.theatreId?.name}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="block">{show?.showDate}</span>
                        <span className="text-[10px] text-red-400 font-bold">{show?.startTime}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[120px]">
                          {b.selectedSeats.map((s) => (
                            <span
                              key={s.seatNumber}
                              className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-800 text-gray-200"
                            >
                              {s.seatNumber}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white">₹{b.totalAmount}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            isCancelled
                              ? 'bg-rose-950/40 text-rose-400 border border-rose-800/40'
                              : 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40'
                          }`}
                        >
                          {b.bookingStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {!isCancelled && (
                          <button
                            onClick={() => handleCancelBooking(b._id, b.bookingId)}
                            className="px-2.5 py-1 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-300 text-[11px] font-semibold transition-colors"
                          >
                            Cancel & Refund
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageBookings;
