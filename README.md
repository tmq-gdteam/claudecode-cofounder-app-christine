# cofounder.new — App UI Demo

Static deployment of the cofounder.new app UI prototype. Generated from `app-ui-source-pack.md`.

**Live URL:** Enabled via GitHub Pages — see Pages settings or the deploy workflow.

## Routes (hash-based)

- `/` — Homepage
- `/#/live` — Public Live Feed
- `/#/contact` — Contact page
- `/#/app` — Command Center (default app view)
- `/#/app/business/petpal` — Business Detail (try `greenbean`, `vendora`)
- `/#/app/chat` — Co-founder Chat
- `/#/app/activity` — Full Activity Log
- `/#/app/settings` — Settings (Account / Billing / Notifications / API / Integrations / Data)
- `/#/app/onboard` — 5-step Onboarding wizard

## Notes

- All data is **placeholder** (clearly labeled in source).
- Real platform metrics, founder testimonials, and pricing pending validation.
- Live feed simulates per-second elapsed timers and new-entry arrival.
- Approval Card Modal triggers from any decision card or "Approve & Send" action.
- No backend — actions are optimistic with toast feedback.

## Files

- `index.html` — markup + app shell
- `styles.css` — design tokens + component styles
- `app.js` — routing, state, interactions

## Local preview

```bash
python3 -m http.server 3000
# or
npx http-server -p 3000
```

Then open `http://localhost:3000`.
