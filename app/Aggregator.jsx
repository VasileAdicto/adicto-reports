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
const MONTH_UA = ['січ','лют','бер','кві','тра','чер','лип','сер','вер','жов','лис','гру'];
const MONTH_UA_FULL = ['Січень','Лютий','Березень','Квітень','Травень','Червень','Липень','Серпень','Вересень','Жовтень','Листопад','Грудень'];
const WEEK_UA = ['нд','пн','вт','ср','чт','пт','сб'];
const WEEK_UA_FULL = ['Неділя','Понеділок','Вівторок','Середа','Четвер','П\u02bcятниця','Субота'];

// ── КАТЕГОРІЇ (нова розширена мапа) ───────────────────────
const FAMILIA_NAMES = {
  APM:'Аксесуари', ALQ:'Оренда', TXA:'Оренда',
  AMA:'Компоненти', AMH:'Компоненти', AMP:'Компоненти',
  NBR:'Nutricion', SKR:'Велосипеди', SKG:'Велосипеди', SKM:'Велосипеди',
  BID:'Аксесуари', TPB:'Компоненти', BIO:'Оренда', BOL:'Аксесуари',
  RBE:'Компоненти', CYF:'Компоненти', TCD:'Компоненти',
  PCA:'Аксесуари', CAL:'Одяг', CAM:'Компоненти', CNY:'Компоненти',
  CRB:'Компоненти', CAS:'Екіпірування', TCS:'Компоненти',
  CSL:'Одяг', CHL:'Одяг', CHA:'Одяг', CYP:'Компоненти', CPL:'Одяг',
  CUI:'Аксесуари', CRT:'Одяг', CUL:'Одяг',
  TDC:'Компоненти', DRC:'Компоненти',
  SKE:'Велосипеди', ECI:'Велосипеди', EFP:'Велосипеди',
  ELE:'Аксесуари', EMT:'Велосипеди', POR:'Інше',
  ERD:'Велосипеди', FCP:'Компоненти', FRN:'Компоненти',
  GAF:'Екіпірування', NGL:'Екіпірування', GPS:'Аксесуари', TGR:'Компоненти',
  GUA:'Одяг', GDB:'Аксесуари', HRM:'Аксесуари', NHD:'Nutricion',
  HIN:'Аксесуари', IND:'Аксесуари', RLL:'Компоненти', ILU:'Аксесуари',
  MCT:'Одяг', MLR:'Одяг', MLL:'Одяг',
  TMP:'Компоненти', MAN:'Компоненти', MNL:'Компоненти', MNT:'Компоненти',
  LMP:'Компоненти', MER:'Інше', MOT:'Компоненти', NEU:'Компоненти', RNP:'Компоненти',
  OTP:'Екіпірування', OTR:'Аксесуари',
  ACC:'Аксесуари', CLR:'Одяг',
  TPR:'Компоненти', RPR:'Компоненти', FPS:'Компоненти',
  PED:'Компоненти', TPE:'Компоненти', ENV:'Інше',
  POT:'Компоненти', TPT:'Компоненти',
  PTC:'Аксесуари', PRO:'Аксесуари', PTR:'Компоненти', QDL:'Аксесуари',
  RRC:'Компоненти', FRC:'Компоненти', REC:'Nutricion',
  REB:'Ремонт', REV:'Ремонт', REP:'Ремонт',
  ROD:'Компоненти', RDL:'Аксесуари', INT:'Одяг',
  FDS:'Компоненти', RRU:'Компоненти', RUE:'Компоненти',
  SEG:'Аксесуари', SLL:'Компоненти', SIN:'Компоненти',
  NSP:'Nutricion', TAB:'Nutricion',
  TJS:'Компоненти', TJP:'Компоненти', TMS:'Компоненти', TBL:'Компоненти',
  ZAC:'Екіпірування', ZAP:'Екіпірування', FZA:'Компоненти',
};
function categoryName(code) {
  if (!code) return 'Інше';
  const up = String(code).trim().toUpperCase();
  return FAMILIA_NAMES[up] || up;
}

