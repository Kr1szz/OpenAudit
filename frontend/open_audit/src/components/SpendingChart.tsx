export function SpendingChart() {
    const points1 = "40,160 100,120 160,100 220,130 280,80 340,95 400,60";
    const points2 = "40,80 100,110 160,140 220,90 280,120 340,160 400,130";
    return (
      <svg width="100%" height="200" viewBox="0 0 440 200" style={{ overflow: "visible" }}>
        <defs>
          <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4a7fe4" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#4a7fe4" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d4920a" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#d4920a" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Grid */}
        {[40, 80, 120, 160].map(y => (
          <line key={y} x1="0" y1={y} x2="440" y2={y} stroke="#e8ecf4" strokeWidth="1" />
        ))}
        {/* Line 1 - Income */}
        <polyline fill="none" stroke="#4a7fe4" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" points={points1} />
        {/* Line 2 - Expenses */}
        <polyline fill="none" stroke="#d4920a" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" points={points2} />
        {/* Dots */}
        {[[40,160],[100,120],[160,100],[220,130],[280,80],[340,95],[400,60]].map(([x,y],i) => (
          <circle key={i} cx={x} cy={y} r="4" fill="#4a7fe4" stroke="#fff" strokeWidth="2" />
        ))}
        {[[40,80],[100,110],[160,140],[220,90],[280,120],[340,160],[400,130]].map(([x,y],i) => (
          <circle key={i} cx={x} cy={y} r="4" fill="#d4920a" stroke="#fff" strokeWidth="2" />
        ))}
        {/* Legend */}
        <rect x="0" y="185" width="10" height="3" rx="2" fill="#4a7fe4" />
        <text x="16" y="192" fill="#8a94b2" fontSize="11" fontFamily="Sora, sans-serif">Income</text>
        <rect x="80" y="185" width="10" height="3" rx="2" fill="#d4920a" />
        <text x="96" y="192" fill="#8a94b2" fontSize="11" fontFamily="Sora, sans-serif">Expenses</text>
      </svg>
    );
  }
