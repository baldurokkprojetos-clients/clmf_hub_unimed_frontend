import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Pagination from '../components/Pagination';
import { Download, Filter, X, Calendar } from 'lucide-react';
import { formatDate, formatDateTime } from '../utils/formatters';

export default function BaseGuias() {
    const [guias, setGuias] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalItems, setTotalItems] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);
    const [carteirinhas, setCarteirinhas] = useState([]);

    const username = localStorage.getItem('username') || 'Usuário';

    const [filters, setFilters] = useState({
        created_at_start: '',
        created_at_end: '',
        carteirinha_id: ''
    });

    // Sorting
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });


    // Fetch Carteirinhas for select
    useEffect(() => {
        api.get('/carteirinhas/?limit=1000').then(res => {
            setCarteirinhas(res.data.data || res.data);
        }).catch(console.error);
    }, []);

    // Fetch Guias with effect on dependencies
    useEffect(() => {
        fetchGuias();
    }, [page, pageSize, filters]);

    const fetchGuias = async () => {
        setLoading(true);
        try {
            const params = {
                limit: pageSize,
                skip: (page - 1) * pageSize,
            };

            // Clean filters
            if (filters.status) params.status = filters.status;
            if (filters.created_at_start) params.created_at_start = filters.created_at_start;
            if (filters.created_at_end) params.created_at_end = filters.created_at_end;
            // Ensure ID is passed correctly (not empty string)
            if (filters.carteirinha_id && filters.carteirinha_id !== "") {
                params.carteirinha_id = parseInt(filters.carteirinha_id);
            }

            const res = await api.get('/guias/', { params });

            if (res.data.data) {
                setGuias(res.data.data);
                setTotalItems(res.data.total);
            } else {
                setGuias(res.data);
                setTotalItems(res.data.length);
            }
        } catch (error) {
            console.error("Error fetching guias", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedGuias = React.useMemo(() => {
        if (!guias) return [];
        let sortableItems = [...guias];
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
    }, [guias, sortConfig]);

    const handleClearFilters = () => {
        setFilters({
            created_at_start: '',
            created_at_end: '',
            carteirinha_id: ''
        });
        setPage(1);
    };

    const handleExport = async () => {
        try {
            const params = {};
            if (filters.created_at_start) params.created_at_start = filters.created_at_start;
            if (filters.created_at_end) params.created_at_end = filters.created_at_end;
            if (filters.carteirinha_id) params.carteirinha_id = filters.carteirinha_id;

            const response = await api.get('/guias/export', {
                params,
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'guias_exportadas.xlsx');
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            console.error("Download failed", error);
            alert("Erro ao exportar");
        }
    };

    return (
        <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Base Guias Unimed - {username}</h1>

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3>Listagem de Guias</h3>
                </div>

                {/* Filters */}
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <div style={{ minWidth: '200px', flex: 1 }}>
                        <label>Paciente / Carteirinha</label>
                        <select
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', background: '#333', color: 'white', border: '1px solid #555' }}
                            value={filters.carteirinha_id}
                            onChange={e => {
                                setFilters({ ...filters, carteirinha_id: e.target.value });
                                setPage(1);
                            }}
                        >
                            <option value="">Todos os Pacientes</option>
                            {carteirinhas.map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.paciente ? c.paciente : c.carteirinha}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Date Inputs with Calendar Icon */}
                    <div>
                        <label>Data Import. Início</label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <Calendar size={18} style={{ position: 'absolute', left: 8, color: '#aaa', pointerEvents: 'none' }} />
                            <input
                                type="date"
                                style={{ paddingLeft: '32px', paddingRight: '10px', height: '38px', borderRadius: '4px', background: '#333', border: '1px solid #555', color: 'white' }}
                                value={filters.created_at_start}
                                onChange={e => {
                                    setFilters({ ...filters, created_at_start: e.target.value });
                                    setPage(1);
                                }}
                            />
                        </div>
                    </div>

                    <div>
                        <label>Data Import. Fim</label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <Calendar size={18} style={{ position: 'absolute', left: 8, color: '#aaa', pointerEvents: 'none' }} />
                            <input
                                type="date"
                                style={{ paddingLeft: '32px', paddingRight: '10px', height: '38px', borderRadius: '4px', background: '#333', border: '1px solid #555', color: 'white' }}
                                value={filters.created_at_end}
                                onChange={e => {
                                    setFilters({ ...filters, created_at_end: e.target.value });
                                    setPage(1);
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn" onClick={handleClearFilters} style={{ background: '#4b5563', color: 'white' }} title="Limpar Filtros">
                            <X size={16} style={{ marginRight: 5 }} /> Limpar
                        </button>
                        <button className="btn" onClick={handleExport} style={{ background: '#10b981', color: 'white' }}>
                            <Download size={16} style={{ marginRight: 5 }} /> Exportar Excel
                        </button>
                    </div>
                </div>

                {loading ? <p>Carregando...</p> : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
                                    <th onClick={() => handleSort('created_at')} style={{ cursor: 'pointer', padding: '0.8rem' }}>
                                        Data Import {sortConfig.key === 'created_at' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                                    </th>
                                    <th style={{ padding: '0.8rem' }}>Carteira / Paciente</th>
                                    <th onClick={() => handleSort('guia')} style={{ cursor: 'pointer', padding: '0.8rem' }}>
                                        Guia {sortConfig.key === 'guia' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                                    </th>
                                    <th onClick={() => handleSort('data_autorizacao')} style={{ cursor: 'pointer', padding: '0.8rem' }}>
                                        Data Autoriz. {sortConfig.key === 'data_autorizacao' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                                    </th>
                                    <th style={{ padding: '0.8rem' }}>Senha</th>
                                    <th onClick={() => handleSort('validade')} style={{ cursor: 'pointer', padding: '0.8rem' }}>
                                        Validade {sortConfig.key === 'validade' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                                    </th>
                                    <th style={{ padding: '0.8rem' }}>Terapia</th>
                                    <th style={{ padding: '0.8rem' }}>Solicitado</th>
                                    <th style={{ padding: '0.8rem' }}>Autorizado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedGuias.length > 0 ? sortedGuias.map(g => {
                                    const paciente = carteirinhas.find(c => c.id === g.carteirinha_id);
                                    return (
                                        <tr key={g.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                            <td style={{ padding: '0.8rem' }}>{formatDateTime(g.created_at)}</td>
                                            <td style={{ padding: '0.8rem' }}>{paciente ? paciente.paciente || paciente.carteirinha : g.carteirinha_id}</td>
                                            <td style={{ padding: '0.8rem' }}>{g.guia}</td>
                                            <td style={{ padding: '0.8rem' }}>{formatDate(g.data_autorizacao)}</td>
                                            <td style={{ padding: '0.8rem' }}>{g.senha}</td>
                                            <td style={{ padding: '0.8rem' }}>{formatDate(g.validade)}</td>
                                            <td style={{ padding: '0.8rem' }}>{g.codigo_terapia}</td>
                                            <td style={{ padding: '0.8rem' }}>{g.qtde_solicitada}</td>
                                            <td style={{ padding: '0.8rem' }}>{g.sessoes_autorizadas}</td>
                                        </tr>
                                    );
                                }) : (
                                    <tr><td colSpan="9" style={{ textAlign: 'center', padding: '1rem' }}>Nenhuma guia encontrada.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                <Pagination
                    currentPage={page}
                    totalItems={totalItems}
                    pageSize={pageSize}
                    onPageChange={setPage}
                    onPageSizeChange={setPageSize}
                />
            </div>


        </div>
    );
}
