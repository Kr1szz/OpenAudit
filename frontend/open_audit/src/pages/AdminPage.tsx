import { useState, useEffect } from 'react';
import axios from 'axios';

interface Receipt {
  id: number;
  vendor: string;
  amount: number;
  date: string;
  flag: boolean;
  image_url: string;
  created_at: string;
  user_id: number;
}

function AdminPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/receipts');
      setReceipts(response.data);
    } catch (error) {
      console.error('Error fetching receipts:', error);
    }
  };

  const totalExpense = receipts.reduce((sum, receipt) => sum + receipt.amount, 0);
  const flaggedCount = receipts.filter(receipt => receipt.flag).length;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <div className="mb-4 grid grid-cols-2 gap-4">
        <div className="bg-blue-100 p-4 rounded">
          <h2 className="text-lg font-semibold">Total Expenses</h2>
          <p className="text-2xl">${totalExpense.toFixed(2)}</p>
        </div>
        <div className="bg-red-100 p-4 rounded">
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Flagged</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {receipts.map((receipt) => (
              <tr key={receipt.id} className={receipt.flag ? 'bg-red-50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{receipt.vendor}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${receipt.amount.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{receipt.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{receipt.user_id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {receipt.flag ? 'Yes' : 'No'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {receipts.length === 0 && (
          <p className="p-4 text-gray-500">No receipts found.</p>
        )}
      </div>
    </div>
  );
}

export default AdminPage;