import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Film, Mail, ArrowLeft, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const ForgotPassword = () => {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [step, setStep] = useState(1); // 1 = request token, 2 = enter new password

  const handleRequestToken = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      if (data.success) {
        setResetToken(data.resetToken || 'demo-reset-token');
        setStep(2);
        showToast('Password reset token generated!', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to process request', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.post('/auth/reset-password', {
        token: resetToken,
        newPassword
      });
      if (data.success) {
        setResetSuccess(true);
        showToast('Password updated successfully! You can now sign in.', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to reset password', 'error');
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
          <h2 className="text-xl font-bold text-white">Reset Account Password</h2>
          <p className="text-xs text-gray-400">
            {step === 1
              ? 'Enter your registered email to receive a password recovery link'
              : 'Enter your new password below'}
          </p>
        </div>

        {resetSuccess ? (
          <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="font-bold text-white text-base">Password Updated</h3>
            <p className="text-xs text-gray-300">
              Your password has been successfully reset. You can now login.
            </p>
            <Link
              to="/login"
              className="inline-block px-6 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs"
            >
              Proceed to Sign In
            </Link>
          </div>
        ) : step === 1 ? (
          <form onSubmit={handleRequestToken} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Registered Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="user@imovies.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#161F30] border border-gray-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg transition-all"
            >
              {submitting ? 'Generating Token...' : 'Generate Reset Token'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="p-3 rounded-xl bg-gray-800/80 text-xs text-gray-300">
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Token</span>
              <p className="font-mono text-emerald-400 text-xs truncate">{resetToken}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-[#161F30] border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg transition-all"
            >
              {submitting ? 'Updating Password...' : 'Save New Password'}
            </button>
          </form>
        )}

        <div className="text-center pt-2">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
