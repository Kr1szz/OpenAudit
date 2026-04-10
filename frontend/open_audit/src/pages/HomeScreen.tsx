import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import type { Screen } from '../types/index.ts';
import { SpendingChart } from '../components/SpendingChart.tsx';
import {useAuth} from "../contexts/AuthContext.tsx";

type ReceiptRow = {
  amount?: number | string;
  category?: string;
  receipt_date?: string;
  created_at?: string;
  is_flagged?: boolean;
};

type TaxHistoryRow = {
  annualincome?: number;
  investments_80c?: number;
  other_deductions?: number;
  rent_paid?: number;
  created_at?: string;
};

function HomeScreen({ onNav }: { onNav: (s: Screen) => void }) {
  const [receipts, setReceipts] = useState<ReceiptRow[]>([]);
  const [taxHistory, setTaxHistory] = useState<TaxHistoryRow[]>([]);
  const { user } = useAuth();

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

  useEffect(() => {
    const fetchTaxHistory = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/tax/history', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setTaxHistory(response.data.history || []);
      } catch (error) {
        console.error('Error fetching tax history:', error);
      }
    };
    fetchTaxHistory();
  }, []);

  const totalSpent = useMemo(() => receipts.reduce((sum, r) => sum + (Number(r.amount) || 0), 0), [receipts]);

  const canonicalizeCategory = (value: string) => {
    const raw = String(value || '').trim().toLowerCase();
    if (!raw) return 'Other';
    if (raw === 'rent receipt' || raw.includes('rent') || raw.includes('hra')) return 'Rent Receipt';
    if (raw === 'form 16' || raw === 'form16' || raw.includes('form16')) return 'Form 16';
    if (raw === 'investment proof' || raw.includes('invest') || raw.includes('80c') || raw.includes('proof')) return 'Investment Proof';
    if (raw === 'medical bills' || raw.includes('medical') || raw.includes('health') || raw.includes('hospital')) return 'Medical Bills';
    if (raw === 'bank statement' || raw.includes('bank') || raw.includes('statement')) return 'Bank Statement';
    return 'Other';
  };

  const taxDeductible = useMemo(() => {
    const eligibleTypes = new Set(["Investment Proof", "Medical Bills", "Rent Receipt", "Form 16"]);
    return receipts
      .filter(r => eligibleTypes.has(canonicalizeCategory(String(r.category || ''))))
      .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  }, [receipts]);

  const flagsCount = useMemo(() => receipts.filter((r) => Boolean(r.is_flagged)).length, [receipts]);

  const latestTaxEntry = useMemo(() => {
    if (!taxHistory.length) return null;
    return [...taxHistory].sort((a, b) =>
      new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    )[0];
  }, [taxHistory]);

  const latestAnnualIncome = Number(latestTaxEntry?.annualincome || 0);

  const latestFormExpenses = useMemo(() => {
    if (!latestTaxEntry) return 0;
    return (
      Number(latestTaxEntry.investments_80c || 0) +
      Number(latestTaxEntry.other_deductions || 0) +
      Number(latestTaxEntry.rent_paid || 0)
    );
  }, [latestTaxEntry]);

  const chartSeries = useMemo(() => {
    const monthKeys = Array.from({ length: 7 }, (_, idx) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (6 - idx));
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    });

    const monthLabels = Array.from({ length: 7 }, (_, idx) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (6 - idx));
      return d.toLocaleString('en-US', { month: 'short' });
    });

    const receiptTotalsByMonth: Record<string, number> = Object.fromEntries(monthKeys.map(m => [m, 0]));

    receipts.forEach((r) => {
      const rawDate = r.receipt_date || r.created_at;
      if (!rawDate) {
        // Receipts with no date go to latest month
        receiptTotalsByMonth[monthKeys[monthKeys.length - 1]] += Number(r.amount || 0);
        return;
      }
      const d = new Date(rawDate);
      if (Number.isNaN(d.getTime())) {
        // Bad date format: add to latest month
        receiptTotalsByMonth[monthKeys[monthKeys.length - 1]] += Number(r.amount || 0);
        return;
      }
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (key in receiptTotalsByMonth) {
        receiptTotalsByMonth[key] += Number(r.amount || 0);
      } else {
        // Receipt outside 7-month window: add to latest month
        receiptTotalsByMonth[monthKeys[monthKeys.length - 1]] += Number(r.amount || 0);
      }
    });

    const expenseSeries = monthKeys.map((m, idx) => {
      const receiptValue = receiptTotalsByMonth[m] || 0;
      // Include form-derived expenses in the latest month bucket.
      return idx === monthKeys.length - 1 ? receiptValue + latestFormExpenses : receiptValue;
    });

    const monthlyIncome = latestAnnualIncome > 0 ? latestAnnualIncome / 12 : 0;
    const incomeSeries = monthKeys.map(() => monthlyIncome);

    if (expenseSeries.some(e => e > 0)) {
      console.log('Chart data:', { 
        expenseSeries, 
        incomeSeries, 
        labels: monthLabels,
        totalReceipts: receipts.length,
        latestFormExpenses 
      });
    }

    return { incomeSeries, expenseSeries, labels: monthLabels };
  }, [receipts, latestAnnualIncome, latestFormExpenses]);

  return (
      <div className="home-wrapper">
        <div className="dashboard-header">
          <div className="dashboard-greeting">
            <h1><span className="bold">Welcome</span> Back!<br/><span className="bold capitalize">{user?.name}</span></h1><br/>
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
            <div className="top-stat-card" style={flagsCount > 0 ? { background: '#fef2f2', borderColor: '#fecaca', borderWidth: '1px' } : {}}>
              <div className="top-stat-label"><span className="bold">Audit</span> Flag</div>
              <div className="top-stat-value" style={flagsCount > 0 ? { color: flagsCount > 2 ? '#dc2626' : '#f97316' } : { color: '#16a34a' }}>
                {flagsCount > 0 ? (
                  <>
                    <span style={{ marginRight: '4px' }}>⚠</span>
                    {flagsCount}
                  </>
                ) : (
                  <>
                    <span style={{ marginRight: '4px' }}>✓</span>
                    0
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="home-body-grid">
          <div className="chart-box">
            <h3>Spending Breakdown</h3>
            <div style={{ position: 'relative', height: '220px' }}>
              <SpendingChart
                title="Income vs Expenses"
                incomeSeries={chartSeries.incomeSeries}
                expenseSeries={chartSeries.expenseSeries}
                labels={chartSeries.labels}
              />
            </div>
          </div>

          <div className="action-pills">
            <button className="home-action-btn" onClick={() => onNav("calculator")}>
              <span className="bold">Calculate</span> Tax
            </button>
            <button className="home-action-btn" onClick={() => onNav("files")}>
              <span className="bold">Upload</span> Receipt
            </button>
            <button className="home-action-btn" onClick={() => onNav("history")}>
              <span className="bold">View</span> History
            </button>
          </div>
        </div>
      </div>
  );
}
export default HomeScreen;