import React, { useState, useEffect } from 'react';
import { Film, Plus, Edit, Trash2, X, Star, Check, AlertCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const ManageMovies = () => {
  const { showToast } = useToast();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    poster: '',
    backdrop: '',
    genre: 'Action, Sci-Fi',
    language: 'English, Hindi',
    duration: 150,
    releaseDate: new Date().toISOString().split('T')[0],
    rating: 8.5,
    director: '',
    cast: '',
    trailerUrl: '',
    status: 'now_showing',
    featured: false
  });

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/movies');
      if (data.success) {
        setMovies(data.data);
      }
    } catch (err) {
      showToast('Failed to load movies', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const openAddModal = () => {
    setEditingMovie(null);
    setFormData({
      title: '',
      description: '',
      poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80',
      backdrop: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1600&q=80',
      genre: 'Action, Adventure',
      language: 'English, Hindi',
      duration: 145,
      releaseDate: new Date().toISOString().split('T')[0],
      rating: 8.5,
      director: '',
      cast: '',
      trailerUrl: '',
      status: 'now_showing',
      featured: false
    });
    setModalOpen(true);
  };

  const openEditModal = (m) => {
    setEditingMovie(m);
    setFormData({
      title: m.title,
      description: m.description,
      poster: m.poster,
      backdrop: m.backdrop,
      genre: m.genre.join(', '),
      language: m.language.join(', '),
      duration: m.duration,
      releaseDate: new Date(m.releaseDate).toISOString().split('T')[0],
      rating: m.rating,
      director: m.director || '',
      cast: m.cast ? m.cast.join(', ') : '',
      trailerUrl: m.trailerUrl || '',
      status: m.status,
      featured: m.featured || false
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        genre: formData.genre.split(',').map((s) => s.trim()).filter(Boolean),
        language: formData.language.split(',').map((s) => s.trim()).filter(Boolean),
        cast: formData.cast.split(',').map((s) => s.trim()).filter(Boolean),
        duration: Number(formData.duration),
        rating: Number(formData.rating)
      };

      if (editingMovie) {
        await api.put(`/movies/${editingMovie._id}`, payload);
        showToast('Movie updated successfully!', 'success');
      } else {
        await api.post('/movies', payload);
        showToast('Movie added successfully!', 'success');
      }

      setModalOpen(false);
      fetchMovies();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save movie', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? All associated showtimes will also be removed.`)) {
      return;
    }

    try {
      await api.delete(`/movies/${id}`);
      showToast('Movie deleted successfully', 'success');
      fetchMovies();
    } catch (err) {
      showToast('Failed to delete movie', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#080B11] text-gray-100 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
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
                Movie <span className="text-red-500">Management</span>
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                Add, edit, or remove movies from the cinema catalog
              </p>
            </div>
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            Add New Movie
          </button>
        </div>

        {/* Movies Table */}
        <div className="bg-[#131B2A] rounded-2xl border border-gray-800 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#161F30] text-gray-400 uppercase text-[10px] font-bold">
                <tr>
                  <th className="py-3 px-4">Poster</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Genres</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 text-gray-300">
                {movies.map((m) => (
                  <tr key={m._id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4">
                      <img
                        src={m.poster}
                        alt={m.title}
                        className="w-10 h-14 object-cover rounded-lg border border-gray-700"
                      />
                    </td>
                    <td className="py-3 px-4 font-bold text-white max-w-xs truncate">
                      {m.title}
                      {m.featured && (
                        <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold uppercase">
                          Featured
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          m.status === 'now_showing'
                            ? 'bg-red-950/40 text-red-400 border border-red-800/40'
                            : 'bg-amber-950/40 text-amber-400 border border-amber-800/40'
                        }`}
                      >
                        {m.status === 'now_showing' ? 'Now Showing' : 'Coming Soon'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-amber-400 flex items-center gap-1 mt-4">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {m.rating?.toFixed(1)}
                    </td>
                    <td className="py-3 px-4">{m.duration} mins</td>
                    <td className="py-3 px-4">{m.genre?.slice(0, 2).join(', ')}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(m)}
                          className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(m._id, m.title)}
                          className="p-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-300 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-[#131B2A] rounded-3xl border border-gray-800 max-w-2xl w-full p-6 sm:p-8 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                <h3 className="text-lg font-bold text-white">
                  {editingMovie ? 'Edit Movie Details' : 'Add New Movie'}
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Movie Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-[#161F30] border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Description / Synopsis</label>
                  <textarea
                    rows={3}
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-[#161F30] border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">Poster Image URL</label>
                    <input
                      type="url"
                      required
                      value={formData.poster}
                      onChange={(e) => setFormData({ ...formData, poster: e.target.value })}
                      className="w-full bg-[#161F30] border border-gray-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">Backdrop Image URL</label>
                    <input
                      type="url"
                      required
                      value={formData.backdrop}
                      onChange={(e) => setFormData({ ...formData, backdrop: e.target.value })}
                      className="w-full bg-[#161F30] border border-gray-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">Genres (Comma separated)</label>
                    <input
                      type="text"
                      required
                      value={formData.genre}
                      onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                      className="w-full bg-[#161F30] border border-gray-700 rounded-xl px-4 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">Languages (Comma separated)</label>
                    <input
                      type="text"
                      required
                      value={formData.language}
                      onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                      className="w-full bg-[#161F30] border border-gray-700 rounded-xl px-4 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">Duration (Minutes)</label>
                    <input
                      type="number"
                      required
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="w-full bg-[#161F30] border border-gray-700 rounded-xl px-4 py-2 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">IMDb Rating</label>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      max="10"
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                      className="w-full bg-[#161F30] border border-gray-700 rounded-xl px-4 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">Release Date</label>
                    <input
                      type="date"
                      required
                      value={formData.releaseDate}
                      onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                      className="w-full bg-[#161F30] border border-gray-700 rounded-xl px-4 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">Release Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full bg-[#161F30] border border-gray-700 rounded-xl px-4 py-2 text-white cursor-pointer"
                    >
                      <option value="now_showing">Now Showing</option>
                      <option value="coming_soon">Coming Soon</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">Director</label>
                    <input
                      type="text"
                      value={formData.director}
                      onChange={(e) => setFormData({ ...formData, director: e.target.value })}
                      className="w-full bg-[#161F30] border border-gray-700 rounded-xl px-4 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">Cast (Comma separated)</label>
                    <input
                      type="text"
                      value={formData.cast}
                      onChange={(e) => setFormData({ ...formData, cast: e.target.value })}
                      className="w-full bg-[#161F30] border border-gray-700 rounded-xl px-4 py-2 text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4 text-red-600 rounded bg-gray-800 border-gray-700 focus:ring-red-500"
                  />
                  <label htmlFor="featured" className="text-gray-300 font-semibold cursor-pointer">
                    Highlight as Featured Movie on Home Hero Banner
                  </label>
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
                    className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-lg shadow-red-600/30"
                  >
                    {submitting ? 'Saving...' : 'Save Movie'}
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

export default ManageMovies;
