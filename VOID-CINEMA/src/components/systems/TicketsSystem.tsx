import React from 'react';
import { useStore, MOVIES } from '../../store/useStore';
import { QrCode, Ticket } from 'lucide-react';
import SystemWrapper from './SystemWrapper';

const TicketsSystem: React.FC = () => {
  const bookingHistory = useStore((state) => state.bookingHistory);

  return (
    <SystemWrapper title="My Tickets">
      {bookingHistory.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-white/30 font-mono tracking-widest text-sm w-full h-[60vh]">
          <QrCode size={64} className="mb-4 opacity-20" />
          NO TICKETS FOUND IN DATABASE
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl overflow-y-auto pb-24 pr-4 custom-scrollbar">
          {bookingHistory.map((booking) => {
            const movie = MOVIES.find(m => m.id === booking.movieId);
            return (
              <div key={booking.id} className="glass-panel-neon p-6 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-500 cursor-pointer border border-white/10 bg-black/60">
                {/* Holographic scanning line effect */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-cyan-400 opacity-0 group-hover:opacity-100 group-hover:animate-scan shadow-[0_0_10px_#00f3ff]"></div>
                
                <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-4">
                  <div>
                    <div className="text-xs text-cyan-400 font-mono tracking-widest mb-1">{booking.theatreName} • {booking.date} • {booking.time}</div>
                    <h3 className="text-2xl font-black uppercase text-white leading-tight">{movie?.title}</h3>
                  </div>
                  <Ticket size={32} className="text-white/20" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6 text-sm font-mono text-gray-400">
                  <div>
                    <span className="block text-xs text-white/30 mb-1">SEAT SELECTION</span>
                    <span className="text-white text-lg">{booking.seats.join(', ')}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-white/30 mb-1">STATUS</span>
                    <span className="text-green-400 tracking-widest">AUTHORIZED</span>
                  </div>
                </div>
                
                <div className="border-t border-dashed border-white/20 pt-4 flex justify-between items-end">
                  <div>
                    <div className="text-[10px] text-white/30 tracking-widest mb-1">BOOKING REF</div>
                    <div className="font-mono text-neon-purple tracking-wider text-xs">{booking.bookingReference}</div>
                  </div>
                  <QrCode size={48} className="text-white/50" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SystemWrapper>
  );
};

export default TicketsSystem;
