import React, { useState, useEffect } from 'react';
import { listPei, overridePei } from '../services/pei';
import { X, Save, Edit2 } from 'lucide-react';

export default function PeiModal({ onClose }) {
    const [data, setData] = useState([]);
    const [activeTab, setActiveTab] = useState('validados'); // validados, pendentes
    const [loading, setLoading] = useState(true);
    const [editingItem, setEditingItem] = useState(null);
    const [editValue, setEditValue] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await listPei();
            setData(res);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!editingItem) return;
        try {
            await overridePei(editingItem.base_guia_id, editValue);
            setEditingItem(null);
            loadData(); // Reload to see changes
        } catch (error) {
            alert("Erro ao salvar: " + error.message);
        }
    };

    const filteredData = data.filter(item => {
        if (activeTab === 'validados') return item.status === 'Validado';
        return item.status === 'Pendente';
    });

    return (
        <div className="modal-overlay">
            <div className="modal-content glass-panel" style={{ maxWidth: '900px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3>PEI por Paciente</h3>
                    <button onClick={onClose} className="btn-icon"><X size={20} /></button>
                </div>

                <div className="tabs">
                    <button
                        className={`tab ${activeTab === 'validados' ? 'active' : ''}`}
                        onClick={() => setActiveTab('validados')}
                    >
                        Validados
                    </button>
                    <button
                        className={`tab ${activeTab === 'pendentes' ? 'active' : ''}`}
                        onClick={() => setActiveTab('pendentes')}
                    >
                        Pendentes
                    </button>
                </div>

                <div className="table-responsive">
                    <table className="custom-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid #333' }}>
                                <th style={{ padding: '10px' }}>Paciente</th>
                                <th style={{ padding: '10px' }}>Carteirinha</th>
                                <th style={{ padding: '10px' }}>Código</th>
                                <th style={{ padding: '10px' }}>PEI Semanal</th>
                                <th style={{ padding: '10px' }}>Validade PEI</th>
                                <th style={{ padding: '10px' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map(item => (
                                <tr key={item.id} style={{ borderBottom: '1px solid #222' }}>
                                    <td style={{ padding: '10px' }}>{item.paciente}</td>
                                    <td style={{ padding: '10px' }}>{item.carteirinha}</td>
                                    <td style={{ padding: '10px' }}>{item.codigo_terapia}</td>
                                    <td style={{ padding: '10px' }}>
                                        {/* Show editing input if this is the item */}
                                        {editingItem?.id === item.id ? (
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={editValue}
                                                onChange={e => setEditValue(e.target.value)}
                                                style={{ width: '80px', padding: '5px', background: '#333', color: 'white', border: '1px solid #555' }}
                                            />
                                        ) : (
                                            item.pei_semanal
                                        )}
                                    </td>
                                    <td style={{ padding: '10px' }}>{item.validade ? new Date(item.validade).toLocaleDateString() : '-'}</td>
                                    <td style={{ padding: '10px' }}>
                                        {editingItem?.id === item.id ? (
                                            <button onClick={handleSave} className="action-btn" title="Salvar">
                                                <Save size={16} />
                                            </button>
                                        ) : (
                                            <button onClick={() => {
                                                setEditingItem(item);
                                                setEditValue(item.pei_semanal);
                                            }} className="action-btn" title="Editar">
                                                <Edit2 size={16} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredData.length === 0 && (
                                <tr>
                                    <td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#666' }}>Nenhum registro encontrado.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
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
                    display: flex;
                    flex-direction: column;
                }
                .tabs {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 1rem;
                    border-bottom: 1px solid #333;
                }
                .tab {
                    padding: 0.5rem 1rem;
                    background: none;
                    border: none;
                    color: #aaa;
                    cursor: pointer;
                    border-bottom: 2px solid transparent;
                }
                .tab.active {
                    color: white;
                    border-bottom-color: #00d2ff;
                }
                 .btn-icon {
                    background: none;
                    border: none;
                    color: #aaa;
                    cursor: pointer;
                }
                .btn-icon:hover { color: white; }
                 .action-btn {
                    background: none;
                    border: none;
                    color: #00d2ff;
                    cursor: pointer;
                 }
                 .action-btn:hover { color: #50e0ff; }
            `}</style>
        </div>
    )
}
