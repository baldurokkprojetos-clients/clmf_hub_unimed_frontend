import React, { useState, useEffect } from 'react';
import { listPei, overridePei, getPeiStats, exportPei } from '../services/pei';
import { Edit2, Save, Filter, X, Download, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import Pagination from '../components/Pagination';

function StatCard({ title, count, color, icon: Icon, onClick }) {
    return (
        <div
            className="stat-card glass-panel"
            style={{
                padding: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                cursor: 'pointer',
                borderLeft: `4px solid ${color}`
            }}
            onClick={onClick}
        >
            <div style={{ background: `${color}20`, padding: '10px', borderRadius: '50%' }}>
                <Icon size={24} color={color} />
            </div>
            <div>
                <div style={{ fontSize: '0.9rem', color: '#aaa' }}>{title}</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{count}</div>
            </div>
        </div>
    );
}

export default function GestaoPei() {
    // Data State
    const [data, setData] = useState([]);
    const [stats, setStats] = useState({ total: 0, vencidos: 0, vence_d7: 0, vence_d30: 0 });
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(true);

    // Filters & Pagination
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(50);
    const [filters, setFilters] = useState({
        search: '',
        status: '', // '', Validado, Pendente
        vencimento_filter: '', // '', vencidos, vence_d7, vence_d30
        validade_start: '',
        validade_end: ''
    });

    // Editing
    const [editingItem, setEditingItem] = useState(null);
    const [editValue, setEditValue] = useState('');

    useEffect(() => {
        loadStats();
    }, []);

    useEffect(() => {
        loadData();
    }, [page, pageSize, filters]);

    const loadStats = async () => {
        try {
            const res = await getPeiStats();
            setStats(res);
        } catch (error) {
            console.error(error);
        }
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await listPei({
                page,
                pageSize,
                ...filters
            });
            setData(res.data);
            setTotalItems(res.total);
            setPage(res.page); // ensure sync
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
            loadData();
            loadStats(); // refresh stats
        } catch (error) {
            alert("Erro ao salvar: " + error.message);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPage(1); // reset to first page
    };

    const applyQuickFilter = (type) => {
        handleFilterChange('vencimento_filter', type);
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '2rem' }}>Gestão PEI</h1>
            </div>

            {/* Pending Alert */}
            {stats.pendentes > 0 && (
                <div style={{ background: 'rgba(245, 158, 11, 0.15)', borderLeft: '4px solid #f59e0b', color: '#f59e0b', padding: '1rem', borderRadius: '4px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <AlertCircle size={24} />
                    <div>
                        <strong>Atenção!</strong> Existem {stats.pendentes} guias com PEI pendente de cálculo ou validação. Por favor, verifique os itens abaixo.
                    </div>
                </div>
            )}

            {/* Dashboard Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <StatCard
                    title="Total de Pacientes"
                    count={stats.total}
                    color="#00d2ff"
                    icon={CheckCircle}
                    onClick={() => setFilters({ status: '', search: '', vencimento_filter: '', validade_start: '', validade_end: '' })}
                />
                <StatCard
                    title="Vencidos"
                    count={stats.vencidos}
                    color="#ef4444"
                    icon={AlertCircle}
                    onClick={() => applyQuickFilter('vencidos')}
                />
                <StatCard
                    title="Vence em 7 dias"
                    count={stats.vence_d7}
                    color="#f59e0b"
                    icon={Clock}
                    onClick={() => applyQuickFilter('vence_d7')}
                />
                <StatCard
                    title="Vence em 30 dias"
                    count={stats.vence_d30}
                    color="#10b981"
                    icon={Clock}
                    onClick={() => applyQuickFilter('vence_d30')}
                />
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                {/* Filter Bar */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
                    <div className="filter-group">
                        <label>Buscar</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                placeholder="Paciente, Carteirinha..."
                                value={filters.search}
                                onChange={e => handleFilterChange('search', e.target.value)}
                            />
                            <Filter size={16} className="input-icon" />
                        </div>
                    </div>

                    <div className="filter-group">
                        <label>Status</label>
                        <select
                            value={filters.status}
                            onChange={e => handleFilterChange('status', e.target.value)}
                        >
                            <option value="">Todos</option>
                            <option value="Validado">Validado</option>
                            <option value="Pendente">Pendente</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Vencimento</label>
                        <select
                            value={filters.vencimento_filter}
                            onChange={e => handleFilterChange('vencimento_filter', e.target.value)}
                        >
                            <option value="">Qualquer data</option>
                            <option value="vencidos">Vencidos</option>
                            <option value="vence_d7">Próx. 7 dias</option>
                            <option value="vence_d30">Próx. 30 dias</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Validade De</label>
                        <input
                            type="date"
                            value={filters.validade_start}
                            onChange={e => handleFilterChange('validade_start', e.target.value)}
                        />
                    </div>
                    <div className="filter-group">
                        <label>Até</label>
                        <input
                            type="date"
                            value={filters.validade_end}
                            onChange={e => handleFilterChange('validade_end', e.target.value)}
                        />
                    </div>

                    <button
                        className="btn-text"
                        onClick={() => setFilters({ status: '', search: '', vencimento_filter: '', validade_start: '', validade_end: '' })}
                        style={{ marginTop: '24px', color: '#f59e0b' }}
                    >
                        Limpar Filtros
                    </button>

                    <button className="btn-primary" onClick={() => exportPei(filters)} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '18px' }}>
                        <Download size={18} /> Exportar Excel
                    </button>
                </div>

                {loading ? <p>Carregando...</p> : (
                    <>
                        <div className="table-responsive">
                            <table className="custom-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', borderBottom: '1px solid #333' }}>
                                        <th style={{ padding: '10px' }}>Paciente</th>
                                        <th style={{ padding: '10px' }}>Carteirinha</th>
                                        <th style={{ padding: '10px' }}>Código Terapia</th>
                                        <th style={{ padding: '10px' }}>PEI Semanal</th>
                                        <th style={{ padding: '10px' }}>Validade PEI</th>
                                        <th style={{ padding: '10px' }}>Status</th>
                                        <th style={{ padding: '10px' }}>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map(item => (
                                        <tr key={item.id} style={{ borderBottom: '1px solid #222' }}>
                                            <td style={{ padding: '10px' }}>{item.paciente}</td>
                                            <td style={{ padding: '10px' }}>{item.carteirinha}</td>
                                            <td style={{ padding: '10px' }}>{item.codigo_terapia}</td>
                                            <td style={{ padding: '10px' }}>
                                                {/* Edit Mode */}
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
                                                <span className={`status-badge ${item.status === 'Validado' ? 'status-success' : 'status-warning'}`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '10px' }}>
                                                {editingItem?.id === item.id ? (
                                                    <div style={{ display: 'flex', gap: '5px' }}>
                                                        <button onClick={handleSave} className="action-btn" title="Salvar">
                                                            <Save size={16} />
                                                        </button>
                                                        <button onClick={() => setEditingItem(null)} className="action-btn" title="Cancelar" style={{ color: '#aaa' }}>
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => {
                                                            setEditingItem(item);
                                                            setEditValue(item.pei_semanal);
                                                        }}
                                                        className="action-btn"
                                                        title="Editar"
                                                        disabled={item.status !== 'Pendente'}
                                                        style={{ opacity: item.status !== 'Pendente' ? 0.3 : 1, cursor: item.status !== 'Pendente' ? 'not-allowed' : 'pointer' }}
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {data.length === 0 && (
                                        <tr>
                                            <td colSpan="7" style={{ padding: '20px', textAlign: 'center', color: '#666' }}>Nenhum registro encontrado.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <Pagination
                            currentPage={page}
                            totalItems={totalItems}
                            pageSize={pageSize}
                            onPageChange={setPage}
                            onPageSizeChange={setPageSize}
                        />
                    </>
                )}
            </div>
            <style>{`
                .filter-group {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                }
                .filter-group label {
                    font-size: 0.8rem;
                    color: #aaa;
                }
                .filter-group input, .filter-group select {
                    background: #222;
                    border: 1px solid #444;
                    color: white;
                    padding: 8px 12px;
                    border-radius: 4px;
                    min-width: 150px;
                }
                .filter-group .input-icon {
                    position: absolute;
                    right: 10px;
                    top: 10px;
                    color: #666;
                }
                 .action-btn {
                    background: none;
                    border: none;
                    color: #00d2ff;
                    cursor: pointer;
                    padding: 4px;
                 }
                 .action-btn:hover { color: #50e0ff; }
                 .btn-primary {
                     background: #00d2ff;
                     color: #0f172a;
                     border: none;
                     padding: 8px 16px;
                     border-radius: 4px;
                     font-weight: bold;
                     cursor: pointer;
                 }
                 .btn-text {
                     background: none;
                     border: none;
                     cursor: pointer;
                     text-decoration: underline;
                 }
                 .status-badge {
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-size: 0.8rem;
                 }
                 .status-success { background: rgba(16, 185, 129, 0.2); color: #10b981; }
                 .status-warning { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
            `}</style>
        </div>
    );
}
