import {useState} from 'react';
import axios from 'axios';
import type { Screen } from '../types/index.ts';

function LoginScreen({ onNav }: { onNav: (s: Screen) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in both fields");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const resp = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      if (resp.data.token) {
        localStorage.setItem('token', resp.data.token);
        onNav("home");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed");
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
          <button className="btn-primary" disabled={loading} onClick={handleLogin}>
             {loading ? 'Logging in...' : 'Login!'}
          </button>
          <div className="auth-footer">New to Open Audit? <a onClick={() => onNav("register")}>Register here</a></div>
        </div>
      </div>
    </div>
  );
}

export default LoginScreen;