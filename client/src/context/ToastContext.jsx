import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

const toastStyles = {
  success: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    icon: '✓',
  },
  error: {
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    icon: '✕',
  },
  warning: {
    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    icon: '!',
  },
  info: {
    background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
    icon: 'i',
  },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => {
          const style = toastStyles[toast.type] || toastStyles.info;
          return (
            <div
              key={toast.id}
              className="toast-item"
              style={{ background: style.background }}
              onClick={() => removeToast(toast.id)}
            >
              <span className="toast-icon">{style.icon}</span>
              <span className="toast-message">{toast.message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}
