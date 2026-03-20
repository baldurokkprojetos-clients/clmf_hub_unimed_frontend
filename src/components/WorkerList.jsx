import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import Card from './ui/Card';
import Button from './ui/Button';
import WorkerStatusBadge from './WorkerStatusBadge';
import { RefreshCw, Power, WifiOff } from 'lucide-react';

const MIN_INTERVAL = 5000;
const MAX_INTERVAL = 60000;

export default function WorkerList({ compact = false }) {
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [backendError, setBackendError] = useState(false);
    const intervalRef = useRef(null);
    const currentDelay = useRef(MIN_INTERVAL);

    const scheduleNext = (delay) => {
        if (intervalRef.current) clearTimeout(intervalRef.current);
        intervalRef.current = setTimeout(fetchWorkers, delay);
    };

    const fetchWorkers = async () => {
        try {
            const res = await api.get('/workers/');
            const data = res.data || [];
            data.sort((a, b) => a.hostname.localeCompare(b.hostname, undefined, { numeric: true, sensitivity: 'base' }));
            setWorkers(data);
            setBackendError(false);
            currentDelay.current = MIN_INTERVAL;
            scheduleNext(MIN_INTERVAL);
        } catch (e) {
            console.error("Error fetching workers", e);
            setBackendError(true);
            // Exponential backoff: double delay, cap at MAX_INTERVAL
            const nextDelay = Math.min(currentDelay.current * 2, MAX_INTERVAL);
            currentDelay.current = nextDelay;
            scheduleNext(nextDelay);
        }
    };

    useEffect(() => {
        fetchWorkers();
        return () => { if (intervalRef.current) clearTimeout(intervalRef.current); };
    }, []);

    const handleRestart = async (id) => {
        if (!confirm("Solicitar reinício deste worker?")) return;
        try {
            await api.post(`/workers/${id}/restart`);
            alert("Comando de reinício enviado.");
            fetchWorkers();
        } catch (e) {
            alert("Erro ao enviar comando: " + e.message);
        }
    };

    if (compact) {
        return (
            <div className="flex flex-wrap gap-4 items-center">
                {backendError && (
                    <div className="flex items-center gap-1 text-xs text-red-400" title="Backend inacessível — tentando reconectar...">
                        <WifiOff size={12} /> Sem conexão
                    </div>
                )}
                {workers.map(w => (
                    <div key={w.id} className="flex items-center gap-3 bg-surface border border-border px-3 py-1.5 rounded-lg shadow-sm">
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-text-primary">{w.hostname}</span>
                            {w.current_job_id && (
                                <span className="text-[10px] text-blue-400 -mt-0.5">Job #{w.current_job_id}</span>
                            )}
                        </div>
                        <div className="h-5 w-px bg-border"></div>
                        <WorkerStatusBadge status={w.status} lastHeartbeat={w.last_heartbeat} />
                        <div className="h-5 w-px bg-border"></div>
                        <button
                            onClick={() => handleRestart(w.id)}
                            className="text-text-secondary hover:text-orange-500 transition-colors"
                            title="Solicitar Reinício"
                        >
                            <Power size={14} />
                        </button>
                    </div>
                ))}
                {workers.length === 0 && <span className="text-xs text-text-secondary">Nenhum worker conectado.</span>}
            </div>
        )
    }

    return (
        <Card className="mb-6">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-text-primary">Status dos Workers</h3>
                    {backendError && (
                        <span className="flex items-center gap-1 text-xs text-red-400 bg-red-400/10 border border-red-400/20 px-2 py-0.5 rounded-full" title="Backend inacessível — reconectando com backoff...">
                            <WifiOff size={11} /> Backend inacessível
                        </span>
                    )}
                </div>
                <Button variant="ghost" size="sm" onClick={fetchWorkers}><RefreshCw size={14} /></Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {workers.map(w => (
                    <div key={w.id} className="bg-background rounded-lg p-3 border border-border flex justify-between items-center">
                        <div>
                            <div className="font-bold text-text-primary mb-1">{w.hostname}</div>
                            <WorkerStatusBadge status={w.status} lastHeartbeat={w.last_heartbeat} />
                            <div className="text-xs text-text-secondary mt-1">
                                Último heartbeat: {new Date(w.last_heartbeat).toLocaleTimeString()}
                            </div>
                            {w.current_job_id && (
                                <div className="text-xs text-blue-400 mt-1">
                                    Processando Job #{w.current_job_id}
                                </div>
                            )}
                        </div>
                        {/* Control Actions */}
                        <div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-text-secondary hover:text-orange-500"
                                title="Solicitar Reinício"
                                onClick={() => handleRestart(w.id)}
                            >
                                <Power size={16} />
                            </Button>
                        </div>
                    </div>
                ))}
                {workers.length === 0 && (
                    <div className="col-span-full text-center text-text-secondary py-4">
                        Nenhum worker registrado. Inicie o script do worker.
                    </div>
                )}
            </div>
        </Card>
    );
}
