// Screens — малює екрани з агрегованих даних.

const { ChartCard, BigStat, BarsH, BarsV, BarsV2, AreaChart, Donut, Legend, ValueToggle, fmt, fmtPct, PALETTE } = window.CHARTS;
const { MONTH_UA, MONTH_UA_FULL, WEEK_UA, WEEK_UA_FULL } = window.AGGREGATOR;

const SC_MONO = '"JetBrains Mono", ui-monospace, monospace';

function Section({ children }) {
  return <div style={{ padding: '0 16px' }}>{children}</div>;
}

// Справжнє лого ADICTO (чорна версія)
function AdictoLogo({ size = 18 }) {
  return (
    <img src="logo.png" width={size} height={size} alt="ADICTO"
      style={{ flexShrink: 0, display: 'block' }}/>
  );
}

function ScreenHeader({ title, subtitle, right }) {
  return (
    <div style={{ padding: '14px 16px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 10 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontFamily: SC_MONO, fontSize: 28, lineHeight: 1, letterSpacing: -0.8, color: PALETTE.ink, textTransform: 'uppercase', fontWeight: 600 }}>{title}</div>
          {subtitle && <div style={{ fontFamily: SC_MONO, fontSize: 10, color: PALETTE.subtle, marginTop: 6, letterSpacing: 0.4 }}>{subtitle}</div>}
        </div>
        {right}
      </div>
    </div>
  );
}

// ── Форматери ─────────────────────────
function fmtDate(d) {
  if (!d) return '';
  return String(d.getDate()).padStart(2,'0') + '.' + String(d.getMonth()+1).padStart(2,'0') + '.' + d.getFullYear();
}
function fmtDateShort(d) {
  if (!d) return '';
  return String(d.getDate()).padStart(2,'0') + '.' + String(d.getMonth()+1).padStart(2,'0');
}

// ── Inline Date Range Picker (по клацанню відкриваються input type="date") ──
function DateRangeInline({ range, customFrom, customTo, onCustomChange, onActivate, isActive }) {
  if (!range) return null;
  const from = isActive && customFrom ? new Date(customFrom) : range.from;
  const to = isActive && customTo ? new Date(customTo) : range.to;

  const [editing, setEditing] = React.useState(false);

  React.useEffect(() => { if (!isActive) setEditing(false); }, [isActive]);

  const dateStr = (d) => d ? d.toISOString().slice(0,10) : '';

  if (editing) {
    return (
      <div style={{
        display:'inline-flex', alignItems:'center', gap: 6,
        padding:'4px 10px', borderRadius: 100,
        background:'#fffbf0', border:`1px solid ${PALETTE.ink}`,
        fontFamily: SC_MONO, fontSize: 10, color: PALETTE.ink,
      }}>
        <input type="date" defaultValue={customFrom || dateStr(range.from)}
          onChange={e => { onActivate(); onCustomChange({ from: e.target.value, to: customTo || dateStr(range.to) }); }}
          style={{ border:'none', background:'transparent', fontFamily: SC_MONO, fontSize: 10, color: PALETTE.ink, padding: 0, outline:'none' }}/>
        <span style={{ color: PALETTE.muted }}>—</span>
        <input type="date" defaultValue={customTo || dateStr(range.to)}
          onChange={e => { onActivate(); onCustomChange({ from: customFrom || dateStr(range.from), to: e.target.value }); }}
          style={{ border:'none', background:'transparent', fontFamily: SC_MONO, fontSize: 10, color: PALETTE.ink, padding: 0, outline:'none' }}/>
        <button onClick={() => setEditing(false)} style={{
          background: 'none', border: 'none', cursor:'pointer', color: PALETTE.muted,
          fontSize: 14, padding: 0, marginLeft: 4, lineHeight: 1,
        }}>✓</button>
      </div>
    );
  }

  return (
    <button onClick={() => setEditing(true)} style={{
      display:'inline-flex', alignItems:'center', gap: 8,
      padding:'6px 12px', borderRadius: 100,
      background:'#fffbf0', border:`1px solid ${PALETTE.line}`,
      fontFamily: SC_MONO, fontSize: 9.5, letterSpacing: 0.8,
      textTransform: 'uppercase', color: PALETTE.ink,
      cursor:'pointer',
    }}>
      <span style={{ color: PALETTE.accent }}>€</span>
      {fmtDate(from)} — {fmtDate(to)}
      <span style={{ color: PALETTE.muted, marginLeft: 4, fontSize: 11 }}>✎</span>
    </button>
  );
}

// ── Period Selector (7/30/90/Рік/Все) ──
function PeriodSelector({ current, onChange }) {
  const opts = [
    { id: '7',   label: '7 дн' },
    { id: '30',  label: '30 дн' },
    { id: '90',  label: '90 дн' },
    { id: '365', label: 'Рік' },
    { id: 'all', label: 'Все' },
  ];
  return (
    <div style={{ display: 'flex', background: '#ede5d0', padding: 3, borderRadius: 10, gap: 2 }}>
      {opts.map(o => {
        const active = current === o.id;
        return (
          <button key={o.id} onClick={() => onChange(o.id)} style={{
            flex: 1, padding: '7px 4px', borderRadius: 8,
            background: active ? '#fffbf0' : 'transparent',
            border: 'none', cursor: 'pointer',
            fontFamily: SC_MONO, fontSize: 9.5, letterSpacing: 0.6,
            textTransform: 'uppercase',
            color: active ? PALETTE.ink : PALETTE.muted,
            fontWeight: active ? 500 : 400,
            boxShadow: active ? '0 1px 2px rgba(0,0,0,0.04)' : 'none',
          }}>{o.label}</button>
        );
      })}
    </div>
  );
}

// ── Button: Export PDF ──
function ExportPdfButton({ label = 'ЕКСПОРТ PDF', onClick }) {
  return (
    <button onClick={onClick} style={{
      display:'inline-flex', alignItems:'center', gap: 5,
      padding:'7px 12px', borderRadius: 100,
      background:PALETTE.ink, border:`1px solid ${PALETTE.ink}`,
      fontFamily: SC_MONO, fontSize: 9.5, letterSpacing: 0.8,
      textTransform: 'uppercase', color: '#f1ead8',
      cursor:'pointer', fontWeight: 500,
    }}>
      <span>⇣</span>{label}
    </button>
  );
}

// ── Chart Comments (yellow dot + composer + thread) ──
const COMMENTS_KEY = 'adicto.comments.v1';
const ADMIN_EMAIL = 'vasile@adicto.bike';

function loadComments() {
  try { return JSON.parse(localStorage.getItem(COMMENTS_KEY) || '{}'); }
  catch { return {}; }
}
function saveComments(all) {
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(all));
}

function CommentThread({ chartId, userEmail }) {
  const [all, setAll] = React.useState(() => loadComments());
  const [draft, setDraft] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const items = all[chartId] || [];
  const isAdmin = userEmail === ADMIN_EMAIL;

  const add = () => {
    if (!draft.trim()) return;
    const next = { ...all };
    next[chartId] = [...(next[chartId] || []), {
      id: 'c_' + Date.now(),
      author: userEmail || '—',
      text: draft.trim(),
      at: Date.now(),
    }];
    saveComments(next); setAll(next); setDraft('');
  };
  const reply = (idx) => {
    const t = prompt('Ваша відповідь:');
    if (!t || !t.trim()) return;
    const next = { ...all };
    next[chartId] = next[chartId].map((c, i) => i === idx
      ? { ...c, replies: [...(c.replies || []), { author: userEmail || '—', text: t.trim(), at: Date.now() }] }
      : c);
    saveComments(next); setAll(next);
  };
  const del = (idx) => {
    if (!confirm('Видалити коментар?')) return;
    const next = { ...all };
    next[chartId] = next[chartId].filter((_, i) => i !== idx);
    saveComments(next); setAll(next);
  };

  return (
    <div style={{ position:'relative' }}>
      <button onClick={() => setOpen(!open)}
        title={items.length ? `${items.length} коментарів` : 'Додати коментар'}
        style={{
          position:'absolute', top:-4, right:-4, zIndex:2,
          width: 22, height: 22, borderRadius: 11,
          background: items.length ? '#f5c843' : 'transparent',
          border: `1.5px solid ${items.length ? '#c9a521' : PALETTE.line}`,
          cursor:'pointer', padding:0,
          fontFamily: SC_MONO, fontSize: 10, fontWeight: 600,
          color: items.length ? '#1a1510' : PALETTE.muted,
          display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow: items.length ? '0 0 0 3px rgba(245,200,67,0.25)' : 'none',
        }}>{items.length || '+'}</button>
      {open && (
        <div style={{
          position:'absolute', top: 24, right: -4, width: 300, zIndex: 20,
          background: '#fffbf0', border: `1px solid ${PALETTE.line}`,
          borderRadius: 12, boxShadow: '0 12px 40px rgba(0,0,0,0.14)',
          padding: 12, fontFamily: SC_MONO, fontSize: 11, color: PALETTE.ink,
        }}>
          <div style={{ fontSize: 9, letterSpacing: 1.2, textTransform:'uppercase', color: PALETTE.muted, marginBottom: 10, display:'flex', justifyContent:'space-between' }}>
            <span>Коментарі</span>
            <button onClick={() => setOpen(false)} style={{ border:'none', background:'none', cursor:'pointer', color: PALETTE.muted, padding: 0, fontSize: 13 }}>×</button>
          </div>
          {items.length === 0 && <div style={{ fontSize: 10, color: PALETTE.subtle, paddingBottom: 10 }}>Коментарів ще немає.</div>}
          {items.map((c, i) => (
            <div key={c.id} style={{ borderTop: i > 0 ? `1px solid ${PALETTE.line}` : 'none', paddingTop: i > 0 ? 10 : 0, paddingBottom: 10 }}>
              <div style={{ fontSize: 9, color: PALETTE.muted, marginBottom: 2, display:'flex', justifyContent:'space-between' }}>
                <span>{c.author}</span>
                <span>{new Date(c.at).toLocaleDateString('uk-UA')}</span>
              </div>
              <div style={{ fontSize: 11, lineHeight: 1.4 }}>{c.text}</div>
              {(c.replies || []).map((r, ri) => (
                <div key={ri} style={{ marginTop: 6, marginLeft: 12, paddingLeft: 10, borderLeft: `2px solid ${PALETTE.line}` }}>
                  <div style={{ fontSize: 9, color: PALETTE.muted }}>{r.author}</div>
                  <div style={{ fontSize: 10.5, lineHeight: 1.4 }}>{r.text}</div>
                </div>
              ))}
              <div style={{ display:'flex', gap: 10, marginTop: 6 }}>
                <button onClick={() => reply(i)} style={{ border:'none', background:'none', cursor:'pointer', padding: 0, fontFamily: SC_MONO, fontSize: 9, color: PALETTE.accent, textDecoration:'underline' }}>Відповісти</button>
                {(c.author === userEmail || isAdmin) && (
                  <button onClick={() => del(i)} style={{ border:'none', background:'none', cursor:'pointer', padding: 0, fontFamily: SC_MONO, fontSize: 9, color: '#c47862', textDecoration:'underline' }}>Видалити</button>
                )}
              </div>
            </div>
          ))}
          <div style={{ marginTop: 8 }}>
            <textarea value={draft} onChange={e => setDraft(e.target.value)} rows={2}
              placeholder="Ваш коментар…"
              style={{
                width:'100%', boxSizing:'border-box', resize:'none',
                fontFamily: SC_MONO, fontSize: 11, padding: 8,
                background:'#f1ead8', border:`1px solid ${PALETTE.line}`, borderRadius: 8,
                color: PALETTE.ink, outline:'none',
              }}/>
            <button onClick={add} disabled={!draft.trim()} style={{
              marginTop: 6, padding: '6px 12px',
              background: PALETTE.ink, color: '#f1ead8',
              border: 'none', borderRadius: 6, cursor: draft.trim() ? 'pointer' : 'default',
              fontFamily: SC_MONO, fontSize: 9, letterSpacing: 1, textTransform: 'uppercase',
              opacity: draft.trim() ? 1 : 0.4,
            }}>Додати</button>
          </div>
        </div>
      )}
    </div>
  );
}

// Обгортка для ChartCard що додає CommentThread
function CommentableCard({ id, title, subtitle, right, children, userEmail }) {
  return (
    <div style={{ position:'relative' }}>
      <CommentThread chartId={id} userEmail={userEmail}/>
      <ChartCard title={title} subtitle={subtitle} right={right}>{children}</ChartCard>
    </div>
  );
}

// ── HOME ───────────────────────────────
function HomeScreen({ sales, traffic, accent, updated, source, userEmail }) {
  const cw = sales.currentWeek || { gross:0, profit:0, count:0, docs:0, range:null };
  const ww = sales.workshopWeek || { gross:0, profit:0, count:0, docs:0 };
  const tw = traffic.currentWeek || { visitors:0, range:null };
  const trend = traffic.last7Trend || { deltaPct: null };
  const wkRange = cw.range ? `${fmtDateShort(cw.range.from)} — ${fmtDateShort(cw.range.to)}` : '';

  return (
    <div style={{ paddingBottom: 120 }}>
      <ScreenHeader title="Overview" subtitle={updatedLabel(updated, source)}/>
      <Section>

        <CommentableCard id="home-sales" userEmail={userEmail}
          title="Продажі · Поточний тиждень" subtitle={wkRange}>
          <div style={{ display:'flex', gap: 8, marginBottom: 8 }}>
            <BigStat label="З ПДВ" value={fmt(cw.gross)} accent={accent}/>
            <BigStat label="Прибуток" value={fmt(cw.profit)}/>
          </div>
          <div style={{ display:'flex', gap: 8 }}>
            <BigStat label="Середній чек" value={cw.avgCheck ? fmt(Math.round(cw.avgCheck)) : '—'} hint={cw.docs ? `${cw.docs} чеків` : ''}/>
            <BigStat label="Операцій" value={fmt(cw.docs)}/>
          </div>
        </CommentableCard>

        <CommentableCard id="home-workshop" userEmail={userEmail}
          title={(<span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign:-2, marginRight:6}}>
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>Майстерня · Поточний тиждень
          </span>)} subtitle="категорія: Ремонт">
          <div style={{ display:'flex', gap: 8 }}>
            <BigStat label="З ПДВ" value={fmt(ww.gross)} accent={accent}/>
            <BigStat label="Заказів" value={fmt(ww.docs)}/>
          </div>
        </CommentableCard>

        <CommentableCard id="home-traffic" userEmail={userEmail}
          title="Трафік · Останній тиждень" subtitle={wkRange}>
          <div style={{ display:'flex', gap: 8 }}>
            <BigStat label="Клієнти" value={fmt(tw.visitors)} accent={accent}
              hint={trend.deltaPct != null ? `${trend.deltaPct >= 0 ? '▲' : '▼'} ${Math.abs(trend.deltaPct).toFixed(0)}% vs минулий тиждень` : ''}/>
            <BigStat label="Операцій" value={fmt(cw.docs)}/>
          </div>
        </CommentableCard>

        {sales.monthly.length > 0 && (
          <CommentableCard id="home-monthly" userEmail={userEmail}
            title="Динаміка" subtitle="Продажі по місяцям">
            <BarsV data={sales.monthly} keys={['total']} colors={[PALETTE.ink]} labelKey="month" h={160} showY/>
          </CommentableCard>
        )}
      </Section>
    </div>
  );
}

