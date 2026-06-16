import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SystemWrapper from './SystemWrapper';
import { useStore, MOVIES } from '../../store/useStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Search, Play, Lock } from 'lucide-react';

const MoviesSystem: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const navigate = useNavigate();
  const { session } = useAuthStore();
  
  const setSelectedMovie = useStore(state => state.setSelectedMovie);

  // Extract all unique genres
  const allGenres = Array.from(new Set(MOVIES.flatMap(m => m.genre)));

  // Filter movies
  const filteredMovies = MOVIES.filter(movie => {
    const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre ? movie.genre.includes(selectedGenre) : true;
    return matchesSearch && matchesGenre;
  });

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
        <div className="flex justify-between items-end gap-8">
          {/* Search */}
          <div className="flex-1 relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neon-cyan opacity-50" size={20} />
            <input 
              type="text" 
              placeholder="Search cinematic universe..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/50 border border-neon-cyan/30 rounded-none py-3 pl-12 pr-4 text-white focus:outline-none focus:border-neon-cyan transition-colors font-mono tracking-wider glass-panel-neon placeholder-gray-600"
            />
          </div>

          {/* Genres */}
          <div className="flex gap-3 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedGenre(null)}
              className={`px-4 py-2 text-xs font-mono tracking-widest uppercase transition-all duration-300 border ${
                selectedGenre === null 
                  ? 'border-neon-purple bg-neon-purple/20 text-white' 
                  : 'border-white/10 hover:border-neon-purple/50 text-gray-400 hover:text-white'
              }`}
            >
              All
            </button>
            {allGenres.map(genre => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-4 py-2 text-xs font-mono tracking-widest uppercase transition-all duration-300 border whitespace-nowrap ${
                  selectedGenre === genre 
                    ? 'border-neon-cyan bg-neon-cyan/20 text-white' 
                    : 'border-white/10 hover:border-neon-cyan/50 text-gray-400 hover:text-white'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {/* Movies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 overflow-y-auto pr-4 custom-scrollbar">
          {filteredMovies.map(movie => (
            <div key={movie.id} className="group relative glass-panel border border-white/5 hover:border-neon-cyan/50 transition-colors duration-500 overflow-hidden flex flex-col cursor-pointer"
                 onClick={() => handleBookNow(movie)}>
              
              {/* Poster Image */}
              <div className="relative aspect-[2/3] overflow-hidden">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10"></div>
                <img 
                  src={movie.posterUrl} 
                  alt={movie.title}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out" 
                />
                
                {/* Hover Play/Book Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 bg-black/40 backdrop-blur-sm">
                  <button 
                    className="flex items-center gap-3 bg-neon-cyan/20 border border-neon-cyan px-6 py-3 text-white uppercase tracking-widest text-sm font-bold hover:bg-neon-cyan hover:text-black transition-all duration-300 transform translate-y-4 group-hover:translate-y-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBookNow(movie);
                    }}
                  >
                    {!session ? <Lock size={18} /> : <Play size={18} fill="currentColor" />}
                    {!session ? 'Login to Book' : 'Book Now'}
                  </button>
                </div>
              </div>

              {/* Movie Info */}
              <div className="p-5 flex-1 flex flex-col gap-3">
                <h3 className="text-xl font-bold uppercase tracking-wider text-white group-hover:text-neon-cyan transition-colors line-clamp-1">{movie.title}</h3>
                
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
            </div>
          ))}

          {filteredMovies.length === 0 && (
            <div className="col-span-full py-20 text-center text-gray-500 font-mono">
              NO SIGNATURES FOUND MATCHING QUERY.
            </div>
          )}
        </div>
      </div>
    </SystemWrapper>
  );
};

export default MoviesSystem;
