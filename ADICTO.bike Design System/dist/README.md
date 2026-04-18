# ADICTO Reports — deploy kit

Готова до деплою статична збірка. Ніяких build-команд не треба.

## Файли
- `index.html` — мінімальний html без Babel
- `bundle.js` — весь React + логіка застосунку в одному файлі (~60 КБ)
- `vercel.json` — конфіг для Vercel (clean URLs, headers)

## Деплой на Vercel (найшвидший шлях)

### A. Через веб (drag & drop)
1. Зайти на https://vercel.com → New Project → Deploy.
2. Перетягнути всю папку `dist/` у поле "Import third-party project".
3. Framework preset: **Other**. Build command: залишити порожнім. Output directory: `.`
4. Deploy → через ~20 секунд отримаєте URL типу `adicto-reports-xxxx.vercel.app`.

### B. Через CLI (якщо буде звично)
```bash
npm i -g vercel
cd dist
vercel
# → follow prompts
```

## Підключення домену reports.adicto.bike

1. У Vercel → Project → **Settings → Domains** → Add.
2. Ввести `reports.adicto.bike` → Vercel покаже CNAME запис.
3. Зайти в DNS-провайдер домену `adicto.bike` (де купували: GoDaddy / Namecheap / Cloudflare / etc.).
4. Додати CNAME:
   - **Name / Host:** `reports`
   - **Value / Target:** `cname.vercel-dns.com` (точне значення дасть Vercel)
   - **TTL:** 3600 або Auto
5. Повернутись у Vercel → Verify. Через 1–10 хвилин (може до години) — домен запрацює.

Vercel автоматично видасть SSL-сертифікат.

## Оновлення застосунку

Коли щось змінюємо в проєкті тут — я перегенеровую `dist/`, ви заново завантажуєте архів і завантажуєте в Vercel (drag & drop заново створить новий deployment за той самий URL).

Якщо хочете автоматичне оновлення — треба підключити GitHub репо.

## Безпека

- Apps Script URL зашитий у `bundle.js`. Це нормально — він і так секретний лише через непередбачуваність URL.
- Щоб обмежити доступ — Vercel має Password Protection (Pro plan) або Cloudflare Pages має безкоштовний Zero Trust Access на 50 користувачів.
