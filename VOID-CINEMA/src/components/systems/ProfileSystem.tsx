import React from 'react';
import SystemWrapper from './SystemWrapper';
import { useStore } from '../../store/useStore';
import { useAuthStore } from '../../store/useAuthStore';
import { User, Clock, LogOut, Ticket, Armchair } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfileSystem: React.FC = () => {
  const { profile, signOut } = useAuthStore();
  const navigate = useNavigate();
  
  // Existing local state fallback for guest viewing (though profile is protected, good practice)
  const userProfile = useStore((state) => state.userProfile);
  const stats = useStore((state) => state.stats);
  const bookingHistory = useStore((state) => state.bookingHistory);
  const activityTimeline = useStore((state) => state.activityTimeline);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  // Derived Stats
  const totalBookings = bookingHistory.length;
  const uniqueMoviesWatched = new Set(bookingHistory.map(b => b.movieId)).size;

  let preferredZone = 'N/A';
  if (Object.keys(stats.zonePreferences).length > 0) {
    preferredZone = Object.keys(stats.zonePreferences).sort((a, b) => stats.zonePreferences[b] - stats.zonePreferences[a])[0];
  }

  // Calculate Most Selected Specific Seat
  const seatCounts: Record<string, number> = {};
  bookingHistory.forEach(b => {
    b.selectedSeats.forEach(s => {
      seatCounts[s.id] = (seatCounts[s.id] || 0) + 1;
    });
  });
  const mostSelectedSeat = Object.keys(seatCounts).length > 0 
    ? Object.keys(seatCounts).sort((a, b) => seatCounts[b] - seatCounts[a])[0]
    : 'N/A';

  const totalSeatsReserved = bookingHistory.reduce((acc, b) => acc + b.selectedSeats.length, 0);

  const displayUsername = profile?.username || userProfile.name;
  const displayMemberSince = profile?.created_at ? new Date(profile.created_at).getFullYear() : userProfile.memberSince;

  return (
    <SystemWrapper title="Command Center">
      <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto pb-20">
        
        {/* Top Row: Profile Card */}
        <div className="glass-panel-neon p-8 backdrop-blur-md border border-white/10 bg-black/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full border-2 border-neon-cyan bg-neon-cyan/20 flex items-center justify-center shadow-[0_0_20px_rgba(0,243,255,0.3)]">
              <User size={48} className="text-neon-cyan" />
            </div>
            <div>
              <h2 className="text-4xl font-black uppercase tracking-widest text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                {displayUsername}
              </h2>
              <div className="text-sm font-mono text-neon-cyan tracking-widest mt-2 uppercase">
                MEMBER SINCE {displayMemberSince}
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 border border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors uppercase tracking-widest font-bold text-xs"
          >
            <LogOut size={16} />
            Disconnect
          </button>
        </div>

        {/* Middle Row: Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Total Bookings Card */}
          <div className="glass-panel-neon p-6 border border-white/10 bg-black/40 flex flex-col justify-center">
            <h3 className="text-sm font-bold tracking-widest text-white/50 uppercase mb-6 flex items-center gap-2">
              <Ticket size={18} className="text-neon-purple" />
              Viewing History
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] text-gray-500 font-mono tracking-widest mb-1">TOTAL BOOKINGS</div>
                <div className="text-4xl font-black text-white">{totalBookings}</div>
              </div>
              <div>
                <div className="text-[10px] text-gray-500 font-mono tracking-widest mb-1">MOVIES WATCHED</div>
                <div className="text-4xl font-black text-neon-purple">{uniqueMoviesWatched}</div>
              </div>
            </div>
          </div>

          {/* Seat Comparison Card */}
          <div className="glass-panel-neon p-6 border border-white/10 bg-black/40 flex flex-col justify-center">
            <h3 className="text-sm font-bold tracking-widest text-white/50 uppercase mb-6 flex items-center gap-2">
              <Armchair size={18} className="text-neon-cyan" />
              Seating Analytics
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-[10px] text-gray-500 font-mono tracking-widest mb-1">FAV TYPE</div>
                <div className="text-xl font-black text-white tracking-widest">{preferredZone}</div>
              </div>
              <div>
                <div className="text-[10px] text-gray-500 font-mono tracking-widest mb-1">MOST BOOKED</div>
                <div className="text-xl font-black text-white tracking-widest">{mostSelectedSeat}</div>
              </div>
              <div>
                <div className="text-[10px] text-gray-500 font-mono tracking-widest mb-1">TOTAL SEATS</div>
                <div className="text-xl font-black text-neon-cyan tracking-widest">{totalSeatsReserved}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row: Activity Timeline */}
        <div className="glass-panel-neon p-8 border border-white/10 bg-black/40">
          <h3 className="text-sm font-bold tracking-widest text-white/50 uppercase mb-8 border-b border-white/10 pb-4 flex items-center justify-between">
            <span>Activity Logs</span>
            <Clock size={16} />
          </h3>
          
          {activityTimeline.length === 0 ? (
            <div className="py-10 text-center text-white/20 font-mono text-sm tracking-widest">
              NO RECENT ACTIVITY DETECTED
            </div>
          ) : (
            <div className="flex flex-col gap-8 relative">
              <div className="absolute left-[11px] top-2 bottom-2 w-px bg-white/10"></div>
              {activityTimeline.map((activity) => (
                <div key={activity.id} className="relative pl-12 flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="absolute left-2 top-1.5 w-3 h-3 rounded-full bg-neon-cyan shadow-[0_0_10px_#00f3ff]"></div>
                  
                  <div>
                    <div className="font-bold text-base text-white tracking-wider">
                      {activity.title}
                    </div>
                    <div className="text-xs font-mono text-neon-cyan uppercase mt-1">
                      {activity.type.replace('_', ' ')}
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 font-mono tracking-widest md:text-right">
                    {new Date(activity.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </SystemWrapper>
  );
};

export default ProfileSystem;
