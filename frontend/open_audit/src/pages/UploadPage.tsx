import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [fileError, setFileError] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFile = e.target.files[0];
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
      
      const fileName = selectedFile.name.toLowerCase();
      const fileExtension = fileName.split('.').pop() || '';
      
      if (allowedTypes.includes(selectedFile.type) && allowedExtensions.includes(fileExtension)) {
        setFile(selectedFile);
        setFileError('');
      } else {
        setFile(null);
        setFileError('Only PDF, JPEG, and PNG files are allowed');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setFileError('Please select a file');
      return;
    }

    setLoading(true);
    setMessage('');
    setFileError('');
    const formData = new FormData();
    formData.append('receipt', file);

    try {
      await axios.post('http://localhost:5000/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage('Receipt uploaded and processed successfully!');
      setFile(null);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (error: any) {
      setMessage(error.response?.data?.error || 'Failed to upload receipt.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Receipt Upload</h1>
          <p className="text-gray-600 mb-8">Upload your receipts for expense tracking and AI-powered analysis</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 bg-blue-50 transition hover:border-blue-500">
              <div className="flex flex-col items-center">
                <svg className="w-16 h-16 text-blue-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                  disabled={loading}
                />
                <p className="text-sm text-gray-600 mt-3">Supported formats: PDF, JPEG, PNG (Max 10MB)</p>
              </div>
            </div>

            {fileError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {fileError}
              </div>
            )}

            {file && (
              <div className="bg-green-50 border border-green-300 rounded-lg p-4">
                <p className="text-green-800 font-semibold">Selected: {file.name}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !file || !!fileError}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Uploading...' : 'Upload Receipt'}
            </button>
          </form>

          {message && (
            <div className={`mt-6 p-4 rounded-lg ${message.includes('successfully') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UploadPage;