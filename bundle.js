
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
  hint
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
  }, hint));
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
function BarsH({
  data,
  valueKey = 'value',
  labelKey = 'name',
  suffix = '',
  color = PALETTE.ink,
  showPct = false,
  formatter
}) {
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
  formatter
}) {
  const fmtVal = formatter || fmt;
  const totals = data.map(d => keys.reduce((s, k) => s + d[k], 0));
  const max = Math.max(...totals, 1) * 1.15;
  const pad = 30;
  const plotH = h - pad - 14;
  const bw = 260 / Math.max(data.length, 1);
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
    }), showVals && totals[i] > 0 && /*#__PURE__*/React.createElement("text", {
      x: x + w / 2,
      y: plotH - totals[i] / max * plotH - 4,
      fontSize: "8.5",
      fontFamily: CH_MONO,
      fill: PALETTE.ink,
      textAnchor: "middle"
    }, fmtVal(totals[i])), /*#__PURE__*/React.createElement("text", {
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
  monthTicks = true
}) {
  if (!data || !data.length) return null;
  const isObj = typeof data[0] === 'object';
  const values = isObj ? data.map(d => d.v) : data;
  const starts = isObj ? data.map(d => d.start) : null;
  const max = Math.max(...values, 1) * 1.1;
  const pad = 22;
  const plotH = h - pad;
  const pts = values.map((v, i) => [20 + (values.length === 1 ? 130 : i / (values.length - 1) * 260), plotH - v / max * (plotH - 6) + 2]);
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ');
  const area = path + ` L${pts[pts.length - 1][0]},${plotH} L${pts[0][0]},${plotH} Z`;

  // Мітки місяців — для кожної точки, де змінився місяць vs попередньої
  const MONTH_UA = ['січ', 'лют', 'бер', 'кві', 'тра', 'чер', 'лип', 'сер', 'вер', 'жов', 'лис', 'гру'];
  const monthLabels = [];
  if (monthTicks && starts) {
    let prevMonth = -1;
    starts.forEach((s, i) => {
      if (!(s instanceof Date)) return;
      const m = s.getMonth();
      if (m !== prevMonth) {
        monthLabels.push({
          i,
          label: MONTH_UA[m],
          x: pts[i][0]
        });
        prevMonth = m;
      }
    });
  }
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
  })), monthLabels.map((m, i) => /*#__PURE__*/React.createElement("g", {
    key: i
  }, /*#__PURE__*/React.createElement("line", {
    x1: m.x,
    x2: m.x,
    y1: plotH,
    y2: plotH + 4,
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
  const m = s.match(/^(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})/);
  if (m) return new Date(+m[3], +m[2] - 1, +m[1]);
  const m2 = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m2) return new Date(+m2[1], +m2[2] - 1, +m2[3]);
  const d = new Date(s);
  return isNaN(d) ? null : d;
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

// Фільтрує records по опціях: periodDays (last N days based on latest) АБО from/to
function applyPeriod(allRecords, opts) {
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
  const allRecords = rows.map(normalizeSaleRow).filter(r => r.date);
  const records = applyPeriod(allRecords, opts);
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

  // По днях тижня (UA)
  const dayMap = new Map();
  records.forEach(r => {
    const key = WEEK_UA[r.date.getDay()];
    dayMap.set(key, (dayMap.get(key) || 0) + r.gross);
  });
  const weekByDay = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'нд'].map(d => ({
    day: d,
    v: Math.round(dayMap.get(d) || 0)
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

  // Способи оплати (з перекладом)
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
  const payments = [...payMap.entries()].map(([code, v]) => ({
    code,
    name: PAY_NAMES[code] || code,
    v: Math.round(v)
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
    timeline: [],
    topProducts: [],
    topClients: [],
    payments: [],
    receiptsByDate: {},
    totalReceipts: 0,
    range: null,
    count: 0
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
  const allRecords = rows.map(r => ({
    date: parseTrafficDate(r['Date'] || r.date),
    time: String(r['Time'] || '').trim(),
    sessionId: String(r['Session_ID'] || r['SessionID'] || '').trim(),
    event: String(r['Event'] || '').trim().toLowerCase(),
    gender: String(r['Gender'] || r['Стать'] || '-').trim(),
    age: num(r['Age']),
    ageGroup: String(r['Age_Group'] || r['AgeGroup'] || '').trim(),
    duration: num(r['Duration_min'] || r['Duration'] || r['Хвилини'])
  })).filter(r => r.date);
  const records = applyPeriod(allRecords, opts);

  // Унікальні сесії по session root (без префіксу Enter_/Exit_)
  function sessionRoot(id) {
    if (!id) return '';
    return id.replace(/^(enter|exit)_/i, '').trim();
  }

  // Беремо ВСІ enter events як унікальних клієнтів (один enter = один візит)
  const enterRecords = records.filter(r => r.event === 'enter');
  const exitRecords = records.filter(r => r.event === 'exit');
  const totalVisitors = enterRecords.length;

  // Gender — беремо з exit records (там є дані), або з enter якщо є
  const genderMap = {
    Ч: 0,
    Ж: 0,
    '-': 0
  };
  const ageGroupMap = new Map();
  const durations = [];

  // Зв'яжемо exit із enter через sessionRoot для збагачення
  const sessionData = new Map();
  records.forEach(r => {
    const root = sessionRoot(r.sessionId);
    if (!root) return;
    if (!sessionData.has(root)) sessionData.set(root, {});
    const s = sessionData.get(root);
    if (r.event === 'enter') s.enterAt = r;
    if (r.event === 'exit') {
      s.exitAt = r;
      s.gender = r.gender && r.gender !== '-' ? r.gender : s.gender;
      s.age = r.age || s.age;
      s.ageGroup = r.ageGroup || s.ageGroup;
      s.duration = r.duration || s.duration;
    }
  });
  sessionData.forEach(s => {
    if (!s.enterAt) return; // рахуємо лише візити з enter
    const g = s.gender || '-';
    const k = g === 'Ч' || g === 'Ж' ? g : '-';
    genderMap[k] += 1;
    if (s.ageGroup) {
      ageGroupMap.set(s.ageGroup, (ageGroupMap.get(s.ageGroup) || 0) + 1);
    }
    if (s.duration > 0) durations.push(s.duration);
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

  // Місяці
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
    monthMap.get(key).v += 1;
  });
  const monthly = [...monthMap.values()].sort((a, b) => a.year - b.year || a.mIdx - b.mIdx);

  // По днях тижня (UA)
  const dayMap = new Map();
  enterRecords.forEach(r => {
    const key = WEEK_UA[r.date.getDay()];
    dayMap.set(key, (dayMap.get(key) || 0) + 1);
  });
  const weekday = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'нд'].map(d => ({
    day: d,
    v: dayMap.get(d) || 0
  }));

  // По годинах
  const hourMap = new Map();
  enterRecords.forEach(r => {
    const h = parseInt(String(r.time).split(':')[0], 10);
    if (isNaN(h)) return;
    hourMap.set(h, (hourMap.get(h) || 0) + 1);
  });
  const hourly = Array.from({
    length: 24
  }, (_, h) => ({
    h,
    v: hourMap.get(h) || 0
  }));

  // Найактивніша година
  let peakHour = null,
    peakV = 0;
  hourly.forEach(x => {
    if (x.v > peakV) {
      peakV = x.v;
      peakHour = x.h;
    }
  });

  // Визитів по датах (для Ratio)
  const visitsByDate = {};
  enterRecords.forEach(r => {
    const k = dateKey(r.date);
    visitsByDate[k] = (visitsByDate[k] || 0) + 1;
  });
  const dates = enterRecords.map(r => r.date);
  const range = dates.length ? {
    from: new Date(Math.min(...dates)),
    to: new Date(Math.max(...dates))
  } : null;
  return {
    totalVisitors,
    gender: genderMap,
    ageGroups,
    avgDuration,
    durationBuckets,
    peakHour,
    peakHourVisits: peakV,
    monthly,
    weekday,
    hourly,
    visitsByDate,
    range,
    count: enterRecords.length
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
    visitsByDate: {},
    range: null,
    count: 0
  };
}

// Ratio: візитів / чеків, по спільних датах
function computeRatio(sales, traffic) {
  const dates = new Set([...Object.keys(sales.receiptsByDate || {}), ...Object.keys(traffic.visitsByDate || {})]);
  let v = 0,
    r = 0;
  const daily = [];
  [...dates].sort().forEach(d => {
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
  const conversion = v > 0 ? r / v * 100 : 0; // % конверсії
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
  WEEK_UA
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
  size = 22
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

// Форматер дати в стилі 10.04.2026
function fmtDate(d) {
  if (!d) return '';
  return String(d.getDate()).padStart(2, '0') + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.' + d.getFullYear();
}
function DateRangeLabel({
  range
}) {
  if (!range) return null;
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
  }, "\u25E7"), fmtDate(range.from), " \u2014 ", fmtDate(range.to));
}

// ── Period Selector (4 options + Custom) ──────────────
function PeriodSelector({
  current,
  onChange,
  customFrom,
  customTo,
  onCustomChange
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
  }, {
    id: 'custom',
    label: '● Дати'
  }];
  const isCustom = current === 'custom';
  const inputStyle = {
    fontFamily: SC_MONO,
    fontSize: 11,
    padding: '8px 10px',
    background: '#fffbf0',
    border: `1px solid ${PALETTE.line}`,
    borderRadius: 8,
    color: PALETTE.ink,
    outline: 'none',
    flex: 1,
    minWidth: 0
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
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
  })), isCustom && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginTop: 8,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: customFrom || '',
    onChange: e => onCustomChange({
      from: e.target.value,
      to: customTo
    }),
    style: inputStyle
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      color: PALETTE.muted,
      fontFamily: SC_MONO,
      fontSize: 12
    }
  }, "\u2014"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: customTo || '',
    onChange: e => onCustomChange({
      from: customFrom,
      to: e.target.value
    }),
    style: inputStyle
  })));
}

