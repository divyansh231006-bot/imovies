import React from 'react';
import { Armchair, Check, Lock, Sparkles } from 'lucide-react';

const tierBadgeColors = {
  Silver: 'text-slate-300 border-slate-600 bg-slate-900/60',
  Gold: 'text-amber-300 border-amber-600 bg-amber-950/40',
  Platinum: 'text-sky-300 border-sky-600 bg-sky-950/40',
  VIP: 'text-purple-300 border-purple-600 bg-purple-950/40'
};

const SeatLayout = ({
  seatMap = [],
  selectedSeats = [],
  onSeatToggle,
  maxSeats = 8
}) => {
  const isSelected = (seatNumber) => {
    return selectedSeats.some((s) => s.seatNumber === seatNumber);
  };

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* Curved Cinema Screen */}
      <div className="w-full max-w-2xl mb-12 flex flex-col items-center">
        <div className="w-full cinema-screen"></div>
        <p className="text-[11px] font-bold tracking-widest text-gray-300 uppercase mt-2">
          All eyes on this screen
        </p>
      </div>

      {/* Seating Grid */}
      <div className="w-full overflow-x-auto pb-6 flex flex-col items-center">
        <div className="min-w-fit px-4 space-y-6">
          {seatMap.map((row) => (
            <div key={row.rowLetter} className="flex flex-col items-center gap-1.5">
              {/* Row Header with Tier & Price */}
              <div className="w-full flex items-center justify-between text-[11px] text-gray-300 px-3 pb-1 border-b border-gray-800/40 mb-1">
                <span className="font-bold flex items-center gap-1.5">
                  <span className={`px-2 py-0.5 rounded border text-[10px] uppercase font-bold tracking-wider ${tierBadgeColors[row.tier] || tierBadgeColors.Gold}`}>
                    {row.tier}
                  </span>
                  <span>₹{row.price}</span>
                </span>
                <span className="text-gray-400 text-[10px]">Row {row.rowLetter}</span>
              </div>

              {/* Row Seats */}
              <div className="flex items-center gap-2">
                {/* Left Row Letter */}
                <span className="w-5 text-center text-xs font-bold text-gray-300">
                  {row.rowLetter}
                </span>

                {/* Seat Buttons */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {row.seats.map((seat) => {
                    const selected = isSelected(seat.seatNumber);
                    const isBooked = seat.status === 'booked';
                    const isLockedByOther = seat.status === 'locked';
                    const isDisabled = isBooked || isLockedByOther;

                    let seatColorClass = 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50 hover:bg-emerald-500 hover:text-white cursor-pointer';

                    if (isBooked) {
                      seatColorClass = 'bg-gray-800 text-gray-500 border-gray-700/60 cursor-not-allowed opacity-50';
                    } else if (isLockedByOther) {
                      seatColorClass = 'bg-amber-900/40 text-amber-500 border-amber-700/50 cursor-not-allowed';
                    } else if (selected) {
                      seatColorClass = 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-600/50 scale-110';
                    }

                    return (
                      <React.Fragment key={seat.seatNumber}>
                        <button
                          type="button"
                          disabled={isDisabled}
                          onClick={() => onSeatToggle(seat)}
                          title={`${seat.seatNumber} (${seat.tier}) - ₹${seat.price} [${seat.status}]`}
                          className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-lg border flex flex-col items-center justify-center text-[10px] font-bold transition-all duration-200 ${seatColorClass}`}
                        >
                          {isLockedByOther ? (
                            <Lock className="w-3 h-3 text-amber-400" />
                          ) : selected ? (
                            <Check className="w-3.5 h-3.5 text-white" />
                          ) : (
                            <span>{seat.number}</span>
                          )}
                        </button>

                        {/* Aisle Spacer */}
                        {seat.hasAisleAfter && (
                          <div className="w-4 sm:w-6 pointer-events-none"></div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Right Row Letter */}
                <span className="w-5 text-center text-xs font-bold text-gray-300">
                  {row.rowLetter}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Seat Status Legend */}
      <div className="flex flex-wrap items-center justify-center gap-6 pt-6 border-t border-gray-800/80 text-xs text-gray-300 mt-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md bg-emerald-600/40 border border-emerald-500"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md bg-red-600 border border-red-500 shadow-sm shadow-red-600/50"></div>
          <span className="text-white font-semibold">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md bg-amber-900/40 border border-amber-600 flex items-center justify-center">
            <Lock className="w-2.5 h-2.5 text-amber-400" />
          </div>
          <span>Locked / Held</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md bg-gray-800 border border-gray-700 opacity-60"></div>
          <span>Booked</span>
        </div>
      </div>
    </div>
  );
};

export default SeatLayout;