// ── SALES ─────────────────────────────────────────────────
function normalizeSaleRow(r) {
  return {
    date:    parseSalesDate(r['Дата'] || r.date),
    time:    r['Час'] || r.time || '',
    doc:     String(r[' Документ'] || r['Документ'] || r.doc || '').trim(),
    client:  String(r['Клієнт'] || r.client || '').trim(),
    sku:     String(r['Артикул'] || r.sku || '').trim(),
    name:    String(r['Назва товару'] || r.name || '').trim(),
    cat:     String(r['Категорія (Familia)'] || r.cat || '').trim(),
    qty:     num(r['Кількість']),
    price:   num(r['Ціна за од.']),
    pay:     String(r['Спосіб Оплати'] || '').trim(),
    sale:    num(r['Продаж (Сума)']),
    vat:     num(r[' Сума ПДВ'] || r['Сума ПДВ']),
    gross:   num(r['Разом з ПДВ']),
    cost:    num(r['Собівартість (Закупка)']),
    profit:  num(r['Чистий Прибуток.'] || r['Чистий Прибуток']),
  };
}

function dateKey(d) {
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}

// Глобальні мінімальні дати — до цих дат дані вважаємо тестовими.
// Продажі: дані є з 1 січня 2026. Traffic: сенсор встановлений 10 квітня 2026.
const SALES_START   = new Date(2026, 0, 1);  // 01.01.2026
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
    const f = new Date(opts.from); f.setHours(0,0,0,0);
    const t = new Date(opts.to); t.setHours(23,59,59,999);
    return allRecords.filter(r => r.date >= f && r.date <= t);
  }
  if (opts.periodDays) {
    const d = new Date(latest); d.setHours(0,0,0,0);
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
  const weekGrossTotal = [...weekDocsSum.values()].reduce((a,b)=>a+b, 0);
  // Середній чек для Overview — з тим самим фільтром maxCheck, що й глобальний
  const weekDocsFiltered = [...weekDocsSum.values()].filter(v => v < maxCheck);
  const weekAvgCheck = weekDocsFiltered.length ? weekDocsFiltered.reduce((a,b)=>a+b,0) / weekDocsFiltered.length : 0;
  const currentWeek = {
    gross: weekRecords.reduce((a,r)=>a+r.gross, 0),
    profit: weekRecords.reduce((a,r)=>a+r.profit, 0),
    count: weekRecords.length,
    docs: weekDocsCount,
    avgCheck: weekAvgCheck,
    avgCheckDocs: weekDocsFiltered.length,
    range: weekRecords.length ? { from: wkStart, to: latest } : null,
  };
  // Майстерня (категорія "Ремонт") поточний тиждень
  const repairWeek = weekRecords.filter(r => categoryName(r.cat) === 'Ремонт');
  const workshopWeek = {
    gross: repairWeek.reduce((a,r)=>a+r.gross, 0),
    profit: repairWeek.reduce((a,r)=>a+r.profit, 0),
    count: repairWeek.length,
    docs: new Set(repairWeek.map(r=>r.doc).filter(Boolean)).size,
  };

  const totals = records.reduce((a, r) => {
    a.gross += r.gross; a.sale += r.sale;
    a.cost += r.cost; a.profit += r.profit; a.vat += r.vat;
    return a;
  }, { gross:0, sale:0, cost:0, profit:0, vat:0 });

  // Monthly
  const monthMap = new Map();
  records.forEach(r => {
    const key = r.date.getFullYear()+'-'+r.date.getMonth();
    if (!monthMap.has(key)) {
      monthMap.set(key, { year:r.date.getFullYear(), mIdx:r.date.getMonth(), month:MONTH_UA[r.date.getMonth()], total:0 });
    }
    monthMap.get(key).total += r.gross;
  });
  const monthly = [...monthMap.values()].sort((a,b)=>(a.year-b.year)||(a.mIdx-b.mIdx));

  // Категорії (згруповані по Familia через мапу)
  const catMap = new Map();
  records.forEach(r => {
    const name = categoryName(r.cat);
    catMap.set(name, (catMap.get(name) || 0) + r.gross);
  });
  const catTotal = [...catMap.values()].reduce((a,b)=>a+b, 0) || 1;
  const categories = [...catMap.entries()]
    .map(([name, value]) => ({ name, value, pct: (value/catTotal)*100 }))
    .sort((a,b)=>b.value - a.value);

  // По днях тижня (UA) — ВІДСІЮЄМО чеки >1000€ (рідкі великі опт-покупки) і неділю
  // Агрегуємо по документах (чеках), не по позиціях; далі — по днях тижня.
  const docGrossByDate = new Map();
  records.forEach(r => {
    if (!r.doc) return;
    const k = r.doc + '|' + dateKey(r.date);
    const cur = docGrossByDate.get(k) || { date: r.date, gross: 0 };
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
  const weekByDayTotal = [...dayMap.values()].reduce((a,b)=>a+b, 0) || 1;
  const weekByDay = ['пн','вт','ср','чт','пт','сб']
    .map(d => ({
      day: d,
      v: Math.round(dayMap.get(d) || 0),
      pct: Math.round(((dayMap.get(d) || 0) / weekByDayTotal) * 1000) / 10,
    }))
    .filter(x => x.v > 0);

  // Timeline по тижнях з міткою місяця (перший день тижня)
  const weekMap = new Map();
  records.forEach(r => {
    const key = isoWeekKey(r.date);
    if (!weekMap.has(key)) {
      const wkStart = weekStart(r.date);
      weekMap.set(key, { v: 0, start: wkStart });
    }
    weekMap.get(key).v += r.gross;
  });
  const timeline = [...weekMap.entries()]
    .sort((a,b) => a[0].localeCompare(b[0]))
    .map(([,w]) => ({ v: Math.round(w.v), start: w.start }));

  // Топ товарів/клієнтів
  const prodMap = new Map();
  records.forEach(r => {
    if (!r.name) return;
    const k = r.sku || r.name;
    const cur = prodMap.get(k) || { sku:r.sku, name:r.name, qty:0, gross:0, profit:0 };
    cur.qty += r.qty; cur.gross += r.gross; cur.profit += r.profit;
    prodMap.set(k, cur);
  });
  const topProducts = [...prodMap.values()].sort((a,b)=>b.gross-a.gross).slice(0,20);

  const clientMap = new Map();
  records.forEach(r => {
    if (!r.client || r.client === '0') return;
    const cur = clientMap.get(r.client) || { id:r.client, count:0, gross:0 };
    cur.count += 1; cur.gross += r.gross;
    clientMap.set(r.client, cur);
  });
  const topClients = [...clientMap.values()].sort((a,b)=>b.gross-a.gross).slice(0,20);

  // Способи оплати (з перекладом) — + %
  const PAY_NAMES = { TRA:'Переказ', TAR:'Термінал', EFE:'Готівка', WEB:'WEB', OTRO:'Інше' };
  const payMap = new Map();
  records.forEach(r => {
    const k = (r.pay || 'OTRO').toUpperCase();
    payMap.set(k, (payMap.get(k) || 0) + r.gross);
  });
  const payTotal = [...payMap.values()].reduce((a,b)=>a+b, 0) || 1;
  const payments = [...payMap.entries()]
    .map(([code, v]) => ({
      code, name: PAY_NAMES[code] || code,
      v: Math.round(v), pct: Math.round((v/payTotal)*1000)/10,
    }))
    .sort((a,b)=>b.v-a.v);

  // Unique docs per date (для Ratio)
  const docsByDate = new Map();
  records.forEach(r => {
    if (!r.doc) return;
    const k = dateKey(r.date);
    if (!docsByDate.has(k)) docsByDate.set(k, new Set());
    docsByDate.get(k).add(r.doc);
  });
  const receiptsByDate = {};
  docsByDate.forEach((set, k) => { receiptsByDate[k] = set.size; });
  const totalReceipts = Object.values(receiptsByDate).reduce((a,b)=>a+b, 0);

  // Середній чек — на унікальний документ, з фільтром maxCheck
  const docGrossTotals = new Map();
  records.forEach(r => {
    if (!r.doc) return;
    docGrossTotals.set(r.doc, (docGrossTotals.get(r.doc) || 0) + r.gross);
  });
  // Виключаємо документи з сумою >= maxCheck (Vasile: "без продажів від 5000" / "від 2000")
  const filteredDocs = [...docGrossTotals.values()].filter(v => v < maxCheck);
  const avgCheck = filteredDocs.length ? filteredDocs.reduce((a,b)=>a+b,0) / filteredDocs.length : 0;
  const avgCheckDocs = filteredDocs.length;

  const dates = records.map(r => r.date);
  const range = dates.length ? {
    from: new Date(Math.min(...dates)), to: new Date(Math.max(...dates)),
  } : null;

  return {
    totals, monthly, categories, weekByDay, timeline,
    topProducts, topClients, payments,
    receiptsByDate, totalReceipts,
    avgCheck, avgCheckDocs, maxCheck,
    range, count: records.length,
    currentWeek, workshopWeek,
  };
}

function emptySales() {
  return {
    totals:{gross:0,sale:0,cost:0,profit:0,vat:0}, monthly:[], categories:[], weekByDay:[],
    timeline:[], topProducts:[], topClients:[], payments:[],
    receiptsByDate:{}, totalReceipts:0,
    avgCheck:0, avgCheckDocs:0, maxCheck: Infinity,
    range:null, count:0,
    currentWeek:{gross:0,profit:0,count:0,docs:0,avgCheck:0,range:null},
    workshopWeek:{gross:0,profit:0,count:0,docs:0},
  };
}

function weekStart(d) {
  const t = new Date(d);
  const day = t.getDay() || 7; // Sunday=7
  t.setHours(0,0,0,0);
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
      event: ev,                               // 'enter' | 'exit'
      enter: (ev === 'enter' || ev === 'exit') ? 0.5 : 0,  // вага для (enter+exit)/2
      exit:  ev === 'exit'  ? 1 : 0,
      gender: String(r['Gender'] || r['Стать'] || '-').trim(),
      duration: num(r['Duration_min'] || r['Хвилини'] || r['Duration']),
      ageGroup: String(r['Age_Group'] || r['AgeGroup'] || r['Вік'] || '').trim(),
    };
  }).filter(r => r.date && r.date >= TRAFFIC_START && (r.event === 'enter' || r.event === 'exit'));

  const records = applyPeriod(allRecords, opts, TRAFFIC_START);

  // Відвідування = (count(enter) + count(exit)) / 2. Кожен рядок = вага 0.5 в r.enter.
  const enterRecords = records;                                // всі події для per-time агрегації
  const exitRecords = records.filter(r => r.event === 'exit'); // для duration
  const enterOnly = records.filter(r => r.event === 'enter');  // для hourly/weekday — тільки час входу
  const totalVisitors = records.reduce((a, r) => a + r.enter, 0);

  // Gender/Age — беремо з КОЖНОГО рядка де є (enter або exit), вага = 0.5
  const genderMap = { Ч: 0, Ж: 0, '-': 0 };
  const ageGroupMap = new Map();
  const durations = [];

  records.forEach(r => {
    const g = r.gender || '-';
    const k = (g === 'Ч' || g === 'Ж') ? g : '-';
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
  const ageOrder = ['0-17','18-35','36-50','51+'];
  const ageGroups = [...ageGroupMap.entries()]
    .map(([name, v]) => ({ name, v }))
    .sort((a,b) => {
      const ia = ageOrder.indexOf(a.name), ib = ageOrder.indexOf(b.name);
      if (ia !== -1 && ib !== -1) return ia - ib;
      return a.name.localeCompare(b.name);
    });

  // Середня тривалість
  const avgDuration = durations.length ? durations.reduce((a,b)=>a+b,0) / durations.length : 0;

  // Гистограма тривалості (0-2, 2-5, 5-10, 10-20, 20+)
  const durationBuckets = [
    { label: '0-2 хв', min:0, max:2, v:0 },
    { label: '2-5 хв', min:2, max:5, v:0 },
    { label: '5-10 хв', min:5, max:10, v:0 },
    { label: '10-20 хв', min:10, max:20, v:0 },
    { label: '20+ хв', min:20, max:1e9, v:0 },
  ];
  durations.forEach(d => {
    const b = durationBuckets.find(b => d >= b.min && d < b.max);
    if (b) b.v += 1;
  });

  // Місяці — сума enter
  const monthMap = new Map();
  enterRecords.forEach(r => {
    const key = r.date.getFullYear() + '-' + r.date.getMonth();
    if (!monthMap.has(key)) {
      monthMap.set(key, { year:r.date.getFullYear(), mIdx:r.date.getMonth(), month:MONTH_UA[r.date.getMonth()], v:0 });
    }
    monthMap.get(key).v += r.enter;
  });
  const monthly = [...monthMap.values()].sort((a,b)=>(a.year-b.year)||(a.mIdx-b.mIdx));

  // По днях тижня (UA) — кількість Enter; неділю виключено (не працюємо)
  const dayMap = new Map();
  enterOnly.forEach(r => {
    if (r.date.getDay() === 0) return;
    const key = WEEK_UA[r.date.getDay()];
    dayMap.set(key, (dayMap.get(key) || 0) + 1);
  });
  const weekday = ['пн','вт','ср','чт','пт','сб']
    .map(d => ({ day:d, v: dayMap.get(d) || 0 }));

  // По годинах — СЕРЕДНЄ по дню тижня (кількість Enter / кількість унікальних дат)
  const hourAllByDow = {};
  for (let d = 0; d < 7; d++) hourAllByDow[d] = {};
  enterOnly.forEach(r => {
    const h = parseHour(r.time);
    if (h == null) return;
    const dow = r.date.getDay();
    const dk = dateKey(r.date);
    if (!hourAllByDow[dow][h]) hourAllByDow[dow][h] = { total: 0, dates: new Set() };
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
      const b = byHour[h] || { total: 0 };
      hours.push({ h, avg: b.total / numDates, total: b.total });
    }
    // В відсотках від загальної середньої
    const sum = hours.reduce((a,x)=>a+x.avg, 0) || 1;
    return hours.map(x => ({ ...x, pct: Math.round((x.avg/sum)*1000)/10 }));
  }

  // Для кожного дня тижня (пн-сб) + Усе (пн-пт середнє)
  const hourlyByDay = {};
  // пн-пт (dow 1..5) = 10-20
  [1,2,3,4,5].forEach(dow => { hourlyByDay[dow] = hoursFor(dow, 10, 20); });
  // сб (dow 6) = 8-14
  hourlyByDay[6] = hoursFor(6, 8, 14);
  // "Усе" — середнє по пн-пт (без сб і нд)
  const allWeekdayHours = [];
  for (let h = 10; h <= 20; h++) {
    let sumAvg = 0, sumPct = 0;
    [1,2,3,4,5].forEach(dow => {
      const row = hourlyByDay[dow].find(x => x.h === h);
      if (row) { sumAvg += row.avg; }
    });
    allWeekdayHours.push({ h, avg: sumAvg / 5 });
  }
  const totalAllAvg = allWeekdayHours.reduce((a,x)=>a+x.avg, 0) || 1;
  hourlyByDay['all'] = allWeekdayHours.map(x => ({ ...x, pct: Math.round((x.avg/totalAllAvg)*1000)/10 }));

  // Поточний тиждень (для Home)
  const latest = allRecords.length ? allRecords.reduce((a, r) => r.date > a ? r.date : a, new Date(0)) : new Date();
  const wkStart = weekStart(latest);
  const currentWeekEnters = allRecords.filter(r => r.enter > 0 && r.date >= wkStart && r.date <= latest);
  const currentWeek = {
    visitors: currentWeekEnters.reduce((a,r)=>a+r.enter, 0),
    range: currentWeekEnters.length ? { from: wkStart, to: latest } : null,
  };

  // Тенденція: останні 7 днів vs попередні 7 днів
  const last7End = new Date(latest); last7End.setHours(23,59,59,999);
  const last7Start = new Date(latest); last7Start.setHours(0,0,0,0); last7Start.setDate(last7Start.getDate() - 6);
  const prev7End = new Date(last7Start); prev7End.setDate(prev7End.getDate() - 1); prev7End.setHours(23,59,59,999);
  const prev7Start = new Date(prev7End); prev7Start.setDate(prev7Start.getDate() - 6); prev7Start.setHours(0,0,0,0);

  const allEnters = allRecords.filter(r => r.enter > 0);
  const last7Count = allEnters.filter(r => r.date >= last7Start && r.date <= last7End).reduce((a,r)=>a+r.enter, 0);
  const prev7Count = allEnters.filter(r => r.date >= prev7Start && r.date <= prev7End).reduce((a,r)=>a+r.enter, 0);
  const last7Trend = {
    current: last7Count,
    previous: prev7Count,
    deltaPct: prev7Count > 0 ? ((last7Count - prev7Count) / prev7Count) * 100 : null,
  };

  // Last 7 днів по днях
  const last7Map = new Map();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(last7End);
    d.setDate(d.getDate() - i);
    d.setHours(0,0,0,0);
    last7Map.set(dateKey(d), { date: new Date(d), v: 0 });
  }
  allEnters.forEach(r => {
    if (r.date < last7Start || r.date > last7End) return;
    const k = dateKey(r.date);
    if (last7Map.has(k)) last7Map.get(k).v += r.enter;
  });
  const last7Days = [...last7Map.values()].map(x => ({
    day: WEEK_UA[x.date.getDay()],
    dateStr: String(x.date.getDate()).padStart(2,'0')+'.'+String(x.date.getMonth()+1).padStart(2,'0'),
    v: x.v,
  }));

  // По тижнях (для тижневого графіка — 4/8/16/всі)
  const weekMap = new Map();
  allEnters.forEach(r => {
    const key = isoWeekKey(r.date);
    if (!weekMap.has(key)) {
      weekMap.set(key, { v: 0, start: weekStart(r.date) });
    }
    weekMap.get(key).v += r.enter;
  });
  const weekly = [...weekMap.entries()]
    .sort((a,b) => a[0].localeCompare(b[0]))
    .map(([,w]) => ({ v: w.v, start: w.start }));

  // По місяцях у людинах (за весь час)
  const monthlyAll = new Map();
  allEnters.forEach(r => {
    const k = r.date.getFullYear()+'-'+r.date.getMonth();
    if (!monthlyAll.has(k)) monthlyAll.set(k, { year:r.date.getFullYear(), mIdx:r.date.getMonth(), month:MONTH_UA[r.date.getMonth()], v:0 });
    monthlyAll.get(k).v += r.enter;
  });
  const monthlyAllTime = [...monthlyAll.values()].sort((a,b)=>(a.year-b.year)||(a.mIdx-b.mIdx));

  // Stats for entire dataset (за весь час — для age/gender %)
  const allGenderMap = { Ч: 0, Ж: 0, '-': 0 };
  const allAgeGroupMap = new Map();
  allEnters.forEach(r => {
    const g = r.gender || '-';
    const k = (g === 'Ч' || g === 'Ж') ? g : '-';
    allGenderMap[k] += r.enter;
    if (r.ageGroup) allAgeGroupMap.set(r.ageGroup, (allAgeGroupMap.get(r.ageGroup) || 0) + r.enter);
  });
  const allGenderTotal = allGenderMap.Ч + allGenderMap.Ж || 1; // без '-' у %
  const genderAllTime = [
    { name:'Чоловіки', v: allGenderMap.Ч, pct: Math.round((allGenderMap.Ч/allGenderTotal)*1000)/10 },
    { name:'Жінки',   v: allGenderMap.Ж, pct: Math.round((allGenderMap.Ж/allGenderTotal)*1000)/10 },
  ].filter(g => g.v > 0);

  const ageOrderAll = ['0-17','18-35','36-50','51+'];
  const ageAllTotal = [...allAgeGroupMap.values()].reduce((a,b)=>a+b,0) || 1;
  const ageGroupsAllTime = [...allAgeGroupMap.entries()]
    .map(([name, v]) => ({ name, v, pct: Math.round((v/ageAllTotal)*1000)/10 }))
    .sort((a,b) => {
      const ia = ageOrderAll.indexOf(a.name), ib = ageOrderAll.indexOf(b.name);
      if (ia !== -1 && ib !== -1) return ia - ib;
      return a.name.localeCompare(b.name);
    });

  const dates = enterRecords.map(r => r.date);
  const range = dates.length ? {
    from: new Date(Math.min(...dates)), to: new Date(Math.max(...dates)),
  } : null;

  // visitsByDate для Ratio — використовуємо ту саму вагу (0.5 на рядок), щоб сумма = totalVisitors
  const visitsByDate = {};
  enterRecords.forEach(r => {
    const k = dateKey(r.date);
    visitsByDate[k] = (visitsByDate[k] || 0) + r.enter;
  });

  // Peak hour: з hourlyByDay['all']
  let peakHour = null, peakV = 0;
  (hourlyByDay['all'] || []).forEach(x => { if (x.avg > peakV) { peakV = x.avg; peakHour = x.h; } });

  return {
    totalVisitors,
    gender: genderMap,
    ageGroups,
    avgDuration,
    durationBuckets,
    peakHour, peakHourVisits: Math.round(peakV * 10) / 10,
    monthly, weekday,
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
    ageGroupsAllTime,
  };
}

