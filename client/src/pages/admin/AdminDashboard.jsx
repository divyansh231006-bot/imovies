import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Film,
  Building,
  Ticket,
  DollarSign,
  Calendar,
  Plus,
  ShieldCheck,
  TrendingUp,
  Clock,
  ArrowRight
} from 'lucide-react';
import api from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/admin/dashboard');
        if (data.success) {
          setStats(data.data);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080B11] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const {
    totalUsers = 0,
    totalMovies = 0,
    totalTheatres = 0,
    totalBookings = 0,
    totalRevenue = 0,
    upcomingShows = 0,
    recentBookings = []
  } = stats || {};

  return (
    <div className="min-h-screen bg-[#080B11] text-gray-100 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-xs uppercase border border-amber-500/40">
                Administrator
              </span>
              <h1 className="text-3xl font-black text-white tracking-tight">
                Control <span className="text-red-500">Center</span>
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Real-time platform metrics, box office revenue, and inventory administration
            </p>
          </div>

          {/* Quick Management Links */}
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/admin/movies"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#161F30] hover:bg-gray-800 text-white font-semibold text-xs border border-gray-700 transition-colors"
            >
              <Film className="w-4 h-4 text-red-500" />
              Manage Movies
            </Link>
            <Link
              to="/admin/showtimes"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#161F30] hover:bg-gray-800 text-white font-semibold text-xs border border-gray-700 transition-colors"
            >
              <Calendar className="w-4 h-4 text-amber-500" />
              Showtimes
            </Link>
            <Link
              to="/admin/theatres"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#161F30] hover:bg-gray-800 text-white font-semibold text-xs border border-gray-700 transition-colors"
            >
              <Building className="w-4 h-4 text-sky-400" />
              Theatres
            </Link>
            <Link
              to="/admin/bookings"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-colors"
            >
              <Ticket className="w-4 h-4" />
              All Bookings
            </Link>
          </div>
        </div>

        {/* 5 Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {/* Revenue */}
          <div className="bg-[#131B2A] rounded-2xl p-5 border border-gray-800 shadow-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-semibold uppercase">Total Revenue</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-white">₹{totalRevenue.toLocaleString()}</p>
            <span className="text-[11px] text-emerald-400 font-medium">Box office collections</span>
          </div>

          {/* Confirmed Bookings */}
          <div className="bg-[#131B2A] rounded-2xl p-5 border border-gray-800 shadow-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-semibold uppercase">Total Bookings</span>
              <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
                <Ticket className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-white">{totalBookings}</p>
            <span className="text-[11px] text-gray-400">Confirmed orders</span>
          </div>

          {/* Active Movies */}
          <div className="bg-[#131B2A] rounded-2xl p-5 border border-gray-800 shadow-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-semibold uppercase">Movies Catalog</span>
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Film className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-white">{totalMovies}</p>
            <span className="text-[11px] text-gray-400">Now showing & coming soon</span>
          </div>

          {/* Theatres */}
          <div className="bg-[#131B2A] rounded-2xl p-5 border border-gray-800 shadow-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-semibold uppercase">Partner Theatres</span>
              <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <Building className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-white">{totalTheatres}</p>
            <span className="text-[11px] text-gray-400">Multiplex locations</span>
          </div>

          {/* Registered Users */}
          <div className="bg-[#131B2A] rounded-2xl p-5 border border-gray-800 shadow-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-semibold uppercase">Users Registered</span>
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-white">{totalUsers}</p>
            <span className="text-[11px] text-gray-400">Audience members</span>
          </div>
        </div>

        {/* Recent Bookings Table */}
        <div className="bg-[#131B2A] rounded-2xl border border-gray-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-gray-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-red-500" />
                Recent Ticket Bookings
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">Live stream of customer reservations</p>
            </div>
            <Link
              to="/admin/bookings"
              className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1"
            >
              View Full History <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#161F30] text-gray-400 uppercase text-[10px] font-bold">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Booking ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Movie</th>
                  <th className="py-3 px-4">Seats</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 rounded-r-xl">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 text-gray-300">
                {recentBookings.map((b) => (
                  <tr key={b._id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-white">{b.bookingId}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-white block">{b.userId?.name || 'Customer'}</span>
                      <span className="text-[10px] text-gray-500">{b.userId?.email}</span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-white">
                      {b.showtimeId?.movieId?.title || 'Movie'}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {b.selectedSeats.map((s) => (
                          <span
                            key={s.seatNumber}
                            className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-800 text-gray-300"
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
                          b.bookingStatus === 'confirmed'
                            ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40'
                            : 'bg-rose-950/40 text-rose-400 border border-rose-800/40'
                        }`}
                      >
                        {b.bookingStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-400 text-[11px]">
                      {new Date(b.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
