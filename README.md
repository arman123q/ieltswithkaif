# IELTSwithKaif

Free IELTS practice website (inspired by the layout of mini-ielts.com,
with fully original content). Static frontend + Supabase backend.

- Public site: `index.html` (Reading/Listening tests, timer, auto-scoring,
  explanations, Writing, Speaking, study materials)
- Admin panel: `admin/` (login, full content management with forms)
- Database: run `supabase/schema.sql` once in Supabase SQL Editor
- Owner instructions: see `SETUP_GUIDE.md`

Runs in Local Mode (browser storage) until Supabase URL + anon key are
added in Admin → Connect database (or in `assets/config.js`).
