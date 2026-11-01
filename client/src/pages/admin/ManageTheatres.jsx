import React, { useState, useEffect } from 'react';
import { Building, Plus, Trash2, ArrowLeft, X, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const ManageTheatres = () => {
  const { showToast } = useToast();
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    city: 'Mumbai',
    address: '',
    phone: '+91 22 4333 9999',
    amenities: 'IMAX Laser, Dolby Atmos, Recliner Seats, Gourmet Cafe'
  });

  const fetchTheatres = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/theatres');
      if (data.success) {
        setTheatres(data.data);
      }
    } catch (err) {
      showToast('Failed to load theatres', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTheatres();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        amenities: formData.amenities.split(',').map((s) => s.trim()).filter(Boolean)
      };

      await api.post('/theatres', payload);
      showToast('Theatre registered successfully!', 'success');
      setModalOpen(false);
      fetchTheatres();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add theatre', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}? All associated showtimes will also be removed.`)) {
      return;
    }
    try {
      await api.delete(`/theatres/${id}`);
      showToast('Theatre deleted successfully', 'success');
      fetchTheatres();
    } catch (err) {
      showToast('Failed to delete theatre', 'error');
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
                Theatre <span className="text-red-500">Management</span>
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                Manage cinema branches, screens, and venue configurations
              </p>
            </div>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            Add New Theatre
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {theatres.map((th) => (
            <div
              key={th._id}
              className="bg-[#131B2A] rounded-2xl p-6 border border-gray-800 shadow-xl flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                    <Building className="w-5 h-5" />
                  </div>
                  <button
                    onClick={() => handleDelete(th._id, th.name)}
                    className="p-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white">{th.name}</h3>
                  <p className="text-xs text-gray-400 mt-1 flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                    <span>{th.address}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                    <span>{th.phone}</span>
                  </p>
                </div>

                <div className="pt-2">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                    Configured Screens ({th.screens?.length || 2})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {th.screens?.map((sc) => (
                      <span
                        key={sc._id}
                        className="text-[10px] px-2 py-0.5 rounded bg-gray-800 text-emerald-400 font-semibold border border-gray-700"
                      >
                        {sc.screenName}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#131B2A] rounded-3xl border border-gray-800 max-w-lg w-full p-6 sm:p-8 space-y-5">
              <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                <h3 className="text-lg font-bold text-white">Add New Cinema Multiplex</h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Theatre Name</label>
                  <input
                    type="text"
                    required
                    placeholder="iMovies PVR Icon – Phoenix Palladium"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#161F30] border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">Area / Location</label>
                    <input
                      type="text"
                      required
                      placeholder="Lower Parel"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full bg-[#161F30] border border-gray-700 rounded-xl px-4 py-2.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full bg-[#161F30] border border-gray-700 rounded-xl px-4 py-2.5 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Full Street Address</label>
                  <input
                    type="text"
                    required
                    placeholder="462, Senapati Bapat Marg, Lower Parel..."
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-[#161F30] border border-gray-700 rounded-xl px-4 py-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[#161F30] border border-gray-700 rounded-xl px-4 py-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Amenities (Comma separated)</label>
                  <input
                    type="text"
                    value={formData.amenities}
                    onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                    className="w-full bg-[#161F30] border border-gray-700 rounded-xl px-4 py-2.5 text-white"
                  />
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
                    {submitting ? 'Creating...' : 'Create Theatre'}
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

export default ManageTheatres;
