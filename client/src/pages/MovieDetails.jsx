import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  Clock,
  Calendar,
  Globe,
  Film,
  Play,
  MapPin,
  Tag,
  ChevronRight,
  Shield,
  Ticket,
  Users
} from 'lucide-react';
import api from '../services/api';

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableDates, setAvailableDates] = useState([]);
  const [showTrailerModal, setShowTrailerModal] = useState(false);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/movies/${id}`);
        if (data.success) {
          setMovie(data.data);

          // Extract unique dates from showtimes
          if (data.data.showtimes && data.data.showtimes.length > 0) {
            const dateSet = new Set(data.data.showtimes.map((st) => st.showDate));
            const sortedDates = Array.from(dateSet).sort();
            setAvailableDates(sortedDates);
            setSelectedDate(sortedDates[0]);
          } else {
            // Default dates
            const today = new Date().toISOString().split('T')[0];
            setAvailableDates([today]);
            setSelectedDate(today);
          }
        }
      } catch (err) {
        console.error('Failed to load movie details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080B11] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-[#080B11] flex flex-col items-center justify-center text-white">
        <p className="text-xl font-bold mb-4">Movie not found</p>
        <Link to="/movies" className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold text-sm">
          Browse All Movies
        </Link>
      </div>
    );
  }

  // Filter showtimes for the selected date
  const filteredShowtimes = (movie.showtimes || []).filter(
    (st) => st.showDate === selectedDate
  );

  // Group showtimes by theatre
  const theatreMap = {};
  filteredShowtimes.forEach((st) => {
    const thId = st.theatreId._id;
    if (!theatreMap[thId]) {
      theatreMap[thId] = {
        theatre: st.theatreId,
        showtimes: []
      };
    }
    theatreMap[thId].showtimes.push(st);
  });

  const theatreList = Object.values(theatreMap);

  const formatDateLabel = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    const day = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dateNum = d.getDate();
    const month = d.toLocaleDateString('en-US', { month: 'short' });
    return { day, dateNum, month };
  };

  return (
    <div className="min-h-screen bg-[#080B11] text-gray-100">
      {/* Movie Backdrop Hero */}
      <div className="relative w-full h-[65vh] min-h-[450px] max-h-[600px] overflow-hidden">
        <img
          src={movie.backdrop}
          alt={movie.title}
          className="w-full h-full object-cover filter brightness-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080B11] via-[#080B11]/70 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#080B11] via-transparent to-transparent"></div>

        {/* Hero details container */}
        <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 z-10 flex flex-col sm:flex-row items-end gap-6 sm:gap-8">
          {/* Movie Poster */}
          <div className="relative w-36 sm:w-52 aspect-[2/3] rounded-2xl overflow-hidden border-2 border-gray-700/80 shadow-2xl shrink-0 -mb-12 z-20 hidden sm:block bg-gray-900">
            <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" />
          </div>

          {/* Quick info in hero */}
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-red-600/40 border border-red-500/60 text-red-300">
                {movie.status === 'coming_soon' ? 'Coming Soon' : 'Now Showing'}
              </span>
              <span className="text-xs text-gray-300">•</span>
              <span className="text-xs text-gray-300">{movie.language?.join(', ')}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md">
              {movie.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-300">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{movie.rating ? movie.rating.toFixed(1) : '8.0'} IMDb</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-red-500" />
                <span>{Math.floor(movie.duration / 60)}h {movie.duration % 60}m</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-red-500" />
                <span>{new Date(movie.releaseDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Details and Showtime Selector */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12">
        {/* Mobile Poster and Quick Synopsis */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column: Synopsis, Cast, Crew */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Movie */}
            <div className="bg-[#131B2A] rounded-2xl p-6 border border-gray-800 space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Film className="w-5 h-5 text-red-500" />
                About the Movie
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                {movie.description}
              </p>

              {/* Genre Pills */}
              <div className="flex flex-wrap gap-2 pt-2">
                {movie.genre?.map((g) => (
                  <span
                    key={g}
                    className="text-xs font-semibold px-3 py-1 rounded-lg bg-[#1E293B] text-gray-200 border border-gray-700/60"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>

            {/* Cast & Director */}
            <div className="bg-[#131B2A] rounded-2xl p-6 border border-gray-800 space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-red-500" />
                Cast & Crew
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-gray-400 font-medium">Director:</span>
                  <p className="text-white font-bold mt-0.5">{movie.director || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-400 font-medium">Starring Cast:</span>
                  <p className="text-white font-bold mt-0.5">{movie.cast?.join(', ') || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Trailer preview */}
            {movie.trailerUrl && (
              <div className="bg-[#131B2A] rounded-2xl p-6 border border-gray-800 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Official Theatrical Trailer</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Watch high definition preview on YouTube</p>
                </div>
                <a
                  href={movie.trailerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-transform hover:scale-105"
                >
                  <Play className="w-4 h-4 fill-white" />
                  Watch Trailer
                </a>
              </div>
            )}
          </div>

          {/* Right Column: Quick Booking Snapshot */}
          <div className="space-y-6">
            <div className="bg-[#131B2A] rounded-2xl p-6 border border-gray-800 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-gray-400">
                Ticket Information
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-gray-800">
                  <span className="text-gray-400">Standard Silver</span>
                  <span className="font-bold text-white">From ₹190</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-800">
                  <span className="text-gray-400">Executive Gold</span>
                  <span className="font-bold text-white">From ₹280</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-800">
                  <span className="text-gray-400">IMAX 4K Platinum</span>
                  <span className="font-bold text-white">From ₹390</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-400">VIP Recliner</span>
                  <span className="font-bold text-purple-400">From ₹580</span>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href="#showtimes"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all hover:scale-[1.02]"
                >
                  <Ticket className="w-4 h-4" />
                  Select Theatres & Showtimes
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Theatre and Showtime Selection Section */}
        <section id="showtimes" className="space-y-8 pt-6 border-t border-gray-800">
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <Ticket className="w-6 h-6 text-red-500" />
              Book Tickets: Theatres & Showtimes
            </h2>
            <p className="text-xs text-gray-400">
              Select your preferred date and choose a cinema hall & showtime to reserve seats
            </p>

            {/* Date Selection Pills */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {availableDates.map((dateStr) => {
                const { day, dateNum, month } = formatDateLabel(dateStr);
                const isSelected = selectedDate === dateStr;
                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`flex flex-col items-center justify-center min-w-[75px] py-2.5 px-3 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/40 scale-105'
                        : 'bg-[#131B2A] border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase">{day}</span>
                    <span className="text-base font-black my-0.5">{dateNum}</span>
                    <span className="text-[10px] font-medium">{month}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Theatres List */}
          {theatreList.length > 0 ? (
            <div className="space-y-6">
              {theatreList.map(({ theatre, showtimes }) => (
                <div
                  key={theatre._id}
                  className="bg-[#131B2A] rounded-2xl p-6 border border-gray-800 shadow-xl space-y-4 hover:border-gray-700/80 transition-colors"
                >
                  {/* Theatre Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-gray-800/80 pb-4">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-red-500" />
                        {theatre.name}
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">{theatre.address}</p>
                    </div>

                    {/* Amenities tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {theatre.amenities?.slice(0, 3).map((a) => (
                        <span
                          key={a}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded bg-gray-800/80 text-gray-300 border border-gray-700/40"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Showtimes Buttons */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                      Available Showtimes
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {showtimes.map((st) => (
                        <Link
                          key={st._id}
                          to={`/seat-selection/${st._id}`}
                          className="group relative flex flex-col items-center justify-center px-5 py-3 rounded-xl bg-[#161F30] border border-gray-700/60 hover:border-red-500 hover:bg-red-600/10 text-white transition-all shadow-md hover:scale-105"
                        >
                          <span className="text-sm font-black group-hover:text-red-400 transition-colors">
                            {st.startTime}
                          </span>
                          <span className="text-[10px] text-gray-400 mt-0.5">
                            {st.screenId?.screenName || 'Screen 1'}
                          </span>
                          <span className="text-[9px] text-emerald-400 font-bold mt-1">
                            {st.screenId?.screenType || 'Dolby Atmos'}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-[#131B2A] rounded-2xl border border-gray-800">
              <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">No Shows Scheduled for this Date</h3>
              <p className="text-xs text-gray-400 mt-1">
                Please select another date above or check other movies.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default MovieDetails;
