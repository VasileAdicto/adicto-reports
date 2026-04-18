// LoginGate — простий email+пароль gate.
// Credentials хардкодом (немає сервера). Для 2 користувачів цього достатньо.
// Зберігає сесію в localStorage після успішного входу.

const CREDENTIALS = [
  { email: 'vasile@adicto.bike',      password: 'Scalpel2012!' },
  { email: 'maximiva@gmail.com',      password: 'Tornado80!'   },
  { email: 'olegivanov578@gmail.com', password: 'Tornado80!'   },
];

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
      localStorage.setItem(SESSION_KEY, JSON.stringify({ email: s.email, loggedAt: Date.now() }));
    } catch {}
    return s;
  } catch { return null; }
}

function setSession(email) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({
    email,
    loggedAt: Date.now(),
  }));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function LoginScreen({ onLogin }) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState(null);
  const PALETTE = window.CHARTS.PALETTE;
  const MONO = '"JetBrains Mono", ui-monospace, monospace';

  const submit = (e) => {
    e.preventDefault();
    const em = email.trim().toLowerCase();
    const match = CREDENTIALS.find(c =>
      c.email.toLowerCase() === em && c.password === password
    );
    if (!match) {
      setError('Невірний email або пароль');
      return;
    }
    setSession(match.email);
    onLogin(match.email);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, fontFamily: MONO,
    }}>
      <form onSubmit={submit} style={{
        width: '100%', maxWidth: 320,
        background: '#fffbf0', border: `1px solid ${PALETTE.line}`,
        borderRadius: 16, padding: 28,
      }}>
        <div style={{
          fontSize: 9.5, letterSpacing: 1.2, textTransform: 'uppercase',
          color: PALETTE.muted, marginBottom: 6,
        }}>ADICTO.BIKE</div>
        <div style={{
          fontSize: 24, letterSpacing: -0.6, lineHeight: 1,
          textTransform: 'uppercase', color: PALETTE.ink, fontWeight: 600,
          marginBottom: 22,
        }}>REPORTS</div>

        <Label>Email</Label>
        <Field value={email} onChange={setEmail} type="email" autoFocus placeholder="name@adicto.bike"/>

        <Label>Password</Label>
        <Field value={password} onChange={setPassword} type="password" placeholder="••••••••"/>

        {error && (
          <div style={{
            fontSize: 10, color: '#c47862', letterSpacing: 0.4,
            marginTop: 10, padding: '8px 10px',
            background: '#fdf0eb', borderRadius: 8,
          }}>⚠ {error}</div>
        )}

        <button type="submit" style={{
          width: '100%', marginTop: 18, padding: '12px 16px',
          background: PALETTE.ink, color: '#f1ead8', border: 'none',
          borderRadius: 10, cursor: 'pointer',
          fontFamily: MONO, fontSize: 11, letterSpacing: 1.4,
          textTransform: 'uppercase', fontWeight: 500,
        }}>Увійти</button>

        <a href="mailto:vasile@adicto.bike?subject=Reports%20%E2%80%94%20%D0%B2%D1%96%D0%B4%D0%BD%D0%BE%D0%B2%D0%B8%D1%82%D0%B8%20%D0%BF%D0%B0%D1%80%D0%BE%D0%BB%D1%8C&body=%D0%9F%D1%80%D0%BE%D1%88%D1%83%20%D0%B2%D1%96%D0%B4%D0%BD%D0%BE%D0%B2%D0%B8%D1%82%D0%B8%20%D0%BF%D0%B0%D1%80%D0%BE%D0%BB%D1%8C%20%D0%B4%D0%BB%D1%8F%3A%20" style={{
          display: 'block', textAlign: 'center',
          marginTop: 14, fontSize: 10, letterSpacing: 0.6,
          color: PALETTE.subtle, textDecoration: 'underline',
          textUnderlineOffset: 3,
        }}>Забув пароль</a>

        <div style={{
          marginTop: 16, fontSize: 9, color: PALETTE.muted,
          letterSpacing: 0.4, textAlign: 'center', lineHeight: 1.5,
        }}>
          Сесія зберігається на цьому пристрої —<br/>не потрібно заходити повторно.
        </div>
      </form>
    </div>
  );
}

function Label({ children }) {
  const PALETTE = window.CHARTS.PALETTE;
  return <div style={{
    fontSize: 9, letterSpacing: 1, textTransform: 'uppercase',
    color: PALETTE.muted, marginTop: 14, marginBottom: 6,
  }}>{children}</div>;
}

function Field({ value, onChange, type, autoFocus, placeholder }) {
  const PALETTE = window.CHARTS.PALETTE;
  const MONO = '"JetBrains Mono", ui-monospace, monospace';
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      autoFocus={autoFocus}
      placeholder={placeholder}
      autoComplete={type === 'password' ? 'current-password' : 'email'}
      style={{
        width: '100%',
        padding: '10px 12px',
        background: '#f1ead8',
        border: `1px solid ${PALETTE.line}`,
        borderRadius: 8,
        fontFamily: MONO,
        fontSize: 13,
        color: PALETTE.ink,
        outline: 'none',
        boxSizing: 'border-box',
      }}
    />
  );
}

window.AUTH = { LoginScreen, checkSession, clearSession, CREDENTIALS };