// ── SALES ───────────────────────────────────────────────
function SalesScreen({
  data,
  accent,
  period,
  onPeriodChange,
  customRange,
  onCustomChange
}) {
  const s = data;
  const [catMode, setCatMode] = React.useState('uah'); // 'uah' | 'pct'

  if (!s.count) return /*#__PURE__*/React.createElement(EmptyState, {
    msg: "\u041D\u0435\u043C\u0430\u0454 \u0434\u0430\u043D\u0438\u0445 \u043F\u0440\u043E\u0434\u0430\u0436\u0456\u0432 \u0443 \u0432\u0438\u0431\u0440\u0430\u043D\u043E\u043C\u0443 \u043F\u0435\u0440\u0456\u043E\u0434\u0456"
  });
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
    onChange: onPeriodChange,
    customFrom: customRange?.from,
    customTo: customRange?.to,
    onCustomChange: onCustomChange
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
    title: "\u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0456\u0457 (\u0437\u0430 Familia)",
    subtitle: catMode === 'uah' ? 'З ПДВ' : '% від загального обороту',
    right: /*#__PURE__*/React.createElement(ValueToggle, {
      options: [{
        id: 'uah',
        label: '€'
      }, {
        id: 'pct',
        label: '%'
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
  }))), s.weekByDay.length > 0 && /*#__PURE__*/React.createElement(Section, null, /*#__PURE__*/React.createElement(ChartCard, {
    title: "\u041F\u043E \u0434\u043D\u044F\u0445 \u0442\u0438\u0436\u043D\u044F",
    subtitle: "\u0421\u0443\u043C\u0430\u0440\u043D\u043E, \u0437 \u041F\u0414\u0412"
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
    h: 160,
    monthTicks: true
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
      fontSize: 11.5,
      color: PALETTE.ink,
      fontWeight: 500
    }
  }, fmt(p.gross))))))), s.payments.length > 0 && /*#__PURE__*/React.createElement(Section, null, /*#__PURE__*/React.createElement(ChartCard, {
    title: "\u0421\u043F\u043E\u0441\u043E\u0431\u0438 \u043E\u043F\u043B\u0430\u0442\u0438",
    subtitle: "\u0417 \u041F\u0414\u0412"
  }, /*#__PURE__*/React.createElement(BarsH, {
    data: s.payments.map(p => ({
      name: p.name,
      value: p.v
    })),
    color: accent
  }))));
}

