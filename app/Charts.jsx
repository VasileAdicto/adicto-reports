// Chart primitives — minimal editorial style.
// SVG-based, sized responsively within their container.

const CH_MONO = '"JetBrains Mono", ui-monospace, monospace';

const PALETTE = {
  ink: '#1a1510',
  paper: '#f1ead8',
  paperLight: '#f8f2e1',
  line: '#d4c8ae',
  muted: '#8a7d69',
  subtle: '#6f6556',
  accent: 'rgb(92, 158, 219)',
  olive:  'rgb(85, 107, 70)',
  s1: '#1a1510',
  s2: 'rgb(92, 158, 219)',
  s3: 'rgb(85, 107, 70)',
};

function ChartCard({ title, subtitle, right, children, style = {} }) {
  return (
    <div style={{
      background: '#fffbf0',
      border: '1px solid #e6ddc9',
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      ...style,
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        marginBottom: 14, gap: 8,
      }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{
            fontFamily: CH_MONO, fontSize: 9.5, letterSpacing: 1.1,
            textTransform: 'uppercase', color: PALETTE.muted, marginBottom: 4,
          }}>{title}</div>
          {subtitle && (
            <div style={{ fontFamily: CH_MONO, fontSize: 11, color: PALETTE.subtle }}>{subtitle}</div>
          )}
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}

function Legend({ items, compact = false }) {
  return (
    <div style={{
      display: 'flex', gap: compact ? 10 : 14, flexWrap: 'wrap',
      fontFamily: CH_MONO, fontSize: 9, letterSpacing: 0.6,
      textTransform: 'uppercase', color: PALETTE.subtle, marginTop: 8,
    }}>
      {items.map(it => (
        <div key={it.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: it.color }} />
          {it.label}
        </div>
      ))}
    </div>
  );
}

// Токен-перемикач (напр. ₴ / %)
function ValueToggle({ options, value, onChange }) {
  return (
    <div style={{
      display: 'inline-flex', background: '#ede5d0', padding: 2,
      borderRadius: 8,
    }}>
      {options.map(o => (
        <button key={o.id} onClick={() => onChange(o.id)} style={{
          padding: '4px 10px', borderRadius: 6,
          background: value === o.id ? '#fffbf0' : 'transparent',
          border: 'none', cursor: 'pointer',
          fontFamily: CH_MONO, fontSize: 9.5, letterSpacing: 0.8,
          textTransform: 'uppercase',
          color: value === o.id ? PALETTE.ink : PALETTE.muted,
          fontWeight: value === o.id ? 500 : 400,
        }}>{o.label}</button>
      ))}
    </div>
  );
}

function BigStat({ label, value, accent, hint, extra }) {
  return (
    <div style={{
      flex: 1, minWidth: 0, background: '#fffbf0',
      border: '1px solid #e6ddc9', borderRadius: 12,
      padding: '14px 14px 16px',
    }}>
      <div style={{
        fontFamily: CH_MONO, fontSize: 9, letterSpacing: 1,
        textTransform: 'uppercase', color: accent || PALETTE.muted,
      }}>{label}</div>
      <div style={{
        fontFamily: CH_MONO, fontSize: 22, lineHeight: 1.1,
        color: PALETTE.ink, letterSpacing: -0.5, marginTop: 8,
        wordBreak: 'break-word',
      }}>{value}</div>
      {hint && (
        <div style={{
          fontFamily: CH_MONO, fontSize: 9, color: PALETTE.subtle,
          marginTop: 4, letterSpacing: 0.4,
        }}>{hint}</div>
      )}
      {extra && <div style={{ marginTop: 10 }}>{extra}</div>}
    </div>
  );
}

// 33830 → "33 830"
function fmt(n) {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}
function fmtPct(n, digits = 1) {
  const v = Number.isFinite(n) ? n : 0;
  return v.toFixed(digits).replace(/\.0$/, '') + '%';
}

// ─── BAR CHART (horizontal) ─────────────────────
// HTML-based (а не SVG) — бо треба щоб довгі числа ніколи не обрізались

