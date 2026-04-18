// PullToRefresh — обгортка зверху над скролом.
// Показує індикатор при тязі вниз від верху. При достатній відстані — виконує onRefresh().
//
// Не перехоплює скрол усередині — якщо scrollTop > 0, жест ігнорується.
// Використовує pointer events для iOS/Android consistency.

const PTR_THRESHOLD = 70;  // px — нижче цього порога скасовує
const PTR_MAX = 110;       // px — візуальний максимум розтягу
const PTR_DAMPING = 0.5;   // нелінійне розтягування

function PullToRefresh({ onRefresh, loading, children }) {
  const ref = React.useRef(null);
  const [pull, setPull] = React.useState(0); // 0..PTR_MAX
  const [armed, setArmed] = React.useState(false); // чи буде тригеритись при release
  const startY = React.useRef(null);
  const active = React.useRef(false);

  const onStart = React.useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    // Тільки якщо ми у самому верху скрола
    const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
    if (scrollTop > 0) return;
    startY.current = e.touches ? e.touches[0].clientY : e.clientY;
    active.current = true;
  }, []);

  const onMove = React.useCallback((e) => {
    if (!active.current || startY.current == null) return;
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    const raw = y - startY.current;
    if (raw <= 0) { setPull(0); setArmed(false); return; }
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
        setPull(0); setArmed(false);
      });
    } else {
      setPull(0); setArmed(false);
    }
    startY.current = null;
  }, [armed, loading, onRefresh]);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const opt = { passive: false };
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

  return (
    <div ref={ref} style={{ position: 'relative', minHeight: '100%' }}>
      <PTRIndicator pull={pull} armed={armed} spin={spin}/>
      <div style={{
        transform: `translateY(${pull}px)`,
        transition: active.current ? 'none' : 'transform 0.25s cubic-bezier(0.22,1,0.36,1)',
      }}>
        {children}
      </div>
    </div>
  );
}

function PTRIndicator({ pull, armed, spin }) {
  const opacity = Math.min(1, pull / 40);
  const rot = spin ? null : (pull / PTR_THRESHOLD) * 180;
  const PALETTE = window.CHARTS.PALETTE;
  return (
    <div style={{
      position: 'absolute',
      top: -50, left: 0, right: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: 50, pointerEvents: 'none',
      opacity,
      transform: `translateY(${pull}px)`,
      transition: 'none',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        fontFamily: '"JetBrains Mono", ui-monospace, monospace',
        fontSize: 9, letterSpacing: 1, textTransform: 'uppercase',
        color: armed ? PALETTE.ink : PALETTE.muted,
      }}>
        {spin ? (
          <div style={{
            width: 12, height: 12, border: `1.5px solid ${PALETTE.line}`,
            borderTopColor: PALETTE.ink, borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}/>
        ) : (
          <div style={{
            display: 'inline-block', width: 14, height: 14,
            transform: `rotate(${rot}deg)`,
            transition: 'transform 0.05s linear',
          }}>
            <svg viewBox="0 0 14 14" width="14" height="14">
              <path d="M7 2 L7 11 M4 8 L7 11 L10 8" fill="none"
                stroke={armed ? PALETTE.ink : PALETTE.muted} strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}
        <span>{spin ? 'Оновлення' : armed ? 'Відпустіть' : 'Потягніть'}</span>
      </div>
    </div>
  );
}

window.PTR = { PullToRefresh };
