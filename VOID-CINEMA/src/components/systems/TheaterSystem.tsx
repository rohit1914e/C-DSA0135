import React, { useEffect, useState } from 'react';
import { useStore } from '../../store/useStore';
import { LogOut, ArrowLeft, Plus, Play, CheckCircle2, Trophy, QrCode } from 'lucide-react';
import gsap from 'gsap';

type BookingPhase = 'idle' | 'confirming' | 'generating' | 'success';

const TheaterSystem: React.FC = () => {
  const setActiveSector = useStore((state) => state.setActiveSector);
  const selectedMovie = useStore((state) => state.selectedMovie);
  const setSelectedMovie = useStore((state) => state.setSelectedMovie);
  const activePOVSeat = useStore((state) => state.activePOVSeat);
  const setActivePOVSeat = useStore((state) => state.setActivePOVSeat);
  const selectedSeats = useStore((state) => state.selectedSeats);
  const toggleSeatSelection = useStore((state) => state.toggleSeatSelection);
  const isComparing = useStore((state) => state.isComparing);
  const setIsComparing = useStore((state) => state.setIsComparing);
  const recommendedSeat = useStore((state) => state.recommendedSeat);
  const setRecommendedSeat = useStore((state) => state.setRecommendedSeat);
  const addBooking = useStore((state) => state.addBooking);
  const clearSelectedSeats = useStore((state) => state.clearSelectedSeats);

  const [bookingPhase, setBookingPhase] = useState<BookingPhase>('idle');

  const handleReturnToExplore = () => {
    gsap.to('.theater-ui', { opacity: 0, duration: 0.5, onComplete: () => {
      setSelectedMovie(null);
      setActivePOVSeat(null);
      setBookingPhase('idle');
      clearSelectedSeats();
      setActiveSector('explore');
    }});
  };

  const handleExitSeat = () => {
    setActivePOVSeat(null);
    setIsComparing(false);
    setRecommendedSeat(null);
    setBookingPhase('idle');
  };

  const startBooking = () => {
    setBookingPhase('confirming');
  };

  const confirmBooking = () => {
    setBookingPhase('generating');
    
    // Simulate generation sequence
    setTimeout(() => {
      if (selectedMovie && recommendedSeat) {
        addBooking({
          id: `TKT-${Math.floor(Math.random() * 1000000)}`,
          movieId: selectedMovie.id,
          seats: [recommendedSeat.id],
          date: 'TDS-2026',
          time: '22:00',
          status: 'upcoming',
          paymentStatus: 'paid', // Dummy paid since it's success
          totalAmount: 300,
        });
        setBookingPhase('success');
      }
    }, 3000);
  };

  const viewTickets = () => {
    setActiveSector('tickets');
    setActivePOVSeat(null);
    setBookingPhase('idle');
    clearSelectedSeats();
  };

  const isCurrentSeatSelected = activePOVSeat && selectedSeats.find(s => s.id === activePOVSeat.id);

  // Automated Tour Logic
  useEffect(() => {
    if (isComparing && selectedSeats.length > 0) {
      let currentIndex = 0;
      
      const tourNextSeat = () => {
        if (currentIndex < selectedSeats.length) {
          const nextSeat = selectedSeats[currentIndex];
          setActivePOVSeat(nextSeat);
          currentIndex++;
          
          setTimeout(tourNextSeat, 3500); 
        } else {
          const bestSeat = [...selectedSeats].sort((a, b) => b.qualityScore - a.qualityScore)[0];
          setRecommendedSeat(bestSeat);
          setActivePOVSeat(bestSeat); 
          setIsComparing(false);
        }
      };
      
      tourNextSeat();
    }
  }, [isComparing, selectedSeats, setActivePOVSeat, setRecommendedSeat, setIsComparing]);

  // If in booking flow, render the booking overlays
  if (bookingPhase !== 'idle' && selectedMovie && recommendedSeat) {
    return (
      <div className="theater-ui absolute inset-0 w-full h-full pointer-events-auto flex items-center justify-center backdrop-blur-sm bg-black/40 z-50">
        {bookingPhase === 'confirming' && (
          <div className="glass-panel-neon p-10 backdrop-blur-2xl border border-white/20 bg-black/80 max-w-lg w-full">
            <h2 className="text-2xl font-black uppercase tracking-widest text-white mb-8 border-b border-white/10 pb-4">Initialize Booking</h2>
            
            <div className="space-y-4 font-mono text-sm text-gray-300 mb-10">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span>SIMULATION</span>
                <span className="text-white uppercase tracking-widest" style={{ color: recommendedSeat.color }}>{selectedMovie.title}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span>SEAT COORDINATE</span>
                <span className="text-white">{recommendedSeat.id} (Row {recommendedSeat.row})</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span>IMMERSION QUALITY</span>
                <span className="text-white">{recommendedSeat.qualityScore} / 100</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span>TICKET COUNT</span>
                <span className="text-white">1x PREMIER</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setBookingPhase('idle')} className="flex-1 py-4 border border-white/20 text-white hover:bg-white/10 uppercase tracking-widest text-sm transition-colors">
                Abort
              </button>
              <button onClick={confirmBooking} className="flex-2 w-2/3 py-4 bg-white text-black font-black uppercase tracking-widest text-sm hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                Confirm & Generate
              </button>
            </div>
          </div>
        )}

        {bookingPhase === 'generating' && (
          <div className="flex flex-col items-center justify-center gap-8">
            <div className="w-24 h-24 border-4 border-t-transparent border-white/20 rounded-full animate-spin relative" style={{ borderTopColor: recommendedSeat.color }}>
              <div className="absolute inset-2 border-4 border-b-transparent border-white/40 rounded-full animate-spin-reverse"></div>
            </div>
            <div className="text-center font-mono tracking-[0.3em] text-white animate-pulse">
              ENCRYPTING TICKET DATA...<br/>
              <span className="text-xs text-gray-500 mt-2 block">SECURE CONNECTION ESTABLISHED</span>
            </div>
          </div>
        )}

        {bookingPhase === 'success' && (
          <div className="glass-panel-neon p-12 backdrop-blur-2xl border border-white/20 bg-black/80 max-w-xl w-full flex flex-col items-center">
            <CheckCircle2 size={64} style={{ color: recommendedSeat.color }} className="mb-6 drop-shadow-[0_0_20px_currentColor]" />
            <h1 className="text-3xl font-black uppercase tracking-widest text-white mb-2 text-center">Seat Reserved Successfully</h1>
            <p className="text-gray-400 font-mono text-sm tracking-widest mb-10 text-center">TICKET ID ALLOCATED IN PROFILE</p>
            
            {/* Digital Ticket Preview */}
            <div className="w-full border border-white/10 p-6 bg-white/5 flex items-center justify-between mb-10">
              <div>
                <div className="text-2xl font-black uppercase" style={{ color: recommendedSeat.color }}>{selectedMovie.title}</div>
                <div className="text-sm font-mono text-gray-400 mt-1">SEAT {recommendedSeat.id} • {selectedMovie.duration}</div>
              </div>
              <QrCode size={48} className="text-white/50" />
            </div>

            <div className="flex w-full gap-4">
              <button onClick={handleReturnToExplore} className="flex-1 py-4 border border-white/20 text-white hover:bg-white/10 uppercase tracking-widest text-sm transition-colors">
                Return to Universe
              </button>
              <button onClick={viewTickets} className="flex-1 py-4 bg-white text-black font-black uppercase tracking-widest text-sm hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                View Ticket
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="theater-ui absolute inset-0 w-full h-full pointer-events-none">
      
      {/* Return to Explore Button */}
      {!activePOVSeat && (
        <button 
          onClick={handleReturnToExplore}
          className="absolute top-8 right-8 pointer-events-auto flex items-center gap-2 text-white/50 hover:text-white hover:bg-white/10 transition-all duration-300 px-4 py-2 rounded-full backdrop-blur-md border border-white/10 uppercase tracking-widest text-xs"
        >
          <LogOut size={14} />
          <span>Exit Theater</span>
        </button>
      )}

      {/* POV Seat HUD */}
      {activePOVSeat && !isComparing && (
        <div className="absolute top-8 left-8 flex gap-4 pointer-events-auto">
          <button 
            onClick={handleExitSeat}
            className="flex items-center gap-2 text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300 px-6 py-3 rounded-full backdrop-blur-md border border-white/20 uppercase tracking-widest text-sm"
            style={{ borderColor: recommendedSeat?.id === activePOVSeat.id ? '#ffd700' : activePOVSeat.color }}
          >
            <ArrowLeft size={16} />
            <span>Stand Up</span>
          </button>
          
          {recommendedSeat?.id !== activePOVSeat.id && (
            <button 
              onClick={() => toggleSeatSelection(activePOVSeat)}
              className={`flex items-center gap-2 transition-all duration-300 px-6 py-3 rounded-full backdrop-blur-md border uppercase tracking-widest text-sm
                ${isCurrentSeatSelected ? 'bg-white/20 text-white border-white/50' : 'text-white/80 hover:text-white hover:bg-white/10 border-white/20'}`}
            >
              {isCurrentSeatSelected ? <CheckCircle2 size={16} /> : <Plus size={16} />}
              <span>{isCurrentSeatSelected ? 'Added to Compare' : 'Add to Compare'}</span>
            </button>
          )}
        </div>
      )}

      {/* Comparison HUD (Active during tour) */}
      {isComparing && activePOVSeat && (
        <div className="absolute top-12 left-1/2 transform -translate-x-1/2 pointer-events-auto">
          <div className="glass-panel-neon p-4 backdrop-blur-xl border border-white/20 bg-black/80 rounded-lg flex items-center gap-6" style={{ borderColor: activePOVSeat.color }}>
            <div className="animate-pulse flex items-center gap-2 text-white font-bold tracking-widest">
              <Play size={16} /> COMPARING
            </div>
            <div className="h-8 w-[1px] bg-white/20"></div>
            <div>
              <div className="text-xs text-gray-400 font-mono">CURRENT VIEW</div>
              <div className="text-xl font-black text-white">{activePOVSeat.id}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 font-mono">SCORE</div>
              <div className="text-xl font-black" style={{ color: activePOVSeat.color }}>{activePOVSeat.qualityScore}</div>
            </div>
          </div>
        </div>
      )}

      {/* Recommended Seat HUD */}
      {recommendedSeat && activePOVSeat?.id === recommendedSeat.id && !isComparing && (
        <div className="absolute top-12 left-1/2 transform -translate-x-1/2 pointer-events-auto">
          <div className="glass-panel-neon p-6 backdrop-blur-xl border border-yellow-500/50 bg-black/80 rounded-lg flex items-center gap-6 shadow-[0_0_30px_rgba(255,215,0,0.2)]">
            <Trophy size={32} className="text-yellow-400" />
            <div>
              <div className="text-sm text-yellow-500 font-bold tracking-widest uppercase mb-1">Recommended Seat</div>
              <div className="text-3xl font-black text-white">{recommendedSeat.id} <span className="text-lg text-gray-400 font-normal">({recommendedSeat.ratingCategory})</span></div>
            </div>
            <div className="ml-8 border-l border-white/10 pl-8">
              <button 
                onClick={startBooking}
                className="bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase tracking-widest px-8 py-3 transition-colors">
                Book Seat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Dock */}
      {!isComparing && !recommendedSeat && selectedSeats.length > 0 && (
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 pointer-events-auto flex flex-col items-center gap-4">
          <div className="flex gap-4">
            {selectedSeats.map(seat => (
              <div key={seat.id} className="w-32 glass-panel-neon p-3 backdrop-blur-md border border-white/10 bg-black/60 flex flex-col gap-1 relative group cursor-pointer"
                onClick={() => setActivePOVSeat(seat)}
              >
                <div 
                  className="absolute -top-2 -right-2 bg-red-500 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  onClick={(e) => { e.stopPropagation(); toggleSeatSelection(seat); }}
                >
                  <span className="text-xs text-white font-bold">&times;</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white text-lg">{seat.id}</span>
                  <span className="text-xs px-1 rounded bg-white/10" style={{ color: seat.color }}>{seat.qualityScore}</span>
                </div>
                <div className="text-[9px] font-mono text-gray-400 uppercase">{seat.ratingCategory}</div>
                <div className="text-[10px] font-mono text-gray-500 mt-1">{seat.distanceToScreen}m</div>
                
                <div className="absolute bottom-0 left-0 w-full h-[2px]" style={{ backgroundColor: seat.color }}></div>
              </div>
            ))}
          </div>
          
          {selectedSeats.length > 1 && (
            <button 
              onClick={() => setIsComparing(true)}
              className="mt-2 bg-white text-black font-black uppercase tracking-[0.2em] px-12 py-3 hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
              Compare {selectedSeats.length} Seats
            </button>
          )}
        </div>
      )}

      {/* Subtle cinematic letterbox overlay */}
      <div className="absolute top-0 left-0 w-full h-[10vh] bg-black/80 pointer-events-none z-50"></div>
      <div className="absolute bottom-0 left-0 w-full h-[10vh] bg-black/80 pointer-events-none z-50"></div>
    </div>
  );
};

export default TheaterSystem;
