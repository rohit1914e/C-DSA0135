import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SystemWrapper from './SystemWrapper';
import { useStore, MOVIES } from '../../store/useStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Search, Play, Lock } from 'lucide-react';

// Stagger animation variants
const gridVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

const MoviesSystem: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const navigate = useNavigate();
  const { session } = useAuthStore();

  const setSelectedMovie = useStore(state => state.setSelectedMovie);

  // Extract all unique genres
  const allGenres = Array.from(new Set(MOVIES.flatMap(m => m.genre)));

  // Linear Search Algorithm O(n) Time Complexity
  const filteredMovies = [];
  for (let i = 0; i < MOVIES.length; i++) {
    const movie = MOVIES[i];
    const matchesSearch = movie.matchesSearch(searchQuery);
    const matchesGenre = selectedGenre ? movie.genre.includes(selectedGenre) : true;
    
    if (matchesSearch && matchesGenre) {
      filteredMovies.push(movie);
    }
  }

  const handleBookNow = (movie: typeof MOVIES[0]) => {
    if (!session) {
      navigate('/auth', { state: { from: { pathname: `/movie/${movie.id}` } } });
      return;
    }

    setSelectedMovie(movie);
    navigate(`/movie/${movie.id}`);
  };

  return (
    <SystemWrapper title="Movies">
      <div className="w-full h-full flex flex-col gap-8 max-w-7xl mx-auto pb-20">

        {/* Top Bar: Search & Filter */}
        <motion.div
          className="flex justify-between items-end gap-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Search */}
          <div className="flex-1 relative max-w-md group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50"
              size={20}
              style={{
                color: '#00f3ff',
                transition: 'opacity var(--duration-normal) var(--ease-premium)',
              }}
            />
            <input
              type="text"
              placeholder="Search cinematic universe..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/50 border rounded-none py-3 pl-12 pr-4 text-white focus:outline-none font-mono tracking-wider glass-panel-neon placeholder-gray-600"
              style={{
                borderColor: 'rgba(0, 243, 255, 0.2)',
                transition: 'border-color var(--duration-normal) var(--ease-premium), box-shadow var(--duration-normal) var(--ease-premium)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'rgba(0, 243, 255, 0.5)';
                e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 243, 255, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(0, 243, 255, 0.2)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Genres */}
          <div className="flex gap-3 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedGenre(null)}
              className={`px-4 py-2 text-xs font-mono tracking-widest uppercase border whitespace-nowrap gpu-accelerated ${
                selectedGenre === null
                  ? 'border-neon-purple bg-neon-purple/20 text-white'
                  : 'border-white/10 text-gray-400'
              }`}
              style={{
                transition: 'all var(--duration-normal) var(--ease-premium)',
              }}
              onMouseEnter={(e) => {
                if (selectedGenre !== null) {
                  e.currentTarget.style.borderColor = 'rgba(191, 0, 255, 0.5)';
                  e.currentTarget.style.color = '#fff';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedGenre !== null) {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.color = 'rgb(156, 163, 175)';
                }
              }}
            >
              All
            </button>
            {allGenres.map(genre => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-4 py-2 text-xs font-mono tracking-widest uppercase border whitespace-nowrap gpu-accelerated ${
                  selectedGenre === genre
                    ? 'border-neon-cyan bg-neon-cyan/20 text-white'
                    : 'border-white/10 text-gray-400'
                }`}
                style={{
                  transition: 'all var(--duration-normal) var(--ease-premium)',
                }}
                onMouseEnter={(e) => {
                  if (selectedGenre !== genre) {
                    e.currentTarget.style.borderColor = 'rgba(0, 243, 255, 0.5)';
                    e.currentTarget.style.color = '#fff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedGenre !== genre) {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.color = 'rgb(156, 163, 175)';
                  }
                }}
              >
                {genre}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Movies Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 overflow-y-auto pr-4 custom-scrollbar"
          variants={gridVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {filteredMovies.map(movie => (
            <motion.div
              key={movie.id}
              variants={cardVariants}
              className="group relative glass-panel border overflow-hidden flex flex-col cursor-pointer gpu-accelerated"
              onClick={() => handleBookNow(movie)}
              style={{
                borderColor: 'rgba(255, 255, 255, 0.05)',
                transition: 'transform 500ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 500ms cubic-bezier(0.22, 1, 0.36, 1), border-color 500ms cubic-bezier(0.22, 1, 0.36, 1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px) scale(1.03)';
                e.currentTarget.style.boxShadow = '0 20px 60px rgba(0, 243, 255, 0.12), 0 0 30px rgba(0, 243, 255, 0.06)';
                e.currentTarget.style.borderColor = 'rgba(0, 243, 255, 0.3)';
                e.currentTarget.style.zIndex = '10';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.zIndex = '1';
              }}
            >
              {/* Poster Image */}
              <div className="relative aspect-[2/3] overflow-hidden">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent z-10"
                  style={{ transition: 'background-color 500ms cubic-bezier(0.22, 1, 0.36, 1)' }}
                />
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-full h-full object-cover gpu-accelerated"
                  style={{
                    transition: 'transform 700ms cubic-bezier(0.22, 1, 0.36, 1), filter 700ms cubic-bezier(0.22, 1, 0.36, 1)',
                    transform: 'scale(1)',
                    filter: 'brightness(0.9)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.08)';
                    e.currentTarget.style.filter = 'brightness(1.1)';
                  }}
                  // Reset handled by parent card's onMouseLeave
                />

                {/* Hover Play/Book Overlay */}
                <div
                  className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100"
                  style={{
                    background: 'rgba(0, 0, 0, 0.4)',
                    backdropFilter: 'blur(4px)',
                    transition: 'opacity 400ms cubic-bezier(0.22, 1, 0.36, 1)',
                  }}
                >
                  <button
                    className="flex items-center gap-3 bg-neon-cyan/20 border border-neon-cyan px-6 py-3 text-white uppercase tracking-widest text-sm font-bold gpu-accelerated"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBookNow(movie);
                    }}
                    style={{
                      transform: 'translateY(12px)',
                      transition: 'all 400ms cubic-bezier(0.22, 1, 0.36, 1)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#00f3ff';
                      e.currentTarget.style.color = '#000';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(0, 243, 255, 0.2)';
                      e.currentTarget.style.color = '#fff';
                    }}
                  >
                    {!session ? <Lock size={18} /> : <Play size={18} fill="currentColor" />}
                    {!session ? 'Login to Book' : 'Book Now'}
                  </button>
                </div>
              </div>

              {/* Movie Info */}
              <div className="p-5 flex-1 flex flex-col gap-3">
                <h3
                  className="text-xl font-bold uppercase tracking-wider text-white line-clamp-1"
                  style={{ transition: 'color 400ms cubic-bezier(0.22, 1, 0.36, 1)' }}
                >
                  {movie.title}
                </h3>

                <div className="flex items-center gap-3 text-xs font-mono text-gray-400">
                  <span className="border border-white/20 px-1">{movie.rating}</span>
                  <span>{movie.duration}</span>
                </div>

                <p className="text-sm text-gray-400 line-clamp-2 mt-2 font-sans leading-relaxed">
                  {movie.description}
                </p>

                <div className="mt-auto pt-4 flex flex-wrap gap-2">
                  {movie.genre.map(g => (
                    <span key={g} className="text-[10px] uppercase font-mono tracking-wider text-neon-purple bg-neon-purple/10 px-2 py-1">
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}

          {filteredMovies.length === 0 && (
            <div className="col-span-full py-20 text-center text-gray-500 font-mono">
              NO SIGNATURES FOUND MATCHING QUERY.
            </div>
          )}
        </motion.div>
      </div>
    </SystemWrapper>
  );
};

export default MoviesSystem;
