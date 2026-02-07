import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { RefreshCcw } from 'lucide-react';
import { formatDateTime } from '../utils/formatters';
import Pagination from '../components/Pagination';

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalItems, setTotalItems] = useState(0);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const skip = (page - 1) * pageSize;
      const res = await api.get('/api/logs/', {
        params: {
          skip,
          limit: pageSize
        }
      });
      // Handle response structure change
      if (res.data.data) {
        setLogs(res.data.data);
        setTotalItems(res.data.total);
      } else {
        setLogs(res.data); // Fallback
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000); // Polling for live updates
    return () => clearInterval(interval);
  }, [page, pageSize]); // Re-fetch when page changes

  const getLevelColor = (level) => {
    switch (level) {
      case 'INFO': return '#3b82f6';
      case 'WARN': return '#f59e0b';
      case 'ERROR': return '#ef4444';
      default: return '#94a3b8';
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '2rem' }}>Logs do Sistema</h1>
        <button className="btn" onClick={fetchLogs} disabled={loading}>
          <RefreshCcw size={16} className={loading ? 'spin' : ''} /> Atualizar
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
                <th style={{ width: '180px', padding: '0.8rem', textAlign: 'left' }}>Data</th>
                <th style={{ width: '80px', padding: '0.8rem', textAlign: 'left' }}>Nível</th>
                <th style={{ width: '250px', padding: '0.8rem', textAlign: 'left' }}>Contexto</th>
                <th style={{ padding: '0.8rem', textAlign: 'left' }}>Mensagem</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <td style={{ padding: '0.8rem' }}>{formatDateTime(log.created_at)}</td>
                  <td style={{ padding: '0.8rem' }}>
                    <span style={{
                      color: getLevelColor(log.level),
                      fontWeight: 'bold',
                      fontSize: '0.9rem'
                    }}>
                      {log.level}
                    </span>
                  </td>
                  <td style={{ padding: '0.8rem' }}>
                    {log.paciente && <div style={{ fontWeight: '500', color: '#fff' }}>{log.paciente}</div>}
                    {log.carteirinha && <div style={{ fontSize: '0.8rem', color: '#aaa' }}>{log.carteirinha}</div>}
                    {log.job_id && <div style={{ fontSize: '0.75rem', color: '#666' }}>Job #{log.job_id}</div>}
                    {!log.carteirinha && !log.job_id && <span style={{ color: '#666' }}>-</span>}
                  </td>
                  <td style={{ padding: '0.8rem', fontFamily: 'monospace', fontSize: '0.9rem', color: '#ddd', whiteSpace: 'pre-wrap' }}>
                    {log.message}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>Nenhum log registrado.</td></tr>
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
      </div>
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
