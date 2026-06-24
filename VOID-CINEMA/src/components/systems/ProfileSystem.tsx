import React from 'react';
import { motion } from 'framer-motion';
import SystemWrapper from './SystemWrapper';
import { useStore } from '../../store/useStore';
import { useAuthStore } from '../../store/useAuthStore';
import { User, Clock, LogOut, Ticket, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const premiumEase = [0.22, 1, 0.36, 1] as [number, number, number, number];

// Stagger variants for timeline items
const timelineContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const timelineItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: premiumEase,
    },
  },
};

const ProfileSystem: React.FC = () => {
  const { profile, user, signOut } = useAuthStore();
  const navigate = useNavigate();

  // Existing local state fallback for guest viewing (though profile is protected, good practice)
  const stats = useStore((state) => state.stats);
  const bookingHistory = useStore((state) => state.bookingHistory);
  const activityTimeline = useStore((state) => state.activityTimeline);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const totalBookings = bookingHistory.length;
  const totalSeatsCompared = stats.totalSeatsCompared;

  // Real authenticated user data integration
  let displayUsername = 'GUEST';
  
  if (user) {
    if (user.user_metadata?.username) {
      displayUsername = user.user_metadata.username;
    } else if (user.email) {
      displayUsername = user.email.split('@')[0];
    }
  }

  // Formatted Member Since date
  let displayMemberSince = '2026'; // Default fallback
  const createdDateStr = user?.created_at || profile?.created_at;
  
  if (createdDateStr) {
    const date = new Date(createdDateStr);
    displayMemberSince = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`.toUpperCase();
  }

  return (
    <SystemWrapper title="Command Center">
      <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto pb-20">

        {/* ── Profile Card ── */}
        <motion.div
          className="glass-panel-neon p-8 backdrop-blur-md border border-white/10 bg-black/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: premiumEase }}
        >
          <div className="flex items-center gap-6">
            <div
              className="w-24 h-24 rounded-full border-2 border-neon-cyan bg-neon-cyan/20 flex items-center justify-center"
              style={{ boxShadow: '0 0 20px rgba(0, 243, 255, 0.3)' }}
            >
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

          <motion.button
            onClick={handleLogout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-6 py-3 border border-red-500/50 text-red-400 uppercase tracking-widest font-bold text-xs gpu-accelerated"
            style={{
              transition: 'background-color var(--duration-normal) var(--ease-premium), color var(--duration-normal) var(--ease-premium)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
              e.currentTarget.style.color = 'rgb(252, 165, 165)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'rgb(248, 113, 113)';
            }}
          >
            <LogOut size={16} />
            Disconnect
          </motion.button>
        </motion.div>

        {/* ── Metrics Row (2 cards only: Total Bookings + Seats Compared) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Total Bookings */}
          <motion.div
            className="glass-panel-neon p-8 border border-white/10 bg-black/40 flex flex-col justify-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, delay: 0.1, ease: premiumEase }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold tracking-widest text-white/50 uppercase flex items-center gap-2">
                <Ticket size={18} className="text-neon-purple" />
                Total Bookings
              </h3>
            </div>
            <div className="text-6xl font-black text-white tracking-wider">
              {totalBookings}
            </div>
            <div className="mt-3 text-[10px] text-gray-500 font-mono tracking-widest uppercase">
              Lifetime Reservations
            </div>
          </motion.div>

          {/* Seats Compared */}
          <motion.div
            className="glass-panel-neon p-8 border border-white/10 bg-black/40 flex flex-col justify-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, delay: 0.2, ease: premiumEase }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold tracking-widest text-white/50 uppercase flex items-center gap-2">
                <BarChart3 size={18} className="text-neon-cyan" />
                Seats Compared
              </h3>
            </div>
            <div className="text-6xl font-black text-neon-cyan tracking-wider">
              {totalSeatsCompared}
            </div>
            <div className="mt-3 text-[10px] text-gray-500 font-mono tracking-widest uppercase">
              Seats Analyzed
            </div>
          </motion.div>
        </div>

        {/* ── Activity Timeline ── */}
        <motion.div
          className="glass-panel-neon p-8 border border-white/10 bg-black/40"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.3, ease: premiumEase }}
        >
          <h3 className="text-sm font-bold tracking-widest text-white/50 uppercase mb-8 border-b border-white/10 pb-4 flex items-center justify-between">
            <span>Activity Logs</span>
            <Clock size={16} />
          </h3>

          {activityTimeline.length === 0 ? (
            <div className="py-10 text-center text-white/20 font-mono text-sm tracking-widest">
              NO RECENT ACTIVITY DETECTED
            </div>
          ) : (
            <motion.div
              className="flex flex-col gap-8 relative"
              variants={timelineContainerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              {/* Timeline line with gradient */}
              <div
                className="absolute left-[11px] top-2 bottom-2 w-px"
                style={{
                  background: 'linear-gradient(to bottom, rgba(0, 243, 255, 0.3), rgba(191, 0, 255, 0.2), rgba(0, 243, 255, 0.1))',
                }}
              />

              {activityTimeline.map((activity) => (
                <motion.div
                  key={activity.id}
                  variants={timelineItemVariants}
                  className="relative pl-12 flex flex-col md:flex-row md:items-center justify-between gap-2 group cursor-default"
                >
                  {/* Pulsing timeline dot */}
                  <div className="absolute left-[5px] top-1.5 w-[14px] h-[14px] rounded-full flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-neon-cyan/30 animate-pulse-dot" />
                    <div
                      className="w-3 h-3 rounded-full bg-neon-cyan relative z-[1]"
                      style={{ boxShadow: '0 0 10px #00f3ff' }}
                    />
                  </div>

                  {/* Content */}
                  <div
                    className="gpu-accelerated"
                    style={{
                      transition: 'transform var(--duration-fast) var(--ease-premium)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    <div className="font-bold text-base text-white tracking-wider group-hover:text-neon-cyan"
                      style={{ transition: 'color var(--duration-fast) var(--ease-premium)' }}
                    >
                      {activity.title}
                    </div>
                    <div className="text-xs font-mono text-neon-cyan/60 uppercase mt-1 tracking-widest">
                      {activity.type.replace('_', ' ')}
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 font-mono tracking-widest md:text-right whitespace-nowrap">
                    {new Date(activity.timestamp).toLocaleString()}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>

      </div>
    </SystemWrapper>
  );
};

export default ProfileSystem;
