import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Card from './ui/Card';
import Button from './ui/Button';
import WorkerStatusBadge from './WorkerStatusBadge';
import { RefreshCw, Power } from 'lucide-react';

export default function WorkerList({ compact = false }) {
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchWorkers = async () => {
        try {
            const res = await api.get('/workers/');
            setWorkers(res.data);
        } catch (e) {
            console.error("Error fetching workers", e);
        }
    };

    useEffect(() => {
        fetchWorkers();
        const interval = setInterval(fetchWorkers, 5000);
        return () => clearInterval(interval);
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
            <div className="flex flex-wrap gap-4">
                {workers.map(w => (
                    <div key={w.id} className="flex items-center gap-2 bg-surface border border-border px-3 py-1.5 rounded-full">
                        <span className="text-xs font-bold text-text-primary">{w.hostname}</span>
                        <div className="h-4 w-px bg-border mx-1"></div>
                        <WorkerStatusBadge status={w.status} lastHeartbeat={w.last_heartbeat} />
                    </div>
                ))}
                {workers.length === 0 && <span className="text-xs text-text-secondary">Nenhum worker conectado.</span>}
            </div>
        )
    }

    return (
        <Card className="mb-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-text-primary">Status dos Workers</h3>
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
