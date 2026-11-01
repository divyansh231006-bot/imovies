import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Film,
  MapPin,
  Calendar,
  Clock,
  ArrowLeft,
  Timer,
  AlertCircle,
  Ticket,
  CheckCircle2,
  Lock
} from 'lucide-react';
import api from '../services/api';
import { getSocket, joinShowtimeRoom, leaveShowtimeRoom } from '../services/socket';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import SeatLayout from '../components/SeatLayout';

const SeatSelection = () => {
  const { showtimeId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [showtimeData, setShowtimeData] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [lockingSeats, setLockingSeats] = useState(false);
  const [lockTimeRemaining, setLockTimeRemaining] = useState(null);

  const lockTimerRef = useRef(null);

  // Fetch showtime details and visual seat matrix
  const fetchSeatMap = async () => {
    try {
      const { data } = await api.get(`/showtimes/${showtimeId}/seats`);
      if (data.success) {
        setShowtimeData(data.data);
      }
    } catch (err) {
      console.error('Failed to load seat layout:', err);
      showToast('Failed to load theatre seat map', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeatMap();

    // Setup Socket.IO real-time listener for this showtime
    const socket = getSocket();
    joinShowtimeRoom(showtimeId);

    // Real-time event: Another user locked seats
    const handleSeatsLocked = (payload) => {
      if (payload.showtimeId === showtimeId) {
        setShowtimeData((prev) => {
          if (!prev) return prev;
          const isCurrentUser = user && payload.userId === user.id;

          const updatedSeatMap = prev.seatMap.map((row) => ({
            ...row,
            seats: row.seats.map((seat) => {
              if (payload.seatNumbers.includes(seat.seatNumber)) {
                return {
                  ...seat,
                  status: isCurrentUser ? 'selected' : 'locked'
                };
              }
              return seat;
            })
          }));

          return { ...prev, seatMap: updatedSeatMap };
        });
      }
    };

    // Real-time event: Seats unlocked / expired
    const handleSeatsUnlocked = (payload) => {
      if (payload.showtimeId === showtimeId) {
        setShowtimeData((prev) => {
          if (!prev) return prev;
          const updatedSeatMap = prev.seatMap.map((row) => ({
            ...row,
            seats: row.seats.map((seat) => {
              if (payload.seatNumbers.includes(seat.seatNumber)) {
                // If it wasn't already confirmed booked, revert to available
                return {
                  ...seat,
                  status: seat.status === 'booked' ? 'booked' : 'available'
                };
              }
              return seat;
            })
          }));
          return { ...prev, seatMap: updatedSeatMap };
        });
      }
    };

    // Real-time event: Seats booked confirmed
    const handleSeatsBooked = (payload) => {
      if (payload.showtimeId === showtimeId) {
        setShowtimeData((prev) => {
          if (!prev) return prev;
          const updatedSeatMap = prev.seatMap.map((row) => ({
            ...row,
            seats: row.seats.map((seat) => {
              if (payload.seatNumbers.includes(seat.seatNumber)) {
                return { ...seat, status: 'booked' };
              }
              return seat;
            })
          }));
          return { ...prev, seatMap: updatedSeatMap };
        });

        // If currently selected seat was booked by someone else, remove it
        setSelectedSeats((prev) =>
          prev.filter((s) => !payload.seatNumbers.includes(s.seatNumber))
        );
      }
    };

    socket.on('seats_locked', handleSeatsLocked);
    socket.on('seats_unlocked', handleSeatsUnlocked);
    socket.on('seats_booked', handleSeatsBooked);

    return () => {
      leaveShowtimeRoom(showtimeId);
      socket.off('seats_locked', handleSeatsLocked);
      socket.off('seats_unlocked', handleSeatsUnlocked);
      socket.off('seats_booked', handleSeatsBooked);
      if (lockTimerRef.current) clearInterval(lockTimerRef.current);
    };
  }, [showtimeId, user]);

  // Handle seat selection toggle
  const handleSeatToggle = (seat) => {
    if (seat.status === 'booked' || seat.status === 'locked') return;

    const exists = selectedSeats.some((s) => s.seatNumber === seat.seatNumber);

    if (exists) {
      setSelectedSeats((prev) => prev.filter((s) => s.seatNumber !== seat.seatNumber));
    } else {
      if (selectedSeats.length >= 8) {
        showToast('Maximum 8 seats allowed per booking transaction.', 'warning');
        return;
      }
      setSelectedSeats((prev) => [...prev, seat]);
    }
  };

  // Calculate pricing
  const subtotal = selectedSeats.reduce((sum, s) => sum + s.price, 0);
  const convenienceFee = selectedSeats.length > 0 ? 35 : 0;
  const tax = Math.round(convenienceFee * 0.18);
  const totalAmount = subtotal + convenienceFee + tax;

  // Proceed to checkout: Lock seats on server first
  const handleProceedToCheckout = async () => {
    if (!isAuthenticated) {
      showToast('Please sign in to lock seats and proceed with booking.', 'info');
      navigate('/login', { state: { from: `/seat-selection/${showtimeId}` } });
      return;
    }

    if (selectedSeats.length === 0) {
      showToast('Please select at least one seat to proceed.', 'warning');
      return;
    }

    try {
      setLockingSeats(true);
      const seatNumbers = selectedSeats.map((s) => s.seatNumber);

      const { data } = await api.post('/seats/lock', {
        showtimeId,
        seatNumbers
      });

      if (data.success) {
        showToast('Seats temporarily reserved for 5 minutes!', 'success');
        // Navigate to checkout with locked seat info
        navigate('/checkout', {
          state: {
            showtimeData,
            selectedSeats,
            subtotal,
            convenienceFee,
            tax,
            totalAmount,
            expiresAt: data.data.expiresAt
          }
        });
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to lock selected seats. Please try another seat.';
      showToast(errorMsg, 'error');
      // Refresh seat layout to sync states
      fetchSeatMap();
    } finally {
      setLockingSeats(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080B11] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!showtimeData) {
    return (
      <div className="min-h-screen bg-[#080B11] flex flex-col items-center justify-center text-white">
        <p className="text-xl font-bold mb-4">Showtime details not found</p>
        <Link to="/movies" className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold text-sm">
          Browse Movies
        </Link>
      </div>
    );
  }

  const { movie, theatre, screen, showDate, startTime } = showtimeData;

  return (
    <div className="min-h-screen bg-[#080B11] text-gray-100 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Header Breadcrumb & Movie Summary */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#131B2A] p-4 sm:p-6 rounded-2xl border border-gray-800 shadow-xl">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white">{movie.title}</h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mt-1">
                <span className="flex items-center gap-1 text-gray-300">
                  <MapPin className="w-3.5 h-3.5 text-red-500" />
                  {theatre.name} ({theatre.location})
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-gray-300">
                  <Calendar className="w-3.5 h-3.5 text-red-500" />
                  {showDate}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-red-400 font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  {startTime}
                </span>
              </div>
            </div>
          </div>

          {/* Screen details pill */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-xs text-gray-400 block">{screen.name}</span>
              <span className="text-xs font-bold text-emerald-400">{screen.type}</span>
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 font-bold text-xs">
              Live Real-Time
            </div>
          </div>
        </div>

        {/* Visual Seat Layout Component */}
        <div className="bg-[#131B2A] rounded-2xl p-6 sm:p-10 border border-gray-800 shadow-2xl">
          <SeatLayout
            seatMap={showtimeData.seatMap}
            selectedSeats={selectedSeats}
            onSeatToggle={handleSeatToggle}
            maxSeats={8}
          />
        </div>

        {/* Floating Action / Booking Bar at bottom */}
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-[#0F172A]/95 backdrop-blur-md border-t border-gray-800/80 p-4 sm:p-5 shadow-2xl">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Selected Seats summary */}
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 shrink-0">
                <Ticket className="w-5 h-5" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Selected Seats:</span>
                  {selectedSeats.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {selectedSeats.map((s) => (
                        <span
                          key={s.seatNumber}
                          className="px-2 py-0.5 rounded bg-red-600/30 border border-red-500 text-white font-bold text-xs"
                        >
                          {s.seatNumber}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-500 italic">No seats selected yet</span>
                  )}
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Limit: 8 seats per booking • Holds for 5 mins upon checkout
                </p>
              </div>
            </div>

            {/* Total Price & Checkout Button */}
            <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
              <div>
                <span className="text-[11px] text-gray-400 uppercase tracking-wider block">
                  Total Payable
                </span>
                <span className="text-xl sm:text-2xl font-black text-white">
                  ₹{totalAmount}
                </span>
              </div>

              <button
                type="button"
                disabled={selectedSeats.length === 0 || lockingSeats}
                onClick={handleProceedToCheckout}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm shadow-xl shadow-red-600/30 transition-all hover:scale-105"
              >
                {lockingSeats ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Reserving Seats...</span>
                  </>
                ) : (
                  <>
                    <span>Proceed to Checkout</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;
