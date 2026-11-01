import React from 'react';

export const MovieCardSkeleton = () => {
  return (
    <div className="bg-[#161F30] rounded-2xl overflow-hidden border border-gray-800/60 shimmer-effect flex flex-col h-[480px]">
      <div className="h-[320px] bg-gray-800/40 w-full"></div>
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="h-5 bg-gray-700/50 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-800/60 rounded w-1/2 mb-3"></div>
          <div className="flex gap-2">
            <div className="h-6 w-14 bg-gray-800 rounded-full"></div>
            <div className="h-6 w-14 bg-gray-800 rounded-full"></div>
          </div>
        </div>
        <div className="h-10 bg-gray-800/80 rounded-xl mt-4"></div>
      </div>
    </div>
  );
};

export const MovieGridSkeleton = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <MovieCardSkeleton key={i} />
      ))}
    </div>
  );
};

export default { MovieCardSkeleton, MovieGridSkeleton };
