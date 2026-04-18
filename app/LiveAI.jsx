// ── Live AI: голосові аудіо-звіти ──
// Текст генерується через window.claude.complete() (вбудовано в artifacts)
// Озвучка — через проксі Apps Script (ELEVENLABS_API_KEY у ScriptProperties)
// Стиль: фірмові ADICTO-кольори (paper/ink, JetBrains Mono)

const ELEVEN_MODEL = 'eleven_multilingual_v2';

const VOICES = [
  { id: 'iP95p4xoKVk53GoZ742B', name: 'Chris',   desc: 'чол., розповідач' },
  { id: 'XrExE9yKIg1WjnnlVkGX', name: 'Matilda', desc: 'жін., тепла' },
  { id: 'cgSgspJ2msm6clMCkdW9', name: 'Jessica', desc: 'жін., впевнена' },
  { id: 'N2lVS1w4EtoT3dr4eOWO', name: 'Callum',  desc: 'чол., спокійний' },
  { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George',  desc: 'чол., подкастер' },
];

const { PALETTE: LA_P } = window.CHARTS;
const LA_MONO = '"JetBrains Mono", ui-monospace, monospace';

// ── утиліти ──
function fmtTime(s){
  if (!isFinite(s)) return '0:00';
  const m = Math.floor(s/60), ss = Math.floor(s%60).toString().padStart(2,'0');
  return `${m}:${ss}`;
}

// base64 → Blob URL
function b64ToBlobUrl(b64, mime){
  const bin = atob(b64);
  const len = bin.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i);
  return URL.createObjectURL(new Blob([bytes], { type: mime || 'audio/mpeg' }));
}

async function fetchTTS(text, voiceId){
  const apiUrl = window.ADICTO_CONFIG?.apiUrl;
  if (!apiUrl) throw new Error('ADICTO_CONFIG.apiUrl не налаштовано');

  const res = await fetch(apiUrl, {
    method: 'POST',
    // text/plain щоб уникнути CORS-preflight на Apps Script
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({
      action: 'ttsProxy',
      payload: { text, voiceId, modelId: ELEVEN_MODEL },
    }),
  });
  if (!res.ok) throw new Error('Proxy ' + res.status);
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || 'TTS proxy error');
  return b64ToBlobUrl(data.audioBase64, data.mime);
}

// ── Іконка Waveform для кнопки ──
function LiveAIIcon({ size = 14, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth="2.2" strokeLinecap="round">
      <path d="M3 12h2M7 8v8M11 5v14M15 9v6M19 11v2M21 12h0"/>
    </svg>
  );
}

// ── Sparkle-ромб (Gemini-style) ──
function LiveAISparkle({ size = 14, gradient = true }) {
  const gid = React.useId ? React.useId() : 'lai-sp-' + Math.random().toString(36).slice(2,7);
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      {gradient && (
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor="#ea4a4a"/>
            <stop offset="33%"  stopColor="#f5b738"/>
            <stop offset="66%"  stopColor="#3b82f6"/>
            <stop offset="100%" stopColor="#22c55e"/>
          </linearGradient>
        </defs>
      )}
      <path
        d="M12 2 C 12 8, 16 12, 22 12 C 16 12, 12 16, 12 22 C 12 16, 8 12, 2 12 C 8 12, 12 8, 12 2 Z"
        fill={gradient ? `url(#${gid})` : 'currentColor'}
      />
    </svg>
  );
}

