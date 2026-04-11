import { useEffect, useState } from 'react';
import axios from 'axios';
import type { HistoryEntry } from '../types/index.ts';

function HistoryScreen() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get((import.meta.env.VITE_API_URL || 'https://openaudit.onrender.com') + '/api/tax/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(response.data.history || []);
      console.log(response.data.history);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to load history from database');
    } finally {
      setLoading(false);
    }
  };

  const deleteEntry = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL || 'https://openaudit.onrender.com'}/api/tax/history/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(prev => prev.filter(entry => entry.id !== id));
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to delete entry');
    }
  };

  const clearAllHistory = async () => {
    if (!confirm('Are you sure you want to clear all tax history? This action cannot be undone.')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete((import.meta.env.VITE_API_URL || 'https://openaudit.onrender.com') + '/api/tax/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory([]);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to clear history');
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="screen">
      <div className="history-wrapper">
        

        <div className="history-header">
          <button
            onClick={fetchHistory}
            disabled={loading}
            className="table-btn table-btn-blue"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <div className="page-title" style={{ fontSize: '1.7rem', marginBottom: 0 }}>History</div>
          {history.length > 0 ? (
            <button
              onClick={clearAllHistory}
              className="table-btn table-btn-red"
            >
              Clear All
            </button>
          ) : (
            <div className="history-header-spacer" />
          )}
        </div>

        <div className="history-table-wrapper">
          <table className="history-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Annual Income</th>
                <th>Old Regime Tax</th>
                <th>New Regime Tax</th>
                <th>Recommendation</th>
                <th>Savings</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: '30px', color: '#6b7280', textAlign: 'center' }}>
                    Loading history...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} style={{ padding: '30px', color: '#e74c3c', textAlign: 'center' }}>
                    {error}
                  </td>
                </tr>
              ) : history.length > 0 ? (
                history.map((entry, idx) => {
                  const d = new Date(entry.created_at);
                  return (
                    <tr key={idx}>
                      <td>{d.toLocaleDateString()}</td>
                      <td className="mono">{entry.annualincome}</td>
                      <td className="mono">{entry.calculated_old_tax?.toLocaleString()}</td>
                      <td className="mono">{entry.calculated_new_tax?.toLocaleString()}</td>
                      <td style={{ color: '#0d6efd' }} className="bold">{entry.recommendation}</td>
                      <td style={{ color: '#1a9e5c' }} className="mono bold">{entry.savings?.toLocaleString()}</td>
                      <td>
                        <button
                          onClick={() => deleteEntry(entry.id)}
                          className="table-btn table-btn-red"
                          style={{ padding: '4px 8px' }}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} style={{ padding: '30px', color: '#6b7280', textAlign: 'center' }}>
                    No history recorded yet. Run a tax analysis to see your past calculations here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default HistoryScreen;