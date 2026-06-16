import { create } from 'zustand';

export type Sector = 'explore' | 'movies' | 'tickets' | 'history' | 'profile' | 'theater';

export interface Movie {
  id: string;
  title: string;
  posterUrl?: string;
  duration: string;
  rating: string;
  genre: string[];
  description: string;
  cast: string[];
  releaseYear: string;
}

export interface Seat {
  id: string;
  row: string;
  number: number;
  position: [number, number, number];
  distanceToScreen: number;
  viewingAngle: number;
  qualityScore: number; // 0-100
  ratingCategory: 'BEST VIEW' | 'PREMIUM' | 'GOOD' | 'BUDGET';
  color: string;
  status: 'available' | 'booked' | 'selected';
}

export interface Booking {
  id: string;
  movieId: string;
  seats: string[];
  date: string;
  time: string;
  status: 'upcoming' | 'past';
  paymentStatus: 'pending' | 'paid';
  totalAmount: number;
}

export interface UserProfile {
  name: string;
  avatar: string;
  memberSince: string;
}

export interface ActivityLog {
  id: string;
  type: 'COMPARE' | 'BOOK' | 'EXPLORE' | 'RECOMMEND';
  title: string;
  timestamp: string;
}

export interface UserStats {
  totalSeatsCompared: number;
  totalTheaterExplorations: number;
  sumQualityScore: number; // to calculate average
  totalQualityScoresRecorded: number;
  zonePreferences: Record<string, number>; // e.g., {'PREMIUM': 2}
}

interface CinemaState {
  // Navigation State
  activeSector: Sector;
  setActiveSector: (sector: Sector) => void;
  isEnteringTheater: boolean;
  setIsEnteringTheater: (isEntering: boolean) => void;
  
  // Movie State
  selectedMovie: Movie | null;
  setSelectedMovie: (movie: Movie | null) => void;
  
  // Seat POV State
  activePOVSeat: Seat | null;
  setActivePOVSeat: (seat: Seat | null) => void;
  
  // Comparison Mode State
  isComparing: boolean;
  setIsComparing: (isComparing: boolean) => void;
  recommendedSeat: Seat | null;
  setRecommendedSeat: (seat: Seat | null) => void;
  
  // Seat & Booking State
  selectedSeats: Seat[];
  toggleSeatSelection: (seat: Seat) => void;
  clearSelectedSeats: () => void;
  
  // History
  bookingHistory: Booking[];
  addBooking: (booking: Booking) => void;
  updateBookingPaymentStatus: (bookingId: string, status: 'pending' | 'paid') => void;
  
  // Profile & Stats
  userProfile: UserProfile;
  stats: UserStats;
  activityTimeline: ActivityLog[];
  logActivity: (activity: Omit<ActivityLog, 'id' | 'timestamp'>) => void;
  incrementSeatsCompared: (count: number) => void;
  incrementTheaterExplorations: () => void;
  recordSeatQuality: (score: number, category: string) => void;
}

const MOVIES: Movie[] = [
  {
    id: 'interstellar',
    title: 'Interstellar',
    posterUrl: '/src/assets/posters/interstellar.png',
    duration: '2h 49m',
    rating: 'PG-13',
    genre: ['Sci-Fi', 'Adventure', 'Drama'],
    description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival as Earth\'s resources are depleted.',
    cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain', 'Michael Caine'],
    releaseYear: '2014',
  },
  {
    id: 'spiderman-bnd',
    title: 'Spider-Man: Brand New Day',
    posterUrl: '/src/assets/posters/spiderman.png',
    duration: '2h 15m',
    rating: 'PG-13',
    genre: ['Action', 'Superhero', 'Adventure'],
    description: 'Peter Parker faces his greatest challenge yet as a new villain emerges, forcing him to redefine what it means to be a hero in a brand new day.',
    cast: ['Tom Holland', 'Zendaya', 'Jacob Batalon', 'Marisa Tomei'],
    releaseYear: '2026',
  },
  {
    id: 'kanguva',
    title: 'Kanguva',
    posterUrl: '/src/assets/posters/kanguva.png',
    duration: '2h 34m',
    rating: 'R',
    genre: ['Action', 'Fantasy', 'Historical'],
    description: 'An ancient warrior\'s epic saga of valor and vengeance spans across generations, intertwining a dark past with a modern-day conflict.',
    cast: ['Suriya', 'Bobby Deol', 'Disha Patani'],
    releaseYear: '2024',
  },
  {
    id: 'obsession',
    title: 'Obsession',
    posterUrl: '/src/assets/posters/obsession.png',
    duration: '1h 58m',
    rating: 'R',
    genre: ['Thriller', 'Psychological', 'Mystery'],
    description: 'A psychological descent into madness as a man\'s fixation on a small object leads him down a dark, unescapable path.',
    cast: ['Jake Gyllenhaal', 'Anya Taylor-Joy', 'Willem Dafoe'],
    releaseYear: '2025',
  },
  {
    id: 'backrooms',
    title: 'Backrooms',
    posterUrl: '/src/assets/posters/backrooms.png',
    duration: '1h 52m',
    rating: 'R',
    genre: ['Horror', 'Mystery', 'Psychological'],
    description: 'A group of strangers become trapped inside an endless maze of yellow corridors where reality slowly breaks apart. Every turn leads deeper into an impossible world hiding something that should never be found.',
    cast: ['TBA'],
    releaseYear: '2026',
  },
  {
    id: 'michael',
    title: 'Michael',
    posterUrl: '/src/assets/posters/michael.png',
    duration: '2h 25m',
    rating: 'PG-13',
    genre: ['Biography', 'Music', 'Drama'],
    description: 'The story of Michael Jackson\'s rise to global superstardom, exploring his music, performances, creativity, and the challenges behind the world\'s most famous entertainer.',
    cast: ['Jaafar Jackson'],
    releaseYear: '2026',
  }
];

