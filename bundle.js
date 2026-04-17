// ADICTO Reports — compiled bundle

// ===== Charts.jsx =====
(function(){
"use strict";
// Chart primitives — minimal editorial style.
// All charts are SVG-based, sized responsively within their container.

const CH_SERIF = '"JetBrains Mono", ui-monospace, monospace';
const CH_MONO = '"JetBrains Mono", ui-monospace, monospace';
const CH_SANS = '"JetBrains Mono", ui-monospace, monospace';
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

// Small wrapper with title + optional trailing number/legend
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
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
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
      fontFamily: CH_SANS,
      fontSize: 11,
      color: PALETTE.subtle
    }
  }, subtitle)), right), children);
}

// Legend strip (small dots + labels)
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

// BIG NUMBER card
function BigStat({
  label,
  value,
  accent
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
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
      fontFamily: CH_SERIF,
      fontSize: 28,
      lineHeight: 1,
      color: PALETTE.ink,
      letterSpacing: -0.8,
      marginTop: 8
    }
  }, value));
}

// Formats 33830 → "33 830"
function fmt(n) {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

// ─── BAR CHART (horizontal, for categories) ─────────────
function BarsH({
  data,
  valueKey = 'value',
  labelKey = 'name',
  suffix = '',
  h = 220,
  color = PALETTE.ink,
  showPct = false
}) {
  const max = Math.max(...data.map(d => d[valueKey]));
  const rowH = h / data.length;
  return /*#__PURE__*/React.createElement("svg", {
    width: "100%",
    height: h,
    viewBox: `0 0 300 ${h}`,
    preserveAspectRatio: "none"
  }, data.map((d, i) => {
    const w = d[valueKey] / max * 190;
    const y = i * rowH + 2;
    return /*#__PURE__*/React.createElement("g", {
      key: i
    }, /*#__PURE__*/React.createElement("text", {
      x: "0",
      y: y + rowH / 2 + 3,
      fontSize: "9",
      fontFamily: CH_MONO,
      fill: PALETTE.subtle,
      textAnchor: "start"
    }, d[labelKey]), /*#__PURE__*/React.createElement("rect", {
      x: "100",
      y: y + rowH / 2 - 6,
      width: w,
      height: "11",
      fill: color,
      rx: "1"
    }), /*#__PURE__*/React.createElement("text", {
      x: 100 + w + 5,
      y: y + rowH / 2 + 3,
      fontSize: "9",
      fontFamily: CH_MONO,
      fill: PALETTE.ink,
      textAnchor: "start"
    }, showPct ? `${d[valueKey]}%` : fmt(d[valueKey]), suffix));
  }));
}

// ─── STACKED BAR CHART (horizontal) ─────────────────────
function StackedBarsH({
  data,
  keys,
  colors,
  labelKey = 'day',
  h = 180
}) {
  const totals = data.map(d => keys.reduce((s, k) => s + d[k], 0));
  const max = Math.max(...totals);
  const rowH = h / data.length;
  return /*#__PURE__*/React.createElement("svg", {
    width: "100%",
    height: h,
    viewBox: `0 0 300 ${h}`,
    preserveAspectRatio: "none"
  }, data.map((d, i) => {
    const y = i * rowH + 2;
    let xAcc = 70;
    return /*#__PURE__*/React.createElement("g", {
      key: i
    }, /*#__PURE__*/React.createElement("text", {
      x: "0",
      y: y + rowH / 2 + 3,
      fontSize: "9",
      fontFamily: CH_MONO,
      fill: PALETTE.subtle
    }, d[labelKey]), keys.map((k, ki) => {
      const w = d[k] / max * 210;
      const el = /*#__PURE__*/React.createElement("rect", {
        key: ki,
        x: xAcc,
        y: y + rowH / 2 - 6,
        width: w,
        height: "11",
        fill: colors[ki]
      });
      xAcc += w;
      return el;
    }), /*#__PURE__*/React.createElement("text", {
      x: xAcc + 4,
      y: y + rowH / 2 + 3,
      fontSize: "9",
      fontFamily: CH_MONO,
      fill: PALETTE.ink
    }, totals[i]));
  }));
}

// ─── VERTICAL BARS (with optional stack) ────────────────
function BarsV({
  data,
  keys = ['v'],
  colors = [PALETTE.ink],
  labelKey = 'month',
  h = 160,
  showVals = true
}) {
  const totals = data.map(d => keys.reduce((s, k) => s + d[k], 0));
  const max = Math.max(...totals) * 1.15;
  const pad = 30;
  const plotH = h - pad - 14;
  const bw = 260 / data.length;
  const gap = bw * 0.18;
  return /*#__PURE__*/React.createElement("svg", {
    width: "100%",
    height: h,
    viewBox: `0 0 300 ${h}`,
    preserveAspectRatio: "none"
  }, data.map((d, i) => {
    const x = 20 + i * bw + gap / 2;
    const w = bw - gap;
    let yAcc = plotH;
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
    }), showVals && /*#__PURE__*/React.createElement("text", {
      x: x + w / 2,
      y: plotH - totals[i] / max * plotH - 4,
      fontSize: "8.5",
      fontFamily: CH_MONO,
      fill: PALETTE.ink,
      textAnchor: "middle"
    }, fmt(totals[i])), /*#__PURE__*/React.createElement("text", {
      x: x + w / 2,
      y: h - 4,
      fontSize: "9",
      fontFamily: CH_MONO,
      fill: PALETTE.subtle,
      textAnchor: "middle"
    }, d[labelKey]));
  }));
}