// ── Перемикач "Максимальний чек" ─────────────────────────
function MaxCheckSelector({ current, onChange }) {
  const opts = [
    { v: Infinity, label: 'Усі' },
    { v: 5000, label: '< 5к' },
    { v: 2000, label: '< 2к' },
  ];
  return (
    <div style={{ display:'inline-flex', gap: 0, border:`1px solid ${PALETTE.rule}`, borderRadius: 999, padding: 2, background: PALETTE.paperSub }}>
      {opts.map(o => {
        const active = current === o.v;
        return (
          <button key={String(o.v)} onClick={() => onChange(o.v)}
            title={o.v === Infinity ? 'Без фільтра по сумі чека' : `Виключити чеки ≥ ${o.v.toLocaleString('uk-UA')}`}
            style={{
              border:'none', background: active ? PALETTE.ink : 'transparent',
              color: active ? PALETTE.paper : PALETTE.muted,
              fontFamily: SC_MONO, fontSize: 10, fontWeight: 500,
              padding:'4px 10px', borderRadius: 999, cursor:'pointer', letterSpacing:'0.02em',
            }}>{o.label}</button>
        );
      })}
    </div>
  );
}

// ── SALES ───────────────────────────────────────────────
function SalesScreen({ data, accent, period, onPeriodChange, customRange, onCustomChange, maxCheck, onMaxCheckChange, userEmail, onExportPdf }) {
  const s = data;
  const [catMode, setCatMode] = React.useState('pct'); // % за замовченням
  const [payMode, setPayMode] = React.useState('pct');
  const [dowMode, setDowMode] = React.useState('pct');

  const totalGross = s.categories.reduce((a, c) => a + c.value, 0) || 1;

  return (
    <div style={{ paddingBottom: 120 }}>
      <ScreenHeader title="Sales" subtitle={`${s.count} операцій · фінансові звіти`}/>
      <Section>
        <div style={{ display:'flex', flexWrap:'wrap', gap: 8, alignItems:'center', marginBottom: 10 }}>
          <DateRangeInline range={s.range}
            customFrom={customRange?.from} customTo={customRange?.to}
            onCustomChange={onCustomChange}
            onActivate={() => onPeriodChange('custom')}
            isActive={period === 'custom'}/>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
            <ExportPdfButton onClick={onExportPdf}/>
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <PeriodSelector current={period === 'custom' ? 'all' : period} onChange={onPeriodChange}/>
        </div>
      </Section>

      {!s.count && (
        <Section>
          <div style={{
            margin: '8px 0 24px',
            padding: '40px 20px', textAlign: 'center',
            border: `1px dashed ${PALETTE.line}`, borderRadius: 12,
            background: '#fffbf0',
            fontFamily: SC_MONO, fontSize: 11, color: PALETTE.subtle, lineHeight: 1.6,
          }}>
            Немає записів за обраний період.<br/>
            Змініть дати або оберіть інший період.
          </div>
        </Section>
      )}

      {s.count > 0 && <>

      {/* БІГ-ЦИФРИ */}
      <Section>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <BigStat label="З ПДВ" value={fmt(s.totals.gross)} accent={accent}/>
          <BigStat label="Прибуток" value={fmt(s.totals.profit)} accent={accent}/>
        </div>
        <div style={{ marginBottom: 10 }}>
          <BigStat
            label="Середній чек"
            value={s.avgCheck ? fmt(Math.round(s.avgCheck)) : '—'}
            hint={s.avgCheckDocs ? `${fmt(s.avgCheckDocs)} чеків${maxCheck !== Infinity ? ` · < ${maxCheck.toLocaleString('uk-UA')}` : ''}` : ''}
            extra={onMaxCheckChange ? <MaxCheckSelector current={maxCheck} onChange={onMaxCheckChange}/> : null}
          />
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <BigStat label="Без ПДВ" value={fmt(s.totals.sale)}/>
          <BigStat label="Закупка" value={fmt(s.totals.cost)}/>
        </div>
      </Section>

      {/* МІСЯЦІ */}
      {s.monthly.length > 1 && (
        <Section>
          <CommentableCard id="sales-monthly" userEmail={userEmail}
            title="Продажі по місяцям" subtitle={`${s.monthly.length} міс · з ПДВ`}>
            <BarsV data={s.monthly} keys={['total']} colors={[PALETTE.ink]} labelKey="month" h={180} showY/>
          </CommentableCard>
        </Section>
      )}

      {/* КАТЕГОРІЇ */}
      {s.categories.length > 0 && (
        <Section>
          <CommentableCard id="sales-categories" userEmail={userEmail}
            title="Продажі по категоріям"
            subtitle={catMode === 'uah' ? 'З ПДВ' : '% від загального обороту'}
            right={<ValueToggle options={[{id:'pct',label:'%'},{id:'uah',label:'€'}]} value={catMode} onChange={setCatMode}/>}>
            <BarsH
              data={s.categories.slice(0, 12).map(c => ({
                name: c.name,
                value: catMode === 'pct' ? Math.round((c.value/totalGross)*1000)/10 : Math.round(c.value),
              }))}
              color={PALETTE.ink}
              showPct={catMode === 'pct'}
            />
          </CommentableCard>
        </Section>
      )}

      {/* ДНІ ТИЖНЯ */}
      {s.weekByDay.length > 0 && (
        <Section>
          <CommentableCard id="sales-weekday" userEmail={userEmail}
            title="По днях тижня" subtitle={dowMode === 'pct' ? '% від обороту (без неділі, чеки ≤1000€)' : 'З ПДВ (без неділі, чеки ≤1000€)'}
            right={<ValueToggle options={[{id:'pct',label:'%'},{id:'uah',label:'€'}]} value={dowMode} onChange={setDowMode}/>}>
            <BarsV
              data={s.weekByDay.map(d => ({ day: d.day, v: dowMode === 'pct' ? d.pct : d.v }))}
              keys={['v']} colors={[accent]} labelKey="day" h={160}
              showY isPct={dowMode === 'pct'}/>
          </CommentableCard>
        </Section>
      )}

      {/* ТАЙМЛАЙН */}
      {s.timeline.length > 2 && (
        <Section>
          <CommentableCard id="sales-timeline" userEmail={userEmail}
            title="Тижнева динаміка" subtitle={`${s.timeline.length} тижнів`}>
            <AreaChart data={s.timeline} color={PALETTE.ink} h={160} monthTicks showY showPeaks/>
          </CommentableCard>
        </Section>
      )}

      {/* ТОП ТОВАРИ */}
      {s.topProducts.length > 0 && (
        <Section>
          <CommentableCard id="sales-top" userEmail={userEmail}
            title="Топ товарів" subtitle="За виручкою з ПДВ, топ 10">
            <div>
              {s.topProducts.slice(0, 10).map((p, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'baseline', padding: '8px 0',
                  borderBottom: i < 9 ? `1px solid ${PALETTE.line}` : 'none',
                  fontFamily: SC_MONO,
                }}>
                  <div style={{ width: 22, color: PALETTE.muted, fontSize: 10 }}>{String(i+1).padStart(2,'0')}</div>
                  <div style={{ flex: 1, fontSize: 11, color: PALETTE.ink, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', paddingRight: 8 }}>
                    {p.name}
                  </div>
                  <div style={{ fontSize: 11.5, color: PALETTE.ink, fontWeight: 500 }}>{fmt(p.gross)}</div>
                </div>
              ))}
            </div>
          </CommentableCard>
        </Section>
      )}

      {/* ПЛАТЕЖІ */}
      {s.payments.length > 0 && (
        <Section>
          <CommentableCard id="sales-payments" userEmail={userEmail}
            title="Способи оплати" subtitle={payMode === 'pct' ? '% розподіл' : 'З ПДВ'}
            right={<ValueToggle options={[{id:'pct',label:'%'},{id:'uah',label:'€'}]} value={payMode} onChange={setPayMode}/>}>
            <BarsH
              data={s.payments.map(p => ({
                name: p.name,
                value: payMode === 'pct' ? p.pct : p.v,
              }))}
              color={accent}
              showPct={payMode === 'pct'}/>
          </CommentableCard>
        </Section>
      )}
      </>}
    </div>
  );
}

