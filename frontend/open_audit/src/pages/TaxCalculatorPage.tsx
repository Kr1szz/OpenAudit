import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import type { HistoryEntry } from '../types/index.ts';
import ShareReport from '../components/ShareReports';

interface ReceiptRow {
  id: number;
  vendor: string;
  amount: number;
  category: string;
  is_flagged: boolean;
}

function CalculatorScreen({ onAddHistory }: { onAddHistory: (e: HistoryEntry) => void }) {
  const [basic, setBasic] = useState({ income: "", investments80c: "", rent: "" });
  const [advanced, setAdvanced] = useState({ medical: "", nps: "", eduLoan: "" });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [receipts, setReceipts] = useState<ReceiptRow[]>([]);

  // Fetch receipts on mount so user sees what will be included
  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        const resp = await axios.get('http://localhost:5000/api/receipts', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const data = Array.isArray(resp.data) ? resp.data : (resp.data?.receipts || []);
        setReceipts(data);
      } catch (e) {
        console.error('Failed to fetch receipts for calculator:', e);
      }
    };
    fetchReceipts();
  }, []);

  // Summarize valid (non-flagged) receipts by category
  const receiptSummary = useMemo(() => {
    const valid = receipts.filter(r => !r.is_flagged);
    const total = valid.reduce((s, r) => s + (Number(r.amount) || 0), 0);
    return { count: valid.length, total };
  }, [receipts]);

  const handleCompute = async () => {
    if (!basic.income || Number(basic.income) <= 0) {
      setError("Please enter a valid annual income");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const payload = {
        annualIncome: Number(basic.income) || 0,
        investments: Number(basic.investments80c) || 0,
        otherDeductions: (Number(advanced.medical) || 0) + (Number(advanced.eduLoan) || 0) + (Number(advanced.nps) || 0),
        rentPaid: Number(basic.rent) || 0,
        includeReceipts: true  // Tell backend to pull receipt data into deductions
      };

      const resp = await axios.post('http://localhost:5000/api/tax/calculate', payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      const data = resp.data;

      const mappedResult = {
        oldRegimeTax: data.oldRegime?.tax || 0,
        newRegimeTax: data.newRegime?.tax || 0,
        recommendation: data.recommendation || 'New Regime',
        savings: data.savings || 0,
        finalTax: data.finalTax || Math.min(data.oldRegime?.tax || 0, data.newRegime?.tax || 0),
        payload_record: payload
      };

      setResult(mappedResult);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to calculate tax");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveResult = async () => {
    if (!result) return;

    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const payload = {
        annualIncome: result.payload_record?.annualIncome || Number(basic.income) || 0,
        investments: result.payload_record?.investments || Number(basic.investments80c) || 0,
        otherDeductions: result.payload_record?.otherDeductions || (Number(advanced.medical) || 0) + (Number(advanced.eduLoan) || 0) + (Number(advanced.nps) || 0),
        rentPaid: result.payload_record?.rentPaid || Number(basic.rent) || 0,
        oldRegimeTax: result.oldRegimeTax,
        newRegimeTax: result.newRegimeTax,
        finalTax: result.finalTax,
        savings: result.savings,
        recommendation: result.recommendation,
      };

      const response = await axios.post('http://localhost:5000/api/tax/save', payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setResult((prev: any) => ({ ...prev, savedRecord: response.data.record }));

      onAddHistory({
        created_at: new Date().toISOString(),
        annualincome: payload.annualIncome,
        calculated_old_tax: payload.oldRegimeTax,
        calculated_new_tax: payload.newRegimeTax,
        recommendation: payload.recommendation,
        savings: payload.savings
      });

      setSuccess("Tax analysis saved successfully.");
      setTimeout(() => {
        setSuccess("");
      }, 2000);
    } catch (err) {
      console.error(err);
      setError((err as any)?.response?.data?.error || "Failed to save tax analysis");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="screen">
      <div className="mesh-bg" />
      <div className="page-container">
        <div className="page-title">Tax Calculator</div>

        <div className="calc-wrapper" style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: '24px', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
            <div className="calc-card" style={{ padding: '24px', borderRadius: '24px', background: '#fff', boxShadow: '0 24px 80px rgba(15, 23, 42, 0.04)', minWidth: 0 }}>
              <div className="calc-section-title">Basic Details</div>
              <div className="field-group">
                <input className="input" placeholder="Annual Income" type="number" value={basic.income} onChange={e => setBasic({ ...basic, income: e.target.value })} />
              </div>
              <div className="field-group">
                <input className="input" placeholder="80C Investments" type="number" value={basic.investments80c} onChange={e => setBasic({ ...basic, investments80c: e.target.value })} />
              </div>
              <div className="field-group">
                <input className="input" placeholder="Rent Paid for HRA" type="number" value={basic.rent} onChange={e => setBasic({ ...basic, rent: e.target.value })} />
              </div>
            </div>

            <div className="calc-card" style={{ padding: '24px', borderRadius: '24px', background: '#fff', boxShadow: '0 24px 80px rgba(15, 23, 42, 0.04)' }}>
              <div className="calc-section-title">Advanced Deductions</div>
              <div className="field-group">
                <input className="input" placeholder="Medical" type="number" value={advanced.medical} onChange={e => setAdvanced({ ...advanced, medical: e.target.value })} />
              </div>
              <div className="field-group">
                <input className="input" placeholder="NPS" type="number" value={advanced.nps} onChange={e => setAdvanced({ ...advanced, nps: e.target.value })} />
              </div>
              <div className="field-group">
                <input className="input" placeholder="Edu Loan" type="number" value={advanced.eduLoan} onChange={e => setAdvanced({ ...advanced, eduLoan: e.target.value })} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <button className="run-pill" onClick={handleCompute} disabled={loading} style={{ flex: '1 1 220px', marginRight:'15px', background: '#1d6dff', color: '#fff', border: '1px solid #1d6dff' }}>
                {loading ? 'Analyzing...' : 'Run Tax Analysis'}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="calc-card" style={{ padding: '24px', borderRadius: '24px', background: '#fff', boxShadow: '0 24px 80px rgba(15, 23, 42, 0.04)', minHeight: '340px' }}>
              <div className="calc-section-title">Tax Result</div>
              {result ? (
                <div style={{ display: 'grid', gap: '18px', marginTop: '18px' }}>
                  <div>
                    <div className="field-label">Old Regime Tax</div>
                    <div className="mono bold" style={{ fontSize: '1.25rem' }}>{(result.oldRegimeTax || 0).toLocaleString('en-IN')} Rs</div>
                  </div>
                  <div>
                    <div className="field-label">New Regime Tax</div>
                    <div className="mono bold" style={{ fontSize: '1.25rem' }}>{(result.newRegimeTax || 0).toLocaleString('en-IN')} Rs</div>
                  </div>
                  <div>
                    <div className="field-label" style={{ color: '#0d6efd' }}>Recommendation</div>
                    <div className="bold" style={{ fontSize: '1rem', color: '#0d6efd' }}>{result.recommendation || "New Regime"}</div>
                  </div>
                  <div>
                    <div className="field-label" style={{ color: '#1a9e5c' }}>Total Savings</div>
                    <div className="mono bold" style={{ fontSize: '1.25rem', color: '#1a9e5c' }}>{(result.savings || 0).toLocaleString('en-IN')} Rs</div>
                  </div>

                  <div style={{ display: 'flex', gap: '14px', marginTop: '24px' }}>
                    <button className="run-pill" onClick={handleSaveResult} disabled={saving} style={{ flex: 1 }}>
                      {saving ? 'Saving...' : 'Save Analysis'}
                    </button>
                    <button className="run-pill" onClick={() => { setResult(null); setError(""); setSuccess(""); }} style={{ flex: 1, background: '#f8fafc', color: '#000', border: '1px solid #e2e8f0' }}>
                      Recalculate
                    </button>
              
                  </div>
                  {result.savedRecord?.id && (
                    <ShareReport fileUrl={`http://localhost:5000/reports/${result.savedRecord.id}/download`} />
                  )}
                </div>
              ) : (
                <div style={{ marginTop: '18px', color: '#6b7280', lineHeight: 1.7 }}>
                  Run the tax analysis to see the result here. Once you are happy with the numbers, click Save Analysis to persist it.
                </div>
              )}
            </div>

            

            <div style={{ minHeight: '68px', padding: '20px', borderRadius: '24px', background: '#fff', boxShadow: '0 24px 80px rgba(15, 23, 42, 0.04)', border: '1px solid #e2e8f0', marginRight:'15px'}}>
              {error ? (
                <div style={{ color: '#e74c3c', textAlign: 'center', fontWeight: 600 }}>{error}</div>
              ) : success ? (
                <div style={{ color: '#1a9e5c', textAlign: 'center', fontWeight: 600 }}>{success}</div>
              ) : (
                <div style={{ color: '#6b7280', textAlign: 'center' }}>
                  Messages and status appear here after running or saving tax analysis.
                </div>
              )}
            </div>

            {receiptSummary.count > 0 && (
              <div style={{ padding: '14px 20px', borderRadius: '12px', background: '#eef6ff', border: '1px solid #c8dbfa', fontSize: '0.88rem', color: '#0f1f4b', marginRight:'15px'}}>
                <strong>{receiptSummary.count}</strong> receipt{receiptSummary.count > 1 ? 's' : ''} worth <strong>{receiptSummary.total.toLocaleString('en-IN')} Rs</strong> will be auto-included in deductions
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CalculatorScreen;