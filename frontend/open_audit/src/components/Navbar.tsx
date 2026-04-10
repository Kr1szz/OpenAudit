import { useState } from 'react';
import type { Screen } from '../types/index.ts';

function Navbar({ screen, onNav }: { screen: Screen; onNav: (s: Screen) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  
  let initials = "U";
  try {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const name = payload.name || "User";
      const parts = name.trim().split(' ');
      if (parts.length > 1) {
        initials = parts[0][0].toUpperCase() + parts[1][0].toUpperCase();
      } else {
        initials = parts[0][0].toUpperCase();
      }
    }
  } catch(e) {}

  const handleSignOut = () => {
    localStorage.removeItem('token');
    onNav("splash");
  };

  const handleDelete = () => {
    if(window.confirm("Are you sure you want to delete your account?")) {
      localStorage.removeItem('token');
      onNav("splash");
    }
  };

  return (
    <div className="navbar-wrapper">
      <nav className="navbar">
        <div className="navbar-brand">Open <span>Audit</span></div>
        <div className="navbar-links">
          {(["home","calculator","history","files"] as Screen[]).map(s => (
            <button key={s} className={`nav-link ${screen === s ? "underline" : ""}`} onClick={() => onNav(s)}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
          
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <button 
              className="navbar-user" 
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {initials}
            </button>
            
            {menuOpen && (
              <div style={{
                position: 'absolute', top: '100%', right: '0', marginTop: '12px',
                background: 'white', borderRadius: '12px', 
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)', border: '1px solid var(--border)',
                padding: '6px 0', minWidth: '140px', zIndex: 1000
              }}>
                <button 
                  onClick={handleSignOut} 
                  style={{ display: 'block', width: '100%', padding: '10px 20px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', color: '#111827', fontSize: '0.88rem', fontWeight: 600, transition: 'background 0.2s' }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(13, 110, 253, 0.05)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                >
                  Sign Out
                </button>
                <button 
                  onClick={handleDelete} 
                  style={{ display: 'block', width: '100%', padding: '10px 20px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', color: '#dc2626', fontSize: '0.88rem', fontWeight: 600, transition: 'background 0.2s' }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(220, 38, 38, 0.05)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
}
export default Navbar;