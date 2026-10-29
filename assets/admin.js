/* IELTSwithKaif — admin panel. All management is done with forms
   and buttons. Works in Cloud Mode (Supabase) and Local Mode. */
(function () {
  const U = window.IELTS_UTIL, DB = window.IELTS_DB;
  const root = document.getElementById("adminApp");
  const esc = U.escapeHtml;
  let DATA = null;
  let view = "dashboard";
  let editTest = null; // working copy while editing a test

  document.getElementById("logoutLink").addEventListener("click", (e) => {
    e.preventDefault(); DB.signOut(); location.reload();
  });

  async function start() {
    if (!DB.isSignedIn()) return loginScreen();
    document.getElementById("logoutLink").classList.remove("hidden");
    await refresh();
    render();
  }
  async function refresh() { DATA = await DB.getAdminData(); }

  /* ---------------- Login ---------------- */
  function loginScreen() {
    const cloud = DB.mode() === "cloud";
    root.innerHTML = '<div class="wrap"><div class="login-box">' +
      "<h2 style='margin-top:0;color:var(--blue-deep)'>Admin login</h2>" +
      (cloud
        ? "<p class='section-sub'>Sign in with the admin email and password you created in Supabase.</p>"
        : "<p class='section-sub'><strong>Local Mode:</strong> the site is not connected to a cloud database yet, so this password protects the panel on <em>this device only</em>. The first time, the password you enter becomes your local admin password.</p>") +
      '<div id="loginMsg"></div><form id="loginForm">' +
      (cloud ? '<div class="field"><label>Email</label><input id="li-email" type="email" required autocomplete="username"></div>' : "") +
      '<div class="field"><label>Password</label><input id="li-pass" type="password" required autocomplete="current-password"></div>' +
      '<button class="btn primary" style="width:100%">Log in</button></form>' +
      '<p class="section-sub" style="margin-top:14px">To connect the real cloud database (free Supabase), first log in here, then open “Connect database”.</p>' +
      "</div></div>";
    document.getElementById("loginForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const msg = document.getElementById("loginMsg");
      try {
        const email = cloud ? document.getElementById("li-email").value.trim() : "";
        const res = await DB.signIn(email, document.getElementById("li-pass").value);
        if (res && res.firstRun) alert("Your local admin password has been set. Keep it safe!");
        location.reload();
      } catch (err) {
        msg.innerHTML = '<div class="error">' + esc(err.message) + "</div>";
      }
    });
  }

  /* ---------------- Shell ---------------- */
  function render() {
    const cloud = DB.mode() === "cloud";
    const menu = [
      ["dashboard", "🏠 Dashboard"], ["tests", "📝 Tests"], ["lessons", "📚 Lessons & Materials"],
      ["writing", "✍️ Writing tasks"], ["speaking", "🗣️ Speaking topics"], ["categories", "🏷️ Categories"],
      ["homepage", "🌐 Homepage content"], ["connect", "🔌 Connect database"]
    ];
    root.innerHTML = '<div class="wrap">' +
      (cloud
        ? '<div class="success"><strong>Cloud Mode is ON.</strong> Everything you change here is saved to your Supabase database and appears on the public website for all visitors.</div>'
        : '<div class="notice"><strong>Local Mode.</strong> Changes are saved only in this browser on this device. To publish changes to the real website for everyone, connect the free Supabase database — open <a href="#" id="goConnect"><strong>Connect database</strong></a> and follow the steps.</div>') +
      '<div class="admin-shell"><aside class="side">' +
      menu.map((m) => '<button data-view="' + m[0] + '" class="' + (view === m[0] ? "active" : "") + '">' + m[1] + "</button>").join("") +
      '<button id="importBtn">⬇️ Import starter content</button>' +
      '<button id="resetLocalBtn">♻️ Reset local data</button>' +
      '</aside><section id="panel"></section></div></div>';
    document.querySelectorAll(".side button[data-view]").forEach((b) =>
      b.addEventListener("click", () => { view = b.dataset.view; editTest = null; render(); }));
    const gc = document.getElementById("goConnect");
    if (gc) gc.addEventListener("click", (e) => { e.preventDefault(); view = "connect"; render(); });
    document.getElementById("importBtn").addEventListener("click", async () => {
      if (!confirm("Import the starter tests, lessons, writing and speaking content? Existing items with the same content may be duplicated in Cloud Mode.")) return;
      try { await DB.importSeed(); await refresh(); alert("Starter content imported."); render(); }
      catch (e) { alert("Import failed: " + e.message); }
    });
    document.getElementById("resetLocalBtn").addEventListener("click", async () => {
      if (DB.mode() !== "local") { alert("This only applies in Local Mode."); return; }
      if (!confirm("Reset all local content back to the starter content?")) return;
      DB.localReset(); await refresh(); render();
    });
    const panel = document.getElementById("panel");
    if (view === "dashboard") return dashboard(panel);
    if (view === "tests") return testsView(panel);
    if (view === "lessons") return simpleList(panel, "lessons", "Lessons & study materials", lessonForm);
    if (view === "writing") return simpleList(panel, "writing_tasks", "Writing tasks", writingForm);
    if (view === "speaking") return simpleList(panel, "speaking_topics", "Speaking topics", speakingForm);
    if (view === "categories") return categoriesView(panel);
    if (view === "homepage") return homepageView(panel);
    if (view === "connect") return connectView(panel);
  }

  function dashboard(p) {
    const c = (arr) => arr.length;
    p.innerHTML = '<h2 class="section-title" style="margin-top:0">Dashboard</h2><div class="grid">' +
      [["📝 Tests", c(DATA.tests)], ["📖 Reading tests", DATA.tests.filter((t) => t.skill === "reading").length],
       ["🎧 Listening tests", DATA.tests.filter((t) => t.skill === "listening").length],
       ["📚 Lessons & materials", c(DATA.lessons)], ["✍️ Writing tasks", c(DATA.writing_tasks)],
       ["🗣️ Speaking topics", c(DATA.speaking_topics)], ["🏷️ Categories", c(DATA.categories)],
       ["✅ Published tests", DATA.tests.filter((t) => t.published).length]]
        .map((x) => '<div class="card"><h3>' + x[0] + '</h3><div style="font-size:34px;font-weight:800;color:var(--blue)">' + x[1] + "</div></div>").join("") +
      '</div><div class="card" style="margin-top:16px"><h3>Quick start</h3><p>1. Open <strong>Tests</strong> to add or edit a practice test.<br>2. Press <strong>Publish</strong> to make it visible to students.<br>3. Open the <a href="../" target="_blank">public website</a> to see it live.</p></div>';
  }

  /* ---------------- Tests ---------------- */
  function testsView(p) {
    if (editTest) return testForm(p);
    p.innerHTML = '<h2 class="section-title" style="margin-top:0">Tests</h2>' +
      '<p><button class="btn primary" id="newTest">+ Add new test</button></p>' +
      '<table class="list"><tr><th>Title</th><th>Skill</th><th>Category</th><th>Questions</th><th>Status</th><th>Actions</th></tr>' +
      DATA.tests.map((t) =>
        "<tr><td><strong>" + esc(t.title) + "</strong></td><td>" + t.skill + "</td><td>" + esc(t.category) + "</td><td>" + (t.questions || []).length + "</td>" +
        '<td><span class="pill ' + (t.published ? "on" : "off") + '">' + (t.published ? "Published" : "Hidden") + "</span></td>" +
        '<td><div class="row-actions">' +
        '<button class="btn ghost small" data-edit="' + t.id + '">Edit</button>' +
        '<button class="btn ghost small" data-toggle="' + t.id + '">' + (t.published ? "Unpublish" : "Publish") + "</button>" +
        '<button class="btn danger small" data-del="' + t.id + '">Delete</button></div></td></tr>').join("") +
      "</table>";
    document.getElementById("newTest").addEventListener("click", () => {
      editTest = { id: "", skill: "reading", title: "", category: "General", level: "All levels", time_minutes: 15, passage: "", audio_url: "", image_url: "", published: false, questions: [] };
      render();
    });
    p.querySelectorAll("[data-edit]").forEach((b) => b.addEventListener("click", () => {
      editTest = JSON.parse(JSON.stringify(DATA.tests.find((t) => String(t.id) === b.dataset.edit)));
      editTest.questions = editTest.questions || [];
      render();
    }));
    p.querySelectorAll("[data-toggle]").forEach((b) => b.addEventListener("click", async () => {
      const t = DATA.tests.find((x) => String(x.id) === b.dataset.toggle);
      t.published = !t.published;
      await DB.saveTest(t); await refresh(); render();
    }));
    p.querySelectorAll("[data-del]").forEach((b) => b.addEventListener("click", async () => {
      if (!confirm("Delete this test and all its questions? This cannot be undone.")) return;
      await DB.deleteTest(b.dataset.del); await refresh(); render();
    }));
  }

  function testForm(p) {
    const t = editTest;
    const catOptions = DATA.categories.filter((c) => c.kind === t.skill).map((c) => c.name);
    if (t.category && !catOptions.includes(t.category)) catOptions.push(t.category);
    p.innerHTML = '<h2 class="section-title" style="margin-top:0">' + (t.id ? "Edit test" : "New test") + "</h2>" +
      '<div class="card"><form id="tf">' +
      fld("Title", '<input id="f-title" value="' + esc(t.title) + '" required>') +
      '<div class="field"><label>Type</label><select id="f-skill"><option value="reading"' + (t.skill === "reading" ? " selected" : "") + '>Reading</option><option value="listening"' + (t.skill === "listening" ? " selected" : "") + ">Listening</option></select></div>" +
      fld("Category", '<input id="f-category" list="catlist" value="' + esc(t.category) + '"><datalist id="catlist">' + catOptions.map((c) => "<option>" + esc(c) + "</option>").join("") + "</datalist>") +
      fld("Level", '<input id="f-level" value="' + esc(t.level || "All levels") + '">') +
      fld("Time limit (minutes)", '<input id="f-time" type="number" min="1" value="' + (t.time_minutes || 15) + '">') +
      fld(t.skill === "reading" ? "Reading passage" : "Introduction text (shown above the audio)", '<textarea id="f-passage" style="min-height:220px">' + esc(t.passage) + "</textarea>") +
      (t.skill === "listening" ? fld("Audio file", '<input id="f-audio" value="' + esc(t.audio_url || "") + '" placeholder="Audio URL"><div class="hint">Or upload an MP3: <input type="file" id="f-audio-file" accept="audio/*"></div>') : "") +
      fld("Image (optional)", '<input id="f-image" value="' + esc(t.image_url || "") + '" placeholder="Image URL"><div class="hint">Or upload an image: <input type="file" id="f-image-file" accept="image/*"></div>') +
      '<div class="field"><label><input type="checkbox" id="f-pub"' + (t.published ? " checked" : "") + '> Published (visible to students)</label></div>' +
      '<h3>Questions</h3><div id="qlist"></div>' +
      '<p><button type="button" class="btn ghost small" id="addQ">+ Add question</button></p>' +
      '<p><button class="btn primary">Save test</button> <button type="button" class="btn ghost" id="cancelEdit">Cancel</button></p>' +
      "</form></div>";
    const qlist = document.getElementById("qlist");
    function drawQuestions() {
      qlist.innerHTML = t.questions.map((q, i) => qEditHtml(q, i)).join("");
      qlist.querySelectorAll("[data-qdel]").forEach((b) => b.addEventListener("click", () => { syncQuestions(); t.questions.splice(+b.dataset.qdel, 1); drawQuestions(); }));
      qlist.querySelectorAll("select[data-qtype]").forEach((s) => s.addEventListener("change", () => { syncQuestions(); drawQuestions(); }));
    }
    function syncQuestions() {
      qlist.querySelectorAll(".qedit").forEach((box, i) => {
        const q = t.questions[i]; if (!q) return;
        q.qtype = box.querySelector("[data-qtype]").value;
        q.prompt = box.querySelector("[data-qprompt]").value;
        const optEl = box.querySelector("[data-qoptions]");
        q.options = optEl ? optEl.value.split("\n").map((s) => s.trim()).filter(Boolean) : [];
        if (q.qtype === "tfng" && !q.options.length) q.options = ["True", "False", "Not Given"];
        if (q.qtype === "ynng" && !q.options.length) q.options = ["Yes", "No", "Not Given"];
        q.answer = box.querySelector("[data-qanswer]").value.trim();
        q.explanation = box.querySelector("[data-qexpl]").value;
      });
    }
    drawQuestions();
    document.getElementById("addQ").addEventListener("click", () => {
      syncQuestions();
      t.questions.push({ qtype: "mcq", prompt: "", options: ["", "", "", ""], answer: "", explanation: "" });
      drawQuestions();
    });
    document.getElementById("cancelEdit").addEventListener("click", () => { editTest = null; render(); });
    const upload = async (fileInputId, targetId) => {
      const fi = document.getElementById(fileInputId);
      if (fi && fi.files && fi.files[0]) {
        const url = await DB.uploadMedia(fi.files[0]);
        document.getElementById(targetId).value = url;
      }
    };
    document.getElementById("tf").addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        if (t.skill === "listening") await upload("f-audio-file", "f-audio");
        await upload("f-image-file", "f-image");
        syncQuestions();
        t.title = document.getElementById("f-title").value.trim();
        t.skill = document.getElementById("f-skill").value;
        t.category = document.getElementById("f-category").value.trim() || "General";
        t.level = document.getElementById("f-level").value.trim();
        t.time_minutes = parseInt(document.getElementById("f-time").value, 10) || 15;
        t.passage = document.getElementById("f-passage").value;
        const au = document.getElementById("f-audio"); if (au) t.audio_url = au.value.trim();
        t.image_url = document.getElementById("f-image").value.trim();
        t.published = document.getElementById("f-pub").checked;
        await DB.saveTest(t);
        editTest = null; await refresh(); render();
        alert("Test saved.");
      } catch (err) { alert("Save failed: " + err.message); }
    });
  }
  function qEditHtml(q, i) {
    const types = [["mcq", "Multiple choice"], ["tfng", "True/False/Not Given"], ["ynng", "Yes/No/Not Given"], ["fill", "Fill in the blank"], ["match", "Matching (choose from list)"]];
    const needsOptions = q.qtype === "mcq" || q.qtype === "match";
    return '<div class="qedit"><div class="field"><label>Question ' + (i + 1) + ' type</label><select data-qtype="' + i + '">' +
      types.map((x) => '<option value="' + x[0] + '"' + (q.qtype === x[0] ? " selected" : "") + ">" + x[1] + "</option>").join("") + "</select></div>" +
      '<div class="field"><label>Question text</label><textarea data-qprompt style="min-height:60px">' + esc(q.prompt) + "</textarea></div>" +
      (needsOptions ? '<div class="field"><label>Options (one per line)</label><textarea data-qoptions style="min-height:80px">' + esc((q.options || []).join("\n")) + '</textarea><div class="hint">The correct answer below must match one option exactly.</div></div>' : "") +
      '<div class="field"><label>Correct answer</label><input data-qanswer value="' + esc(q.answer) + '"><div class="hint">For fill-in questions you may give several accepted answers separated by | e.g. 20|twenty</div></div>' +
      '<div class="field"><label>Explanation (shown after submitting)</label><textarea data-qexpl style="min-height:50px">' + esc(q.explanation || "") + "</textarea></div>" +
      '<button type="button" class="btn danger small" data-qdel="' + i + '">Delete question</button></div>';
  }
  function fld(label, control) { return '<div class="field"><label>' + label + "</label>" + control + "</div>"; }

  /* ---------------- Generic CRUD (lessons / writing / speaking) ---------------- */
  function simpleList(p, table, title, formFn) {
    p.innerHTML = '<h2 class="section-title" style="margin-top:0">' + title + "</h2>" +
      '<p><button class="btn primary" id="addNew">+ Add new</button></p>' +
      '<table class="list"><tr><th>Title</th><th>Details</th><th>Status</th><th>Actions</th></tr>' +
      DATA[table].map((x) =>
        "<tr><td><strong>" + esc(x.title) + "</strong></td><td>" + esc(detailOf(table, x)) + "</td>" +
        '<td><span class="pill ' + (x.published ? "on" : "off") + '">' + (x.published ? "Published" : "Hidden") + "</span></td>" +
        '<td><div class="row-actions"><button class="btn ghost small" data-edit="' + x.id + '">Edit</button>' +
        '<button class="btn ghost small" data-toggle="' + x.id + '">' + (x.published ? "Unpublish" : "Publish") + "</button>" +
        '<button class="btn danger small" data-del="' + x.id + '">Delete</button></div></td></tr>').join("") + "</table>";
    document.getElementById("addNew").addEventListener("click", () => formFn(p, table, null));
    p.querySelectorAll("[data-edit]").forEach((b) => b.addEventListener("click", () => formFn(p, table, DATA[table].find((x) => String(x.id) === b.dataset.edit))));
    p.querySelectorAll("[data-toggle]").forEach((b) => b.addEventListener("click", async () => {
      const x = DATA[table].find((y) => String(y.id) === b.dataset.toggle);
      x.published = !x.published; await DB.saveSimple(table, stripLocal(table, x)); await refresh(); render();
    }));
    p.querySelectorAll("[data-del]").forEach((b) => b.addEventListener("click", async () => {
      if (!confirm("Delete this item? This cannot be undone.")) return;
      await DB.deleteSimple(table, b.dataset.del); await refresh(); render();
    }));
  }
  function detailOf(table, x) {
    if (table === "lessons") return x.category + " · " + (x.kind || "lesson");
    if (table === "writing_tasks") return "Task " + x.task_no;
    if (table === "speaking_topics") return "Part " + x.part + " · " + (x.questions || []).length + " questions";
    return "";
  }
  function stripLocal(table, x) {
    const copy = Object.assign({}, x);
    if (DB.mode() === "cloud" && copy.id && !/^[0-9a-f-]{36}$/i.test(copy.id)) delete copy.id;
    delete copy.created_at;
    return copy;
  }
  function formShell(p, heading, fieldsHtml) {
    p.innerHTML = '<h2 class="section-title" style="margin-top:0">' + heading + '</h2><div class="card"><form id="sf">' + fieldsHtml +
      '<div class="field"><label><input type="checkbox" id="s-pub"> Published (visible to students)</label></div>' +
      '<p><button class="btn primary">Save</button> <button type="button" class="btn ghost" id="s-cancel">Cancel</button></p></form></div>';
    document.getElementById("s-cancel").addEventListener("click", render);
  }
  function lessonForm(p, table, item) {
    const x = item || { title: "", kind: "lesson", category: "General", body: "", published: false };
    formShell(p, item ? "Edit lesson / material" : "New lesson / material",
      fld("Title", '<input id="s-title" value="' + esc(x.title) + '" required>') +
      '<div class="field"><label>Type</label><select id="s-kind"><option value="lesson"' + (x.kind === "lesson" ? " selected" : "") + '>Lesson</option><option value="material"' + (x.kind === "material" ? " selected" : "") + ">Study material</option></select></div>" +
      fld("Category", '<input id="s-cat" value="' + esc(x.category || "General") + '">') +
      fld("Content", '<textarea id="s-body" style="min-height:260px">' + esc(x.body) + "</textarea>"));
    document.getElementById("s-pub").checked = !!x.published;
    document.getElementById("sf").addEventListener("submit", async (e) => {
      e.preventDefault();
      const obj = stripLocal(table, { id: x.id || "", title: document.getElementById("s-title").value.trim(), kind: document.getElementById("s-kind").value, category: document.getElementById("s-cat").value.trim() || "General", body: document.getElementById("s-body").value, published: document.getElementById("s-pub").checked });
      await DB.saveSimple(table, obj); await refresh(); render(); alert("Saved.");
    });
  }
  function writingForm(p, table, item) {
    const x = item || { task_no: 1, title: "", prompt: "", image_url: "", model_answer: "", tips: "", published: false };
    formShell(p, item ? "Edit writing task" : "New writing task",
      '<div class="field"><label>Task number</label><select id="s-taskno"><option value="1"' + (x.task_no === 1 ? " selected" : "") + '>Task 1</option><option value="2"' + (x.task_no === 2 ? " selected" : "") + ">Task 2</option></select></div>" +
      fld("Title", '<input id="s-title" value="' + esc(x.title) + '" required>') +
      fld("Question / prompt", '<textarea id="s-prompt" style="min-height:140px">' + esc(x.prompt) + "</textarea>") +
      fld("Chart image (Task 1, optional)", '<input id="s-img" value="' + esc(x.image_url || "") + '" placeholder="Image URL"><div class="hint">Or upload: <input type="file" id="s-img-file" accept="image/*"></div>') +
      fld("Model answer", '<textarea id="s-model" style="min-height:200px">' + esc(x.model_answer) + "</textarea>") +
      fld("Tips", '<textarea id="s-tips">' + esc(x.tips || "") + "</textarea>"));
    document.getElementById("s-pub").checked = !!x.published;
    document.getElementById("sf").addEventListener("submit", async (e) => {
      e.preventDefault();
      const fi = document.getElementById("s-img-file");
      if (fi.files && fi.files[0]) document.getElementById("s-img").value = await DB.uploadMedia(fi.files[0]);
      const obj = stripLocal(table, { id: x.id || "", task_no: parseInt(document.getElementById("s-taskno").value, 10), title: document.getElementById("s-title").value.trim(), prompt: document.getElementById("s-prompt").value, image_url: document.getElementById("s-img").value.trim(), model_answer: document.getElementById("s-model").value, tips: document.getElementById("s-tips").value, published: document.getElementById("s-pub").checked });
      await DB.saveSimple(table, obj); await refresh(); render(); alert("Saved.");
    });
  }
  function speakingForm(p, table, item) {
    const x = item || { part: 1, title: "", questions: [], published: false };
    formShell(p, item ? "Edit speaking topic" : "New speaking topic",
      '<div class="field"><label>Part</label><select id="s-part"><option value="1"' + (x.part === 1 ? " selected" : "") + '>Part 1</option><option value="2"' + (x.part === 2 ? " selected" : "") + '>Part 2 (cue card)</option><option value="3"' + (x.part === 3 ? " selected" : "") + ">Part 3</option></select></div>" +
      fld("Title", '<input id="s-title" value="' + esc(x.title) + '" required>') +
      fld("Questions / cue card lines (one per line)", '<textarea id="s-qs" style="min-height:180px">' + esc((x.questions || []).join("\n")) + "</textarea>"));
    document.getElementById("s-pub").checked = !!x.published;
    document.getElementById("sf").addEventListener("submit", async (e) => {
      e.preventDefault();
      const obj = stripLocal(table, { id: x.id || "", part: parseInt(document.getElementById("s-part").value, 10), title: document.getElementById("s-title").value.trim(), questions: document.getElementById("s-qs").value.split("\n").map((s) => s.trim()).filter(Boolean), published: document.getElementById("s-pub").checked });
      await DB.saveSimple(table, obj); await refresh(); render(); alert("Saved.");
    });
  }

  /* ---------------- Categories ---------------- */
  function categoriesView(p) {
    p.innerHTML = '<h2 class="section-title" style="margin-top:0">Categories</h2>' +
      '<div class="card"><form id="catForm"><div class="field"><label>For</label><select id="c-kind"><option value="reading">Reading</option><option value="listening">Listening</option><option value="lesson">Lessons</option><option value="material">Materials</option></select></div>' +
      fld("Category name", '<input id="c-name" required placeholder="e.g. Science">') +
      '<button class="btn primary">Add category</button></form></div><br>' +
      '<table class="list"><tr><th>Name</th><th>For</th><th>Actions</th></tr>' +
      DATA.categories.map((c) => "<tr><td><strong>" + esc(c.name) + "</strong></td><td>" + c.kind + '</td><td><button class="btn danger small" data-del="' + c.id + '">Delete</button></td></tr>').join("") + "</table>";
    document.getElementById("catForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      await DB.saveSimple("categories", { kind: document.getElementById("c-kind").value, name: document.getElementById("c-name").value.trim() });
      await refresh(); render();
    });
    p.querySelectorAll("[data-del]").forEach((b) => b.addEventListener("click", async () => {
      if (!confirm("Delete this category? Tests using it keep their category text.")) return;
      await DB.deleteSimple("categories", b.dataset.del); await refresh(); render();
    }));
  }

  /* ---------------- Homepage ---------------- */
  function homepageView(p) {
    const s = DATA.settings || {};
    p.innerHTML = '<h2 class="section-title" style="margin-top:0">Homepage content</h2><div class="card"><form id="homeForm">' +
      fld("Site name", '<input id="h-name" value="' + esc(s.site_name || "") + '">') +
      fld("Hero headline", '<input id="h-title" value="' + esc(s.hero_title || "") + '">') +
      fld("Hero subtitle", '<textarea id="h-sub">' + esc(s.hero_subtitle || "") + "</textarea>") +
      fld("Announcement bar (top of homepage)", '<input id="h-ann" value="' + esc(s.announcement || "") + '">') +
      '<button class="btn primary">Save homepage</button></form></div>';
    document.getElementById("homeForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      await DB.saveSetting("site_name", document.getElementById("h-name").value);
      await DB.saveSetting("hero_title", document.getElementById("h-title").value);
      await DB.saveSetting("hero_subtitle", document.getElementById("h-sub").value);
      await DB.saveSetting("announcement", document.getElementById("h-ann").value);
      await refresh(); alert("Homepage saved.");
    });
  }

  /* ---------------- Connect database ---------------- */
  function connectView(p) {
    const c = DB.getConfig();
    p.innerHTML = '<h2 class="section-title" style="margin-top:0">Connect database (Supabase — free)</h2>' +
      '<div class="card"><p>Current mode: <strong>' + (DB.mode() === "cloud" ? "Cloud Mode (Supabase connected)" : "Local Mode") + '</strong></p>' +
      '<form id="cfgForm">' +
      fld("Supabase Project URL", '<input id="cfg-url" placeholder="https://xxxxxxxx.supabase.co" value="' + esc(c.supabaseUrl || "") + '">') +
      fld("Supabase anon key", '<input id="cfg-key" placeholder="eyJhbGciOi…" value="' + esc(c.supabaseAnonKey || "") + '"><div class="hint">The anon key is safe to use in a website — your data is protected by the database rules in schema.sql. Never paste the service_role secret here.</div>') +
      '<button class="btn primary">Save &amp; connect</button></form>' +
      '<hr style="border-color:var(--line);margin:22px 0">' +
      "<h3>How to get these (one time, about 10 minutes, on your phone)</h3>" +
      "<ol style='line-height:1.8'>" +
      "<li>Open <strong>supabase.com</strong> → <strong>Start your project</strong> → sign up free (Google or email).</li>" +
      "<li>Tap <strong>New project</strong>, name it <em>ieltswithkaif</em>, set a database password (save it in your phone notes), choose the nearest region, tap <strong>Create</strong>. Wait ~2 minutes.</li>" +
      "<li>Left menu → <strong>SQL Editor</strong> → <strong>New query</strong> → paste the whole contents of the file <strong>supabase/schema.sql</strong> (in your project folder / ZIP) → <strong>Run</strong>.</li>" +
      "<li>Left menu → <strong>Authentication</strong> → <strong>Users</strong> → <strong>Add user</strong> → enter YOUR email and a strong password → Create. This is your admin login.</li>" +
      "<li>Left menu → <strong>Project Settings → API</strong> → copy <strong>Project URL</strong> and the <strong>anon public</strong> key → paste them in the two boxes above → <strong>Save &amp; connect</strong>.</li>" +
      "<li>Log out and log in again with your Supabase email + password, then tap <strong>Import starter content</strong> in the left menu to load the sample tests.</li></ol>" +
      "<p class='section-sub'>Free tier limits (honest): Supabase free gives 500 MB database and 1 GB file storage — plenty for hundreds of tests. The project pauses after ~1 week with no visitors; any visit wakes it. Cloudflare Pages free hosting is effectively unlimited for a static site like this.</p></div>";
    document.getElementById("cfgForm").addEventListener("submit", (e) => {
      e.preventDefault();
      DB.saveConfig({ supabaseUrl: document.getElementById("cfg-url").value.trim(), supabaseAnonKey: document.getElementById("cfg-key").value.trim() });
      DB.signOut();
      alert("Saved. Please log in again — in Cloud Mode you will use your Supabase email and password.");
      location.reload();
    });
  }

  start();
})();
