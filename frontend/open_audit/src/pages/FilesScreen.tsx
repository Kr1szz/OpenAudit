import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import type { Receipt } from '../types/index.ts';
const DOC_TYPES = ["Rent Receipt", "Form 16", "Investment Proof", "Medical Bills", "Bank Statement"];



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
      let normalizedPath = filePath.replace(/\\/g, '/');
      // If the path doesn't start with uploads/, assume it needs it or just cleanly prepend the base URL
      if (normalizedPath.startsWith('/')) {
        normalizedPath = normalizedPath.substring(1);
      }
      const url = `http://localhost:5000/${normalizedPath}`;
      console.log('Download URL:', url);
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      const objUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objUrl;
      
      // Ensure the filename has a proper extension
      let finalName = fileName;
      if (!finalName.includes('.')) {
        // Fallback to extract extension from the original filePath or default to pdf
        const extMatch = filePath.match(/\.([a-z0-9]+)$/i);
        const ext = extMatch ? extMatch[1] : 'pdf';
        finalName = `${fileName}.${ext}`;
      }
      
      link.setAttribute('download', finalName);
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
    <div className="screen">
      <div className="history-wrapper" style={{ overflow: 'hidden', maxHeight: 'calc(100vh - 260px)' }}>
          <div className="files-header">
            <div className="page-title" style={{ margin: 0, fontSize: '1.7rem' }}>Files</div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="table-btn table-btn-blue"
              style={{ fontSize: '0.82rem', padding: '6px 12px' }}
            >
              Upload Document
            </button>
          </div>

          {receipts.length > 0 ? (
            <div className="history-table-wrapper" style={{ maxHeight: 'calc(100vh - 320px)' }}>
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Vendor</th>
                    <th>Amount</th>
                    <th>Category</th>
                    <th>Flags</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {receipts.map(r => (
                    <tr key={r.id}>
                      <td className="bold">{r.vendor}</td>
                      <td className="mono">{r.amount} {r.currency}</td>
                      <td>{r.category || 'Other'}</td>
                      <td>
                        {r.is_flagged ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {r.anomaly_reasons && r.anomaly_reasons.length > 0 ? (
                              r.anomaly_reasons.map((reasonObj: any, idx: number) => {
                                let typeStr = '';
                                let severityStr = 'low';
                                
                                if (typeof reasonObj === 'object' && reasonObj !== null) {
                                  typeStr = reasonObj.type || reasonObj.message || 'Flagged';
                                  severityStr = reasonObj.severity ? String(reasonObj.severity).toLowerCase() : 'low';
                                } else {
                                  typeStr = String(reasonObj);
                                  severityStr = typeStr.toLowerCase().includes('high') ? 'high' : typeStr.toLowerCase().includes('medium') ? 'medium' : 'low';
                                }

                                // Format the type (e.g., 'missing_amount' -> 'Missing Amount')
                                typeStr = typeStr.replace(/_/g, ' ')
                                  .split(' - ')[0] // Extract just the type portion
                                  .split(':')[1]?.split(",")[0] || typeStr; // Handle "Type: XYZ" format safely
                                typeStr = typeStr.replace(/["'{}]/g, '').trim(); // Remove quotes, braces, and extra spaces
                                typeStr = typeStr.charAt(0).toUpperCase() + typeStr.slice(1);
                                
                                const color = (severityStr === 'high' || severityStr === 'critical') ? '#dc2626' 
                                            : severityStr === 'medium' ? '#f97316' 
                                            : '#ea580c';

                                return (
                                  <div key={idx} style={{ fontSize: '0.82rem', color, fontWeight: 600 }}>
                                    <span className="capitalize">{typeStr.toString()}</span> 
                                  </div>
                                );
                              })
                            ) : (
                              <div style={{ fontSize: '0.82rem', color: '#e74c3c', fontWeight: 500 }}>
                                • Review needed
                              </div>
                            )}
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.82rem', color: '#16a34a', fontWeight: 500 }}>✓ Clean</div>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button onClick={() => handlePreview(r.file_path)} title="Preview file" className="table-btn table-btn-blue">Preview</button>
                          <button onClick={() => {
                            const originalExt = r.file_path.split('.').pop();
                            const fallbackExt = (r.file_type || '').split('/')[1] || 'pdf';
                            const docExt = (originalExt && originalExt.length <= 4) ? originalExt : fallbackExt;
                            handleDownload(r.file_path, `${r.vendor}_${r.id}.${docExt}`);
                          }} title="Download file" className="table-btn table-btn-green">Download</button>
                          <button onClick={() => handleDelete(r.id)} title="Delete file" className="table-btn table-btn-red">Delete</button>
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