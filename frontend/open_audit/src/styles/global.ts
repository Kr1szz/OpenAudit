export const globalStyles = `@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --navy: #0f1f4b;
    --blue: #4a7fe4;
    --blue-light: #6f9ff7;
    --amber: #d4920a;
    --amber-light: #f0b94a;
    --bg: #f7f8fc;
    --card: #ffffff;
    --text: #0f1f4b;
    --muted: #8a94b2;
    --border: rgba(15,31,75,0.08);
    --blur-blue: rgba(74,127,228,0.18);
    --blur-amber: rgba(212,146,10,0.18);
    --shadow: 0 4px 24px rgba(15,31,75,0.08);
    --shadow-md: 0 8px 40px rgba(15,31,75,0.12);
  }
 
  body {
    font-family: 'Sora', sans-serif;
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    overflow-x: hidden;
  }
 
  /* Mesh background */
  .mesh-bg {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    overflow: hidden;
  }
  .mesh-bg::before {
    content: '';
    position: absolute;
    width: 520px; height: 520px;
    background: radial-gradient(circle, var(--blur-blue) 0%, transparent 70%);
    top: -80px; left: -120px;
    border-radius: 50%;
    animation: drift1 12s ease-in-out infinite alternate;
  }
  .mesh-bg::after {
    content: '';
    position: absolute;
    width: 480px; height: 480px;
    background: radial-gradient(circle, var(--blur-amber) 0%, transparent 70%);
    bottom: -80px; right: -100px;
    border-radius: 50%;
    animation: drift2 14s ease-in-out infinite alternate;
  }
  @keyframes drift1 { from { transform: translate(0,0) scale(1); } to { transform: translate(40px,30px) scale(1.08); } }
  @keyframes drift2 { from { transform: translate(0,0) scale(1); } to { transform: translate(-30px,-20px) scale(1.06); } }
 
  /* Layout */
  .screen { position: relative; z-index: 1; min-height: 100vh; }
 
  /* Navbar */
  .navbar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 40px;
    height: 60px;
    background: linear-gradient(90deg, var(--navy) 0%, var(--blue) 100%);
    position: sticky; top: 0; z-index: 100;
    box-shadow: 0 2px 16px rgba(15,31,75,0.2);
  }
  .navbar-brand { font-size: 1.25rem; font-weight: 300; color: #fff; letter-spacing: -0.01em; }
  .navbar-brand span { font-weight: 800; }
  .navbar-user {
    background: rgba(255,255,255,0.15);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 20px;
    padding: 4px 14px;
    font-size: 0.78rem; font-weight: 600; color: #fff;
    letter-spacing: 0.04em;
  }
  .navbar-links { display: flex; gap: 8px; align-items: center; }
  .nav-link {
    background: none; border: none; cursor: pointer;
    color: rgba(255,255,255,0.75);
    font-family: 'Sora', sans-serif;
    font-size: 0.85rem; font-weight: 500;
    padding: 6px 14px; border-radius: 8px;
    transition: all 0.18s;
  }
  .nav-link:hover, .nav-link.active { color: #fff; background: rgba(255,255,255,0.12); }
  .nav-link.signout { color: #ffd580; font-weight: 600; }
  .nav-link.signout:hover { background: rgba(255,213,128,0.15); }
 
  /* Card */
  .card {
    background: var(--card);
    border-radius: 24px;
    box-shadow: var(--shadow-md);
    border: 1px solid var(--border);
  }
 
  /* Auth screens */
  .auth-screen {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; min-height: 100vh; padding: 40px 20px;
  }
  .auth-title { font-size: 2.4rem; font-weight: 300; margin-bottom: 36px; letter-spacing: -0.03em; }
  .auth-title span { font-weight: 800; }
  .auth-card { width: 100%; max-width: 440px; padding: 36px 40px; }
  .field-label { font-size: 0.8rem; font-weight: 600; letter-spacing: 0.06em; color: var(--muted); text-transform: uppercase; margin-bottom: 8px; }
  .field-group { margin-bottom: 20px; }
  .input {
    width: 100%;
    background: #f2f4f9;
    border: 1.5px solid transparent;
    border-radius: 12px;
    padding: 14px 16px;
    font-family: 'Sora', sans-serif;
    font-size: 0.9rem; color: var(--text);
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .input:focus { border-color: var(--blue); box-shadow: 0 0 0 4px rgba(74,127,228,0.12); }
  .select {
    width: 100%; appearance: none;
    background: #f2f4f9 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238a94b2' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E") no-repeat right 16px center;
    border: 1.5px solid transparent;
    border-radius: 12px;
    padding: 14px 16px;
    font-family: 'Sora', sans-serif;
    font-size: 0.9rem; color: var(--text);
    outline: none;
    cursor: pointer;
    transition: border-color 0.2s;
  }
  .select:focus { border-color: var(--blue); }
 
  .btn-primary {
    width: 100%;
    background: linear-gradient(135deg, var(--blue) 0%, var(--blue-light) 100%);
    border: none; border-radius: 14px;
    padding: 16px;
    font-family: 'Sora', sans-serif;
    font-size: 1rem; font-weight: 700;
    color: #fff; cursor: pointer;
    margin-top: 8px;
    letter-spacing: 0.01em;
    box-shadow: 0 4px 20px rgba(74,127,228,0.35);
    transition: transform 0.15s, box-shadow 0.15s;
  }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(74,127,228,0.45); }
  .btn-primary:active { transform: translateY(0); }
 
  .auth-footer { text-align: center; margin-top: 20px; font-size: 0.85rem; color: var(--muted); }
  .auth-footer a { color: var(--blue); font-weight: 600; cursor: pointer; text-decoration: underline; }
 
  /* Home */
  .home-content { padding: 48px 56px; max-width: 1200px; margin: 0 auto; }
  .home-greeting { margin-bottom: 48px; }
  .home-greeting h1 { font-size: 2.8rem; font-weight: 300; letter-spacing: -0.03em; margin-bottom: 4px; }
  .home-greeting h1 span { font-weight: 800; }
  .home-greeting .user-name { font-size: 3rem; font-weight: 800; color: var(--navy); letter-spacing: -0.04em; }
  .home-greeting p { font-size: 1rem; color: var(--muted); margin-top: 6px; }
 
  .stat-cards { display: flex; gap: 20px; margin-bottom: 40px; }
  .stat-card {
    flex: 1; padding: 24px 28px;
    background: var(--card);
    border-radius: 20px;
    border: 1px solid var(--border);
    box-shadow: var(--shadow);
  }
  .stat-card .label { font-size: 0.75rem; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase; color: var(--muted); margin-bottom: 8px; }
  .stat-card .value { font-size: 1.8rem; font-weight: 700; color: var(--navy); font-family: 'DM Mono', monospace; }
  .stat-card.flag .value { font-size: 1.1rem; font-weight: 600; color: #5cb85c; }
 
  .home-body { display: grid; grid-template-columns: 1fr 280px; gap: 28px; }
  .chart-card { padding: 28px 32px; }
  .chart-title { font-size: 1rem; font-weight: 700; margin-bottom: 24px; }
  .chart-area { height: 200px; position: relative; }
 
  .action-card { padding: 28px; display: flex; flex-direction: column; gap: 14px; justify-content: center; }
  .action-btn {
    background: #f2f4f9;
    border: 1.5px solid var(--border);
    border-radius: 14px;
    padding: 16px 20px;
    font-family: 'Sora', sans-serif;
    font-size: 0.88rem; font-weight: 600;
    color: var(--navy);
    cursor: pointer;
    text-align: left;
    display: flex; align-items: center; gap: 10px;
    transition: all 0.18s;
  }
  .action-btn:hover { background: var(--blue); color: #fff; border-color: var(--blue); transform: translateX(4px); }
  .action-btn span { font-weight: 400; }
  .action-icon { font-size: 1.1rem; }
 
  /* Calculator */
  .page-content { padding: 48px 56px; max-width: 1000px; margin: 0 auto; }
  .page-title { font-size: 2.2rem; font-weight: 800; letter-spacing: -0.04em; margin-bottom: 36px; text-align: center; }
  .calc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; padding: 36px 40px; margin-bottom: 32px; }
  .calc-col-title { font-size: 0.8rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); margin-bottom: 20px; border-bottom: 1px solid var(--border); padding-bottom: 10px; }
  .calc-field { margin-bottom: 18px; }
  .run-btn-wrap { display: flex; justify-content: center; }
  .run-btn {
    background: linear-gradient(135deg, var(--navy) 0%, var(--blue) 100%);
    border: none; border-radius: 16px;
    padding: 18px 48px;
    font-family: 'Sora', sans-serif;
    font-size: 1rem; font-weight: 700;
    color: #fff; cursor: pointer;
    box-shadow: 0 6px 24px rgba(15,31,75,0.25);
    transition: transform 0.15s, box-shadow 0.15s;
    letter-spacing: 0.01em;
  }
  .run-btn:hover { transform: translateY(-3px); box-shadow: 0 10px 32px rgba(15,31,75,0.35); }
 
  .result-card { padding: 32px 40px; margin-top: 28px; }
  .result-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 20px; }
  .result-item .r-label { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); margin-bottom: 6px; }
  .result-item .r-value { font-size: 1.5rem; font-weight: 700; color: var(--navy); font-family: 'DM Mono', monospace; }
  .result-item .r-value.recommend { color: var(--blue); font-size: 1.2rem; }
  .result-item .r-value.savings { color: #1a9e5c; }
 
  /* Files */
  .files-content { padding: 48px 56px; max-width: 600px; margin: 0 auto; text-align: center; }
  .file-type-tabs { display: flex; gap: 12px; justify-content: center; margin-bottom: 32px; flex-wrap: wrap; }
  .tab-btn {
    background: #f2f4f9; border: 1.5px solid var(--border);
    border-radius: 10px; padding: 10px 20px;
    font-family: 'Sora', sans-serif; font-size: 0.85rem; font-weight: 600;
    color: var(--muted); cursor: pointer; transition: all 0.18s;
  }
  .tab-btn.active, .tab-btn:hover { background: var(--navy); color: #fff; border-color: var(--navy); }
  .upload-zone {
    border: 2.5px dashed rgba(74,127,228,0.35);
    border-radius: 20px;
    padding: 56px 40px;
    cursor: pointer;
    transition: all 0.2s;
    background: rgba(74,127,228,0.03);
    margin-bottom: 20px;
  }
  .upload-zone:hover { border-color: var(--blue); background: rgba(74,127,228,0.07); }
  .upload-icon { font-size: 2.5rem; margin-bottom: 12px; }
  .upload-text { font-size: 1rem; font-weight: 600; color: var(--navy); margin-bottom: 4px; }
  .upload-sub { font-size: 0.82rem; color: var(--muted); }
  .upload-actions { display: flex; gap: 12px; justify-content: center; }
  .btn-outline {
    background: none; border: 1.5px solid var(--navy);
    border-radius: 12px; padding: 12px 28px;
    font-family: 'Sora', sans-serif; font-size: 0.88rem; font-weight: 600;
    color: var(--navy); cursor: pointer; transition: all 0.18s;
  }
  .btn-outline:hover { background: var(--navy); color: #fff; }
 
  /* History */
  .hist-content { padding: 48px 56px; max-width: 1200px; margin: 0 auto; }
  .hist-table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; }
  thead tr { border-bottom: 2px solid var(--border); }
  th {
    padding: 14px 20px; text-align: left;
    font-size: 0.72rem; font-weight: 700; letter-spacing: 0.08em;
    text-transform: uppercase; color: var(--muted);
  }
  tbody tr { border-bottom: 1px solid var(--border); transition: background 0.15s; }
  tbody tr:hover { background: rgba(74,127,228,0.04); }
  td { padding: 16px 20px; font-size: 0.88rem; }
  td.mono { font-family: 'DM Mono', monospace; font-size: 0.9rem; }
  td.recommend { font-weight: 700; color: var(--blue); }
  td.savings { font-weight: 700; color: #1a9e5c; font-family: 'DM Mono', monospace; }
  .empty-state { text-align: center; padding: 60px 20px; color: var(--muted); }
  .empty-icon { font-size: 2.5rem; margin-bottom: 12px; }
 
  /* Splash */
  .splash-screen {
    display: flex; align-items: center; justify-content: center;
    min-height: 100vh; flex-direction: column; gap: 16px;
  }
  .splash-logo { font-size: 4rem; font-weight: 300; letter-spacing: -0.04em; color: var(--navy); }
  .splash-logo span { font-weight: 800; }
  .splash-sub { color: var(--muted); font-size: 0.9rem; letter-spacing: 0.08em; text-transform: uppercase; }
  .splash-btns { display: flex; gap: 14px; margin-top: 24px; }
  .splash-btn-primary {
    background: linear-gradient(135deg, var(--navy), var(--blue));
    border: none; border-radius: 14px;
    padding: 16px 40px;
    font-family: 'Sora', sans-serif; font-size: 1rem; font-weight: 700;
    color: #fff; cursor: pointer;
    box-shadow: 0 6px 24px rgba(15,31,75,0.25);
    transition: transform 0.15s;
  }
  .splash-btn-primary:hover { transform: translateY(-2px); }
  .splash-btn-ghost {
    background: none; border: 1.5px solid var(--navy);
    border-radius: 14px; padding: 16px 40px;
    font-family: 'Sora', sans-serif; font-size: 1rem; font-weight: 600;
    color: var(--navy); cursor: pointer;
    transition: all 0.18s;
  }
  .splash-btn-ghost:hover { background: var(--navy); color: #fff; }

  /* App shell and shared utility classes used by current pages */
  .navbar-wrapper,
  .home-wrapper,
  .page-container,
  .history-wrapper {
    max-width: 1320px;
    margin: 0 auto;
    width: 100%;
  }

  .navbar-wrapper { padding: 14px 18px 0; }
  .home-wrapper,
  .page-container,
  .history-wrapper { padding: 18px 22px 24px; }

  .bold { font-weight: 700; }
  .mono { font-family: 'DM Mono', monospace; }

  .dashboard-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 26px;
    margin-bottom: 24px;
  }

  .dashboard-greeting h1 {
    font-size: 2.35rem;
    line-height: 1.05;
    margin: 0 0 6px;
    font-weight: 300;
    color: var(--text);
  }

  .dashboard-greeting p {
    color: var(--muted);
    font-size: 0.9rem;
  }

  .stat-cards-container {
    display: grid;
    grid-template-columns: repeat(3, minmax(115px, 1fr));
    gap: 10px;
    min-width: 370px;
  }

  .top-stat-card {
    background: #fff;
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 10px 12px;
    text-align: center;
  }

  .top-stat-label {
    font-size: 0.62rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 4px;
  }

  .top-stat-value {
    font-size: 0.82rem;
    color: var(--navy);
    font-family: 'DM Mono', monospace;
  }

  .home-body-grid {
    display: grid;
    grid-template-columns: 1fr 220px;
    gap: 26px;
    align-items: start;
  }

  .chart-box {
    background: #fff;
    border: 1px solid var(--border);
    border-radius: 18px;
    padding: 16px 18px;
    box-shadow: var(--shadow);
  }

  .chart-box h3 {
    margin: 0 0 10px;
    font-size: 0.95rem;
    color: var(--navy);
  }

  .action-pills {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .pill-btn,
  .run-pill {
    border: 1px solid var(--border);
    background: #fff;
    color: var(--navy);
    border-radius: 999px;
    padding: 10px 14px;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.16s ease;
    box-shadow: 0 3px 12px rgba(15,31,75,0.07);
  }

  .pill-btn:hover,
  .run-pill:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 14px rgba(15,31,75,0.12);
  }

  .history-wrapper {
    background: #fff;
    border: 1px solid var(--border);
    border-radius: 24px;
    box-shadow: var(--shadow);
  }

  .history-table-wrapper {
    overflow: auto;
    max-height: calc(100vh - 260px);
  }

  .history-table {
    width: 100%;
    border-collapse: collapse;
    background: #fff;
  }

  .history-table th {
    background: #f8fafc;
    color: #3b4256;
    font-size: 0.68rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 16px 20px;
    text-align: left;
    font-weight: 700;
  }

  .history-table td {
    padding: 16px 20px;
    border-top: 1px solid #eef2f7;
    font-size: 0.95rem;
    color: #111827;
  }

  .history-table tbody tr:hover {
    background: #fafcff;
  }

  @media (max-width: 980px) {
    .dashboard-header { flex-direction: column; }
    .stat-cards-container { min-width: 0; width: 100%; }
    .home-body-grid { grid-template-columns: 1fr; }
  }
 
  /* Misc */
    .toast {
      position: fixed; bottom: 32px; right: 32px; z-index: 999;
      background: var(--navy); color: #fff;
      padding: 14px 24px; border-radius: 12px;
      font-size: 0.88rem; font-weight: 600;
      box-shadow: var(--shadow-md);
      animation: slideIn 0.3s ease;
    }
    @keyframes slideIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  `;