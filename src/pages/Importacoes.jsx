import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Pagination from '../components/Pagination';
import { Play, Filter, RefreshCcw, Trash2, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { formatDateTime, maskCarteirinha, validateCarteirinha } from '../utils/formatters';
import SearchableSelect from '../components/SearchableSelect';

// Design System
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Input, Select } from '../components/ui/Input';
import Badge from '../components/ui/Badge';

export default function Importacoes() {
  const [loading, setLoading] = useState(false);
  const username = localStorage.getItem('username') || 'Usuário';

  // Job Creation State
  const [importType, setImportType] = useState('single');
  const [carteirinhas, setCarteirinhas] = useState([]);
  const [selectedCarteirinhas, setSelectedCarteirinhas] = useState([]);

  // Sorting State
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });

  // Jobs List State
  const [jobs, setJobs] = useState([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [filters, setFilters] = useState({
    status: '',
    created_at_start: '',
    created_at_end: ''
  });

  useEffect(() => {
    fetchCarteirinhas();
  }, []);

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 5000); // Poll for updates
    return () => clearInterval(interval);
  }, [page, pageSize, filters]);

  const fetchCarteirinhas = async () => {
    try {
      const res = await api.get('/carteirinhas/?limit=1000');
      setCarteirinhas(res.data.data || res.data);
    } catch (e) { console.error(e); }
  };

  const fetchJobs = async () => {
    try {
      const params = {
        limit: pageSize,
        skip: (page - 1) * pageSize,
      };

      if (filters.status) params.status = filters.status;
      if (filters.created_at_start) params.created_at_start = filters.created_at_start;
      if (filters.created_at_end) params.created_at_end = filters.created_at_end;

      const res = await api.get('/jobs/', { params });

      if (res.data.data) {
        setJobs(res.data.data);
        setTotalJobs(res.data.total);
      } else {
        setJobs(res.data);
      }
    } catch (e) { console.error("Error fetching jobs", e); }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedJobs = React.useMemo(() => {
    if (!jobs) return [];
    let sortableItems = [...jobs];
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
  }, [jobs, sortConfig]);

  const handleCreateJob = async () => {
    const typeMap = { 'single': 'single', 'multiple': 'multiple', 'all': 'all' };

    if ((importType === 'single' || importType === 'multiple') && selectedCarteirinhas.length === 0) {
      alert("Selecione pelo menos uma carteirinha/paciente.");
      return;
    }

    if (importType === 'all' && !confirm("Deseja processar TODAS as carteirinhas?")) return;

    try {
      let payload = {};

      if (importType === 'temp') {
        const cartInput = document.getElementById('temp-carteirinha').value;
        const pacInput = document.getElementById('temp-paciente').value;

        if (!cartInput || !pacInput) {
          alert("Preencha carteirinha e nome do paciente.");
          return;
        }

        if (!validateCarteirinha(cartInput)) {
          alert("Carteirinha inválida! Formato deve ser 0000.0000.000000.00-0");
          return;
        }

        payload = {
          type: 'temp',
          temp_patient: {
            carteirinha: cartInput,
            paciente: pacInput
          }
        };
      } else {
        payload = {
          type: typeMap[importType],
          carteirinha_ids: (importType === 'all') ? [] : selectedCarteirinhas
        };
      }

      await api.post('/jobs/', payload);
      alert("Solicitações criadas com sucesso!");
      setSelectedCarteirinhas([]);
      fetchJobs();

      if (importType === 'temp') {
        document.getElementById('temp-carteirinha').value = '';
        document.getElementById('temp-paciente').value = '';
      }
    } catch (e) {
      alert("Erro ao criar jobs: " + (e.response?.data?.detail || e.message));
    }
  };

  const handleDeleteJob = async (id) => {
    if (!confirm("Tem certeza que deseja excluir este Job?")) return;
    try {
      await api.delete(`/jobs/${id}`);
      fetchJobs();
    } catch (e) {
      alert("Erro ao excluir: " + (e.response?.data?.detail || e.message));
    }
  };

  const handleRetryJob = async (id) => {
    if (!confirm("Deseja reenviar este Job?")) return;
    try {
      await api.post(`/jobs/${id}/retry`);
      fetchJobs();
    } catch (e) {
      alert("Erro ao reenviar: " + (e.response?.data?.detail || e.message));
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'success': return <Badge variant="success">Sucesso</Badge>;
      case 'error': return <Badge variant="error">Erro</Badge>;
      case 'pending': return <Badge variant="warning">Pendente</Badge>;
      case 'processing': return <Badge variant="info">Processando</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const calculateDuration = (start, end) => {
    if (!start || !end) return '-';
    const diff = new Date(end) - new Date(start);
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
  };

  const handleTempCarteirinhaChange = (e) => {
    e.target.value = maskCarteirinha(e.target.value);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-border pb-4">
        <h1 className="text-2xl font-bold text-text-primary">Importações / Jobs</h1>
        <span className="text-text-secondary text-sm">Usuário: {username}</span>
      </div>

      {/* Creation Panel */}
      <Card>
        <h3 className="text-lg font-semibold text-text-primary mb-4 border-b border-border pb-2">Nova Solicitação</h3>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">

          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-text-secondary mb-1">Tipo de Importação</label>
            <Select
              value={importType}
              onChange={e => { setImportType(e.target.value); setSelectedCarteirinhas([]); }}
            >
              <option value="single">Única</option>
              <option value="multiple">Múltipla</option>
              <option value="all">Todos</option>
              <option value="temp">Paciente Temporário</option>
            </Select>
          </div>

          {importType === 'temp' ? (
            <>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-text-secondary mb-1">Carteirinha (Temp)</label>
                <Input
                  type="text"
                  placeholder="Ex: 0000.0000.000000.00-0"
                  id="temp-carteirinha"
                  maxLength={21}
                  onChange={handleTempCarteirinhaChange}
                />
              </div>
              <div className="md:col-span-4">
                <label className="block text-sm font-medium text-text-secondary mb-1">Nome do Paciente</label>
                <Input
                  type="text"
                  placeholder="Nome Completo"
                  id="temp-paciente"
                />
              </div>
            </>
          ) : (
            importType !== 'all' && (
              <div className="md:col-span-7">
                <label className="block text-sm font-medium text-text-secondary mb-1">Selecione os Pacientes</label>

                {importType === 'multiple' ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        id="patient-search-input"
                        list="patients-list"
                        placeholder="Pesquisar paciente... (Enter p/ incluir)"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const val = e.target.value;
                            const item = carteirinhas.find(c => (c.paciente ? `${c.paciente} (${c.carteirinha})` : c.carteirinha) === val);
                            if (item) {
                              if (!selectedCarteirinhas.includes(item.id)) {
                                setSelectedCarteirinhas([...selectedCarteirinhas, item.id]);
                              }
                              e.target.value = '';
                            }
                          }
                        }}
                      />
                      <datalist id="patients-list">
                        {carteirinhas.map(c => (
                          <option key={c.id} value={c.paciente ? `${c.paciente} (${c.carteirinha})` : c.carteirinha} />
                        ))}
                      </datalist>
                      <Button
                        onClick={() => {
                          const input = document.getElementById('patient-search-input');
                          const val = input.value;
                          const item = carteirinhas.find(c => (c.paciente ? `${c.paciente} (${c.carteirinha})` : c.carteirinha) === val);
                          if (item) {
                            if (!selectedCarteirinhas.includes(item.id)) {
                              setSelectedCarteirinhas([...selectedCarteirinhas, item.id]);
                            }
                            input.value = '';
                          } else {
                            alert("Selecione um paciente válido da lista.");
                          }
                        }}
                      >
                        +
                      </Button>
                    </div>

                    {/* Selected List Badge Area */}
                    <div className="bg-slate-900/50 p-2 rounded-lg min-h-[50px] max-h-[150px] overflow-y-auto flex flex-wrap gap-2">
                      {selectedCarteirinhas.length === 0 && <span className="text-text-secondary text-xs italic">Nenhum paciente selecionado</span>}
                      {selectedCarteirinhas.map(id => {
                        const c = carteirinhas.find(x => x.id === id);
                        return (
                          <div key={id} className="inline-flex items-center gap-1 bg-surface border border-border px-2 py-1 rounded text-xs text-text-primary">
                            <span>{c ? (c.paciente || c.carteirinha) : id}</span>
                            <button
                              onClick={() => setSelectedCarteirinhas(selectedCarteirinhas.filter(x => x !== id))}
                              className="text-error hover:text-red-300 font-bold ml-1"
                            >
                              &times;
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <SearchableSelect
                    options={carteirinhas.map(c => ({
                      value: c.id,
                      label: c.paciente ? `${c.paciente} (${c.carteirinha})` : c.carteirinha
                    }))}
                    value={selectedCarteirinhas[0] || ''}
                    onChange={(val) => setSelectedCarteirinhas(val ? [parseInt(val)] : [])}
                    placeholder="Selecione ou Cole o Paciente..."
                  />
                )}
              </div>
            )
          )}

          <div className="md:col-span-2">
            <Button onClick={handleCreateJob} className="w-full h-[42px]">
              <Play size={16} /> Criar
            </Button>
          </div>

        </div>
      </Card>

      {/* Jobs List */}
      <Card noPadding>
        {/* Filters Toolbar */}
        <div className="p-4 border-b border-border flex flex-wrap gap-4 items-end bg-surface/30">
          <div className="w-40">
            <label className="block text-xs font-semibold text-text-secondary mb-1">Status</label>
            <Select
              value={filters.status}
              onChange={e => { setFilters({ ...filters, status: e.target.value }); setPage(1); }}
              className="py-1.5 text-sm"
            >
              <option value="">Todos</option>
              <option value="success">Sucesso</option>
              <option value="error">Erro</option>
              <option value="pending">Pendente</option>
              <option value="processing">Processando</option>
            </Select>
          </div>
          <div className="w-40">
            <label className="block text-xs font-semibold text-text-secondary mb-1">Início</label>
            <Input type="date" value={filters.created_at_start} onChange={e => { setFilters({ ...filters, created_at_start: e.target.value }); setPage(1); }} className="py-1.5 text-sm" />
          </div>
          <div className="w-40">
            <label className="block text-xs font-semibold text-text-secondary mb-1">Fim</label>
            <Input type="date" value={filters.created_at_end} onChange={e => { setFilters({ ...filters, created_at_end: e.target.value }); setPage(1); }} className="py-1.5 text-sm" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/50 text-text-secondary text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 text-left cursor-pointer hover:text-primary" onClick={() => handleSort('id')}>ID</th>
                <th className="px-6 py-3 text-left cursor-pointer hover:text-primary" onClick={() => handleSort('created_at')}>Data Criação</th>
                <th className="px-6 py-3 text-left cursor-pointer hover:text-primary" onClick={() => handleSort('status')}>Status</th>
                <th className="px-6 py-3 text-left cursor-pointer hover:text-primary" onClick={() => handleSort('attempts')}>Tentativas</th>
                <th className="px-6 py-3 text-left">Tempo Proc.</th>
                <th className="px-6 py-3 text-left">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sortedJobs.map(job => (
                <tr key={job.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 text-sm text-text-primary whitespace-nowrap">#{job.id}</td>
                  <td className="px-6 py-4 text-sm text-text-secondary whitespace-nowrap">{formatDateTime(job.created_at)}</td>
                  <td className="px-6 py-4 text-sm">
                    {getStatusBadge(job.status)}
                  </td>
                  <td className="px-6 py-4 text-sm text-text-secondary">{job.attempts}</td>
                  <td className="px-6 py-4 text-sm text-text-secondary font-mono">{calculateDuration(job.created_at, job.updated_at)}</td>
                  <td className="px-6 py-4 text-sm">
                    {(job.status === 'error' && job.attempts > 3) && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => handleRetryJob(job.id)} title="Reenviar" className="text-amber-500 hover:text-amber-400 hover:bg-amber-500/10">
                          <RefreshCcw size={16} />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteJob(job.id)} title="Excluir" className="text-red-500 hover:text-red-400 hover:bg-red-500/10">
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {sortedJobs.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-text-secondary">
                    Nenhum job encontrado com os filtros atuais.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-border">
          <Pagination
            currentPage={page}
            totalItems={totalJobs}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      </Card>
    </div>
  );
}
