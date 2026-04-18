;(function(){
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
  olive: 'rgb(85, 107, 70)',
  s1: '#1a1510',
  s2: 'rgb(92, 158, 219)',
  s3: 'rgb(85, 107, 70)'
};
function ChartCard({
  title,
  subtitle,
  right,
  children,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fffbf0',
      border: '1px solid #e6ddc9',
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: 14,
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: CH_MONO,
      fontSize: 9.5,
      letterSpacing: 1.1,
      textTransform: 'uppercase',
      color: PALETTE.muted,
      marginBottom: 4
    }
  }, title), subtitle && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: CH_MONO,
      fontSize: 11,
      color: PALETTE.subtle
    }
  }, subtitle)), right), children);
}
function Legend({
  items,
  compact = false
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: compact ? 10 : 14,
      flexWrap: 'wrap',
      fontFamily: CH_MONO,
      fontSize: 9,
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      color: PALETTE.subtle,
      marginTop: 8
    }
  }, items.map(it => /*#__PURE__*/React.createElement("div", {
    key: it.label,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 8,
      height: 8,
      borderRadius: 2,
      background: it.color
    }
  }), it.label)));
}

// Токен-перемикач (напр. ₴ / %)
function ValueToggle({
  options,
  value,
  onChange
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      background: '#ede5d0',
      padding: 2,
      borderRadius: 8
    }
  }, options.map(o => /*#__PURE__*/React.createElement("button", {
    key: o.id,
    onClick: () => onChange(o.id),
    style: {
      padding: '4px 10px',
      borderRadius: 6,
      background: value === o.id ? '#fffbf0' : 'transparent',
      border: 'none',
      cursor: 'pointer',
      fontFamily: CH_MONO,
      fontSize: 9.5,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      color: value === o.id ? PALETTE.ink : PALETTE.muted,
      fontWeight: value === o.id ? 500 : 400
    }
  }, o.label)));
}
function BigStat({
  label,
  value,
  accent,
  hint,
  extra
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      background: '#fffbf0',
      border: '1px solid #e6ddc9',
      borderRadius: 12,
      padding: '14px 14px 16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: CH_MONO,
      fontSize: 9,
      letterSpacing: 1,
      textTransform: 'uppercase',
      color: accent || PALETTE.muted
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: CH_MONO,
      fontSize: 22,
      lineHeight: 1.1,
      color: PALETTE.ink,
      letterSpacing: -0.5,
      marginTop: 8,
      wordBreak: 'break-word'
    }
  }, value), hint && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: CH_MONO,
      fontSize: 9,
      color: PALETTE.subtle,
      marginTop: 4,
      letterSpacing: 0.4
    }
  }, hint), extra && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10
    }
  }, extra));
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
function EmptyChart({
  h = 140,
  msg = 'Немає даних за цей період'
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: h,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: `1px dashed ${PALETTE.line}`,
      borderRadius: 10,
      fontFamily: CH_MONO,
      fontSize: 10.5,
      color: PALETTE.subtle,
      background: PALETTE.paperLight,
      textAlign: 'center',
      padding: '0 16px',
      lineHeight: 1.5
    }
  }, msg);
}
function BarsH({
  data,
  valueKey = 'value',
  labelKey = 'name',
  suffix = '',
  color = PALETTE.ink,
  showPct = false,
  formatter
}) {
  if (!data || !data.length) return /*#__PURE__*/React.createElement(EmptyChart, {
    h: 120
  });
  const max = Math.max(...data.map(d => d[valueKey]), 1);
  const fmtVal = formatter || (v => showPct ? fmtPct(v) : fmt(v) + (suffix || ''));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, data.map((d, i) => {
    const w = Math.max(2, d[valueKey] / max * 100);
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontFamily: CH_MONO,
        fontSize: 11
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        minWidth: 78,
        flexShrink: 0,
        color: PALETTE.subtle,
        fontSize: 10,
        letterSpacing: 0.3
      }
    }, d[labelKey]), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        height: 13,
        background: '#efe6d0',
        borderRadius: 2,
        position: 'relative',
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: w + '%',
        height: '100%',
        background: color,
        borderRadius: 2
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        minWidth: 54,
        textAlign: 'right',
        flexShrink: 0,
        color: PALETTE.ink,
        fontSize: 10.5,
        fontWeight: 500
      }
    }, fmtVal(d[valueKey])));
  }));
}

// ─── VERTICAL BARS ─────────────────────
function BarsV({
  data,
  keys = ['v'],
  colors = [PALETTE.ink],
  labelKey = 'month',
  h = 160,
  showVals = true,
  showY = false,
  isPct = false,
  formatter
}) {
  if (!data || !data.length) return /*#__PURE__*/React.createElement(EmptyChart, {
    h: h
  });
  const fmtVal = formatter || (isPct ? v => v.toFixed(1).replace(/\.0$/, '') + '%' : fmt);
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
    v: t * max
  })) : [];

  // Підписи X: якщо багато — виводимо кожен 2й/3й
  const xSkip = data.length > 12 ? Math.ceil(data.length / 8) : 1;
  return /*#__PURE__*/React.createElement("svg", {
    width: "100%",
    height: h,
    viewBox: `0 0 300 ${h}`,
    preserveAspectRatio: "none"
  }, showY && yTicks.map((t, i) => /*#__PURE__*/React.createElement("g", {
    key: i
  }, /*#__PURE__*/React.createElement("line", {
    x1: leftPad,
    x2: 300 - rightPad,
    y1: t.y,
    y2: t.y,
    stroke: PALETTE.line,
    strokeWidth: "0.5",
    strokeDasharray: "2 2"
  }), /*#__PURE__*/React.createElement("text", {
    x: leftPad - 4,
    y: t.y + 3,
    fontSize: "8",
    fontFamily: CH_MONO,
    fill: PALETTE.muted,
    textAnchor: "end"
  }, isPct ? fmtVal(t.v) : t.v > 1000 ? Math.round(t.v / 1000) + 'k' : fmt(t.v)))), data.map((d, i) => {
    const x = leftPad + i * bw + gap / 2;
    const w = bw - gap;
    let yAcc = topPad + plotH;
    return /*#__PURE__*/React.createElement("g", {
      key: i
    }, keys.map((k, ki) => {
      const seg = d[k] / max * plotH;
      yAcc -= seg;
      return /*#__PURE__*/React.createElement("rect", {
        key: ki,
        x: x,
        y: yAcc,
        width: w,
        height: seg,
        fill: colors[ki]
      });
    }), showVals && totals[i] > 0 && /*#__PURE__*/React.createElement("text", {
      x: x + w / 2,
      y: topPad + plotH - totals[i] / max * plotH - 4,
      fontSize: "8.5",
      fontFamily: CH_MONO,
      fill: PALETTE.ink,
      textAnchor: "middle"
    }, fmtVal(totals[i])), (i % xSkip === 0 || i === data.length - 1) && /*#__PURE__*/React.createElement("text", {
      x: x + w / 2,
      y: h - 4,
      fontSize: "9",
      fontFamily: CH_MONO,
      fill: PALETTE.subtle,
      textAnchor: "middle"
    }, d[labelKey]));
  }));
}

// ─── LINE / AREA CHART з мітками місяців ─────────────────
// data: number[] АБО [{v, start: Date}, ...]
function AreaChart({
  data,
  h = 140,
  color = PALETTE.ink,
  monthTicks = true,
  showY = false,
  showPeaks = false,
  peakFormatter
}) {
  if (!data || !data.length) return /*#__PURE__*/React.createElement(EmptyChart, {
    h: h
  });
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
  const pts = values.map((v, i) => [leftPad + (values.length === 1 ? plotW / 2 : i / (values.length - 1) * plotW), topPad + plotH - v / max * (plotH - 4)]);
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ');
  const baseY = topPad + plotH;
  const area = path + ` L${pts[pts.length - 1][0]},${baseY} L${pts[0][0]},${baseY} Z`;
  const yTicks = showY ? [0, 0.5, 1].map(t => ({
    y: topPad + plotH - t * (plotH - 4),
    v: t * max
  })) : [];

  // Мітки місяців — не частіше кожних 30px
  const MONTH_UA = ['січ', 'лют', 'бер', 'кві', 'тра', 'чер', 'лип', 'сер', 'вер', 'жов', 'лис', 'гру'];
  const monthLabels = [];
  if (monthTicks && starts) {
    let prevMonth = -1;
    let lastX = -40;
    starts.forEach((s, i) => {
      if (!(s instanceof Date)) return;
      const m = s.getMonth();
      if (m !== prevMonth && pts[i][0] - lastX >= 30) {
        monthLabels.push({
          i,
          label: MONTH_UA[m],
          x: pts[i][0]
        });
        lastX = pts[i][0];
        prevMonth = m;
      } else if (m !== prevMonth) {
        prevMonth = m;
      }
    });
  }
  return /*#__PURE__*/React.createElement("svg", {
    width: "100%",
    height: h,
    viewBox: `0 0 300 ${h}`,
    preserveAspectRatio: "none"
  }, showY ? yTicks.map((t, i) => /*#__PURE__*/React.createElement("g", {
    key: i
  }, /*#__PURE__*/React.createElement("line", {
    x1: leftPad,
    x2: 300 - rightPad,
    y1: t.y,
    y2: t.y,
    stroke: PALETTE.line,
    strokeWidth: "0.5",
    strokeDasharray: "2 2"
  }), /*#__PURE__*/React.createElement("text", {
    x: leftPad - 4,
    y: t.y + 3,
    fontSize: "8",
    fontFamily: CH_MONO,
    fill: PALETTE.muted,
    textAnchor: "end"
  }, t.v > 1000 ? Math.round(t.v / 1000) + 'k' : fmt(t.v)))) : [0.25, 0.5, 0.75].map(t => /*#__PURE__*/React.createElement("line", {
    key: t,
    x1: leftPad,
    x2: 300 - rightPad,
    y1: topPad + plotH - t * (plotH - 4),
    y2: topPad + plotH - t * (plotH - 4),
    stroke: PALETTE.line,
    strokeWidth: "0.5",
    strokeDasharray: "2 2"
  })), /*#__PURE__*/React.createElement("path", {
    d: area,
    fill: color,
    fillOpacity: "0.12"
  }), /*#__PURE__*/React.createElement("path", {
    d: path,
    fill: "none",
    stroke: color,
    strokeWidth: "1.5"
  }), pts.map((p, i) => /*#__PURE__*/React.createElement("circle", {
    key: i,
    cx: p[0],
    cy: p[1],
    r: "2",
    fill: color
  })), showPeaks && pts.map((p, i) => {
    const v = values[i];
    if (v <= 0) return null;
    const prev = values[i - 1] ?? -Infinity;
    const next = values[i + 1] ?? -Infinity;
    // Показуємо тільки на ВИРАЗНИХ локальних максимумах (строго більше сусідів)
    // і на першій/останній точці якщо вона — максимум
    const isPeak = v > prev && v >= next || v >= prev && v > next;
    if (!isPeak) return null;
    const label = peakFormatter ? peakFormatter(v) : fmt(v);
    return /*#__PURE__*/React.createElement("text", {
      key: 'pk' + i,
      x: p[0],
      y: p[1] - 5,
      fontSize: "8.5",
      fontFamily: CH_MONO,
      fill: PALETTE.ink,
      fontWeight: "600",
      textAnchor: "middle"
    }, label);
  }), monthLabels.map((m, i) => /*#__PURE__*/React.createElement("g", {
    key: i
  }, /*#__PURE__*/React.createElement("line", {
    x1: m.x,
    x2: m.x,
    y1: baseY,
    y2: baseY + 3,
    stroke: PALETTE.muted,
    strokeWidth: "0.6"
  }), /*#__PURE__*/React.createElement("text", {
    x: m.x,
    y: h - 2,
    fontSize: "8.5",
    fontFamily: CH_MONO,
    fill: PALETTE.subtle,
    textAnchor: "middle"
  }, m.label))));
}

// ─── TWO-SERIES BARS (для порівняльних графіків, наприклад візити vs чеки) ─
function BarsV2({
  data,
  keyA,
  keyB,
  labelA,
  labelB,
  colorA,
  colorB,
  labelKey = 'month',
  h = 160
}) {
  if (!data || !data.length) return /*#__PURE__*/React.createElement(EmptyChart, {
    h: h
  });
  const max = Math.max(...data.flatMap(d => [d[keyA], d[keyB]]), 1) * 1.15;
  const pad = 30;
  const plotH = h - pad - 14;
  const groupW = 260 / Math.max(data.length, 1);
  const gap = groupW * 0.12;
  const bw = (groupW - gap) / 2;
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("svg", {
    width: "100%",
    height: h,
    viewBox: `0 0 300 ${h}`,
    preserveAspectRatio: "none"
  }, data.map((d, i) => {
    const x0 = 20 + i * groupW + gap / 2;
    const hA = d[keyA] / max * plotH;
    const hB = d[keyB] / max * plotH;
    return /*#__PURE__*/React.createElement("g", {
      key: i
    }, /*#__PURE__*/React.createElement("rect", {
      x: x0,
      y: plotH - hA,
      width: bw,
      height: hA,
      fill: colorA
    }), /*#__PURE__*/React.createElement("rect", {
      x: x0 + bw,
      y: plotH - hB,
      width: bw,
      height: hB,
      fill: colorB
    }), /*#__PURE__*/React.createElement("text", {
      x: x0 + bw,
      y: h - 4,
      fontSize: "9",
      fontFamily: CH_MONO,
      fill: PALETTE.subtle,
      textAnchor: "middle"
    }, d[labelKey]));
  })), /*#__PURE__*/React.createElement(Legend, {
    items: [{
      label: labelA,
      color: colorA
    }, {
      label: labelB,
      color: colorB
    }]
  }));
}
function Donut({
  data,
  size = 140,
  colors
}) {
  const total = data.reduce((s, d) => s + d.pct, 0);
  const cx = size / 2,
    cy = size / 2;
  const r = size / 2 - 4,
    rInner = r - 18;
  let a = -Math.PI / 2;
  const arcs = data.map((d, i) => {
    const frac = d.pct / total;
    const a2 = a + frac * Math.PI * 2;
    const large = frac > 0.5 ? 1 : 0;
    const x1 = cx + Math.cos(a) * r,
      y1 = cy + Math.sin(a) * r;
    const x2 = cx + Math.cos(a2) * r,
      y2 = cy + Math.sin(a2) * r;
    const x3 = cx + Math.cos(a2) * rInner,
      y3 = cy + Math.sin(a2) * rInner;
    const x4 = cx + Math.cos(a) * rInner,
      y4 = cy + Math.sin(a) * rInner;
    const d_ = `M${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} L${x3},${y3} A${rInner},${rInner} 0 ${large} 0 ${x4},${y4} Z`;
    a = a2;
    return /*#__PURE__*/React.createElement("path", {
      key: i,
      d: d_,
      fill: colors[i]
    });
  });
  return /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size
  }, arcs);
}
window.CHARTS = {
  ChartCard,
  Legend,
  ValueToggle,
  BigStat,
  BarsH,
  BarsV,
  BarsV2,
  AreaChart,
  Donut,
  fmt,
  fmtPct,
  PALETTE
};
})();
;(function(){
// Aggregator — перетворює raw rows з Google Sheets у метрики для UI.

// ── ПАРСЕРИ ────────────────────────────────────────────────

function num(v) {
  if (v == null || v === '') return 0;
  if (typeof v === 'number') return v;
  const s = String(v).trim().replace(/\s/g, '').replace(',', '.');
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}
function parseSalesDate(v) {
  if (!v) return null;
  if (v instanceof Date) return v;
  const s = String(v).trim();
  const m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
  // DD.MM.YYYY
  const m2 = s.match(/^(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})/);
  if (m2) return new Date(+m2[3], +m2[2] - 1, +m2[1]);
  const d = new Date(s);
  return isNaN(d) ? null : d;
}
function parseTrafficDate(v) {
  if (!v) return null;
  if (v instanceof Date) return v;
  const s = String(v).trim();
  // ISO з часом — Sheets зберігає як UTC-середина-ночі-для-локальної-дати (Мадрид).
  // Просто new Date(s) дає локальну дату правильно.
  if (/T\d{2}:\d{2}/.test(s)) {
    const d = new Date(s);
    return isNaN(d) ? null : d;
  }
  const m = s.match(/^(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})/);
  if (m) return new Date(+m[3], +m[2] - 1, +m[1]);
  const m2 = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m2) return new Date(+m2[1], +m2[2] - 1, +m2[3]);
  const d = new Date(s);
  return isNaN(d) ? null : d;
}

// Парсить годину з різних форматів:
//   "17:35:56"   → 17
//   "17:35"      → 17
//   "1899-12-30T17:35:56.000Z" (Sheets serial serialized as ISO з UTC) → 17 (UTC)
//   Date object  → getUTCHours() або getHours() залежно від джерела
function parseHour(v) {
  if (v == null || v === '') return null;
  const s = String(v).trim();
  // ISO-форма — беремо UTC-години (Sheets serial-часи серіалізуються в UTC)
  const iso = s.match(/T(\d{2}):(\d{2})/);
  if (iso) return parseInt(iso[1], 10);
  // HH:MM або HH:MM:SS
  const hm = s.match(/^(\d{1,2}):(\d{2})/);
  if (hm) return parseInt(hm[1], 10);
  const n = parseInt(s, 10);
  return isNaN(n) || n < 0 || n > 23 ? null : n;
}

