import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore, MOVIES, type Booking } from '../../store/useStore';
import { ChevronLeft, Star, Eye, Ruler, RotateCcw, Trophy } from 'lucide-react';
import gsap from 'gsap';

// Seat data generation
interface SeatData {
  id: string;
  row: string;
  number: number;
  category: 'VIP' | 'PREMIUM' | 'REGULAR' | 'BUDGET';
  price: number;
  qualityScore: number;
  viewingAngle: number;    // degrees off-center
  distanceFromScreen: number; // meters
  isBooked: boolean;
}

const ROW_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const SEATS_PER_ROW = 10;

const generateSeats = (): SeatData[] => {
  const seats: SeatData[] = [];
  const bookedSeats = new Set(['B3', 'C7', 'D5', 'E2', 'F8', 'A6', 'G4', 'H1']);

  for (let r = 0; r < ROW_LABELS.length; r++) {
    const row = ROW_LABELS[r];
    const distBase = 4 + r * 2; // A=4m, H=18m

    for (let s = 1; s <= SEATS_PER_ROW; s++) {
      const centerOffset = Math.abs(s - 5.5); // 0..4.5
      const angle = centerOffset * 7; // degrees off center
      
      // Quality scoring
      let quality = 100;
      // Penalize front rows (too close)
      if (r <= 1) quality -= 20;
      // Penalize back rows (too far)
      if (r >= 6) quality -= 15;
      // Penalize side seats
      quality -= centerOffset * 6;
      // Boost sweet spot (rows C-E, seats 3-8)
      if (r >= 2 && r <= 4 && s >= 3 && s <= 8) quality += 10;
      quality = Math.max(20, Math.min(100, Math.round(quality)));

      let category: SeatData['category'];
      if (r >= 2 && r <= 4 && centerOffset <= 2.5) category = 'VIP';
      else if (r >= 1 && r <= 5 && centerOffset <= 3.5) category = 'PREMIUM';
      else if (r <= 1 || r >= 6) category = 'BUDGET';
      else category = 'REGULAR';

      const priceMap = { VIP: 450, PREMIUM: 350, REGULAR: 250, BUDGET: 180 };

      seats.push({
        id: `${row}${s}`,
        row,
        number: s,
        category,
        price: priceMap[category],
        qualityScore: quality,
        viewingAngle: Math.round(angle),
        distanceFromScreen: distBase,
        isBooked: bookedSeats.has(`${row}${s}`),
      });
    }
  }
  return seats;
};

const categoryColors: Record<string, string> = {
  VIP: '#ffd700',
  PREMIUM: '#00f3ff',
  REGULAR: '#8b5cf6',
  BUDGET: '#6b7280',
};

// YouTube Trailer URLs for each movie
const TRAILER_URLS: Record<string, string> = {
  'interstellar': 'https://www.youtube.com/embed/zSWdZVtXT7E?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&modestbranding=1&playlist=zSWdZVtXT7E',
  'spiderman-bnd': 'https://www.youtube.com/embed/8TZMtslA3UY?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&modestbranding=1&playlist=8TZMtslA3UY',
  'kanguva': 'https://www.youtube.com/embed/ajnCMSC4VPo?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&modestbranding=1&playlist=ajnCMSC4VPo',
  'obsession': 'https://www.youtube.com/embed/gMC8kkwbIQQ?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&modestbranding=1&playlist=gMC8kkwbIQQ',
  'backrooms': 'https://www.youtube.com/embed/0HjdiohVOik?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&modestbranding=1&playlist=0HjdiohVOik',
  'michael': 'https://www.youtube.com/embed/3zOLzsbOleM?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&modestbranding=1&playlist=3zOLzsbOleM',
};

// Camera parameters calculator based on seat position
const getCameraParams = (seat: SeatData) => {
  const rowIndex = ROW_LABELS.indexOf(seat.row); // 0=A(front) to 7=H(back)
  const colOffset = seat.number - 5.5; // -4.5 to 4.5
  return {
    perspective: 250 + rowIndex * 70,
    rotateY: colOffset * -3,
    rotateX: 6 - rowIndex * 1.2,
    translateZ: -30 + rowIndex * 8,
    scale: Math.max(0.55, 1.3 - rowIndex * 0.09),
  };
};

