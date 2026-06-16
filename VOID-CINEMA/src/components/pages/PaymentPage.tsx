import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore, MOVIES } from '../../store/useStore';
import { ChevronLeft, QrCode, Copy, CheckCircle2, Clock, Loader2, Check, Database } from 'lucide-react';
import { useToast } from '../ui/Toast';
import paymentQr from '../../assets/payment/payment-qr.png';
import gsap from 'gsap';

type PaymentPhase = 'checkout' | 'verifying' | 'scanning' | 'creating' | 'reveal' | 'saving' | 'complete';

const PaymentPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { bookingHistory, updateBookingPaymentStatus } = useStore();
  const { showToast } = useToast();
  
  const [timeLeft, setTimeLeft] = useState(10 * 60); // 10 minutes
  const [phase, setPhase] = useState<PaymentPhase>('checkout');
  const [isPlayingGenerationVideo, setIsPlayingGenerationVideo] = useState(false);
  const [isVideoFadingOut, setIsVideoFadingOut] = useState(false);
  const [showAudioOverlay, setShowAudioOverlay] = useState(false);

  const booking = bookingHistory.find(b => b.id === bookingId);
  const movie = booking ? MOVIES.find(m => m.id === booking.movieId) : null;

  // Refs for GSAP
  const containerRef = useRef<HTMLDivElement>(null);
  const qrScanRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const ticketRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoOverlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!booking || (booking.paymentStatus === 'paid' && phase === 'checkout' && !isPlayingGenerationVideo)) {
      navigate('/');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev <= 1 ? 0 : prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [booking, navigate, phase, isPlayingGenerationVideo]);

  // Phase progression (original logic — untouched)
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    if (phase === 'verifying') {
      timeoutId = setTimeout(() => setPhase('scanning'), 2000);
    } else if (phase === 'scanning') {
      timeoutId = setTimeout(() => setPhase('creating'), 3000);
    } else if (phase === 'creating') {
      timeoutId = setTimeout(() => setPhase('reveal'), 3000);
    } else if (phase === 'reveal') {
      timeoutId = setTimeout(() => setPhase('saving'), 3000);
    } else if (phase === 'saving') {
      if (booking && booking.paymentStatus !== 'paid') {
        updateBookingPaymentStatus(booking.id, 'paid');
      }
      timeoutId = setTimeout(() => setPhase('complete'), 2000);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [phase]); // removed booking from dependencies so it doesn't loop when booking updates

  // Auto-redirect at complete phase → /tickets after 2 seconds
  useEffect(() => {
    if (phase === 'complete') {
      const redirectTimer = setTimeout(() => {
        console.log('REDIRECTING TO TICKET SCREEN');
        navigate('/tickets');
        setTimeout(() => {
          showToast('Ticket Generated Successfully', 'success');
        }, 300);
      }, 2000);

      return () => clearTimeout(redirectTimer);
    }
  }, [phase, navigate, showToast]);

  // GSAP Animations per phase (original logic — untouched)
  useEffect(() => {
    if (!containerRef.current) return;

    if (phase === 'scanning' && qrScanRef.current) {
      gsap.fromTo(qrScanRef.current, 
        { scale: 0.8, opacity: 0 }, 
        { scale: 1.2, opacity: 1, duration: 1, ease: 'power2.out' }
      );
    } else if (phase === 'creating' && particlesRef.current && ticketRef.current) {
      gsap.to(particlesRef.current.children, {
        x: 'random(-100, 100)',
        y: 'random(-100, 100)',
        opacity: 0,
        duration: 2,
        stagger: { amount: 1, from: 'center' },
        ease: 'power3.out'
      });
      gsap.fromTo(ticketRef.current,
        { scale: 0.5, opacity: 0, rotationY: 90 },
        { scale: 1, opacity: 1, rotationY: 0, duration: 2, delay: 1, ease: 'expo.out' }
      );
    } else if (phase === 'reveal' && ticketRef.current) {
      gsap.to(ticketRef.current, {
        boxShadow: '0 0 50px 10px rgba(0, 255, 255, 0.4)',
        duration: 1,
        yoyo: true,
        repeat: 1
      });
    } else if (phase === 'saving' && ticketRef.current) {
      gsap.to(ticketRef.current, {
        scale: 0.2,
        y: -200,
        opacity: 0,
        duration: 1.5,
        ease: 'power3.in'
      });
    }
  }, [phase]);

  // ─── Video handlers ────────────────────────────────

  const handlePaymentComplete = () => {
    setIsPlayingGenerationVideo(true);
  };

  // Auto-play video when overlay mounts
  useEffect(() => {
    if (isPlayingGenerationVideo && videoRef.current) {
      console.log('VIDEO MOUNTED');
      videoRef.current.play().then(() => {
        console.log('VIDEO PLAY STARTED');
        console.log('VIDEO AUDIO ENABLED');
      }).catch((err) => {
        console.error('VIDEO PLAY FAILED', err);
        if (err.name === 'NotAllowedError') {
          setShowAudioOverlay(true);
        } else {
          // If video fails, skip straight to ticket generation sequence
          setIsPlayingGenerationVideo(false);
          setPhase('verifying');
        }
      });
    }
  }, [isPlayingGenerationVideo]);

  const handleVideoEnded = () => {
    console.log('VIDEO ENDED');
    // Fade out the video overlay, then start the ticket generation sequence
    setIsVideoFadingOut(true);
    setTimeout(() => {
      setIsPlayingGenerationVideo(false);
      setIsVideoFadingOut(false);
      setPhase('verifying');
    }, 800); // 800ms fade-out duration
  };

  const handleVideoError = () => {
    console.error('Video failed to load, skipping to ticket generation.');
    setIsPlayingGenerationVideo(false);
    setPhase('verifying');
  };

  if (!booking || !movie) return null;

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const upiId = 'voidcinema@oksbi';
  const ticketPrice = booking.totalAmount - 50; 

  const renderCheckoutPhase = () => (
    <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left: Order Summary */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        <div className="glass-panel p-8 border border-white/10 rounded-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <QrCode size={120} />
          </div>
          
          <h3 className="text-xs font-mono tracking-[0.3em] text-neon-cyan uppercase mb-8 border-b border-white/10 pb-4">Order Summary</h3>
          
          <div className="flex gap-6 mb-8">
            <img src={movie.posterUrl} alt={movie.title} className="w-24 h-36 object-cover rounded-md shadow-lg" />
            <div className="flex flex-col justify-center">
              <h4 className="text-2xl font-black uppercase tracking-widest mb-2">{movie.title}</h4>
              <p className="text-sm font-mono text-gray-400 mb-1">DATE: <span className="text-white">{booking.date}</span></p>
              <p className="text-sm font-mono text-gray-400 mb-1">TIME: <span className="text-white">{booking.time}</span></p>
              <p className="text-sm font-mono text-gray-400">SEATS: <span className="text-white">{booking.seats.join(', ')}</span></p>
            </div>
          </div>

          <div className="space-y-4 font-mono text-sm border-t border-white/10 pt-6">
            <div className="flex justify-between items-center text-gray-400">
              <span>Tickets ({booking.seats.length} x ₹{ticketPrice / booking.seats.length})</span>
              <span className="text-white">₹{ticketPrice}</span>
            </div>
            <div className="flex justify-between items-center text-gray-400">
              <span>Convenience Fee</span>
              <span className="text-white">₹50</span>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-white/10 mt-4">
              <span className="font-bold tracking-widest uppercase">Total Amount</span>
              <span className="text-3xl font-black text-neon-cyan">₹{booking.totalAmount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Payment QR */}
      <div className="lg:col-span-7 flex flex-col items-center justify-center">
        <div className="glass-panel-neon p-10 border border-neon-cyan/30 rounded-2xl max-w-md w-full flex flex-col items-center relative">
          <div className="absolute -top-4 bg-neon-cyan text-black px-4 py-1 text-xs font-black tracking-widest uppercase rounded-full">
            Scan & Pay
          </div>
          <h3 className="text-sm font-mono text-gray-300 mb-8 text-center mt-4">
            Scan QR using any UPI application<br/>(GPay, PhonePe, Paytm, etc.)
          </h3>
          <div className="bg-white p-4 rounded-xl shadow-2xl mb-8 border-4 border-white flex items-center justify-center w-64 h-64">
            <img 
              src={paymentQr} 
              alt="Payment QR Code" 
              className="w-full h-full object-contain rounded-lg mix-blend-multiply" 
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement?.classList.add('bg-gray-100');
                const fallback = document.createElement('div');
                fallback.className = 'text-black font-mono text-sm text-center font-bold px-4';
                fallback.textContent = 'QR Code Not Uploaded';
                e.currentTarget.parentElement?.appendChild(fallback);
              }}
            />
          </div>
          <div className="w-full bg-black/50 border border-white/10 rounded-lg p-4 mb-8 flex justify-between items-center">
            <div>
              <p className="text-[10px] font-mono text-gray-500 tracking-widest uppercase mb-1">UPI ID</p>
              <p className="text-sm font-mono text-white font-bold">{upiId}</p>
            </div>
            <button onClick={() => navigator.clipboard.writeText(upiId)} className="p-2 hover:bg-white/10 rounded-md transition-colors text-gray-400 hover:text-white">
              <Copy size={18} />
            </button>
          </div>
          <button onClick={handlePaymentComplete} className="w-full relative overflow-hidden group/btn px-8 py-4 bg-neon-cyan/10 border-2 border-neon-cyan hover:bg-neon-cyan transition-all duration-300 rounded-sm">
            <div className="relative flex items-center justify-center gap-3 z-10">
              <CheckCircle2 size={18} className="text-neon-cyan group-hover/btn:text-black transition-colors" />
              <span className="text-sm font-black tracking-[0.2em] uppercase text-white group-hover/btn:text-black transition-colors">
                I have completed payment
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  const renderSequence = () => (
    <div className="min-h-screen flex items-center justify-center relative w-full h-full perspective-[1000px]" ref={containerRef}>
      {/* Dynamic Backgrounds per phase */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neon-cyan/10 via-black to-black -z-10 transition-opacity duration-1000"></div>

      <div className="flex flex-col items-center justify-center max-w-2xl w-full">
        {/* PHASE 1: VERIFYING */}
        {phase === 'verifying' && (
          <div className="text-center">
            <Loader2 size={48} className="text-neon-cyan animate-spin mx-auto mb-6" />
            <h2 className="text-2xl font-black tracking-[0.3em] text-white uppercase mb-4 animate-pulse">Payment Detected</h2>
            <p className="text-sm font-mono text-neon-cyan tracking-widest uppercase animate-pulse">Authenticating Payment Token...</p>
            <div className="w-64 h-1 bg-gray-800 mx-auto mt-8 rounded-full overflow-hidden">
              <div className="h-full bg-neon-cyan animate-[shimmer_1s_infinite]" style={{ width: '100%' }}></div>
            </div>
          </div>
        )}

        {/* PHASE 2: SCANNING */}
        {phase === 'scanning' && (
          <div className="text-center" ref={qrScanRef}>
            <div className="relative w-64 h-64 mx-auto mb-8 bg-white p-4 rounded-xl border-4 border-neon-cyan shadow-[0_0_30px_rgba(0,255,255,0.3)]">
              <img src={paymentQr} alt="QR" className="w-full h-full object-contain mix-blend-multiply" />
              <div className="absolute inset-0 bg-neon-cyan/20 animate-[scan_2s_ease-in-out_infinite] border-b-2 border-neon-cyan pointer-events-none rounded-lg"></div>
            </div>
            <h2 className="text-xl font-black tracking-[0.2em] text-white uppercase mb-2">Reading Payment Data...</h2>
            <p className="text-xs font-mono text-gray-400 tracking-widest uppercase">Verifying Booking ID: {booking.id}</p>
          </div>
        )}

        {/* PHASE 3 & 4 & 5: CREATING / REVEAL / SAVING */}
        {(phase === 'creating' || phase === 'reveal' || phase === 'saving') && (
          <div className="relative w-full flex flex-col items-center justify-center">
            
            {phase === 'creating' && (
              <div ref={particlesRef} className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {[...Array(20)].map((_, i) => (
                  <div key={i} className="w-2 h-2 bg-neon-cyan rounded-full absolute animate-ping" style={{ 
                    left: `${50 + (Math.random() * 40 - 20)}%`, 
                    top: `${50 + (Math.random() * 40 - 20)}%`,
                    animationDelay: `${Math.random() * 1}s`
                  }}></div>
                ))}
              </div>
            )}

            <div ref={ticketRef} className="glass-panel border border-neon-cyan/50 rounded-xl p-8 max-w-md w-full relative overflow-hidden backdrop-blur-xl">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <TicketIcon size={120} />
              </div>
              <div className="flex items-start gap-6 relative z-10">
                <img src={movie.posterUrl} alt={movie.title} className="w-20 h-32 object-cover rounded shadow-lg" />
                <div>
                  <h3 className="text-xl font-black tracking-widest uppercase text-white mb-2">{movie.title}</h3>
                  <div className="space-y-1 font-mono text-xs text-gray-300">
                    <p><span className="text-neon-cyan">DATE:</span> {booking.date}</p>
                    <p><span className="text-neon-cyan">TIME:</span> {booking.time}</p>
                    <p><span className="text-neon-cyan">SEATS:</span> {booking.seats.join(', ')}</p>
                  </div>
                </div>
              </div>
              {phase === 'reveal' && (
                <div className="absolute inset-0 bg-white/10 z-20 animate-pulse pointer-events-none rounded-xl border border-white"></div>
              )}
            </div>

            <div className="mt-8 text-center h-16">
              {phase === 'creating' && <p className="text-sm font-mono text-neon-cyan animate-pulse uppercase tracking-widest">Generating Digital Ticket...</p>}
              {phase === 'reveal' && (
                <div className="flex items-center gap-2 justify-center text-green-400 font-bold uppercase tracking-widest text-sm">
                  <CheckCircle2 size={20} /> Ticket Generated
                </div>
              )}
              {phase === 'saving' && (
                <div className="flex items-center gap-2 justify-center text-neon-purple font-bold uppercase tracking-widest text-sm">
                  <Database size={20} className="animate-bounce" /> Adding to My Tickets...
                </div>
              )}
            </div>
          </div>
        )}

        {/* PHASE 6: COMPLETE — auto-redirects after 2 seconds */}
        {phase === 'complete' && (
          <div className="text-center animate-in fade-in zoom-in duration-700">
            <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-neon-cyan/20 flex items-center justify-center border-2 border-neon-cyan">
              <Check size={48} className="text-neon-cyan" />
            </div>
            <h2 className="text-3xl font-black tracking-[0.2em] uppercase text-white mb-4">Ready for entry</h2>
            <p className="text-sm font-mono text-gray-400 tracking-widest uppercase animate-pulse">Redirecting to My Tickets...</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full min-h-screen relative z-10 pointer-events-auto bg-[#050508] overflow-hidden">
      {/* Background stays persistent */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900/20 to-black pointer-events-none -z-10"></div>
      
      {phase === 'checkout' && !isPlayingGenerationVideo && (
        <div className="sticky top-0 w-full px-6 py-4 z-50 flex justify-between items-center bg-black/80 backdrop-blur-md border-b border-white/5">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white uppercase tracking-[0.2em] text-xs font-bold">
            <ChevronLeft size={16} /> Cancel Payment
          </button>
          <div className="text-center">
            <div className="text-sm font-black tracking-[0.2em] uppercase text-white">Secure Checkout</div>
            <div className="text-[10px] font-mono text-neon-cyan tracking-widest flex items-center justify-center gap-1 mt-1">
              <Clock size={10} /> {formatTime(timeLeft)}
            </div>
          </div>
          <div className="text-xl font-black tracking-[0.2em] text-glow-cyan text-white select-none">
            VOID <span className="text-neon-cyan">CINEMA</span>
          </div>
        </div>
      )}

      {phase === 'checkout' && !isPlayingGenerationVideo ? renderCheckoutPhase() : null}
      {phase !== 'checkout' ? renderSequence() : null}

      {/* ═══════════════════════════════════════════════════════
          FULLSCREEN VIDEO OVERLAY
          Renders above everything when isPlayingGenerationVideo is true
          ═══════════════════════════════════════════════════════ */}
      {isPlayingGenerationVideo && (
        <div
          ref={videoOverlayRef}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            backgroundColor: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            opacity: isVideoFadingOut ? 0 : 1,
            transition: 'opacity 0.8s ease-out',
          }}
        >
          <video
            ref={videoRef}
            src="/videos/ticket-generation.mp4"
            autoPlay
            playsInline
            onEnded={handleVideoEnded}
            onError={handleVideoError}
            style={{
              width: '100vw',
              height: '100vh',
              objectFit: 'cover',
            }}
          />
          {showAudioOverlay && (
            <div 
              className="absolute inset-0 z-[100000] flex items-center justify-center bg-black/80 backdrop-blur-sm cursor-pointer"
              onClick={() => {
                setShowAudioOverlay(false);
                if (videoRef.current) {
                  videoRef.current.play().then(() => {
                    console.log('VIDEO PLAY STARTED');
                    console.log('VIDEO AUDIO ENABLED');
                  }).catch(err => {
                    console.error('VIDEO PLAY FAILED', err);
                  });
                }
              }}
            >
              <p className="text-white font-black tracking-widest uppercase animate-pulse text-lg">Tap anywhere to continue cinematic playback</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Simple TicketIcon SVG component
const TicketIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
    <path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/>
  </svg>
);

export default PaymentPage;
