import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

interface Receipt {
  id: number;
  vendor: string;
  amount: number;
  receipt_date: string;
  flag: boolean;
  image_url: string;
  created_at: string;
}

function DashboardPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);

  const fetchReceipts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/receipts');
      const receiptsData = Array.isArray(response.data)
        ? response.data
        : response.data?.receipts || [];
      setReceipts(receiptsData);
      console.log('Fetched receipts:', receiptsData);
    } catch (error) {
      console.error('Error fetching receipts:', error);
      setReceipts([]);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => fetchReceipts());
  }, []);

  const totalExpense = useMemo(() => {
    return receipts.reduce((sum, receipt) => sum + (Number(receipt.amount) || 0), 0);
  }, [receipts]);

  const flaggedCount = useMemo(() => {
    return receipts.filter(receipt => receipt.flag).length;
  }, [receipts]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Receipts Dashboard</h1>
      <div className="mb-4 grid grid-cols-2 gap-4">
        <div className="bg-green-100 p-4 rounded">
          <h2 className="text-lg font-semibold">Total Expenses</h2>
          <p className="text-2xl">Rs.{totalExpense.toFixed(2)}</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded">
          <h2 className="text-lg font-semibold">Flagged Receipts</h2>
          <p className="text-2xl">{flaggedCount}</p>
        </div>
      </div>
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Flagged</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {receipts.map((receipt) => (
              <tr key={receipt.id} className={receipt.flag ? 'bg-red-50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{receipt.vendor}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rs.{Number(receipt.amount).toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{receipt.receipt_date?.split('T')[0]}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {receipt.flag ? 'Yes' : 'No'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {receipts.length === 0 && (
          <p className="p-4 text-gray-500">No receipts uploaded yet.</p>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;