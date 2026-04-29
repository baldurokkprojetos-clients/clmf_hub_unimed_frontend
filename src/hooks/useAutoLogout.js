import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const TIMEOUT_MS = 20 * 60 * 1000; // 20 minutes

export const useAutoLogout = () => {
    const navigate = useNavigate();
    const timeoutRef = useRef(null);

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('permitir_protocolo');
        
        if (!window.location.pathname.includes('/login')) {
            navigate('/login');
        }
    };

    const resetTimer = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        
        // Only start timer if user is logged in
        if (localStorage.getItem('token')) {
            timeoutRef.current = setTimeout(logout, TIMEOUT_MS);
        }
    };

    useEffect(() => {
        // Initial setup
        resetTimer();

        // Events to monitor for activity
        const events = [
            'mousemove',
            'mousedown',
            'click',
            'scroll',
            'keypress',
            'touchstart'
        ];

        // Attach event listeners
        events.forEach(event => {
            window.addEventListener(event, resetTimer);
        });

        // Cleanup
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            events.forEach(event => {
                window.removeEventListener(event, resetTimer);
            });
        };
    }, [navigate]);

    return null;
};