// ── TRAFFIC ────────────────────────────────────────────
function TrafficScreen({ data, accent, period, onPeriodChange, customRange, onCustomChange, ratio, userEmail, onExportPdf }) {
  const t = data;
  const [selectedDow, setSelectedDow] = React.useState('all'); // 'all' | 1..6
  const [hourMode, setHourMode] = React.useState('pct'); // 'pct' | 'count'
  const [weeklyRange, setWeeklyRange] = React.useState('4'); // '4','8','16','all'

  const dowOptions = [
    { id: 1, label: 'Пн' }, { id: 2, label: 'Вт' }, { id: 3, label: 'Ср' },
    { id: 4, label: 'Чт' }, { id: 5, label: 'Пт' }, { id: 6, label: 'Сб' },
    { id: 'all', label: 'Усе (пн-пт)' },
  ];
  const hourlyData = (t.hourlyByDay?.[selectedDow] || []).map(x => ({
    month: String(x.h).padStart(2,'0'),
    v: hourMode === 'pct' ? (x.pct || 0) : Math.round((x.avg || 0) * 10) / 10,
  }));

  const weeklyCount = weeklyRange === 'all' ? t.weekly.length : parseInt(weeklyRange, 10);
  const weeklyData = t.weekly.slice(-weeklyCount);

  const trend = t.last7Trend || { deltaPct: null };

  return (
    <div style={{ paddingBottom: 120 }}>
      <ScreenHeader title="Traffic" subtitle="Статистика відвідуваності"/>
      <Section>
        <div style={{ display:'flex', flexWrap:'wrap', gap: 8, alignItems:'center', marginBottom: 10 }}>
          <DateRangeInline range={t.range}
            customFrom={customRange?.from} customTo={customRange?.to}
            onCustomChange={onCustomChange}
            onActivate={() => onPeriodChange('custom')}
            isActive={period === 'custom'}/>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
            <ExportPdfButton onClick={onExportPdf}/>
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <PeriodSelector current={period === 'custom' ? 'all' : period} onChange={onPeriodChange}/>
        </div>
      </Section>

      {!t.count && (
        <Section>
          <div style={{
            margin: '8px 0 24px',
            padding: '40px 20px', textAlign: 'center',
            border: `1px dashed ${PALETTE.line}`, borderRadius: 12,
            background: '#fffbf0',
            fontFamily: SC_MONO, fontSize: 11, color: PALETTE.subtle, lineHeight: 1.6,
          }}>
            Немає записів за обраний період.<br/>
            Змініть дати або оберіть інший період.
          </div>
        </Section>
      )}

      {t.count > 0 && <>

      <Section>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <BigStat label="Усього клієнтів" value={fmt(t.totalVisitors)} accent={accent}
            hint={t.currentWeek?.range ? `останній тижд: ${fmt(t.currentWeek.visitors)}` : ''}/>
          <BigStat label="Пік години"
            value={t.peakHour != null ? (String(t.peakHour).padStart(2,'0') + ':00') : '—'}
            hint={t.peakHourVisits ? `~${t.peakHourVisits} клієнтів (в середньому)` : 'в середньому за період'}/>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <BigStat label="Середня тривалість" value={t.avgDuration ? t.avgDuration.toFixed(1) : '—'} hint={t.avgDuration ? 'хвилин' : ''}/>
          {ratio && ratio.totalVisits > 0
            ? <BigStat label="Коефіцієнт" value={ratio.ratio ? ratio.ratio.toFixed(1) : '—'} hint="клієнтів на 1 чек"/>
            : <div style={{ flex: 1 }}/>}
        </div>
      </Section>

      {/* 1. Відвідуваність по місяцям */}
      {t.monthlyAllTime.length > 0 && (
        <Section>
          <CommentableCard id="traffic-monthly" userEmail={userEmail}
            title="Відвідуваність по місяцям" subtitle="людей, за весь час">
            <BarsV data={t.monthlyAllTime} keys={['v']} colors={[PALETTE.ink]} labelKey="month" h={180} showY/>
          </CommentableCard>
        </Section>
      )}

      {/* 2. Останні 7 днів (завжди) */}
      {t.last7Days.length > 0 && (
        <Section>
          <CommentableCard id="traffic-last7" userEmail={userEmail}
            title="Відвідуваність · Останні 7 днів"
            subtitle={trend.deltaPct != null ? `${trend.deltaPct >= 0 ? '▲' : '▼'} ${Math.abs(trend.deltaPct).toFixed(0)}% vs попередній тиждень` : 'за останні 7 днів'}>
            <BarsV data={t.last7Days} keys={['v']} colors={[accent]} labelKey="day" h={160} showY/>
          </CommentableCard>
        </Section>
      )}

      {/* 3. Коефіцієнт */}
      {ratio && ratio.totalReceipts > 0 && (
        <Section>
          <CommentableCard id="traffic-ratio" userEmail={userEmail}
            title="Коефіцієнт" subtitle="клієнтів на 1 чек (за увесь період)">
            <div style={{ padding: '16px 0' }}>
              <div style={{ fontFamily: SC_MONO, fontSize: 42, lineHeight: 1, color: PALETTE.ink, fontWeight: 600 }}>
                {ratio.ratio.toFixed(1)}
              </div>
              <div style={{ fontFamily: SC_MONO, fontSize: 10, color: PALETTE.muted, marginTop: 8, letterSpacing: 0.5 }}>
                {fmt(ratio.totalVisits)} відвідувачів · {fmt(ratio.totalReceipts)} чеків
              </div>
            </div>
          </CommentableCard>
        </Section>
      )}

      {/* 4. По днях тижня */}
      {t.weekday.some(d => d.v > 0) && (
        <Section>
          <CommentableCard id="traffic-weekday" userEmail={userEmail}
            title="По днях тижня" subtitle="клієнтів усього">
            <BarsV data={t.weekday.filter(d => d.v > 0)} keys={['v']} colors={[accent]} labelKey="day" h={160} showY/>
          </CommentableCard>
        </Section>
      )}

      {/* 5. Середнє по годинах */}
      <Section>
          <CommentableCard id="traffic-hourly" userEmail={userEmail}
            title="В середньому по годинах"
            subtitle={`${selectedDow === 'all' ? 'пн-пт' : WEEK_UA_FULL[selectedDow]} · ${hourMode === 'pct' ? '% клієнтів' : 'клієнтів на день'} по годинах`}>
            <div style={{ marginBottom: 12, overflowX:'auto' }}>
              <div style={{ display:'flex', gap: 4, minWidth: 'max-content' }}>
                {dowOptions.map(o => {
                  const active = selectedDow == o.id;
                  return (
                    <button key={o.id} onClick={() => setSelectedDow(o.id)} style={{
                      padding:'5px 10px', borderRadius: 100, whiteSpace:'nowrap',
                      background: active ? PALETTE.ink : 'transparent',
                      border: `1px solid ${active ? PALETTE.ink : PALETTE.line}`,
                      color: active ? '#f1ead8' : PALETTE.ink,
                      fontFamily: SC_MONO, fontSize: 9, letterSpacing: 0.6,
                      textTransform: 'uppercase', cursor:'pointer',
                    }}>{o.label}</button>
                  );
                })}
              </div>
            </div>
            <div style={{ marginBottom: 10 }}>
              <div style={{ display:'inline-flex', gap: 0, border:`1px solid ${PALETTE.rule}`, borderRadius: 999, padding: 2, background: PALETTE.paperSub }}>
                {[{v:'pct', l:'%'}, {v:'count', l:'клієнтів'}].map(o => {
                  const active = hourMode === o.v;
                  return (
                    <button key={o.v} onClick={() => setHourMode(o.v)} style={{
                      border:'none', background: active ? PALETTE.ink : 'transparent',
                      color: active ? PALETTE.paper : PALETTE.muted,
                      fontFamily: SC_MONO, fontSize: 10, fontWeight: 500,
                      padding:'4px 12px', borderRadius: 999, cursor:'pointer', letterSpacing:'0.02em',
                    }}>{o.l}</button>
                  );
                })}
              </div>
            </div>
            <BarsV data={hourlyData} keys={['v']} colors={[PALETTE.ink]} labelKey="month" h={160} showY isPct={hourMode === 'pct'}/>
          </CommentableCard>
        </Section>

      {/* 6. Вік % */}
      {t.ageGroupsAllTime.length > 0 && (
        <Section>
          <CommentableCard id="traffic-age" userEmail={userEmail}
            title="По віку" subtitle="% за весь період">
            <BarsH data={t.ageGroupsAllTime.map(a => ({ name: a.name, value: a.pct }))}
              color={PALETTE.olive} showPct/>
          </CommentableCard>
        </Section>
      )}

      {/* 7. Стать % */}
      {t.genderAllTime.length > 0 && (
        <Section>
          <CommentableCard id="traffic-gender" userEmail={userEmail}
            title="По статі" subtitle="% за весь період (без «невідомо»)">
            <BarsH data={t.genderAllTime.map(g => ({ name: g.name, value: g.pct }))}
              color={accent} showPct/>
          </CommentableCard>
        </Section>
      )}

      {/* 8. По тижнях */}
      {t.weekly.length > 1 && (
        <Section>
          <CommentableCard id="traffic-weekly" userEmail={userEmail}
            title="Відвідуваність по тижнях"
            subtitle="клієнтів"
            right={
              <div style={{ display:'flex', gap: 2, background: '#ede5d0', padding: 2, borderRadius: 8 }}>
                {[['4','4т'],['8','8т'],['16','16т'],['all','Все']].map(([id, label]) => {
                  const active = weeklyRange === id;
                  return (
                    <button key={id} onClick={() => setWeeklyRange(id)} style={{
                      padding:'4px 8px', borderRadius: 6,
                      background: active ? '#fffbf0' : 'transparent',
                      border: 'none', cursor: 'pointer',
                      fontFamily: SC_MONO, fontSize: 9, letterSpacing: 0.6,
                      color: active ? PALETTE.ink : PALETTE.muted,
                    }}>{label}</button>
                  );
                })}
              </div>
            }>
            <AreaChart data={weeklyData} color={PALETTE.ink} h={180} monthTicks showY showPeaks/>
          </CommentableCard>
        </Section>
      )}
      </>}
    </div>
  );
}