// Українські назви днів / місяців
const MONTH_UA = ['січ', 'лют', 'бер', 'кві', 'тра', 'чер', 'лип', 'сер', 'вер', 'жов', 'лис', 'гру'];
const MONTH_UA_FULL = ['Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень', 'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'];
const WEEK_UA = ['нд', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
const WEEK_UA_FULL = ['Неділя', 'Понеділок', 'Вівторок', 'Середа', 'Четвер', 'П\u02bcятниця', 'Субота'];

// ── КАТЕГОРІЇ (нова розширена мапа) ───────────────────────
const FAMILIA_NAMES = {
  APM: 'Аксесуари',
  ALQ: 'Оренда',
  TXA: 'Оренда',
  AMA: 'Компоненти',
  AMH: 'Компоненти',
  AMP: 'Компоненти',
  NBR: 'Nutricion',
  SKR: 'Велосипеди',
  SKG: 'Велосипеди',
  SKM: 'Велосипеди',
  BID: 'Аксесуари',
  TPB: 'Компоненти',
  BIO: 'Оренда',
  BOL: 'Аксесуари',
  RBE: 'Компоненти',
  CYF: 'Компоненти',
  TCD: 'Компоненти',
  PCA: 'Аксесуари',
  CAL: 'Одяг',
  CAM: 'Компоненти',
  CNY: 'Компоненти',
  CRB: 'Компоненти',
  CAS: 'Екіпірування',
  TCS: 'Компоненти',
  CSL: 'Одяг',
  CHL: 'Одяг',
  CHA: 'Одяг',
  CYP: 'Компоненти',
  CPL: 'Одяг',
  CUI: 'Аксесуари',
  CRT: 'Одяг',
  CUL: 'Одяг',
  TDC: 'Компоненти',
  DRC: 'Компоненти',
  SKE: 'Велосипеди',
  ECI: 'Велосипеди',
  EFP: 'Велосипеди',
  ELE: 'Аксесуари',
  EMT: 'Велосипеди',
  POR: 'Інше',
  ERD: 'Велосипеди',
  FCP: 'Компоненти',
  FRN: 'Компоненти',
  GAF: 'Екіпірування',
  NGL: 'Екіпірування',
  GPS: 'Аксесуари',
  TGR: 'Компоненти',
  GUA: 'Одяг',
  GDB: 'Аксесуари',
  HRM: 'Аксесуари',
  NHD: 'Nutricion',
  HIN: 'Аксесуари',
  IND: 'Аксесуари',
  RLL: 'Компоненти',
  ILU: 'Аксесуари',
  MCT: 'Одяг',
  MLR: 'Одяг',
  MLL: 'Одяг',
  TMP: 'Компоненти',
  MAN: 'Компоненти',
  MNL: 'Компоненти',
  MNT: 'Компоненти',
  LMP: 'Компоненти',
  MER: 'Інше',
  MOT: 'Компоненти',
  NEU: 'Компоненти',
  RNP: 'Компоненти',
  OTP: 'Екіпірування',
  OTR: 'Аксесуари',
  ACC: 'Аксесуари',
  CLR: 'Одяг',
  TPR: 'Компоненти',
  RPR: 'Компоненти',
  FPS: 'Компоненти',
  PED: 'Компоненти',
  TPE: 'Компоненти',
  ENV: 'Інше',
  POT: 'Компоненти',
  TPT: 'Компоненти',
  PTC: 'Аксесуари',
  PRO: 'Аксесуари',
  PTR: 'Компоненти',
  QDL: 'Аксесуари',
  RRC: 'Компоненти',
  FRC: 'Компоненти',
  REC: 'Nutricion',
  REB: 'Ремонт',
  REV: 'Ремонт',
  REP: 'Ремонт',
  ROD: 'Компоненти',
  RDL: 'Аксесуари',
  INT: 'Одяг',
  FDS: 'Компоненти',
  RRU: 'Компоненти',
  RUE: 'Компоненти',
  SEG: 'Аксесуари',
  SLL: 'Компоненти',
  SIN: 'Компоненти',
  NSP: 'Nutricion',
  TAB: 'Nutricion',
  TJS: 'Компоненти',
  TJP: 'Компоненти',
  TMS: 'Компоненти',
  TBL: 'Компоненти',
  ZAC: 'Екіпірування',
  ZAP: 'Екіпірування',
  FZA: 'Компоненти'
};
function categoryName(code) {
  if (!code) return 'Інше';
  const up = String(code).trim().toUpperCase();
  return FAMILIA_NAMES[up] || up;
}

// ── SALES ─────────────────────────────────────────────────
function normalizeSaleRow(r) {
  return {
    date: parseSalesDate(r['Дата'] || r.date),
    time: r['Час'] || r.time || '',
    doc: String(r[' Документ'] || r['Документ'] || r.doc || '').trim(),
    client: String(r['Клієнт'] || r.client || '').trim(),
    sku: String(r['Артикул'] || r.sku || '').trim(),
    name: String(r['Назва товару'] || r.name || '').trim(),
    cat: String(r['Категорія (Familia)'] || r.cat || '').trim(),
    qty: num(r['Кількість']),
    price: num(r['Ціна за од.']),
    pay: String(r['Спосіб Оплати'] || '').trim(),
    sale: num(r['Продаж (Сума)']),
    vat: num(r[' Сума ПДВ'] || r['Сума ПДВ']),
    gross: num(r['Разом з ПДВ']),
    cost: num(r['Собівартість (Закупка)']),
    profit: num(r['Чистий Прибуток.'] || r['Чистий Прибуток'])
  };
}
function dateKey(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

// Глобальні мінімальні дати — до цих дат дані вважаємо тестовими.
// Продажі: дані є з 1 січня 2026. Traffic: сенсор встановлений 10 квітня 2026.
const SALES_START = new Date(2026, 0, 1); // 01.01.2026
const TRAFFIC_START = new Date(2026, 3, 10); // 10.04.2026
SALES_START.setHours(0, 0, 0, 0);
TRAFFIC_START.setHours(0, 0, 0, 0);
// Legacy alias (на випадок якщо десь використовується)
const DATA_START = SALES_START;

// Фільтрує records по опціях: periodDays (last N days based on latest) АБО from/to
// minDate — нижня межа (SALES_START або TRAFFIC_START).
function applyPeriod(allRecords, opts, minDate) {
  minDate = minDate || SALES_START;
  if (!allRecords.length) return allRecords;
  allRecords = allRecords.filter(r => r.date >= minDate);
  if (!allRecords.length) return allRecords;
  const latest = allRecords.reduce((a, r) => r.date > a ? r.date : a, new Date(0));
  if (opts.from && opts.to) {
    const f = new Date(opts.from);
    f.setHours(0, 0, 0, 0);
    const t = new Date(opts.to);
    t.setHours(23, 59, 59, 999);
    return allRecords.filter(r => r.date >= f && r.date <= t);
  }
  if (opts.periodDays) {
    const d = new Date(latest);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (opts.periodDays - 1));
    return allRecords.filter(r => r.date >= d);
  }
  return allRecords;
}
function aggregateSales(rows, opts = {}) {
  if (!rows?.length) return emptySales();
  const allRecords = rows.map(normalizeSaleRow).filter(r => r.date && r.date >= SALES_START);
  // maxCheck застосовується ТІЛЬКИ до avgCheck (нижче). Totals/monthly/categories — повні.
  const maxCheck = opts.maxCheck || Infinity;
  const records = applyPeriod(allRecords, opts, SALES_START);

  // Поточний тиждень (пн-сб, від latest — неділю виключаємо, не працюємо)
  const latest = allRecords.length ? allRecords.reduce((a, r) => r.date > a ? r.date : a, new Date(0)) : new Date();
  const wkStart = weekStart(latest);
  const weekRecords = allRecords.filter(r => r.date >= wkStart && r.date <= latest && r.date.getDay() !== 0);
  const weekDocsSum = new Map();
  weekRecords.forEach(r => {
    if (!r.doc) return;
    weekDocsSum.set(r.doc, (weekDocsSum.get(r.doc) || 0) + r.gross);
  });
  const weekDocsCount = weekDocsSum.size;
  const weekGrossTotal = [...weekDocsSum.values()].reduce((a, b) => a + b, 0);
  // Середній чек для Overview — з тим самим фільтром maxCheck, що й глобальний
  const weekDocsFiltered = [...weekDocsSum.values()].filter(v => v < maxCheck);
  const weekAvgCheck = weekDocsFiltered.length ? weekDocsFiltered.reduce((a, b) => a + b, 0) / weekDocsFiltered.length : 0;
  const currentWeek = {
    gross: weekRecords.reduce((a, r) => a + r.gross, 0),
    profit: weekRecords.reduce((a, r) => a + r.profit, 0),
    count: weekRecords.length,
    docs: weekDocsCount,
    avgCheck: weekAvgCheck,
    avgCheckDocs: weekDocsFiltered.length,
    range: weekRecords.length ? {
      from: wkStart,
      to: latest
    } : null
  };
  // Майстерня (категорія "Ремонт") поточний тиждень
  const repairWeek = weekRecords.filter(r => categoryName(r.cat) === 'Ремонт');
  const workshopWeek = {
    gross: repairWeek.reduce((a, r) => a + r.gross, 0),
    profit: repairWeek.reduce((a, r) => a + r.profit, 0),
    count: repairWeek.length,
    docs: new Set(repairWeek.map(r => r.doc).filter(Boolean)).size
  };
  const totals = records.reduce((a, r) => {
    a.gross += r.gross;
    a.sale += r.sale;
    a.cost += r.cost;
    a.profit += r.profit;
    a.vat += r.vat;
    return a;
  }, {
    gross: 0,
    sale: 0,
    cost: 0,
    profit: 0,
    vat: 0
  });

  // Monthly
  const monthMap = new Map();
  records.forEach(r => {
    const key = r.date.getFullYear() + '-' + r.date.getMonth();
    if (!monthMap.has(key)) {
      monthMap.set(key, {
        year: r.date.getFullYear(),
        mIdx: r.date.getMonth(),
        month: MONTH_UA[r.date.getMonth()],
        total: 0
      });
    }
    monthMap.get(key).total += r.gross;
  });
  const monthly = [...monthMap.values()].sort((a, b) => a.year - b.year || a.mIdx - b.mIdx);

  // Категорії (згруповані по Familia через мапу)
  const catMap = new Map();
  records.forEach(r => {
    const name = categoryName(r.cat);
    catMap.set(name, (catMap.get(name) || 0) + r.gross);
  });
  const catTotal = [...catMap.values()].reduce((a, b) => a + b, 0) || 1;
  const categories = [...catMap.entries()].map(([name, value]) => ({
    name,
    value,
    pct: value / catTotal * 100
  })).sort((a, b) => b.value - a.value);

  // По днях тижня (UA) — ВІДСІЮЄМО чеки >1000€ (рідкі великі опт-покупки) і неділю
  // Агрегуємо по документах (чеках), не по позиціях; далі — по днях тижня.
  const docGrossByDate = new Map();
  records.forEach(r => {
    if (!r.doc) return;
    const k = r.doc + '|' + dateKey(r.date);
    const cur = docGrossByDate.get(k) || {
      date: r.date,
      gross: 0
    };
    cur.gross += r.gross;
    docGrossByDate.set(k, cur);
  });
  const dayMap = new Map();
  docGrossByDate.forEach(doc => {
    if (doc.gross > 1000) return; // відсів великі чеки
    const key = WEEK_UA[doc.date.getDay()];
    if (key === 'нд') return; // неділю геть
    dayMap.set(key, (dayMap.get(key) || 0) + doc.gross);
  });
  const weekByDayTotal = [...dayMap.values()].reduce((a, b) => a + b, 0) || 1;
  const weekByDay = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб'].map(d => ({
    day: d,
    v: Math.round(dayMap.get(d) || 0),
    pct: Math.round((dayMap.get(d) || 0) / weekByDayTotal * 1000) / 10
  })).filter(x => x.v > 0);

  // Timeline по тижнях з міткою місяця (перший день тижня)
  const weekMap = new Map();
  records.forEach(r => {
    const key = isoWeekKey(r.date);
    if (!weekMap.has(key)) {
      const wkStart = weekStart(r.date);
      weekMap.set(key, {
        v: 0,
        start: wkStart
      });
    }
    weekMap.get(key).v += r.gross;
  });
  const timeline = [...weekMap.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([, w]) => ({
    v: Math.round(w.v),
    start: w.start
  }));

  // Топ товарів/клієнтів
  const prodMap = new Map();
  records.forEach(r => {
    if (!r.name) return;
    const k = r.sku || r.name;
    const cur = prodMap.get(k) || {
      sku: r.sku,
      name: r.name,
      qty: 0,
      gross: 0,
      profit: 0
    };
    cur.qty += r.qty;
    cur.gross += r.gross;
    cur.profit += r.profit;
    prodMap.set(k, cur);
  });
  const topProducts = [...prodMap.values()].sort((a, b) => b.gross - a.gross).slice(0, 20);
  const clientMap = new Map();
  records.forEach(r => {
    if (!r.client || r.client === '0') return;
    const cur = clientMap.get(r.client) || {
      id: r.client,
      count: 0,
      gross: 0
    };
    cur.count += 1;
    cur.gross += r.gross;
    clientMap.set(r.client, cur);
  });
  const topClients = [...clientMap.values()].sort((a, b) => b.gross - a.gross).slice(0, 20);

  // Способи оплати (з перекладом) — + %
  const PAY_NAMES = {
    TRA: 'Переказ',
    TAR: 'Термінал',
    EFE: 'Готівка',
    WEB: 'WEB',
    OTRO: 'Інше'
  };
  const payMap = new Map();
  records.forEach(r => {
    const k = (r.pay || 'OTRO').toUpperCase();
    payMap.set(k, (payMap.get(k) || 0) + r.gross);
  });
  const payTotal = [...payMap.values()].reduce((a, b) => a + b, 0) || 1;
  const payments = [...payMap.entries()].map(([code, v]) => ({
    code,
    name: PAY_NAMES[code] || code,
    v: Math.round(v),
    pct: Math.round(v / payTotal * 1000) / 10
  })).sort((a, b) => b.v - a.v);

  // Unique docs per date (для Ratio)
  const docsByDate = new Map();
  records.forEach(r => {
    if (!r.doc) return;
    const k = dateKey(r.date);
    if (!docsByDate.has(k)) docsByDate.set(k, new Set());
    docsByDate.get(k).add(r.doc);
  });
  const receiptsByDate = {};
  docsByDate.forEach((set, k) => {
    receiptsByDate[k] = set.size;
  });
  const totalReceipts = Object.values(receiptsByDate).reduce((a, b) => a + b, 0);

  // Середній чек — на унікальний документ, з фільтром maxCheck
  const docGrossTotals = new Map();
  records.forEach(r => {
    if (!r.doc) return;
    docGrossTotals.set(r.doc, (docGrossTotals.get(r.doc) || 0) + r.gross);
  });
  // Виключаємо документи з сумою >= maxCheck (Vasile: "без продажів від 5000" / "від 2000")
  const filteredDocs = [...docGrossTotals.values()].filter(v => v < maxCheck);
  const avgCheck = filteredDocs.length ? filteredDocs.reduce((a, b) => a + b, 0) / filteredDocs.length : 0;
  const avgCheckDocs = filteredDocs.length;
  const dates = records.map(r => r.date);
  const range = dates.length ? {
    from: new Date(Math.min(...dates)),
    to: new Date(Math.max(...dates))
  } : null;
  return {
    totals,
    monthly,
    categories,
    weekByDay,
    timeline,
    topProducts,
    topClients,
    payments,
    receiptsByDate,
    totalReceipts,
    avgCheck,
    avgCheckDocs,
    maxCheck,
    range,
    count: records.length,
    currentWeek,
    workshopWeek
  };
}
function emptySales() {
  return {
    totals: {
      gross: 0,
      sale: 0,
      cost: 0,
      profit: 0,
      vat: 0
    },
    monthly: [],
    categories: [],
    weekByDay: [],
    timeline: [],
    topProducts: [],
    topClients: [],
    payments: [],
    receiptsByDate: {},
    totalReceipts: 0,
    avgCheck: 0,
    avgCheckDocs: 0,
    maxCheck: Infinity,
    range: null,
    count: 0,
    currentWeek: {
      gross: 0,
      profit: 0,
      count: 0,
      docs: 0,
      avgCheck: 0,
      range: null
    },
    workshopWeek: {
      gross: 0,
      profit: 0,
      count: 0,
      docs: 0
    }
  };
}
function weekStart(d) {
  const t = new Date(d);
  const day = t.getDay() || 7; // Sunday=7
  t.setHours(0, 0, 0, 0);
  t.setDate(t.getDate() - (day - 1));
  return t;
}
function isoWeekKey(d) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const wk = Math.ceil(((t - yearStart) / 86400000 + 1) / 7);
  return t.getUTCFullYear() + '-' + String(wk).padStart(2, '0');
}