// Cinema Theater POV Simulation with live YouTube trailer
const TheaterPOV: React.FC<{ seat: SeatData | null; movieId: string; movieTitle: string }> = ({ seat, movieId, movieTitle }) => {
  const screenContainerRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const cameraState = useRef({ perspective: 500, rotateY: 0, rotateX: 0, translateZ: 0, scale: 1 });

  const trailerUrl = TRAILER_URLS[movieId] || TRAILER_URLS['interstellar'];

  // GSAP camera animation when seat changes — video keeps playing
  useEffect(() => {
    if (!seat || !screenContainerRef.current || !screenRef.current) return;
    const params = getCameraParams(seat);

    gsap.to(cameraState.current, {
      perspective: params.perspective,
      rotateY: params.rotateY,
      rotateX: params.rotateX,
      translateZ: params.translateZ,
      scale: params.scale,
      duration: 1.5,
      ease: 'power3.inOut',
      onUpdate: () => {
        const c = cameraState.current;
        if (screenContainerRef.current) {
          screenContainerRef.current.style.perspective = `${c.perspective}px`;
        }
        if (screenRef.current) {
          screenRef.current.style.transform = `rotateY(${c.rotateY}deg) rotateX(${c.rotateX}deg) translateZ(${c.translateZ}px) scale(${c.scale})`;
        }
      },
    });
  }, [seat]);

  const qualityLabel = seat
    ? (seat.qualityScore >= 85 ? 'EXCEPTIONAL' : seat.qualityScore >= 70 ? 'GREAT' : seat.qualityScore >= 50 ? 'GOOD' : 'ACCEPTABLE')
    : '';

  if (!seat) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center text-gray-500 font-mono">
          <Eye size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg tracking-widest uppercase">Select a seat</p>
          <p className="text-sm mt-2 text-gray-600">to preview your cinema experience</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col gap-4">
      {/* Floating LIVE label */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
        <span className="text-[10px] font-mono tracking-[0.4em] text-red-400 uppercase">Live Cinema POV</span>
        <span className="text-[10px] font-mono text-gray-600 ml-auto">Seat {seat.id} · {seat.category}</span>
      </div>

      {/* Theater Simulation Container */}
      <div className="flex-1 relative rounded-xl overflow-hidden bg-[#060609] border border-white/5 min-h-[350px]">
        {/* Theater Ceiling with emergency lights */}
        <div className="absolute top-0 left-0 w-full h-10 bg-gradient-to-b from-[#0e0e14] to-transparent z-10 pointer-events-none">
          <div className="flex justify-around pt-3">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="w-0.5 h-2 bg-gradient-to-b from-red-600/40 to-transparent rounded-full"></div>
            ))}
          </div>
        </div>

        {/* Theater Side Walls */}
        <div className="absolute inset-0 z-0 pointer-events-none" style={{
          background: 'linear-gradient(90deg, #0a0a10 0%, transparent 12%, transparent 88%, #0a0a10 100%)',
        }}></div>

        {/* Screen Glow on Theater */}
        <div className="absolute inset-0 pointer-events-none z-[1]" style={{
          background: 'radial-gradient(ellipse at 50% 40%, rgba(80,120,220,0.06) 0%, transparent 65%)',
        }}></div>

        {/* 3D Perspective Container */}
        <div
          ref={screenContainerRef}
          className="w-full h-full flex items-center justify-center relative z-[2]"
          style={{ perspective: '500px', perspectiveOrigin: '50% 55%' }}
        >
          <div
            ref={screenRef}
            className="relative"
            style={{
              width: '75%',
              maxWidth: '560px',
              aspectRatio: '16/9',
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Screen Ambient Glow */}
            <div className="absolute -inset-6 bg-blue-400/[0.08] blur-2xl rounded-2xl pointer-events-none"></div>

            {/* YouTube Trailer — persists across seat changes so playback is never interrupted */}
            <iframe
              key={movieId}
              src={trailerUrl}
              className="w-full h-full rounded-sm relative z-10"
              style={{ border: 'none', pointerEvents: 'none' }}
              allow="autoplay; encrypted-media; accelerometer; gyroscope"
              title={`${movieTitle} Trailer`}
            />

            {/* Screen Border Frame */}
            <div className="absolute inset-0 border-2 border-white/5 rounded-sm z-20 pointer-events-none" style={{ boxShadow: 'inset 0 0 30px rgba(0,0,0,0.5)' }}></div>
          </div>
        </div>

        {/* Theater Floor */}
        <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-[#08080e] via-[#08080e]/80 to-transparent z-10 pointer-events-none"></div>

        {/* Seat Position Indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 bg-black/80 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/10">
          <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: categoryColors[seat.category] }}></div>
          <span className="text-xs font-mono text-white tracking-widest font-bold">SEAT {seat.id}</span>
          <span className="text-[10px] font-mono text-gray-500">|</span>
          <span className="text-xs font-mono font-bold" style={{ color: categoryColors[seat.category] }}>{seat.category}</span>
          {seat.qualityScore >= 85 && (
            <>
              <span className="text-[10px] font-mono text-gray-500">|</span>
              <span className="text-[10px] font-mono text-yellow-400 tracking-widest flex items-center gap-1">
                <Trophy size={10} /> BEST VIEW
              </span>
            </>
          )}
        </div>
      </div>

      {/* Metrics Panel */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="glass-panel p-4 border border-white/5 rounded-lg text-center">
          <Star size={16} className="mx-auto mb-2" style={{ color: categoryColors[seat.category] }} />
          <div className="text-2xl font-black text-white">{seat.qualityScore}</div>
          <div className="text-[10px] font-mono text-gray-400 tracking-widest uppercase mt-1">{qualityLabel}</div>
        </div>
        <div className="glass-panel p-4 border border-white/5 rounded-lg text-center">
          <Eye size={16} className="mx-auto mb-2 text-neon-cyan" />
          <div className="text-2xl font-black text-white">{seat.viewingAngle}°</div>
          <div className="text-[10px] font-mono text-gray-400 tracking-widest uppercase mt-1">VIEW ANGLE</div>
        </div>
        <div className="glass-panel p-4 border border-white/5 rounded-lg text-center">
          <Ruler size={16} className="mx-auto mb-2 text-neon-purple" />
          <div className="text-2xl font-black text-white">{seat.distanceFromScreen}m</div>
          <div className="text-[10px] font-mono text-gray-400 tracking-widest uppercase mt-1">DISTANCE</div>
        </div>
        <div className="glass-panel p-4 border border-white/5 rounded-lg text-center">
          <Trophy size={16} className="mx-auto mb-2" style={{ color: categoryColors[seat.category] }} />
          <div className="text-lg font-black" style={{ color: categoryColors[seat.category] }}>{seat.category}</div>
          <div className="text-[10px] font-mono text-gray-400 tracking-widest uppercase mt-1">ZONE</div>
        </div>
      </div>
    </div>
  );
};

// Main Page
const SeatSelectionPage: React.FC = () => {
  const { movieId } = useParams<{ movieId: string }>();
  const navigate = useNavigate();
  const addBooking = useStore(state => state.addBooking);

  const movie = MOVIES.find(m => m.id === movieId);
  const seats = useMemo(() => generateSeats(), []);
  const [selectedSeatIds, setSelectedSeatIds] = useState<Set<string>>(new Set());
  const [previewSeat, setPreviewSeat] = useState<SeatData | null>(null);

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center pointer-events-auto">
        <div className="text-center">
          <h2 className="text-2xl font-mono text-neon-cyan mb-4">404: Signal Lost</h2>
          <button onClick={() => navigate('/')} className="px-6 py-3 border border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black transition-colors uppercase tracking-widest text-sm">
            Return Home
          </button>
        </div>
      </div>
    );
  }

  const toggleSeat = (seat: SeatData) => {
    if (seat.isBooked) return;
    const next = new Set(selectedSeatIds);
    if (next.has(seat.id)) {
      next.delete(seat.id);
    } else {
      next.add(seat.id);
    }
    setSelectedSeatIds(next);
    setPreviewSeat(seat); // Always update preview to last clicked
  };

  const selectedSeatsData = seats.filter(s => selectedSeatIds.has(s.id));
  const totalPrice = selectedSeatsData.reduce((sum, s) => sum + s.price, 0);

  const handleConfirmBooking = () => {
    if (selectedSeatsData.length === 0) return;

    const bookingId = `BK-${Date.now()}`;
    const booking: Booking = {
      id: bookingId,
      movieId: movie.id,
      seats: selectedSeatsData.map(s => s.id),
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      time: '7:30 PM',
      status: 'upcoming' as const,
      paymentStatus: 'pending',
      totalAmount: totalPrice + 50, // Including hypothetical convenience fee
    };

    addBooking(booking);
    // Redirect to payment page
    navigate(`/payment/${bookingId}`);
  };

  return (
    <div className="w-full min-h-screen relative pointer-events-auto bg-black">
      <div className="fixed inset-0 bg-gradient-to-br from-black/90 via-black/70 to-black pointer-events-none -z-10"></div>

      {/* Top Nav */}
      <div className="sticky top-0 w-full px-6 py-4 z-50 flex justify-between items-center bg-black/70 backdrop-blur-md border-b border-white/5">
        <button 
          onClick={() => navigate(`/movie/${movie.id}`)}
          className="flex items-center gap-2 text-neon-cyan hover:text-white transition-colors uppercase tracking-[0.2em] text-sm glass-panel-neon px-5 py-2.5"
        >
          <ChevronLeft size={18} />
          <span>Back</span>
        </button>
        
        <div className="text-center">
          <div className="text-sm font-black tracking-[0.2em] uppercase text-white">{movie.title}</div>
          <div className="text-[10px] font-mono text-gray-500 tracking-widest">SEAT SELECTION</div>
        </div>

        <div className="text-xl font-black tracking-[0.2em] text-glow-cyan text-white select-none">
          VOID <span className="text-neon-cyan">CINEMA</span>
        </div>
      </div>

      {/* Main Content: Split Layout */}
      <div className="w-full max-w-[1600px] mx-auto px-6 py-8 grid grid-cols-1 xl:grid-cols-12 gap-8" style={{ minHeight: 'calc(100vh - 70px)' }}>
        
        {/* Left: Seat Map (40%) */}
        <div className="xl:col-span-5 flex flex-col gap-6">
          
          {/* Screen Indicator */}
          <div className="text-center">
            <div className="w-3/4 mx-auto h-1.5 rounded-full bg-gradient-to-r from-transparent via-neon-cyan to-transparent mb-2"></div>
            <p className="text-[10px] font-mono text-gray-500 tracking-[0.4em] uppercase">Screen</p>
          </div>

          {/* Seat Grid */}
          <div className="flex flex-col items-center gap-2 py-4">
            {ROW_LABELS.map(row => {
              const rowSeats = seats.filter(s => s.row === row);
              return (
                <div key={row} className="flex items-center gap-1">
                  <span className="w-6 text-right text-xs font-mono text-gray-500 mr-2">{row}</span>
                  {rowSeats.map(seat => {
                    const isSelected = selectedSeatIds.has(seat.id);
                    const isPreviewing = previewSeat?.id === seat.id;
                    return (
                      <button
                        key={seat.id}
                        data-seat-id={seat.id}
                        disabled={seat.isBooked}
                        onClick={() => toggleSeat(seat)}
                        className={`w-8 h-8 md:w-9 md:h-9 rounded-t-lg text-[9px] font-mono font-bold transition-all duration-200 border relative
                          ${seat.isBooked 
                            ? 'bg-gray-800 border-gray-700 text-gray-600 cursor-not-allowed opacity-40'
                            : isSelected
                              ? 'border-white text-black scale-110 shadow-lg'
                              : isPreviewing
                                ? 'border-white/60 scale-105'
                                : 'border-white/10 text-gray-400 hover:border-white/40 hover:scale-105'
                          }
                        `}
                        style={{
                          backgroundColor: seat.isBooked 
                            ? undefined 
                            : isSelected 
                              ? categoryColors[seat.category] 
                              : `${categoryColors[seat.category]}20`,
                        }}
                        title={`${seat.id} - ${seat.category} - ₹${seat.price}`}
                      >
                        {seat.number}
                      </button>
                    );
                  })}
                  <span className="w-6 text-left text-xs font-mono text-gray-500 ml-2">{row}</span>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-4 text-[10px] font-mono tracking-widest">
            {Object.entries(categoryColors).map(([cat, col]) => (
              <div key={cat} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-t-md border border-white/20" style={{ backgroundColor: `${col}40` }}></div>
                <span className="text-gray-400">{cat}</span>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-t-md bg-gray-800 border border-gray-700 opacity-40"></div>
              <span className="text-gray-400">BOOKED</span>
            </div>
          </div>

          {/* Selection Summary */}
          {selectedSeatsData.length > 0 && (
            <div className="glass-panel-neon p-6 border border-white/10 rounded-xl mt-2">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-mono tracking-[0.2em] text-neon-cyan uppercase">Selected</h3>
                <button 
                  onClick={() => { setSelectedSeatIds(new Set()); setPreviewSeat(null); }}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-white transition-colors"
                >
                  <RotateCcw size={12} /> Clear
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedSeatsData.map(s => (
                  <span key={s.id} className="px-3 py-1 text-xs font-mono font-bold rounded-full border" 
                    style={{ borderColor: categoryColors[s.category], color: categoryColors[s.category], backgroundColor: `${categoryColors[s.category]}15` }}>
                    {s.id} · ₹{s.price}
                  </span>
                ))}
              </div>
              <div className="flex justify-between items-center border-t border-white/10 pt-4">
                <span className="text-sm font-mono text-gray-400">{selectedSeatsData.length} seat{selectedSeatsData.length > 1 ? 's' : ''}</span>
                <span className="text-xl font-black text-white">₹{totalPrice}</span>
              </div>

              <button 
                onClick={handleConfirmBooking}
                className="w-full mt-6 px-8 py-4 bg-neon-cyan/10 border-2 border-neon-cyan hover:bg-neon-cyan text-white hover:text-black transition-all duration-300 uppercase tracking-[0.3em] text-sm font-black rounded-sm"
              >
                Confirm Booking
              </button>
            </div>
          )}
        </div>

        {/* Right: Live Cinema POV (60%) */}
        <div className="xl:col-span-7 flex flex-col">
          <div className="flex-1 min-h-[400px]">
            <TheaterPOV seat={previewSeat} movieId={movie.id} movieTitle={movie.title} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelectionPage;
