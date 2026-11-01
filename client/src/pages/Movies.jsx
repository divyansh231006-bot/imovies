import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, Film, Star, RotateCcw } from 'lucide-react';
import api from '../services/api';
import MovieCard from '../components/MovieCard';
import { MovieGridSkeleton } from '../components/LoadingSkeleton';

const Movies = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availableGenres, setAvailableGenres] = useState([]);
  const [availableLanguages, setAvailableLanguages] = useState([]);

  // Filters from query or state
  const searchQuery = searchParams.get('search') || '';
  const statusParam = searchParams.get('status') || 'all';
  const genreParam = searchParams.get('genre') || 'All';
  const languageParam = searchParams.get('language') || 'All';
  const sortParam = searchParams.get('sort') || 'newest';

  const [search, setSearch] = useState(searchQuery);
  const [status, setStatus] = useState(statusParam);
  const [genre, setGenre] = useState(genreParam);
  const [language, setLanguage] = useState(languageParam);
  const [sort, setSort] = useState(sortParam);
  const [minRating, setMinRating] = useState(0);

  useEffect(() => {
    // Sync state with search params if updated from navbar
    setSearch(searchParams.get('search') || '');
    if (searchParams.get('status')) setStatus(searchParams.get('status'));
    if (searchParams.get('genre')) setGenre(searchParams.get('genre'));
  }, [searchParams]);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const params = {};
        if (search) params.search = search;
        if (status !== 'all') params.status = status;
        if (genre !== 'All') params.genre = genre;
        if (language !== 'All') params.language = language;
        if (sort) params.sort = sort;
        if (minRating > 0) params.minRating = minRating;

        const { data } = await api.get('/movies', { params });
        if (data.success) {
          setMovies(data.data);
          if (data.availableGenres) setAvailableGenres(data.availableGenres);
          if (data.availableLanguages) setAvailableLanguages(data.availableLanguages);
        }
      } catch (err) {
        console.error('Failed to fetch movies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [search, status, genre, language, sort, minRating]);

  const handleResetFilters = () => {
    setSearch('');
    setStatus('all');
    setGenre('All');
    setLanguage('All');
    setSort('newest');
    setMinRating(0);
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-[#080B11] text-gray-100 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Title */}
        <div className="border-b border-gray-800 pb-6">
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Discover <span className="text-red-500">Movies</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Browse currently showing theatrical releases and upcoming cinema blockbusters
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-[#131B2A] rounded-2xl p-4 sm:p-6 border border-gray-800 shadow-xl space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              <input
                type="text"
                placeholder="Search by title, director, cast..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#161F30] border border-gray-700/80 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
              />
            </div>

            {/* Category / Status Filter */}
            <div>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-[#161F30] border border-gray-700/80 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-red-500 cursor-pointer"
              >
                <option value="all">All Releases</option>
                <option value="now_showing">Now Showing</option>
                <option value="coming_soon">Coming Soon</option>
              </select>
            </div>

            {/* Genre Filter */}
            <div>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full bg-[#161F30] border border-gray-700/80 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-red-500 cursor-pointer"
              >
                <option value="All">All Genres</option>
                {availableGenres.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            {/* Language Filter */}
            <div>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-[#161F30] border border-gray-700/80 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-red-500 cursor-pointer"
              >
                <option value="All">All Languages</option>
                {availableLanguages.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Secondary Filter Row: Sort and Rating */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-gray-800 text-xs">
            <div className="flex items-center gap-4 flex-wrap">
              {/* Sort by */}
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Sort by:</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="bg-[#161F30] border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-gray-200"
                >
                  <option value="newest">Latest Release</option>
                  <option value="rating">Top Rated (IMDb)</option>
                  <option value="title">Alphabetical (A-Z)</option>
                </select>
              </div>

              {/* Min Rating */}
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Min Rating:</span>
                <div className="flex items-center gap-1">
                  {[0, 7.0, 8.0, 8.5].map((val) => (
                    <button
                      key={val}
                      onClick={() => setMinRating(val)}
                      className={`px-2 py-1 rounded text-[11px] font-bold ${
                        minRating === val
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-gray-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      {val === 0 ? 'Any' : `${val}+`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Reset Button */}
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 text-gray-400 hover:text-red-400 transition-colors font-medium ml-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between text-xs text-gray-400 px-1">
          <span>Showing <strong className="text-white">{movies.length}</strong> movies</span>
        </div>

        {/* Movies Grid */}
        {loading ? (
          <MovieGridSkeleton count={8} />
        ) : movies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {movies.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="p-16 text-center bg-[#131B2A] rounded-2xl border border-gray-800">
            <Film className="w-14 h-14 text-gray-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">No Movies Match Your Criteria</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1 mb-4">
              Try adjusting your search terms or clearing genre and rating filters.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-xs"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Movies;
