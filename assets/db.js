/* IELTSwithKaif — data layer.
   Cloud Mode: talks to Supabase (PostgREST + Auth + Storage) when a
   project URL + anon key are configured. Local Mode: stores everything
   in the browser (localStorage), seeded with the starter content.
   Both modes expose the same API to the public site and the admin. */
(function (root) {
  const SEED = root.IELTS_SEED;
  const LS_DB = "ielts_db_v1", LS_CFG = "ielts_config", LS_SESS = "ielts_session", LS_PW = "ielts_admin_pw";

  function getConfig() {
    let cfg = Object.assign({}, root.IELTS_CONFIG || {});
    try {
      const saved = JSON.parse(localStorage.getItem(LS_CFG) || "null");
      if (saved && saved.supabaseUrl) cfg = saved;
    } catch (e) {}
    return cfg;
  }
  function saveConfig(cfg) { localStorage.setItem(LS_CFG, JSON.stringify(cfg)); }
  function mode() {
    const c = getConfig();
    return c.supabaseUrl && c.supabaseAnonKey ? "cloud" : "local";
  }

  /* ---------------- Local backend ---------------- */
  function localLoad() {
    try {
      const raw = localStorage.getItem(LS_DB);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    const db = JSON.parse(JSON.stringify(SEED));
    localSave(db);
    return db;
  }
  function localSave(db) { localStorage.setItem(LS_DB, JSON.stringify(db)); }
  function localReset() { localStorage.removeItem(LS_DB); return localLoad(); }

  /* ---------------- Cloud backend (Supabase REST) ---------------- */
  function sess() { try { return JSON.parse(localStorage.getItem(LS_SESS) || "null"); } catch (e) { return null; } }
  async function rest(path, opts, auth) {
    const c = getConfig();
    const headers = Object.assign(
      { apikey: c.supabaseAnonKey, "Content-Type": "application/json" },
      auth && sess() ? { Authorization: "Bearer " + sess().access_token } : { Authorization: "Bearer " + c.supabaseAnonKey },
      (opts && opts.headers) || {}
    );
    const res = await fetch(c.supabaseUrl.replace(/\/$/, "") + "/rest/v1/" + path, Object.assign({}, opts, { headers }));
    if (!res.ok) throw new Error("Database error " + res.status + ": " + (await res.text()).slice(0, 300));
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  }
  async function cloudGetAll(publishedOnly) {
    const pub = publishedOnly ? "&published=eq.true" : "";
    const [settingsRows, categories, tests, lessons, writing, speaking] = await Promise.all([
      rest("settings?select=key,value"),
      rest("categories?select=*&order=created_at.asc"),
      rest("tests?select=*&order=created_at.desc" + pub),
      rest("lessons?select=*&order=created_at.desc" + pub),
      rest("writing_tasks?select=*&order=created_at.desc" + pub),
      rest("speaking_topics?select=*&order=created_at.asc" + pub)
    ]);
    const settings = {};
    (settingsRows || []).forEach((r) => (settings[r.key] = r.value));
    if (tests.length) {
      const ids = tests.map((t) => t.id).join(",");
      const qs = await rest("questions?select=*&order=position.asc&test_id=in.(" + ids + ")");
      tests.forEach((t) => (t.questions = (qs || []).filter((q) => q.test_id === t.id)));
    }
    return { settings, categories, tests, lessons, writing_tasks: writing, speaking_topics: speaking };
  }
  async function cloudSignIn(email, password) {
    const c = getConfig();
    const res = await fetch(c.supabaseUrl.replace(/\/$/, "") + "/auth/v1/token?grant_type=password", {
      method: "POST",
      headers: { apikey: c.supabaseAnonKey, "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error_description || data.msg || "Login failed");
    localStorage.setItem(LS_SESS, JSON.stringify(data));
    return data;
  }

  /* ---------------- Unified API ---------------- */
  const DB = {
    mode, getConfig, saveConfig,
    isSignedIn() {
      if (mode() === "cloud") return !!sess();
      return sessionStorage.getItem("ielts_local_admin") === "1";
    },
    async signIn(email, password) {
      if (mode() === "cloud") return cloudSignIn(email, password);
      const stored = localStorage.getItem(LS_PW);
      if (!stored) { // first run: set the local admin password
        localStorage.setItem(LS_PW, await sha256(password));
        sessionStorage.setItem("ielts_local_admin", "1");
        return { firstRun: true };
      }
      if ((await sha256(password)) !== stored) throw new Error("Wrong password");
      sessionStorage.setItem("ielts_local_admin", "1");
      return {};
    },
    async changeLocalPassword(password) { localStorage.setItem(LS_PW, await sha256(password)); },
    signOut() { localStorage.removeItem(LS_SESS); sessionStorage.removeItem("ielts_local_admin"); },

    async getPublicData() {
      if (mode() === "cloud") return cloudGetAll(true);
      const db = localLoad();
      return {
        settings: db.settings, categories: db.categories,
        tests: db.tests.filter((t) => t.published),
        lessons: db.lessons.filter((l) => l.published),
        writing_tasks: db.writing_tasks.filter((w) => w.published),
        speaking_topics: db.speaking_topics.filter((s) => s.published)
      };
    },
    async getAdminData() {
      if (mode() === "cloud") return cloudGetAll(false);
      return localLoad();
    },

    async saveTest(test) {
      if (mode() === "cloud") {
        const { questions, ...row } = test;
        let saved;
        if (row.id && /^[0-9a-f-]{36}$/i.test(row.id)) {
          saved = (await rest("tests?id=eq." + row.id, { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify(row) }, true))[0];
        } else {
          delete row.id;
          saved = (await rest("tests", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify(row) }, true))[0];
        }
        await rest("questions?test_id=eq." + saved.id, { method: "DELETE" }, true);
        if (questions && questions.length) {
          const rows = questions.map((q, i) => ({
            test_id: saved.id, position: i, qtype: q.qtype, prompt: q.prompt,
            options: q.options || [], answer: q.answer, explanation: q.explanation || ""
          }));
          await rest("questions", { method: "POST", body: JSON.stringify(rows) }, true);
        }
        return saved.id;
      }
      const db = localLoad();
      if (!test.id) test.id = root.IELTS_UTIL.uid();
      const i = db.tests.findIndex((t) => t.id === test.id);
      if (i >= 0) db.tests[i] = test; else db.tests.unshift(test);
      localSave(db);
      return test.id;
    },
    async deleteTest(id) {
      if (mode() === "cloud") { await rest("tests?id=eq." + id, { method: "DELETE" }, true); return; }
      const db = localLoad(); db.tests = db.tests.filter((t) => t.id !== id); localSave(db);
    },
    async saveSimple(table, item) {
      if (mode() === "cloud") {
        const row = Object.assign({}, item);
        if (row.id && /^[0-9a-f-]{36}$/i.test(row.id)) {
          return (await rest(table + "?id=eq." + row.id, { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify(row) }, true))[0];
        }
        delete row.id;
        return (await rest(table, { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify(row) }, true))[0];
      }
      const db = localLoad();
      if (!item.id) item.id = root.IELTS_UTIL.uid();
      const arr = db[table];
      const i = arr.findIndex((x) => x.id === item.id);
      if (i >= 0) arr[i] = item; else arr.unshift(item);
      localSave(db);
      return item;
    },
    async deleteSimple(table, id) {
      if (mode() === "cloud") { await rest(table + "?id=eq." + id, { method: "DELETE" }, true); return; }
      const db = localLoad(); db[table] = db[table].filter((x) => x.id !== id); localSave(db);
    },
    async saveSetting(key, value) {
      if (mode() === "cloud") {
        await rest("settings", { method: "POST", headers: { Prefer: "resolution=merge-duplicates" }, body: JSON.stringify({ key, value }) }, true);
        return;
      }
      const db = localLoad(); db.settings[key] = value; localSave(db);
    },
    async importSeed() {
      const seed = JSON.parse(JSON.stringify(SEED));
      if (mode() === "local") { localSave(seed); return; }
      for (const c of seed.categories) await DB.saveSimple("categories", { kind: c.kind, name: c.name });
      for (const l of seed.lessons) await DB.saveSimple("lessons", { kind: l.kind, title: l.title, category: l.category, body: l.body, published: l.published });
      for (const w of seed.writing_tasks) await DB.saveSimple("writing_tasks", { task_no: w.task_no, title: w.title, prompt: w.prompt, image_url: w.image_url || "", model_answer: w.model_answer, tips: w.tips, published: w.published });
      for (const s of seed.speaking_topics) await DB.saveSimple("speaking_topics", { part: s.part, title: s.title, questions: s.questions, published: s.published });
      for (const t of seed.tests) {
        const { id, ...rest } = t;
        await DB.saveTest(rest);
      }
      for (const k of Object.keys(seed.settings)) await DB.saveSetting(k, seed.settings[k]);
    },
    async uploadMedia(file) {
      if (mode() !== "cloud") {
        return new Promise((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve(r.result);
          r.onerror = reject;
          r.readAsDataURL(file);
        });
      }
      const c = getConfig();
      const path = Date.now() + "-" + file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const res = await fetch(c.supabaseUrl.replace(/\/$/, "") + "/storage/v1/object/media/" + path, {
        method: "POST",
        headers: { apikey: c.supabaseAnonKey, Authorization: "Bearer " + sess().access_token, "Content-Type": file.type || "application/octet-stream", "x-upsert": "true" },
        body: file
      });
      if (!res.ok) throw new Error("Upload failed: " + (await res.text()).slice(0, 200));
      return c.supabaseUrl.replace(/\/$/, "") + "/storage/v1/object/public/media/" + path;
    },
    localReset
  };

  async function sha256(text) {
    if (crypto && crypto.subtle) {
      const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("ielts:" + text));
      return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
    }
    let h = 0; for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) | 0;
    return "x" + h;
  }

  root.IELTS_DB = DB;
})(typeof window !== "undefined" ? window : globalThis);
