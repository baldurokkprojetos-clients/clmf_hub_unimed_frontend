/* 
  =========================================
  CLMF HUB Design System - Tailwind Config Export
  =========================================
  Export this object into the 'theme.extend' block of 
  your tailwind.config.js file to reuse the theme colors.
*/

module.exports = {
  colors: {
    background: '#0f172a', // slate-900
    surface: '#1e293b',    // slate-800
    primary: {
      DEFAULT: '#3b82f6',  // blue-500
      hover: '#2563eb',    // blue-600
      foreground: '#ffffff'
    },
    secondary: {
      DEFAULT: '#64748b',  // slate-500
      hover: '#475569',    // slate-600
      foreground: '#ffffff'
    },
    success: '#10b981',    // emerald-500
    error: '#ef4444',      // red-500
    text: {
      primary: '#f8fafc',  // slate-50
      secondary: '#94a3b8',// slate-400
    },
    border: '#334155',     // slate-700
  }
};
