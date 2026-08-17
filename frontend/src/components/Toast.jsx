import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast = ({ toasts, onDismiss }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type || 'info'}`}>
          {t.type === 'success' && <CheckCircle2 size={18} color="#10B981" />}
          {t.type === 'error' && <AlertCircle size={18} color="#EF4444" />}
          {(!t.type || t.type === 'info') && <Info size={18} color="#F2555F" />}
          
          <span style={{ flex: 1 }}>{t.message}</span>

          <button
            onClick={() => onDismiss(t.id)}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.6)',
              cursor: 'pointer',
              display: 'flex',
              padding: '2px'
            }}
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast;
