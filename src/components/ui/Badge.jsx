import React from 'react';

const variants = {
    default: 'bg-slate-700 text-slate-300',
    success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    error: 'bg-red-500/10 text-red-400 border border-red-500/20',
    info: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
};

export default function Badge({ children, variant = 'default', className = '' }) {
    return (
        <span className={`
      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
      ${variants[variant] || variants.default}
      ${className}
    `}>
            {children}
        </span>
    );
}
