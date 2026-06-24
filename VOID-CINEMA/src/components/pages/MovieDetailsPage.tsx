import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore, MOVIES } from '../../store/useStore';
import { ChevronLeft } from 'lucide-react';

const getMovieColor = (index: number) => {
  if (index === 0) return '#00f3ff'; 
  if (index === 1) return '#ff0055'; 
  if (index === 2) return '#ff9900'; 
  return '#bf00ff';
};

const MovieDetailsPage: React.FC = () => {
  const { movieId } = useParams<{ movieId: string }>();
  const navigate = useNavigate();
  const setSelectedMovie = useStore(state => state.setSelectedMovie);

  const movie = MOVIES.find(m => m.id === movieId);
  const movieIndex = movie ? MOVIES.findIndex(m => m.id === movie.id) : 0;
  const color = getMovieColor(movieIndex);

  useEffect(() => {
    // When visiting this route, ensure the global state knows what movie we are looking at 
    // so the 3D background can react appropriately (if we keep the 3D background).
    if (movie) {
      setSelectedMovie(movie);
    }
    // Scroll to top when landing on this page
    window.scrollTo(0, 0);
  }, [movie, setSelectedMovie]);

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center pointer-events-auto">
        <div className="text-center">
          <h2 className="text-2xl font-mono text-neon-cyan mb-4">404: Signal Lost</h2>
          <p className="text-gray-400 mb-8">The requested cinematic file could not be located in the archive.</p>
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-3 border border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black transition-colors uppercase tracking-widest text-sm"
          >
            Return to Constellation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen relative pointer-events-auto bg-black overflow-x-hidden pb-32">
      {/* Background Gradient to separate from 3D canvas */}
      <div className="fixed inset-0 bg-gradient-to-br from-black/90 via-black/70 to-black pointer-events-none -z-10"></div>
      
      {/* Top Navigation Bar */}
      <div className="sticky top-0 w-full p-6 z-50 flex justify-between items-center bg-black/50 backdrop-blur-md border-b border-white/5">
        <button 
          onClick={() => {
            setSelectedMovie(null);
            navigate('/');
          }}
          className="flex items-center gap-2 text-neon-cyan hover:text-white transition-colors uppercase tracking-[0.2em] text-sm glass-panel-neon px-6 py-3"
        >
          <ChevronLeft size={20} />
          <span>Back to Constellation</span>
        </button>
        
        <div className="text-xl font-black tracking-[0.2em] text-glow-cyan text-white cursor-pointer select-none">
          VOID <span className="text-neon-cyan">CINEMA</span>
        </div>
      </div>

      {/* Hero Banner / Poster Section */}
      <div className="w-full max-w-7xl mx-auto mt-12 px-8 grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* Left Side: Poster */}
        <div className="lg:col-span-5 relative group">
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 rounded-xl pointer-events-none"></div>
          <div className="absolute -inset-1 rounded-xl opacity-20 blur-xl group-hover:opacity-50 transition-opacity duration-1000" style={{ backgroundColor: color }}></div>
          <img 
            src={movie.posterUrl} 
            alt={movie.title} 
            className="w-full h-auto object-cover rounded-xl border border-white/10 shadow-2xl relative z-0"
          />
        </div>

        {/* Right Side: Metadata Panel */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          
          {/* Header Section */}
          <div className="relative pl-6 border-l-2 shrink-0 mb-12" style={{ borderColor: color }}>
            <div className="absolute top-0 left-0 w-12 h-[1px]" style={{ backgroundColor: color }}></div>
            <div className="absolute bottom-0 left-0 w-12 h-[1px]" style={{ backgroundColor: color }}></div>
            <h1 className="text-5xl md:text-7xl font-black tracking-[0.2em] uppercase leading-tight text-white drop-shadow-2xl mb-4" style={{ textShadow: `0 0 30px ${color}80` }}>
              {movie.title}
            </h1>
            
            <div className="flex items-center flex-wrap gap-4 text-sm font-mono tracking-widest text-gray-300">
              <span className="bg-white/10 px-3 py-1 rounded-sm border border-white/20">{movie.rating}</span>
              <span>{movie.releaseYear}</span>
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }}></div>
              <span>{movie.duration}</span>
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }}></div>
              <span className="uppercase text-white/80 font-bold" style={{ color }}>{movie.genre.join(' / ')}</span>
            </div>
          </div>

          {/* Holographic Body */}
          <div className="relative p-10 glass-panel-neon backdrop-blur-2xl bg-black/60 overflow-hidden group border border-white/10 rounded-xl">
            {/* Decorative scanning line */}
            <div className="absolute top-0 left-0 w-full h-[200%] bg-gradient-to-b from-transparent via-white/5 to-transparent translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-[3s] ease-linear infinite pointer-events-none"></div>
            
            <h3 className="text-neon-cyan text-sm font-mono tracking-[0.3em] uppercase mb-4">Synopsis</h3>
            <p className="text-base text-gray-300 leading-relaxed tracking-wide font-sans mb-10">
              {movie.description}
            </p>

            <h3 className="text-neon-cyan text-sm font-mono tracking-[0.3em] uppercase mb-4">Cast</h3>
            <div className="flex flex-wrap gap-3 mb-12">
              {movie.cast.map(actor => (
                <span key={actor} className="px-4 py-2 bg-white/5 border border-white/10 text-sm font-mono text-gray-300 rounded-full hover:bg-white/10 transition-colors cursor-default">
                  {actor}
                </span>
              ))}
            </div>

            {/* Data Bars */}
            <div className="flex flex-col gap-3 mb-12">
              <div className="flex justify-between items-center text-xs font-mono text-gray-400 tracking-widest">
                <span>IMMERSION INDEX</span>
                <span className="text-white">98.7%</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-1000" style={{ width: '98%', backgroundColor: color, boxShadow: `0 0 15px ${color}` }}></div>
              </div>
            </div>

            {/* Action Button */}
            <button 
              className="w-full relative overflow-hidden group/btn px-8 py-5 bg-neon-cyan/10 border-2 border-neon-cyan hover:bg-neon-cyan transition-all duration-500 rounded-sm"
              onClick={() => navigate(`/theatres/${movie.id}`)}
            >
              <div className="relative flex items-center justify-center gap-4 z-10">
                <span className="text-base font-black tracking-[0.3em] uppercase text-white group-hover/btn:text-black drop-shadow-md transition-colors">
                  BOOK TICKETS
                </span>
              </div>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MovieDetailsPage;