function EmptyState({ msg }) {
  return (
    <div style={{
      padding: '60px 20px', textAlign: 'center',
      fontFamily: SC_MONO, color: PALETTE.muted, fontSize: 12,
    }}>{msg}</div>
  );
}

// ── INFO ──────────────────────────────
function CopyButton({ text }) {
  const [copied, setCopied] = React.useState(false);
  const click = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta);
      ta.select(); document.execCommand('copy'); ta.remove();
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    }
  };
  return (
    <button onClick={click} style={{
      background: copied ? PALETTE.ink : 'transparent',
      color: copied ? '#f1ead8' : PALETTE.ink,
      border: `1px solid ${copied ? PALETTE.ink : PALETTE.line}`,
      borderRadius: 6, padding: '4px 10px',
      fontFamily: SC_MONO, fontSize: 9, letterSpacing: 0.8,
      textTransform: 'uppercase', cursor: 'pointer',
      flexShrink: 0,
    }}>{copied ? '✓ COPIED' : 'COPY'}</button>
  );
}

function InfoRow({ label, value, copyText }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      gap: 10, padding: '12px 14px', borderBottom: `1px solid ${PALETTE.line}`,
    }}>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontFamily: SC_MONO, fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: PALETTE.muted, marginBottom: 4 }}>{label}</div>
        <div style={{ fontFamily: SC_MONO, fontSize: 11, color: PALETTE.ink, lineHeight: 1.5, wordBreak: 'break-word' }}>{value}</div>
      </div>
      {copyText && <CopyButton text={copyText}/>}
    </div>
  );
}

