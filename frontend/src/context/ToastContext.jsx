import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext();

const toastConfig = {
  success: {
    icon: CheckCircle2,
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    icon_color: 'text-emerald-500',
    text: 'text-emerald-800',
  },
  error: {
    icon: XCircle,
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    icon_color: 'text-rose-500',
    text: 'text-rose-800',
  },
  info: {
    icon: Info,
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon_color: 'text-blue-500',
    text: 'text-blue-800',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon_color: 'text-amber-500',
    text: 'text-amber-800',
  },
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast Container */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          const cfg = toastConfig[toast.type] || toastConfig.info;
          const Icon = cfg.icon;
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start space-x-3 px-4 py-3.5 rounded-2xl border shadow-xl ${cfg.bg} ${cfg.border} animate-slide-up`}
            >
              <Icon size={18} className={`${cfg.icon_color} flex-shrink-0 mt-0.5`} />
              <p className={`text-xs font-semibold flex-1 leading-relaxed ${cfg.text}`}>
                {toast.message}
              </p>
              <button
                onClick={() => removeToast(toast.id)}
                className={`${cfg.icon_color} opacity-60 hover:opacity-100 transition-opacity flex-shrink-0`}
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};
