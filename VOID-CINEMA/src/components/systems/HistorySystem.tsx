import React from 'react';
import { useStore, MOVIES } from '../../store/useStore';
import { Archive, CheckCircle2 } from 'lucide-react';
import SystemWrapper from './SystemWrapper';

const HistorySystem: React.FC = () => {
  const bookingHistory = useStore((state) => state.bookingHistory);

  return (
    <SystemWrapper title="History">
      {bookingHistory.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-white/30 font-mono tracking-widest text-sm w-full h-[60vh]">
          <Archive size={64} className="mb-4 opacity-20" />
          NO ARCHIVAL RECORDS FOUND
        </div>
      ) : (
        <div className="w-full max-w-5xl space-y-6 overflow-y-auto pb-24 pr-4 custom-scrollbar">
          {bookingHistory.map((booking) => {
            const movie = MOVIES.find(m => m.id === booking.movieId);
            return (
              <div key={booking.id} className="glass-panel-neon p-6 relative overflow-hidden group hover:scale-[1.01] transition-transform duration-500 border border-white/10 bg-black/60 rounded-lg flex flex-col md:flex-row gap-6">
                
                {/* Poster */}
                {movie?.posterUrl && (
                  <div className="w-full md:w-32 shrink-0 aspect-[2/3] rounded-md overflow-hidden relative">
                    <div className="absolute inset-0 bg-neon-cyan/20 opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                    <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-2xl font-black uppercase text-white tracking-widest">{movie?.title}</h3>
                      <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 rounded-sm">
                        <CheckCircle2 size={14} />
                        <span className="text-[10px] font-mono tracking-widest uppercase">Completed</span>
                      </div>
                    </div>
                    <div className="text-sm text-neon-cyan font-mono tracking-widest uppercase mb-4">
                      {booking.theatreName}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm font-mono text-gray-400">
                      <div>
                        <span className="block text-[10px] text-white/30 mb-1">DATE & TIME</span>
                        <span className="text-white">{booking.date}</span><br/>
                        <span className="text-white/70">{booking.time}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-white/30 mb-1">SEATS</span>
                        <span className="text-white">{booking.seats.join(', ')}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-white/30 mb-1">AMOUNT PAID</span>
                        <span className="text-white">₹{booking.totalAmount}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-white/30 mb-1">BOOKING REF</span>
                        <span className="text-neon-purple tracking-widest">{booking.bookingReference}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SystemWrapper>
  );
};

export default HistorySystem;
