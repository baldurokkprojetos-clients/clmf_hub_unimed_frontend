import React from 'react';
import Badge from './ui/Badge';
import { Activity, Power, AlertTriangle, Cpu } from 'lucide-react';

const WorkerStatusBadge = ({ status, lastHeartbeat }) => {
    const getStatusConfig = () => {
        // Check if offline based on time (if not handled by parent)
        const now = new Date();
        const last = new Date(lastHeartbeat);
        const diff = (now - last) / 1000; // seconds

        // If no heartbeat for > 60s, assume offline regardless of db status
        if (diff > 60) {
            return { variant: 'error', icon: Power, label: 'Offline', text: 'text-error' };
        }

        switch (status) {
            case 'idle':
                return { variant: 'success', icon: Activity, label: 'Online/Ocioso', text: 'text-success' };
            case 'processing':
                return { variant: 'info', icon: Cpu, label: 'Processando', text: 'text-info' };
            case 'error':
                return { variant: 'danger', icon: AlertTriangle, label: 'Erro', text: 'text-error' };
            default:
                // Default to offline if unknown status
                return { variant: 'default', icon: Power, label: status || 'Desconhecido', text: 'text-text-secondary' };
        }
    };

    const config = getStatusConfig();
    const Icon = config.icon;

    return (
        <div className={`flex items-center gap-1.5 ${config.text}`}>
            <Icon size={14} />
            <span className="text-xs font-medium">{config.label}</span>
        </div>
    );
};

export default WorkerStatusBadge;
