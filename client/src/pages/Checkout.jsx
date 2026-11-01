import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  CreditCard,
  QrCode,
  ShieldCheck,
  Timer,
  Ticket,
  MapPin,
  Calendar,
  Clock,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Building
} from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const bookingState = location.state;

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(300); // 5 mins = 300s

  // Mock Form Fields
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('432');
  const [cardName, setCardName] = useState('Aditya Sharma');
  const [upiId, setUpiId] = useState('aditya@oksbi');

  // Timer countdown
  useEffect(() => {
    if (!bookingState) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          showToast('Seat lock reservation expired! Please select your seats again.', 'error');
          navigate(`/seat-selection/${bookingState.showtimeData.showtimeId}`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [bookingState, navigate, showToast]);

  if (!bookingState) {
    return (
      <div className="min-h-screen bg-[#080B11] flex flex-col items-center justify-center text-white pt-20">
        <AlertTriangle className="w-12 h-12 text-amber-500 mb-3" />
        <h2 className="text-xl font-bold mb-2">No active booking session found</h2>
        <p className="text-xs text-gray-400 mb-6">Please select a movie and seats to initiate checkout.</p>
        <Link to="/movies" className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs">
          Browse Movies
        </Link>
      </div>
    );
  }

  const { showtimeData, selectedSeats, subtotal, convenienceFee, tax, totalAmount } = bookingState;
  const { movie, theatre, screen, showDate, startTime, showtimeId } = showtimeData;

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Simulate realistic payment gateway processing delay (1.2s)
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const payload = {
        showtimeId,
        selectedSeats: selectedSeats.map((s) => ({
          seatNumber: s.seatNumber,
          tier: s.tier,
          price: s.price
        })),
        paymentMethod: paymentMethod === 'card' ? 'Credit / Debit Card' : paymentMethod === 'upi' ? 'UPI' : 'Net Banking',
        paymentReference: `PAY-${Date.now()}-${Math.floor(Math.random() * 89999 + 10000)}`
      };

      const { data } = await api.post('/bookings', payload);

      if (data.success) {
        // Trigger celebratory confetti effect
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });

        showToast('Payment successful! Your tickets are confirmed.', 'success');
        navigate(`/booking-confirmation/${data.data._id}`, {
          state: { booking: data.data }
        });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Payment processing failed. Please try again.';
      showToast(msg, 'error');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080B11] text-gray-100 pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Breadcrumb & Timer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg bg-gray-800 text-gray-300 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Order <span className="text-red-500">Checkout</span>
            </h1>
          </div>

          {/* Seat Hold Countdown */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-950/40 border border-amber-600/40 text-amber-300 text-xs font-bold">
            <Timer className="w-4 h-4 animate-spin text-amber-400" />
            <span>Seats held for: <strong className="text-white text-sm">{formatTimer(secondsRemaining)}</strong></span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Payment Options (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-[#131B2A] rounded-2xl p-6 border border-gray-800 shadow-xl space-y-6">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-red-500" />
                  Select Payment Method
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  100% Secure Cinema Payment Simulation (Razorpay / Stripe Ready)
                </p>
              </div>

              {/* Payment Method Selector Tabs */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === 'card'
                      ? 'bg-red-600/20 border-red-500 text-white font-bold shadow-md shadow-red-600/20'
                      : 'bg-[#161F30] border-gray-700 text-gray-400 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span className="text-xs">Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === 'upi'
                      ? 'bg-red-600/20 border-red-500 text-white font-bold shadow-md shadow-red-600/20'
                      : 'bg-[#161F30] border-gray-700 text-gray-400 hover:text-white'
                  }`}
                >
                  <QrCode className="w-5 h-5" />
                  <span className="text-xs">UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === 'netbanking'
                      ? 'bg-red-600/20 border-red-500 text-white font-bold shadow-md shadow-red-600/20'
                      : 'bg-[#161F30] border-gray-700 text-gray-400 hover:text-white'
                  }`}
                >
                  <Building className="w-5 h-5" />
                  <span className="text-xs">NetBanking</span>
                </button>
              </div>

              {/* Payment Inputs Form */}
              <form onSubmit={handlePaymentSubmit} className="space-y-4 pt-2">
                {paymentMethod === 'card' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        required
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="w-full bg-[#161F30] border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        required
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full bg-[#161F30] border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          required
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full bg-[#161F30] border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1">
                          CVV
                        </label>
                        <input
                          type="password"
                          required
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full bg-[#161F30] border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'upi' && (
                  <div className="space-y-3">
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Virtual Payment Address (UPI ID)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. mobile@upi"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full bg-[#161F30] border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                    />
                    <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-emerald-400 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Instant zero-fee payment confirmation via Google Pay / PhonePe / Paytm</span>
                    </div>
                  </div>
                )}

                {paymentMethod === 'netbanking' && (
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Choose Your Bank
                    </label>
                    <select className="w-full bg-[#161F30] border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-500">
                      <option>HDFC Bank</option>
                      <option>State Bank of India (SBI)</option>
                      <option>ICICI Bank</option>
                      <option>Axis Bank</option>
                      <option>Kotak Mahindra Bank</option>
                    </select>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-800">
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:opacity-50 text-white font-bold text-sm shadow-xl shadow-red-600/30 transition-all hover:scale-[1.01]"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Confirming Payment with Gateway...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Pay ₹{totalAmount} & Confirm Reservation</span>
                      </>
                    )}
                  </button>
                  <p className="text-center text-[11px] text-gray-500 mt-2 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    256-bit SSL encrypted cinema booking transaction
                  </p>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Order Summary (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#131B2A] rounded-2xl p-6 border border-gray-800 shadow-xl space-y-5">
              <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-gray-800 pb-3">
                <Ticket className="w-5 h-5 text-red-500" />
                Booking Summary
              </h3>

              {/* Movie info snippet */}
              <div className="flex gap-4">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-16 h-24 rounded-lg object-cover border border-gray-700 shrink-0"
                />
                <div className="space-y-1">
                  <h4 className="font-bold text-white text-sm line-clamp-1">{movie.title}</h4>
                  <p className="text-xs text-gray-400">{movie.genre?.join(', ')}</p>
                  <div className="flex items-center gap-1 text-[11px] text-gray-400">
                    <MapPin className="w-3 h-3 text-red-500" />
                    <span>{theatre.name}</span>
                  </div>
                  <div className="text-[11px] text-gray-300 font-semibold">
                    {screen.name} ({screen.type})
                  </div>
                </div>
              </div>

              {/* Date & Showtime */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#161F30] text-xs">
                <div>
                  <span className="text-gray-400 block text-[10px]">Show Date</span>
                  <span className="font-bold text-white">{showDate}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">Show Time</span>
                  <span className="font-bold text-red-400">{startTime}</span>
                </div>
              </div>

              {/* Selected Seats */}
              <div>
                <span className="text-xs font-bold text-gray-300 block mb-2">
                  Reserved Seats ({selectedSeats.length})
                </span>
                <div className="space-y-1.5 text-xs">
                  {selectedSeats.map((seat) => (
                    <div key={seat.seatNumber} className="flex justify-between items-center text-gray-300">
                      <span>
                        Seat <strong className="text-white">{seat.seatNumber}</strong> ({seat.tier})
                      </span>
                      <span>₹{seat.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detailed Price Breakdown */}
              <div className="border-t border-gray-800 pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-gray-300">
                  <span>Tickets Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Convenience Fee</span>
                  <span>₹{convenienceFee}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Integrated GST (18%)</span>
                  <span>₹{tax}</span>
                </div>
                <div className="border-t border-gray-700 pt-3 flex justify-between text-sm font-black text-white">
                  <span>Total Amount</span>
                  <span className="text-red-400 text-lg">₹{totalAmount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