// ─── LINE / AREA CHART ──────────────────────────────────
function AreaChart({
  data,
  h = 140,
  color = PALETTE.ink,
  labels = []
}) {
  const max = Math.max(...data) * 1.1;
  const pad = 18;
  const plotH = h - pad;
  const pts = data.map((v, i) => [20 + i / (data.length - 1) * 260, plotH - v / max * (plotH - 6) + 2]);
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ');
  const area = path + ` L${pts[pts.length - 1][0]},${plotH} L${pts[0][0]},${plotH} Z`;
  return /*#__PURE__*/React.createElement("svg", {
    width: "100%",
    height: h,
    viewBox: `0 0 300 ${h}`,
    preserveAspectRatio: "none"
  }, [0.25, 0.5, 0.75].map(t => /*#__PURE__*/React.createElement("line", {
    key: t,
    x1: "20",
    x2: "280",
    y1: plotH - t * (plotH - 6) + 2,
    y2: plotH - t * (plotH - 6) + 2,
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
  })), labels.map((l, i) => i % Math.ceil(labels.length / 6) === 0 && /*#__PURE__*/React.createElement("text", {
    key: i,
    x: pts[i][0],
    y: h - 2,
    fontSize: "8",
    fontFamily: CH_MONO,
    fill: PALETTE.subtle,
    textAnchor: "middle"
  }, l)));
}

// ─── DONUT CHART ────────────────────────────────────────
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
  BigStat,
  BarsH,
  StackedBarsH,
  BarsV,
  AreaChart,
  Donut,
  fmt,
  PALETTE
};
})();

// ===== Aggregator.jsx =====
(function(){
"use strict";
// Aggregator — перетворює raw rows з Google Sheets у метрики для UI.
//
// Sales raw header (з вашого CSV):
//   Дата, Час, Документ, Клієнт, Артикул, EAN, Назва товару,
//   Категорія (Familia), Кількість, Ціна за од., Спосіб Оплати,
//   Продаж (Сума), Сума ПДВ, Разом з ПДВ, Собівартість (Закупка),
//   Чистий Прибуток.
//
// Traffic raw header:
//   Date, Time, Week Day, Enter, Exit, Стать, Хвилини

// ── ПАРСЕРИ ────────────────────────────────────────────────

// "45,45" / "45.45" / 45 → 45.45
function num(v) {
  if (v == null || v === '') return 0;
  if (typeof v === 'number') return v;
  const s = String(v).trim().replace(/\s/g, '').replace(',', '.');
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

// "2026-01-02" АБО Date object (з Apps Script getValues) → Date
function parseSalesDate(v) {
  if (!v) return null;
  if (v instanceof Date) return v;
  const s = String(v).trim();
  // YYYY-MM-DD
  const m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
  const d = new Date(s);
  return isNaN(d) ? null : d;
}

// "09.04.2026" DD.MM.YYYY
function parseTrafficDate(v) {
  if (!v) return null;
  if (v instanceof Date) return v;
  const s = String(v).trim();
  const m = s.match(/^(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})/);
  if (m) return new Date(+m[3], +m[2] - 1, +m[1]);
  const d = new Date(s);
  return isNaN(d) ? null : d;
}
const MONTH_ES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const WEEK_ES = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];

// ── КАТЕГОРІЇ ──────────────────────────────────────────────
// Familia коди з CSV → людські назви
const FAMILIA_NAMES = {
  BIC: 'Велосипеди',
  BCE: 'Велосипеди',
  EBK: 'Велосипеди',
  COM: 'Компоненти',
  MNT: 'Компоненти',
  FPS: 'Компоненти',
  ROD: 'Компоненти',
  AMP: 'Компоненти',
  SLL: 'Компоненти',
  PED: 'Компоненти',
  PCA: 'Компоненти',
  CYP: 'Компоненти',
  REP: 'Ремонт',
  REV: 'Ремонт',
  ACC: 'Аксесуари',
  BID: 'Аксесуари',
  ILU: 'Аксесуари',
  LMP: 'Аксесуари',
  TBL: 'Аксесуари',
  TXA: 'Одяг',
  INT: 'Екіп',
  ZAP: 'Взуття',
  NBR: 'Nutricion',
  ALQ: 'Оренда'
};
function categoryName(code) {
  if (!code) return 'Інше';
  const up = String(code).trim().toUpperCase();
  return FAMILIA_NAMES[up] || up;
}

// ── ОСНОВНИЙ АГРЕГАТОР SALES ────────────────────────────────

// Нормалізація одного сирого рядка
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

// Обчислює cutoff дату для периода на основі найсвіжішої дати в даних
function periodCutoff(days, latestDate) {
  if (!days || !latestDate) return null;
  const d = new Date(latestDate);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - (days - 1));
  return d;
}
function aggregateSales(rows, opts = {}) {
  if (!rows?.length) return emptySales();
  const allRecords = rows.map(normalizeSaleRow).filter(r => r.date);

  // Визначаємо latest date по всіх даних
  const latest = allRecords.reduce((a, r) => r.date > a ? r.date : a, new Date(0));

  // Фільтр за period (днів)
  const cutoff = periodCutoff(opts.periodDays, latest);
  const records = cutoff ? allRecords.filter(r => r.date >= cutoff) : allRecords;

  // Totals
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
        month: MONTH_ES[r.date.getMonth()],
        total: 0,
        noVAT: 0,
        cost: 0,
        profit: 0
      });
    }
    const m = monthMap.get(key);
    m.total += r.gross;
    m.noVAT += r.sale;
    m.cost += r.cost;
    m.profit += r.profit;
  });
  const monthly = Array.from(monthMap.values()).sort((a, b) => a.year - b.year || a.mIdx - b.mIdx);

  // Categories (за Familia)
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

  // By week day — агрегація по днях тижня для всіх records у періоді
  const dayMap = new Map();
  records.forEach(r => {
    const key = WEEK_ES[r.date.getDay()];
    dayMap.set(key, (dayMap.get(key) || 0) + r.gross);
  });
  const weekByDay = ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'].map(d => ({
    day: d,
    v: Math.round(dayMap.get(d) || 0)
  })).filter(x => x.v > 0);

  // By category (додатково — як week-cut дивись у categories нижче, але залишаємо для UI якщо треба)
  const weekCatMap = new Map();
  records.forEach(r => {
    const name = categoryName(r.cat);
    weekCatMap.set(name, (weekCatMap.get(name) || 0) + r.gross);
  });
  const weekByCategory = [...weekCatMap.entries()].map(([name, v]) => ({
    name,
    v: Math.round(v)
  })).sort((a, b) => b.v - a.v);

  // Timeline по тижнях — групуємо по ISO-weeks
  const weekMap = new Map();
  records.forEach(r => {
    const wk = isoWeekKey(r.date);
    weekMap.set(wk, (weekMap.get(wk) || 0) + r.gross);
  });
  const timeline = [...weekMap.entries()].sort().map(([, v]) => Math.round(v));

  // Top products
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

  // Top clients (client=0 означає "анонім / готівка" — фільтруємо)
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

  // Payment methods
  const payMap = new Map();
  records.forEach(r => {
    const k = (r.pay || 'OTRO').toUpperCase();
    payMap.set(k, (payMap.get(k) || 0) + r.gross);
  });
  const payments = [...payMap.entries()].map(([name, v]) => ({
    name,
    v: Math.round(v)
  })).sort((a, b) => b.v - a.v);

  // Диапазон дат
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
    weekByCategory,
    timeline,
    topProducts,
    topClients,
    payments,
    range,
    count: records.length
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
    weekByCategory: [],
    timeline: [],
    topProducts: [],
    topClients: [],
    payments: [],
    range: null,
    count: 0
  };
}
function isoWeekKey(d) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const wk = Math.ceil(((t - yearStart) / 86400000 + 1) / 7);
  return t.getUTCFullYear() + '-' + String(wk).padStart(2, '0');
}