// Плейсхолдер, коли графік не має даних, але ми не хочемо, щоб він «зникав».
function EmptyChart({ h = 140, msg = 'Немає даних за цей період' }) {
  return (
    <div style={{
      height: h, display:'flex', alignItems:'center', justifyContent:'center',
      border: `1px dashed ${PALETTE.line}`, borderRadius: 10,
      fontFamily: CH_MONO, fontSize: 10.5, color: PALETTE.subtle,
      background: PALETTE.paperLight, textAlign: 'center', padding: '0 16px',
      lineHeight: 1.5,
    }}>{msg}</div>
  );
}

function BarsH({ data, valueKey = 'value', labelKey = 'name', suffix = '', color = PALETTE.ink, showPct = false, formatter }) {
  if (!data || !data.length) return <EmptyChart h={120}/>;
  const max = Math.max(...data.map(d => d[valueKey]), 1);
  const fmtVal = formatter || (v => showPct ? fmtPct(v) : fmt(v) + (suffix || ''));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {data.map((d, i) => {
        const w = Math.max(2, (d[valueKey] / max) * 100);
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: CH_MONO, fontSize: 11 }}>
            <div style={{ minWidth: 78, flexShrink: 0, color: PALETTE.subtle, fontSize: 10, letterSpacing: 0.3 }}>
              {d[labelKey]}
            </div>
            <div style={{ flex: 1, height: 13, background: '#efe6d0', borderRadius: 2, position: 'relative', overflow: 'hidden' }}>
              <div style={{ width: w + '%', height: '100%', background: color, borderRadius: 2 }}/>
            </div>
            <div style={{ minWidth: 54, textAlign: 'right', flexShrink: 0, color: PALETTE.ink, fontSize: 10.5, fontWeight: 500 }}>
              {fmtVal(d[valueKey])}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── VERTICAL BARS ─────────────────────
function BarsV({ data, keys = ['v'], colors = [PALETTE.ink], labelKey = 'month', h = 160, showVals = true, showY = false, isPct = false, formatter }) {
  if (!data || !data.length) return <EmptyChart h={h}/>;
  const fmtVal = formatter || (isPct ? (v => v.toFixed(1).replace(/\.0$/,'') + '%') : fmt);
  const totals = data.map(d => keys.reduce((s, k) => s + d[k], 0));
  const max = Math.max(...totals, 1) * 1.15;
  const topPad = 14;
  const botPad = 22;
  const leftPad = showY ? 34 : 20;
  const rightPad = 10;
  const plotW = 300 - leftPad - rightPad;
  const plotH = h - topPad - botPad;
  const bw = plotW / Math.max(data.length, 1);
  const gap = Math.max(2, bw * 0.18);

  // Y-шкала (3 рівні)
  const yTicks = showY ? [0, 0.5, 1].map(t => ({
    y: topPad + plotH - t * plotH,
    v: t * max,
  })) : [];

  // Підписи X: якщо багато — виводимо кожен 2й/3й
  const xSkip = data.length > 12 ? Math.ceil(data.length / 8) : 1;

  return (
    <svg width="100%" height={h} viewBox={`0 0 300 ${h}`} preserveAspectRatio="none">
      {/* Grid */}
      {showY && yTicks.map((t, i) => (
        <g key={i}>
          <line x1={leftPad} x2={300 - rightPad} y1={t.y} y2={t.y}
            stroke={PALETTE.line} strokeWidth="0.5" strokeDasharray="2 2"/>
          <text x={leftPad - 4} y={t.y + 3} fontSize="8" fontFamily={CH_MONO}
            fill={PALETTE.muted} textAnchor="end">
            {isPct ? fmtVal(t.v) : (t.v > 1000 ? Math.round(t.v/1000) + 'k' : fmt(t.v))}
          </text>
        </g>
      ))}
      {data.map((d, i) => {
        const x = leftPad + i * bw + gap / 2;
        const w = bw - gap;
        let yAcc = topPad + plotH;
        return (
          <g key={i}>
            {keys.map((k, ki) => {
              const seg = (d[k] / max) * plotH;
              yAcc -= seg;
              return <rect key={ki} x={x} y={yAcc} width={w} height={seg} fill={colors[ki]} />;
            })}
            {showVals && totals[i] > 0 && (
              <text x={x + w / 2} y={topPad + plotH - totals[i] / max * plotH - 4}
                fontSize="8.5" fontFamily={CH_MONO} fill={PALETTE.ink}
                textAnchor="middle">{fmtVal(totals[i])}</text>
            )}
            {(i % xSkip === 0 || i === data.length - 1) && (
              <text x={x + w / 2} y={h - 4}
                fontSize="9" fontFamily={CH_MONO} fill={PALETTE.subtle}
                textAnchor="middle">{d[labelKey]}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ─── LINE / AREA CHART з мітками місяців ─────────────────
// data: number[] АБО [{v, start: Date}, ...]
function AreaChart({ data, h = 140, color = PALETTE.ink, monthTicks = true, showY = false, showPeaks = false, peakFormatter }) {
  if (!data || !data.length) return <EmptyChart h={h}/>;
  const isObj = typeof data[0] === 'object';
  const values = isObj ? data.map(d => d.v) : data;
  const starts = isObj ? data.map(d => d.start) : null;
  const max = Math.max(...values, 1) * 1.1;
  const topPad = 8;
  const botPad = 22;
  const leftPad = showY ? 32 : 20;
  const rightPad = 10;
  const plotW = 300 - leftPad - rightPad;
  const plotH = h - topPad - botPad;
  const pts = values.map((v, i) => [
    leftPad + (values.length === 1 ? plotW/2 : (i / (values.length - 1)) * plotW),
    topPad + plotH - (v / max) * (plotH - 4),
  ]);
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ');
  const baseY = topPad + plotH;
  const area = path + ` L${pts[pts.length - 1][0]},${baseY} L${pts[0][0]},${baseY} Z`;

  const yTicks = showY ? [0, 0.5, 1].map(t => ({
    y: topPad + plotH - t * (plotH - 4),
    v: t * max,
  })) : [];

  // Мітки місяців — не частіше кожних 30px
  const MONTH_UA = ['січ','лют','бер','кві','тра','чер','лип','сер','вер','жов','лис','гру'];
  const monthLabels = [];
  if (monthTicks && starts) {
    let prevMonth = -1;
    let lastX = -40;
    starts.forEach((s, i) => {
      if (!(s instanceof Date)) return;
      const m = s.getMonth();
      if (m !== prevMonth && pts[i][0] - lastX >= 30) {
        monthLabels.push({ i, label: MONTH_UA[m], x: pts[i][0] });
        lastX = pts[i][0];
        prevMonth = m;
      } else if (m !== prevMonth) {
        prevMonth = m;
      }
    });
  }

  return (
    <svg width="100%" height={h} viewBox={`0 0 300 ${h}`} preserveAspectRatio="none">
      {showY ? yTicks.map((t, i) => (
        <g key={i}>
          <line x1={leftPad} x2={300-rightPad} y1={t.y} y2={t.y}
            stroke={PALETTE.line} strokeWidth="0.5" strokeDasharray="2 2"/>
          <text x={leftPad-4} y={t.y+3} fontSize="8" fontFamily={CH_MONO}
            fill={PALETTE.muted} textAnchor="end">
            {t.v > 1000 ? Math.round(t.v/1000) + 'k' : fmt(t.v)}
          </text>
        </g>
      )) : [0.25, 0.5, 0.75].map(t => (
        <line key={t} x1={leftPad} x2={300-rightPad} y1={topPad + plotH - t * (plotH - 4)} y2={topPad + plotH - t * (plotH - 4)}
          stroke={PALETTE.line} strokeWidth="0.5" strokeDasharray="2 2" />
      ))}
      <path d={area} fill={color} fillOpacity="0.12" />
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" />
      {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="2" fill={color} />)}
      {showPeaks && pts.map((p, i) => {
        const v = values[i];
        if (v <= 0) return null;
        const prev = values[i - 1] ?? -Infinity;
        const next = values[i + 1] ?? -Infinity;
        // Показуємо тільки на ВИРАЗНИХ локальних максимумах (строго більше сусідів)
        // і на першій/останній точці якщо вона — максимум
        const isPeak = (v > prev && v >= next) || (v >= prev && v > next);
        if (!isPeak) return null;
        const label = peakFormatter ? peakFormatter(v) : fmt(v);
        return (
          <text key={'pk' + i} x={p[0]} y={p[1] - 5}
            fontSize="8.5" fontFamily={CH_MONO} fill={PALETTE.ink}
            fontWeight="600" textAnchor="middle">{label}</text>
        );
      })}
      {monthLabels.map((m, i) => (
        <g key={i}>
          <line x1={m.x} x2={m.x} y1={baseY} y2={baseY + 3} stroke={PALETTE.muted} strokeWidth="0.6"/>
          <text x={m.x} y={h - 2} fontSize="8.5" fontFamily={CH_MONO}
            fill={PALETTE.subtle} textAnchor="middle">{m.label}</text>
        </g>
      ))}
    </svg>
  );
}

// ─── TWO-SERIES BARS (для порівняльних графіків, наприклад візити vs чеки) ─
function BarsV2({ data, keyA, keyB, labelA, labelB, colorA, colorB, labelKey = 'month', h = 160 }) {
  if (!data || !data.length) return <EmptyChart h={h}/>;
  const max = Math.max(...data.flatMap(d => [d[keyA], d[keyB]]), 1) * 1.15;
  const pad = 30;
  const plotH = h - pad - 14;
  const groupW = 260 / Math.max(data.length, 1);
  const gap = groupW * 0.12;
  const bw = (groupW - gap) / 2;
  return (
    <div>
      <svg width="100%" height={h} viewBox={`0 0 300 ${h}`} preserveAspectRatio="none">
        {data.map((d, i) => {
          const x0 = 20 + i * groupW + gap / 2;
          const hA = (d[keyA] / max) * plotH;
          const hB = (d[keyB] / max) * plotH;
          return (
            <g key={i}>
              <rect x={x0} y={plotH - hA} width={bw} height={hA} fill={colorA}/>
              <rect x={x0 + bw} y={plotH - hB} width={bw} height={hB} fill={colorB}/>
              <text x={x0 + bw} y={h - 4} fontSize="9" fontFamily={CH_MONO}
                fill={PALETTE.subtle} textAnchor="middle">{d[labelKey]}</text>
            </g>
          );
        })}
      </svg>
      <Legend items={[{ label: labelA, color: colorA }, { label: labelB, color: colorB }]}/>
    </div>
  );
}

function Donut({ data, size = 140, colors }) {
  const total = data.reduce((s, d) => s + d.pct, 0);
  const cx = size / 2, cy = size / 2;
  const r = size / 2 - 4, rInner = r - 18;
  let a = -Math.PI / 2;
  const arcs = data.map((d, i) => {
    const frac = d.pct / total;
    const a2 = a + frac * Math.PI * 2;
    const large = frac > 0.5 ? 1 : 0;
    const x1 = cx + Math.cos(a) * r, y1 = cy + Math.sin(a) * r;
    const x2 = cx + Math.cos(a2) * r, y2 = cy + Math.sin(a2) * r;
    const x3 = cx + Math.cos(a2) * rInner, y3 = cy + Math.sin(a2) * rInner;
    const x4 = cx + Math.cos(a) * rInner, y4 = cy + Math.sin(a) * rInner;
    const d_ = `M${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} L${x3},${y3} A${rInner},${rInner} 0 ${large} 0 ${x4},${y4} Z`;
    a = a2;
    return <path key={i} d={d_} fill={colors[i]} />;
  });
  return <svg width={size} height={size}>{arcs}</svg>;
}

window.CHARTS = { ChartCard, Legend, ValueToggle, BigStat, BarsH, BarsV, BarsV2, AreaChart, Donut, fmt, fmtPct, PALETTE };
