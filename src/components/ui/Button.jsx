import React from 'react';
import { Loader2 } from 'lucide-react';

const variants = {
    primary: 'bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20',
    secondary: 'bg-surface border border-border hover:bg-slate-700 text-text-primary',
    danger: 'bg-error hover:bg-red-600 text-white shadow-lg shadow-error/20',
    ghost: 'bg-transparent hover:bg-slate-800 text-text-secondary hover:text-text-primary',
    success: 'bg-success hover:bg-emerald-600 text-white shadow-lg shadow-success/20'
};

const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
};

export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    isLoading = false,
    disabled,
    ...props
}) {
    return (
        <button
            className={`
        flex items-center justify-center gap-2 
        rounded-lg font-medium transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
            disabled={isLoading || disabled}
            {...props}
        >
            {isLoading && <Loader2 className="animate-spin" size={16} />}
            {children}
        </button>
    );
}
