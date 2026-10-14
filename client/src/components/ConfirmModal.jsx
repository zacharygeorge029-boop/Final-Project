import React from 'react';

const NAVY = '#0f172a';
const GOLD = '#d4af37';
const GOLD_GRADIENT = 'linear-gradient(135deg, #d4af37 0%, #f5d76e 100%)';

export default function ConfirmModal({
  show,
  title = 'Are you sure?',
  message = '',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  icon = '⚠️',
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!show) return null;

  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        background: 'rgba(15,23,42,0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-slide-up"
        style={{
          width: '100%',
          maxWidth: '460px',
          background: 'rgba(15,23,42,0.97)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          border: `1px solid rgba(212,175,55,0.3)`,
          boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
          padding: '32px',
          color: '#fff',
        }}
      >
        <div className="text-center mb-3">
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              margin: '0 auto 16px',
              background: danger
                ? 'linear-gradient(135deg, rgba(220,53,69,0.15), rgba(212,175,55,0.12))'
                : 'linear-gradient(135deg, rgba(212,175,55,0.18), rgba(245,215,110,0.12))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.8rem',
              border: `1.5px solid ${danger ? 'rgba(220,53,69,0.3)' : 'rgba(212,175,55,0.35)'}`,
            }}
          >
            {icon}
          </div>
          <h4 className="fw-bold mb-2" style={{ color: '#fff' }}>
            {title}
          </h4>
          {message && (
            <p className="mb-0" style={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>
              {message}
            </p>
          )}
        </div>

        <div className="d-flex gap-2 mt-4">
          <button
            type="button"
            className="btn flex-grow-1 py-2 fw-bold rounded-pill"
            style={{
              background: 'rgba(255,255,255,0.08)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className="btn flex-grow-1 py-2 fw-bold rounded-pill"
            style={{
              background: danger
                ? 'linear-gradient(135deg, #dc3545 0%, #b02a37 100%)'
                : GOLD_GRADIENT,
              color: danger ? '#fff' : NAVY,
              border: 'none',
              boxShadow: danger
                ? '0 4px 14px rgba(220,53,69,0.4)'
                : '0 4px 14px rgba(212,175,55,0.4)',
            }}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                {confirmText}...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
