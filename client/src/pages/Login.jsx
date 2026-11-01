import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Film, Mail, Lock, LogIn, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const redirectPath = location.state?.from?.pathname || location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(email, password);
      showToast('Welcome back to iMovies!', 'success');
      navigate(redirectPath, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // 1-Click Demo Credential Fillers
  const fillDemoUser = () => {
    setEmail('user@imovies.com');
    setPassword('User@123');
  };

  const fillDemoAdmin = () => {
    setEmail('admin@imovies.com');
    setPassword('Admin@123');
  };

  return (
    <div className="min-h-screen bg-[#080B11] flex items-center justify-center px-4 py-24">
      <div className="w-full max-w-md bg-[#131B2A] rounded-3xl p-8 border border-gray-800 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group mb-2">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/30">
              <Film className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-black text-white">
              i<span className="text-red-500">Movies</span>
            </span>
          </Link>
          <h2 className="text-xl font-bold text-white">Sign In to Your Account</h2>
          <p className="text-xs text-gray-400">
            Access your bookings and reserve tickets seamlessly
          </p>
        </div>

        {/* Quick Demo Fill Buttons */}
        <div className="p-3 rounded-2xl bg-[#161F30] border border-gray-700/60 space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instant Demo Accounts (1-Click Test)</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={fillDemoUser}
              className="py-1.5 px-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold border border-gray-700 transition-colors"
            >
              Fill Regular User
            </button>
            <button
              type="button"
              onClick={fillDemoAdmin}
              className="py-1.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30 transition-colors"
            >
              Fill Admin Demo
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#161F30] border border-gray-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-gray-300">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-[11px] text-red-400 hover:text-red-300 transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-red-400 hover:text-red-300 font-bold ml-1">
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
