import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Movie } from '../models/Movie';
import { Seat } from '../models/Seat';
import { Booking } from '../models/Booking';
import { User } from '../models/User';
import { MOVIES } from '../data/movies';

export type Sector = 'explore' | 'movies' | 'tickets' | 'history' | 'profile' | 'theater';

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
  
  // Theatre & Showtime State
  selectedTheatre: { id: string; name: string } | null;
  setSelectedTheatre: (theatre: { id: string; name: string } | null) => void;
  selectedDate: string | null;
  setSelectedDate: (date: string | null) => void;
  selectedTime: string | null;
  setSelectedTime: (time: string | null) => void;
  
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
  userProfile: User;
  stats: UserStats;
  activityTimeline: ActivityLog[];
  logActivity: (activity: Omit<ActivityLog, 'id' | 'timestamp'>) => void;
  incrementSeatsCompared: (count: number) => void;
  incrementTheaterExplorations: () => void;
  recordSeatQuality: (score: number, category: string) => void;
}

export const useStore = create<CinemaState>()(
  persist(
    (set, get) => ({
      // Initial State
      activeSector: 'explore',
      isEnteringTheater: false,
      selectedMovie: null,
      selectedTheatre: null,
      selectedDate: null,
      selectedTime: null,
      activePOVSeat: null,
      isComparing: false,
      recommendedSeat: null,
      selectedSeats: [],
      bookingHistory: [],

  userProfile: new User('u1', 'U1', '', '2026'),
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
  
  setSelectedTheatre: (theatre) => set({ selectedTheatre: theatre }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setSelectedTime: (time) => set({ selectedTime: time }),
  
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
}), {
  name: 'void-cinema-storage', // name of the item in the storage (must be unique)
  partialize: (state) => ({ 
    bookingHistory: state.bookingHistory, 
    stats: state.stats, 
    activityTimeline: state.activityTimeline,
    userProfile: state.userProfile
  }), // Only persist these fields to avoid saving transient UI state
}));

// We also need to export the MOVIES list so components can render them.
export { MOVIES };