function emptyTraffic() {
  return {
    totalVisitors:0,
    gender:{Ч:0,Ж:0,'-':0}, ageGroups:[], avgDuration:0,
    durationBuckets:[], peakHour:null, peakHourVisits:0,
    monthly:[], weekday:[], hourly:[], hourlyByDay:{},
    visitsByDate:{}, range:null, count:0,
    currentWeek:{visitors:0, range:null},
    last7Trend:{ current:0, previous:0, deltaPct:null },
    last7Days:[], weekly:[], monthlyAllTime:[],
    genderAllTime:[], ageGroupsAllTime:[],
  };
}

// Ratio: клієнти / чеки, рахуємо з TRAFFIC_START (10.04.2026) — до цієї дати не було сенсора
function computeRatio(sales, traffic) {
  const trafficStartKey = dateKey(TRAFFIC_START);
  const dates = new Set([
    ...Object.keys(sales.receiptsByDate || {}),
    ...Object.keys(traffic.visitsByDate || {}),
  ]);
  let v = 0, r = 0;
  const daily = [];
  [...dates].sort().forEach(d => {
    if (d < trafficStartKey) return; // пропускаємо sales до TRAFFIC_START
    const visits = traffic.visitsByDate[d] || 0;
    const receipts = sales.receiptsByDate[d] || 0;
    v += visits; r += receipts;
    daily.push({ date: d, visits, receipts });
  });
  const ratio = r > 0 ? v / r : 0;       // клієнти на 1 чек
  const conversion = v > 0 ? (r / v) * 100 : 0;
  return { ratio, conversion, totalVisits: v, totalReceipts: r, daily };
}

// ── PUBLIC ──
window.AGGREGATOR = {
  aggregateSales,
  aggregateTraffic,
  computeRatio,
  MONTH_UA, MONTH_UA_FULL,
  WEEK_UA, WEEK_UA_FULL,
};