// ── Кнопка Live AI (біля Export PDF) з переливом ──
function LiveAIButton({ onClick }) {
  // Унікальний клас — щоб keyframes не конфліктували при повторних монтажах
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => { setMounted(true); }, []);

  return (
    <>
      <style>{`
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
      `}</style>
      <button className="lai-btn" onClick={onClick}>
        <LiveAISparkle size={13}/>
        <span className="lai-btn-label">Live AI</span>
      </button>
    </>
  );
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
      lines.push(`- Останній місяць vs попередній: ${Math.round(last.v)} € vs ${Math.round(prev.v)} € (${prev.v ? Math.round((last.v-prev.v)/prev.v*100) : 0}%)`);
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
      lines.push(`- Останній тиждень: ${last.v} клієнтів vs ${prev.v} минулого (${prev.v ? Math.round((last.v-prev.v)/prev.v*100) : 0}%)`);
    }
    if (t.hourlyByDay && t.hourlyByDay.all) {
      const peak = [...t.hourlyByDay.all].sort((a,b)=>b.pct-a.pct)[0];
      if (peak) lines.push(`- Пікова година (усереднено пн-пт): ${peak.h}:00 (${peak.pct}% трафіку)`);
    }
    lines.push('');
  }

  if (context?.ratio) lines.push(`Коефіцієнт покупка/клієнт: ${(context.ratio * 100).toFixed(1)}%`);

  return lines.join('\n');
}

// ── Генерація тексту звіту через Claude ──
async function generateReportText({ depth, topics, dataSummary, compareWeeks }) {
  const lengthMap = {
    short:  'близько 80 слів (1 хв озвучки)',
    medium: 'близько 220 слів (2-3 хв озвучки)',
    long:   'близько 450 слів (3-4 хв озвучки)',
  };

  const topicParts = [];
  if (topics.sales)   topicParts.push('тенденції продажів (середній чек, покупці, динаміка, майстерня)');
  if (topics.traffic) topicParts.push('трафік (клієнти, тривалість, конверсія, пікові години)');
  if (topics.advice)  topicParts.push('2-3 конкретні поради: що посилити, на що звернути увагу, коли діяти');

  const system = `Ти бізнес-аналітик магазину велосипедів ADICTO.bike у Валенсії.
Твоя задача — розповісти власнику Василю про стан бізнесу голосом, як під час звіту.

ВИМОГИ:
- Пиши українською, природною розмовною мовою, але професійно.
- Текст буде озвучено TTS — пиши цифри словами (не "124", а "сто двадцять чотири"; не "€", а "євро"; не "%", а "відсотків").
- Уникай списків і маркерів — це аудіо, не візуал. Плавні переходи між думками.
- Обсяг: ${lengthMap[depth]}.
- Порівнюй поточний період з періодом ${compareWeeks} тижнів(а) тому.
- Починай зі слова "Звіт" або "Розпочнемо з…". Не вітайся.
- В кінці скажи "Дякую, на цьому звіт завершено" (тільки якщо обсяг medium/long).
- ТЕМИ ДЛЯ ЗВІТУ: ${topicParts.join('; ')}.
- Якщо даних по якійсь темі немає — пропусти її, не вигадуй.

Ось дані:
${dataSummary}`;

  const messages = [{ role: 'user', content: 'Склади аудіо-звіт за цими даними.' }];
  return await window.claude.complete({ system, messages });
}

