import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, MOVIES } from '../../store/useStore';
import { ChevronLeft, Download, Eye, Ticket as TicketIcon, Loader2 } from 'lucide-react';
import paymentQr from '../../assets/payment/payment-qr.png';
import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';

const MyTicketsPage: React.FC = () => {
  const navigate = useNavigate();
  const { bookingHistory } = useStore();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const paidBookings = bookingHistory.filter(b => b.paymentStatus === 'paid');

  const generatePDF = async (bookingId: string) => {
    try {
      setDownloadingId(bookingId);
      const element = document.getElementById(`ticket-${bookingId}`);
      if (!element) throw new Error('Ticket element not found');

      // Add a temporary class to ensure high quality rendering without hover effects
      element.classList.add('pdf-render-mode');

      const dataUrl = await htmlToImage.toPng(element, {
        pixelRatio: 2,
        backgroundColor: '#0a0a0f',
      });

      element.classList.remove('pdf-render-mode');

      // Estimate dimensions based on client bounds
      const rect = element.getBoundingClientRect();
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [rect.width, rect.height]
      });

      pdf.addImage(dataUrl, 'PNG', 0, 0, rect.width, rect.height);
      pdf.save(`VOID-CINEMA-TICKET-${bookingId}.pdf`);
      
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="w-full min-h-screen relative z-10 pointer-events-auto bg-[#0a0a0f]">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900/30 to-black pointer-events-none -z-10"></div>

      {/* Top Nav */}
      <div className="sticky top-0 w-full px-6 py-4 z-50 flex justify-between items-center bg-black/80 backdrop-blur-md border-b border-white/5">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-neon-cyan hover:text-white transition-colors uppercase tracking-[0.2em] text-sm glass-panel-neon px-5 py-2.5"
        >
          <ChevronLeft size={18} />
          <span>Home</span>
        </button>
        
        <div className="text-center">
          <div className="text-sm font-black tracking-[0.3em] uppercase text-white">My Tickets</div>
        </div>

        <div className="text-xl font-black tracking-[0.2em] text-glow-cyan text-white select-none">
          VOID <span className="text-neon-cyan">CINEMA</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {paidBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
              <TicketIcon size={48} className="text-gray-600" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-widest text-gray-500 mb-2">No Tickets Found</h2>
            <p className="text-sm font-mono text-gray-600 mb-8">You haven't booked any movies yet.</p>
            <button 
              onClick={() => navigate('/')}
              className="px-8 py-4 bg-neon-cyan/10 border-2 border-neon-cyan hover:bg-neon-cyan text-neon-cyan hover:text-black transition-all duration-300 uppercase tracking-[0.3em] text-sm font-black rounded-sm"
            >
              Explore Movies
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {paidBookings.map((booking) => {
              const movie = MOVIES.find(m => m.id === booking.movieId);
              if (!movie) return null;

              return (
                <div id={`ticket-${booking.id}`} key={booking.id} className="glass-panel border border-neon-cyan/20 rounded-xl overflow-hidden flex flex-col sm:flex-row relative group">
                  {/* Neon Glow Effect on Hover */}
                  <div className="absolute inset-0 bg-neon-cyan/0 group-hover:bg-neon-cyan/5 transition-colors duration-500 pointer-events-none"></div>
                  
                  <div className="w-full sm:w-1/3 h-48 sm:h-auto relative">
                    <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent sm:bg-gradient-to-r"></div>
                  </div>
                  
                  <div className="flex-1 p-6 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-black uppercase tracking-widest text-white mb-1">{movie.title}</h3>
                        <p className="text-[10px] font-mono tracking-[0.2em] text-neon-cyan">BOOKING ID: {booking.id}</p>
                      </div>
                      <div className="px-2 py-1 bg-green-500/20 border border-green-500/50 rounded text-[9px] font-mono text-green-400 tracking-widest uppercase">
                        Confirmed
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6 mt-auto">
                      <div>
                        <p className="text-[10px] font-mono text-gray-500 tracking-widest mb-1">DATE</p>
                        <p className="text-sm font-bold text-gray-200">{booking.date}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-mono text-gray-500 tracking-widest mb-1">TIME</p>
                        <p className="text-sm font-bold text-gray-200">{booking.time}</p>
                      </div>
                      <div className="col-span-2 border-t border-white/10 pt-4 mt-2">
                        <p className="text-[10px] font-mono text-gray-500 tracking-widest mb-1">SEATS</p>
                        <div className="flex flex-wrap gap-2">
                          {booking.seats.map(seat => (
                            <span key={seat} className="px-2 py-1 bg-white/5 border border-white/20 rounded text-xs font-mono text-white">
                              {seat}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 border-t border-white/10 pt-4 relative z-10" data-html2canvas-ignore="true">
                      <button 
                        onClick={() => navigate(`/ticket/${booking.id}`)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-transparent border border-white/20 hover:bg-white/5 text-gray-300 hover:text-white transition-colors text-xs font-mono tracking-widest uppercase rounded"
                      >
                        <Eye size={14} /> View
                      </button>
                      <button 
                        onClick={() => generatePDF(booking.id)}
                        disabled={downloadingId === booking.id}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-neon-cyan/20 border border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black transition-colors text-xs font-mono tracking-widest uppercase rounded disabled:opacity-50"
                      >
                        {downloadingId === booking.id ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} 
                        {downloadingId === booking.id ? 'Saving...' : 'PDF'}
                      </button>
                    </div>
                  </div>

                  {/* QR Ticket Stump */}
                  <div className="hidden sm:flex w-24 bg-black/50 border-l border-dashed border-white/20 flex-col items-center justify-center p-4 relative">
                    {/* Semi circles for ticket stub effect */}
                    <div className="absolute -top-3 -left-3 w-6 h-6 rounded-full bg-[#0a0a0f]"></div>
                    <div className="absolute -bottom-3 -left-3 w-6 h-6 rounded-full bg-[#0a0a0f]"></div>
                    
                    <img 
                      src={paymentQr} 
                      alt="Ticket QR" 
                      className="w-16 h-16 object-contain mb-4 filter contrast-125 mix-blend-screen" 
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = document.createElement('div');
                        fallback.className = 'w-16 h-16 mb-4 flex items-center justify-center border border-dashed border-gray-600 rounded text-[8px] font-mono text-center text-gray-500';
                        fallback.textContent = 'NO QR';
                        e.currentTarget.parentElement?.insertBefore(fallback, e.currentTarget);
                      }}
                    />
                    <span className="transform -rotate-90 text-[10px] font-mono tracking-[0.3em] text-gray-500 whitespace-nowrap">SCAN ENTRY</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTicketsPage;
