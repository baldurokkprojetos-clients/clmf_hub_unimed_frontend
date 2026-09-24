import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import api from '../services/api';
import Pagination from '../components/Pagination';
import { Play, Filter, RefreshCcw, Trash2, Clock, CheckCircle, AlertCircle, XCircle, Users, Activity, ShieldCheck, ShieldAlert, ShieldOff, FileSpreadsheet, Download, Upload } from 'lucide-react';
import { formatDateTime, maskCarteirinha, validateCarteirinha } from '../utils/formatters';
import SearchableSelect from '../components/SearchableSelect';

// Design System
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Input, Select } from '../components/ui/Input';
import Badge from '../components/ui/Badge';


import WorkerList from '../components/WorkerList';

export default function Importacoes() {
  const [loading, setLoading] = useState(false);
  const username = localStorage.getItem('username') || 'Usuário';

  // Abas: 'importacoes' (estrutura original — principal) | 'evolucoes' (OP2 CLMF)
  const [activeTab, setActiveTab] = useState('importacoes');

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
    created_at_end: '',
    carteirinha_id: '',
    status_guias: '',
    rotina: ''
  });

  // Evoluções CLMF (OP2 ImprimirEvolucao)
  const [evoFile, setEvoFile] = useState(null);
  const [evoFileInputKey, setEvoFileInputKey] = useState(0);
  const [evoUploading, setEvoUploading] = useState(false);
  const [evoResumo, setEvoResumo] = useState(null);
  const [evoPacientes, setEvoPacientes] = useState([]);
  const [evoExporting, setEvoExporting] = useState(false);

  // Modal State
  const [selectedJobForModal, setSelectedJobForModal] = useState(null);

  // Controle de corrida entre requisições da listagem: sem isso, uma resposta
  // antiga e lenta (ex.: poll sem filtro) chega depois da filtrada e
  // sobrescreve a tabela com todos os dados
  const abortControllerRef = useRef(null);
  const requestIdRef = useRef(0);
  const inFlightRef = useRef(false);

  useEffect(() => {
    fetchCarteirinhas();
    fetchStats();
    fetchEvolucoesPacientes();
  }, []);

  useEffect(() => {
    if (activeTab === 'importacoes') fetchJobs();
    const interval = setInterval(() => {
      if (activeTab === 'importacoes') {
        fetchJobs(true);
        fetchStats();
      } else {
        fetchEvolucoesPacientes();
      }
    }, 5000); // Poll for updates (somente da aba ativa)
    return () => {
      clearInterval(interval);
      // Ao trocar filtros/página ou desmontar: abortar busca em voo para que
      // sua resposta (obsoleta) nunca sobrescreva a próxima
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [page, pageSize, filters, activeTab]);

  const [stats, setStats] = useState(null);

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/stats');
      setStats(res.data);
    } catch (e) { console.error("Error fetching stats", e); }
  };

  const fetchCarteirinhas = async () => {
    try {
      const res = await api.get('/carteirinhas/?limit=1000');
      setCarteirinhas(res.data.data || res.data);
    } catch (e) { console.error(e); }
  };

  const fetchJobs = async (fromPoll = false) => {
    // Poll não interrompe busca em voo (evita starvation com backend lento);
    // buscas manuais (filtro/página/ação) abortam a anterior — a mais nova vence.
    if (fromPoll && inFlightRef.current) return;
    if (abortControllerRef.current) abortControllerRef.current.abort();

    const controller = new AbortController();
    abortControllerRef.current = controller;
    const requestId = ++requestIdRef.current;
    inFlightRef.current = true;
    setLoading(true);

    try {
      const params = {
        limit: pageSize,
        skip: (page - 1) * pageSize,
      };

      if (filters.status) params.status = filters.status;
      if (filters.created_at_start) params.created_at_start = filters.created_at_start;
      if (filters.created_at_end) params.created_at_end = filters.created_at_end;
      if (filters.carteirinha_id) params.carteirinha_id = filters.carteirinha_id;
      if (filters.status_guias) params.status_guias = filters.status_guias;
      if (filters.rotina) params.rotina = filters.rotina;

      const res = await api.get('/jobs/', { params, signal: controller.signal });

      // Aplicar somente se esta ainda é a busca mais recente (pode ter sido
      // abortada/superseded enquanto aguardávamos a resposta)
      if (requestId !== requestIdRef.current) return;

      if (res.data.data) {
        setJobs(res.data.data);
        setTotalJobs(res.data.total);
      } else {
        setJobs(res.data);
      }
    } catch (e) {
      // Aborte intencional (nova busca disparada): ignorar silenciosamente
      if (!axios.isCancel(e)) console.error("Error fetching jobs", e);
    } finally {
      // Só a busca corrente libera os flags — a abortada não pode limpar o
      // estado da busca que a substituiu
      if (requestId === requestIdRef.current) {
        inFlightRef.current = false;
        setLoading(false);
      }
    }
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
        const convInput = document.getElementById('temp-id-pagamento').value;

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
            paciente: pacInput,
            id_pagamento: convInput ? parseInt(convInput) : null
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

  // ── Evoluções CLMF (OP2 ImprimirEvolucao) ─────────────────────────────────
  const fetchEvolucoesPacientes = async () => {
    try {
      const res = await api.get('/evolucoes/jobs');
      setEvoPacientes(res.data.data || []);
    } catch (e) { console.error("Error fetching evolucoes panel", e); }
  };

  const handleEvolucoesUpload = async () => {
    if (!evoFile) {
      alert("Selecione o arquivo .xlsx da planilha modelo de evoluções.");
      return;
    }
    setEvoUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', evoFile);
      const res = await api.post('/evolucoes/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setEvoResumo(res.data);
      setEvoFile(null);
      setEvoFileInputKey(k => k + 1);
      fetchJobs();
      fetchEvolucoesPacientes();
    } catch (e) {
      alert("Erro no upload de evoluções: " + (e.response?.data?.detail || e.message));
    } finally {
      setEvoUploading(false);
    }
  };

  const handleExportEvolucoes = async () => {
    setEvoExporting(true);
    try {
      const res = await api.get('/evolucoes/export', { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      const ts = new Date().toISOString().slice(0, 19).replace(/[-:T]/g, '');
      link.href = url;
      link.download = `evolucoes_status_${ts}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("Erro ao exportar status: " + (e.response?.data?.detail || e.message));
    } finally {
      setEvoExporting(false);
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

  const handleOpenGuiasModal = (job) => {
    if (job.valida_prestador && job.valida_prestador.guias) {
      setSelectedJobForModal(job);
    } else {
      alert("Nenhum detalhe de guias encontrado neste JSON.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Importações / Jobs</h1>
          <span className="text-text-secondary text-sm">Usuário: {username}</span>
        </div>
        <div className="items-end">
          <div className="text-xs text-text-secondary mb-1 text-right">Workers Linkados:</div>
          <WorkerList compact={true} />
        </div>
      </div>

      {/* Abas: Importações (estrutura original — principal) | Evoluções CLMF (OP2) */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab('importacoes')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 -mb-px transition-colors ${
            activeTab === 'importacoes'
              ? 'border-primary text-primary bg-primary/5'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          <Play size={15} /> Importações
        </button>
        <button
          onClick={() => setActiveTab('evolucoes')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 -mb-px transition-colors ${
            activeTab === 'evolucoes'
              ? 'border-primary text-primary bg-primary/5'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          <FileSpreadsheet size={15} /> Evoluções CLMF
        </button>
      </div>

      {/* Stats Bar */}
      {activeTab === 'importacoes' && stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="flex items-center gap-3 p-4">
            <div className="bg-blue-500/10 p-2 rounded-full text-blue-500"><Users size={20} /></div>
            <div>
              <div className="text-xs text-text-secondary">Carteirinhas</div>
              <div className="text-xl font-bold text-text-primary">{stats.overview.total_carteirinhas}</div>
            </div>
          </Card>
          <Card className="flex items-center gap-3 p-4">
            <div className="bg-emerald-500/10 p-2 rounded-full text-emerald-500"><CheckCircle size={20} /></div>
            <div>
              <div className="text-xs text-text-secondary">Guias</div>
              <div className="text-xl font-bold text-text-primary">{stats.overview.total_guias}</div>
            </div>
          </Card>
          <Card className="flex items-center gap-3 p-4">
            <div className="bg-amber-500/10 p-2 rounded-full text-amber-500"><Activity size={20} /></div>
            <div>
              <div className="text-xs text-text-secondary">Jobs Total</div>
              <div className="text-xl font-bold text-text-primary">{stats.overview.total_jobs}</div>
            </div>
          </Card>
          <Card className="flex items-center gap-3 p-4">
            <div className="bg-green-500/10 p-2 rounded-full text-green-500"><CheckCircle size={20} /></div>
            <div>
              <div className="text-xs text-text-secondary">Sucesso</div>
              <div className="text-xl font-bold text-text-primary">{stats.jobs_status.success}</div>
            </div>
          </Card>
          <Card className="flex items-center gap-3 p-4">
            <div className="bg-red-500/10 p-2 rounded-full text-red-500"><XCircle size={20} /></div>
            <div>
              <div className="text-xs text-text-secondary">Erros</div>
              <div className="text-xl font-bold text-text-primary">{stats.jobs_status.error}</div>
            </div>
          </Card>
        </div>
      )}

      {/* Creation Panel (z-30: dropdown de pacientes acima dos cards seguintes) */}
      {activeTab === 'importacoes' && (
      <Card className="relative z-30">
        <h3 className="text-lg font-semibold text-text-primary mb-4 border-b border-border pb-2">Nova Solicitação</h3>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-text-secondary mb-1">Tipo Importação</label>
            <Select
              value={importType}
              onChange={e => { setImportType(e.target.value); setSelectedCarteirinhas([]); }}
            >
              <option value="single">Única</option>
              <option value="multiple">Múltipla</option>
              <option value="all">Todos</option>
              <option value="temp">Temporário</option>
            </Select>
          </div>

          {importType === 'temp' ? (
            <>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-text-secondary mb-1">Carteirinha (Temp)</label>
                <Input
                  type="text"
                  placeholder="0000.0000..."
                  id="temp-carteirinha"
                  maxLength={21}
                  onChange={handleTempCarteirinhaChange}
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-text-secondary mb-1">Nome do Paciente</label>
                <Input
                  type="text"
                  placeholder="Nome Completo"
                  id="temp-paciente"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-secondary mb-1">Convênio</label>
                <Select id="temp-id-pagamento" defaultValue="3">
                  <option value="3">Unimed Goiânia Guia</option>
                  <option value="21">Unimed Intercâmbio</option>
                  <option value="6">Ipasgo - TEA</option>
                  <option value="31">Ipasgo - Geral</option>
                </Select>
              </div>
            </>
          ) : (
            importType !== 'all' && (
              <div className="md:col-span-8">
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
      )}

      {/* Evoluções CLMF (OP2 ImprimirEvolucao) — aba própria */}
      {activeTab === 'evolucoes' && (
      <Card noPadding className="relative z-20">
        <div className="p-4 border-b border-border flex flex-wrap gap-4 items-end bg-surface/30">
          <div className="flex items-center gap-2 mr-2">
            <FileSpreadsheet size={18} className="text-primary" />
            <h3 className="text-sm font-semibold text-text-primary">Evoluções CLMF — Imprimir Evolução</h3>
          </div>
          <div className="w-80">
            <label className="block text-xs font-semibold text-text-secondary mb-1">Planilha de Evoluções (.xlsx)</label>
            <input
              key={evoFileInputKey}
              type="file"
              accept=".xlsx"
              onChange={(e) => setEvoFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-text-secondary border border-border rounded-lg cursor-pointer
                         bg-surface file:mr-3 file:py-1.5 file:px-3 file:rounded-l-lg file:border-0
                         file:bg-slate-800 file:text-text-primary file:text-sm file:cursor-pointer"
            />
          </div>
          <Button onClick={handleEvolucoesUpload} disabled={evoUploading} className="h-[38px]">
            <Upload size={16} /> {evoUploading ? 'Importando...' : 'Importar'}
          </Button>
          <div className="ml-auto flex items-center gap-3">
            {evoResumo && (
              <span className="text-xs text-text-secondary">
                {evoResumo.background && (
                  <span className="text-emerald-400">Criando jobs em segundo plano… </span>
                )}
                <b>{evoResumo.jobs}</b> jobs · <b>{evoResumo.itens}</b> itens ·{' '}
                <b>{evoResumo.pacientes}</b> pacientes{evoResumo.background ? ' (previsto)' : ''}
                {(evoResumo.erros_planilha?.length || evoResumo.falhas?.length) ? (
                  <span className="text-amber-400"> · {(evoResumo.erros_planilha?.length || 0) + (evoResumo.falhas?.length || 0)} aviso(s)</span>
                ) : null}
              </span>
            )}
            <Button variant="ghost" onClick={handleExportEvolucoes} disabled={evoExporting} className="h-[38px] text-emerald-400 hover:text-emerald-300">
              <Download size={16} /> {evoExporting ? 'Gerando...' : 'Exportar Status'}
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[320px] overflow-y-auto">
          <table className="w-full">
            <thead className="bg-slate-900/50 text-text-secondary text-xs uppercase tracking-wider sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left">Paciente</th>
                <th className="px-6 py-3 text-left">idPaciente</th>
                <th className="px-6 py-3 text-left">Lote</th>
                <th className="px-6 py-3 text-center">Total</th>
                <th className="px-6 py-3 text-center">OK</th>
                <th className="px-6 py-3 text-center">Pendente</th>
                <th className="px-6 py-3 text-center">Erro</th>
                <th className="px-6 py-3 text-left">Atualizado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {evoPacientes.map((p) => (
                <tr key={p.idPaciente} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-3 text-sm text-text-primary whitespace-nowrap">{p.nomePaciente || '—'}</td>
                  <td className="px-6 py-3 text-sm text-text-secondary">{p.idPaciente}</td>
                  <td className="px-6 py-3 text-sm text-text-secondary max-w-[220px] truncate" title={p.lote}>{p.lote || '—'}</td>
                  <td className="px-6 py-3 text-sm text-text-primary text-center">{p.total}</td>
                  <td className="px-6 py-3 text-center"><Badge variant="success">{p.ok}</Badge></td>
                  <td className="px-6 py-3 text-center"><Badge variant="warning">{p.pendente}</Badge></td>
                  <td className="px-6 py-3 text-center"><Badge variant="error">{p.erro}</Badge></td>
                  <td className="px-6 py-3 text-sm text-text-secondary whitespace-nowrap">{formatDateTime(p.updated_at)}</td>
                </tr>
              ))}
              {evoPacientes.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-text-secondary">
                    Nenhuma importação de evoluções ainda. Envie a planilha modelo (.xlsx) acima.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      )}

      {/* Jobs List */}
      {activeTab === 'importacoes' && (
      <Card noPadding className="relative z-10">
        {/* Filters Toolbar */}
        <div className="p-4 border-b border-border flex flex-wrap gap-4 items-end bg-surface/30">
          <div className="w-64">
            <label className="block text-xs font-semibold text-text-secondary mb-1">Paciente</label>
            <SearchableSelect
              options={carteirinhas.map(c => ({
                value: c.id,
                label: c.paciente ? `${c.paciente} (${c.carteirinha})` : c.carteirinha
              }))}
              value={filters.carteirinha_id || ''}
              onChange={(val) => { setFilters({ ...filters, carteirinha_id: val || '' }); setPage(1); }}
              placeholder="Todos os Pacientes..."
            />
          </div>
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
          <div className="w-48">
            <label className="block text-xs font-semibold text-text-secondary mb-1">Rotina</label>
            <Select
              value={filters.rotina}
              onChange={e => { setFilters({ ...filters, rotina: e.target.value }); setPage(1); }}
              className="py-1.5 text-sm"
            >
              <option value="">Todas</option>
              <option value="none">Importações (Unimed)</option>
              <option value="clmf_atualizar_rc">CLMF — Atualizar RC</option>
              <option value="clmf_imprimir_evolucao">CLMF — Evoluções</option>
            </Select>
          </div>
          <div className="w-40">
            <label className="block text-xs font-semibold text-text-secondary mb-1">Status Guias</label>
            <Select
              value={filters.status_guias}
              onChange={e => { setFilters({ ...filters, status_guias: e.target.value }); setPage(1); }}
              className="py-1.5 text-sm"
            >
              <option value="">Todos</option>
              <option value="validas">Válidas</option>
              <option value="bloqueadas">Bloqueadas</option>
              <option value="sem_guias">Sem Guias</option>
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
          <div className="ml-auto flex items-center gap-1.5 text-text-secondary">
            <RefreshCcw size={14} className={loading ? 'animate-spin' : 'opacity-40'} />
            <span className="text-xs">{loading ? 'Atualizando...' : 'Atualiza a cada 5s'}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/50 text-text-secondary text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 text-left cursor-pointer hover:text-primary" onClick={() => handleSort('id')}>ID</th>
                <th className="px-6 py-3 text-left cursor-pointer hover:text-primary" onClick={() => handleSort('paciente')}>Nome</th>
                <th className="px-6 py-3 text-left cursor-pointer hover:text-primary" onClick={() => handleSort('created_at')}>Data Criação</th>
                <th className="px-6 py-3 text-left cursor-pointer hover:text-primary" onClick={() => handleSort('status')}>Status</th>
                <th className="px-6 py-3 text-left">Status Guias</th>
                <th className="px-6 py-3 text-left cursor-pointer hover:text-primary" onClick={() => handleSort('attempts')}>Tentativas</th>
                <th className="px-6 py-3 text-left">Tempo Proc.</th>
                <th className="px-6 py-3 text-left">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sortedJobs.map(job => (
                <tr key={job.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 text-sm text-text-primary whitespace-nowrap">#{job.id}</td>
                  <td className="px-6 py-4 text-sm text-text-primary whitespace-nowrap">
                    {job.paciente || 'Não Identificado'}
                    {job.rotina === 'clmf_imprimir_evolucao' && (
                      <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">Evoluções</span>
                    )}
                    {job.rotina === 'clmf_atualizar_rc' && (
                      <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">RC</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-text-secondary whitespace-nowrap">{formatDateTime(job.created_at)}</td>
                  <td className="px-6 py-4 text-sm">
                    {getStatusBadge(job.status)}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {(() => {
                      const json = job.valida_prestador;
                      if (!json || json.tipo_json === 'Null' || !json.tipo_json) {
                        return (
                          <span
                            className="inline-flex items-center gap-1.5 text-red-400 cursor-default"
                            title="Sem guias Processadas"
                          >
                            <ShieldOff size={18} className="text-red-400" />
                            <span className="text-xs">Sem Guias</span>
                          </span>
                        );
                      }
                      if (json.tipo_json === 'All Sucess') {
                        return (
                          <button
                            className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer group relative"
                            title="Guias Válidas Importadas — Clique para ver detalhes"
                            onClick={() => handleOpenGuiasModal(job)}
                          >
                            <ShieldCheck size={18} />
                            <span className="text-xs font-medium">Válidas</span>
                          </button>
                        );
                      }
                      if (json.tipo_json === 'Thered') {
                        const blockedGuidesCount = Object.values(json.guias || {}).filter(g => g.Vinculo_prestador !== 'Guia Válida').length;
                        const firstBlockMsg = Object.values(json.guias || {}).find(g => g.Vinculo_prestador !== 'Guia Válida')?.Vinculo_prestador || '';
                        
                        return (
                          <button
                            className="inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                            title={`Possui ${blockedGuidesCount} Guia(s) Bloqueada(s): ${firstBlockMsg} — Clique para ver detalhes`}
                            onClick={() => handleOpenGuiasModal(job)}
                          >
                            <ShieldAlert size={18} />
                            <span className="text-xs font-medium">Bloqueadas</span>
                          </button>
                        );
                      }
                      return <span className="text-text-secondary">-</span>;
                    })()}
                  </td>
                  <td className="px-6 py-4 text-sm text-text-secondary">{job.attempts}</td>
                  <td className="px-6 py-4 text-sm text-text-secondary font-mono">{calculateDuration(job.created_at, job.updated_at)}</td>
                  <td className="px-6 py-4 text-sm">
                    {job.status === 'error' && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => handleRetryJob(job.id)} title="Reprocessar" className="text-amber-500 hover:text-amber-400 hover:bg-amber-500/10">
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
                  <td colSpan="8" className="px-6 py-10 text-center text-text-secondary">
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
      )}

      {/* JSON Detail Modal */}
      {selectedJobForModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <Card className="max-w-5xl w-full max-h-[90vh] flex flex-col pt-5 px-6 pb-6 shadow-2xl border border-border/80">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-border">
              <div>
                <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                  Paciente: <span className="text-primary">{selectedJobForModal.paciente || 'Não Identificado'}</span>
                </h3>
                <span className="text-xs text-text-secondary">Job #{selectedJobForModal.id}</span>
              </div>
              <button 
                onClick={() => setSelectedJobForModal(null)} 
                className="text-text-secondary hover:text-text-primary transition-colors p-1 rounded-lg hover:bg-slate-800"
                title="Fechar"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-900/90 sticky top-0 text-xs uppercase tracking-wider text-text-secondary z-10">
                  <tr>
                    <th className="px-4 py-3.5 border-b border-border w-[140px] whitespace-nowrap">Número Guia</th>
                    <th className="px-4 py-3.5 border-b border-border w-[160px] whitespace-nowrap">Código Procedimento</th>
                    <th className="px-4 py-3.5 border-b border-border">Descrição Procedimento</th>
                    <th className="px-4 py-3.5 border-b border-border min-w-[280px]">Vínculo Prestador</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {Object.entries(selectedJobForModal.valida_prestador.guias || {})
                    .sort(([, a], [, b]) => {
                      const aValid = a?.Vinculo_prestador === 'Guia Válida';
                      const bValid = b?.Vinculo_prestador === 'Guia Válida';
                      if (aValid && !bValid) return -1;
                      if (!aValid && bValid) return 1;
                      return 0;
                    })
                    .map(([guia_key, attr]) => {
                      const isValid = attr.Vinculo_prestador === 'Guia Válida';
                      return (
                        <tr key={guia_key} className={`transition-colors ${isValid ? 'hover:bg-emerald-950/10' : 'hover:bg-amber-950/10'}`}>
                          <td className="px-4 py-3 text-sm font-semibold text-text-primary whitespace-nowrap font-mono">
                            {guia_key}
                          </td>
                          <td className="px-4 py-3 text-sm text-text-secondary whitespace-nowrap font-mono">
                            {attr.codigo_procedimento || '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-text-primary font-medium leading-relaxed">
                            {attr.descricao_procedimento || '-'}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${
                              isValid 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}>
                              {attr.Vinculo_prestador || '-'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
