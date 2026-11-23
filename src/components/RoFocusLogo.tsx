import React from 'react';

export interface RoFocusLogoProps {
  className?: string;
  size?: number;
  variant?: 'mark' | 'full';
}

export const RoFocusLogo: React.FC<RoFocusLogoProps> = ({
  className = '',
  size = 32,
  variant = 'mark'
}) => {
  return (
    <div className={`brand-logo ${className}`}>
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <path d="M20 12H12C11.4477 12 11 12.4477 11 13V21" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M44 12H52C52.5523 12 53 12.4477 53 13V21" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M44 52H52C52.5523 52 53 51.5523 53 51V43" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M20 52H12C11.4477 52 11 51.5523 11 51V43" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="32" cy="32" r="5" fill="var(--brown)" />
        <circle cx="32" cy="32" r="10.5" stroke="currentColor" strokeWidth="1.4" strokeDasharray="3 3" opacity="0.65" />
      </svg>
      {variant === 'full' && (
        <div className="brand-words">
          <span className="brand-name">RoFocus</span>
          <span className="brand-tag">Return to what matters</span>
        </div>
      )}
    </div>
  );
};

export default RoFocusLogo;