// ── TRAFFIC (з Visitas_Detalle) ────────────────────────────
// Header: Date, Time, Week_Day, Session_ID, Event, Gender, Age, Age_Group, Duration_min
function aggregateTraffic(rows, opts = {}) {
  if (!rows?.length) return emptyTraffic();

  // Visitas_Detalle: Date, Time, Week_Day, Session_ID, Event (enter|exit), Gender, Age, Age_Group, Duration_min
  // Відвідування = (count(enter) + count(exit)) / 2 — за вимогою Vasile.
  // Щоб агрегації просто сумувати — кожен рядок важить 0.5 (енкодуємо в r.enter).
  const allRecords = rows.map(r => {
    const ev = String(r['Event'] || '').trim().toLowerCase();
    return {
      date: parseTrafficDate(r['Date'] || r.date),
      time: String(r['Time'] || '').trim(),
      event: ev,
      // 'enter' | 'exit'
      enter: ev === 'enter' || ev === 'exit' ? 0.5 : 0,
      // вага для (enter+exit)/2
      exit: ev === 'exit' ? 1 : 0,
      gender: String(r['Gender'] || r['Стать'] || '-').trim(),
      duration: num(r['Duration_min'] || r['Хвилини'] || r['Duration']),
      ageGroup: String(r['Age_Group'] || r['AgeGroup'] || r['Вік'] || '').trim()
    };
  }).filter(r => r.date && r.date >= TRAFFIC_START && (r.event === 'enter' || r.event === 'exit'));
  const records = applyPeriod(allRecords, opts, TRAFFIC_START);

  // Відвідування = (count(enter) + count(exit)) / 2. Кожен рядок = вага 0.5 в r.enter.
  const enterRecords = records; // всі події для per-time агрегації
  const exitRecords = records.filter(r => r.event === 'exit'); // для duration
  const enterOnly = records.filter(r => r.event === 'enter'); // для hourly/weekday — тільки час входу
  const totalVisitors = records.reduce((a, r) => a + r.enter, 0);

  // Gender/Age — беремо з КОЖНОГО рядка де є (enter або exit), вага = 0.5
  const genderMap = {
    Ч: 0,
    Ж: 0,
    '-': 0
  };
  const ageGroupMap = new Map();
  const durations = [];
  records.forEach(r => {
    const g = r.gender || '-';
    const k = g === 'Ч' || g === 'Ж' ? g : '-';
    genderMap[k] += 0.5;
    if (r.ageGroup) {
      ageGroupMap.set(r.ageGroup, (ageGroupMap.get(r.ageGroup) || 0) + 0.5);
    }
  });
  // Duration — з exit (там фіксується час сесії)
  exitRecords.forEach(r => {
    if (r.duration > 0) durations.push(r.duration);
  });

  // Age groups sorted
  const ageOrder = ['0-17', '18-35', '36-50', '51+'];
  const ageGroups = [...ageGroupMap.entries()].map(([name, v]) => ({
    name,
    v
  })).sort((a, b) => {
    const ia = ageOrder.indexOf(a.name),
      ib = ageOrder.indexOf(b.name);
    if (ia !== -1 && ib !== -1) return ia - ib;
    return a.name.localeCompare(b.name);
  });

  // Середня тривалість
  const avgDuration = durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;

  // Гистограма тривалості (0-2, 2-5, 5-10, 10-20, 20+)
  const durationBuckets = [{
    label: '0-2 хв',
    min: 0,
    max: 2,
    v: 0
  }, {
    label: '2-5 хв',
    min: 2,
    max: 5,
    v: 0
  }, {
    label: '5-10 хв',
    min: 5,
    max: 10,
    v: 0
  }, {
    label: '10-20 хв',
    min: 10,
    max: 20,
    v: 0
  }, {
    label: '20+ хв',
    min: 20,
    max: 1e9,
    v: 0
  }];
  durations.forEach(d => {
    const b = durationBuckets.find(b => d >= b.min && d < b.max);
    if (b) b.v += 1;
  });

  // Місяці — сума enter
  const monthMap = new Map();
  enterRecords.forEach(r => {
    const key = r.date.getFullYear() + '-' + r.date.getMonth();
    if (!monthMap.has(key)) {
      monthMap.set(key, {
        year: r.date.getFullYear(),
        mIdx: r.date.getMonth(),
        month: MONTH_UA[r.date.getMonth()],
        v: 0
      });
    }
    monthMap.get(key).v += r.enter;
  });
  const monthly = [...monthMap.values()].sort((a, b) => a.year - b.year || a.mIdx - b.mIdx);

  // По днях тижня (UA) — кількість Enter; неділю виключено (не працюємо)
  const dayMap = new Map();
  enterOnly.forEach(r => {
    if (r.date.getDay() === 0) return;
    const key = WEEK_UA[r.date.getDay()];
    dayMap.set(key, (dayMap.get(key) || 0) + 1);
  });
  const weekday = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб'].map(d => ({
    day: d,
    v: dayMap.get(d) || 0
  }));

  // По годинах — СЕРЕДНЄ по дню тижня (кількість Enter / кількість унікальних дат)
  const hourAllByDow = {};
  for (let d = 0; d < 7; d++) hourAllByDow[d] = {};
  enterOnly.forEach(r => {
    const h = parseHour(r.time);
    if (h == null) return;
    const dow = r.date.getDay();
    const dk = dateKey(r.date);
    if (!hourAllByDow[dow][h]) hourAllByDow[dow][h] = {
      total: 0,
      dates: new Set()
    };
    hourAllByDow[dow][h].total += 1;
    hourAllByDow[dow][h].dates.add(dk);
  });

  // Побудова hourlyByDay: {dow: [{h, avg, total}]}
  function hoursFor(dow, hFrom, hTo) {
    const byHour = hourAllByDow[dow] || {};
    const allDates = new Set();
    Object.values(byHour).forEach(x => x.dates.forEach(d => allDates.add(d)));
    const numDates = allDates.size || 1;
    const hours = [];
    for (let h = hFrom; h <= hTo; h++) {
      const b = byHour[h] || {
        total: 0
      };
      hours.push({
        h,
        avg: b.total / numDates,
        total: b.total
      });
    }
    // В відсотках від загальної середньої
    const sum = hours.reduce((a, x) => a + x.avg, 0) || 1;
    return hours.map(x => ({
      ...x,
      pct: Math.round(x.avg / sum * 1000) / 10
    }));
  }

  // Для кожного дня тижня (пн-сб) + Усе (пн-пт середнє)
  const hourlyByDay = {};
  // пн-пт (dow 1..5) = 10-20
  [1, 2, 3, 4, 5].forEach(dow => {
    hourlyByDay[dow] = hoursFor(dow, 10, 20);
  });
  // сб (dow 6) = 8-14
  hourlyByDay[6] = hoursFor(6, 8, 14);
  // "Усе" — середнє по пн-пт (без сб і нд)
  const allWeekdayHours = [];
  for (let h = 10; h <= 20; h++) {
    let sumAvg = 0,
      sumPct = 0;
    [1, 2, 3, 4, 5].forEach(dow => {
      const row = hourlyByDay[dow].find(x => x.h === h);
      if (row) {
        sumAvg += row.avg;
      }
    });
    allWeekdayHours.push({
      h,
      avg: sumAvg / 5
    });
  }
  const totalAllAvg = allWeekdayHours.reduce((a, x) => a + x.avg, 0) || 1;
  hourlyByDay['all'] = allWeekdayHours.map(x => ({
    ...x,
    pct: Math.round(x.avg / totalAllAvg * 1000) / 10
  }));

  // Поточний тиждень (для Home)
  const latest = allRecords.length ? allRecords.reduce((a, r) => r.date > a ? r.date : a, new Date(0)) : new Date();
  const wkStart = weekStart(latest);
  const currentWeekEnters = allRecords.filter(r => r.enter > 0 && r.date >= wkStart && r.date <= latest);
  const currentWeek = {
    visitors: currentWeekEnters.reduce((a, r) => a + r.enter, 0),
    range: currentWeekEnters.length ? {
      from: wkStart,
      to: latest
    } : null
  };

  // Тенденція: останні 7 днів vs попередні 7 днів
  const last7End = new Date(latest);
  last7End.setHours(23, 59, 59, 999);
  const last7Start = new Date(latest);
  last7Start.setHours(0, 0, 0, 0);
  last7Start.setDate(last7Start.getDate() - 6);
  const prev7End = new Date(last7Start);
  prev7End.setDate(prev7End.getDate() - 1);
  prev7End.setHours(23, 59, 59, 999);
  const prev7Start = new Date(prev7End);
  prev7Start.setDate(prev7Start.getDate() - 6);
  prev7Start.setHours(0, 0, 0, 0);
  const allEnters = allRecords.filter(r => r.enter > 0);
  const last7Count = allEnters.filter(r => r.date >= last7Start && r.date <= last7End).reduce((a, r) => a + r.enter, 0);
  const prev7Count = allEnters.filter(r => r.date >= prev7Start && r.date <= prev7End).reduce((a, r) => a + r.enter, 0);
  const last7Trend = {
    current: last7Count,
    previous: prev7Count,
    deltaPct: prev7Count > 0 ? (last7Count - prev7Count) / prev7Count * 100 : null
  };

  // Last 7 днів по днях
  const last7Map = new Map();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(last7End);
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    last7Map.set(dateKey(d), {
      date: new Date(d),
      v: 0
    });
  }
  allEnters.forEach(r => {
    if (r.date < last7Start || r.date > last7End) return;
    const k = dateKey(r.date);
    if (last7Map.has(k)) last7Map.get(k).v += r.enter;
  });
  const last7Days = [...last7Map.values()].map(x => ({
    day: WEEK_UA[x.date.getDay()],
    dateStr: String(x.date.getDate()).padStart(2, '0') + '.' + String(x.date.getMonth() + 1).padStart(2, '0'),
    v: x.v
  }));

  // По тижнях (для тижневого графіка — 4/8/16/всі)
  const weekMap = new Map();
  allEnters.forEach(r => {
    const key = isoWeekKey(r.date);
    if (!weekMap.has(key)) {
      weekMap.set(key, {
        v: 0,
        start: weekStart(r.date)
      });
    }
    weekMap.get(key).v += r.enter;
  });
  const weekly = [...weekMap.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([, w]) => ({
    v: w.v,
    start: w.start
  }));

  // По місяцях у людинах (за весь час)
  const monthlyAll = new Map();
  allEnters.forEach(r => {
    const k = r.date.getFullYear() + '-' + r.date.getMonth();
    if (!monthlyAll.has(k)) monthlyAll.set(k, {
      year: r.date.getFullYear(),
      mIdx: r.date.getMonth(),
      month: MONTH_UA[r.date.getMonth()],
      v: 0
    });
    monthlyAll.get(k).v += r.enter;
  });
  const monthlyAllTime = [...monthlyAll.values()].sort((a, b) => a.year - b.year || a.mIdx - b.mIdx);

  // Stats for entire dataset (за весь час — для age/gender %)
  const allGenderMap = {
    Ч: 0,
    Ж: 0,
    '-': 0
  };
  const allAgeGroupMap = new Map();
  allEnters.forEach(r => {
    const g = r.gender || '-';
    const k = g === 'Ч' || g === 'Ж' ? g : '-';
    allGenderMap[k] += r.enter;
    if (r.ageGroup) allAgeGroupMap.set(r.ageGroup, (allAgeGroupMap.get(r.ageGroup) || 0) + r.enter);
  });
  const allGenderTotal = allGenderMap.Ч + allGenderMap.Ж || 1; // без '-' у %
  const genderAllTime = [{
    name: 'Чоловіки',
    v: allGenderMap.Ч,
    pct: Math.round(allGenderMap.Ч / allGenderTotal * 1000) / 10
  }, {
    name: 'Жінки',
    v: allGenderMap.Ж,
    pct: Math.round(allGenderMap.Ж / allGenderTotal * 1000) / 10
  }].filter(g => g.v > 0);
  const ageOrderAll = ['0-17', '18-35', '36-50', '51+'];
  const ageAllTotal = [...allAgeGroupMap.values()].reduce((a, b) => a + b, 0) || 1;
  const ageGroupsAllTime = [...allAgeGroupMap.entries()].map(([name, v]) => ({
    name,
    v,
    pct: Math.round(v / ageAllTotal * 1000) / 10
  })).sort((a, b) => {
    const ia = ageOrderAll.indexOf(a.name),
      ib = ageOrderAll.indexOf(b.name);
    if (ia !== -1 && ib !== -1) return ia - ib;
    return a.name.localeCompare(b.name);
  });
  const dates = enterRecords.map(r => r.date);
  const range = dates.length ? {
    from: new Date(Math.min(...dates)),
    to: new Date(Math.max(...dates))
  } : null;

  // visitsByDate для Ratio — використовуємо ту саму вагу (0.5 на рядок), щоб сумма = totalVisitors
  const visitsByDate = {};
  enterRecords.forEach(r => {
    const k = dateKey(r.date);
    visitsByDate[k] = (visitsByDate[k] || 0) + r.enter;
  });

  // Peak hour: з hourlyByDay['all']
  let peakHour = null,
    peakV = 0;
  (hourlyByDay['all'] || []).forEach(x => {
    if (x.avg > peakV) {
      peakV = x.avg;
      peakHour = x.h;
    }
  });
  return {
    totalVisitors,
    gender: genderMap,
    ageGroups,
    avgDuration,
    durationBuckets,
    peakHour,
    peakHourVisits: Math.round(peakV * 10) / 10,
    monthly,
    weekday,
    hourly: hourlyByDay['all'] || [],
    hourlyByDay,
    visitsByDate,
    range,
    count: enterRecords.length,
    currentWeek,
    last7Trend,
    last7Days,
    weekly,
    monthlyAllTime,
    genderAllTime,
    ageGroupsAllTime
  };
}
function emptyTraffic() {
  return {
    totalVisitors: 0,
    gender: {
      Ч: 0,
      Ж: 0,
      '-': 0
    },
    ageGroups: [],
    avgDuration: 0,
    durationBuckets: [],
    peakHour: null,
    peakHourVisits: 0,
    monthly: [],
    weekday: [],
    hourly: [],
    hourlyByDay: {},
    visitsByDate: {},
    range: null,
    count: 0,
    currentWeek: {
      visitors: 0,
      range: null
    },
    last7Trend: {
      current: 0,
      previous: 0,
      deltaPct: null
    },
    last7Days: [],
    weekly: [],
    monthlyAllTime: [],
    genderAllTime: [],
    ageGroupsAllTime: []
  };
}

// Ratio: клієнти / чеки, рахуємо з TRAFFIC_START (10.04.2026) — до цієї дати не було сенсора
function computeRatio(sales, traffic) {
  const trafficStartKey = dateKey(TRAFFIC_START);
  const dates = new Set([...Object.keys(sales.receiptsByDate || {}), ...Object.keys(traffic.visitsByDate || {})]);
  let v = 0,
    r = 0;
  const daily = [];
  [...dates].sort().forEach(d => {
    if (d < trafficStartKey) return; // пропускаємо sales до TRAFFIC_START
    const visits = traffic.visitsByDate[d] || 0;
    const receipts = sales.receiptsByDate[d] || 0;
    v += visits;
    r += receipts;
    daily.push({
      date: d,
      visits,
      receipts
    });
  });
  const ratio = r > 0 ? v / r : 0; // клієнти на 1 чек
  const conversion = v > 0 ? r / v * 100 : 0;
  return {
    ratio,
    conversion,
    totalVisits: v,
    totalReceipts: r,
    daily
  };
}