function InfoCard({ title, children, copyAllText }) {
  return (
    <div style={{
      background: '#fffbf0', border: `1px solid ${PALETTE.line}`,
      borderRadius: 12, marginBottom: 14, overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 14px', background: '#f5ecd2',
      }}>
        <div style={{ fontFamily: SC_MONO, fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', color: PALETTE.ink, fontWeight: 600 }}>{title}</div>
        {copyAllText && <CopyButton text={copyAllText}/>}
      </div>
      <div>{children}</div>
    </div>
  );
}

function InfoScreen() {
  const companyFull = 'KATAFOT S.L.\nBizkaia Kalea 63, 20800 Zarautz, Spain\nNIF: B56990062\nVAT: ESB56990062';
  const ibanValue = 'ES12 0049 5287 7123 1636 9268';
  const shippingFull = 'KATAFOT SL (Adicto.Bike)\nCapusceac Vasile\nBizkaia Kalea 63, 20800, Zarautz, Gipuzkoa, Spain\n+34 674 262 622\nhello@adicto.bike';

  return (
    <div style={{ paddingBottom: 120 }}>
      <ScreenHeader title="Info" subtitle="Company details"/>
      <Section>
        <InfoCard title="Company" copyAllText={companyFull}>
          <InfoRow label="Legal name" value="KATAFOT S.L."/>
          <InfoRow label="Address" value="Bizkaia Kalea 63, 20800 Zarautz, Spain"/>
          <InfoRow label="NIF (CIF)" value="B56990062"/>
          <InfoRow label="VAT" value="ESB56990062" copyText="ESB56990062"/>
        </InfoCard>

        <InfoCard title="Bank — Banco Santander">
          <InfoRow label="IBAN" value={ibanValue} copyText={ibanValue}/>
          <InfoRow label="SWIFT" value="BSCHESMM" copyText="BSCHESMM"/>
        </InfoCard>

        <InfoCard title="Shipping address" copyAllText={shippingFull}>
          <InfoRow label="Recipient" value="KATAFOT SL (Adicto.Bike)"/>
          <InfoRow label="Contact" value="Capusceac Vasile"/>
          <InfoRow label="Address" value="Bizkaia Kalea 63, 20800, Zarautz, Gipuzkoa, Spain"/>
          <InfoRow label="Phone" value="+34 674 262 622" copyText="+34674262622"/>
          <InfoRow label="Email" value="hello@adicto.bike" copyText="hello@adicto.bike"/>
        </InfoCard>
      </Section>
    </div>
  );
}

// ── MORE ─────────────────
function MoreScreen({ userEmail, onLogout }) {
  const { NotesSection, FilesSection, SubscriptionsSection } = window.MORE_EXTRAS || {};

  return (
    <div style={{ paddingBottom: 120 }}>
      <ScreenHeader title="More" subtitle="Нотатки, файли та підписки"/>
      <Section>
        {NotesSection && <NotesSection userEmail={userEmail}/>}
        {FilesSection && <FilesSection userEmail={userEmail}/>}
        {SubscriptionsSection && <SubscriptionsSection userEmail={userEmail}/>}

        <div style={{
          marginTop: 14, background: '#fffbf0',
          border: `1px solid ${PALETTE.line}`, borderRadius: 12, padding: '12px 14px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <div style={{ fontFamily: SC_MONO, fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: PALETTE.muted }}>Користувач</div>
            <div style={{ fontFamily: SC_MONO, fontSize: 11, color: PALETTE.ink, marginTop: 2 }}>{userEmail || '—'}</div>
          </div>
          <button onClick={onLogout} style={{
            background: 'transparent', border: `1px solid ${PALETTE.line}`,
            borderRadius: 8, padding: '8px 14px', cursor: 'pointer',
            fontFamily: SC_MONO, fontSize: 9.5, letterSpacing: 1.2,
            textTransform: 'uppercase', color: PALETTE.ink,
          }}>↤ Вийти</button>
        </div>
      </Section>
    </div>
  );
}

function updatedLabel(iso, source) {
  if (!iso) return source === 'cache' ? 'Кеш (офлайн)' : '—';
  const d = new Date(iso);
  const pad = n => String(n).padStart(2, '0');
  const src = source === 'cache' ? ' · кеш' : '';
  return `Оновлено ${pad(d.getHours())}:${pad(d.getMinutes())} ${pad(d.getDate())}.${pad(d.getMonth()+1)}${src}`;
}

function LastUpdatedFooter({ updated, source, savedAt, onRefresh, loading }) {
  const relAgo = (iso) => {
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
  return (
    <div style={{
      padding: '20px 16px 8px',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      fontFamily: SC_MONO, fontSize: 9, letterSpacing: 1,
      textTransform: 'uppercase', color: PALETTE.muted,
    }}>
      <div style={{ width: 5, height: 5, borderRadius: 3, background: dotColor }}/>
      <span>{source === 'cache' ? 'Кеш · ' : ''}{ago || '—'}</span>
      <span style={{ color: PALETTE.line }}>/</span>
      <button onClick={onRefresh} disabled={loading} style={{
        background: 'none', border: 'none', padding: 0, cursor: loading ? 'default' : 'pointer',
        fontFamily: SC_MONO, fontSize: 9, letterSpacing: 1, textTransform: 'uppercase',
        color: loading ? PALETTE.muted : PALETTE.ink, opacity: loading ? 0.4 : 1,
        textDecoration: 'underline', textUnderlineOffset: 3,
      }}>{loading ? 'Оновлення…' : 'Оновити'}</button>
    </div>
  );
}

window.SCREENS = {
  SalesScreen, TrafficScreen, HomeScreen, InfoScreen, MoreScreen,
  EmptyState, ScreenHeader, LastUpdatedFooter, PeriodSelector, AdictoLogo,
};
