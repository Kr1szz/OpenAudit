import {useState} from 'react';
import axios from 'axios';
import type { Screen, Role } from '../types/index.ts';

function RegisterScreen({ onNav }: { onNav: (s: Screen) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<Role>("User");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !username) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const payload = {
        name: username,
        email,
        password,
        role: role.toLowerCase()
      };
      const resp = await axios.post((import.meta.env.VITE_API_URL || 'https://openaudit.onrender.com') + '/api/auth/register', payload);
      if (resp.data.token) {
        localStorage.setItem('token', resp.data.token);
        onNav("home");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen">
      <div className="mesh-bg" />
      <div className="auth-screen">
        <div className="auth-title">Open <span>Audit</span></div>
        <div className="auth-card">
          
          {error && <div style={{ color: 'red', textAlign: 'center', marginBottom: '16px', fontSize: '0.85rem', fontWeight: 600 }}>{error}</div>}

          <div className="field-group">
            <span className="field-label">Email</span>
            <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="field-group">
            <span className="field-label">Password</span>
            <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <div className="field-group">
            <span className="field-label">Username</span>
            <input className="input" type="text" value={username} onChange={e => setUsername(e.target.value)} />
          </div>
          <div className="field-group">
            <span className="field-label">Role</span>
            <select className="select" value={role} onChange={e => setRole(e.target.value as Role)}>
              <option value="User">User</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <button className="btn-primary" disabled={loading} onClick={handleRegister}>
             {loading ? 'Registering...' : 'Register!'}
          </button>
          <div className="auth-footer">Have an account already?? <a onClick={() => onNav("login")}>Login</a></div>
        </div>
      </div>
    </div>
  );
}
export default RegisterScreen;