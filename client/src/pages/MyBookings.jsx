import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Ticket,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Printer,
  ChevronRight,
  Film
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const MyBookings = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [bookingsData, setBookingsData] = useState({ upcoming: [], past: [] });
  const [cancellingId, setCancellingId] = useState(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/bookings/my-bookings');
      if (data.success) {
        setBookingsData(data.data);
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
      showToast('Failed to fetch your bookings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    const confirmCancel = window.confirm(
      'Are you sure you want to cancel this booking? A 100% refund will be credited back to your original payment method.'
    );
    if (!confirmCancel) return;

    try {
      setCancellingId(bookingId);
      const { data } = await api.patch(`/bookings/${bookingId}/cancel`);
      if (data.success) {
        showToast('Booking cancelled successfully. Refund initiated.', 'success');
        fetchBookings();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to cancel booking';
      showToast(msg, 'error');
    } finally {
      setCancellingId(null);
    }
  };

  const currentList = activeTab === 'upcoming' ? bookingsData.upcoming : bookingsData.past;

  return (
    <div className="min-h-screen bg-[#080B11] text-gray-100 pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Page Title */}
        <div className="border-b border-gray-800 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              <Ticket className="w-8 h-8 text-red-500" />
              My <span className="text-red-500">Bookings</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Access your electronic tickets, download passes, and manage reservations
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center gap-2 bg-[#131B2A] p-1.5 rounded-xl border border-gray-800">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'upcoming'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Upcoming Shows ({bookingsData.upcoming.length})
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'past'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Past Bookings ({bookingsData.past.length})
            </button>
          </div>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="p-16 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : currentList.length > 0 ? (
          <div className="space-y-6">
            {currentList.map((b) => {
              const showtime = b.showtimeId;
              const movie = showtime?.movieId;
              const theatre = showtime?.theatreId;
              const screen = showtime?.screenId;
              const isCancelled = b.bookingStatus === 'cancelled';

              return (
                <div
                  key={b._id}
                  className="bg-[#131B2A] rounded-2xl border border-gray-800 p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-gray-700 transition-colors"
                >
                  {/* Left: Movie poster & details */}
                  <div className="flex gap-4">
                    <img
                      src={movie?.poster || 'https://images.unsplash.com/photo-1534447677768-be436bb09401'}
                      alt={movie?.title}
                      className="w-20 h-28 object-cover rounded-xl border border-gray-700 shrink-0"
                    />

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold bg-gray-800 text-gray-300 px-2 py-0.5 rounded">
                          {b.bookingId}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            isCancelled
                              ? 'bg-rose-950/40 text-rose-400 border border-rose-800/40'
                              : 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40'
                          }`}
                        >
                          {b.bookingStatus}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-white line-clamp-1">{movie?.title}</h3>

                      <div className="text-xs text-gray-400 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-red-500" />
                        <span>{theatre?.name} ({theatre?.location})</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-300 pt-1">
                        <span className="flex items-center gap-1 font-semibold">
                          <Calendar className="w-3.5 h-3.5 text-red-500" />
                          {showtime?.showDate}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-bold text-red-400">
                          <Clock className="w-3.5 h-3.5" />
                          {showtime?.startTime}
                        </span>
                      </div>

                      {/* Seat Badges */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {b.selectedSeats.map((s) => (
                          <span
                            key={s.seatNumber}
                            className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-600/20 border border-red-500/40 text-white"
                          >
                            {s.seatNumber}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right: Price & Actions */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-gray-800">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">
                        Amount Paid
                      </span>
                      <span className="text-lg font-black text-white">₹{b.totalAmount}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/booking-confirmation/${b._id}`}
                        className="px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <Ticket className="w-3.5 h-3.5 text-red-500" />
                        View Ticket
                      </Link>

                      {activeTab === 'upcoming' && !isCancelled && (
                        <button
                          onClick={() => handleCancelBooking(b._id)}
                          disabled={cancellingId === b._id}
                          className="px-3.5 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-300 font-bold text-xs transition-colors"
                        >
                          {cancellingId === b._id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-16 text-center bg-[#131B2A] rounded-2xl border border-gray-800 space-y-4">
            <Ticket className="w-14 h-14 text-gray-600 mx-auto" />
            <h3 className="text-lg font-bold text-white">
              No {activeTab === 'upcoming' ? 'Upcoming' : 'Past'} Bookings Found
            </h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              You haven't reserved any tickets in this category yet. Explore now showing blockbusters!
            </p>
            <Link
              to="/movies"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs shadow-lg shadow-red-600/30"
            >
              <Film className="w-4 h-4" />
              Book Movies Now
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