// ── АГРЕГАТОР TRAFFIC ──────────────────────────────────────
function aggregateTraffic(rows, opts = {}) {
  if (!rows?.length) return emptyTraffic();
  const allRecords = rows.map(r => ({
    date: parseTrafficDate(r['Date'] || r.date),
    time: r['Time'] || '',
    enter: num(r['Enter']),
    exit: num(r['Exit']),
    gender: String(r['Стать'] || '-').trim(),
    minutes: num(r['Хвилини'])
  })).filter(r => r.date);
  const latest = allRecords.reduce((a, r) => r.date > a ? r.date : a, new Date(0));
  const cutoff = periodCutoff(opts.periodDays, latest);
  const records = cutoff ? allRecords.filter(r => r.date >= cutoff) : allRecords;

  // Total entries
  const totalEnter = records.reduce((a, r) => a + r.enter, 0);
  const totalExit = records.reduce((a, r) => a + r.exit, 0);

  // Гендер (лише для входів, бо саме при вході камера розпізнає)
  const genderMap = {
    Ч: 0,
    Ж: 0,
    '-': 0
  };
  records.forEach(r => {
    if (r.enter > 0) {
      const k = genderMap.hasOwnProperty(r.gender) ? r.gender : '-';
      genderMap[k] += r.enter;
    }
  });

  // Monthly
  const monthMap = new Map();
  records.forEach(r => {
    const key = r.date.getFullYear() + '-' + r.date.getMonth();
    if (!monthMap.has(key)) {
      monthMap.set(key, {
        year: r.date.getFullYear(),
        mIdx: r.date.getMonth(),
        month: MONTH_ES[r.date.getMonth()],
        enter: 0,
        exit: 0,
        totalMinutes: 0,
        sessions: 0
      });
    }
    const m = monthMap.get(key);
    m.enter += r.enter;
    m.exit += r.exit;
    if (r.minutes > 0) {
      m.totalMinutes += r.minutes;
      m.sessions += 1;
    }
  });
  const monthly = [...monthMap.values()].sort((a, b) => a.year - b.year || a.mIdx - b.mIdx).map(m => ({
    ...m,
    total: m.enter,
    avgMinutes: m.sessions ? m.totalMinutes / m.sessions : 0
  }));

  // Weekday distribution
  const dayMap = new Map();
  records.forEach(r => {
    if (r.enter <= 0) return;
    const k = WEEK_ES[r.date.getDay()];
    dayMap.set(k, (dayMap.get(k) || 0) + r.enter);
  });
  const weekday = ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'].map(d => ({
    day: d,
    v: dayMap.get(d) || 0
  }));

  // Hourly distribution
  const hourMap = new Map();
  records.forEach(r => {
    if (r.enter <= 0) return;
    const h = parseInt(String(r.time).split(':')[0], 10);
    if (isNaN(h)) return;
    hourMap.set(h, (hourMap.get(h) || 0) + r.enter);
  });
  const hourly = Array.from({
    length: 24
  }, (_, h) => ({
    h,
    v: hourMap.get(h) || 0
  }));
  const dates = records.map(r => r.date);
  const range = dates.length ? {
    from: new Date(Math.min(...dates)),
    to: new Date(Math.max(...dates))
  } : null;
  return {
    totalEnter,
    totalExit,
    gender: genderMap,
    monthly,
    weekday,
    hourly,
    range,
    count: records.length
  };
}
function emptyTraffic() {
  return {
    totalEnter: 0,
    totalExit: 0,
    gender: {
      Ч: 0,
      Ж: 0,
      '-': 0
    },
    monthly: [],
    weekday: [],
    hourly: [],
    range: null,
    count: 0
  };
}

