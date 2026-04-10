
import { useState } from 'react';

interface ShareReportProps {
  fileUrl: string;
}

const ShareReport = ({ fileUrl }: ShareReportProps) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const getAuthToken = () => localStorage.getItem('token');

  const fetchPdfBlob = async () => {
    const headers: HeadersInit = {};
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(fileUrl, { headers });
    if (!response.ok) {
      let errorMessage = 'Unable to fetch report file.';
      try {
        const data = await response.json();
        errorMessage = data?.error || errorMessage;
      } catch {
        // Keep the generic message when the server does not return JSON.
      }
      throw new Error(errorMessage);
    }
    return await response.blob();
  };

  const triggerDownload = async () => {
    const blob = await fetchPdfBlob();
    const downloadUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = downloadUrl;
    anchor.download = 'report.pdf';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(downloadUrl);
  };

  const openPdfBlob = (blob: Blob) => {
    const previewUrl = URL.createObjectURL(blob);
    window.open(previewUrl, '_blank', 'noopener,noreferrer');
    setTimeout(() => URL.revokeObjectURL(previewUrl), 60_000);
  };

  const handleShare = async () => {
    setLoading(true);
    setMessage('');

    try {
      if (navigator.share) {
        const blob = await fetchPdfBlob();
        const file = new File([blob], 'Financial_Report.pdf', { type: 'application/pdf' });
        await navigator.share({
          title: 'Financial Report',
          text: 'Here is my report',
          files: [file]
        });
        setMessage('Share sheet opened.');
        return;
      }

      await triggerDownload();
      setMessage('Native sharing is not available. The report download has started.');
    } catch (err: any) {
      setMessage(err?.message || 'Failed to share the report.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fileUrl);
      setMessage('Link copied to clipboard.');
    } catch {
      setMessage('Copy failed. Please copy the link manually.');
    }
  };

  const handlePreview = async () => {
    setLoading(true);
    setMessage('');

    try {
      const blob = await fetchPdfBlob();
      openPdfBlob(blob);
      setMessage('Report preview opened.');
    } catch (err: any) {
      setMessage(err?.message || 'Failed to preview the report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="share-report-panel">
      <div className="calc-section-title share-report-title">Share Report</div>
      <div className="share-report-grid">
        <button
          type="button"
          onClick={handleShare}
          disabled={loading}
          className="run-pill share-report-button share-report-button-primary"
        >
          {loading ? 'Preparing...' : 'Share Report'}
        </button>
        <button
          type="button"
          onClick={handlePreview}
          disabled={loading}
          className="run-pill share-report-button share-report-button-soft"
        >
          Preview Report
        </button>
        <button
          type="button"
          onClick={triggerDownload}
          className="run-pill share-report-button share-report-button-green"
        >
          Download Report
        </button>
        <button
          type="button"
          onClick={handleCopyLink}
          className="run-pill share-report-button share-report-button-gold"
        >
          Copy Link
        </button>
      </div>

      <div className="share-report-manual">
        <p>Manual sharing options:</p>
        <div className="share-report-links">
          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(fileUrl)}`}
            target="_blank"
            rel="noreferrer"
            className="share-report-link share-report-link-whatsapp"
          >
            WhatsApp Link
          </a>
          <a
            href={`mailto:?subject=${encodeURIComponent('Financial Report')}&body=${encodeURIComponent('Here is my report: ' + fileUrl)}`}
            className="share-report-link share-report-link-email"
          >
            Email Link
          </a>
        </div>
      </div>

      {message && <p className="share-report-message">{message}</p>}
    </div>
  );
};

export default ShareReport;
