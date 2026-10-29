/* IELTSwithKaif — public site app (hash routing, no build step). */
(function () {
  const U = window.IELTS_UTIL, DB = window.IELTS_DB;
  const app = document.getElementById("app");
  let DATA = null;
  let timerId = null;

  function esc(s) { return U.escapeHtml(s); }
  function stopTimer() { if (timerId) { clearInterval(timerId); timerId = null; } }

  async function boot() {
    try {
      DATA = await DB.getPublicData();
    } catch (e) {
      app.innerHTML = '<div class="wrap"><div class="error">Could not load content: ' + esc(e.message) + "</div></div>";
      return;
    }
    const s = DATA.settings || {};
    document.title = (s.site_name || "IELTSwithKaif") + " — Free IELTS Practice Tests";
    if (s.announcement) document.getElementById("announce").innerHTML = '<div class="announce">' + esc(s.announcement) + "</div>";
    route();
  }

  function setNav(name) {
    document.querySelectorAll("#mainnav a[data-nav]").forEach((a) =>
      a.classList.toggle("active", a.dataset.nav === name));
  }

  function route() {
    stopTimer();
    const hash = location.hash || "#/";
    const parts = hash.replace(/^#\//, "").split("/");
    const page = parts[0] || "";
    window.scrollTo(0, 0);
    if (page === "" ) return home();
    if (page === "reading") return testList("reading");
    if (page === "listening") return testList("listening");
    if (page === "test") return player(parts[1]);
    if (page === "writing") return writingPage();
    if (page === "speaking") return speakingPage();
    if (page === "lessons") return lessonsPage();
    if (page === "lesson") return lessonPage(parts[1]);
    home();
  }
  window.addEventListener("hashchange", route);

  /* ---------------- Home ---------------- */
  function home() {
    setNav("home");
    const s = DATA.settings || {};
    const counts = {
      reading: DATA.tests.filter((t) => t.skill === "reading").length,
      listening: DATA.tests.filter((t) => t.skill === "listening").length
    };
    app.innerHTML =
      '<section class="hero"><div class="hero-in">' +
      "<h1>" + esc(s.hero_title || "Prepare for IELTS. The smart way.") + "</h1>" +
      "<p>" + esc(s.hero_subtitle || "") + "</p>" +
      '<a class="btn" href="#/reading">Start a Reading test</a> &nbsp; <a class="btn" href="#/listening">Start a Listening test</a>' +
      "</div></section>" +
      '<div class="wrap">' +
      '<div class="skill-cards">' +
      skillCard("📖", "Reading", counts.reading + " practice tests with passages, timers and instant scoring.", "#/reading") +
      skillCard("🎧", "Listening", counts.listening + " practice tests with audio, timers and instant scoring.", "#/listening") +
      skillCard("✍️", "Writing", "Task 1 and Task 2 with model answers and band tips.", "#/writing") +
      skillCard("🗣️", "Speaking", "Part 1, 2 and 3 topics to practise alone or with a partner.", "#/speaking") +
      skillCard("📚", "Study Materials", DATA.lessons.length + " lessons on skills and band scores.", "#/lessons") +
      "</div>" +
      '<h2 class="section-title">Latest practice tests</h2>' +
      '<p class="section-sub">Pick a test, answer against the clock, and see your score and full explanations instantly.</p>' +
      '<div class="grid">' + DATA.tests.slice(0, 6).map(testCard).join("") + "</div>" +
      "</div>";
  }
  function skillCard(emoji, title, text, href) {
    return '<div class="card" onclick="location.hash=\'' + href + '\'"><div class="skill-emoji">' + emoji +
      "</div><h3>" + title + '</h3><p>' + text + "</p><strong>Open →</strong></div>";
  }
  function testCard(t) {
    const n = (t.questions || []).length;
    return '<div class="card"><div class="tags"><span class="tag">' + (t.skill === "reading" ? "📖 Reading" : "🎧 Listening") +
      '</span><span class="tag grey">' + esc(t.category) + '</span><span class="tag grey">' + n + " questions</span>" +
      '<span class="tag grey">⏱ ' + t.time_minutes + " min</span></div>" +
      "<h3>" + esc(t.title) + '</h3><a class="btn primary small" href="#/test/' + t.id + '">Start test</a></div>';
  }

  /* ---------------- Test lists ---------------- */
  function testList(skill) {
    setNav(skill);
    const cats = [...new Set(DATA.tests.filter((t) => t.skill === skill).map((t) => t.category))];
    const qtypes = [["mcq", "Multiple choice"], ["tfng", "True / False / Not Given"], ["ynng", "Yes / No / Not Given"], ["fill", "Fill in the blank"], ["match", "Matching"]];
    app.innerHTML = '<div class="wrap">' +
      '<h2 class="section-title">' + (skill === "reading" ? "📖 Reading practice tests" : "🎧 Listening practice tests") + "</h2>" +
      '<p class="section-sub">Search, filter by category or question type, then start a test.</p>' +
      '<div class="toolbar"><input type="search" id="q" placeholder="Search tests…">' +
      '<select id="cat"><option value="">All categories</option>' + cats.map((c) => '<option>' + esc(c) + "</option>").join("") + "</select>" +
      '<select id="qt"><option value="">All question types</option>' + qtypes.map((q) => '<option value="' + q[0] + '">' + q[1] + "</option>").join("") + "</select></div>" +
      '<div class="grid" id="list"></div></div>';
    const render = () => {
      const q = document.getElementById("q").value.toLowerCase();
      const cat = document.getElementById("cat").value;
      const qt = document.getElementById("qt").value;
      const items = DATA.tests.filter((t) => t.skill === skill)
        .filter((t) => !q || t.title.toLowerCase().includes(q))
        .filter((t) => !cat || t.category === cat)
        .filter((t) => !qt || (t.questions || []).some((x) => x.qtype === qt));
      document.getElementById("list").innerHTML = items.length ? items.map(testCard).join("") :
        '<p class="section-sub">No tests match your filters yet.</p>';
    };
    ["q", "cat", "qt"].forEach((id) => document.getElementById(id).addEventListener("input", render));
    render();
  }

  /* ---------------- Test player ---------------- */
  function player(id) {
    const t = DATA.tests.find((x) => String(x.id) === String(id));
    if (!t) { app.innerHTML = '<div class="wrap"><p>Test not found. <a href="#/">Go home</a></p></div>'; return; }
    setNav(t.skill);
    const qs = t.questions || [];
    let secondsLeft = (t.time_minutes || 15) * 60;
    const startedAt = Date.now();

    const leftHtml = t.skill === "listening"
      ? '<div class="passage"><h3 style="margin-top:0">🎧 Listening test</h3><p>' + esc(t.passage || "") + "</p>" +
        (t.audio_url ? '<audio controls preload="metadata" src="' + esc(t.audio_url) + '"></audio><p class="section-sub">Press play, then answer the questions. In the real test the recording plays once — try to do the same!</p>' : '<div class="error">Audio for this test has not been added yet.</div>') + "</div>"
      : '<div class="passage">' + esc(t.passage || "") + "</div>";

    app.innerHTML = '<div class="wrap">' +
      '<div class="timerbar"><span>' + esc(t.title) + '</span><span class="time" id="clock">' + U.formatClock(secondsLeft) + '</span></div>' +
      '<div class="player">' + leftHtml +
      '<div class="qpanel"><form id="testform">' +
      qs.map((q, i) => qHtml(q, i)).join("") +
      '<br><button class="btn primary" type="submit" style="width:100%">Submit answers</button>' +
      "</form><div id=\"result\"></div></div></div></div>";

    timerId = setInterval(() => {
      secondsLeft--;
      const c = document.getElementById("clock");
      if (c) { c.textContent = U.formatClock(secondsLeft); if (secondsLeft <= 60) c.style.color = "#ffb3b3"; }
      if (secondsLeft <= 0) { stopTimer(); submit(true); }
    }, 1000);

    document.getElementById("testform").addEventListener("submit", (e) => { e.preventDefault(); submit(false); });

    function collect() {
      const answers = {};
      qs.forEach((q, i) => {
        if (q.qtype === "fill") {
          const el = document.getElementById("a" + i);
          answers[String(i)] = el ? el.value : "";
        } else {
          const el = document.querySelector('input[name="a' + i + '"]:checked');
          answers[String(i)] = el ? el.value : "";
        }
      });
      return answers;
    }
    function submit(auto) {
      stopTimer();
      const answers = collect();
      const score = U.scoreTest(qs, answers);
      const usedMin = Math.max(1, Math.round((Date.now() - startedAt) / 60000));
      document.getElementById("result").innerHTML =
        '<div class="scorebox" style="margin-top:18px"><div>Your score</div><div class="big">' + score.correct + " / " + score.total + "</div>" +
        "<div>Estimated practice band: <strong>" + U.bandEstimate(score.correct, score.total) + "</strong> · Time used: " + usedMin + " min" + (auto ? " · (time expired — auto-submitted)" : "") + "</div></div>" +
        '<p class="section-sub">Scroll up through the questions to see the correct answers and explanations.</p>';
      // review mode
      qs.forEach((q, i) => {
        const block = document.getElementById("qb" + i);
        if (!block) return;
        block.classList.add("review");
        const r = score.results[i];
        const verdict = document.createElement("div");
        verdict.innerHTML = '<span class="verdict ' + (r.correct ? "ok" : "no") + '">' + (r.correct ? "✓ Correct" : "✗ Incorrect") + "</span>" +
          (r.correct ? "" : ' &nbsp;·&nbsp; Your answer: <strong>' + esc(r.given || "—") + "</strong> · Correct answer: <strong>" + esc(String(q.answer).split("|")[0]) + "</strong>");
        block.appendChild(verdict);
        const ex = document.createElement("div");
        ex.className = "explain"; ex.textContent = q.explanation || "";
        if (q.explanation) block.appendChild(ex);
        block.querySelectorAll(".opt").forEach((o) => {
          const v = o.querySelector("input") ? o.querySelector("input").value : "";
          if (U.checkAnswer(q, v)) o.classList.add("correct");
          else if (r.given && U.normalizeAnswer(v) === U.normalizeAnswer(r.given)) o.classList.add("wrong");
        });
        block.querySelectorAll("input").forEach((inp) => (inp.disabled = true));
      });
      document.getElementById("result").scrollIntoView({ behavior: "smooth" });
    }
  }
  function qHtml(q, i) {
    let inner = "";
    if (q.qtype === "fill") {
      inner = '<input class="fillin" id="a' + i + '" type="text" placeholder="Your answer" autocomplete="off">';
    } else {
      inner = (q.options || []).map((o) =>
        '<label class="opt"><input type="radio" name="a' + i + '" value="' + esc(o) + '">' + esc(o) + "</label>").join("");
    }
    return '<div class="qblock" id="qb' + i + '"><div class="qprompt">' + (i + 1) + ". " + esc(q.prompt) + "</div>" + inner + "</div>";
  }

  /* ---------------- Writing ---------------- */
  function writingPage() {
    setNav("writing");
    const w = DATA.writing_tasks || [];
    app.innerHTML = '<div class="wrap"><h2 class="section-title">✍️ Writing practice</h2>' +
      '<p class="section-sub">Read the task, write your answer on paper or in a document (Task 1: 150+ words, Task 2: 250+ words), then compare with the model answer and tips.</p>' +
      w.map((t, i) =>
        '<div class="card" style="margin-bottom:16px"><div class="tags"><span class="tag">Task ' + t.task_no + '</span></div><h3>' + esc(t.title) + "</h3>" +
        (t.image_url ? '<img src="' + esc(t.image_url) + '" alt="" style="max-width:100%;border-radius:10px;margin-bottom:10px">' : "") +
        '<div class="prose" style="border:0;padding:0">' + esc(t.prompt) + "</div>" +
        '<p style="margin-top:14px"><button class="btn ghost small" onclick="document.getElementById(\'wm' + i + '\').classList.toggle(\'hidden\')">Show model answer &amp; tips</button></p>' +
        '<div id="wm' + i + '" class="hidden"><h4>Model answer</h4><div class="prose" style="border:0;padding:0;background:var(--sky)">' + esc(t.model_answer) + "</div>" +
        (t.tips ? '<h4>Tips</h4><div class="prose" style="border:0;padding:0">' + esc(t.tips) + "</div>" : "") + "</div></div>"
      ).join("") + "</div>";
  }

  /* ---------------- Speaking ---------------- */
  function speakingPage() {
    setNav("speaking");
    const sp = DATA.speaking_topics || [];
    const part = (n, blurb) => {
      const items = sp.filter((s) => s.part === n);
      if (!items.length) return "";
      return '<h3 class="section-title" style="font-size:21px">Part ' + n + "</h3><p class=\"section-sub\">" + blurb + "</p>" +
        items.map((s) => {
          if (s.part === 2) {
            return '<div class="cuecard" style="margin-bottom:16px"><strong>' + esc(s.title) + '</strong><br>' +
              (s.questions || []).map(esc).join("<br>") + "</div>";
          }
          return '<div class="card" style="margin-bottom:16px"><h3>' + esc(s.title) + "</h3><ol>" +
            (s.questions || []).map((q) => "<li style='margin:6px 0;line-height:1.5'>" + esc(q) + "</li>").join("") + "</ol></div>";
        }).join("");
    };
    app.innerHTML = '<div class="wrap"><h2 class="section-title">🗣️ Speaking practice</h2>' +
      '<p class="section-sub">Practise aloud. Part 2: prepare for 1 minute, then speak for 1–2 minutes. Recording yourself on your phone helps a lot.</p>' +
      part(1, "Short questions about familiar topics. Answer in 2–3 sentences each.") +
      part(2, "Cue cards. Talk about the topic, covering every bullet point.") +
      part(3, "Discussion questions linked to Part 2 themes. Give opinions with reasons and examples.") +
      "</div>";
  }

  /* ---------------- Lessons ---------------- */
  function lessonsPage() {
    setNav("lessons");
    app.innerHTML = '<div class="wrap"><h2 class="section-title">📚 Study materials</h2>' +
      '<p class="section-sub">Short lessons on IELTS skills, strategies and band scores.</p><div class="grid">' +
      (DATA.lessons || []).map((l) =>
        '<div class="card"><div class="tags"><span class="tag">' + esc(l.category) + '</span></div><h3>' + esc(l.title) +
        '</h3><a class="btn primary small" href="#/lesson/' + l.id + '">Read lesson</a></div>').join("") +
      "</div></div>";
  }
  function lessonPage(id) {
    const l = (DATA.lessons || []).find((x) => String(x.id) === String(id));
    if (!l) { app.innerHTML = '<div class="wrap"><p>Lesson not found.</p></div>'; return; }
    setNav("lessons");
    app.innerHTML = '<div class="wrap"><p><a href="#/lessons">← All study materials</a></p>' +
      '<h2 class="section-title">' + esc(l.title) + '</h2><div class="prose">' + esc(l.body) + "</div></div>";
  }

  boot();
})();
