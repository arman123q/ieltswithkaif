/* IELTSwithKaif — shared helpers (works in browser and Node for tests). */
(function (root) {
  function normalizeAnswer(s) {
    return String(s == null ? "" : s)
      .trim().toLowerCase().replace(/\s+/g, " ").replace(/\.+$/, "");
  }
  /* question.answer may list alternatives separated by |  (for fill-in answers) */
  function checkAnswer(question, given) {
    if (given == null || String(given).trim() === "") return false;
    const g = normalizeAnswer(given);
    return String(question.answer || "")
      .split("|")
      .some((alt) => normalizeAnswer(alt) === g);
  }
  function scoreTest(questions, answers) {
    const results = questions.map((q, i) => {
      const given = answers[q.id || String(i)] != null ? answers[q.id || String(i)] : answers[String(i)];
      return { index: i, correct: checkAnswer(q, given), given: given == null ? "" : String(given) };
    });
    return { correct: results.filter((r) => r.correct).length, total: questions.length, results };
  }
  /* Estimated practice band for short tests (labelled as an estimate on the site). */
  function bandEstimate(correct, total) {
    if (!total) return "—";
    const pct = correct / total;
    if (pct >= 0.98) return "9.0";
    if (pct >= 0.85) return "8.5";
    if (pct >= 0.75) return "8.0";
    if (pct >= 0.65) return "7.5";
    if (pct >= 0.55) return "7.0";
    if (pct >= 0.45) return "6.5";
    if (pct >= 0.35) return "6.0";
    if (pct >= 0.25) return "5.5";
    if (pct >= 0.15) return "5.0";
    return "4.5";
  }
  function formatClock(totalSeconds) {
    const s = Math.max(0, Math.floor(totalSeconds));
    const m = Math.floor(s / 60), r = s % 60;
    return m + ":" + String(r).padStart(2, "0");
  }
  function escapeHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function uid() {
    return "id-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
  }
  const U = { normalizeAnswer, checkAnswer, scoreTest, bandEstimate, formatClock, escapeHtml, uid };
  root.IELTS_UTIL = U;
  if (typeof module !== "undefined" && module.exports) module.exports = U;
})(typeof window !== "undefined" ? window : globalThis);