// ── Модал Live AI ──
function LiveAIModal({ open, onClose, sales, traffic, ratio, period, screenName }) {
  const [topics, setTopics]     = React.useState({ sales: true, traffic: true, advice: false });
  const [depth, setDepth]       = React.useState('medium');
  const [rate, setRate]         = React.useState(1.0);
  const [voiceId, setVoiceId]   = React.useState(VOICES[0].id);
  const [compareN, setCompareN] = React.useState(1);

  const [phase, setPhase]       = React.useState('idle'); // idle | gen-text | gen-audio | ready | err
  const [statusMsg, setStatusMsg] = React.useState('');
  const [reportText, setReportText] = React.useState('');
  const [audioUrl, setAudioUrl] = React.useState(null);
  const [audioDur, setAudioDur] = React.useState(0);
  const [curTime, setCurTime]   = React.useState(0);
  const [playing, setPlaying]   = React.useState(false);

  // Chat
  const [chatHistory, setChatHistory] = React.useState([]);
  const [chatInput, setChatInput]     = React.useState('');
  const [chatBusy, setChatBusy]       = React.useState(false);

  const audioRef   = React.useRef(null);
  const chatLogRef = React.useRef(null);

  // Reset при закритті
  React.useEffect(() => {
    if (!open) {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      setPhase('idle'); setReportText(''); setAudioUrl(null);
      setChatHistory([]); setChatInput('');
    }
  }, [open]);

  const dataSummary = React.useMemo(() =>
    buildDataSummary(sales, traffic, { ratio, period, screenName })
  , [sales, traffic, ratio, period, screenName]);

  const anyTopic = topics.sales || topics.traffic || topics.advice;

  async function generate(){
    if (!anyTopic) { setStatusMsg('Оберіть хоча б одну тему'); setPhase('err'); return; }
    setPhase('gen-text'); setStatusMsg('Аналізую дані…');
    try {
      const text = await generateReportText({ depth, topics, dataSummary, compareWeeks: compareN });
      setReportText(text);
      setPhase('gen-audio'); setStatusMsg('Генерую голос…');
      const url = await fetchTTS(text, voiceId);
      setAudioUrl(url);
      setPhase('ready');
      // Auto-play
      setTimeout(() => {
        const a = new Audio(url);
        a.playbackRate = rate;
        audioRef.current = a;
        a.onloadedmetadata = () => setAudioDur(a.duration);
        a.ontimeupdate     = () => setCurTime(a.currentTime);
        a.onplay           = () => setPlaying(true);
        a.onpause          = () => setPlaying(false);
        a.onended          = () => { setPlaying(false); setCurTime(a.duration); };
        a.play().catch(()=>{});
      }, 50);
    } catch (e) {
      console.error(e);
      setStatusMsg('Помилка: ' + (e.message || e));
      setPhase('err');
    }
  }

  function togglePlay(){
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) a.play(); else a.pause();
  }

  function seek(e){
    const a = audioRef.current;
    if (!a || !a.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    a.currentTime = pct * a.duration;
  }

  function onRateChange(v){
    setRate(v);
    if (audioRef.current) audioRef.current.playbackRate = v;
  }

  async function sendChat(e){
    e.preventDefault();
    const q = chatInput.trim();
    if (!q || chatBusy) return;
    setChatInput('');
    const newHist = [...chatHistory, { role: 'user', text: q }];
    setChatHistory(newHist);
    setChatBusy(true);
    try {
      const system = `Ти бізнес-аналітик магазину велосипедів ADICTO.bike. Користувач щойно прослухав голосовий звіт. Відповідай коротко (2-3 речення), українською, конкретно, опираючись на дані.

ТЕКСТ ЗВІТУ:
${reportText}

ПОВНІ ДАНІ:
${dataSummary}`;
      const messages = [
        ...newHist.map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text })),
      ];
      const answer = await window.claude.complete({ system, messages });
      setChatHistory([...newHist, { role: 'bot', text: answer }]);
      // озвучка
      try {
        const url = await fetchTTS(answer, voiceId);
        const a = new Audio(url);
        a.playbackRate = rate;
        a.play();
      } catch(_) {}
    } catch(err) {
      setChatHistory([...newHist, { role: 'bot', text: 'Помилка: ' + err.message }]);
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
    position: 'fixed', inset: 0, zIndex: 100,
    background: 'rgba(26, 21, 16, 0.55)',
    display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    fontFamily: LA_MONO,
  };
  const sheetStyle = {
    width: '100%', maxWidth: 420,
    background: LA_P.paper, borderRadius: '20px 20px 0 0',
    maxHeight: 'calc(100vh - 20px)', overflow: 'hidden',
    display: 'flex', flexDirection: 'column',
    boxShadow: '0 -10px 40px rgba(0,0,0,0.2)',
  };
  const scrollArea = { overflowY: 'auto', padding: '4px 16px 16px', flex: 1 };
  const labelS = { fontSize: 9.5, letterSpacing: 1.2, textTransform: 'uppercase',
    color: 'rgb(92, 158, 219)', marginBottom: 8, fontWeight: 500 };
  const cardS = { background: '#fffbf0', border: `1px solid ${LA_P.line}`,
    borderRadius: 10, padding: 14, marginBottom: 10 };
  const groupS = (on) => ({
    background: on ? '#fffbf0' : '#ede5d0', border: `1px solid ${on ? LA_P.ink : LA_P.line}`,
    borderRadius: 10, padding: 12, cursor: 'pointer', marginBottom: 8,
    transition: 'all .15s',
  });

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={sheetStyle} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          padding: '14px 16px 10px', borderBottom: `1px solid ${LA_P.line}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: LA_P.paper,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <LiveAIIcon size={16} color={LA_P.ink}/>
            <div style={{ fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase',
              fontWeight: 600, color: LA_P.ink }}>Live AI · {screenName}</div>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', fontSize: 20, cursor: 'pointer',
            color: LA_P.ink, padding: 0, lineHeight: 1,
          }}>×</button>
        </div>

        <div style={scrollArea}>
          {phase === 'idle' || phase === 'err' ? (
            <>
              {/* Topics */}
              <div style={{ marginTop: 10 }}>
                <div style={labelS}>Що включити</div>
                {[
                  { key: 'sales',   title: 'Тенденція продажів',
                    desc: 'Середній чек · покупці · динаміка · майстерня' },
                  { key: 'traffic', title: 'Трафік',
                    desc: 'Клієнти · тривалість · конверсія · пікові години' },
                  { key: 'advice',  title: 'Поради',
                    desc: 'AI додасть 2-3 рекомендації на основі даних' },
                ].map(t => (
                  <div key={t.key} style={groupS(topics[t.key])}
                    onClick={() => setTopics({ ...topics, [t.key]: !topics[t.key] })}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 16, height: 16, border: `1.5px solid ${topics[t.key] ? LA_P.ink : LA_P.muted}`,
                        borderRadius: 3, background: topics[t.key] ? LA_P.ink : 'transparent',
                        display: 'grid', placeItems: 'center', flexShrink: 0,
                      }}>
                        {topics[t.key] && <svg width="10" height="10" viewBox="0 0 16 16" fill="none"
                          stroke="#f1ead8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 8l3 3 7-7"/></svg>}
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.8,
                        textTransform: 'uppercase', color: LA_P.ink }}>{t.title}</div>
                    </div>
                    <div style={{ fontSize: 10.5, color: '#5a5044',
                      paddingLeft: 26, marginTop: 4, lineHeight: 1.45 }}>{t.desc}</div>
                  </div>
                ))}
              </div>

              {/* Compare */}
              <div style={cardS}>
                <div style={labelS}>Порівняти з періодом</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button onClick={() => setCompareN(Math.max(1, compareN - 1))} style={stepperBtn()}>−</button>
                  <div style={{ flex: 1, textAlign: 'center', fontSize: 12 }}>
                    {compareN} тижд. тому
                  </div>
                  <button onClick={() => setCompareN(Math.min(12, compareN + 1))} style={stepperBtn()}>+</button>
                </div>
              </div>

              {/* Rate */}
              <div style={cardS}>
                <div style={labelS}>Швидкість · {rate.toFixed(1)}×</div>
                <input type="range" min="0.7" max="1.5" step="0.1" value={rate}
                  onChange={e => onRateChange(+e.target.value)}
                  style={{ width: '100%', accentColor: LA_P.ink }}/>
              </div>

              {/* Depth */}
              <div style={cardS}>
                <div style={labelS}>Глибина</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>
                  {[
                    { id: 'short',  t: 'Коротке', d: 'до 1 хв' },
                    { id: 'medium', t: 'Середнє', d: '1-3 хв' },
                    { id: 'long',   t: 'Глибоке', d: '3-4 хв' },
                  ].map(x => (
                    <button key={x.id} onClick={() => setDepth(x.id)} style={{
                      background: depth === x.id ? LA_P.ink : '#fffbf0',
                      color: depth === x.id ? LA_P.paper : LA_P.ink,
                      border: `1px solid ${depth === x.id ? LA_P.ink : LA_P.line}`,
                      borderRadius: 8, padding: '10px 4px', cursor: 'pointer',
                      fontFamily: LA_MONO, textAlign: 'left',
                    }}>
                      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.6,
                        textTransform: 'uppercase' }}>{x.t}</div>
                      <div style={{ fontSize: 9, opacity: 0.7, marginTop: 2 }}>{x.d}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Voice */}
              <div style={cardS}>
                <div style={labelS}>Голос</div>
                <select value={voiceId} onChange={e => setVoiceId(e.target.value)} style={{
                  width: '100%', background: '#fffbf0', border: `1px solid ${LA_P.line}`,
                  color: LA_P.ink, borderRadius: 8, padding: '10px 12px',
                  fontFamily: LA_MONO, fontSize: 12, cursor: 'pointer',
                }}>
                  {VOICES.map(v => (
                    <option key={v.id} value={v.id}>{v.name} — {v.desc}</option>
                  ))}
                </select>
              </div>

              {phase === 'err' && (
                <div style={{ fontSize: 10.5, color: LA_P.danger || '#c47862',
                  padding: '8px 12px', marginBottom: 10 }}>
                  {statusMsg}
                </div>
              )}

              <button onClick={generate} disabled={!anyTopic} style={{
                width: '100%', background: anyTopic ? LA_P.ink : '#bfb398',
                color: LA_P.paper, border: 'none', borderRadius: 100,
                padding: 14, fontFamily: LA_MONO, fontSize: 10.5,
                letterSpacing: 1.2, textTransform: 'uppercase', fontWeight: 600,
                cursor: anyTopic ? 'pointer' : 'not-allowed', marginTop: 6,
              }}>▸ Згенерувати та програти</button>
            </>
          ) : phase === 'gen-text' || phase === 'gen-audio' ? (
            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
              <div style={{ display: 'inline-block', width: 28, height: 28,
                border: `2.5px solid ${LA_P.line}`, borderTopColor: LA_P.ink,
                borderRadius: '50%', animation: 'spin 0.9s linear infinite',
                marginBottom: 16 }}/>
              <div style={{ fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase',
                color: LA_P.ink, fontWeight: 600 }}>{statusMsg}</div>
              <div style={{ fontSize: 10, color: '#5a5044', marginTop: 6 }}>
                {phase === 'gen-text' ? 'Формую звіт з ваших даних' : 'ElevenLabs ~ 3-8 секунд'}
              </div>
            </div>
          ) : (
            <>
              {/* Player */}
              <div style={{
                background: '#fffbf0', border: `1px solid ${LA_P.ink}`,
                borderRadius: 12, padding: 14, marginTop: 10, marginBottom: 10,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', background: LA_P.ink,
                    color: LA_P.paper, display: 'grid', placeItems: 'center', flexShrink: 0,
                    animation: playing ? 'pulse 1.4s infinite' : 'none',
                  }}><LiveAIIcon size={16} color={LA_P.paper}/></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.6,
                      textTransform: 'uppercase', color: LA_P.ink }}>Аудіо-звіт</div>
                    <div style={{ fontSize: 9.5, color: '#5a5044', marginTop: 2 }}>
                      {depth==='short'?'Коротке':depth==='medium'?'Середнє':'Глибоке'} · {rate.toFixed(1)}× · {fmtTime(audioDur)}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <button onClick={togglePlay} style={{
                    width: 40, height: 40, borderRadius: '50%', background: LA_P.ink,
                    border: 0, cursor: 'pointer', display: 'grid', placeItems: 'center',
                    color: LA_P.paper, flexShrink: 0,
                  }}>
                    {playing ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z"/></svg>
                    )}
                  </button>
                  <div onClick={seek} style={{
                    flex: 1, height: 4, background: '#ede5d0', borderRadius: 2,
                    cursor: 'pointer', overflow: 'hidden', border: `1px solid ${LA_P.line}`,
                  }}>
                    <div style={{
                      height: '100%', background: LA_P.ink,
                      width: audioDur ? `${(curTime/audioDur)*100}%` : '0%',
                      transition: 'width .1s',
                    }}/>
                  </div>
                  <div style={{ fontSize: 9.5, color: '#5a5044',
                    fontVariantNumeric: 'tabular-nums', minWidth: 70, textAlign: 'right' }}>
                    {fmtTime(curTime)}/{fmtTime(audioDur)}
                  </div>
                </div>

                <details>
                  <summary style={{ fontSize: 9.5, letterSpacing: 1, textTransform: 'uppercase',
                    color: '#8a7d69', cursor: 'pointer', listStyle: 'none' }}>
                    ▸ Показати текст
                  </summary>
                  <div style={{
                    background: '#ede5d0', border: `1px solid ${LA_P.line}`,
                    borderRadius: 8, padding: 10, marginTop: 8,
                    fontSize: 11, lineHeight: 1.55, color: '#1a1510',
                    maxHeight: 180, overflowY: 'auto', whiteSpace: 'pre-wrap',
                  }}>{reportText}</div>
                </details>
              </div>

              {/* Chat */}
              <div style={{ marginTop: 14 }}>
                <div style={labelS}>Запитати додатково</div>
                <div ref={chatLogRef} style={{
                  maxHeight: 200, overflowY: 'auto', display: 'flex',
                  flexDirection: 'column', gap: 6, marginBottom: 8,
                }}>
                  {chatHistory.map((m, i) => (
                    <div key={i} style={{
                      alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                      maxWidth: '85%',
                      background: m.role === 'user' ? LA_P.ink : '#fffbf0',
                      color: m.role === 'user' ? LA_P.paper : LA_P.ink,
                      border: m.role === 'bot' ? `1px solid ${LA_P.line}` : 'none',
                      borderRadius: 12,
                      borderBottomRightRadius: m.role === 'user' ? 3 : 12,
                      borderBottomLeftRadius: m.role === 'bot' ? 3 : 12,
                      padding: '8px 12px', fontSize: 11, lineHeight: 1.45,
                    }}>{m.text}</div>
                  ))}
                  {chatBusy && (
                    <div style={{ alignSelf: 'flex-start', color: '#8a7d69',
                      fontSize: 11, fontStyle: 'italic', padding: '8px 12px' }}>…</div>
                  )}
                </div>
                <form onSubmit={sendChat} style={{ display: 'flex', gap: 6 }}>
                  <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                    placeholder="Запитайте додатково…"
                    style={{
                      flex: 1, background: '#fffbf0', border: `1px solid ${LA_P.line}`,
                      color: LA_P.ink, borderRadius: 100, padding: '0 14px',
                      fontSize: 12, fontFamily: LA_MONO, minHeight: 40, outline: 'none',
                    }}/>
                  <button type="submit" disabled={chatBusy || !chatInput.trim()} style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: LA_P.ink, color: LA_P.paper, border: 0,
                    cursor: chatBusy ? 'wait' : 'pointer', fontSize: 16,
                    opacity: chatBusy || !chatInput.trim() ? 0.4 : 1,
                    fontFamily: LA_MONO,
                  }}>→</button>
                </form>
              </div>

              <button onClick={() => setPhase('idle')} style={{
                width: '100%', background: 'transparent', color: '#5a5044',
                border: `1px solid ${LA_P.line}`, borderRadius: 100,
                padding: 10, fontFamily: LA_MONO, fontSize: 9.5,
                letterSpacing: 1.2, textTransform: 'uppercase',
                cursor: 'pointer', marginTop: 12,
              }}>↻ Новий звіт</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function stepperBtn(){
  return {
    width: 34, height: 34, background: '#fffbf0',
    border: `1px solid ${LA_P.line}`, color: LA_P.ink,
    borderRadius: 6, fontSize: 16, cursor: 'pointer', fontFamily: LA_MONO,
  };
}

// Export
Object.assign(window, { LiveAIButton, LiveAIModal, LiveAIIcon });
