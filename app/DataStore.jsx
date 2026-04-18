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
      payload,
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
    source: cached ? 'cache' : null,
  });

  const refresh = React.useCallback(async () => {
    if (!API_URL) {
      setState(s => ({ ...s, loading: false, error: 'API_URL not configured' }));
      return;
    }
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const res = await fetch(API_URL, { redirect: 'follow' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const payload = await res.json();
      saveCache(payload);
      setState({
        payload,
        savedAt: Date.now(),
        loading: false,
        error: null,
        source: 'live',
      });
    } catch (e) {
      console.error('Fetch failed', e);
      setState(s => ({
        ...s,
        loading: false,
        error: e.message || 'Fetch failed',
        // залишаємо кешований payload, якщо був
      }));
    }
  }, []);

  React.useEffect(() => {
    if (API_URL) refresh();
  }, [refresh]);

  return { ...state, refresh };
}

window.DATA_STORE = { useDataStore };