// ── PUBLIC ──
window.AGGREGATOR = {
  aggregateSales,
  aggregateTraffic,
  MONTH_ES,
  WEEK_ES
};
})();

// ===== DataStore.jsx =====
(function(){
"use strict";
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

// ===== PullToRefresh.jsx =====
(function(){
"use strict";
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

// ===== Screens.jsx =====
(function(){
"use strict";
// Screens — малює екрани з агрегованих даних.

const {
  ChartCard,
  BigStat,
  BarsH,
  BarsV,
  AreaChart,
  Donut,
  Legend,
  fmt,
  PALETTE
} = window.CHARTS;
const {
  aggregateSales,
  aggregateTraffic,
  MONTH_ES
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
function ScreenHeader({
  title,
  subtitle,
  right
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 16px 18px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: SC_MONO,
      fontSize: 9.5,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      color: PALETTE.muted,
      marginBottom: 6
    }
  }, "ADICTO.bike"), /*#__PURE__*/React.createElement("div", {
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
function DateRangeLabel({
  range
}) {
  if (!range) return null;
  const f = d => `${String(d.getDate()).padStart(2, '0')} ${MONTH_ES[d.getMonth()]}`;
  return /*#__PURE__*/React.createElement("div", {
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
      color: PALETTE.ink
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: PALETTE.accent
    }
  }, "\u25E7"), f(range.from), " \u2014 ", f(range.to), ", ", range.to.getFullYear());
}

// ── SALES ───────────────────────────────────────────────
function SalesScreen({
  data,
  accent,
  period,
  onPeriodChange
}) {
  const s = data;
  if (!s.count) return /*#__PURE__*/React.createElement(EmptyState, {
    msg: "\u041D\u0435\u043C\u0430\u0454 \u0434\u0430\u043D\u0438\u0445 \u043F\u0440\u043E\u0434\u0430\u0436\u0456\u0432 \u0443 \u0432\u0438\u0431\u0440\u0430\u043D\u043E\u043C\u0443 \u043F\u0435\u0440\u0456\u043E\u0434\u0456"
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 120
    }
  }, /*#__PURE__*/React.createElement(ScreenHeader, {
    title: "Sales",
    subtitle: `${s.count} операцій`,
    right: null
  }), /*#__PURE__*/React.createElement(Section, null, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement(DateRangeLabel, {
    range: s.range
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement(PeriodSelector, {
    current: period,
    onChange: onPeriodChange
  }))), /*#__PURE__*/React.createElement(Section, null, /*#__PURE__*/React.createElement("div", {
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
  }))), s.monthly.length > 1 && /*#__PURE__*/React.createElement(Section, null, /*#__PURE__*/React.createElement(ChartCard, {
    title: "\u041F\u0440\u043E\u0434\u0430\u0436\u0456 \u043F\u043E \u043C\u0456\u0441\u044F\u0446\u044F\u043C",
    subtitle: `${s.monthly.length} міс · з ПДВ`
  }, /*#__PURE__*/React.createElement(BarsV, {
    data: s.monthly,
    keys: ['total'],
    colors: [PALETTE.ink],
    labelKey: "month",
    h: 180
  }))), s.categories.length > 0 && /*#__PURE__*/React.createElement(Section, null, /*#__PURE__*/React.createElement(ChartCard, {
    title: "\u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0456\u0457",
    subtitle: "\u041F\u0440\u043E\u0434\u0430\u0436\u0456 \u0437\u0430 Familia, \u0437 \u041F\u0414\u0412"
  }, /*#__PURE__*/React.createElement(BarsH, {
    data: s.categories.slice(0, 10).map(c => ({
      name: c.name,
      value: Math.round(c.value)
    })),
    h: 220,
    color: PALETTE.ink
  }))), s.weekByDay.length > 0 && /*#__PURE__*/React.createElement(Section, null, /*#__PURE__*/React.createElement(ChartCard, {
    title: "\u041F\u043E \u0434\u043D\u044F\u0445 \u0442\u0438\u0436\u043D\u044F",
    subtitle: "\u0421\u0435\u0440\u0435\u0434\u043D\u0454 \u0432 \u043F\u0435\u0440\u0456\u043E\u0434\u0456, \u0437 \u041F\u0414\u0412"
  }, /*#__PURE__*/React.createElement(BarsV, {
    data: s.weekByDay,
    keys: ['v'],
    colors: [accent],
    labelKey: "day",
    h: 160
  }))), s.timeline.length > 2 && /*#__PURE__*/React.createElement(Section, null, /*#__PURE__*/React.createElement(ChartCard, {
    title: "\u0422\u0438\u0436\u043D\u0435\u0432\u0430 \u0434\u0438\u043D\u0430\u043C\u0456\u043A\u0430",
    subtitle: `${s.timeline.length} тижнів`
  }, /*#__PURE__*/React.createElement(AreaChart, {
    data: s.timeline,
    color: PALETTE.ink,
    h: 140
  }))), s.topProducts.length > 0 && /*#__PURE__*/React.createElement(Section, null, /*#__PURE__*/React.createElement(ChartCard, {
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
      fontSize: 12,
      color: PALETTE.ink,
      fontWeight: 500
    }
  }, fmt(p.gross))))))), s.payments.length > 0 && /*#__PURE__*/React.createElement(Section, null, /*#__PURE__*/React.createElement(ChartCard, {
    title: "\u0421\u043F\u043E\u0441\u043E\u0431\u0438 \u043E\u043F\u043B\u0430\u0442\u0438"
  }, /*#__PURE__*/React.createElement(BarsH, {
    data: s.payments.map(p => ({
      name: p.name,
      value: p.v
    })),
    h: Math.max(60, s.payments.length * 26),
    color: accent
  }))));
}