// ── PUBLIC ──
window.AGGREGATOR = {
  aggregateSales,
  aggregateTraffic,
  computeRatio,
  MONTH_UA,
  MONTH_UA_FULL,
  WEEK_UA,
  WEEK_UA_FULL
};
})();
;(function(){
// DataStore — єдине джерело даних застосунку.
// Стратегія:
//   1. На init читає кеш з localStorage → одразу показує дані (навіть офлайн).
//   2. Робить fetch до Apps Script endpoint в фоні.
//   3. Коли прийшла відповідь — оновлює стан + пише новий кеш.
//
// Формат відповіді від скрипта:
//   { updated: ISO, sales: {headers, rows}, traffic: {headers, rows} }

const API_URL = window.ADICTO_CONFIG?.apiUrl || '';
const CACHE_KEY = 'adicto.data.v1';
const CACHE_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30; // 30 днів — просто граничне значення

function loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.payload || !parsed?.savedAt) return null;
    if (Date.now() - parsed.savedAt > CACHE_MAX_AGE_MS) return null;
    return parsed;
  } catch (e) {
    return null;
  }
}
function saveCache(payload) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      savedAt: Date.now(),
      payload
    }));
  } catch (e) {
    console.warn('Cache write failed', e);
  }
}
function useDataStore() {
  const cached = React.useMemo(loadCache, []);
  const [state, setState] = React.useState({
    payload: cached?.payload || null,
    savedAt: cached?.savedAt || null,
    loading: !!API_URL,
    error: null,
    source: cached ? 'cache' : null
  });
  const refresh = React.useCallback(async () => {
    if (!API_URL) {
      setState(s => ({
        ...s,
        loading: false,
        error: 'API_URL not configured'
      }));
      return;
    }
    setState(s => ({
      ...s,
      loading: true,
      error: null
    }));
    try {
      const res = await fetch(API_URL, {
        redirect: 'follow'
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const payload = await res.json();
      saveCache(payload);
      setState({
        payload,
        savedAt: Date.now(),
        loading: false,
        error: null,
        source: 'live'
      });
    } catch (e) {
      console.error('Fetch failed', e);
      setState(s => ({
        ...s,
        loading: false,
        error: e.message || 'Fetch failed'
        // залишаємо кешований payload, якщо був
      }));
    }
  }, []);
  React.useEffect(() => {
    if (API_URL) refresh();
  }, [refresh]);
  return {
    ...state,
    refresh
  };
}
window.DATA_STORE = {
  useDataStore
};
})();
;(function(){
// PullToRefresh — обгортка зверху над скролом.
// Показує індикатор при тязі вниз від верху. При достатній відстані — виконує onRefresh().
//
// Не перехоплює скрол усередині — якщо scrollTop > 0, жест ігнорується.
// Використовує pointer events для iOS/Android consistency.

const PTR_THRESHOLD = 70; // px — нижче цього порога скасовує
const PTR_MAX = 110; // px — візуальний максимум розтягу
const PTR_DAMPING = 0.5; // нелінійне розтягування

function PullToRefresh({
  onRefresh,
  loading,
  children
}) {
  const ref = React.useRef(null);
  const [pull, setPull] = React.useState(0); // 0..PTR_MAX
  const [armed, setArmed] = React.useState(false); // чи буде тригеритись при release
  const startY = React.useRef(null);
  const active = React.useRef(false);
  const onStart = React.useCallback(e => {
    const el = ref.current;
    if (!el) return;
    // Тільки якщо ми у самому верху скрола
    const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
    if (scrollTop > 0) return;
    startY.current = e.touches ? e.touches[0].clientY : e.clientY;
    active.current = true;
  }, []);
  const onMove = React.useCallback(e => {
    if (!active.current || startY.current == null) return;
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    const raw = y - startY.current;
    if (raw <= 0) {
      setPull(0);
      setArmed(false);
      return;
    }
    // нелінійне
    const d = Math.min(PTR_MAX, raw * PTR_DAMPING);
    setPull(d);
    setArmed(d >= PTR_THRESHOLD);
    // Блокуємо браузерний bounce тільки коли ми активно тягнемо
    if (e.cancelable && raw > 10) e.preventDefault();
  }, []);
  const onEnd = React.useCallback(() => {
    if (!active.current) return;
    active.current = false;
    if (armed && !loading) {
      setPull(PTR_THRESHOLD); // залишаємо видимим поки крутиться
      Promise.resolve(onRefresh?.()).finally(() => {
        setPull(0);
        setArmed(false);
      });
    } else {
      setPull(0);
      setArmed(false);
    }
    startY.current = null;
  }, [armed, loading, onRefresh]);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const opt = {
      passive: false
    };
    el.addEventListener('touchstart', onStart, opt);
    el.addEventListener('touchmove', onMove, opt);
    el.addEventListener('touchend', onEnd);
    el.addEventListener('touchcancel', onEnd);
    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchmove', onMove);
      el.removeEventListener('touchend', onEnd);
      el.removeEventListener('touchcancel', onEnd);
    };
  }, [onStart, onMove, onEnd]);
  const spin = loading && pull > 0;
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    style: {
      position: 'relative',
      minHeight: '100%'
    }
  }, /*#__PURE__*/React.createElement(PTRIndicator, {
    pull: pull,
    armed: armed,
    spin: spin
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      transform: `translateY(${pull}px)`,
      transition: active.current ? 'none' : 'transform 0.25s cubic-bezier(0.22,1,0.36,1)'
    }
  }, children));
}
function PTRIndicator({
  pull,
  armed,
  spin
}) {
  const opacity = Math.min(1, pull / 40);
  const rot = spin ? null : pull / PTR_THRESHOLD * 180;
  const PALETTE = window.CHARTS.PALETTE;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: -50,
      left: 0,
      right: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: 50,
      pointerEvents: 'none',
      opacity,
      transform: `translateY(${pull}px)`,
      transition: 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      fontFamily: '"JetBrains Mono", ui-monospace, monospace',
      fontSize: 9,
      letterSpacing: 1,
      textTransform: 'uppercase',
      color: armed ? PALETTE.ink : PALETTE.muted
    }
  }, spin ? /*#__PURE__*/React.createElement("div", {
    style: {
      width: 12,
      height: 12,
      border: `1.5px solid ${PALETTE.line}`,
      borderTopColor: PALETTE.ink,
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite'
    }
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-block',
      width: 14,
      height: 14,
      transform: `rotate(${rot}deg)`,
      transition: 'transform 0.05s linear'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 14 14",
    width: "14",
    height: "14"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M7 2 L7 11 M4 8 L7 11 L10 8",
    fill: "none",
    stroke: armed ? PALETTE.ink : PALETTE.muted,
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))), /*#__PURE__*/React.createElement("span", null, spin ? 'Оновлення' : armed ? 'Відпустіть' : 'Потягніть')));
}
window.PTR = {
  PullToRefresh
};
})();
;(function(){
// MoreExtras — Нотатки + Файли + Підписка на автоматичні звіти

const {
  PALETTE: ME_PAL
} = window.CHARTS;
const ME_MONO = '"JetBrains Mono", ui-monospace, monospace';

// ── NOTES ──────────────────────────────────────────────────────
const NOTES_KEY = 'adicto.notes.v1';
function loadNotes() {
  try {
    return JSON.parse(localStorage.getItem(NOTES_KEY) || '[]');
  } catch {
    return [];
  }
}
function saveNotes(notes) {
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}
function NotesSection({
  userEmail
}) {
  const [notes, setNotes] = React.useState(loadNotes);
  const [draft, setDraft] = React.useState('');
  const [editingId, setEditingId] = React.useState(null);
  const [editingText, setEditingText] = React.useState('');
  function addNote() {
    const text = draft.trim();
    if (!text) return;
    const next = [{
      id: Date.now(),
      text,
      createdAt: new Date().toISOString(),
      author: userEmail
    }, ...notes];
    setNotes(next);
    saveNotes(next);
    setDraft('');
  }
  function deleteNote(id) {
    if (!confirm('Видалити цей запис?')) return;
    const next = notes.filter(n => n.id !== id);
    setNotes(next);
    saveNotes(next);
  }
  function startEdit(n) {
    setEditingId(n.id);
    setEditingText(n.text);
  }
  function saveEdit() {
    const next = notes.map(n => n.id === editingId ? {
      ...n,
      text: editingText,
      updatedAt: new Date().toISOString()
    } : n);
    setNotes(next);
    saveNotes(next);
    setEditingId(null);
    setEditingText('');
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement(SectionTitle, {
    label: "\u041D\u043E\u0442\u0430\u0442\u043A\u0438",
    hint: `${notes.length}`
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fffbf0',
      border: `1px solid ${ME_PAL.line}`,
      borderRadius: 12,
      padding: 12
    }
  }, /*#__PURE__*/React.createElement("textarea", {
    value: draft,
    onChange: e => setDraft(e.target.value),
    placeholder: "\u041D\u0430\u043F\u0438\u0448\u0456\u0442\u044C \u043D\u043E\u0442\u0430\u0442\u043A\u0443 \u2014 \u0441\u043F\u043E\u0441\u0442\u0435\u0440\u0435\u0436\u0435\u043D\u043D\u044F, \u043F\u043B\u0430\u043D\u0438, \u043D\u0430\u0433\u0430\u0434\u0443\u0432\u0430\u043D\u043D\u044F\u2026",
    rows: 3,
    style: {
      width: '100%',
      border: `1px solid ${ME_PAL.line}`,
      borderRadius: 8,
      padding: 10,
      fontFamily: ME_MONO,
      fontSize: 12,
      color: ME_PAL.ink,
      background: '#fffdf5',
      resize: 'vertical',
      outline: 'none',
      boxSizing: 'border-box'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'flex-end',
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: addNote,
    disabled: !draft.trim(),
    style: btnPrimary(!draft.trim())
  }, "\uFF0B \u0417\u0431\u0435\u0440\u0435\u0433\u0442\u0438"))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10,
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, notes.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '24px 12px',
      textAlign: 'center',
      fontFamily: ME_MONO,
      fontSize: 10,
      color: ME_PAL.subtle,
      letterSpacing: 0.4,
      border: `1px dashed ${ME_PAL.line}`,
      borderRadius: 10
    }
  }, "\u041F\u043E\u043A\u0438 \u043D\u0435\u043C\u0430\u0454 \u043D\u043E\u0442\u0430\u0442\u043E\u043A"), notes.map(n => /*#__PURE__*/React.createElement("div", {
    key: n.id,
    style: {
      background: '#fffbf0',
      border: `1px solid ${ME_PAL.line}`,
      borderRadius: 10,
      padding: 12
    }
  }, editingId === n.id ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("textarea", {
    value: editingText,
    onChange: e => setEditingText(e.target.value),
    rows: 3,
    style: {
      width: '100%',
      border: `1px solid ${ME_PAL.line}`,
      borderRadius: 8,
      padding: 8,
      fontFamily: ME_MONO,
      fontSize: 12,
      color: ME_PAL.ink,
      background: '#fffdf5',
      resize: 'vertical',
      outline: 'none',
      boxSizing: 'border-box'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      justifyContent: 'flex-end',
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setEditingId(null),
    style: btnGhost
  }, "\u0421\u043A\u0430\u0441\u0443\u0432\u0430\u0442\u0438"), /*#__PURE__*/React.createElement("button", {
    onClick: saveEdit,
    style: btnPrimary(false)
  }, "\u0417\u0431\u0435\u0440\u0435\u0433\u0442\u0438"))) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: ME_MONO,
      fontSize: 12,
      color: ME_PAL.ink,
      whiteSpace: 'pre-wrap',
      lineHeight: 1.5
    }
  }, n.text), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 8,
      paddingTop: 8,
      borderTop: `1px solid ${ME_PAL.line}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: ME_MONO,
      fontSize: 9,
      color: ME_PAL.muted,
      letterSpacing: 0.3
    }
  }, fmtDateTime(n.createdAt), n.updatedAt ? ' · ред.' : ''), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => startEdit(n),
    style: btnIcon
  }, "\u270E"), /*#__PURE__*/React.createElement("button", {
    onClick: () => deleteNote(n.id),
    style: btnIconDanger
  }, "\u2715"))))))));
}

// ── FILES ──────────────────────────────────────────────────────
const FILES_KEY = 'adicto.files.v1';
function loadFiles() {
  try {
    return JSON.parse(localStorage.getItem(FILES_KEY) || '[]');
  } catch {
    return [];
  }
}
function saveFiles(files) {
  try {
    localStorage.setItem(FILES_KEY, JSON.stringify(files));
    return true;
  } catch (e) {
    alert('Не вистачає місця у сховищі. Видаліть старі файли.');
    return false;
  }
}

// Ліміт — файли дозволяємо до 5 MB (щоб не зламати localStorage, він ~5-10 MB)
const FILE_MAX_MB = 3;
function FilesSection({
  userEmail
}) {
  const [files, setFiles] = React.useState(loadFiles);
  const inputRef = React.useRef(null);
  function handlePick(e) {
    const list = [...(e.target.files || [])];
    if (!list.length) return;
    const tasks = list.map(f => new Promise((resolve, reject) => {
      if (f.size > FILE_MAX_MB * 1024 * 1024) {
        alert(`"${f.name}" — більше ${FILE_MAX_MB} МБ. Пропускаю.`);
        resolve(null);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => resolve({
        id: Date.now() + '-' + Math.random().toString(36).slice(2, 7),
        name: f.name,
        size: f.size,
        type: f.type,
        dataUrl: reader.result,
        uploadedAt: new Date().toISOString(),
        uploadedBy: userEmail
      });
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(f);
    }));
    Promise.all(tasks).then(results => {
      const ok = results.filter(Boolean);
      if (!ok.length) return;
      const next = [...ok, ...files];
      if (saveFiles(next)) setFiles(next);
    });
    e.target.value = '';
  }
  function remove(id) {
    if (!confirm('Видалити файл?')) return;
    const next = files.filter(f => f.id !== id);
    if (saveFiles(next)) setFiles(next);
  }
  function download(f) {
    const a = document.createElement('a');
    a.href = f.dataUrl;
    a.download = f.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement(SectionTitle, {
    label: "\u0424\u0430\u0439\u043B\u0438",
    hint: `${files.length} · до ${FILE_MAX_MB} МБ/файл`
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fffbf0',
      border: `1px dashed ${ME_PAL.line}`,
      borderRadius: 12,
      padding: 16,
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("input", {
    ref: inputRef,
    type: "file",
    multiple: true,
    onChange: handlePick,
    style: {
      display: 'none'
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => inputRef.current?.click(),
    style: btnPrimary(false)
  }, "\u2191 \u0417\u0430\u0432\u0430\u043D\u0442\u0430\u0436\u0438\u0442\u0438 \u0444\u0430\u0439\u043B"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: ME_MONO,
      fontSize: 9,
      color: ME_PAL.subtle,
      letterSpacing: 0.3,
      marginTop: 8
    }
  }, "\u0417\u0431\u0435\u0440\u0456\u0433\u0430\u0454\u0442\u044C\u0441\u044F \u043B\u043E\u043A\u0430\u043B\u044C\u043D\u043E \u043D\u0430 \u0446\u044C\u043E\u043C\u0443 \u043F\u0440\u0438\u0441\u0442\u0440\u043E\u0457")), files.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10,
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, files.map(f => /*#__PURE__*/React.createElement("div", {
    key: f.id,
    style: {
      background: '#fffbf0',
      border: `1px solid ${ME_PAL.line}`,
      borderRadius: 10,
      padding: '10px 12px',
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 18,
      color: ME_PAL.muted
    }
  }, fileIcon(f.type)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: ME_MONO,
      fontSize: 11,
      color: ME_PAL.ink,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, f.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: ME_MONO,
      fontSize: 9,
      color: ME_PAL.muted,
      marginTop: 2
    }
  }, fmtBytes(f.size), " \xB7 ", fmtDateTime(f.uploadedAt))), /*#__PURE__*/React.createElement("button", {
    onClick: () => download(f),
    style: btnIcon,
    title: "\u0417\u0430\u0432\u0430\u043D\u0442\u0430\u0436\u0438\u0442\u0438"
  }, "\u2193"), /*#__PURE__*/React.createElement("button", {
    onClick: () => remove(f.id),
    style: btnIconDanger,
    title: "\u0412\u0438\u0434\u0430\u043B\u0438\u0442\u0438"
  }, "\u2715")))));
}

// ── SUBSCRIPTIONS ──────────────────────────────────────────────
const SUBS_KEY = 'adicto.subs.v1';
const REPORT_TYPES = [{
  id: 'traffic_w',
  label: 'Трафік — тижневий',
  cadence: 'weekly'
}, {
  id: 'traffic_m',
  label: 'Трафік — місячний',
  cadence: 'monthly'
}, {
  id: 'sales_w',
  label: 'Продажі — тижневі',
  cadence: 'weekly'
}, {
  id: 'sales_m',
  label: 'Продажі — місячні',
  cadence: 'monthly'
}];
function loadSubs() {
  try {
    return JSON.parse(localStorage.getItem(SUBS_KEY) || 'null') || {
      active: false,
      selected: [],
      email: ''
    };
  } catch {
    return {
      active: false,
      selected: [],
      email: ''
    };
  }
}
function saveSubs(s) {
  localStorage.setItem(SUBS_KEY, JSON.stringify(s));
}
function SubscriptionsSection({
  userEmail
}) {
  const [subs, setSubs] = React.useState(() => {
    const s = loadSubs();
    if (!s.email && userEmail) s.email = userEmail;
    return s;
  });
  const [draft, setDraft] = React.useState(subs);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const dirty = JSON.stringify(draft) !== JSON.stringify(subs);
  function toggleReport(id) {
    const next = draft.selected.includes(id) ? draft.selected.filter(x => x !== id) : [...draft.selected, id];
    setDraft({
      ...draft,
      selected: next
    });
  }
  function confirmSubscription() {
    const next = {
      ...draft,
      active: draft.selected.length > 0,
      confirmedAt: new Date().toISOString()
    };
    setSubs(next);
    saveSubs(next);
    setConfirmOpen(false);
  }
  function unsubscribe() {
    if (!confirm('Відписатись від усіх звітів?')) return;
    const next = {
      ...subs,
      active: false,
      selected: []
    };
    setSubs(next);
    setDraft(next);
    saveSubs(next);
  }
  const statusColor = subs.active ? '#7aa875' : ME_PAL.muted;
  const statusLabel = subs.active ? 'Підписаний' : 'Не підписаний';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement(SectionTitle, {
    label: "\u0410\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u043D\u0430 \u0432\u0456\u0434\u043F\u0440\u0430\u0432\u043A\u0430 \u0437\u0432\u0456\u0442\u0456\u0432",
    hint: /*#__PURE__*/React.createElement("span", {
      style: {
        color: statusColor
      }
    }, "\u25CF ", statusLabel)
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fffbf0',
      border: `1px solid ${ME_PAL.line}`,
      borderRadius: 12,
      padding: 14
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 10,
      cursor: 'pointer',
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: draft.selected.length > 0,
    onChange: e => {
      if (!e.target.checked) setDraft({
        ...draft,
        selected: []
      });else if (draft.selected.length === 0) setDraft({
        ...draft,
        selected: ['traffic_w']
      });
    },
    style: {
      width: 18,
      height: 18,
      accentColor: ME_PAL.ink,
      marginTop: 1,
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: ME_MONO,
      fontSize: 12,
      color: ME_PAL.ink,
      fontWeight: 500
    }
  }, "\u0410\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u043D\u0430 \u0432\u0456\u0434\u043F\u0440\u0430\u0432\u043A\u0430 \u0437\u0432\u0456\u0442\u0456\u0432"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: ME_MONO,
      fontSize: 10,
      color: ME_PAL.subtle,
      marginTop: 3,
      lineHeight: 1.5
    }
  }, "\u0422\u0438\u0436\u043D\u0435\u0432\u0456 \u2014 \u043A\u043E\u0436\u043D\u0443 \u043D\u0435\u0434\u0456\u043B\u044E \u043E 20:00.", /*#__PURE__*/React.createElement("br", null), "\u041C\u0456\u0441\u044F\u0447\u043D\u0456 \u2014 1-\u0433\u043E \u0447\u0438\u0441\u043B\u0430 \u043D\u0430\u0441\u0442\u0443\u043F\u043D\u043E\u0433\u043E \u043C\u0456\u0441\u044F\u0446\u044F."))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: `1px solid ${ME_PAL.line}`,
      paddingTop: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: ME_MONO,
      fontSize: 9,
      letterSpacing: 1,
      textTransform: 'uppercase',
      color: ME_PAL.muted,
      marginBottom: 10
    }
  }, "\u041E\u0431\u0440\u0430\u0442\u0438 \u0437\u0432\u0456\u0442\u0438"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, REPORT_TYPES.map(r => {
    const on = draft.selected.includes(r.id);
    return /*#__PURE__*/React.createElement("label", {
      key: r.id,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        cursor: 'pointer',
        padding: '8px 10px',
        borderRadius: 8,
        background: on ? '#f5ecd2' : 'transparent',
        border: `1px solid ${on ? ME_PAL.ink : ME_PAL.line}`
      }
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      checked: on,
      onChange: () => toggleReport(r.id),
      style: {
        width: 16,
        height: 16,
        accentColor: ME_PAL.ink,
        flexShrink: 0
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: ME_MONO,
        fontSize: 11,
        color: ME_PAL.ink
      }
    }, r.label), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: ME_MONO,
        fontSize: 9,
        color: ME_PAL.muted,
        marginTop: 1,
        letterSpacing: 0.3
      }
    }, r.cadence === 'weekly' ? 'щонеділі' : '1-го числа місяця')));
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: `1px solid ${ME_PAL.line}`,
      marginTop: 14,
      paddingTop: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: ME_MONO,
      fontSize: 9,
      letterSpacing: 1,
      textTransform: 'uppercase',
      color: ME_PAL.muted,
      marginBottom: 6
    }
  }, "Email \u0434\u043B\u044F \u0432\u0456\u0434\u043F\u0440\u0430\u0432\u043A\u0438"), /*#__PURE__*/React.createElement("input", {
    value: draft.email || '',
    onChange: e => setDraft({
      ...draft,
      email: e.target.value
    }),
    placeholder: "you@domain.com",
    style: {
      width: '100%',
      border: `1px solid ${ME_PAL.line}`,
      borderRadius: 8,
      padding: '8px 10px',
      fontFamily: ME_MONO,
      fontSize: 12,
      color: ME_PAL.ink,
      background: '#fffdf5',
      outline: 'none',
      boxSizing: 'border-box'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginTop: 14
    }
  }, subs.active && /*#__PURE__*/React.createElement("button", {
    onClick: unsubscribe,
    style: btnGhostDanger
  }, "\u0412\u0456\u0434\u043F\u0438\u0441\u0430\u0442\u0438\u0441\u044F"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setConfirmOpen(true),
    disabled: !dirty || draft.selected.length === 0 || !draft.email,
    style: {
      ...btnPrimary(!dirty || draft.selected.length === 0 || !draft.email),
      marginLeft: 'auto'
    }
  }, subs.active ? 'Оновити підписку' : 'Підтвердити'))), confirmOpen && /*#__PURE__*/React.createElement(ConfirmModal, {
    title: "\u041F\u0456\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u0438 \u043F\u0456\u0434\u043F\u0438\u0441\u043A\u0443",
    body: /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: ME_MONO,
        fontSize: 11,
        color: ME_PAL.ink,
        marginBottom: 10
      }
    }, "\u0417\u0432\u0456\u0442\u0438 \u0431\u0443\u0434\u0443\u0442\u044C \u043D\u0430\u0434\u0441\u0438\u043B\u0430\u0442\u0438\u0441\u044F \u043D\u0430 ", /*#__PURE__*/React.createElement("b", null, draft.email), ":"), /*#__PURE__*/React.createElement("ul", {
      style: {
        margin: 0,
        paddingLeft: 18,
        fontFamily: ME_MONO,
        fontSize: 11,
        color: ME_PAL.ink,
        lineHeight: 1.6
      }
    }, REPORT_TYPES.filter(r => draft.selected.includes(r.id)).map(r => /*#__PURE__*/React.createElement("li", {
      key: r.id
    }, r.label, " ", /*#__PURE__*/React.createElement("span", {
      style: {
        color: ME_PAL.muted
      }
    }, "\u2014 ", r.cadence === 'weekly' ? 'щонеділі 20:00' : '1-го числа о 09:00'))))),
    onConfirm: confirmSubscription,
    onCancel: () => setConfirmOpen(false)
  }));
}

// ── HELPERS ────────────────────────────────────────────────────
function SectionTitle({
  label,
  hint
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      margin: '18px 0 8px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: ME_MONO,
      fontSize: 10,
      letterSpacing: 1.3,
      textTransform: 'uppercase',
      color: ME_PAL.ink,
      fontWeight: 600
    }
  }, label), hint != null && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: ME_MONO,
      fontSize: 9,
      color: ME_PAL.muted,
      letterSpacing: 0.4
    }
  }, hint));
}
function fmtBytes(b) {
  if (b < 1024) return b + ' B';
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB';
  return (b / 1024 / 1024).toFixed(2) + ' MB';
}
function fmtDateTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const p = n => String(n).padStart(2, '0');
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()} · ${p(d.getHours())}:${p(d.getMinutes())}`;
}
function fileIcon(type) {
  if (!type) return '◫';
  if (type.startsWith('image/')) return '▦';
  if (type.includes('pdf')) return '▤';
  if (type.includes('sheet') || type.includes('excel') || type.includes('csv')) return '▥';
  if (type.includes('word') || type.includes('document')) return '▣';
  if (type.startsWith('video/')) return '▸';
  if (type.startsWith('audio/')) return '♪';
  return '◫';
}
function ConfirmModal({
  title,
  body,
  onConfirm,
  onCancel
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(26,21,16,0.5)',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      zIndex: 200,
      padding: 16
    },
    onClick: onCancel
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      background: '#fdf9ee',
      borderRadius: 16,
      padding: 20,
      maxWidth: 420,
      width: '100%',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: ME_MONO,
      fontSize: 11,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      color: ME_PAL.ink,
      fontWeight: 600,
      marginBottom: 12
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 16
    }
  }, body), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onCancel,
    style: {
      ...btnGhost,
      flex: 1
    }
  }, "\u0421\u043A\u0430\u0441\u0443\u0432\u0430\u0442\u0438"), /*#__PURE__*/React.createElement("button", {
    onClick: onConfirm,
    style: {
      ...btnPrimary(false),
      flex: 1
    }
  }, "\u041F\u0456\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u0438"))));
}

// ── BUTTON STYLES ──────────────────────────────────────────────
const btnBase = {
  fontFamily: ME_MONO,
  fontSize: 10,
  letterSpacing: 1,
  textTransform: 'uppercase',
  cursor: 'pointer',
  border: 'none',
  borderRadius: 100,
  padding: '9px 16px',
  transition: 'opacity .15s'
};
function btnPrimary(disabled) {
  return {
    ...btnBase,
    background: disabled ? '#d8cfb6' : ME_PAL.ink,
    color: '#f1ead8',
    opacity: disabled ? 0.5 : 1,
    cursor: disabled ? 'default' : 'pointer'
  };
}
const btnGhost = {
  ...btnBase,
  background: 'transparent',
  border: `1px solid ${ME_PAL.line}`,
  color: ME_PAL.ink,
  padding: '8px 15px'
};
const btnGhostDanger = {
  ...btnBase,
  background: 'transparent',
  border: `1px solid #d7a398`,
  color: '#a0472e',
  padding: '8px 15px'
};
const btnIcon = {
  background: 'transparent',
  border: `1px solid ${ME_PAL.line}`,
  borderRadius: 6,
  width: 28,
  height: 28,
  cursor: 'pointer',
  fontFamily: ME_MONO,
  fontSize: 12,
  color: ME_PAL.ink,
  padding: 0
};
const btnIconDanger = {
  ...btnIcon,
  color: '#a0472e',
  borderColor: '#e0c4be'
};

// ── EXPORTS ────────────────────────────────────────────────────
window.MORE_EXTRAS = {
  NotesSection,
  FilesSection,
  SubscriptionsSection
};
})();
;(function(){
// Screens — малює екрани з агрегованих даних.

const {
  ChartCard,
  BigStat,
  BarsH,
  BarsV,
  BarsV2,
  AreaChart,
  Donut,
  Legend,
  ValueToggle,
  fmt,
  fmtPct,
  PALETTE
} = window.CHARTS;
const {
  MONTH_UA,
  MONTH_UA_FULL,
  WEEK_UA,
  WEEK_UA_FULL
} = window.AGGREGATOR;
const SC_MONO = '"JetBrains Mono", ui-monospace, monospace';
function Section({
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 16px'
    }
  }, children);
}

// Справжнє лого ADICTO (чорна версія)
function AdictoLogo({
  size = 18
}) {
  return /*#__PURE__*/React.createElement("img", {
    src: "logo.png",
    width: size,
    height: size,
    alt: "ADICTO",
    style: {
      flexShrink: 0,
      display: 'block'
    }
  });
}
function ScreenHeader({
  title,
  subtitle,
  right
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 16px 16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: SC_MONO,
      fontSize: 28,
      lineHeight: 1,
      letterSpacing: -0.8,
      color: PALETTE.ink,
      textTransform: 'uppercase',
      fontWeight: 600
    }
  }, title), subtitle && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: SC_MONO,
      fontSize: 10,
      color: PALETTE.subtle,
      marginTop: 6,
      letterSpacing: 0.4
    }
  }, subtitle)), right));
}

// ── Форматери ─────────────────────────
function fmtDate(d) {
  if (!d) return '';
  return String(d.getDate()).padStart(2, '0') + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.' + d.getFullYear();
}
function fmtDateShort(d) {
  if (!d) return '';
  return String(d.getDate()).padStart(2, '0') + '.' + String(d.getMonth() + 1).padStart(2, '0');
}

// ── Inline Date Range Picker (по клацанню відкриваються input type="date") ──
function DateRangeInline({
  range,
  customFrom,
  customTo,
  onCustomChange,
  onActivate,
  isActive
}) {
  if (!range) return null;
  const from = isActive && customFrom ? new Date(customFrom) : range.from;
  const to = isActive && customTo ? new Date(customTo) : range.to;
  const [editing, setEditing] = React.useState(false);
  React.useEffect(() => {
    if (!isActive) setEditing(false);
  }, [isActive]);
  const dateStr = d => d ? d.toISOString().slice(0, 10) : '';
  if (editing) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        borderRadius: 100,
        background: '#fffbf0',
        border: `1px solid ${PALETTE.ink}`,
        fontFamily: SC_MONO,
        fontSize: 10,
        color: PALETTE.ink
      }
    }, /*#__PURE__*/React.createElement("input", {
      type: "date",
      defaultValue: customFrom || dateStr(range.from),
      onChange: e => {
        onActivate();
        onCustomChange({
          from: e.target.value,
          to: customTo || dateStr(range.to)
        });
      },
      style: {
        border: 'none',
        background: 'transparent',
        fontFamily: SC_MONO,
        fontSize: 10,
        color: PALETTE.ink,
        padding: 0,
        outline: 'none'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        color: PALETTE.muted
      }
    }, "\u2014"), /*#__PURE__*/React.createElement("input", {
      type: "date",
      defaultValue: customTo || dateStr(range.to),
      onChange: e => {
        onActivate();
        onCustomChange({
          from: customFrom || dateStr(range.from),
          to: e.target.value
        });
      },
      style: {
        border: 'none',
        background: 'transparent',
        fontFamily: SC_MONO,
        fontSize: 10,
        color: PALETTE.ink,
        padding: 0,
        outline: 'none'
      }
    }), /*#__PURE__*/React.createElement("button", {
      onClick: () => setEditing(false),
      style: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: PALETTE.muted,
        fontSize: 14,
        padding: 0,
        marginLeft: 4,
        lineHeight: 1
      }
    }, "\u2713"));
  }
  return /*#__PURE__*/React.createElement("button", {
    onClick: () => setEditing(true),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '6px 12px',
      borderRadius: 100,
      background: '#fffbf0',
      border: `1px solid ${PALETTE.line}`,
      fontFamily: SC_MONO,
      fontSize: 9.5,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      color: PALETTE.ink,
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: PALETTE.accent
    }
  }, "\u20AC"), fmtDate(from), " \u2014 ", fmtDate(to), /*#__PURE__*/React.createElement("span", {
    style: {
      color: PALETTE.muted,
      marginLeft: 4,
      fontSize: 11
    }
  }, "\u270E"));
}