// ── TRAFFIC ────────────────────────────────────────────
function TrafficScreen({
  data,
  accent,
  period,
  onPeriodChange,
  customRange,
  onCustomChange,
  ratio
}) {
  const t = data;
  const [genderMode, setGenderMode] = React.useState('count');
  if (!t.count) return /*#__PURE__*/React.createElement(EmptyState, {
    msg: "\u041D\u0435\u043C\u0430\u0454 \u0434\u0430\u043D\u0438\u0445 \u0442\u0440\u0430\u0444\u0456\u043A\u0443 \u0443 \u0432\u0438\u0431\u0440\u0430\u043D\u043E\u043C\u0443 \u043F\u0435\u0440\u0456\u043E\u0434\u0456"
  });
  const genderTotal = (t.gender['Ч'] || 0) + (t.gender['Ж'] || 0) + (t.gender['-'] || 0) || 1;
  const genderData = [{
    name: 'Чоловіки',
    v: t.gender['Ч'] || 0
  }, {
    name: 'Жінки',
    v: t.gender['Ж'] || 0
  }, {
    name: 'Невідомо',
    v: t.gender['-'] || 0
  }].filter(x => x.v > 0).map(g => ({
    name: g.name,
    value: genderMode === 'pct' ? Math.round(g.v / genderTotal * 1000) / 10 : g.v
  }));
  const fromLabel = t.range ? fmtDate(t.range.from) : '';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 120
    }
  }, /*#__PURE__*/React.createElement(ScreenHeader, {
    title: "Traffic",
    subtitle: "\u0421\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043A\u0430 \u0432\u0456\u0434\u0432\u0456\u0434\u0443\u0432\u0430\u043D\u043E\u0441\u0442\u0456"
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
    onChange: onPeriodChange,
    customFrom: customRange?.from,
    customTo: customRange?.to,
    onCustomChange: onCustomChange
  }))), /*#__PURE__*/React.createElement(Section, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement(BigStat, {
    label: "\u0423\u0441\u044C\u043E\u0433\u043E \u043A\u043B\u0456\u0454\u043D\u0442\u0456\u0432",
    value: fmt(t.totalVisitors),
    accent: accent,
    hint: fromLabel ? `з ${fromLabel}` : ''
  }), /*#__PURE__*/React.createElement(BigStat, {
    label: "\u0421\u0435\u0440\u0435\u0434\u043D\u044F \u0442\u0440\u0438\u0432\u0430\u043B\u0456\u0441\u0442\u044C",
    value: t.avgDuration ? t.avgDuration.toFixed(1) : '—',
    hint: t.avgDuration ? 'хвилин' : ''
  })), ratio && ratio.totalVisits > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement(BigStat, {
    label: "\u041A\u043E\u043D\u0432\u0435\u0440\u0441\u0456\u044F",
    value: fmtPct(ratio.conversion, 1),
    hint: `${fmt(ratio.totalReceipts)} чеків / ${fmt(ratio.totalVisits)} відвідувачів`
  }), /*#__PURE__*/React.createElement(BigStat, {
    label: "\u041F\u0456\u043A \u0433\u043E\u0434\u0438\u043D\u0438",
    value: t.peakHour != null ? String(t.peakHour).padStart(2, '0') + ':00' : '—',
    hint: t.peakHourVisits ? `${t.peakHourVisits} клієнтів` : ''
  }))), t.monthly.length > 0 && /*#__PURE__*/React.createElement(Section, null, /*#__PURE__*/React.createElement(ChartCard, {
    title: "\u041F\u043E \u043C\u0456\u0441\u044F\u0446\u044F\u043C",
    subtitle: "\u0423\u043D\u0456\u043A\u0430\u043B\u044C\u043D\u0456 \u0432\u0456\u0434\u0432\u0456\u0434\u0443\u0432\u0430\u0447\u0456"
  }, /*#__PURE__*/React.createElement(BarsV, {
    data: t.monthly,
    keys: ['v'],
    colors: [PALETTE.ink],
    labelKey: "month",
    h: 180
  }))), t.weekday.some(d => d.v > 0) && /*#__PURE__*/React.createElement(Section, null, /*#__PURE__*/React.createElement(ChartCard, {
    title: "\u041F\u043E \u0434\u043D\u044F\u0445 \u0442\u0438\u0436\u043D\u044F",
    subtitle: "\u0421\u0443\u043C\u0430\u0440\u043D\u043E"
  }, /*#__PURE__*/React.createElement(BarsV, {
    data: t.weekday,
    keys: ['v'],
    colors: [accent],
    labelKey: "day",
    h: 160
  }))), t.hourly.some(h => h.v > 0) && /*#__PURE__*/React.createElement(Section, null, /*#__PURE__*/React.createElement(ChartCard, {
    title: "\u041F\u043E \u0433\u043E\u0434\u0438\u043D\u0430\u0445",
    subtitle: "\u0421\u0443\u043C\u0430\u0440\u043D\u043E"
  }, /*#__PURE__*/React.createElement(BarsV, {
    data: t.hourly.filter(h => h.h >= 8 && h.h <= 22).map(h => ({
      month: String(h.h).padStart(2, '0'),
      v: h.v
    })),
    keys: ['v'],
    colors: [PALETTE.ink],
    labelKey: "month",
    h: 160
  }))), genderData.length > 0 && /*#__PURE__*/React.createElement(Section, null, /*#__PURE__*/React.createElement(ChartCard, {
    title: "\u0421\u0442\u0430\u0442\u044C",
    subtitle: genderMode === 'count' ? 'Кількість клієнтів' : '% розподіл',
    right: /*#__PURE__*/React.createElement(ValueToggle, {
      options: [{
        id: 'count',
        label: '#'
      }, {
        id: 'pct',
        label: '%'
      }],
      value: genderMode,
      onChange: setGenderMode
    })
  }, /*#__PURE__*/React.createElement(BarsH, {
    data: genderData,
    color: accent,
    showPct: genderMode === 'pct'
  }))), t.ageGroups.length > 0 && /*#__PURE__*/React.createElement(Section, null, /*#__PURE__*/React.createElement(ChartCard, {
    title: "\u0412\u0456\u043A",
    subtitle: "\u0420\u043E\u0437\u043F\u043E\u0434\u0456\u043B \u043A\u043B\u0456\u0454\u043D\u0442\u0456\u0432"
  }, /*#__PURE__*/React.createElement(BarsH, {
    data: t.ageGroups.map(a => ({
      name: a.name,
      value: a.v
    })),
    color: PALETTE.olive
  }))), t.durationBuckets.some(b => b.v > 0) && /*#__PURE__*/React.createElement(Section, null, /*#__PURE__*/React.createElement(ChartCard, {
    title: "\u0422\u0440\u0438\u0432\u0430\u043B\u0456\u0441\u0442\u044C \u0432\u0456\u0437\u0438\u0442\u0443",
    subtitle: "\u0420\u043E\u0437\u043F\u043E\u0434\u0456\u043B"
  }, /*#__PURE__*/React.createElement(BarsH, {
    data: t.durationBuckets.filter(b => b.v > 0).map(b => ({
      name: b.label,
      value: b.v
    })),
    color: PALETTE.ink
  }))), ratio && ratio.daily && ratio.daily.length > 1 && /*#__PURE__*/React.createElement(Section, null, /*#__PURE__*/React.createElement(ChartCard, {
    title: "\u0412\u0456\u0434\u0432\u0456\u0434\u0443\u0432\u0430\u0447\u0456 vs \u0447\u0435\u043A\u0438",
    subtitle: "\u041F\u043E \u0434\u043D\u044F\u0445"
  }, /*#__PURE__*/React.createElement(BarsV2, {
    data: ratio.daily.slice(-14).map(d => ({
      month: d.date.slice(8, 10) + '.' + d.date.slice(5, 7),
      visits: d.visits,
      receipts: d.receipts
    })),
    keyA: "visits",
    keyB: "receipts",
    labelA: "\u0412\u0456\u0434\u0432\u0456\u0434\u0443\u0432\u0430\u0447\u0456",
    labelB: "\u0427\u0435\u043A\u0438",
    colorA: accent,
    colorB: PALETTE.ink,
    labelKey: "month",
    h: 160
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

// ── HOME ───────────────────────────────
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
    label: "\u041A\u043B\u0456\u0454\u043D\u0442\u0438",
    value: fmt(traffic.totalVisitors),
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
      // fallback
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
  const companyFull = 'KATAFOT S.L.\nBizkaia Kalea 63, 20800 Zarautz, Spain\nNIF: B56990062';
  const ibanValue = 'ES12 0049 5287 7123 1636 9268';
  const shippingFull = 'KATAFOT SL (Adicto.Bike)\nCapusceac Vasile\nBizkaia Kalea 63, 20800, Zarautz, Gipuzkoa, Spain\n+34 674 262 622';
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
    value: "+34 674 262 622"
  }))));
}

