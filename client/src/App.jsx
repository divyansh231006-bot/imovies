import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Pages
import Home from './pages/Home';
import Movies from './pages/Movies';
import MovieDetails from './pages/MovieDetails';
import Theatres from './pages/Theatres';
import SeatSelection from './pages/SeatSelection';
import Checkout from './pages/Checkout';
import BookingConfirmation from './pages/BookingConfirmation';
import MyBookings from './pages/MyBookings';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageMovies from './pages/admin/ManageMovies';
import ManageTheatres from './pages/admin/ManageTheatres';
import ManageShowtimes from './pages/admin/ManageShowtimes';
import ManageBookings from './pages/admin/ManageBookings';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <div className="flex flex-col min-h-screen bg-[#080B11] text-gray-100 selection:bg-red-600 selection:text-white">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/movies" element={<Movies />} />
                <Route path="/movies/:id" element={<MovieDetails />} />
                <Route path="/theatres" element={<Theatres />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* Booking & Account Routes */}
                <Route path="/seat-selection/:showtimeId" element={<SeatSelection />} />
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/booking-confirmation/:id"
                  element={
                    <ProtectedRoute>
                      <BookingConfirmation />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-bookings"
                  element={
                    <ProtectedRoute>
                      <MyBookings />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/movies"
                  element={
                    <AdminRoute>
                      <ManageMovies />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/theatres"
                  element={
                    <AdminRoute>
                      <ManageTheatres />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/showtimes"
                  element={
                    <AdminRoute>
                      <ManageShowtimes />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/bookings"
                  element={
                    <AdminRoute>
                      <ManageBookings />
                    </AdminRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
