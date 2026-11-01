import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Film, User, Mail, Phone, Lock, UserPlus, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setSubmitting(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });

      showToast('Registration successful! Welcome to iMovies.', 'success');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to register account';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080B11] flex items-center justify-center px-4 py-24">
      <div className="w-full max-w-md bg-[#131B2A] rounded-3xl p-8 border border-gray-800 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group mb-2">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/30">
              <Film className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-black text-white">
              i<span className="text-red-500">Movies</span>
            </span>
          </Link>
          <h2 className="text-xl font-bold text-white">Create Your Account</h2>
          <p className="text-xs text-gray-400">
            Join iMovies for real-time cinema seat booking & exclusive perks
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              <input
                type="text"
                name="name"
                required
                placeholder="Aditya Sharma"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-[#161F30] border border-gray-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              <input
                type="email"
                name="email"
                required
                placeholder="aditya@example.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-[#161F30] border border-gray-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              <input
                type="tel"
                name="phone"
                required
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-[#161F30] border border-gray-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              <input
                type="password"
                name="password"
                required
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-[#161F30] border border-gray-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              <input
                type="password"
                name="confirmPassword"
                required
                placeholder="Re-type password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full bg-[#161F30] border border-gray-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all hover:scale-[1.01]"
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Create Account</span>
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400">
          Already registered?{' '}
          <Link to="/login" className="text-red-400 hover:text-red-300 font-bold ml-1">
            Sign In Here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
