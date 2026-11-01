import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building, MapPin, Phone, Sparkles, Film, ChevronRight } from 'lucide-react';
import api from '../services/api';

const Theatres = () => {
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTheatres = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/theatres');
        if (data.success) {
          setTheatres(data.data);
        }
      } catch (err) {
        console.error('Failed to load theatres:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTheatres();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080B11] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080B11] text-gray-100 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="border-b border-gray-800 pb-6">
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Partner <span className="text-red-500">Theatres</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Experience movies in premium theatres equipped with IMAX, 4DX, and Dolby Atmos technology
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {theatres.map((theatre) => (
            <div
              key={theatre._id}
              className="bg-[#131B2A] rounded-2xl p-6 border border-gray-800 shadow-xl flex flex-col justify-between hover:border-red-500/40 transition-all hover:-translate-y-1"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
                  <Building className="w-6 h-6" />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white">{theatre.name}</h3>
                  <div className="flex items-start gap-1.5 text-xs text-gray-400 mt-1.5">
                    <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span>{theatre.address}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                    <Phone className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                    <span>{theatre.phone || '+91 22 4333 9999'}</span>
                  </div>
                </div>

                {/* Screens */}
                <div>
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                    Available Screens ({theatre.screens?.length || 2})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {theatre.screens?.map((sc) => (
                      <span
                        key={sc._id}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#161F30] text-emerald-300 border border-emerald-500/30"
                      >
                        {sc.screenName}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Amenities */}
                <div>
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                    Features & Amenities
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {theatre.amenities?.map((am) => (
                      <span
                        key={am}
                        className="text-[10px] font-medium px-2 py-0.5 rounded bg-gray-800 text-gray-300 border border-gray-700/50"
                      >
                        {am}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-gray-800">
                <Link
                  to="/movies"
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white font-bold text-xs border border-red-500/30 transition-all"
                >
                  <Film className="w-4 h-4" />
                  View Movies at This Theatre
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Theatres;