// ── TRAFFIC ────────────────────────────────────────────
function TrafficScreen({
  data,
  accent,
  period,
  onPeriodChange
}) {
  const t = data;
  if (!t.count) return /*#__PURE__*/React.createElement(EmptyState, {
    msg: "\u041D\u0435\u043C\u0430\u0454 \u0434\u0430\u043D\u0438\u0445 \u0442\u0440\u0430\u0444\u0456\u043A\u0443 \u0443 \u0432\u0438\u0431\u0440\u0430\u043D\u043E\u043C\u0443 \u043F\u0435\u0440\u0456\u043E\u0434\u0456"
  });
  const genderData = [{
    name: 'Ч',
    v: t.gender['Ч'] || 0
  }, {
    name: 'Ж',
    v: t.gender['Ж'] || 0
  }, {
    name: '?',
    v: t.gender['-'] || 0
  }].filter(x => x.v > 0);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 120
    }
  }, /*#__PURE__*/React.createElement(ScreenHeader, {
    title: "Traffic",
    subtitle: `${t.count} подій`
  }), /*#__PURE__*/React.createElement(Section, null, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement(DateRangeLabel, {
    range: t.range
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement(PeriodSelector, {
    current: period,
    onChange: onPeriodChange
  }))), /*#__PURE__*/React.createElement(Section, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement(BigStat, {
    label: "\u0423\u0432\u0456\u0439\u0448\u043B\u0438",
    value: fmt(t.totalEnter),
    accent: accent
  }), /*#__PURE__*/React.createElement(BigStat, {
    label: "\u0412\u0438\u0439\u0448\u043B\u0438",
    value: fmt(t.totalExit)
  }))), t.monthly.length > 0 && /*#__PURE__*/React.createElement(Section, null, /*#__PURE__*/React.createElement(ChartCard, {
    title: "\u041F\u043E \u043C\u0456\u0441\u044F\u0446\u044F\u043C",
    subtitle: "\u0412\u0445\u043E\u0434\u0438"
  }, /*#__PURE__*/React.createElement(BarsV, {
    data: t.monthly.map(m => ({
      month: m.month,
      v: m.enter
    })),
    keys: ['v'],
    colors: [PALETTE.ink],
    labelKey: "month",
    h: 180
  }))), t.weekday.some(d => d.v > 0) && /*#__PURE__*/React.createElement(Section, null, /*#__PURE__*/React.createElement(ChartCard, {
    title: "\u041F\u043E \u0434\u043D\u044F\u0445 \u0442\u0438\u0436\u043D\u044F",
    subtitle: "\u0412\u0445\u043E\u0434\u0438, \u0441\u0443\u043C\u0430\u0440\u043D\u043E \u0437\u0430 \u0432\u0435\u0441\u044C \u043F\u0435\u0440\u0456\u043E\u0434"
  }, /*#__PURE__*/React.createElement(BarsV, {
    data: t.weekday,
    keys: ['v'],
    colors: [accent],
    labelKey: "day",
    h: 160
  }))), t.hourly.some(h => h.v > 0) && /*#__PURE__*/React.createElement(Section, null, /*#__PURE__*/React.createElement(ChartCard, {
    title: "\u041F\u043E \u0433\u043E\u0434\u0438\u043D\u0430\u0445",
    subtitle: "\u0412\u0445\u043E\u0434\u0438, \u0441\u0443\u043C\u0430\u0440\u043D\u043E \u0437\u0430 \u0432\u0435\u0441\u044C \u043F\u0435\u0440\u0456\u043E\u0434"
  }, /*#__PURE__*/React.createElement(BarsV, {
    data: t.hourly.filter(h => h.h >= 8 && h.h <= 22).map(h => ({
      month: String(h.h),
      v: h.v
    })),
    keys: ['v'],
    colors: [PALETTE.ink],
    labelKey: "month",
    h: 160
  }))), genderData.length > 0 && /*#__PURE__*/React.createElement(Section, null, /*#__PURE__*/React.createElement(ChartCard, {
    title: "\u0421\u0442\u0430\u0442\u044C",
    subtitle: "\u0420\u043E\u0437\u043F\u043E\u0434\u0456\u043B \u0432\u0445\u043E\u0434\u0456\u0432"
  }, /*#__PURE__*/React.createElement(BarsH, {
    data: genderData.map(g => ({
      name: g.name,
      value: g.v
    })),
    h: Math.max(60, genderData.length * 28),
    color: accent
  }))));
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

