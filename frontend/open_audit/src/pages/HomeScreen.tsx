import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import type { Screen } from '../types/index.ts';
import { SpendingChart } from '../components/SpendingChart.tsx';

function HomeScreen({ onNav }: { onNav: (s: Screen) => void }) {
  const [receipts, setReceipts] = useState<any[]>([]);

  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/receipts', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const receiptsData = Array.isArray(response.data) ? response.data : (response.data?.receipts || []);
        setReceipts(receiptsData);
      } catch (error) {
        console.error('Error fetching receipts:', error);
      }
    };
    fetchReceipts();
  }, []);

  const totalSpent = useMemo(() => receipts.reduce((sum, r) => sum + (Number(r.amount) || 0), 0), [receipts]);

  const taxDeductible = useMemo(() => {
    const eligibleTypes = ["nvestment Proof", "Investment Proof", "Medical Bills", "Rent Receipt", "Form 16"];
    return receipts
      .filter(r => eligibleTypes.some(t => r.category && r.category.includes(t)))
      .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  }, [receipts]);

  const flagsCount = useMemo(() => receipts.filter(r => r.is_flagged).length, [receipts]);

  return (
      <div className="home-wrapper">
        <div className="dashboard-header">
          <div className="dashboard-greeting">
            <h1><span className="bold">Welcome</span> Back!</h1>
            <p>Here is your financial snapshot.</p>
          </div>

          <div className="stat-cards-container">
            <div className="top-stat-card">
              <div className="top-stat-label"><span className="bold">Total</span> Spent</div>
              <div className="top-stat-value">{totalSpent.toLocaleString('en-IN')} <span>Rs</span></div>
            </div>
            <div className="top-stat-card">
              <div className="top-stat-label"><span className="bold">Tax</span> Deduct</div>
              <div className="top-stat-value">{taxDeductible.toLocaleString('en-IN')} <span>Rs</span></div>
            </div>
            <div className="top-stat-card">
              <div className="top-stat-label"><span className="bold">Audit</span> Flag</div>
              <div className="top-stat-value" style={flagsCount > 0 ? { color: '#e74c3c' } : {}}>{flagsCount > 0 ? `${flagsCount} Found` : ''}</div>
            </div>
          </div>
        </div>

        <div className="home-body-grid">
          <div className="chart-box">
            <h3>Spending Breakdown</h3>
            <div style={{ position: 'relative', height: '220px' }}>
              <SpendingChart />
            </div>
          </div>

          <div className="action-pills">
            <button className="pill-btn" onClick={() => onNav("calculator")}>
              <span className="bold">Calculate</span> Tax
            </button>
            <button className="pill-btn" onClick={() => onNav("files")}>
              <span className="bold">Upload</span> Receipt
            </button>
            <button className="pill-btn" onClick={() => onNav("history")}>
              <span className="bold">View</span> History
            </button>
          </div>
        </div>
      </div>
  );
}
export default HomeScreen;