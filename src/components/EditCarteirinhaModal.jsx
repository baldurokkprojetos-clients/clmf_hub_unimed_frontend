import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { X, Save } from 'lucide-react';

export default function EditCarteirinhaModal({ carteirinha, onClose, onSave }) {
    const [formData, setFormData] = useState({
        carteirinha: '',
        paciente: '',
        id_paciente: '',
        id_pagamento: '',
        status: 'ativo'
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (carteirinha) {
            setFormData({
                carteirinha: carteirinha.carteirinha,
                paciente: carteirinha.paciente,
                id_paciente: carteirinha.id_paciente || '',
                id_pagamento: carteirinha.id_pagamento || '',
                status: carteirinha.status || 'ativo'
            });
        }
    }, [carteirinha]);

    const validateFormat = (code) => {
        if (code.length !== 21) return false;
        if (code[4] !== '.' || code[9] !== '.' || code[16] !== '.' || code[19] !== '-') return false;
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateFormat(formData.carteirinha)) {
            alert("Carteirinha inválida! Deve conter 21 caracteres, ex: 0064.8000.400948.00-5");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                carteirinha: formData.carteirinha,
                paciente: formData.paciente,
                id_paciente: formData.id_paciente ? parseInt(formData.id_paciente) : null,
                id_pagamento: formData.id_pagamento ? parseInt(formData.id_pagamento) : null,
                status: formData.status
            };
            await api.put(`/carteirinhas/${carteirinha.id}`, payload);
            onSave();
            onClose();
        } catch (error) {
            alert("Erro ao salvar: " + (error.response?.data?.detail || error.message));
        } finally {
            setLoading(false);
        }
    };

    if (!carteirinha) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content glass-panel" style={{ maxWidth: '500px', width: '90%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3>Editar Carteirinha</h3>
                    <button onClick={onClose} className="btn-icon"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label>Carteirinha</label>
                        <input
                            type="text"
                            value={formData.carteirinha}
                            onChange={e => setFormData({ ...formData, carteirinha: e.target.value })}
                            required
                        />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label>Paciente</label>
                        <input
                            type="text"
                            value={formData.paciente}
                            onChange={e => setFormData({ ...formData, paciente: e.target.value })}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label>ID Paciente</label>
                            <input
                                type="number"
                                value={formData.id_paciente}
                                onChange={e => setFormData({ ...formData, id_paciente: e.target.value })}
                                placeholder="123"
                            />
                        </div>
                        <div>
                            <label>ID Pagamento</label>
                            <input
                                type="number"
                                value={formData.id_pagamento}
                                onChange={e => setFormData({ ...formData, id_pagamento: e.target.value })}
                                placeholder="456"
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label>Status</label>
                        <select
                            value={formData.status}
                            onChange={e => setFormData({ ...formData, status: e.target.value })}
                        >
                            <option value="ativo">Ativo</option>
                            <option value="inativo">Inativo</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button type="button" onClick={onClose} className="btn" style={{ background: '#3d3d3d' }}>Cancelar</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            <Save size={16} style={{ marginRight: 5 }} /> Salvar
                        </button>
                    </div>
                </form>
            </div>

            <style>{`
                .modal-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.7);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    backdrop-filter: blur(4px);
                }
                .modal-content {
                    padding: 2rem;
                    background: #1e1e1e;
                    border: 1px solid #333;
                    border-radius: 8px;
                }
                .btn-icon {
                    background: none;
                    border: none;
                    color: #aaa;
                    cursor: pointer;
                }
                .btn-icon:hover { color: white; }
            `}</style>
        </div>
    );
}