// ── HOME (quick summary) ───────────────────────────────
function HomeScreen({
  sales,
  traffic,
  accent,
  updated,
  source
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 120
    }
  }, /*#__PURE__*/React.createElement(ScreenHeader, {
    title: "Overview",
    subtitle: updatedLabel(updated, source)
  }), /*#__PURE__*/React.createElement(Section, null, /*#__PURE__*/React.createElement(ChartCard, {
    title: "\u041F\u0440\u043E\u0434\u0430\u0436\u0456",
    subtitle: sales.range ? dateRangeLabel(sales.range) : ''
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(BigStat, {
    label: "\u0417 \u041F\u0414\u0412",
    value: fmt(sales.totals.gross),
    accent: accent
  }), /*#__PURE__*/React.createElement(BigStat, {
    label: "\u041F\u0440\u0438\u0431\u0443\u0442\u043E\u043A",
    value: fmt(sales.totals.profit)
  }))), /*#__PURE__*/React.createElement(ChartCard, {
    title: "\u0422\u0440\u0430\u0444\u0456\u043A",
    subtitle: traffic.range ? dateRangeLabel(traffic.range) : ''
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(BigStat, {
    label: "\u0412\u0445\u043E\u0434\u0438",
    value: fmt(traffic.totalEnter),
    accent: accent
  }), /*#__PURE__*/React.createElement(BigStat, {
    label: "\u041E\u043F\u0435\u0440\u0430\u0446\u0456\u0439",
    value: fmt(sales.count)
  }))), sales.monthly.length > 0 && /*#__PURE__*/React.createElement(ChartCard, {
    title: "\u0414\u0438\u043D\u0430\u043C\u0456\u043A\u0430",
    subtitle: "\u041F\u0440\u043E\u0434\u0430\u0436\u0456 \u043F\u043E \u043C\u0456\u0441\u044F\u0446\u044F\u043C"
  }, /*#__PURE__*/React.createElement(BarsV, {
    data: sales.monthly,
    keys: ['total'],
    colors: [PALETTE.ink],
    labelKey: "month",
    h: 160
  }))));
}
function updatedLabel(iso, source) {
  if (!iso) return source === 'cache' ? 'Кеш (офлайн)' : '—';
  const d = new Date(iso);
  const pad = n => String(n).padStart(2, '0');
  const src = source === 'cache' ? ' · кеш' : '';
  return `Оновлено ${pad(d.getHours())}:${pad(d.getMinutes())} ${pad(d.getDate())}.${pad(d.getMonth() + 1)}${src}`;
}
function dateRangeLabel(range) {
  const f = d => `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`;
  return `${f(range.from)} — ${f(range.to)}`;
}

// Футер, який показується в кінці кожного екрана
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
  EmptyState,
  ScreenHeader,
  LastUpdatedFooter,
  PeriodSelector
};

// ── PeriodSelector — segmented control ────────────────
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
        padding: '7px 8px',
        borderRadius: 8,
        background: active ? '#fffbf0' : 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontFamily: SC_MONO,
        fontSize: 10,
        letterSpacing: 0.8,
        textTransform: 'uppercase',
        color: active ? PALETTE.ink : PALETTE.muted,
        fontWeight: active ? 500 : 400,
        boxShadow: active ? '0 1px 2px rgba(0,0,0,0.04)' : 'none'
      }
    }, o.label);
  }));
}
})();

// ===== Auth.jsx =====
(function(){
"use strict";
// LoginGate — простий email+пароль gate.
// Credentials хардкодом (немає сервера). Для 2 користувачів цього достатньо.
// Зберігає сесію в localStorage після успішного входу.

const CREDENTIALS = [{
  email: 'vasile@adicto.bike',
  password: 'Scalpel2012!'
}, {
  email: 'maximiva@gmail.com',
  password: 'Tornado80!'
}];
const SESSION_KEY = 'adicto.session.v1';
const SESSION_MAX_AGE_DAYS = 60;
function checkSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    const ageDays = (Date.now() - s.loggedAt) / (1000 * 60 * 60 * 24);
    if (ageDays > SESSION_MAX_AGE_DAYS) return null;
    if (!CREDENTIALS.find(c => c.email === s.email)) return null; // email більше не існує
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
  }, "ADICTO.bike"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 24,
      letterSpacing: -0.6,
      lineHeight: 1,
      textTransform: 'uppercase',
      color: PALETTE.ink,
      fontWeight: 600,
      marginBottom: 22
    }
  }, "Reports"), /*#__PURE__*/React.createElement(Label, null, "Email"), /*#__PURE__*/React.createElement(Field, {
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
  }, "\u0423\u0432\u0456\u0439\u0442\u0438"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      fontSize: 9,
      color: PALETTE.muted,
      letterSpacing: 0.4,
      textAlign: 'center',
      lineHeight: 1.5
    }
  }, "\u0421\u0435\u0441\u0456\u044F \u0437\u0431\u0435\u0440\u0456\u0433\u0430\u0454\u0442\u044C\u0441\u044F \u043D\u0430 60 \u0434\u043D\u0456\u0432 \u043D\u0430 \u0446\u044C\u043E\u043C\u0443 \u043F\u0440\u0438\u0441\u0442\u0440\u043E\u0457.")));
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

