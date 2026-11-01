import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Trash2, ArrowLeft, X, Clock, Film, MapPin, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const ManageShowtimes = () => {
  const { showToast } = useToast();
  const [showtimes, setShowtimes] = useState([]);
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    movieId: '',
    theatreId: '',
    screenId: '',
    showDate: new Date().toISOString().split('T')[0],
    startTime: '10:30 AM',
    silverPrice: 190,
    goldPrice: 280,
    platinumPrice: 390,
    vipPrice: 580
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [stRes, mvRes, thRes] = await Promise.all([
        api.get('/showtimes'),
        api.get('/movies'),
        api.get('/theatres')
      ]);

      if (stRes.data.success) setShowtimes(stRes.data.data);
      if (mvRes.data.success) setMovies(mvRes.data.data);
      if (thRes.data.success) {
        setTheatres(thRes.data.data);
        if (thRes.data.data.length > 0 && !formData.theatreId) {
          const firstTh = thRes.data.data[0];
          setFormData((prev) => ({
            ...prev,
            theatreId: firstTh._id,
            screenId: firstTh.screens?.[0]?._id || ''
          }));
        }
      }
    } catch (err) {
      showToast('Failed to load showtime data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTheatreChange = (e) => {
    const selectedThId = e.target.value;
    const th = theatres.find((t) => t._id === selectedThId);
    setFormData({
      ...formData,
      theatreId: selectedThId,
      screenId: th?.screens?.[0]?._id || ''
    });
  };

  const selectedTheatreObj = theatres.find((t) => t._id === formData.theatreId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.movieId || !formData.theatreId || !formData.screenId) {
      showToast('Please select movie, theatre, and screen', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        movieId: formData.movieId,
        theatreId: formData.theatreId,
        screenId: formData.screenId,
        showDate: formData.showDate,
        startTime: formData.startTime,
        endTime: 'Approx 3 hrs',
        seatPricing: {
          Silver: Number(formData.silverPrice),
          Gold: Number(formData.goldPrice),
          Platinum: Number(formData.platinumPrice),
          VIP: Number(formData.vipPrice)
        }
      };

      await api.post('/showtimes', payload);
      showToast('Showtime scheduled successfully!', 'success');
      setModalOpen(false);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to schedule showtime', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this showtime?')) return;
    try {
      await api.delete(`/showtimes/${id}`);
      showToast('Showtime deleted', 'success');
      fetchData();
    } catch (err) {
      showToast('Failed to delete showtime', 'error');
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
                Showtime <span className="text-red-500">Scheduler</span>
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                Assign movies to screens, timings, and configure category seat pricing
              </p>
            </div>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            Schedule Showtime
          </button>
        </div>

        {/* Showtimes Table */}
        <div className="bg-[#131B2A] rounded-2xl border border-gray-800 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#161F30] text-gray-400 uppercase text-[10px] font-bold">
                <tr>
                  <th className="py-3 px-4">Movie</th>
                  <th className="py-3 px-4">Theatre & Screen</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Pricing (Silver/Gold/Plat/VIP)</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 text-gray-300">
                {showtimes.map((st) => (
                  <tr key={st._id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                      <Film className="w-4 h-4 text-red-500 shrink-0" />
                      <span className="truncate max-w-xs">{st.movieId?.title || 'Unknown'}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-white block">{st.theatreId?.name}</span>
                      <span className="text-[10px] text-emerald-400 font-medium">
                        {st.screenId?.screenName} ({st.screenId?.screenType})
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono">{st.showDate}</td>
                    <td className="py-3 px-4 font-bold text-red-400">{st.startTime}</td>
                    <td className="py-3 px-4 font-mono text-[11px]">
                      ₹{st.seatPricing?.Silver} / ₹{st.seatPricing?.Gold} / ₹{st.seatPricing?.Platinum} / ₹{st.seatPricing?.VIP}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(st._id)}
                        className="p-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Schedule Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#131B2A] rounded-3xl border border-gray-800 max-w-xl w-full p-6 sm:p-8 space-y-5">
              <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                <h3 className="text-lg font-bold text-white">Schedule New Showtime</h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Select Movie</label>
                  <select
                    required
                    value={formData.movieId}
                    onChange={(e) => setFormData({ ...formData, movieId: e.target.value })}
                    className="w-full bg-[#161F30] border border-gray-700 rounded-xl px-4 py-2.5 text-white"
                  >
                    <option value="">-- Choose a Movie --</option>
                    {movies.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.title} ({m.status === 'now_showing' ? 'Now Showing' : 'Coming Soon'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">Theatre</label>
                    <select
                      required
                      value={formData.theatreId}
                      onChange={handleTheatreChange}
                      className="w-full bg-[#161F30] border border-gray-700 rounded-xl px-4 py-2.5 text-white"
                    >
                      {theatres.map((th) => (
                        <option key={th._id} value={th._id}>
                          {th.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">Screen / Audi</label>
                    <select
                      required
                      value={formData.screenId}
                      onChange={(e) => setFormData({ ...formData, screenId: e.target.value })}
                      className="w-full bg-[#161F30] border border-gray-700 rounded-xl px-4 py-2.5 text-white"
                    >
                      {selectedTheatreObj?.screens?.map((sc) => (
                        <option key={sc._id} value={sc._id}>
                          {sc.screenName} ({sc.screenType})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">Show Date</label>
                    <input
                      type="date"
                      required
                      value={formData.showDate}
                      onChange={(e) => setFormData({ ...formData, showDate: e.target.value })}
                      className="w-full bg-[#161F30] border border-gray-700 rounded-xl px-4 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">Start Time</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 10:30 AM, 02:15 PM"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full bg-[#161F30] border border-gray-700 rounded-xl px-4 py-2 text-white"
                    />
                  </div>
                </div>

                {/* Seating Category Pricing */}
                <div className="space-y-2 pt-2 border-t border-gray-800">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                    Category Seat Pricing (₹)
                  </span>
                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <label className="block text-gray-400 text-[10px] mb-1">Silver</label>
                      <input
                        type="number"
                        required
                        value={formData.silverPrice}
                        onChange={(e) => setFormData({ ...formData, silverPrice: e.target.value })}
                        className="w-full bg-[#161F30] border border-gray-700 rounded-lg p-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-amber-400 text-[10px] mb-1">Gold</label>
                      <input
                        type="number"
                        required
                        value={formData.goldPrice}
                        onChange={(e) => setFormData({ ...formData, goldPrice: e.target.value })}
                        className="w-full bg-[#161F30] border border-gray-700 rounded-lg p-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sky-400 text-[10px] mb-1">Platinum</label>
                      <input
                        type="number"
                        required
                        value={formData.platinumPrice}
                        onChange={(e) => setFormData({ ...formData, platinumPrice: e.target.value })}
                        className="w-full bg-[#161F30] border border-gray-700 rounded-lg p-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-purple-400 text-[10px] mb-1">VIP Recliner</label>
                      <input
                        type="number"
                        required
                        value={formData.vipPrice}
                        onChange={(e) => setFormData({ ...formData, vipPrice: e.target.value })}
                        className="w-full bg-[#161F30] border border-gray-700 rounded-lg p-2 text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-800 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-gray-800 text-gray-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-lg"
                  >
                    {submitting ? 'Scheduling...' : 'Confirm Schedule'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageShowtimes;