// ── Period Selector (7/30/90/Рік/Все) ──
function PeriodSelector({
  current,
  onChange
}) {
  const opts = [{
    id: '7',
    label: '7 дн'
  }, {
    id: '30',
    label: '30 дн'
  }, {
    id: '90',
    label: '90 дн'
  }, {
    id: '365',
    label: 'Рік'
  }, {
    id: 'all',
    label: 'Все'
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      background: '#ede5d0',
      padding: 3,
      borderRadius: 10,
      gap: 2
    }
  }, opts.map(o => {
    const active = current === o.id;
    return /*#__PURE__*/React.createElement("button", {
      key: o.id,
      onClick: () => onChange(o.id),
      style: {
        flex: 1,
        padding: '7px 4px',
        borderRadius: 8,
        background: active ? '#fffbf0' : 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontFamily: SC_MONO,
        fontSize: 9.5,
        letterSpacing: 0.6,
        textTransform: 'uppercase',
        color: active ? PALETTE.ink : PALETTE.muted,
        fontWeight: active ? 500 : 400,
        boxShadow: active ? '0 1px 2px rgba(0,0,0,0.04)' : 'none'
      }
    }, o.label);
  }));
}

// ── Button: Export PDF ──
function ExportPdfButton({
  label = 'ЕКСПОРТ PDF',
  onClick
}) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding: '7px 12px',
      borderRadius: 100,
      background: PALETTE.ink,
      border: `1px solid ${PALETTE.ink}`,
      fontFamily: SC_MONO,
      fontSize: 9.5,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      color: '#f1ead8',
      cursor: 'pointer',
      fontWeight: 500
    }
  }, /*#__PURE__*/React.createElement("span", null, "\u21E3"), label);
}