export const useStore = create<CinemaState>((set, get) => ({
  // Initial State
  activeSector: 'explore',
  isEnteringTheater: false,
  selectedMovie: null,
  activePOVSeat: null,
  isComparing: false,
  recommendedSeat: null,
  selectedSeats: [],
  bookingHistory: [],

  userProfile: {
    name: 'U1',
    avatar: '',
    memberSince: '2026',
  },
  stats: {
    totalSeatsCompared: 0,
    totalTheaterExplorations: 0,
    sumQualityScore: 0,
    totalQualityScoresRecorded: 0,
    zonePreferences: {},
  },
  activityTimeline: [],

  // Actions
  setActiveSector: (sector) => set({ activeSector: sector }),
  setIsEnteringTheater: (isEntering) => set((state) => {
    if (isEntering && !state.isEnteringTheater) {
      setTimeout(() => {
        get().incrementTheaterExplorations();
        get().logActivity({ type: 'EXPLORE', title: 'Entered Theater System' });
      }, 0);
    }
    return { isEnteringTheater: isEntering };
  }),
  
  setSelectedMovie: (movie) => set({ selectedMovie: movie }),
  
  setActivePOVSeat: (seat) => set({ activePOVSeat: seat }),
  
  setIsComparing: (isComparing) => set((state) => {
    if (isComparing && !state.isComparing) {
      setTimeout(() => {
        get().incrementSeatsCompared(state.selectedSeats.length);
        get().logActivity({ type: 'COMPARE', title: `Compared ${state.selectedSeats.length} Seats` });
      }, 0);
    }
    return { isComparing };
  }),
  setRecommendedSeat: (seat) => set(() => {
    if (seat) {
      setTimeout(() => {
        get().logActivity({ type: 'RECOMMEND', title: `Identified Recommended Seat: ${seat.id}` });
      }, 0);
    }
    return { recommendedSeat: seat };
  }),
  
  toggleSeatSelection: (seat) => set((state) => {
    const isSelected = state.selectedSeats.find(s => s.id === seat.id);
    if (isSelected) {
      return { selectedSeats: state.selectedSeats.filter(s => s.id !== seat.id) };
    }
    return { selectedSeats: [...state.selectedSeats, seat] };
  }),
  
  clearSelectedSeats: () => set({ selectedSeats: [] }),

  addBooking: (booking) => set((state) => {
    setTimeout(() => {
      get().logActivity({ type: 'BOOK', title: `Reserved Seat ${booking.seats.join(', ')}` });
      if (state.recommendedSeat) {
        get().recordSeatQuality(state.recommendedSeat.qualityScore, state.recommendedSeat.ratingCategory);
      }
    }, 0);
    
    return {
      bookingHistory: [booking, ...state.bookingHistory]
    };
  }),

  updateBookingPaymentStatus: (bookingId, status) => set((state) => ({
    bookingHistory: state.bookingHistory.map(b => 
      b.id === bookingId ? { ...b, paymentStatus: status } : b
    )
  })),
  


  // Stats Actions
  logActivity: (activity) => set((state) => ({
    activityTimeline: [{ ...activity, id: Math.random().toString(), timestamp: new Date().toISOString() }, ...state.activityTimeline].slice(0, 50)
  })),

  incrementSeatsCompared: (count) => set((state) => ({
    stats: { ...state.stats, totalSeatsCompared: state.stats.totalSeatsCompared + count }
  })),

  incrementTheaterExplorations: () => set((state) => ({
    stats: { ...state.stats, totalTheaterExplorations: state.stats.totalTheaterExplorations + 1 }
  })),

  recordSeatQuality: (score, category) => set((state) => {
    const newZones = { ...state.stats.zonePreferences };
    newZones[category] = (newZones[category] || 0) + 1;
    return {
      stats: {
        ...state.stats,
        sumQualityScore: state.stats.sumQualityScore + score,
        totalQualityScoresRecorded: state.stats.totalQualityScoresRecorded + 1,
        zonePreferences: newZones
      }
    };
  })
}));

// We also need to export the MOVIES list so components can render them.
export { MOVIES };
