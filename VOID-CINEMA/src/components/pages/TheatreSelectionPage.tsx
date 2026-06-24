import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore, MOVIES } from '../../store/useStore';
import { THEATRES } from '../../data/theatres';
import { getShowtimesForTheatre } from '../../data/showtimes';
import { ChevronLeft, Star, MonitorPlay, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const generateDates = () => {
  const dates = [];
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push({
      id: d.toISOString().split('T')[0],
      dayName: i === 0 ? 'TODAY' : i === 1 ? 'TOMORROW' : d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
      dateLabel: d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }).toUpperCase(),
    });
  }
  return dates;
};

const premiumEase = [0.22, 1, 0.36, 1] as const;

const TheatreSelectionPage: React.FC = () => {
  const { movieId } = useParams<{ movieId: string }>();
  const navigate = useNavigate();
  
  const movie = MOVIES.find(m => m.id === movieId);
  const setSelectedMovie = useStore(state => state.setSelectedMovie);
  const setSelectedTheatre = useStore(state => state.setSelectedTheatre);
  const setSelectedDate = useStore(state => state.setSelectedDate);
  const setSelectedTime = useStore(state => state.setSelectedTime);
  
  const dates = useMemo(() => generateDates(), []);
  const [activeDate, setActiveDate] = useState(dates[0].id);

  useEffect(() => {
    if (movie) {
      setSelectedMovie(movie);
    }
    window.scrollTo(0, 0);
  }, [movie, setSelectedMovie]);

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h2 className="text-neon-cyan font-mono text-xl tracking-widest">MOVIE NOT FOUND</h2>
      </div>
    );
  }

  const handleShowtimeSelect = (theatre: typeof THEATRES[0], time: string) => {
    setSelectedTheatre({ id: theatre.id, name: theatre.name });
    setSelectedDate(activeDate);
    setSelectedTime(time);
    navigate(`/booking/${movie.id}`);
  };

  return (
    <div className="w-full min-h-screen bg-black pt-24 pb-32 px-4 md:px-8 pointer-events-auto overflow-x-hidden">
      <div className="fixed inset-0 bg-gradient-to-br from-black/90 via-black/80 to-black pointer-events-none -z-10" />
      
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-12">
        <button 
          onClick={() => navigate(`/movie/${movie.id}`)}
          className="flex items-center gap-2 text-neon-cyan hover:text-white transition-colors uppercase tracking-[0.2em] text-xs font-mono mb-8"
        >
          <ChevronLeft size={16} />
          <span>BACK TO {movie.title}</span>
        </button>
        
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-[0.2em] text-white mb-2">
          SELECT THEATRE
        </h1>
        <p className="text-gray-400 font-mono tracking-widest text-sm">
          {movie.title} • {movie.duration} • {movie.rating}
        </p>
      </div>

      {/* Date Selector */}
      <div className="max-w-5xl mx-auto mb-16">
        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x">
          {dates.map((d) => {
            const isActive = activeDate === d.id;
            return (
              <motion.button
                key={d.id}
                onClick={() => setActiveDate(d.id)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`snap-start shrink-0 flex flex-col items-center justify-center min-w-[120px] h-[90px] rounded-sm border transition-all duration-300 ${
                  isActive 
                    ? 'bg-neon-cyan/20 border-neon-cyan shadow-[0_0_20px_rgba(0,243,255,0.3)]' 
                    : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10'
                }`}
              >
                <span className={`text-xs font-mono tracking-widest mb-2 ${isActive ? 'text-neon-cyan' : 'text-gray-400'}`}>
                  {d.dayName}
                </span>
                <span className={`text-lg font-black tracking-wider ${isActive ? 'text-white' : 'text-gray-300'}`}>
                  {d.dateLabel}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Theatre List */}
      <div className="max-w-5xl mx-auto space-y-6">
        {THEATRES.map((theatre, i) => {
          const showtimes = getShowtimesForTheatre(theatre.id, activeDate);
          return (
            <motion.div
              key={theatre.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: premiumEase }}
              whileHover={{ 
                scale: 1.03, 
                boxShadow: '0 0 30px rgba(0, 243, 255, 0.15)',
                borderColor: 'rgba(0, 243, 255, 0.4)'
              }}
              className="glass-panel-neon p-6 md:p-8 border border-white/10 bg-black/60 rounded-lg group transition-all duration-500"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                  <h2 className="text-xl md:text-2xl font-black uppercase text-white tracking-widest mb-2">
                    {theatre.name}
                  </h2>
                  <div className="flex items-center gap-4 text-xs font-mono tracking-widest text-gray-400 mb-4">
                    <span>{theatre.location}</span>
                    <span className="flex items-center gap-1 text-neon-cyan">
                      <Star size={14} fill="currentColor" /> {theatre.rating}
                    </span>
                  </div>
                  
                  {/* Features */}
                  <div className="flex flex-wrap gap-2">
                    {theatre.features.map(f => (
                      <span key={f} className="px-2 py-1 bg-white/5 border border-white/10 rounded-sm text-[10px] text-gray-300 uppercase tracking-widest flex items-center gap-1">
                        <Check size={10} className="text-neon-cyan" /> {f}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-[10px] font-mono text-gray-400 tracking-widest mb-1 uppercase">Available Seats</div>
                  <div className="text-xl font-bold text-green-400">{Math.floor(Math.random() * 50) + 120}</div>
                </div>
              </div>

              {/* Showtimes */}
              <div className="border-t border-white/10 pt-6">
                <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-gray-400 mb-4">
                  <MonitorPlay size={14} className="text-neon-purple" />
                  <span>SELECT SHOWTIME</span>
                </div>
                <div className="flex flex-wrap gap-4">
                  {showtimes.map(time => (
                    <motion.button
                      key={time}
                      onClick={() => handleShowtimeSelect(theatre, time)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-3 border border-white/20 bg-white/5 text-white font-mono text-sm tracking-widest hover:border-neon-cyan hover:bg-neon-cyan/10 hover:text-neon-cyan transition-all duration-300"
                    >
                      {time}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default TheatreSelectionPage;
