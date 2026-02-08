/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#0f172a', // slate-900
                surface: '#1e293b',    // slate-800
                primary: {
                    DEFAULT: '#3b82f6', // blue-500
                    hover: '#2563eb',   // blue-600
                    foreground: '#ffffff'
                },
                secondary: {
                    DEFAULT: '#64748b', // slate-500
                    hover: '#475569',   // slate-600
                    foreground: '#ffffff'
                },
                success: '#10b981', // emerald-500
                error: '#ef4444',   // red-500
                text: {
                    primary: '#f8fafc',   // slate-50
                    secondary: '#94a3b8', // slate-400
                },
                border: '#334155', // slate-700
            }
        },
    },
    plugins: [],
}
