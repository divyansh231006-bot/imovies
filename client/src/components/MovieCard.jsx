import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Ticket, Info, Play } from 'lucide-react';

const formatDuration = (mins) => {
  if (!mins) return '';
  const hours = Math.floor(mins / 60);
  const remaining = mins % 60;
  return `${hours}h ${remaining > 0 ? `${remaining}m` : ''}`;
};

const MovieCard = ({ movie }) => {
  const isComingSoon = movie.status === 'coming_soon';

  return (
    <div className="group relative bg-[#131B2A] rounded-2xl overflow-hidden border border-gray-800/80 hover:border-red-500/50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-red-950/20 flex flex-col h-full transform hover:-translate-y-1.5">
      {/* Poster Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-gray-900">
        <img
          src={movie.poster}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#131B2A] via-transparent to-black/40"></div>

        {/* Rating Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-amber-500/30 text-amber-400 font-bold text-xs shadow-lg">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{movie.rating ? movie.rating.toFixed(1) : '8.0'}</span>
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md border shadow-md ${
              isComingSoon
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-red-600/30 border-red-500/50 text-red-400'
            }`}
          >
            {isComingSoon ? 'Coming Soon' : 'Now Showing'}
          </span>
        </div>

        {/* Duration Overlay */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 text-[11px] font-medium text-gray-300 bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
          <Clock className="w-3 h-3 text-red-400" />
          <span>{formatDuration(movie.duration)}</span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-white group-hover:text-red-400 transition-colors line-clamp-1 mb-1">
            {movie.title}
          </h3>

          {/* Languages */}
          <p className="text-xs text-gray-400 mb-2.5 line-clamp-1">
            {movie.language?.join(' • ')}
          </p>

          {/* Genre Pills */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {movie.genre?.slice(0, 2).map((g) => (
              <span
                key={g}
                className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#1E293B] text-gray-300 border border-gray-700/50"
              >
                {g}
              </span>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-800/80">
          <Link
            to={`/movies/${movie._id}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs shadow-md shadow-red-950/50 transition-all hover:scale-[1.02]"
          >
            <Ticket className="w-3.5 h-3.5" />
            {isComingSoon ? 'Explore' : 'Book Tickets'}
          </Link>
          <Link
            to={`/movies/${movie._id}`}
            title="View Details"
            className="p-2.5 rounded-xl bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
          >
            <Info className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
