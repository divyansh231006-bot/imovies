import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Play,
  Ticket,
  Star,
  Clock,
  Sparkles,
  ShieldCheck,
  Zap,
  Film,
  TrendingUp,
  Calendar,
  ChevronRight
} from 'lucide-react';
import api from '../services/api';
import MovieCard from '../components/MovieCard';
import { MovieGridSkeleton } from '../components/LoadingSkeleton';

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [heroMovie, setHeroMovie] = useState(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/movies');
        if (data.success) {
          setMovies(data.data);
          // Pick featured movie or highest rated movie for hero
          const featured = data.data.find((m) => m.featured) || data.data[0];
          setHeroMovie(featured);
        }
      } catch (err) {
        console.error('Failed to load movies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const genres = ['All', 'Action', 'Sci-Fi', 'Drama', 'Adventure', 'History'];

  const nowShowing = movies.filter((m) => m.status === 'now_showing');
  const comingSoon = movies.filter((m) => m.status === 'coming_soon');

  const filteredNowShowing =
    selectedGenre === 'All'
      ? nowShowing
      : nowShowing.filter((m) =>
          m.genre.some((g) => g.toLowerCase() === selectedGenre.toLowerCase())
        );

  return (
    <div className="min-h-screen bg-[#080B11] text-gray-100">
      {/* Hero Banner Section */}
      {heroMovie && (
        <section className="relative w-full h-[85vh] min-h-[550px] max-h-[750px] overflow-hidden">
          {/* Backdrop Image */}
          <div className="absolute inset-0">
            <img
              src={heroMovie.backdrop}
              alt={heroMovie.title}
              className="w-full h-full object-cover object-center filter brightness-60 transform scale-105 animate-pulse duration-10000"
            />
            {/* Cinematic Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#080B11] via-[#080B11]/50 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#080B11] via-[#080B11]/70 to-transparent"></div>
          </div>

          {/* Hero Content */}
          <div className="relative max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-16 z-10">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/30 border border-red-500/50 backdrop-blur-md text-red-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                Featured Premiere
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none drop-shadow-xl">
                {heroMovie.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-gray-300 font-medium">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{heroMovie.rating?.toFixed(1)} IMDb</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-red-500" />
                  <span>{Math.floor(heroMovie.duration / 60)}h {heroMovie.duration % 60}m</span>
                </div>
                <span>•</span>
                <span>{heroMovie.genre?.join(', ')}</span>
                <span>•</span>
                <span>{heroMovie.language?.join(', ')}</span>
              </div>

              <p className="text-sm text-gray-300 line-clamp-3 leading-relaxed drop-shadow">
                {heroMovie.description}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to={`/movies/${heroMovie._id}`}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-sm shadow-xl shadow-red-600/40 transition-all hover:scale-105"
                >
                  <Ticket className="w-4 h-4" />
                  Book Tickets Now
                </Link>

                {heroMovie.trailerUrl && (
                  <a
                    href={heroMovie.trailerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-gray-800/80 hover:bg-gray-700 text-white font-semibold text-sm backdrop-blur-md border border-gray-700/60 transition-all hover:scale-105"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    Watch Trailer
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Value Proposition Highlights */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4 p-5 rounded-2xl bg-[#131B2A] border border-gray-800 shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Real-Time Seat Locking</h4>
              <p className="text-xs text-gray-400 mt-0.5">
                Powered by Socket.IO. Zero double-booking, 5-minute checkout holds.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-5 rounded-2xl bg-[#131B2A] border border-gray-800 shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-sky-600/20 border border-sky-500/30 flex items-center justify-center shrink-0">
              <Film className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">IMAX & Dolby Atmos</h4>
              <p className="text-xs text-gray-400 mt-0.5">
                Premium multi-tier seating from Silver to VIP Recliners.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-5 rounded-2xl bg-[#131B2A] border border-gray-800 shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Instant Cancellation</h4>
              <p className="text-xs text-gray-400 mt-0.5">
                Cancel eligible tickets before showtime with automatic refunds.
              </p>
            </div>
          </div>
        </section>

        {/* Now Showing Section */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                <h2 className="text-2xl font-black text-white tracking-tight">Now Showing</h2>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Catch the latest blockbuster releases running in theatres near you
              </p>
            </div>

            {/* Genre Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {genres.map((genre) => (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedGenre === genre
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                      : 'bg-[#161F30] text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <MovieGridSkeleton count={8} />
          ) : filteredNowShowing.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredNowShowing.map((movie) => (
                <MovieCard key={movie._id} movie={movie} />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-[#131B2A] rounded-2xl border border-gray-800">
              <Film className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">No Movies Found</h3>
              <p className="text-xs text-gray-400 mt-1">
                No now showing movies currently match the selected genre.
              </p>
            </div>
          )}
        </section>

        {/* Coming Soon Section */}
        {comingSoon.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-500" />
                  <h2 className="text-2xl font-black text-white tracking-tight">Coming Soon</h2>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Explore highly anticipated releases arriving soon on the big screen
                </p>
              </div>

              <Link
                to="/movies?status=coming_soon"
                className="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-400 transition-colors"
              >
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {comingSoon.map((movie) => (
                <MovieCard key={movie._id} movie={movie} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Home;