// ── MORE (У розробці) ─────────────────
function MoreScreen({
  userEmail,
  onLogout
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 120
    }
  }, /*#__PURE__*/React.createElement(ScreenHeader, {
    title: "More"
  }), /*#__PURE__*/React.createElement(Section, null, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fffbf0',
      border: `1px dashed ${PALETTE.line}`,
      borderRadius: 12,
      padding: '40px 20px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 46,
      marginBottom: 16,
      opacity: 0.4
    }
  }, "\u25D0"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: SC_MONO,
      fontSize: 18,
      letterSpacing: 1.5,
      textTransform: 'uppercase',
      color: PALETTE.ink,
      fontWeight: 600,
      marginBottom: 8
    }
  }, "\u0412 \u0420\u041E\u0417\u0420\u041E\u0411\u0426\u0406"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: SC_MONO,
      fontSize: 10,
      color: PALETTE.subtle,
      letterSpacing: 0.4,
      lineHeight: 1.6,
      maxWidth: 260,
      margin: '0 auto'
    }
  }, "\u0422\u0443\u0442 \u0437'\u044F\u0432\u043B\u044F\u0442\u044C\u0441\u044F \u0434\u043E\u0434\u0430\u0442\u043A\u043E\u0432\u0456 \u043D\u0430\u043B\u0430\u0448\u0442\u0443\u0432\u0430\u043D\u043D\u044F, \u0435\u043A\u0441\u043F\u043E\u0440\u0442 \u0437\u0432\u0456\u0442\u0456\u0432 \u0442\u0430 \u0456\u043D\u0448\u0456 \u0444\u0443\u043D\u043A\u0446\u0456\u0457.")), /*#__PURE__*/React.createElement("div", {
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
function dateRangeLabel(range) {
  const f = d => `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`;
  return `${f(range.from)} — ${f(range.to)}`;
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