// ── Chart Comments (yellow dot + composer + thread) ──
const COMMENTS_KEY = 'adicto.comments.v1';
const ADMIN_EMAIL = 'vasile@adicto.bike';
function loadComments() {
  try {
    return JSON.parse(localStorage.getItem(COMMENTS_KEY) || '{}');
  } catch {
    return {};
  }
}
function saveComments(all) {
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(all));
}
function CommentThread({
  chartId,
  userEmail
}) {
  const [all, setAll] = React.useState(() => loadComments());
  const [draft, setDraft] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const items = all[chartId] || [];
  const isAdmin = userEmail === ADMIN_EMAIL;
  const add = () => {
    if (!draft.trim()) return;
    const next = {
      ...all
    };
    next[chartId] = [...(next[chartId] || []), {
      id: 'c_' + Date.now(),
      author: userEmail || '—',
      text: draft.trim(),
      at: Date.now()
    }];
    saveComments(next);
    setAll(next);
    setDraft('');
  };
  const reply = idx => {
    const t = prompt('Ваша відповідь:');
    if (!t || !t.trim()) return;
    const next = {
      ...all
    };
    next[chartId] = next[chartId].map((c, i) => i === idx ? {
      ...c,
      replies: [...(c.replies || []), {
        author: userEmail || '—',
        text: t.trim(),
        at: Date.now()
      }]
    } : c);
    saveComments(next);
    setAll(next);
  };
  const del = idx => {
    if (!confirm('Видалити коментар?')) return;
    const next = {
      ...all
    };
    next[chartId] = next[chartId].filter((_, i) => i !== idx);
    saveComments(next);
    setAll(next);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setOpen(!open),
    title: items.length ? `${items.length} коментарів` : 'Додати коментар',
    style: {
      position: 'absolute',
      top: -4,
      right: -4,
      zIndex: 2,
      width: 22,
      height: 22,
      borderRadius: 11,
      background: items.length ? '#f5c843' : 'transparent',
      border: `1.5px solid ${items.length ? '#c9a521' : PALETTE.line}`,
      cursor: 'pointer',
      padding: 0,
      fontFamily: SC_MONO,
      fontSize: 10,
      fontWeight: 600,
      color: items.length ? '#1a1510' : PALETTE.muted,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: items.length ? '0 0 0 3px rgba(245,200,67,0.25)' : 'none'
    }
  }, items.length || '+'), open && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 24,
      right: -4,
      width: 300,
      zIndex: 20,
      background: '#fffbf0',
      border: `1px solid ${PALETTE.line}`,
      borderRadius: 12,
      boxShadow: '0 12px 40px rgba(0,0,0,0.14)',
      padding: 12,
      fontFamily: SC_MONO,
      fontSize: 11,
      color: PALETTE.ink
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 9,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      color: PALETTE.muted,
      marginBottom: 10,
      display: 'flex',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", null, "\u041A\u043E\u043C\u0435\u043D\u0442\u0430\u0440\u0456"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setOpen(false),
    style: {
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      color: PALETTE.muted,
      padding: 0,
      fontSize: 13
    }
  }, "\xD7")), items.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: PALETTE.subtle,
      paddingBottom: 10
    }
  }, "\u041A\u043E\u043C\u0435\u043D\u0442\u0430\u0440\u0456\u0432 \u0449\u0435 \u043D\u0435\u043C\u0430\u0454."), items.map((c, i) => /*#__PURE__*/React.createElement("div", {
    key: c.id,
    style: {
      borderTop: i > 0 ? `1px solid ${PALETTE.line}` : 'none',
      paddingTop: i > 0 ? 10 : 0,
      paddingBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 9,
      color: PALETTE.muted,
      marginBottom: 2,
      display: 'flex',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", null, c.author), /*#__PURE__*/React.createElement("span", null, new Date(c.at).toLocaleDateString('uk-UA'))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      lineHeight: 1.4
    }
  }, c.text), (c.replies || []).map((r, ri) => /*#__PURE__*/React.createElement("div", {
    key: ri,
    style: {
      marginTop: 6,
      marginLeft: 12,
      paddingLeft: 10,
      borderLeft: `2px solid ${PALETTE.line}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 9,
      color: PALETTE.muted
    }
  }, r.author), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10.5,
      lineHeight: 1.4
    }
  }, r.text))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => reply(i),
    style: {
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      padding: 0,
      fontFamily: SC_MONO,
      fontSize: 9,
      color: PALETTE.accent,
      textDecoration: 'underline'
    }
  }, "\u0412\u0456\u0434\u043F\u043E\u0432\u0456\u0441\u0442\u0438"), (c.author === userEmail || isAdmin) && /*#__PURE__*/React.createElement("button", {
    onClick: () => del(i),
    style: {
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      padding: 0,
      fontFamily: SC_MONO,
      fontSize: 9,
      color: '#c47862',
      textDecoration: 'underline'
    }
  }, "\u0412\u0438\u0434\u0430\u043B\u0438\u0442\u0438")))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement("textarea", {
    value: draft,
    onChange: e => setDraft(e.target.value),
    rows: 2,
    placeholder: "\u0412\u0430\u0448 \u043A\u043E\u043C\u0435\u043D\u0442\u0430\u0440\u2026",
    style: {
      width: '100%',
      boxSizing: 'border-box',
      resize: 'none',
      fontFamily: SC_MONO,
      fontSize: 11,
      padding: 8,
      background: '#f1ead8',
      border: `1px solid ${PALETTE.line}`,
      borderRadius: 8,
      color: PALETTE.ink,
      outline: 'none'
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: add,
    disabled: !draft.trim(),
    style: {
      marginTop: 6,
      padding: '6px 12px',
      background: PALETTE.ink,
      color: '#f1ead8',
      border: 'none',
      borderRadius: 6,
      cursor: draft.trim() ? 'pointer' : 'default',
      fontFamily: SC_MONO,
      fontSize: 9,
      letterSpacing: 1,
      textTransform: 'uppercase',
      opacity: draft.trim() ? 1 : 0.4
    }
  }, "\u0414\u043E\u0434\u0430\u0442\u0438"))));
}

// Обгортка для ChartCard що додає CommentThread
function CommentableCard({
  id,
  title,
  subtitle,
  right,
  children,
  userEmail
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement(CommentThread, {
    chartId: id,
    userEmail: userEmail
  }), /*#__PURE__*/React.createElement(ChartCard, {
    title: title,
    subtitle: subtitle,
    right: right
  }, children));
}

// ── HOME ───────────────────────────────
function HomeScreen({
  sales,
  traffic,
  accent,
  updated,
  source,
  userEmail
}) {
  const cw = sales.currentWeek || {
    gross: 0,
    profit: 0,
    count: 0,
    docs: 0,
    range: null
  };
  const ww = sales.workshopWeek || {
    gross: 0,
    profit: 0,
    count: 0,
    docs: 0
  };
  const tw = traffic.currentWeek || {
    visitors: 0,
    range: null
  };
  const trend = traffic.last7Trend || {
    deltaPct: null
  };
  const wkRange = cw.range ? `${fmtDateShort(cw.range.from)} — ${fmtDateShort(cw.range.to)}` : '';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 120
    }
  }, /*#__PURE__*/React.createElement(ScreenHeader, {
    title: "Overview",
    subtitle: updatedLabel(updated, source)
  }), /*#__PURE__*/React.createElement(Section, null, /*#__PURE__*/React.createElement(CommentableCard, {
    id: "home-sales",
    userEmail: userEmail,
    title: "\u041F\u0440\u043E\u0434\u0430\u0436\u0456 \xB7 \u041F\u043E\u0442\u043E\u0447\u043D\u0438\u0439 \u0442\u0438\u0436\u0434\u0435\u043D\u044C",
    subtitle: wkRange
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement(BigStat, {
    label: "\u0417 \u041F\u0414\u0412",
    value: fmt(cw.gross),
    accent: accent
  }), /*#__PURE__*/React.createElement(BigStat, {
    label: "\u041F\u0440\u0438\u0431\u0443\u0442\u043E\u043A",
    value: fmt(cw.profit)
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(BigStat, {
    label: "\u0421\u0435\u0440\u0435\u0434\u043D\u0456\u0439 \u0447\u0435\u043A",
    value: cw.avgCheck ? fmt(Math.round(cw.avgCheck)) : '—',
    hint: cw.docs ? `${cw.docs} чеків` : ''
  }), /*#__PURE__*/React.createElement(BigStat, {
    label: "\u041E\u043F\u0435\u0440\u0430\u0446\u0456\u0439",
    value: fmt(cw.docs)
  }))), /*#__PURE__*/React.createElement(CommentableCard, {
    id: "home-workshop",
    userEmail: userEmail,
    title: /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("svg", {
      width: "14",
      height: "14",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      style: {
        verticalAlign: -2,
        marginRight: 6
      }
    }, /*#__PURE__*/React.createElement("path", {
      d: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
    })), "\u041C\u0430\u0439\u0441\u0442\u0435\u0440\u043D\u044F \xB7 \u041F\u043E\u0442\u043E\u0447\u043D\u0438\u0439 \u0442\u0438\u0436\u0434\u0435\u043D\u044C"),
    subtitle: "\u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0456\u044F: \u0420\u0435\u043C\u043E\u043D\u0442"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(BigStat, {
    label: "\u0417 \u041F\u0414\u0412",
    value: fmt(ww.gross),
    accent: accent
  }), /*#__PURE__*/React.createElement(BigStat, {
    label: "\u0417\u0430\u043A\u0430\u0437\u0456\u0432",
    value: fmt(ww.docs)
  }))), /*#__PURE__*/React.createElement(CommentableCard, {
    id: "home-traffic",
    userEmail: userEmail,
    title: "\u0422\u0440\u0430\u0444\u0456\u043A \xB7 \u041E\u0441\u0442\u0430\u043D\u043D\u0456\u0439 \u0442\u0438\u0436\u0434\u0435\u043D\u044C",
    subtitle: wkRange
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(BigStat, {
    label: "\u041A\u043B\u0456\u0454\u043D\u0442\u0438",
    value: fmt(tw.visitors),
    accent: accent,
    hint: trend.deltaPct != null ? `${trend.deltaPct >= 0 ? '▲' : '▼'} ${Math.abs(trend.deltaPct).toFixed(0)}% vs минулий тиждень` : ''
  }), /*#__PURE__*/React.createElement(BigStat, {
    label: "\u041E\u043F\u0435\u0440\u0430\u0446\u0456\u0439",
    value: fmt(cw.docs)
  }))), sales.monthly.length > 0 && /*#__PURE__*/React.createElement(CommentableCard, {
    id: "home-monthly",
    userEmail: userEmail,
    title: "\u0414\u0438\u043D\u0430\u043C\u0456\u043A\u0430",
    subtitle: "\u041F\u0440\u043E\u0434\u0430\u0436\u0456 \u043F\u043E \u043C\u0456\u0441\u044F\u0446\u044F\u043C"
  }, /*#__PURE__*/React.createElement(BarsV, {
    data: sales.monthly,
    keys: ['total'],
    colors: [PALETTE.ink],
    labelKey: "month",
    h: 160,
    showY: true
  }))));
}

// ── Перемикач "Максимальний чек" ─────────────────────────
function MaxCheckSelector({
  current,
  onChange
}) {
  const opts = [{
    v: Infinity,
    label: 'Усі'
  }, {
    v: 5000,
    label: '< 5к'
  }, {
    v: 2000,
    label: '< 2к'
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      gap: 0,
      border: `1px solid ${PALETTE.rule}`,
      borderRadius: 999,
      padding: 2,
      background: PALETTE.paperSub
    }
  }, opts.map(o => {
    const active = current === o.v;
    return /*#__PURE__*/React.createElement("button", {
      key: String(o.v),
      onClick: () => onChange(o.v),
      title: o.v === Infinity ? 'Без фільтра по сумі чека' : `Виключити чеки ≥ ${o.v.toLocaleString('uk-UA')}`,
      style: {
        border: 'none',
        background: active ? PALETTE.ink : 'transparent',
        color: active ? PALETTE.paper : PALETTE.muted,
        fontFamily: SC_MONO,
        fontSize: 10,
        fontWeight: 500,
        padding: '4px 10px',
        borderRadius: 999,
        cursor: 'pointer',
        letterSpacing: '0.02em'
      }
    }, o.label);
  }));
}

// ── SALES ───────────────────────────────────────────────
function SalesScreen({
  data,
  accent,
  period,
  onPeriodChange,
  customRange,
  onCustomChange,
  maxCheck,
  onMaxCheckChange,
  userEmail,
  onExportPdf
}) {
  const s = data;
  const [catMode, setCatMode] = React.useState('pct'); // % за замовченням
  const [payMode, setPayMode] = React.useState('pct');
  const [dowMode, setDowMode] = React.useState('pct');
  const totalGross = s.categories.reduce((a, c) => a + c.value, 0) || 1;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 120
    }
  }, /*#__PURE__*/React.createElement(ScreenHeader, {
    title: "Sales",
    subtitle: `${s.count} операцій · фінансові звіти`
  }), /*#__PURE__*/React.createElement(Section, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8,
      alignItems: 'center',
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement(DateRangeInline, {
    range: s.range,
    customFrom: customRange?.from,
    customTo: customRange?.to,
    onCustomChange: onCustomChange,
    onActivate: () => onPeriodChange('custom'),
    isActive: period === 'custom'
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: 'auto',
      display: 'flex',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(ExportPdfButton, {
    onClick: onExportPdf
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement(PeriodSelector, {
    current: period === 'custom' ? 'all' : period,
    onChange: onPeriodChange
  }))), !s.count && /*#__PURE__*/React.createElement(Section, null, /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '8px 0 24px',
      padding: '40px 20px',
      textAlign: 'center',
      border: `1px dashed ${PALETTE.line}`,
      borderRadius: 12,
      background: '#fffbf0',
      fontFamily: SC_MONO,
      fontSize: 11,
      color: PALETTE.subtle,
      lineHeight: 1.6
    }
  }, "\u041D\u0435\u043C\u0430\u0454 \u0437\u0430\u043F\u0438\u0441\u0456\u0432 \u0437\u0430 \u043E\u0431\u0440\u0430\u043D\u0438\u0439 \u043F\u0435\u0440\u0456\u043E\u0434.", /*#__PURE__*/React.createElement("br", null), "\u0417\u043C\u0456\u043D\u0456\u0442\u044C \u0434\u0430\u0442\u0438 \u0430\u0431\u043E \u043E\u0431\u0435\u0440\u0456\u0442\u044C \u0456\u043D\u0448\u0438\u0439 \u043F\u0435\u0440\u0456\u043E\u0434.")), s.count > 0 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Section, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement(BigStat, {
    label: "\u0417 \u041F\u0414\u0412",
    value: fmt(s.totals.gross),
    accent: accent
  }), /*#__PURE__*/React.createElement(BigStat, {
    label: "\u041F\u0440\u0438\u0431\u0443\u0442\u043E\u043A",
    value: fmt(s.totals.profit),
    accent: accent
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement(BigStat, {
    label: "\u0421\u0435\u0440\u0435\u0434\u043D\u0456\u0439 \u0447\u0435\u043A",
    value: s.avgCheck ? fmt(Math.round(s.avgCheck)) : '—',
    hint: s.avgCheckDocs ? `${fmt(s.avgCheckDocs)} чеків${maxCheck !== Infinity ? ` · < ${maxCheck.toLocaleString('uk-UA')}` : ''}` : '',
    extra: onMaxCheckChange ? /*#__PURE__*/React.createElement(MaxCheckSelector, {
      current: maxCheck,
      onChange: onMaxCheckChange
    }) : null
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement(BigStat, {
    label: "\u0411\u0435\u0437 \u041F\u0414\u0412",
    value: fmt(s.totals.sale)
  }), /*#__PURE__*/React.createElement(BigStat, {
    label: "\u0417\u0430\u043A\u0443\u043F\u043A\u0430",
    value: fmt(s.totals.cost)
  }))), s.monthly.length > 1 && /*#__PURE__*/React.createElement(Section, null, /*#__PURE__*/React.createElement(CommentableCard, {
    id: "sales-monthly",
    userEmail: userEmail,
    title: "\u041F\u0440\u043E\u0434\u0430\u0436\u0456 \u043F\u043E \u043C\u0456\u0441\u044F\u0446\u044F\u043C",
    subtitle: `${s.monthly.length} міс · з ПДВ`
  }, /*#__PURE__*/React.createElement(BarsV, {
    data: s.monthly,
    keys: ['total'],
    colors: [PALETTE.ink],
    labelKey: "month",
    h: 180,
    showY: true
  }))), s.categories.length > 0 && /*#__PURE__*/React.createElement(Section, null, /*#__PURE__*/React.createElement(CommentableCard, {
    id: "sales-categories",
    userEmail: userEmail,
    title: "\u041F\u0440\u043E\u0434\u0430\u0436\u0456 \u043F\u043E \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0456\u044F\u043C",
    subtitle: catMode === 'uah' ? 'З ПДВ' : '% від загального обороту',
    right: /*#__PURE__*/React.createElement(ValueToggle, {
      options: [{
        id: 'pct',
        label: '%'
      }, {
        id: 'uah',
        label: '€'
      }],
      value: catMode,
      onChange: setCatMode
    })
  }, /*#__PURE__*/React.createElement(BarsH, {
    data: s.categories.slice(0, 12).map(c => ({
      name: c.name,
      value: catMode === 'pct' ? Math.round(c.value / totalGross * 1000) / 10 : Math.round(c.value)
    })),
    color: PALETTE.ink,
    showPct: catMode === 'pct'
  }))), s.weekByDay.length > 0 && /*#__PURE__*/React.createElement(Section, null, /*#__PURE__*/React.createElement(CommentableCard, {
    id: "sales-weekday",
    userEmail: userEmail,
    title: "\u041F\u043E \u0434\u043D\u044F\u0445 \u0442\u0438\u0436\u043D\u044F",
    subtitle: dowMode === 'pct' ? '% від обороту (без неділі, чеки ≤1000€)' : 'З ПДВ (без неділі, чеки ≤1000€)',
    right: /*#__PURE__*/React.createElement(ValueToggle, {
      options: [{
        id: 'pct',
        label: '%'
      }, {
        id: 'uah',
        label: '€'
      }],
      value: dowMode,
      onChange: setDowMode
    })
  }, /*#__PURE__*/React.createElement(BarsV, {
    data: s.weekByDay.map(d => ({
      day: d.day,
      v: dowMode === 'pct' ? d.pct : d.v
    })),
    keys: ['v'],
    colors: [accent],
    labelKey: "day",
    h: 160,
    showY: true,
    isPct: dowMode === 'pct'
  }))), s.timeline.length > 2 && /*#__PURE__*/React.createElement(Section, null, /*#__PURE__*/React.createElement(CommentableCard, {
    id: "sales-timeline",
    userEmail: userEmail,
    title: "\u0422\u0438\u0436\u043D\u0435\u0432\u0430 \u0434\u0438\u043D\u0430\u043C\u0456\u043A\u0430",
    subtitle: `${s.timeline.length} тижнів`
  }, /*#__PURE__*/React.createElement(AreaChart, {
    data: s.timeline,
    color: PALETTE.ink,
    h: 160,
    monthTicks: true,
    showY: true,
    showPeaks: true
  }))), s.topProducts.length > 0 && /*#__PURE__*/React.createElement(Section, null, /*#__PURE__*/React.createElement(CommentableCard, {
    id: "sales-top",
    userEmail: userEmail,
    title: "\u0422\u043E\u043F \u0442\u043E\u0432\u0430\u0440\u0456\u0432",
    subtitle: "\u0417\u0430 \u0432\u0438\u0440\u0443\u0447\u043A\u043E\u044E \u0437 \u041F\u0414\u0412, \u0442\u043E\u043F 10"
  }, /*#__PURE__*/React.createElement("div", null, s.topProducts.slice(0, 10).map((p, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'baseline',
      padding: '8px 0',
      borderBottom: i < 9 ? `1px solid ${PALETTE.line}` : 'none',
      fontFamily: SC_MONO
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 22,
      color: PALETTE.muted,
      fontSize: 10
    }
  }, String(i + 1).padStart(2, '0')), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      fontSize: 11,
      color: PALETTE.ink,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      paddingRight: 8
    }
  }, p.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: PALETTE.ink,
      fontWeight: 500
    }
  }, fmt(p.gross))))))), s.payments.length > 0 && /*#__PURE__*/React.createElement(Section, null, /*#__PURE__*/React.createElement(CommentableCard, {
    id: "sales-payments",
    userEmail: userEmail,
    title: "\u0421\u043F\u043E\u0441\u043E\u0431\u0438 \u043E\u043F\u043B\u0430\u0442\u0438",
    subtitle: payMode === 'pct' ? '% розподіл' : 'З ПДВ',
    right: /*#__PURE__*/React.createElement(ValueToggle, {
      options: [{
        id: 'pct',
        label: '%'
      }, {
        id: 'uah',
        label: '€'
      }],
      value: payMode,
      onChange: setPayMode
    })
  }, /*#__PURE__*/React.createElement(BarsH, {
    data: s.payments.map(p => ({
      name: p.name,
      value: payMode === 'pct' ? p.pct : p.v
    })),
    color: accent,
    showPct: payMode === 'pct'
  })))));
}

// ── TRAFFIC ────────────────────────────────────────────
function TrafficScreen({
  data,
  accent,
  period,
  onPeriodChange,
  customRange,
  onCustomChange,
  ratio,
  userEmail,
  onExportPdf
}) {
  const t = data;
  const [selectedDow, setSelectedDow] = React.useState('all'); // 'all' | 1..6
  const [hourMode, setHourMode] = React.useState('pct'); // 'pct' | 'count'
  const [weeklyRange, setWeeklyRange] = React.useState('4'); // '4','8','16','all'

  const dowOptions = [{
    id: 1,
    label: 'Пн'
  }, {
    id: 2,
    label: 'Вт'
  }, {
    id: 3,
    label: 'Ср'
  }, {
    id: 4,
    label: 'Чт'
  }, {
    id: 5,
    label: 'Пт'
  }, {
    id: 6,
    label: 'Сб'
  }, {
    id: 'all',
    label: 'Усе (пн-пт)'
  }];
  const hourlyData = (t.hourlyByDay?.[selectedDow] || []).map(x => ({
    month: String(x.h).padStart(2, '0'),
    v: hourMode === 'pct' ? x.pct || 0 : Math.round((x.avg || 0) * 10) / 10
  }));
  const weeklyCount = weeklyRange === 'all' ? t.weekly.length : parseInt(weeklyRange, 10);
  const weeklyData = t.weekly.slice(-weeklyCount);
  const trend = t.last7Trend || {
    deltaPct: null
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 120
    }
  }, /*#__PURE__*/React.createElement(ScreenHeader, {
    title: "Traffic",
    subtitle: "\u0421\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043A\u0430 \u0432\u0456\u0434\u0432\u0456\u0434\u0443\u0432\u0430\u043D\u043E\u0441\u0442\u0456"
  }), /*#__PURE__*/React.createElement(Section, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8,
      alignItems: 'center',
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement(DateRangeInline, {
    range: t.range,
    customFrom: customRange?.from,
    customTo: customRange?.to,
    onCustomChange: onCustomChange,
    onActivate: () => onPeriodChange('custom'),
    isActive: period === 'custom'
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: 'auto',
      display: 'flex',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(ExportPdfButton, {
    onClick: onExportPdf
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement(PeriodSelector, {
    current: period === 'custom' ? 'all' : period,
    onChange: onPeriodChange
  }))), !t.count && /*#__PURE__*/React.createElement(Section, null, /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '8px 0 24px',
      padding: '40px 20px',
      textAlign: 'center',
      border: `1px dashed ${PALETTE.line}`,
      borderRadius: 12,
      background: '#fffbf0',
      fontFamily: SC_MONO,
      fontSize: 11,
      color: PALETTE.subtle,
      lineHeight: 1.6
    }
  }, "\u041D\u0435\u043C\u0430\u0454 \u0437\u0430\u043F\u0438\u0441\u0456\u0432 \u0437\u0430 \u043E\u0431\u0440\u0430\u043D\u0438\u0439 \u043F\u0435\u0440\u0456\u043E\u0434.", /*#__PURE__*/React.createElement("br", null), "\u0417\u043C\u0456\u043D\u0456\u0442\u044C \u0434\u0430\u0442\u0438 \u0430\u0431\u043E \u043E\u0431\u0435\u0440\u0456\u0442\u044C \u0456\u043D\u0448\u0438\u0439 \u043F\u0435\u0440\u0456\u043E\u0434.")), t.count > 0 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Section, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement(BigStat, {
    label: "\u0423\u0441\u044C\u043E\u0433\u043E \u043A\u043B\u0456\u0454\u043D\u0442\u0456\u0432",
    value: fmt(t.totalVisitors),
    accent: accent,
    hint: t.currentWeek?.range ? `останній тижд: ${fmt(t.currentWeek.visitors)}` : ''
  }), /*#__PURE__*/React.createElement(BigStat, {
    label: "\u041F\u0456\u043A \u0433\u043E\u0434\u0438\u043D\u0438",
    value: t.peakHour != null ? String(t.peakHour).padStart(2, '0') + ':00' : '—',
    hint: t.peakHourVisits ? `~${t.peakHourVisits} клієнтів (в середньому)` : 'в середньому за період'
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement(BigStat, {
    label: "\u0421\u0435\u0440\u0435\u0434\u043D\u044F \u0442\u0440\u0438\u0432\u0430\u043B\u0456\u0441\u0442\u044C",
    value: t.avgDuration ? t.avgDuration.toFixed(1) : '—',
    hint: t.avgDuration ? 'хвилин' : ''
  }), ratio && ratio.totalVisits > 0 ? /*#__PURE__*/React.createElement(BigStat, {
    label: "\u041A\u043E\u0435\u0444\u0456\u0446\u0456\u0454\u043D\u0442",
    value: ratio.ratio ? ratio.ratio.toFixed(1) : '—',
    hint: "\u043A\u043B\u0456\u0454\u043D\u0442\u0456\u0432 \u043D\u0430 1 \u0447\u0435\u043A"
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }))), t.monthlyAllTime.length > 0 && /*#__PURE__*/React.createElement(Section, null, /*#__PURE__*/React.createElement(CommentableCard, {
    id: "traffic-monthly",
    userEmail: userEmail,
    title: "\u0412\u0456\u0434\u0432\u0456\u0434\u0443\u0432\u0430\u043D\u0456\u0441\u0442\u044C \u043F\u043E \u043C\u0456\u0441\u044F\u0446\u044F\u043C",
    subtitle: "\u043B\u044E\u0434\u0435\u0439, \u0437\u0430 \u0432\u0435\u0441\u044C \u0447\u0430\u0441"
  }, /*#__PURE__*/React.createElement(BarsV, {
    data: t.monthlyAllTime,
    keys: ['v'],
    colors: [PALETTE.ink],
    labelKey: "month",
    h: 180,
    showY: true
  }))), t.last7Days.length > 0 && /*#__PURE__*/React.createElement(Section, null, /*#__PURE__*/React.createElement(CommentableCard, {
    id: "traffic-last7",
    userEmail: userEmail,
    title: "\u0412\u0456\u0434\u0432\u0456\u0434\u0443\u0432\u0430\u043D\u0456\u0441\u0442\u044C \xB7 \u041E\u0441\u0442\u0430\u043D\u043D\u0456 7 \u0434\u043D\u0456\u0432",
    subtitle: trend.deltaPct != null ? `${trend.deltaPct >= 0 ? '▲' : '▼'} ${Math.abs(trend.deltaPct).toFixed(0)}% vs попередній тиждень` : 'за останні 7 днів'
  }, /*#__PURE__*/React.createElement(BarsV, {
    data: t.last7Days,
    keys: ['v'],
    colors: [accent],
    labelKey: "day",
    h: 160,
    showY: true
  }))), ratio && ratio.totalReceipts > 0 && /*#__PURE__*/React.createElement(Section, null, /*#__PURE__*/React.createElement(CommentableCard, {
    id: "traffic-ratio",
    userEmail: userEmail,
    title: "\u041A\u043E\u0435\u0444\u0456\u0446\u0456\u0454\u043D\u0442",
    subtitle: "\u043A\u043B\u0456\u0454\u043D\u0442\u0456\u0432 \u043D\u0430 1 \u0447\u0435\u043A (\u0437\u0430 \u0443\u0432\u0435\u0441\u044C \u043F\u0435\u0440\u0456\u043E\u0434)"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: SC_MONO,
      fontSize: 42,
      lineHeight: 1,
      color: PALETTE.ink,
      fontWeight: 600
    }
  }, ratio.ratio.toFixed(1)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: SC_MONO,
      fontSize: 10,
      color: PALETTE.muted,
      marginTop: 8,
      letterSpacing: 0.5
    }
  }, fmt(ratio.totalVisits), " \u0432\u0456\u0434\u0432\u0456\u0434\u0443\u0432\u0430\u0447\u0456\u0432 \xB7 ", fmt(ratio.totalReceipts), " \u0447\u0435\u043A\u0456\u0432")))), t.weekday.some(d => d.v > 0) && /*#__PURE__*/React.createElement(Section, null, /*#__PURE__*/React.createElement(CommentableCard, {
    id: "traffic-weekday",
    userEmail: userEmail,
    title: "\u041F\u043E \u0434\u043D\u044F\u0445 \u0442\u0438\u0436\u043D\u044F",
    subtitle: "\u043A\u043B\u0456\u0454\u043D\u0442\u0456\u0432 \u0443\u0441\u044C\u043E\u0433\u043E"
  }, /*#__PURE__*/React.createElement(BarsV, {
    data: t.weekday.filter(d => d.v > 0),
    keys: ['v'],
    colors: [accent],
    labelKey: "day",
    h: 160,
    showY: true
  }))), /*#__PURE__*/React.createElement(Section, null, /*#__PURE__*/React.createElement(CommentableCard, {
    id: "traffic-hourly",
    userEmail: userEmail,
    title: "\u0412 \u0441\u0435\u0440\u0435\u0434\u043D\u044C\u043E\u043C\u0443 \u043F\u043E \u0433\u043E\u0434\u0438\u043D\u0430\u0445",
    subtitle: `${selectedDow === 'all' ? 'пн-пт' : WEEK_UA_FULL[selectedDow]} · ${hourMode === 'pct' ? '% клієнтів' : 'клієнтів на день'} по годинах`
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 12,
      overflowX: 'auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4,
      minWidth: 'max-content'
    }
  }, dowOptions.map(o => {
    const active = selectedDow == o.id;
    return /*#__PURE__*/React.createElement("button", {
      key: o.id,
      onClick: () => setSelectedDow(o.id),
      style: {
        padding: '5px 10px',
        borderRadius: 100,
        whiteSpace: 'nowrap',
        background: active ? PALETTE.ink : 'transparent',
        border: `1px solid ${active ? PALETTE.ink : PALETTE.line}`,
        color: active ? '#f1ead8' : PALETTE.ink,
        fontFamily: SC_MONO,
        fontSize: 9,
        letterSpacing: 0.6,
        textTransform: 'uppercase',
        cursor: 'pointer'
      }
    }, o.label);
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      gap: 0,
      border: `1px solid ${PALETTE.rule}`,
      borderRadius: 999,
      padding: 2,
      background: PALETTE.paperSub
    }
  }, [{
    v: 'pct',
    l: '%'
  }, {
    v: 'count',
    l: 'клієнтів'
  }].map(o => {
    const active = hourMode === o.v;
    return /*#__PURE__*/React.createElement("button", {
      key: o.v,
      onClick: () => setHourMode(o.v),
      style: {
        border: 'none',
        background: active ? PALETTE.ink : 'transparent',
        color: active ? PALETTE.paper : PALETTE.muted,
        fontFamily: SC_MONO,
        fontSize: 10,
        fontWeight: 500,
        padding: '4px 12px',
        borderRadius: 999,
        cursor: 'pointer',
        letterSpacing: '0.02em'
      }
    }, o.l);
  }))), /*#__PURE__*/React.createElement(BarsV, {
    data: hourlyData,
    keys: ['v'],
    colors: [PALETTE.ink],
    labelKey: "month",
    h: 160,
    showY: true,
    isPct: hourMode === 'pct'
  }))), t.ageGroupsAllTime.length > 0 && /*#__PURE__*/React.createElement(Section, null, /*#__PURE__*/React.createElement(CommentableCard, {
    id: "traffic-age",
    userEmail: userEmail,
    title: "\u041F\u043E \u0432\u0456\u043A\u0443",
    subtitle: "% \u0437\u0430 \u0432\u0435\u0441\u044C \u043F\u0435\u0440\u0456\u043E\u0434"
  }, /*#__PURE__*/React.createElement(BarsH, {
    data: t.ageGroupsAllTime.map(a => ({
      name: a.name,
      value: a.pct
    })),
    color: PALETTE.olive,
    showPct: true
  }))), t.genderAllTime.length > 0 && /*#__PURE__*/React.createElement(Section, null, /*#__PURE__*/React.createElement(CommentableCard, {
    id: "traffic-gender",
    userEmail: userEmail,
    title: "\u041F\u043E \u0441\u0442\u0430\u0442\u0456",
    subtitle: "% \u0437\u0430 \u0432\u0435\u0441\u044C \u043F\u0435\u0440\u0456\u043E\u0434 (\u0431\u0435\u0437 \xAB\u043D\u0435\u0432\u0456\u0434\u043E\u043C\u043E\xBB)"
  }, /*#__PURE__*/React.createElement(BarsH, {
    data: t.genderAllTime.map(g => ({
      name: g.name,
      value: g.pct
    })),
    color: accent,
    showPct: true
  }))), t.weekly.length > 1 && /*#__PURE__*/React.createElement(Section, null, /*#__PURE__*/React.createElement(CommentableCard, {
    id: "traffic-weekly",
    userEmail: userEmail,
    title: "\u0412\u0456\u0434\u0432\u0456\u0434\u0443\u0432\u0430\u043D\u0456\u0441\u0442\u044C \u043F\u043E \u0442\u0438\u0436\u043D\u044F\u0445",
    subtitle: "\u043A\u043B\u0456\u0454\u043D\u0442\u0456\u0432",
    right: /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 2,
        background: '#ede5d0',
        padding: 2,
        borderRadius: 8
      }
    }, [['4', '4т'], ['8', '8т'], ['16', '16т'], ['all', 'Все']].map(([id, label]) => {
      const active = weeklyRange === id;
      return /*#__PURE__*/React.createElement("button", {
        key: id,
        onClick: () => setWeeklyRange(id),
        style: {
          padding: '4px 8px',
          borderRadius: 6,
          background: active ? '#fffbf0' : 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontFamily: SC_MONO,
          fontSize: 9,
          letterSpacing: 0.6,
          color: active ? PALETTE.ink : PALETTE.muted
        }
      }, label);
    }))
  }, /*#__PURE__*/React.createElement(AreaChart, {
    data: weeklyData,
    color: PALETTE.ink,
    h: 180,
    monthTicks: true,
    showY: true,
    showPeaks: true
  })))));
}
function EmptyState({
  msg
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '60px 20px',
      textAlign: 'center',
      fontFamily: SC_MONO,
      color: PALETTE.muted,
      fontSize: 12
    }
  }, msg);
}

// ── INFO ──────────────────────────────
function CopyButton({
  text
}) {
  const [copied, setCopied] = React.useState(false);
  const click = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    }
  };
  return /*#__PURE__*/React.createElement("button", {
    onClick: click,
    style: {
      background: copied ? PALETTE.ink : 'transparent',
      color: copied ? '#f1ead8' : PALETTE.ink,
      border: `1px solid ${copied ? PALETTE.ink : PALETTE.line}`,
      borderRadius: 6,
      padding: '4px 10px',
      fontFamily: SC_MONO,
      fontSize: 9,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      cursor: 'pointer',
      flexShrink: 0
    }
  }, copied ? '✓ COPIED' : 'COPY');
}
function InfoRow({
  label,
  value,
  copyText
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 10,
      padding: '12px 14px',
      borderBottom: `1px solid ${PALETTE.line}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: SC_MONO,
      fontSize: 9,
      letterSpacing: 1,
      textTransform: 'uppercase',
      color: PALETTE.muted,
      marginBottom: 4
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: SC_MONO,
      fontSize: 11,
      color: PALETTE.ink,
      lineHeight: 1.5,
      wordBreak: 'break-word'
    }
  }, value)), copyText && /*#__PURE__*/React.createElement(CopyButton, {
    text: copyText
  }));
}
function InfoCard({
  title,
  children,
  copyAllText
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fffbf0',
      border: `1px solid ${PALETTE.line}`,
      borderRadius: 12,
      marginBottom: 14,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 14px',
      background: '#f5ecd2'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: SC_MONO,
      fontSize: 10,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      color: PALETTE.ink,
      fontWeight: 600
    }
  }, title), copyAllText && /*#__PURE__*/React.createElement(CopyButton, {
    text: copyAllText
  })), /*#__PURE__*/React.createElement("div", null, children));
}
function InfoScreen() {
  const companyFull = 'KATAFOT S.L.\nBizkaia Kalea 63, 20800 Zarautz, Spain\nNIF: B56990062\nVAT: ESB56990062';
  const ibanValue = 'ES12 0049 5287 7123 1636 9268';
  const shippingFull = 'KATAFOT SL (Adicto.Bike)\nCapusceac Vasile\nBizkaia Kalea 63, 20800, Zarautz, Gipuzkoa, Spain\n+34 674 262 622\nhello@adicto.bike';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 120
    }
  }, /*#__PURE__*/React.createElement(ScreenHeader, {
    title: "Info",
    subtitle: "Company details"
  }), /*#__PURE__*/React.createElement(Section, null, /*#__PURE__*/React.createElement(InfoCard, {
    title: "Company",
    copyAllText: companyFull
  }, /*#__PURE__*/React.createElement(InfoRow, {
    label: "Legal name",
    value: "KATAFOT S.L."
  }), /*#__PURE__*/React.createElement(InfoRow, {
    label: "Address",
    value: "Bizkaia Kalea 63, 20800 Zarautz, Spain"
  }), /*#__PURE__*/React.createElement(InfoRow, {
    label: "NIF (CIF)",
    value: "B56990062"
  }), /*#__PURE__*/React.createElement(InfoRow, {
    label: "VAT",
    value: "ESB56990062",
    copyText: "ESB56990062"
  })), /*#__PURE__*/React.createElement(InfoCard, {
    title: "Bank \u2014 Banco Santander"
  }, /*#__PURE__*/React.createElement(InfoRow, {
    label: "IBAN",
    value: ibanValue,
    copyText: ibanValue
  }), /*#__PURE__*/React.createElement(InfoRow, {
    label: "SWIFT",
    value: "BSCHESMM",
    copyText: "BSCHESMM"
  })), /*#__PURE__*/React.createElement(InfoCard, {
    title: "Shipping address",
    copyAllText: shippingFull
  }, /*#__PURE__*/React.createElement(InfoRow, {
    label: "Recipient",
    value: "KATAFOT SL (Adicto.Bike)"
  }), /*#__PURE__*/React.createElement(InfoRow, {
    label: "Contact",
    value: "Capusceac Vasile"
  }), /*#__PURE__*/React.createElement(InfoRow, {
    label: "Address",
    value: "Bizkaia Kalea 63, 20800, Zarautz, Gipuzkoa, Spain"
  }), /*#__PURE__*/React.createElement(InfoRow, {
    label: "Phone",
    value: "+34 674 262 622",
    copyText: "+34674262622"
  }), /*#__PURE__*/React.createElement(InfoRow, {
    label: "Email",
    value: "hello@adicto.bike",
    copyText: "hello@adicto.bike"
  }))));
}

