// MoreExtras — Нотатки + Файли + Підписка на автоматичні звіти

const { PALETTE: ME_PAL } = window.CHARTS;
const ME_MONO = '"JetBrains Mono", ui-monospace, monospace';

// ── NOTES ──────────────────────────────────────────────────────
const NOTES_KEY = 'adicto.notes.v1';

function loadNotes() {
  try { return JSON.parse(localStorage.getItem(NOTES_KEY) || '[]'); }
  catch { return []; }
}
function saveNotes(notes) {
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

function NotesSection({ userEmail }) {
  const [notes, setNotes] = React.useState(loadNotes);
  const [draft, setDraft] = React.useState('');
  const [editingId, setEditingId] = React.useState(null);
  const [editingText, setEditingText] = React.useState('');

  function addNote() {
    const text = draft.trim();
    if (!text) return;
    const next = [{ id: Date.now(), text, createdAt: new Date().toISOString(), author: userEmail }, ...notes];
    setNotes(next); saveNotes(next); setDraft('');
  }

  function deleteNote(id) {
    if (!confirm('Видалити цей запис?')) return;
    const next = notes.filter(n => n.id !== id);
    setNotes(next); saveNotes(next);
  }

  function startEdit(n) { setEditingId(n.id); setEditingText(n.text); }
  function saveEdit() {
    const next = notes.map(n => n.id === editingId ? { ...n, text: editingText, updatedAt: new Date().toISOString() } : n);
    setNotes(next); saveNotes(next); setEditingId(null); setEditingText('');
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <SectionTitle label="Нотатки" hint={`${notes.length}`}/>
      <div style={{
        background: '#fffbf0', border: `1px solid ${ME_PAL.line}`,
        borderRadius: 12, padding: 12,
      }}>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Напишіть нотатку — спостереження, плани, нагадування…"
          rows={3}
          style={{
            width: '100%', border: `1px solid ${ME_PAL.line}`, borderRadius: 8,
            padding: 10, fontFamily: ME_MONO, fontSize: 12, color: ME_PAL.ink,
            background: '#fffdf5', resize: 'vertical', outline: 'none',
            boxSizing: 'border-box',
          }}/>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
          <button onClick={addNote} disabled={!draft.trim()} style={btnPrimary(!draft.trim())}>
            ＋ Зберегти
          </button>
        </div>
      </div>

      <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {notes.length === 0 && (
          <div style={{
            padding: '24px 12px', textAlign: 'center', fontFamily: ME_MONO,
            fontSize: 10, color: ME_PAL.subtle, letterSpacing: 0.4,
            border: `1px dashed ${ME_PAL.line}`, borderRadius: 10,
          }}>Поки немає нотаток</div>
        )}
        {notes.map(n => (
          <div key={n.id} style={{
            background: '#fffbf0', border: `1px solid ${ME_PAL.line}`,
            borderRadius: 10, padding: 12,
          }}>
            {editingId === n.id ? (
              <>
                <textarea value={editingText} onChange={(e) => setEditingText(e.target.value)}
                  rows={3} style={{
                    width: '100%', border: `1px solid ${ME_PAL.line}`, borderRadius: 8,
                    padding: 8, fontFamily: ME_MONO, fontSize: 12, color: ME_PAL.ink,
                    background: '#fffdf5', resize: 'vertical', outline: 'none', boxSizing: 'border-box',
                  }}/>
                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', marginTop: 8 }}>
                  <button onClick={() => setEditingId(null)} style={btnGhost}>Скасувати</button>
                  <button onClick={saveEdit} style={btnPrimary(false)}>Зберегти</button>
                </div>
              </>
            ) : (
              <>
                <div style={{
                  fontFamily: ME_MONO, fontSize: 12, color: ME_PAL.ink,
                  whiteSpace: 'pre-wrap', lineHeight: 1.5,
                }}>{n.text}</div>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  marginTop: 8, paddingTop: 8, borderTop: `1px solid ${ME_PAL.line}`,
                }}>
                  <div style={{ fontFamily: ME_MONO, fontSize: 9, color: ME_PAL.muted, letterSpacing: 0.3 }}>
                    {fmtDateTime(n.createdAt)}{n.updatedAt ? ' · ред.' : ''}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => startEdit(n)} style={btnIcon}>✎</button>
                    <button onClick={() => deleteNote(n.id)} style={btnIconDanger}>✕</button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── FILES ──────────────────────────────────────────────────────
const FILES_KEY = 'adicto.files.v1';

function loadFiles() {
  try { return JSON.parse(localStorage.getItem(FILES_KEY) || '[]'); }
  catch { return []; }
}
function saveFiles(files) {
  try { localStorage.setItem(FILES_KEY, JSON.stringify(files)); return true; }
  catch (e) { alert('Не вистачає місця у сховищі. Видаліть старі файли.'); return false; }
}

// Ліміт — файли дозволяємо до 5 MB (щоб не зламати localStorage, він ~5-10 MB)
const FILE_MAX_MB = 3;

function FilesSection({ userEmail }) {
  const [files, setFiles] = React.useState(loadFiles);
  const inputRef = React.useRef(null);

  function handlePick(e) {
    const list = [...(e.target.files || [])];
    if (!list.length) return;
    const tasks = list.map(f => new Promise((resolve, reject) => {
      if (f.size > FILE_MAX_MB * 1024 * 1024) {
        alert(`"${f.name}" — більше ${FILE_MAX_MB} МБ. Пропускаю.`);
        resolve(null); return;
      }
      const reader = new FileReader();
      reader.onload = () => resolve({
        id: Date.now() + '-' + Math.random().toString(36).slice(2,7),
        name: f.name, size: f.size, type: f.type,
        dataUrl: reader.result,
        uploadedAt: new Date().toISOString(),
        uploadedBy: userEmail,
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
    a.href = f.dataUrl; a.download = f.name;
    document.body.appendChild(a); a.click(); a.remove();
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <SectionTitle label="Файли" hint={`${files.length} · до ${FILE_MAX_MB} МБ/файл`}/>
      <div style={{
        background: '#fffbf0', border: `1px dashed ${ME_PAL.line}`,
        borderRadius: 12, padding: 16, textAlign: 'center',
      }}>
        <input ref={inputRef} type="file" multiple onChange={handlePick} style={{ display: 'none' }}/>
        <button onClick={() => inputRef.current?.click()} style={btnPrimary(false)}>
          ↑ Завантажити файл
        </button>
        <div style={{
          fontFamily: ME_MONO, fontSize: 9, color: ME_PAL.subtle,
          letterSpacing: 0.3, marginTop: 8,
        }}>Зберігається локально на цьому пристрої</div>
      </div>

      {files.length > 0 && (
        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {files.map(f => (
            <div key={f.id} style={{
              background: '#fffbf0', border: `1px solid ${ME_PAL.line}`,
              borderRadius: 10, padding: '10px 12px',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div style={{ fontSize: 18, color: ME_PAL.muted }}>{fileIcon(f.type)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: ME_MONO, fontSize: 11, color: ME_PAL.ink,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{f.name}</div>
                <div style={{ fontFamily: ME_MONO, fontSize: 9, color: ME_PAL.muted, marginTop: 2 }}>
                  {fmtBytes(f.size)} · {fmtDateTime(f.uploadedAt)}
                </div>
              </div>
              <button onClick={() => download(f)} style={btnIcon} title="Завантажити">↓</button>
              <button onClick={() => remove(f.id)} style={btnIconDanger} title="Видалити">✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── SUBSCRIPTIONS ──────────────────────────────────────────────
const SUBS_KEY = 'adicto.subs.v1';
const REPORT_TYPES = [
  { id: 'traffic_w', label: 'Трафік — тижневий',   cadence: 'weekly'  },
  { id: 'traffic_m', label: 'Трафік — місячний',    cadence: 'monthly' },
  { id: 'sales_w',   label: 'Продажі — тижневі',    cadence: 'weekly'  },
  { id: 'sales_m',   label: 'Продажі — місячні',    cadence: 'monthly' },
];

function loadSubs() {
  try { return JSON.parse(localStorage.getItem(SUBS_KEY) || 'null') || { active: false, selected: [], email: '' }; }
  catch { return { active: false, selected: [], email: '' }; }
}
function saveSubs(s) { localStorage.setItem(SUBS_KEY, JSON.stringify(s)); }

function SubscriptionsSection({ userEmail }) {
  const [subs, setSubs] = React.useState(() => {
    const s = loadSubs();
    if (!s.email && userEmail) s.email = userEmail;
    return s;
  });
  const [draft, setDraft] = React.useState(subs);
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const dirty = JSON.stringify(draft) !== JSON.stringify(subs);

  function toggleReport(id) {
    const next = draft.selected.includes(id)
      ? draft.selected.filter(x => x !== id)
      : [...draft.selected, id];
    setDraft({ ...draft, selected: next });
  }

  function confirmSubscription() {
    const next = { ...draft, active: draft.selected.length > 0, confirmedAt: new Date().toISOString() };
    setSubs(next); saveSubs(next); setConfirmOpen(false);
  }

  function unsubscribe() {
    if (!confirm('Відписатись від усіх звітів?')) return;
    const next = { ...subs, active: false, selected: [] };
    setSubs(next); setDraft(next); saveSubs(next);
  }

  const statusColor = subs.active ? '#7aa875' : ME_PAL.muted;
  const statusLabel = subs.active ? 'Підписаний' : 'Не підписаний';

  return (
    <div style={{ marginBottom: 16 }}>
      <SectionTitle label="Автоматична відправка звітів"
        hint={(<span style={{ color: statusColor }}>● {statusLabel}</span>)}/>

      <div style={{
        background: '#fffbf0', border: `1px solid ${ME_PAL.line}`,
        borderRadius: 12, padding: 14,
      }}>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', marginBottom: 14 }}>
          <input
            type="checkbox"
            checked={draft.selected.length > 0}
            onChange={(e) => {
              if (!e.target.checked) setDraft({ ...draft, selected: [] });
              else if (draft.selected.length === 0) setDraft({ ...draft, selected: ['traffic_w'] });
            }}
            style={{ width: 18, height: 18, accentColor: ME_PAL.ink, marginTop: 1, flexShrink: 0 }}/>
          <div>
            <div style={{ fontFamily: ME_MONO, fontSize: 12, color: ME_PAL.ink, fontWeight: 500 }}>
              Автоматична відправка звітів
            </div>
            <div style={{ fontFamily: ME_MONO, fontSize: 10, color: ME_PAL.subtle, marginTop: 3, lineHeight: 1.5 }}>
              Тижневі — кожну неділю о 20:00.<br/>
              Місячні — 1-го числа наступного місяця.
            </div>
          </div>
        </label>

        <div style={{ borderTop: `1px solid ${ME_PAL.line}`, paddingTop: 14 }}>
          <div style={{ fontFamily: ME_MONO, fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: ME_PAL.muted, marginBottom: 10 }}>
            Обрати звіти
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {REPORT_TYPES.map(r => {
              const on = draft.selected.includes(r.id);
              return (
                <label key={r.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                  padding: '8px 10px', borderRadius: 8,
                  background: on ? '#f5ecd2' : 'transparent',
                  border: `1px solid ${on ? ME_PAL.ink : ME_PAL.line}`,
                }}>
                  <input type="checkbox" checked={on} onChange={() => toggleReport(r.id)}
                    style={{ width: 16, height: 16, accentColor: ME_PAL.ink, flexShrink: 0 }}/>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: ME_MONO, fontSize: 11, color: ME_PAL.ink }}>{r.label}</div>
                    <div style={{ fontFamily: ME_MONO, fontSize: 9, color: ME_PAL.muted, marginTop: 1, letterSpacing: 0.3 }}>
                      {r.cadence === 'weekly' ? 'щонеділі' : '1-го числа місяця'}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        <div style={{ borderTop: `1px solid ${ME_PAL.line}`, marginTop: 14, paddingTop: 14 }}>
          <div style={{ fontFamily: ME_MONO, fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: ME_PAL.muted, marginBottom: 6 }}>
            Email для відправки
          </div>
          <input value={draft.email || ''} onChange={(e) => setDraft({ ...draft, email: e.target.value })}
            placeholder="you@domain.com" style={{
              width: '100%', border: `1px solid ${ME_PAL.line}`, borderRadius: 8,
              padding: '8px 10px', fontFamily: ME_MONO, fontSize: 12, color: ME_PAL.ink,
              background: '#fffdf5', outline: 'none', boxSizing: 'border-box',
            }}/>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          {subs.active && (
            <button onClick={unsubscribe} style={btnGhostDanger}>
              Відписатися
            </button>
          )}
          <button onClick={() => setConfirmOpen(true)}
            disabled={!dirty || draft.selected.length === 0 || !draft.email}
            style={{ ...btnPrimary(!dirty || draft.selected.length === 0 || !draft.email), marginLeft: 'auto' }}>
            {subs.active ? 'Оновити підписку' : 'Підтвердити'}
          </button>
        </div>
      </div>

      {confirmOpen && (
        <ConfirmModal
          title="Підтвердити підписку"
          body={(
            <div>
              <div style={{ fontFamily: ME_MONO, fontSize: 11, color: ME_PAL.ink, marginBottom: 10 }}>
                Звіти будуть надсилатися на <b>{draft.email}</b>:
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, fontFamily: ME_MONO, fontSize: 11, color: ME_PAL.ink, lineHeight: 1.6 }}>
                {REPORT_TYPES.filter(r => draft.selected.includes(r.id)).map(r => (
                  <li key={r.id}>{r.label} <span style={{ color: ME_PAL.muted }}>— {r.cadence === 'weekly' ? 'щонеділі 20:00' : '1-го числа о 09:00'}</span></li>
                ))}
              </ul>
            </div>
          )}
          onConfirm={confirmSubscription}
          onCancel={() => setConfirmOpen(false)}/>
      )}
    </div>
  );
}

// ── HELPERS ────────────────────────────────────────────────────
function SectionTitle({ label, hint }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      margin: '18px 0 8px',
    }}>
      <div style={{ fontFamily: ME_MONO, fontSize: 10, letterSpacing: 1.3, textTransform: 'uppercase', color: ME_PAL.ink, fontWeight: 600 }}>{label}</div>
      {hint != null && <div style={{ fontFamily: ME_MONO, fontSize: 9, color: ME_PAL.muted, letterSpacing: 0.4 }}>{hint}</div>}
    </div>
  );
}

function fmtBytes(b) {
  if (b < 1024) return b + ' B';
  if (b < 1024*1024) return (b/1024).toFixed(1) + ' KB';
  return (b/1024/1024).toFixed(2) + ' MB';
}
function fmtDateTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const p = n => String(n).padStart(2, '0');
  return `${p(d.getDate())}.${p(d.getMonth()+1)}.${d.getFullYear()} · ${p(d.getHours())}:${p(d.getMinutes())}`;
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

function ConfirmModal({ title, body, onConfirm, onCancel }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(26,21,16,0.5)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      zIndex: 200, padding: 16,
    }} onClick={onCancel}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: '#fdf9ee', borderRadius: 16, padding: 20,
        maxWidth: 420, width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        <div style={{
          fontFamily: ME_MONO, fontSize: 11, letterSpacing: 1.2,
          textTransform: 'uppercase', color: ME_PAL.ink, fontWeight: 600,
          marginBottom: 12,
        }}>{title}</div>
        <div style={{ marginBottom: 16 }}>{body}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onCancel} style={{ ...btnGhost, flex: 1 }}>Скасувати</button>
          <button onClick={onConfirm} style={{ ...btnPrimary(false), flex: 1 }}>Підтвердити</button>
        </div>
      </div>
    </div>
  );
}

// ── BUTTON STYLES ──────────────────────────────────────────────
const btnBase = {
  fontFamily: ME_MONO, fontSize: 10, letterSpacing: 1,
  textTransform: 'uppercase', cursor: 'pointer', border: 'none',
  borderRadius: 100, padding: '9px 16px', transition: 'opacity .15s',
};
function btnPrimary(disabled) {
  return {
    ...btnBase,
    background: disabled ? '#d8cfb6' : ME_PAL.ink,
    color: '#f1ead8',
    opacity: disabled ? 0.5 : 1,
    cursor: disabled ? 'default' : 'pointer',
  };
}
const btnGhost = {
  ...btnBase, background: 'transparent',
  border: `1px solid ${ME_PAL.line}`, color: ME_PAL.ink, padding: '8px 15px',
};
const btnGhostDanger = {
  ...btnBase, background: 'transparent',
  border: `1px solid #d7a398`, color: '#a0472e', padding: '8px 15px',
};
const btnIcon = {
  background: 'transparent', border: `1px solid ${ME_PAL.line}`,
  borderRadius: 6, width: 28, height: 28, cursor: 'pointer',
  fontFamily: ME_MONO, fontSize: 12, color: ME_PAL.ink, padding: 0,
};
const btnIconDanger = { ...btnIcon, color: '#a0472e', borderColor: '#e0c4be' };

// ── EXPORTS ────────────────────────────────────────────────────
window.MORE_EXTRAS = { NotesSection, FilesSection, SubscriptionsSection };
