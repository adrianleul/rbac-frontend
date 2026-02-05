import React, { useState, useEffect, createContext, useContext, ReactNode, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, XCircle, X, AlertCircle, Info } from 'lucide-react';
import { registerToast, unregisterToast } from './toastService';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      id,
      duration: 5000, // Default 5 seconds
      ...toast,
    };

    setToasts(prev => [...prev, newToast]);

    // Auto dismiss after duration (ensure it's always 5 seconds unless explicitly set to 0)
    const duration = newToast.duration === 0 ? 0 : (newToast.duration || 5000);
    if (duration > 0) {
      setTimeout(() => {
        hideToast(id);
      }, duration);
    }
  }, [hideToast]);

  useEffect(() => {
    registerToast(showToast);
    return () => unregisterToast(showToast);
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {typeof document !== 'undefined'
        ? createPortal(
            <ToastContainer toasts={toasts} hideToast={hideToast} />, 
            document.body
          )
        : null}
    </ToastContext.Provider>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  hideToast: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, hideToast }) => {
  return (
    <div className="fixed top-4 right-4 z-[2000] space-y-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} hideToast={hideToast} />
        </div>
      ))}
    </div>
  );
};

interface ToastItemProps {
  toast: Toast;
  hideToast: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, hideToast }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const progressIntervalRef = useRef<number | null>(null);
  const duration = toast.duration === 0 ? 0 : (toast.duration || 5000);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (duration > 0) {
      const startTime = Date.now();
      const endTime = startTime + duration;
      
      progressIntervalRef.current = window.setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, endTime - now);
        const newProgress = (remaining / duration) * 100;
        
        setProgress(newProgress);
        
        if (remaining <= 0) {
          hideToast(toast.id);
        }
      }, 50); // Update every 50ms for smooth progress bar
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [duration, hideToast, toast.id]);

  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50 border-green-200',
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          titleColor: 'text-green-800',
          messageColor: 'text-green-700',
          progressColor: 'bg-green-500',
        };
      case 'error':
        return {
          bg: 'bg-red-50 border-red-200',
          icon: <XCircle className="w-5 h-5 text-red-500" />,
          titleColor: 'text-red-800',
          messageColor: 'text-red-700',
          progressColor: 'bg-red-500',
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50 border-yellow-200',
          icon: <AlertCircle className="w-5 h-5 text-yellow-500" />,
          titleColor: 'text-yellow-800',
          messageColor: 'text-yellow-700',
          progressColor: 'bg-yellow-500',
        };
      case 'info':
        return {
          bg: 'bg-blue-50 border-blue-200',
          icon: <Info className="w-5 h-5 text-blue-500" />,
          titleColor: 'text-blue-800',
          messageColor: 'text-blue-700',
          progressColor: 'bg-blue-500',
        };
      default:
        return {
          bg: 'bg-gray-50 border-gray-200',
          icon: <Info className="w-5 h-5 text-gray-500" />,
          titleColor: 'text-gray-800',
          messageColor: 'text-gray-700',
          progressColor: 'bg-gray-500',
        };
    }
  };

  const styles = getToastStyles(toast.type);

  return (
    <div
      className={`
        ${styles.bg} border rounded-lg shadow-lg p-4 min-w-80 max-w-md relative overflow-hidden
        transform transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      {/* Progress bar */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200">
          <div
            className={`h-full ${styles.progressColor} transition-all duration-50 ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3 mt-0.5">
          {styles.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className={`text-sm font-medium ${styles.titleColor}`}>
            {toast.title}
          </div>
          {toast.message && (
            <div className={`text-sm mt-1 ${styles.messageColor}`}>
              {toast.message}
            </div>
          )}
        </div>
        <div className="flex-shrink-0 ml-3">
          <button
            onClick={() => hideToast(toast.id)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Convenience functions for common toast types
export const toast = {
  success: (title: string, message?: string, duration?: number) => {
    return { type: 'success' as const, title, message, duration };
  },
  error: (title: string, message?: string, duration?: number) => {
    return { type: 'error' as const, title, message, duration };
  },
  warning: (title: string, message?: string, duration?: number) => {
    return { type: 'warning' as const, title, message, duration };
  },
  info: (title: string, message?: string, duration?: number) => {
    return { type: 'info' as const, title, message, duration };
  },
}; 