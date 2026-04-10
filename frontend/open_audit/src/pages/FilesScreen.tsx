import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const DOC_TYPES = ["Rent Receipt", "Form 16", "Investment Proof", "Medical Bills", "Bank Statement"];

interface Receipt {
  id: number;
  vendor: string;
  amount: number;
  currency: string;
  receipt_date: string;
  category: string;
  file_path: string;
  file_type: string;
  created_at: string;
  is_flagged: boolean;
  anomaly_reasons: string[];
}

function FilesScreen() {
  const [activeType, setActiveType] = useState("Rent Receipt");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/receipts', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setReceipts(response.data.receipts || []);
    } catch (err) {
      console.error('Failed to fetch receipts', err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setActiveType(e.target.value);
  };

  const handleUpload = async () => {
    if (!file) {
      setToast("Please browse and select a file first");
      setTimeout(() => setToast(""), 2500);
      return;
    }
    setLoading(true);
    setToast("");

    const formData = new FormData();
    formData.append('receipt', file);
    formData.append('category', activeType);

    try {
      await axios.post('http://localhost:5000/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
      });
      setToast("Uploaded to vault successfully");
      setFile(null);
      setShowUploadModal(false);
      fetchReceipts();
    } catch (err) {
      console.error(err);
      setToast((err as any)?.response?.data?.error || "Error uploading file");
    } finally {
      setLoading(false);
      setTimeout(() => setToast(""), 3000);
    }
  };

  const handlePreview = (filePath: string) => {
    const normalizedPath = filePath.replace(/\\/g, '/');
    const url = `http://localhost:5000/${normalizedPath}`;
    console.log('Preview URL:', url);
    fetch(url).then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      window.open(url, '_blank');
    }).catch(err => {
      console.error('Preview error:', err);
      setToast(`Cannot preview file: ${(err as any).message}`);
      setTimeout(() => setToast(""), 3000);
    });
  };

  const handleDownload = async (filePath: string, fileName: string) => {
    try {
      const normalizedPath = filePath.replace(/\\/g, '/');
      const url = `http://localhost:5000/${normalizedPath}`;
      console.log('Download URL:', url);
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      const objUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(objUrl);
    } catch (e) {
      console.error('Download error:', e);
      setToast(`Failed to download: ${(e as any).message}`);
      setTimeout(() => setToast(""), 3000);
    }
  };

  const handleDelete = async (receiptId: number) => {
    if (!window.confirm('Delete this file permanently?')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/receipts/${receiptId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setToast('File deleted successfully');
      fetchReceipts();
    } catch (err) {
      console.error('Delete error:', err);
      setToast((err as any)?.response?.data?.error || 'Failed to delete file');
    } finally {
      setTimeout(() => setToast(''), 3000);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '1400px', paddingTop: '10px' }}>
      <div className="history-wrapper" style={{ overflow: 'hidden', maxHeight: 'calc(100vh - 180px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid #e2e8f0' }}>
            <div className="page-title" style={{ margin: 0, fontSize: '1.2rem' }}>Files</div>
            <button
              onClick={() => setShowUploadModal(true)}
              style={{
                padding: '8px 16px',
                background: '#0d6efd',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem'
              }}
            >
              Upload Document
            </button>
          </div>

          {receipts.length > 0 ? (
            <div style={{ width: '100%', height: '100%', overflowY: 'auto', minHeight: 0 }}>
              <table className="history-table" style={{ border: 'none', borderRadius: '15px', textAlign: 'left', width: '100%' }}>
                <thead>
                  <tr>
                    <th style={{ background: '#f8fafc', textAlign: 'left', padding: '16px 20px' }}>VENDOR</th>
                    <th style={{ background: '#f8fafc', textAlign: 'left', padding: '16px 20px' }}>AMOUNT</th>
                    <th style={{ background: '#f8fafc', textAlign: 'left', padding: '16px 20px' }}>CATEGORY</th>
                    <th style={{ background: '#f8fafc', textAlign: 'left', padding: '16px 20px' }}>FLAGS</th>
                    <th style={{ background: '#f8fafc', textAlign: 'left', padding: '16px 20px' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {receipts.map(r => (
                    <tr key={r.id}>
                      <td className="bold" style={{ textAlign: 'left', padding: '16px 20px' }}>{r.vendor}</td>
                      <td className="mono" style={{ textAlign: 'left', padding: '16px 20px' }}>{r.amount} {r.currency}</td>
                      <td style={{ textAlign: 'left', padding: '16px 20px' }}>{r.category}</td>
                      <td style={{ textAlign: 'left', padding: '16px 20px' }}>
                        {r.is_flagged ? (
                          <span style={{ color: '#e74c3c', fontWeight: 600 }}>
                            Flagged: {r.anomaly_reasons?.join(', ') || 'Review needed'}
                          </span>
                        ) : (
                          <span style={{ color: '#1a9e5c' }}>Clean</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'left', padding: '16px 20px' }}>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <button onClick={() => handlePreview(r.file_path)} title="Preview file" style={{ padding: '6px 12px', background: '#0d6efd', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s' }}>Preview</button>
                          <button onClick={() => handleDownload(r.file_path, `${r.vendor}_${r.id}.${(r.file_type || '').split('/')[1] || 'pdf'}`)} title="Download file" style={{ padding: '6px 12px', background: '#1a9e5c', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s' }}>Download</button>
                          <button onClick={() => handleDelete(r.id)} title="Delete file" style={{ padding: '6px 12px', background: '#e53935', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s' }}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '60px', textAlign: 'center', color: '#6b7280' }}>
              No documents uploaded yet. Click "Upload Document" to add your first document.
            </div>
          )}
        </div>

      {showUploadModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '24px',
            padding: '40px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ marginBottom: '20px', textAlign: 'center' }}>Upload Document</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <select
                value={activeType}
                onChange={handleTypeChange}
                style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  color: '#000',
                  fontSize: '0.95rem',
                }}
              >
                {DOC_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
                style={{
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  background: '#f8fafc'
                }}
              />

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button
                  onClick={handleUpload}
                  disabled={loading}
                  style={{
                    padding: '12px 24px',
                    background: '#0d6efd',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: 600
                  }}
                >
                  {loading ? 'Uploading...' : 'Upload'}
                </button>
                <button
                  onClick={() => setShowUploadModal(false)}
                  style={{
                    padding: '12px 24px',
                    background: '#6c757d',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: toast.toLowerCase().includes('successfully') ? '#1a9e5c' : '#e74c3c',
          color: '#fff',
          padding: '12px 20px',
          borderRadius: '8px',
          fontWeight: 600,
          zIndex: 1001
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}

export default FilesScreen;