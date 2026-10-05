# hive-scope

Vanilla HTML/JS Hive blockchain explorer (no frameworks, no build step, no backend). Live at https://hivescope.xyz, repo `rzazo24/hive-scope`.

## Structure

- `index.html`: markup, all CSS (in a `<style>` block), inline SVG logo, data-URI favicon.
- `app.js`: all logic. Everything is fetched client-side from public Hive RPC nodes via `fetchHiveNodes()`, which fails over across the `HIVE_NODES` array.
- `assets/`: README screenshot. `CHANGELOG.md`: Keep a Changelog format, versions tagged `vX.Y.Z`.

## Run / check

- No build or test suite. Serve statically (`python3 -m http.server` or `npx serve .`) or open `index.html`.
- Syntax check: `node --check app.js`.
- There is no headless browser in the sandbox, so UI changes can't be verified visually. Say so instead of claiming they were tested. Logic touching the Hive API can be checked with small Node scripts (Node has global `fetch`) against `https://api.hive.blog`.

## Conventions

- Code comments are in English. Keep them short; only explain non-obvious WHY.
- i18n: `translations = { es, en }` plus `data-i18n` attributes. English is the default (`currentLang = 'en'`). Every new user-facing string needs a key in BOTH languages, and static HTML text must match the English default to avoid a flash of untranslated content.
- `applyTranslations()` overwrites `innerHTML` of every `[data-i18n]` element, so never put dynamic values inside an element that has `data-i18n`.
- `toggleLanguage()` re-runs `loadUserData()`, so the user section is fully re-rendered on language change.
- Numbers go through `formatNumber()` (forced en-US formatting). VESTS to HP goes through `vestsToHP()`. Escape any API-provided text with `escapeHtml()`.
- Input font-size must stay at an absolute `16px` (iOS Safari zooms on focus below that).

## Hive API gotchas

- `get_account_history` accepts server-side filtering via `operation_filter_low/high` as the 4th/5th params (bit 51 = author_reward, 52 = curation_reward, 64 = producer_reward). Already used in `fetchRewardHistorySince()`; filtering is far faster than scanning full history.
- The account object's `posting_rewards` / `curation_rewards` counters are stale on modern Hive; don't use them for totals.
- Rewards breakdown is limited to the last 30 days with a page cap, and flagged as approximate when the cap is hit. Don't reintroduce full-history pagination (it took ~1 minute).

## Workflow preferences

- Before editing files, state what will change and why.
- Don't commit or push without the user's confirmation; commit and push are separate confirmations.
- The user writes in Spanish; reply in Spanish.
- For releases: update `CHANGELOG.md`, commit, create an annotated tag (`git tag -a vX.Y.Z`), and push the tag explicitly.
