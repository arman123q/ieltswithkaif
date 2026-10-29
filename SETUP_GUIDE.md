# IELTSwithKaif — Setup & Owner's Guide (no coding needed)

Your website is built. This guide takes you from the project files to a
live website with a real database, using only free services. Everything
is done by tapping buttons — no code.

You will create 3 free accounts (about 15 minutes total):
1. **Supabase** — your database + admin login (your content lives here)
2. **GitHub** — stores the website files (source control + backup)
3. **Cloudflare** — hosts the website (fast, free, gives your web address)

---

## STEP 1 — Database (Supabase)

1. Open **supabase.com** → tap **Start your project** → sign up free.
2. Tap **New project**. Name: `ieltswithkaif`. Set a **database password**
   — save it in your phone's notes app. Choose the region nearest your
   students. Tap **Create new project** and wait ~2 minutes.
3. In the left menu tap **SQL Editor** → **New query**. Open the file
   `supabase/schema.sql` from your project ZIP, copy ALL of it, paste it
   in, and tap **Run**. You should see "Success".
4. Left menu → **Authentication** → **Users** → **Add user**. Enter YOUR
   email and a strong password, tap **Create user**.
   → This email + password is your **admin login**. Keep it private.
5. Left menu → **Project Settings** → **API**. Note these two values:
   - **Project URL** (looks like `https://abcd1234.supabase.co`)
   - **anon public** key (a long key starting with `eyJ…`)
   You will paste them into the admin panel in Step 3.
   ⚠️ Never share the **service_role** key with anyone or put it on a website.

Free-tier honesty: 500 MB database + 1 GB file storage — enough for
hundreds of tests and audio files. If the site has no activity for about
a week the project may pause; the next visit wakes it up. There are no
automatic backups on the free plan — see "Backups" below.

## STEP 2 — Put the website online (Cloudflare Pages)

**Option A — via GitHub (recommended, best for future updates)**
1. When Muse gives you the GitHub connect link in chat, tap it and
   authorise. Muse will create a repository named `ieltswithkaif`
   containing all website files and tell you when it is done.
2. Open **cloudflare.com** → sign up free → in the left menu tap
   **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
3. Connect your GitHub account, choose the `ieltswithkaif` repository.
4. Build settings: Framework preset **None**, Build command **(leave
   empty)**, Build output directory **/** → tap **Save and Deploy**.
5. After ~1 minute Cloudflare shows your address, like
   `https://ieltswithkaif.pages.dev`. That is your public website.
   The admin panel is the same address + `/admin`.

**Option B — direct upload (no GitHub)**
1. cloudflare.com → **Workers & Pages** → **Create** → **Pages** →
   **Upload assets**. Name the project `ieltswithkaif`.
2. Upload the project ZIP Muse gave you (unzip it first if your phone
   asks, and upload the folder contents). Tap **Deploy**.
   Note: with this option, updating the site means uploading again —
   Option A is easier long-term.

## STEP 3 — Connect the website to your database

1. Open **your-site-address/admin** in your phone browser.
2. You will see the login page in "Local Mode". Log in with any password
   (the first password you type becomes your temporary local password).
3. In the admin menu tap **Connect database**. Paste the **Project URL**
   and **anon key** from Step 1 → **Save & connect**.
4. Log in again — this time with your **Supabase email + password**
   (Step 1, point 4). The banner should now say **Cloud Mode is ON**.
5. Tap **Import starter content** in the left menu. This loads the
   sample Reading/Listening tests, Writing tasks, Speaking topics and
   lessons into your real database.
6. Open your public website address — everything is live.

> Tip: add the admin page to your phone's home screen (browser menu →
> "Add to Home screen") so it works like an app.

## STEP 4 — Daily use (all from your phone)

- **Add a test:** Admin → Tests → **+ Add new test** → fill the form,
  add questions (choose type, write options one per line, set the correct
  answer and an explanation) → tick **Published** → **Save test**.
- **Listening audio:** in the test form, use the **upload** button to add
  an MP3 from your phone, or paste an audio link.
- **Edit / hide / delete:** every list has Edit, Publish/Unpublish and
  Delete buttons. Unpublished items are invisible to students.
- **Homepage text:** Admin → Homepage content → edit → Save.
- **Writing / Speaking / Lessons:** same pattern — Add, Edit, Publish.

Changes appear on the public website immediately (students may need to
refresh the page).

## Backups (do this monthly — 3 minutes)

1. **Content backup:** Supabase → **Table Editor** → open each table
   (tests, questions, lessons, writing_tasks, speaking_topics) → **Export
   CSV** → save the files to your phone/Google Drive.
2. **Full database backup (optional, stronger):** Supabase → **SQL
   Editor** → run `select` exports, or use **Database → Backups** if your
   plan shows them.
3. **Files backup:** keep the original project ZIP Muse gave you, plus
   any audio/images you upload, in Google Drive. Your GitHub repository
   (Option A) is also a permanent copy of the website files.
4. **Restore:** content can be re-imported by Muse or by pasting CSV/SQL
   back in Supabase — keep the exports and you can always recover.

## Costs

- Cloudflare Pages: **free** (static hosting).
- Supabase: **free tier** as above.
- GitHub: **free**.
- No custom domain is required. You can connect one later in Cloudflare
  (the domain itself would cost money at a registrar; hosting stays free).

## If something goes wrong

- "Tests are empty on the website" → check the test is **Published** in
  admin, and the admin banner says **Cloud Mode is ON**.
- "I forgot my admin password" → Supabase → Authentication → Users →
  your user → reset password.
- "Audio doesn't play" → make sure the file is MP3 and under ~10 MB.
