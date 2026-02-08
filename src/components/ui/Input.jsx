import React from 'react';

export function Input({ className = '', ...props }) {
    return (
        <input
            className={`
        w-full bg-slate-900 border border-border rounded-lg px-4 py-2.5
        text-text-primary placeholder-slate-500
        focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
        transition-all duration-200
        ${className}
      `}
            {...props}
        />
    );
}

export function Select({ children, className = '', ...props }) {
    return (
        <select
            className={`
          w-full bg-slate-900 border border-border rounded-lg px-4 py-2.5
          text-text-primary
          focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
          transition-all duration-200
          appearance-none
          ${className}
        `}
            {...props}
        >
            {children}
        </select>
    );
}
