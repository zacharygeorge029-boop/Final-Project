import React, { useState, useEffect } from 'react';

const NAVY = '#0f172a';
const GOLD = '#d4af37';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      style={{
        position: 'fixed',
        bottom: '28px',
        right: '28px',
        zIndex: 999,
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        border: 'none',
        background: 'linear-gradient(135deg, #d4af37 0%, #f5d76e 100%)',
        color: NAVY,
        fontSize: '1.4rem',
        fontWeight: 700,
        cursor: 'pointer',
        boxShadow: '0 8px 24px rgba(212,175,55,0.45)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        pointerEvents: visible ? 'auto' : 'none',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px) scale(1.08)';
        e.currentTarget.style.boxShadow = '0 12px 30px rgba(212,175,55,0.6)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = visible ? 'translateY(0)' : 'translateY(20px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(212,175,55,0.45)';
      }}
    >
      ↑
    </button>
  );
}
