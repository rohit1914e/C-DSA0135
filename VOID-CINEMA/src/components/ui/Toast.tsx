import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextValue {
  showToast: (message: string, type?: Toast['type']) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

const ToastItem: React.FC<{ toast: Toast; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Enter animation
    requestAnimationFrame(() => setIsVisible(true));

    // Auto dismiss after 4s
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onDismiss(toast.id), 400);
    }, 4000);

    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const icons = {
    success: <CheckCircle2 size={20} className="text-green-400 shrink-0" />,
    error: <XCircle size={20} className="text-red-400 shrink-0" />,
    info: <Info size={20} className="text-neon-cyan shrink-0" />,
  };

  const borderColors = {
    success: 'border-green-500/40',
    error: 'border-red-500/40',
    info: 'border-neon-cyan/40',
  };

  const glowColors = {
    success: '0 0 20px rgba(34, 197, 94, 0.2)',
    error: '0 0 20px rgba(239, 68, 68, 0.2)',
    info: '0 0 20px rgba(0, 243, 255, 0.2)',
  };

  return (
    <div
      className={`
        flex items-center gap-3 px-5 py-4 rounded-xl border backdrop-blur-xl
        bg-black/80 ${borderColors[toast.type]}
        font-mono text-sm text-white tracking-wide
        transition-all duration-400 ease-out pointer-events-auto
        ${isVisible && !isExiting ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
      `}
      style={{ boxShadow: glowColors[toast.type] }}
    >
      {icons[toast.type]}
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={() => {
          setIsExiting(true);
          setTimeout(() => onDismiss(toast.id), 400);
        }}
        className="p-1 hover:bg-white/10 rounded transition-colors text-gray-500 hover:text-white shrink-0"
      >
        <X size={14} />
      </button>
    </div>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none max-w-md w-full">
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};
