interface SpendingChartProps {
  title?: string;
  incomeSeries: number[];
  expenseSeries: number[];
  labels: string[];
}

export function SpendingChart({ title, incomeSeries, expenseSeries, labels }: SpendingChartProps) {
  const width = 500;
  const height = 240;
  const leftPad = 50;
  const rightPad = 20;
  const topPad = 20;
  const bottomPad = 50;
  const plotWidth = width - leftPad - rightPad;
  const plotHeight = height - topPad - bottomPad;

  const pointsCount = Math.max(incomeSeries.length, expenseSeries.length, labels.length, 2);
  const normalizedIncome = Array.from({ length: pointsCount }, (_, i) => Number(incomeSeries[i] || 0));
  const normalizedExpense = Array.from({ length: pointsCount }, (_, i) => Number(expenseSeries[i] || 0));
  const normalizedLabels = Array.from({ length: pointsCount }, (_, i) => labels[i] || '');

  // Simple scaling: always start at 0, go to max + 10% headroom
  const allValues = [...normalizedIncome, ...normalizedExpense];
  const maxValue = Math.max(...allValues, 1000); // minimum 1000 so empty chart looks reasonable
  const yMax = maxValue * 1.1;
  const yMin = 0;
  const safeRange = yMax;

  const pointToSvg = (value: number, index: number) => {
    const x = leftPad + (index / Math.max(pointsCount - 1, 1)) * plotWidth;
    const y = topPad + (1 - (value - yMin) / safeRange) * plotHeight;
    return [x, y] as const;
  };

  const linePoints = (series: number[]) =>
    series.map((v, i) => pointToSvg(v, i).join(',')).join(' ');

  const incomePoints = linePoints(normalizedIncome);
  const expensePoints = linePoints(normalizedExpense);

  const formatValue = (v: number) => {
    if (v >= 100000) return `${(v / 100000).toFixed(1)}L`;
    if (v >= 1000) return `${(v / 1000).toFixed(0)}K`;
    return Math.round(v).toLocaleString('en-IN');
  };

  // Y-axis: 4 evenly spaced ticks from 0 to yMax
  const yTicks = Array.from({ length: 4 }, (_, i) => {
    const ratio = i / 3;
    const v = yMax - safeRange * ratio;
    const y = topPad + plotHeight * ratio;
    return { y, v };
  });

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" aria-label={title || 'Spending chart'}>
      {/* Grid lines */}
      {yTicks.map((tick, idx) => (
        <g key={`y-${idx}`}>
          <line x1={leftPad} y1={tick.y} x2={width - rightPad} y2={tick.y} stroke="#e8ecf4" strokeWidth="1" />
          <text x={leftPad - 8} y={tick.y + 4} textAnchor="end" fill="#8a94b2" fontSize="9" fontFamily="Inter, sans-serif">
            {formatValue(tick.v)}
          </text>
        </g>
      ))}

      {/* Income line (green) */}
      <polyline fill="none" stroke="#2fb344" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" points={incomePoints} />
      {/* Expense line (red) */}
      <polyline fill="none" stroke="#e03131" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" points={expensePoints} />

      {/* Income dots */}
      {normalizedIncome.map((v, i) => {
        const [x, y] = pointToSvg(v, i);
        return (
          <g key={`i-${i}`}>
            <circle cx={x} cy={y} r="4" fill="#2fb344" stroke="#fff" strokeWidth="1.5" />
            <text x={x} y={y - 8} textAnchor="middle" fill="#2fb344" fontSize="9" fontFamily="Inter, sans-serif" fontWeight="600">
              {v > 0 ? formatValue(v) : ''}
            </text>
          </g>
        );
      })}

      {/* Expense dots */}
      {normalizedExpense.map((v, i) => {
        const [x, y] = pointToSvg(v, i);
        // Position expense labels below the dot if it's close to the income dot, or just below by default to avoid overlap
        // For simplicity, we'll place income above and expenses below 
        return (
          <g key={`e-${i}`}>
            <circle cx={x} cy={y} r="4" fill="#e03131" stroke="#fff" strokeWidth="1.5" />
            <text x={x} y={y + 14} textAnchor="middle" fill="#e03131" fontSize="9" fontFamily="Inter, sans-serif" fontWeight="600">
              {v > 0 ? formatValue(v) : ''}
            </text>
          </g>
        );
      })}

      {/* X-axis labels */}
      {normalizedLabels.map((label, i) => {
        const [x] = pointToSvg(0, i);
        return (
          <text key={`label-${i}`} x={x} y={height - 28} textAnchor="middle" fill="#8a94b2" fontSize="10" fontFamily="Inter, sans-serif">
            {label}
          </text>
        );
      })}

      {/* Legend */}
      <rect x={leftPad} y={height - 12} width="10" height="3" rx="2" fill="#2fb344" />
      <text x={leftPad + 14} y={height - 8} fill="#8a94b2" fontSize="10" fontFamily="Inter, sans-serif">Income</text>
      <rect x={leftPad + 80} y={height - 12} width="10" height="3" rx="2" fill="#e03131" />
      <text x={leftPad + 94} y={height - 8} fill="#8a94b2" fontSize="10" fontFamily="Inter, sans-serif">Expenses</text>
    </svg>
  );
}
