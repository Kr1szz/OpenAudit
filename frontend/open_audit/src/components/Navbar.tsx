import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/dashboard" className="text-xl font-bold">Open Audit</Link>
        <div className="flex items-center space-x-4">
          <span>Welcome, {user?.name}</span>
          <Link to="/dashboard" className="hover:underline">Dashboard</Link>
          <Link to="/upload" className="hover:underline">Upload</Link>
          <Link to="/tax" className="hover:underline">Tax Calculator</Link>
          {user?.role === 'admin' && (
            <Link to="/admin" className="hover:underline">Admin</Link>
          )}
          <button onClick={handleLogout} className="hover:underline">Logout</button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;