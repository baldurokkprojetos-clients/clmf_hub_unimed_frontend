import React from 'react';

export default function Card({ children, className = '', noPadding = false }) {
    return (
        <div className={`
      bg-surface/50 backdrop-blur-sm border border-border rounded-xl shadow-sm
      ${noPadding ? '' : 'p-6'}
      ${className}
    `}>
            {children}
        </div>
    );
}
