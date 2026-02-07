
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Trash2, Upload, Plus, Edit, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import EditCarteirinhaModal from '../components/EditCarteirinhaModal';
import { maskCarteirinha, validateCarteirinha } from '../utils/formatters';

export default function Carteirinhas() {
    const [carteirinhas, setCarteirinhas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState(null);
    const [overwrite, setOverwrite] = useState(false);

    // Pagination & Search state
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Filters
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        id_pagamento: '',
        paciente: ''
    });

    const limit = 10;

    // Sorting
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });

    // Edit state
    const [editingItem, setEditingItem] = useState(null);

    // Create state
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newCarteirinha, setNewCarteirinha] = useState({
        carteirinha: '',
        paciente: '',
        id_paciente: '',
        id_pagamento: '',
        status: 'ativo'
    });

    const fetchCarteirinhas = async () => {
        setLoading(true);
        try {
            const skip = (page - 1) * limit;
            const params = {
                skip,
                limit,
                search: filters.search,
                status: filters.status,
                id_pagamento: filters.id_pagamento,
                paciente: filters.paciente
            };

            const res = await api.get('/carteirinhas/', { params });
            // Backend now returns { data, total, skip, limit }
            setCarteirinhas(res.data.data || res.data); // Fallback if backend not updated instantly often cache issues
            if (res.data.total !== undefined) {
                setTotalItems(res.data.total);
                setTotalPages(Math.ceil(res.data.total / limit));
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        fetchCarteirinhas();
    }, [page, filters]); // Re-fetch on page or filters change

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedCarteirinhas = React.useMemo(() => {
        if (!carteirinhas) return [];
        let sortableItems = [...carteirinhas];
        if (sortConfig.key) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [carteirinhas, sortConfig]);

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('overwrite', overwrite);

        try {
            setLoading(true);
            await api.post('/carteirinhas/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert("Upload realizado com sucesso!");
            setFile(null);
            setPage(1); // Reset to first page
            fetchCarteirinhas();
        } catch (e) {
            alert("Erro no upload: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Excluir carteirinha?")) return;
        try {
            await api.delete(`/ carteirinhas / ${id} `);
            fetchCarteirinhas();
        } catch (e) { alert("Erro ao excluir"); }
    };

    const handleCreate = async (e) => {
        e.preventDefault();

        if (!validateCarteirinha(newCarteirinha.carteirinha)) {
            alert("Carteirinha inválida! Deve conter 21 caracteres, ex: 0000.0000.000000.00-0");
            return;
        }

        try {
            setLoading(true);
            await api.post('/carteirinhas', {
                carteirinha: newCarteirinha.carteirinha,
                paciente: newCarteirinha.paciente,
                id_paciente: newCarteirinha.id_paciente ? parseInt(newCarteirinha.id_paciente) : null,
                id_pagamento: newCarteirinha.id_pagamento ? parseInt(newCarteirinha.id_pagamento) : null,
                status: newCarteirinha.status
            });
            alert("Carteirinha criada com sucesso!");
            setShowCreateForm(false);
            setNewCarteirinha({ carteirinha: '', paciente: '', id_paciente: '', id_pagamento: '', status: 'ativo' });
            setPage(1);
            fetchCarteirinhas();
        } catch (e) {
            alert("Erro ao criar: " + (e.response?.data?.detail || e.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>Gerenciamento de Carteirinhas</h1>

            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <h3>Upload em Lote (Excel/CSV)</h3>
                <form onSubmit={handleUpload} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <input type="file" accept=".xlsx, .xls, .csv" onChange={e => setFile(e.target.files[0])} />
                    <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input type="checkbox" checked={overwrite} onChange={e => setOverwrite(e.target.checked)} style={{ width: 'auto' }} />
                        Sobrescrever tudo?
                    </label>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        <Upload size={16} style={{ marginRight: 5 }} /> Importar
                    </button>
                </form>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3>Carteirinhas Cadastradas ({totalItems})</h3>

                    <button
                        className="btn btn-primary"
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <Plus size={16} />
                        {showCreateForm ? 'Cancelar' : 'Nova Carteirinha'}
                    </button>
                </div>

                {/* Create Form */}
                {showCreateForm && (
                    <form onSubmit={handleCreate} style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                        <h4 style={{ marginBottom: '1rem' }}>Nova Carteirinha</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Carteirinha *</label>
                                <input
                                    type="text"
                                    value={newCarteirinha.carteirinha}
                                    onChange={(e) => setNewCarteirinha({ ...newCarteirinha, carteirinha: maskCarteirinha(e.target.value) })}
                                    placeholder="0000.0000.000000.00-0"
                                    required
                                    maxLength={21}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Paciente</label>
                                <input
                                    type="text"
                                    value={newCarteirinha.paciente}
                                    onChange={(e) => setNewCarteirinha({ ...newCarteirinha, paciente: e.target.value })}
                                    placeholder="Nome do paciente"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>ID Paciente</label>
                                <input
                                    type="number"
                                    value={newCarteirinha.id_paciente}
                                    onChange={(e) => setNewCarteirinha({ ...newCarteirinha, id_paciente: e.target.value })}
                                    placeholder="123"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>ID Pagamento</label>
                                <input
                                    type="number"
                                    value={newCarteirinha.id_pagamento}
                                    onChange={(e) => setNewCarteirinha({ ...newCarteirinha, id_pagamento: e.target.value })}
                                    placeholder="456"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Status</label>
                                <select
                                    value={newCarteirinha.status}
                                    onChange={(e) => setNewCarteirinha({ ...newCarteirinha, status: e.target.value })}
                                >
                                    <option value="ativo">Ativo</option>
                                    <option value="inativo">Inativo</option>
                                </select>
                            </div>
                        </div>
                        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button type="button" className="btn" onClick={() => setShowCreateForm(false)}>Cancelar</button>
                            <button type="submit" className="btn btn-primary" disabled={loading}>Salvar</button>
                        </div>
                    </form>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="search-box relative">
                        <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Busca Geral..."
                            value={filters.search}
                            onChange={(e) => { setFilters({ ...filters, search: e.target.value }); setPage(1); }}
                            className="w-full bg-slate-800 border border-slate-700 text-white rounded-md py-2 pl-10 pr-4 focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    <input
                        type="text"
                        placeholder="Filtrar Paciente"
                        value={filters.paciente}
                        onChange={(e) => { setFilters({ ...filters, paciente: e.target.value }); setPage(1); }}
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
                    />

                    <input
                        type="text"
                        placeholder="ID Pagamento"
                        value={filters.id_pagamento}
                        onChange={(e) => { setFilters({ ...filters, id_pagamento: e.target.value }); setPage(1); }}
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
                    />

                    <div className="flex gap-2">
                        <select
                            value={filters.status}
                            onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setPage(1); }}
                            className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
                        >
                            <option value="">Status: Todos</option>
                            <option value="ativo">Ativo</option>
                            <option value="inativo">Inativo</option>
                        </select>

                        <button
                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-md transition-colors"
                            onClick={() => setFilters({ search: '', status: '', id_pagamento: '', paciente: '' })}
                            title="Limpar Filtros"
                        >
                            Limpar
                        </button>
                    </div>
                </div>

                <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
                                <th style={{ width: '50px', cursor: 'pointer', padding: '0.8rem' }} onClick={() => handleSort('id')}>
                                    ID {sortConfig.key === 'id' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                                </th>
                                <th style={{ cursor: 'pointer', padding: '0.8rem' }} onClick={() => handleSort('carteirinha')}>
                                    Carteirinha {sortConfig.key === 'carteirinha' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                                </th>
                                <th style={{ cursor: 'pointer', padding: '0.8rem' }} onClick={() => handleSort('paciente')}>
                                    Paciente {sortConfig.key === 'paciente' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                                </th>
                                <th style={{ width: '100px', cursor: 'pointer', padding: '0.8rem' }} onClick={() => handleSort('id_paciente')}>
                                    ID Paciente {sortConfig.key === 'id_paciente' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                                </th>
                                <th style={{ width: '120px', cursor: 'pointer', padding: '0.8rem' }} onClick={() => handleSort('id_pagamento')}>
                                    ID Pagamento {sortConfig.key === 'id_pagamento' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                                </th>
                                <th style={{ width: '80px', cursor: 'pointer', padding: '0.8rem' }} onClick={() => handleSort('status')}>
                                    Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                                </th>
                                <th style={{ width: '100px', padding: '0.8rem' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedCarteirinhas.map(c => (
                                <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                    <td style={{ padding: '0.8rem' }}>{c.id}</td>
                                    <td style={{ padding: '0.8rem' }}>{c.carteirinha}</td>
                                    <td style={{ padding: '0.8rem' }}>{c.paciente}</td>
                                    <td style={{ padding: '0.8rem' }}>{c.id_paciente || '-'}</td>
                                    <td style={{ padding: '0.8rem' }}>{c.id_pagamento || '-'}</td>
                                    <td style={{ padding: '0.8rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '4px',
                                            fontSize: '0.85rem',
                                            background: c.status === 'ativo' ? '#10b981' : '#6b7280',
                                            color: 'white'
                                        }}>
                                            {c.status || 'ativo'}
                                        </span>
                                    </td>
                                    <td style={{ display: 'flex', gap: '0.5rem', padding: '0.8rem' }}>
                                        <button className="btn-icon" onClick={() => setEditingItem(c)} title="Editar">
                                            <Edit size={16} color="#3b82f6" />
                                        </button>
                                        <button className="btn-icon" onClick={() => handleDelete(c.id)} title="Excluir">
                                            <Trash2 size={16} color="#ef4444" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {sortedCarteirinhas.length === 0 && (
                                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '1rem' }}>Nenhum registro encontrado</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                    <span>Página {page} de {totalPages || 1}</span>
                    <div style={{ display: 'flex', gap: '0.2rem' }}>
                        <button
                            className="btn"
                            disabled={page <= 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            style={{ padding: '0.5rem' }}
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            className="btn"
                            disabled={page >= totalPages}
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            style={{ padding: '0.5rem' }}
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {editingItem && (
                <EditCarteirinhaModal
                    carteirinha={editingItem}
                    onClose={() => setEditingItem(null)}
                    onSave={fetchCarteirinhas}
                />
            )}
        </div>
    );
}
