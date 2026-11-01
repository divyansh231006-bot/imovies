import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Printer,
  Ticket,
  Calendar,
  Clock,
  MapPin,
  Film,
  Download,
  Share2,
  Home,
  ShieldCheck
} from 'lucide-react';
import api from '../services/api';

const BookingConfirmation = () => {
  const { id } = useParams();
  const location = useLocation();

  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(!location.state?.booking);

  useEffect(() => {
    if (!booking) {
      const fetchBooking = async () => {
        try {
          setLoading(true);
          const { data } = await api.get(`/bookings/${id}`);
          if (data.success) {
            setBooking(data.data);
          }
        } catch (err) {
          console.error('Failed to load booking:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchBooking();
    }
  }, [id, booking]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080B11] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-[#080B11] flex flex-col items-center justify-center text-white">
        <p className="text-xl font-bold mb-4">Booking information not found</p>
        <Link to="/my-bookings" className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs">
          View My Bookings
        </Link>
      </div>
    );
  }

  const { showtimeId, selectedSeats, totalAmount, bookingId, paymentReference, qrCode } = booking;
  const movie = showtimeId?.movieId;
  const theatre = showtimeId?.theatreId;
  const screen = showtimeId?.screenId;

  return (
    <div className="min-h-screen bg-[#080B11] text-gray-100 pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Success Alert Banner (Hidden when printing) */}
        <div className="print:hidden flex items-center justify-between p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 shadow-xl">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <h3 className="font-bold text-sm text-white">Booking Confirmed!</h3>
              <p className="text-xs text-emerald-300/80">
                A confirmation has been recorded. Present this QR code at cinema admission.
              </p>
            </div>
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all"
          >
            <Printer className="w-4 h-4" />
            Print Ticket
          </button>
        </div>

        {/* Printable Cinema Ticket Stub */}
        <div className="relative bg-[#131B2A] rounded-3xl overflow-hidden border border-gray-800 shadow-2xl print:border-black print:bg-white print:text-black">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-red-600 to-red-800 p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-black tracking-widest uppercase opacity-80 block">
                Official Cinema Admission Pass
              </span>
              <h2 className="text-2xl font-black tracking-tight">{movie?.title}</h2>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold tracking-wider block opacity-75">
                Booking ID
              </span>
              <span className="text-lg font-mono font-black">{bookingId}</span>
            </div>
          </div>

          {/* Ticket Details Body */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-gray-800 print:border-gray-300">
              {/* Theatre details */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                  Cinema & Location
                </span>
                <p className="font-bold text-white print:text-black text-sm">{theatre?.name}</p>
                <p className="text-xs text-gray-400 print:text-gray-600">{theatre?.address}</p>
                <p className="text-xs font-semibold text-emerald-400 mt-1">
                  {screen?.screenName} ({screen?.screenType})
                </p>
              </div>

              {/* Date & Time */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                  Date & Showtime
                </span>
                <p className="font-bold text-white print:text-black text-sm">{showtimeId?.showDate}</p>
                <p className="text-base font-black text-red-400 print:text-red-700">
                  {showtimeId?.startTime}
                </p>
              </div>
            </div>

            {/* Reserved Seats & QR Code */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-gray-800 print:border-gray-300">
              <div className="space-y-3 w-full sm:w-auto">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                  Reserved Seats ({selectedSeats.length})
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedSeats.map((s) => (
                    <div
                      key={s.seatNumber}
                      className="px-3 py-1.5 rounded-xl bg-red-600/20 border border-red-500/50 text-white print:text-black font-mono font-bold text-sm"
                    >
                      {s.seatNumber} <span className="text-[10px] text-gray-300 font-normal">({s.tier})</span>
                    </div>
                  ))}
                </div>
                <div className="text-xs text-gray-400 pt-2">
                  <span>Payment Ref: <strong className="text-white print:text-black">{paymentReference}</strong></span>
                  <span className="ml-3 text-emerald-400 font-bold">• Paid via Card / UPI</span>
                </div>
              </div>

              {/* QR Code */}
              {qrCode && (
                <div className="flex flex-col items-center p-3 rounded-2xl bg-white text-black shadow-lg">
                  <img src={qrCode} alt="Ticket QR Code" className="w-32 h-32 object-contain" />
                  <span className="text-[9px] font-mono font-bold tracking-wider uppercase mt-1">
                    Scan for Entry
                  </span>
                </div>
              )}
            </div>

            {/* Total Paid */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-gray-400 print:text-gray-600">
                  Confirmed on {new Date(booking.bookingDate || Date.now()).toLocaleDateString()}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-gray-400 block uppercase">Total Paid</span>
                <span className="text-xl font-black text-white print:text-black">
                  ₹{totalAmount}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Navigation Buttons (Hidden when printing) */}
        <div className="print:hidden flex flex-wrap items-center justify-between gap-4 pt-4">
          <Link
            to="/"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white font-semibold text-xs transition-all"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>

          <Link
            to="/my-bookings"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all hover:scale-105"
          >
            <Ticket className="w-4 h-4" />
            View in My Bookings
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
