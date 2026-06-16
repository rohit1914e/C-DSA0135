import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore, MOVIES } from '../../store/useStore';
import { ChevronLeft, MapPin, CheckCircle2 } from 'lucide-react';
import paymentQr from '../../assets/payment/payment-qr.png';
import gsap from 'gsap';

const TicketViewPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { bookingHistory } = useStore();

  const booking = bookingHistory.find(b => b.id === bookingId);
  const movie = booking ? MOVIES.find(m => m.id === booking.movieId) : null;

  useEffect(() => {
    if (!booking || !movie) {
      navigate('/tickets');
      return;
    }
    
    // Entrance Animation
    gsap.fromTo('.ticket-container', 
      { opacity: 0, y: 50, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power3.out' }
    );
  }, [booking, movie, navigate]);

  if (!booking || !movie) return null;

  return (
    <div className="w-full min-h-screen relative z-10 pointer-events-auto bg-[#050508] overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-neon-purple/5 via-black to-neon-cyan/5 pointer-events-none -z-10"></div>
      
      {/* Back Nav */}
      <div className="sticky top-0 w-full px-6 py-4 z-50">
        <button 
          onClick={() => navigate('/tickets')}
          className="flex items-center gap-2 text-neon-cyan hover:text-white transition-colors uppercase tracking-[0.2em] text-sm glass-panel-neon px-5 py-2.5 rounded-sm inline-flex backdrop-blur-md border border-neon-cyan/20"
        >
          <ChevronLeft size={18} />
          <span>My Tickets</span>
        </button>
      </div>

      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 perspective-[1000px]">
        {/* The Ticket */}
        <div className="ticket-container glass-panel border border-neon-cyan/30 rounded-2xl w-full max-w-4xl flex flex-col md:flex-row relative overflow-hidden shadow-[0_0_50px_rgba(0,255,255,0.1)]">
          
          {/* Left: Poster */}
          <div className="w-full md:w-5/12 h-64 md:h-auto relative">
            <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black via-black/40 to-transparent"></div>
          </div>

          {/* Right: Info */}
          <div className="w-full md:w-7/12 p-8 md:p-12 flex flex-col justify-between relative bg-black/80 backdrop-blur-xl">
            
            {/* Payment Badge */}
            <div className="absolute top-8 right-8 flex items-center gap-2 text-green-400 border border-green-500/30 bg-green-500/10 px-3 py-1 rounded text-[10px] font-mono tracking-widest uppercase">
              <CheckCircle2 size={12} /> Confirmed
            </div>

            <div>
              <p className="text-[10px] font-mono text-neon-cyan tracking-[0.3em] uppercase mb-2">Void Cinema Digital Access</p>
              <h2 className="text-4xl font-black uppercase tracking-widest text-white mb-2">{movie.title}</h2>
              <p className="text-xs font-mono text-gray-400 tracking-widest mb-8">BOOKING ID: <span className="text-white">{booking.id}</span></p>

              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <p className="text-[10px] font-mono text-gray-500 tracking-widest uppercase mb-1">Date</p>
                  <p className="text-lg font-bold text-gray-200">{booking.date}</p>
                </div>
                <div>
                  <p className="text-[10px] font-mono text-gray-500 tracking-widest uppercase mb-1">Time</p>
                  <p className="text-lg font-bold text-gray-200">{booking.time}</p>
                </div>
                <div>
                  <p className="text-[10px] font-mono text-gray-500 tracking-widest uppercase mb-1">Seats</p>
                  <div className="flex flex-wrap gap-2">
                    {booking.seats.map(seat => (
                      <span key={seat} className="px-2 py-1 bg-white/10 rounded text-sm font-mono text-white border border-white/20">
                        {seat}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-mono text-gray-500 tracking-widest uppercase mb-1">Theater</p>
                  <div className="flex items-center gap-2 text-gray-200 text-sm font-bold">
                    <MapPin size={14} className="text-neon-purple" />
                    Screen 1 - Atmos
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-6 mt-6">
              <div>
                <p className="text-[10px] font-mono text-gray-500 tracking-widest uppercase mb-1">Total Paid</p>
                <p className="text-2xl font-black text-neon-cyan">₹{booking.totalAmount}</p>
              </div>
              
              <div className="flex items-center gap-4">
                <p className="text-[10px] font-mono text-gray-500 tracking-[0.3em] uppercase text-right w-24">Scan at Entrance</p>
                <div className="bg-white p-2 rounded-lg border-2 border-white">
                  <img 
                    src={paymentQr} 
                    alt="Entry QR" 
                    className="w-20 h-20 object-contain mix-blend-multiply"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallback = document.createElement('div');
                      fallback.className = 'w-20 h-20 flex items-center justify-center border border-dashed border-gray-400 text-[10px] font-mono text-gray-500 text-center';
                      fallback.textContent = 'QR NOT FOUND';
                      e.currentTarget.parentElement?.appendChild(fallback);
                    }}
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Decorative Dashed cut line */}
          <div className="absolute left-0 md:left-5/12 top-0 bottom-0 w-px border-l-2 border-dashed border-white/20 hidden md:block z-20"></div>
          
          {/* Stub Cutouts */}
          <div className="hidden md:block absolute -top-4 left-[calc(41.666%-16px)] w-8 h-8 rounded-full bg-[#050508] z-30"></div>
          <div className="hidden md:block absolute -bottom-4 left-[calc(41.666%-16px)] w-8 h-8 rounded-full bg-[#050508] z-30"></div>

        </div>
      </div>
    </div>
  );
};

export default TicketViewPage;