// ── MORE ─────────────────
function MoreScreen({
  userEmail,
  onLogout
}) {
  const {
    NotesSection,
    FilesSection,
    SubscriptionsSection
  } = window.MORE_EXTRAS || {};
  return /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 120
    }
  }, /*#__PURE__*/React.createElement(ScreenHeader, {
    title: "More",
    subtitle: "\u041D\u043E\u0442\u0430\u0442\u043A\u0438, \u0444\u0430\u0439\u043B\u0438 \u0442\u0430 \u043F\u0456\u0434\u043F\u0438\u0441\u043A\u0438"
  }), /*#__PURE__*/React.createElement(Section, null, NotesSection && /*#__PURE__*/React.createElement(NotesSection, {
    userEmail: userEmail
  }), FilesSection && /*#__PURE__*/React.createElement(FilesSection, {
    userEmail: userEmail
  }), SubscriptionsSection && /*#__PURE__*/React.createElement(SubscriptionsSection, {
    userEmail: userEmail
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14,
      background: '#fffbf0',
      border: `1px solid ${PALETTE.line}`,
      borderRadius: 12,
      padding: '12px 14px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: SC_MONO,
      fontSize: 9,
      letterSpacing: 1,
      textTransform: 'uppercase',
      color: PALETTE.muted
    }
  }, "\u041A\u043E\u0440\u0438\u0441\u0442\u0443\u0432\u0430\u0447"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: SC_MONO,
      fontSize: 11,
      color: PALETTE.ink,
      marginTop: 2
    }
  }, userEmail || '—')), /*#__PURE__*/React.createElement("button", {
    onClick: onLogout,
    style: {
      background: 'transparent',
      border: `1px solid ${PALETTE.line}`,
      borderRadius: 8,
      padding: '8px 14px',
      cursor: 'pointer',
      fontFamily: SC_MONO,
      fontSize: 9.5,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      color: PALETTE.ink
    }
  }, "\u21A4 \u0412\u0438\u0439\u0442\u0438"))));
}
function updatedLabel(iso, source) {
  if (!iso) return source === 'cache' ? 'Кеш (офлайн)' : '—';
  const d = new Date(iso);
  const pad = n => String(n).padStart(2, '0');
  const src = source === 'cache' ? ' · кеш' : '';
  return `Оновлено ${pad(d.getHours())}:${pad(d.getMinutes())} ${pad(d.getDate())}.${pad(d.getMonth() + 1)}${src}`;
}
function LastUpdatedFooter({
  updated,
  source,
  savedAt,
  onRefresh,
  loading
}) {
  const relAgo = iso => {
    if (!iso) return null;
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'щойно';
    if (mins < 60) return `${mins} хв тому`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} год тому`;
    const days = Math.floor(hrs / 24);
    return `${days} дн тому`;
  };
  const ago = relAgo(updated || savedAt);
  const dotColor = source === 'live' ? '#7aa875' : source === 'cache' ? '#c4a04e' : PALETTE.muted;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px 16px 8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      fontFamily: SC_MONO,
      fontSize: 9,
      letterSpacing: 1,
      textTransform: 'uppercase',
      color: PALETTE.muted
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 5,
      height: 5,
      borderRadius: 3,
      background: dotColor
    }
  }), /*#__PURE__*/React.createElement("span", null, source === 'cache' ? 'Кеш · ' : '', ago || '—'), /*#__PURE__*/React.createElement("span", {
    style: {
      color: PALETTE.line
    }
  }, "/"), /*#__PURE__*/React.createElement("button", {
    onClick: onRefresh,
    disabled: loading,
    style: {
      background: 'none',
      border: 'none',
      padding: 0,
      cursor: loading ? 'default' : 'pointer',
      fontFamily: SC_MONO,
      fontSize: 9,
      letterSpacing: 1,
      textTransform: 'uppercase',
      color: loading ? PALETTE.muted : PALETTE.ink,
      opacity: loading ? 0.4 : 1,
      textDecoration: 'underline',
      textUnderlineOffset: 3
    }
  }, loading ? 'Оновлення…' : 'Оновити'));
}
window.SCREENS = {
  SalesScreen,
  TrafficScreen,
  HomeScreen,
  InfoScreen,
  MoreScreen,
  EmptyState,
  ScreenHeader,
  LastUpdatedFooter,
  PeriodSelector,
  AdictoLogo
};
})();
;(function(){
// LoginGate — простий email+пароль gate.
// Credentials хардкодом (немає сервера). Для 2 користувачів цього достатньо.
// Зберігає сесію в localStorage після успішного входу.

const CREDENTIALS = [{
  email: 'vasile@adicto.bike',
  password: 'Scalpel2012!'
}, {
  email: 'maximiva@gmail.com',
  password: 'Tornado80!'
}, {
  email: 'olegivanov578@gmail.com',
  password: 'Tornado80!'
}];
const SESSION_KEY = 'adicto.session.v1';
const SESSION_MAX_AGE_DAYS = 365;
function checkSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    const ageDays = (Date.now() - s.loggedAt) / (1000 * 60 * 60 * 24);
    if (ageDays > SESSION_MAX_AGE_DAYS) return null;
    if (!CREDENTIALS.find(c => c.email === s.email)) return null; // email більше не існує
    // Rolling session: оновлюємо loggedAt при кожному заході — сесія живе вічно
    // поки користувач заходить раз на рік.
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify({
        email: s.email,
        loggedAt: Date.now()
      }));
    } catch {}
    return s;
  } catch {
    return null;
  }
}
function setSession(email) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({
    email,
    loggedAt: Date.now()
  }));
}
function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}
function LoginScreen({
  onLogin
}) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState(null);
  const PALETTE = window.CHARTS.PALETTE;
  const MONO = '"JetBrains Mono", ui-monospace, monospace';
  const submit = e => {
    e.preventDefault();
    const em = email.trim().toLowerCase();
    const match = CREDENTIALS.find(c => c.email.toLowerCase() === em && c.password === password);
    if (!match) {
      setError('Невірний email або пароль');
      return;
    }
    setSession(match.email);
    onLogin(match.email);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      fontFamily: MONO
    }
  }, /*#__PURE__*/React.createElement("form", {
    onSubmit: submit,
    style: {
      width: '100%',
      maxWidth: 320,
      background: '#fffbf0',
      border: `1px solid ${PALETTE.line}`,
      borderRadius: 16,
      padding: 28
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 9.5,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      color: PALETTE.muted,
      marginBottom: 6
    }
  }, "ADICTO.BIKE"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 24,
      letterSpacing: -0.6,
      lineHeight: 1,
      textTransform: 'uppercase',
      color: PALETTE.ink,
      fontWeight: 600,
      marginBottom: 22
    }
  }, "REPORTS"), /*#__PURE__*/React.createElement(Label, null, "Email"), /*#__PURE__*/React.createElement(Field, {
    value: email,
    onChange: setEmail,
    type: "email",
    autoFocus: true,
    placeholder: "name@adicto.bike"
  }), /*#__PURE__*/React.createElement(Label, null, "Password"), /*#__PURE__*/React.createElement(Field, {
    value: password,
    onChange: setPassword,
    type: "password",
    placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
  }), error && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: '#c47862',
      letterSpacing: 0.4,
      marginTop: 10,
      padding: '8px 10px',
      background: '#fdf0eb',
      borderRadius: 8
    }
  }, "\u26A0 ", error), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    style: {
      width: '100%',
      marginTop: 18,
      padding: '12px 16px',
      background: PALETTE.ink,
      color: '#f1ead8',
      border: 'none',
      borderRadius: 10,
      cursor: 'pointer',
      fontFamily: MONO,
      fontSize: 11,
      letterSpacing: 1.4,
      textTransform: 'uppercase',
      fontWeight: 500
    }
  }, "\u0423\u0432\u0456\u0439\u0442\u0438"), /*#__PURE__*/React.createElement("a", {
    href: "mailto:vasile@adicto.bike?subject=Reports%20%E2%80%94%20%D0%B2%D1%96%D0%B4%D0%BD%D0%BE%D0%B2%D0%B8%D1%82%D0%B8%20%D0%BF%D0%B0%D1%80%D0%BE%D0%BB%D1%8C&body=%D0%9F%D1%80%D0%BE%D1%88%D1%83%20%D0%B2%D1%96%D0%B4%D0%BD%D0%BE%D0%B2%D0%B8%D1%82%D0%B8%20%D0%BF%D0%B0%D1%80%D0%BE%D0%BB%D1%8C%20%D0%B4%D0%BB%D1%8F%3A%20",
    style: {
      display: 'block',
      textAlign: 'center',
      marginTop: 14,
      fontSize: 10,
      letterSpacing: 0.6,
      color: PALETTE.subtle,
      textDecoration: 'underline',
      textUnderlineOffset: 3
    }
  }, "\u0417\u0430\u0431\u0443\u0432 \u043F\u0430\u0440\u043E\u043B\u044C"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      fontSize: 9,
      color: PALETTE.muted,
      letterSpacing: 0.4,
      textAlign: 'center',
      lineHeight: 1.5
    }
  }, "\u0421\u0435\u0441\u0456\u044F \u0437\u0431\u0435\u0440\u0456\u0433\u0430\u0454\u0442\u044C\u0441\u044F \u043D\u0430 \u0446\u044C\u043E\u043C\u0443 \u043F\u0440\u0438\u0441\u0442\u0440\u043E\u0457 \u2014", /*#__PURE__*/React.createElement("br", null), "\u043D\u0435 \u043F\u043E\u0442\u0440\u0456\u0431\u043D\u043E \u0437\u0430\u0445\u043E\u0434\u0438\u0442\u0438 \u043F\u043E\u0432\u0442\u043E\u0440\u043D\u043E.")));
}
function Label({
  children
}) {
  const PALETTE = window.CHARTS.PALETTE;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 9,
      letterSpacing: 1,
      textTransform: 'uppercase',
      color: PALETTE.muted,
      marginTop: 14,
      marginBottom: 6
    }
  }, children);
}
function Field({
  value,
  onChange,
  type,
  autoFocus,
  placeholder
}) {
  const PALETTE = window.CHARTS.PALETTE;
  const MONO = '"JetBrains Mono", ui-monospace, monospace';
  return /*#__PURE__*/React.createElement("input", {
    type: type,
    value: value,
    onChange: e => onChange(e.target.value),
    autoFocus: autoFocus,
    placeholder: placeholder,
    autoComplete: type === 'password' ? 'current-password' : 'email',
    style: {
      width: '100%',
      padding: '10px 12px',
      background: '#f1ead8',
      border: `1px solid ${PALETTE.line}`,
      borderRadius: 8,
      fontFamily: MONO,
      fontSize: 13,
      color: PALETTE.ink,
      outline: 'none',
      boxSizing: 'border-box'
    }
  });
}
window.AUTH = {
  LoginScreen,
  checkSession,
  clearSession,
  CREDENTIALS
};
})();
;(function(){
// ── Live AI: голосові аудіо-звіти ──
// Текст генерується через Gemini 2.5 Pro (проксі Apps Script, GEMINI_API_KEY)
// Озвучка — через проксі Apps Script (ELEVENLABS_API_KEY)
// Стиль: фірмові ADICTO-кольори (paper/ink, JetBrains Mono)

const ELEVEN_MODEL = 'eleven_multilingual_v2';
const VOICES = [{
  id: 'iP95p4xoKVk53GoZ742B',
  name: 'Chris',
  desc: 'чол., розповідач'
}, {
  id: 'XrExE9yKIg1WjnnlVkGX',
  name: 'Matilda',
  desc: 'жін., тепла'
}, {
  id: 'cgSgspJ2msm6clMCkdW9',
  name: 'Jessica',
  desc: 'жін., впевнена'
}, {
  id: 'N2lVS1w4EtoT3dr4eOWO',
  name: 'Callum',
  desc: 'чол., спокійний'
}, {
  id: 'JBFqnCBsd6RMkjVDRZzb',
  name: 'George',
  desc: 'чол., подкастер'
}];
const {
  PALETTE: LA_P
} = window.CHARTS;
const LA_MONO = '"JetBrains Mono", ui-monospace, monospace';

// ── утиліти ──
function fmtTime(s) {
  if (!isFinite(s)) return '0:00';
  const m = Math.floor(s / 60),
    ss = Math.floor(s % 60).toString().padStart(2, '0');
  return `${m}:${ss}`;
}

// base64 → Blob URL
function b64ToBlobUrl(b64, mime) {
  const bin = atob(b64);
  const len = bin.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i);
  return URL.createObjectURL(new Blob([bytes], {
    type: mime || 'audio/mpeg'
  }));
}
async function fetchTTS(text, voiceId) {
  const apiUrl = window.ADICTO_CONFIG?.apiUrl;
  if (!apiUrl) throw new Error('ADICTO_CONFIG.apiUrl не налаштовано');
  const res = await fetch(apiUrl, {
    method: 'POST',
    // text/plain щоб уникнути CORS-preflight на Apps Script
    headers: {
      'Content-Type': 'text/plain;charset=utf-8'
    },
    body: JSON.stringify({
      action: 'ttsProxy',
      payload: {
        text,
        voiceId,
        modelId: ELEVEN_MODEL
      }
    })
  });
  if (!res.ok) throw new Error('Proxy ' + res.status);
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || 'TTS proxy error');
  return b64ToBlobUrl(data.audioBase64, data.mime);
}

// ── Іконка Waveform для кнопки ──
function LiveAIIcon({
  size = 14,
  color = 'currentColor'
}) {
  return /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: "2.2",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3 12h2M7 8v8M11 5v14M15 9v6M19 11v2M21 12h0"
  }));
}

// ── Sparkle-ромб (Gemini-style) ──
function LiveAISparkle({
  size = 14,
  gradient = true
}) {
  const gid = React.useId ? React.useId() : 'lai-sp-' + Math.random().toString(36).slice(2, 7);
  return /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 24 24"
  }, gradient && /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
    id: gid,
    x1: "0",
    y1: "0",
    x2: "1",
    y2: "1"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: "#ea4a4a"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "33%",
    stopColor: "#f5b738"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "66%",
    stopColor: "#3b82f6"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: "#22c55e"
  }))), /*#__PURE__*/React.createElement("path", {
    d: "M12 2 C 12 8, 16 12, 22 12 C 16 12, 12 16, 12 22 C 12 16, 8 12, 2 12 C 8 12, 12 8, 12 2 Z",
    fill: gradient ? `url(#${gid})` : 'currentColor'
  }));
}

// ── Кнопка Live AI (біля Export PDF) з переливом ──
function LiveAIButton({
  onClick
}) {
  // Унікальний клас — щоб keyframes не конфліктували при повторних монтажах
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("style", null, `
        @keyframes laiShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        @keyframes laiSparkle { 0%,100% { transform: rotate(0deg) scale(1); } 50% { transform: rotate(180deg) scale(1.15); } }
        .lai-btn {
          position: relative;
          display: inline-flex; align-items: center; gap: 6px;
          padding: 7px 12px 7px 10px; border-radius: 100px;
          background: #fffbf0;
          border: 1.5px solid transparent;
          background-image:
            linear-gradient(#fffbf0, #fffbf0),
            linear-gradient(110deg, #ea4a4a 0%, #f5b738 25%, #22c55e 50%, #3b82f6 75%, #a855f7 100%);
          background-origin: border-box;
          background-clip: padding-box, border-box;
          background-size: 100% 100%, 300% 100%;
          animation: laiShift 6s ease-in-out infinite;
          font-family: ${LA_MONO};
          font-size: 9.5px; letter-spacing: 0.8px;
          text-transform: uppercase; font-weight: 600;
          cursor: pointer;
        }
        .lai-btn-label {
          background: linear-gradient(110deg, #ea4a4a 0%, #f5b738 25%, #22c55e 50%, #3b82f6 75%, #a855f7 100%);
          background-size: 300% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: laiShift 6s ease-in-out infinite;
        }
        .lai-btn svg { animation: laiSparkle 4s ease-in-out infinite; transform-origin: center; }
        .lai-btn:hover { filter: brightness(1.05); }
        .lai-btn:active { transform: scale(0.97); }
      `), /*#__PURE__*/React.createElement("button", {
    className: "lai-btn",
    onClick: onClick
  }, /*#__PURE__*/React.createElement(LiveAISparkle, {
    size: 13
  }), /*#__PURE__*/React.createElement("span", {
    className: "lai-btn-label"
  }, "Live AI")));
}

// ── Побудова короткого data-summary для промпту Claude ──
function buildDataSummary(sales, traffic, context) {
  const s = sales || {};
  const t = traffic || {};
  const lines = [];
  lines.push(`Контекст: ${context}`);
  lines.push('');
  if (s.count) {
    lines.push(`ПРОДАЖІ:`);
    lines.push(`- Усього операцій: ${s.count}`);
    if (s.range) lines.push(`- Період: ${s.range.from} — ${s.range.to}`);
    lines.push(`- Валова виручка (з ПДВ): ${Math.round(s.totalWithVat || s.totalGross || 0)} €`);
    if (s.totalProfit != null) lines.push(`- Прибуток: ${Math.round(s.totalProfit)} €`);
    lines.push(`- Середній чек: ${Math.round(s.avgCheck || 0)} € (${s.avgCheckDocs || 0} чеків)`);
    if (s.currentWeek) {
      const cw = s.currentWeek;
      lines.push(`- Поточний тиждень: ${Math.round(cw.gross)} €, ${cw.docs} чеків, середній чек ${Math.round(cw.avgCheck)} €`);
    }
    if (s.monthly && s.monthly.length >= 2) {
      const last = s.monthly[s.monthly.length - 1];
      const prev = s.monthly[s.monthly.length - 2];
      lines.push(`- Останній місяць vs попередній: ${Math.round(last.v)} € vs ${Math.round(prev.v)} € (${prev.v ? Math.round((last.v - prev.v) / prev.v * 100) : 0}%)`);
    }
    if (s.categories && s.categories.length) {
      const top3 = s.categories.slice(0, 3).map(c => `${c.label} (${Math.round(c.value)}€)`).join(', ');
      lines.push(`- Топ категорій: ${top3}`);
    }
    if (s.workshopWeek) {
      lines.push(`- Майстерня за тиждень: ${Math.round(s.workshopWeek.gross)} €, ${s.workshopWeek.count} операцій`);
    }
    lines.push('');
  }
  if (t.count) {
    lines.push(`ТРАФІК:`);
    lines.push(`- Усього клієнтів: ${t.count}`);
    if (t.range) lines.push(`- Період: ${t.range.from} — ${t.range.to}`);
    if (t.avgDuration) lines.push(`- Середня тривалість візиту: ${Math.round(t.avgDuration)} хв`);
    if (t.weekly && t.weekly.length >= 2) {
      const last = t.weekly[t.weekly.length - 1];
      const prev = t.weekly[t.weekly.length - 2];
      lines.push(`- Останній тиждень: ${last.v} клієнтів vs ${prev.v} минулого (${prev.v ? Math.round((last.v - prev.v) / prev.v * 100) : 0}%)`);
    }
    if (t.hourlyByDay && t.hourlyByDay.all) {
      const peak = [...t.hourlyByDay.all].sort((a, b) => b.pct - a.pct)[0];
      if (peak) lines.push(`- Пікова година (усереднено пн-пт): ${peak.h}:00 (${peak.pct}% трафіку)`);
    }
    lines.push('');
  }
  if (context?.ratio) lines.push(`Коефіцієнт покупка/клієнт: ${(context.ratio * 100).toFixed(1)}%`);
  return lines.join('\n');
}

