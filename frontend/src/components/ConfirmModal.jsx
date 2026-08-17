import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, X, Trash2 } from 'lucide-react';

export const ConfirmModal = ({
  isOpen,
  title = 'Remove recipe?',
  message = 'Are you sure you want to remove this recipe from your stash? This action cannot be undone.',
  confirmText = 'Remove Recipe',
  cancelText = 'Cancel',
  isDanger = true,
  onConfirm,
  onCancel,
  isProcessing = false,
}) => {
  // Lock body scroll and listen for Escape key
  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow || '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const modalContent = (
    <div className="recipe-modal-overlay" onClick={onCancel}>
      <div
        className="modal-dialog"
        style={{
          maxWidth: '460px',
          width: '100%',
          backgroundColor: 'var(--bg-white)',
          borderRadius: '28px',
          padding: '1.75rem',
          boxShadow: 'var(--shadow-modal)',
          border: '1px solid var(--border-warm)',
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: isDanger ? '#FEE2E2' : 'var(--bg-peach)',
                color: isDanger ? 'var(--danger)' : 'var(--primary-coral)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <AlertTriangle size={20} />
            </div>
            <h3
              id="confirm-modal-title"
              className="font-serif"
              style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-dark)' }}
            >
              {title}
            </h3>
          </div>

          <button
            className="card-mini-btn"
            onClick={onCancel}
            aria-label="Close dialog"
            style={{ width: '32px', height: '32px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ marginBottom: '1.75rem' }}>
          <p style={{ color: 'var(--text-body)', fontSize: '0.96rem', lineHeight: 1.6 }}>
            {message}
          </p>
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn-stash-secondary"
            onClick={onCancel}
            disabled={isProcessing}
            style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}
          >
            {cancelText}
          </button>

          <button
            id="confirm-delete-btn"
            type="button"
            className={isDanger ? 'btn-danger-restrained' : 'btn-stash-primary'}
            onClick={onConfirm}
            disabled={isProcessing}
            style={{ padding: '0.6rem 1.3rem', fontSize: '0.9rem' }}
          >
            {isDanger && <Trash2 size={15} />}
            <span>{isProcessing ? 'Removing...' : confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ConfirmModal;
