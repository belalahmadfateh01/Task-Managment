# گزارش یار — Dashboard (Next.js + TypeScript)

    npm install
    npm run dev        # http://localhost:3000
    npm run typecheck

- Styled with Tailwind CSS v4 (`app/globals.css`, utility classes in components).
- Period filter (daily / weekly / monthly / yearly / custom range) lives in the donut card header and drives the stat cards, chart and table.
- Row actions (تائید، بازخورد، بایگانی، حذف) are in the "..." menu.
- Demo data: `lib/data.ts` → replace `createMockReports` with your API call in `components/Dashboard.tsx`.

## Routes
| URL | File | Page |
|---|---|---|
| `/` | `app/page.tsx` | Welcome / start |
| `/login` | `app/login/page.tsx` | Login |
| `/dashboard` | `app/dashboard/page.tsx` | Dashboard |

Put your images in `public/imges/` (`lines.png`, `first.png`, `Vector.svg`, `Frame 9.svg`).