// ── Генерація тексту звіту через Gemini (проксі Apps Script) ──
async function aiReportProxy(payload) {
  const apiUrl = window.ADICTO_CONFIG?.apiUrl;
  if (!apiUrl) throw new Error('ADICTO_CONFIG.apiUrl не налаштовано');
  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action: 'aiReport', payload })
  });
  if (!res.ok) throw new Error('Proxy ' + res.status);
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || 'AI proxy error');
  return data.text;
}
async function generateReportText({
  depth,
  topics,
  dataSummary,
  compareWeeks,
  screenName,
  period
}) {
  const topicList = [];
  if (topics.sales) topicList.push('продажі');
  if (topics.traffic) topicList.push('трафік');
  if (topics.advice) topicList.push('поради');
  const depthMap = { short: 'brief', medium: 'medium', long: 'detailed' };
  return await aiReportProxy({
    screen: screenName || 'Огляд',
    period: period || '',
    topics: topicList,
    depth: depthMap[depth] || 'medium',
    tone: 'neutral',
    data: { summary: dataSummary, compareWeeks }
  });
}

// ── Модал Live AI ──
function LiveAIModal({
  open,
  onClose,
  sales,
  traffic,
  ratio,
  period,
  screenName
}) {
  const [topics, setTopics] = React.useState({
    sales: true,
    traffic: true,
    advice: false
  });
  const [depth, setDepth] = React.useState('medium');
  const [rate, setRate] = React.useState(1.0);
  const [voiceId, setVoiceId] = React.useState(VOICES[0].id);
  const [compareN, setCompareN] = React.useState(1);
  const [phase, setPhase] = React.useState('idle'); // idle | gen-text | gen-audio | ready | err
  const [statusMsg, setStatusMsg] = React.useState('');
  const [reportText, setReportText] = React.useState('');
  const [audioUrl, setAudioUrl] = React.useState(null);
  const [audioDur, setAudioDur] = React.useState(0);
  const [curTime, setCurTime] = React.useState(0);
  const [playing, setPlaying] = React.useState(false);

  // Chat
  const [chatHistory, setChatHistory] = React.useState([]);
  const [chatInput, setChatInput] = React.useState('');
  const [chatBusy, setChatBusy] = React.useState(false);
  const audioRef = React.useRef(null);
  const chatLogRef = React.useRef(null);

  // Reset при закритті
  React.useEffect(() => {
    if (!open) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setPhase('idle');
      setReportText('');
      setAudioUrl(null);
      setChatHistory([]);
      setChatInput('');
    }
  }, [open]);
  const dataSummary = React.useMemo(() => buildDataSummary(sales, traffic, {
    ratio,
    period,
    screenName
  }), [sales, traffic, ratio, period, screenName]);
  const anyTopic = topics.sales || topics.traffic || topics.advice;
  async function generate() {
    if (!anyTopic) {
      setStatusMsg('Оберіть хоча б одну тему');
      setPhase('err');
      return;
    }
    setPhase('gen-text');
    setStatusMsg('Аналізую дані…');
    try {
      const text = await generateReportText({
        depth,
        topics,
        dataSummary,
        compareWeeks: compareN,
        screenName,
        period
      });
      setReportText(text);
      setPhase('gen-audio');
      setStatusMsg('Генерую голос…');
      const url = await fetchTTS(text, voiceId);
      setAudioUrl(url);
      setPhase('ready');
      // Auto-play
      setTimeout(() => {
        const a = new Audio(url);
        a.playbackRate = rate;
        audioRef.current = a;
        a.onloadedmetadata = () => setAudioDur(a.duration);
        a.ontimeupdate = () => setCurTime(a.currentTime);
        a.onplay = () => setPlaying(true);
        a.onpause = () => setPlaying(false);
        a.onended = () => {
          setPlaying(false);
          setCurTime(a.duration);
        };
        a.play().catch(() => {});
      }, 50);
    } catch (e) {
      console.error(e);
      setStatusMsg('Помилка: ' + (e.message || e));
      setPhase('err');
    }
  }
  function togglePlay() {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) a.play();else a.pause();
  }
  function seek(e) {
    const a = audioRef.current;
    if (!a || !a.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    a.currentTime = pct * a.duration;
  }
  function onRateChange(v) {
    setRate(v);
    if (audioRef.current) audioRef.current.playbackRate = v;
  }
  async function sendChat(e) {
    e.preventDefault();
    const q = chatInput.trim();
    if (!q || chatBusy) return;
    setChatInput('');
    const newHist = [...chatHistory, {
      role: 'user',
      text: q
    }];
    setChatHistory(newHist);
    setChatBusy(true);
    try {
      const answer = await aiReportProxy({
        screen: screenName || 'Огляд',
        period: period || '',
        topics: [],
        depth: 'brief',
        tone: 'friendly',
        data: { summary: dataSummary },
        followupQuestion: q,
        previousText: reportText
      });
      setChatHistory([...newHist, {
        role: 'bot',
        text: answer
      }]);
      // озвучка
      try {
        const url = await fetchTTS(answer, voiceId);
        const a = new Audio(url);
        a.playbackRate = rate;
        a.play();
      } catch (_) {}
    } catch (err) {
      setChatHistory([...newHist, {
        role: 'bot',
        text: 'Помилка: ' + err.message
      }]);
    } finally {
      setChatBusy(false);
      setTimeout(() => {
        if (chatLogRef.current) chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
      }, 50);
    }
  }
  if (!open) return null;

  // ── Стилі ──
  const modalStyle = {
    position: 'fixed',
    inset: 0,
    zIndex: 100,
    background: 'rgba(26, 21, 16, 0.55)',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    fontFamily: LA_MONO
  };
  const sheetStyle = {
    width: '100%',
    maxWidth: 420,
    background: LA_P.paper,
    borderRadius: '20px 20px 0 0',
    maxHeight: 'calc(100vh - 20px)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 -10px 40px rgba(0,0,0,0.2)'
  };
  const scrollArea = {
    overflowY: 'auto',
    padding: '4px 16px 16px',
    flex: 1
  };
  const labelS = {
    fontSize: 9.5,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: 'rgb(92, 158, 219)',
    marginBottom: 8,
    fontWeight: 500
  };
  const cardS = {
    background: '#fffbf0',
    border: `1px solid ${LA_P.line}`,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10
  };
  const groupS = on => ({
    background: on ? '#fffbf0' : '#ede5d0',
    border: `1px solid ${on ? LA_P.ink : LA_P.line}`,
    borderRadius: 10,
    padding: 12,
    cursor: 'pointer',
    marginBottom: 8,
    transition: 'all .15s'
  });
  return /*#__PURE__*/React.createElement("div", {
    style: modalStyle,
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    style: sheetStyle,
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 16px 10px',
      borderBottom: `1px solid ${LA_P.line}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: LA_P.paper
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(LiveAIIcon, {
    size: 16,
    color: LA_P.ink
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      fontWeight: 600,
      color: LA_P.ink
    }
  }, "Live AI \xB7 ", screenName)), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      background: 'none',
      border: 'none',
      fontSize: 20,
      cursor: 'pointer',
      color: LA_P.ink,
      padding: 0,
      lineHeight: 1
    }
  }, "\xD7")), /*#__PURE__*/React.createElement("div", {
    style: scrollArea
  }, phase === 'idle' || phase === 'err' ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: labelS
  }, "\u0429\u043E \u0432\u043A\u043B\u044E\u0447\u0438\u0442\u0438"), [{
    key: 'sales',
    title: 'Тенденція продажів',
    desc: 'Середній чек · покупці · динаміка · майстерня'
  }, {
    key: 'traffic',
    title: 'Трафік',
    desc: 'Клієнти · тривалість · конверсія · пікові години'
  }, {
    key: 'advice',
    title: 'Поради',
    desc: 'AI додасть 2-3 рекомендації на основі даних'
  }].map(t => /*#__PURE__*/React.createElement("div", {
    key: t.key,
    style: groupS(topics[t.key]),
    onClick: () => setTopics({
      ...topics,
      [t.key]: !topics[t.key]
    })
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 16,
      height: 16,
      border: `1.5px solid ${topics[t.key] ? LA_P.ink : LA_P.muted}`,
      borderRadius: 3,
      background: topics[t.key] ? LA_P.ink : 'transparent',
      display: 'grid',
      placeItems: 'center',
      flexShrink: 0
    }
  }, topics[t.key] && /*#__PURE__*/React.createElement("svg", {
    width: "10",
    height: "10",
    viewBox: "0 0 16 16",
    fill: "none",
    stroke: "#f1ead8",
    strokeWidth: "2.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3 8l3 3 7-7"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      color: LA_P.ink
    }
  }, t.title)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10.5,
      color: '#5a5044',
      paddingLeft: 26,
      marginTop: 4,
      lineHeight: 1.45
    }
  }, t.desc)))), /*#__PURE__*/React.createElement("div", {
    style: cardS
  }, /*#__PURE__*/React.createElement("div", {
    style: labelS
  }, "\u041F\u043E\u0440\u0456\u0432\u043D\u044F\u0442\u0438 \u0437 \u043F\u0435\u0440\u0456\u043E\u0434\u043E\u043C"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setCompareN(Math.max(1, compareN - 1)),
    style: stepperBtn()
  }, "\u2212"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      textAlign: 'center',
      fontSize: 12
    }
  }, compareN, " \u0442\u0438\u0436\u0434. \u0442\u043E\u043C\u0443"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setCompareN(Math.min(12, compareN + 1)),
    style: stepperBtn()
  }, "+"))), /*#__PURE__*/React.createElement("div", {
    style: cardS
  }, /*#__PURE__*/React.createElement("div", {
    style: labelS
  }, "\u0428\u0432\u0438\u0434\u043A\u0456\u0441\u0442\u044C \xB7 ", rate.toFixed(1), "\xD7"), /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: "0.7",
    max: "1.5",
    step: "0.1",
    value: rate,
    onChange: e => onRateChange(+e.target.value),
    style: {
      width: '100%',
      accentColor: LA_P.ink
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: cardS
  }, /*#__PURE__*/React.createElement("div", {
    style: labelS
  }, "\u0413\u043B\u0438\u0431\u0438\u043D\u0430"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3,1fr)',
      gap: 6
    }
  }, [{
    id: 'short',
    t: 'Коротке',
    d: 'до 1 хв'
  }, {
    id: 'medium',
    t: 'Середнє',
    d: '1-3 хв'
  }, {
    id: 'long',
    t: 'Глибоке',
    d: '3-4 хв'
  }].map(x => /*#__PURE__*/React.createElement("button", {
    key: x.id,
    onClick: () => setDepth(x.id),
    style: {
      background: depth === x.id ? LA_P.ink : '#fffbf0',
      color: depth === x.id ? LA_P.paper : LA_P.ink,
      border: `1px solid ${depth === x.id ? LA_P.ink : LA_P.line}`,
      borderRadius: 8,
      padding: '10px 4px',
      cursor: 'pointer',
      fontFamily: LA_MONO,
      textAlign: 'left'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      fontWeight: 600,
      letterSpacing: 0.6,
      textTransform: 'uppercase'
    }
  }, x.t), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 9,
      opacity: 0.7,
      marginTop: 2
    }
  }, x.d))))), /*#__PURE__*/React.createElement("div", {
    style: cardS
  }, /*#__PURE__*/React.createElement("div", {
    style: labelS
  }, "\u0413\u043E\u043B\u043E\u0441"), /*#__PURE__*/React.createElement("select", {
    value: voiceId,
    onChange: e => setVoiceId(e.target.value),
    style: {
      width: '100%',
      background: '#fffbf0',
      border: `1px solid ${LA_P.line}`,
      color: LA_P.ink,
      borderRadius: 8,
      padding: '10px 12px',
      fontFamily: LA_MONO,
      fontSize: 12,
      cursor: 'pointer'
    }
  }, VOICES.map(v => /*#__PURE__*/React.createElement("option", {
    key: v.id,
    value: v.id
  }, v.name, " \u2014 ", v.desc)))), phase === 'err' && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10.5,
      color: LA_P.danger || '#c47862',
      padding: '8px 12px',
      marginBottom: 10
    }
  }, statusMsg), /*#__PURE__*/React.createElement("button", {
    onClick: generate,
    disabled: !anyTopic,
    style: {
      width: '100%',
      background: anyTopic ? LA_P.ink : '#bfb398',
      color: LA_P.paper,
      border: 'none',
      borderRadius: 100,
      padding: 14,
      fontFamily: LA_MONO,
      fontSize: 10.5,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      fontWeight: 600,
      cursor: anyTopic ? 'pointer' : 'not-allowed',
      marginTop: 6
    }
  }, "\u25B8 \u0417\u0433\u0435\u043D\u0435\u0440\u0443\u0432\u0430\u0442\u0438 \u0442\u0430 \u043F\u0440\u043E\u0433\u0440\u0430\u0442\u0438")) : phase === 'gen-text' || phase === 'gen-audio' ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '60px 20px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-block',
      width: 28,
      height: 28,
      border: `2.5px solid ${LA_P.line}`,
      borderTopColor: LA_P.ink,
      borderRadius: '50%',
      animation: 'spin 0.9s linear infinite',
      marginBottom: 16
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      color: LA_P.ink,
      fontWeight: 600
    }
  }, statusMsg), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: '#5a5044',
      marginTop: 6
    }
  }, phase === 'gen-text' ? 'Gemini 2.5 Pro · глибокий аналіз ~ 20-40 секунд' : 'ElevenLabs ~ 3-8 секунд')) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fffbf0',
      border: `1px solid ${LA_P.ink}`,
      borderRadius: 12,
      padding: 14,
      marginTop: 10,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 36,
      borderRadius: '50%',
      background: LA_P.ink,
      color: LA_P.paper,
      display: 'grid',
      placeItems: 'center',
      flexShrink: 0,
      animation: playing ? 'pulse 1.4s infinite' : 'none'
    }
  }, /*#__PURE__*/React.createElement(LiveAIIcon, {
    size: 16,
    color: LA_P.paper
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      color: LA_P.ink
    }
  }, "\u0410\u0443\u0434\u0456\u043E-\u0437\u0432\u0456\u0442"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 9.5,
      color: '#5a5044',
      marginTop: 2
    }
  }, depth === 'short' ? 'Коротке' : depth === 'medium' ? 'Середнє' : 'Глибоке', " \xB7 ", rate.toFixed(1), "\xD7 \xB7 ", fmtTime(audioDur)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: togglePlay,
    style: {
      width: 40,
      height: 40,
      borderRadius: '50%',
      background: LA_P.ink,
      border: 0,
      cursor: 'pointer',
      display: 'grid',
      placeItems: 'center',
      color: LA_P.paper,
      flexShrink: 0
    }
  }, playing ? /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "currentColor"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M6 4h4v16H6zM14 4h4v16h-4z"
  })) : /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "currentColor"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M8 5v14l11-7z"
  }))), /*#__PURE__*/React.createElement("div", {
    onClick: seek,
    style: {
      flex: 1,
      height: 4,
      background: '#ede5d0',
      borderRadius: 2,
      cursor: 'pointer',
      overflow: 'hidden',
      border: `1px solid ${LA_P.line}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      background: LA_P.ink,
      width: audioDur ? `${curTime / audioDur * 100}%` : '0%',
      transition: 'width .1s'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 9.5,
      color: '#5a5044',
      fontVariantNumeric: 'tabular-nums',
      minWidth: 70,
      textAlign: 'right'
    }
  }, fmtTime(curTime), "/", fmtTime(audioDur))), /*#__PURE__*/React.createElement("details", null, /*#__PURE__*/React.createElement("summary", {
    style: {
      fontSize: 9.5,
      letterSpacing: 1,
      textTransform: 'uppercase',
      color: '#8a7d69',
      cursor: 'pointer',
      listStyle: 'none'
    }
  }, "\u25B8 \u041F\u043E\u043A\u0430\u0437\u0430\u0442\u0438 \u0442\u0435\u043A\u0441\u0442"), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#ede5d0',
      border: `1px solid ${LA_P.line}`,
      borderRadius: 8,
      padding: 10,
      marginTop: 8,
      fontSize: 11,
      lineHeight: 1.55,
      color: '#1a1510',
      maxHeight: 180,
      overflowY: 'auto',
      whiteSpace: 'pre-wrap'
    }
  }, reportText))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: labelS
  }, "\u0417\u0430\u043F\u0438\u0442\u0430\u0442\u0438 \u0434\u043E\u0434\u0430\u0442\u043A\u043E\u0432\u043E"), /*#__PURE__*/React.createElement("div", {
    ref: chatLogRef,
    style: {
      maxHeight: 200,
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      marginBottom: 8
    }
  }, chatHistory.map((m, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
      maxWidth: '85%',
      background: m.role === 'user' ? LA_P.ink : '#fffbf0',
      color: m.role === 'user' ? LA_P.paper : LA_P.ink,
      border: m.role === 'bot' ? `1px solid ${LA_P.line}` : 'none',
      borderRadius: 12,
      borderBottomRightRadius: m.role === 'user' ? 3 : 12,
      borderBottomLeftRadius: m.role === 'bot' ? 3 : 12,
      padding: '8px 12px',
      fontSize: 11,
      lineHeight: 1.45
    }
  }, m.text)), chatBusy && /*#__PURE__*/React.createElement("div", {
    style: {
      alignSelf: 'flex-start',
      color: '#8a7d69',
      fontSize: 11,
      fontStyle: 'italic',
      padding: '8px 12px'
    }
  }, "\u2026")), /*#__PURE__*/React.createElement("form", {
    onSubmit: sendChat,
    style: {
      display: 'flex',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("input", {
    value: chatInput,
    onChange: e => setChatInput(e.target.value),
    placeholder: "\u0417\u0430\u043F\u0438\u0442\u0430\u0439\u0442\u0435 \u0434\u043E\u0434\u0430\u0442\u043A\u043E\u0432\u043E\u2026",
    style: {
      flex: 1,
      background: '#fffbf0',
      border: `1px solid ${LA_P.line}`,
      color: LA_P.ink,
      borderRadius: 100,
      padding: '0 14px',
      fontSize: 12,
      fontFamily: LA_MONO,
      minHeight: 40,
      outline: 'none'
    }
  }), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    disabled: chatBusy || !chatInput.trim(),
    style: {
      width: 40,
      height: 40,
      borderRadius: '50%',
      background: LA_P.ink,
      color: LA_P.paper,
      border: 0,
      cursor: chatBusy ? 'wait' : 'pointer',
      fontSize: 16,
      opacity: chatBusy || !chatInput.trim() ? 0.4 : 1,
      fontFamily: LA_MONO
    }
  }, "\u2192"))), /*#__PURE__*/React.createElement("button", {
    onClick: () => setPhase('idle'),
    style: {
      width: '100%',
      background: 'transparent',
      color: '#5a5044',
      border: `1px solid ${LA_P.line}`,
      borderRadius: 100,
      padding: 10,
      fontFamily: LA_MONO,
      fontSize: 9.5,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      cursor: 'pointer',
      marginTop: 12
    }
  }, "\u21BB \u041D\u043E\u0432\u0438\u0439 \u0437\u0432\u0456\u0442")))));
}
function stepperBtn() {
  return {
    width: 34,
    height: 34,
    background: '#fffbf0',
    border: `1px solid ${LA_P.line}`,
    color: LA_P.ink,
    borderRadius: 6,
    fontSize: 16,
    cursor: 'pointer',
    fontFamily: LA_MONO
  };
}

// Export
Object.assign(window, {
  LiveAIButton,
  LiveAIModal,
  LiveAIIcon
});
})();