// ===== main =====
(function(){
"use strict";
const {
  useDataStore
} = window.DATA_STORE;
const {
  aggregateSales,
  aggregateTraffic
} = window.AGGREGATOR;
const {
  SalesScreen,
  TrafficScreen,
  HomeScreen,
  EmptyState,
  LastUpdatedFooter,
  PeriodSelector
} = window.SCREENS;
const {
  PALETTE
} = window.CHARTS;
const {
  PullToRefresh
} = window.PTR;
const {
  LoginScreen,
  checkSession,
  clearSession
} = window.AUTH;
const MONO = '"JetBrains Mono", ui-monospace, monospace';
const TABS = [{
  id: 'home',
  label: 'Home',
  glyph: '◐'
}, {
  id: 'sales',
  label: 'Sales',
  glyph: '◧'
}, {
  id: 'traffic',
  label: 'Traffic',
  glyph: '◉'
}, {
  id: 'more',
  label: 'More',
  glyph: '◈'
}];
function TabBar({
  current,
  onTab,
  accent
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'sticky',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'rgba(253, 249, 238, 0.92)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      borderTop: `1px solid ${PALETTE.line}`,
      display: 'flex',
      padding: '8px 0 max(10px, env(safe-area-inset-bottom))',
      zIndex: 40
    }
  }, TABS.map(t => {
    const active = current === t.id;
    return /*#__PURE__*/React.createElement("button", {
      key: t.id,
      onClick: () => onTab(t.id),
      style: {
        flex: 1,
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
        padding: '6px 4px',
        color: active ? accent : PALETTE.muted
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 18
      }
    }, t.glyph), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: MONO,
        fontSize: 9,
        letterSpacing: 0.8,
        textTransform: 'uppercase',
        color: active ? PALETTE.ink : PALETTE.muted,
        fontWeight: active ? 500 : 400
      }
    }, t.label));
  }));
}
function TopBar({
  onRefresh,
  loading,
  source,
  updated,
  error
}) {
  const dot = source === 'live' ? '#7aa875' : source === 'cache' ? '#c4a04e' : '#c47862';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'sticky',
      top: 0,
      zIndex: 30,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 16px',
      gap: 10,
      background: 'rgba(241, 234, 216, 0.92)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: `1px solid ${PALETTE.line}`,
      fontFamily: MONO
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 6,
      height: 6,
      borderRadius: 3,
      background: error ? '#c47862' : dot,
      animation: loading ? 'pulse 1.4s ease-in-out infinite' : 'none'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 9,
      letterSpacing: 1,
      textTransform: 'uppercase',
      color: PALETTE.subtle
    }
  }, error ? 'Офлайн · кеш' : source === 'live' ? 'Live' : source === 'cache' ? 'Кеш' : '—')), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: PALETTE.ink,
      letterSpacing: 0.4
    }
  }, "ADICTO.bike"), /*#__PURE__*/React.createElement("button", {
    onClick: onRefresh,
    disabled: loading,
    style: {
      background: 'transparent',
      border: `1px solid ${PALETTE.line}`,
      borderRadius: 100,
      padding: '5px 11px',
      cursor: loading ? 'default' : 'pointer',
      fontFamily: MONO,
      fontSize: 9,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      color: PALETTE.ink,
      opacity: loading ? 0.4 : 1
    }
  }, loading ? '↻' : '↻ Оновити'));
}
function ErrorBanner({
  error,
  onDismiss
}) {
  if (!error) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '10px 16px',
      padding: '10px 12px',
      background: '#fdf4e8',
      border: '1px solid #e6c9a3',
      borderRadius: 10,
      fontFamily: MONO,
      fontSize: 10,
      color: '#8a5a2a',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", null, "\u041D\u0435 \u0432\u0434\u0430\u043B\u043E\u0441\u044C \u043E\u043D\u043E\u0432\u0438\u0442\u0438: ", error, ". \u041F\u043E\u043A\u0430\u0437\u0443\u044E \u0437\u0431\u0435\u0440\u0435\u0436\u0435\u043D\u0456 \u0434\u0430\u043D\u0456."), /*#__PURE__*/React.createElement("button", {
    onClick: onDismiss,
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: '#8a5a2a',
      fontSize: 14,
      padding: 0
    }
  }, "\xD7"));
}
function MoreScreen({
  updated,
  source,
  error,
  apiUrl,
  cachedAt,
  userEmail,
  onLogout
}) {
  const rows = [['Користувач', userEmail || '—'], ['Джерело', source === 'live' ? 'Google Sheets (live)' : source === 'cache' ? 'Локальний кеш' : '—'], ['Оновлено сервером', updated ? new Date(updated).toLocaleString('uk-UA') : '—'], ['Кеш збережено', cachedAt ? new Date(cachedAt).toLocaleString('uk-UA') : '—'], ['Endpoint', apiUrl ? '✓ налаштовано' : '✗ не налаштовано'], ['Помилка', error || 'немає']];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 120
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 16px 18px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: MONO,
      fontSize: 9.5,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      color: PALETTE.muted,
      marginBottom: 6
    }
  }, "\u0414\u0456\u0430\u0433\u043D\u043E\u0441\u0442\u0438\u043A\u0430"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: MONO,
      fontSize: 28,
      lineHeight: 1,
      letterSpacing: -0.8,
      color: PALETTE.ink,
      textTransform: 'uppercase',
      fontWeight: 600
    }
  }, "More")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fffbf0',
      border: '1px solid #e6ddc9',
      borderRadius: 12,
      padding: 4
    }
  }, rows.map(([k, v], i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: 10,
      padding: '10px 12px',
      borderBottom: i < rows.length - 1 ? `1px solid ${PALETTE.line}` : 'none',
      fontFamily: MONO,
      fontSize: 11
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: PALETTE.muted,
      fontSize: 9.5,
      letterSpacing: 0.8,
      textTransform: 'uppercase'
    }
  }, k), /*#__PURE__*/React.createElement("div", {
    style: {
      color: PALETTE.ink,
      textAlign: 'right',
      wordBreak: 'break-all'
    }
  }, String(v))))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14,
      padding: '12px 14px',
      background: '#fffbf0',
      border: '1px solid #e6ddc9',
      borderRadius: 12,
      fontFamily: MONO,
      fontSize: 10,
      color: PALETTE.subtle,
      lineHeight: 1.5
    }
  }, "\u0417\u0430\u0441\u0442\u043E\u0441\u0443\u043D\u043E\u043A \u0437\u0431\u0435\u0440\u0456\u0433\u0430\u0454 \u043E\u0441\u0442\u0430\u043D\u043D\u044E \u043A\u043E\u043F\u0456\u044E \u0434\u0430\u043D\u0438\u0445 \u043B\u043E\u043A\u0430\u043B\u044C\u043D\u043E. \u041F\u0440\u0438 \u0432\u0456\u0434\u0441\u0443\u0442\u043D\u043E\u0441\u0442\u0456 \u043C\u0435\u0440\u0435\u0436\u0456 \u043F\u043E\u043A\u0430\u0437\u0443\u0454 \u0434\u0430\u043D\u0456 \u0437 \u043E\u0441\u0442\u0430\u043D\u043D\u044C\u043E\u0457 \u0443\u0441\u043F\u0456\u0448\u043D\u043E\u0457 \u0441\u0438\u043D\u0445\u0440\u043E\u043D\u0456\u0437\u0430\u0446\u0456\u0457."), /*#__PURE__*/React.createElement("button", {
    onClick: onLogout,
    style: {
      marginTop: 14,
      width: '100%',
      padding: '12px 16px',
      background: 'transparent',
      border: `1px solid ${PALETTE.line}`,
      borderRadius: 10,
      cursor: 'pointer',
      fontFamily: MONO,
      fontSize: 10,
      letterSpacing: 1.4,
      textTransform: 'uppercase',
      color: PALETTE.ink
    }
  }, "\u21A4 \u0412\u0438\u0439\u0442\u0438")));
}
function App() {
  const [session, setSession] = React.useState(() => checkSession());

  // Якщо нема сесії — показуємо логін
  if (!session) {
    return /*#__PURE__*/React.createElement(LoginScreen, {
      onLogin: email => setSession({
        email,
        loggedAt: Date.now()
      })
    });
  }
  const handleLogout = () => {
    clearSession();
    setSession(null);
  };
  const store = useDataStore();
  const [tab, setTab] = React.useState(() => localStorage.getItem('adicto.tab') || 'home');
  const [period, setPeriod] = React.useState(() => localStorage.getItem('adicto.period') || 'all');
  const [errorShown, setErrorShown] = React.useState(true);
  const accent = 'rgb(92, 158, 219)';
  React.useEffect(() => {
    localStorage.setItem('adicto.tab', tab);
  }, [tab]);
  React.useEffect(() => {
    localStorage.setItem('adicto.period', period);
  }, [period]);
  const periodDays = period === 'all' ? null : parseInt(period, 10);
  const sales = React.useMemo(() => store.payload?.sales?.rows ? aggregateSales(store.payload.sales.rows, {
    periodDays
  }) : aggregateSales([]), [store.payload, periodDays]);
  const traffic = React.useMemo(() => store.payload?.traffic?.rows ? aggregateTraffic(store.payload.traffic.rows, {
    periodDays
  }) : aggregateTraffic([]), [store.payload, periodDays]);
  const hasData = store.payload && (sales.count || traffic.count);

  // Первинне завантаження без кешу
  if (!hasData && store.loading) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: MONO,
        color: PALETTE.muted,
        fontSize: 11,
        letterSpacing: 1,
        textTransform: 'uppercase'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 12,
        height: 12,
        border: `2px solid ${PALETTE.line}`,
        borderTopColor: PALETTE.ink,
        borderRadius: '50%',
        margin: '0 auto 14px',
        animation: 'spin 0.8s linear infinite'
      }
    }), "\u0417\u0430\u0432\u0430\u043D\u0442\u0430\u0436\u0435\u043D\u043D\u044F"));
  }
  if (!hasData && store.error) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'center',
        fontFamily: MONO,
        maxWidth: 320
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 32,
        marginBottom: 16
      }
    }, "\u26A0"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 14,
        color: PALETTE.ink,
        marginBottom: 12,
        fontWeight: 500
      }
    }, "\u041D\u0435 \u0432\u0434\u0430\u043B\u043E\u0441\u044C \u043E\u0442\u0440\u0438\u043C\u0430\u0442\u0438 \u0434\u0430\u043D\u0456"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        color: PALETTE.subtle,
        lineHeight: 1.6,
        marginBottom: 20
      }
    }, store.error), /*#__PURE__*/React.createElement("button", {
      onClick: store.refresh,
      style: {
        background: PALETTE.ink,
        color: '#f1ead8',
        border: 'none',
        borderRadius: 100,
        padding: '10px 20px',
        fontFamily: MONO,
        fontSize: 10,
        letterSpacing: 1,
        textTransform: 'uppercase',
        cursor: 'pointer'
      }
    }, "\u0421\u043F\u0440\u043E\u0431\u0443\u0432\u0430\u0442\u0438 \u0449\u0435 \u0440\u0430\u0437")));
  }
  const body = tab === 'home' ? /*#__PURE__*/React.createElement(HomeScreen, {
    sales: sales,
    traffic: traffic,
    accent: accent,
    updated: store.payload?.updated,
    source: store.source
  }) : tab === 'sales' ? /*#__PURE__*/React.createElement(SalesScreen, {
    data: sales,
    accent: accent,
    period: period,
    onPeriodChange: setPeriod
  }) : tab === 'traffic' ? /*#__PURE__*/React.createElement(TrafficScreen, {
    data: traffic,
    accent: accent,
    period: period,
    onPeriodChange: setPeriod
  }) : /*#__PURE__*/React.createElement(MoreScreen, {
    updated: store.payload?.updated,
    source: store.source,
    error: store.error,
    apiUrl: window.ADICTO_CONFIG.apiUrl,
    cachedAt: store.savedAt,
    userEmail: session.email,
    onLogout: handleLogout
  });
  const footer = tab !== 'more' ? /*#__PURE__*/React.createElement(LastUpdatedFooter, {
    updated: store.payload?.updated,
    savedAt: store.savedAt,
    source: store.source,
    loading: store.loading,
    onRefresh: store.refresh
  }) : null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement(TopBar, {
    onRefresh: store.refresh,
    loading: store.loading,
    source: store.source,
    updated: store.payload?.updated,
    error: errorShown ? store.error : null
  }), errorShown && store.error && hasData && /*#__PURE__*/React.createElement(ErrorBanner, {
    error: store.error,
    onDismiss: () => setErrorShown(false)
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement(PullToRefresh, {
    onRefresh: store.refresh,
    loading: store.loading
  }, body, footer)), /*#__PURE__*/React.createElement(TabBar, {
    current: tab,
    onTab: setTab,
    accent: accent
  }));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));
})();
