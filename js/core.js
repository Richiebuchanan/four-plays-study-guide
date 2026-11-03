/* Core: storage, helpers, glossary popovers, reusable study components.
   No external libraries. Works offline and from GitHub Pages. */
(function () {
  "use strict";
  const S = window.SHARED, P = window.PLAYS;

  /* ---------- storage (always wrapped: private windows can throw) ---------- */
  const KEY = "lsg.v1";
  let state = {};
  try { const r = localStorage.getItem(KEY); if (r) state = JSON.parse(r) || {}; } catch (e) { state = {}; }
  let saveTimer = null;
  function flush() { clearTimeout(saveTimer); try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ } }
  function save() { clearTimeout(saveTimer); saveTimer = setTimeout(flush, 150); }
  window.addEventListener("pagehide", flush);
  window.addEventListener("beforeunload", flush);
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") flush(); });
  function get(path, def) {
    let o = state;
    for (const k of path) { if (o == null || typeof o !== "object") return def; o = o[k]; }
    return o === undefined ? def : o;
  }
  function set(path, val) {
    let o = state;
    for (let i = 0; i < path.length - 1; i++) {
      const k = path[i];
      if (typeof o[k] !== "object" || o[k] === null) o[k] = {};
      o = o[k];
    }
    o[path[path.length - 1]] = val; save();
  }
  function del(path) {
    let o = state;
    for (let i = 0; i < path.length - 1; i++) { o = o && o[path[i]]; if (!o) return; }
    delete o[path[path.length - 1]]; save();
  }
  function resetAll() { state = {}; try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ } }

  /* ---------- helpers ---------- */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
  function escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function todayNum() { const d = new Date(); return Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000); }
  function words(t) { const m = String(t || "").trim().match(/\S+/g); return m ? m.length : 0; }
  function playColor(id) { return (S.playMeta[id] || {}).color || "salesman"; }
  function plural(n, w) { return n + " " + w + (n === 1 ? "" : "s"); }
  function pct(n) { return Math.round(n * 100) + "%"; }

  /* ---------- glossary auto-links ---------- */
  const NO_AUTO = { dialogue: 1, tone: 1, mood: 1, conflict: 1, theme: 1, symbol: 1, imagery: 1, diction: 1, resolution: 1, climax: 1, "rising action": 1, exposition: 1, monologue: 1 };
  const glCache = {};
  function glossFor(pid) {
    const key = pid || "_";
    if (glCache[key]) return glCache[key];
    const map = {};
    S.glossary.forEach(g => { if (g.cat !== "Writing" && !NO_AUTO[g.term.toLowerCase()]) map[esc(g.term).toLowerCase()] = { t: g.term, d: g.def }; });
    if (pid && P[pid]) (P[pid].vocab || []).forEach(v => { map[esc(v.term).toLowerCase()] = { t: v.term, d: v.def }; });
    const list = Object.keys(map).sort((a, b) => b.length - a.length);
    const re = list.length ? new RegExp("(^|[^A-Za-z0-9])(" + list.map(escRe).join("|") + ")(?![A-Za-z0-9])", "gi") : null;
    return (glCache[key] = { map, re });
  }
  /* rich(): escape text, split paragraphs, link the first occurrence of each glossary/vocab term */
  function rich(text, pid, noGloss) {
    const g = glossFor(pid); const seen = {};
    return String(text == null ? "" : text).split(/\n\n+/).map(p => {
      let h = esc(p);
      if (!noGloss && g.re) {
        h = h.replace(g.re, (m, pre, term) => {
          const k = term.toLowerCase(); const it = g.map[k];
          if (!it || seen[k]) return m;
          seen[k] = 1;
          return pre + '<button type="button" class="gl" data-gl="' + esc(it.d) + '" data-term="' + esc(it.t) + '">' + term + "</button>";
        });
      }
      return "<p>" + h + "</p>";
    }).join("");
  }
  function ul(items, cls) { return '<ul class="' + (cls || "") + '">' + (items || []).map(i => "<li>" + esc(i) + "</li>").join("") + "</ul>"; }

  /* ---------- toast + clipboard ---------- */
  function toast(msg) {
    let t = $("#toast");
    if (!t) { t = document.createElement("div"); t.id = "toast"; t.setAttribute("role", "status"); t.setAttribute("aria-live", "polite"); document.body.appendChild(t); }
    t.textContent = msg; t.className = "show";
    clearTimeout(toast._t); toast._t = setTimeout(() => { t.className = ""; }, 2600);
  }
  function copyText(text) {
    const done = () => toast("Copied. Now paste it into Claude.");
    const fallback = () => {
      const ta = document.createElement("textarea"); ta.value = text; ta.setAttribute("readonly", "");
      ta.style.position = "fixed"; ta.style.top = "0"; ta.style.opacity = "0"; document.body.appendChild(ta);
      ta.select(); let ok = false; try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      if (ok) done(); else toast("Copy was blocked. Select the text in the box and copy it by hand.");
      return ok;
    };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, fallback); else fallback();
  }

  /* ---------- QUIZ ---------- */
  /* questions: [{q, options[], answer, why}]  opts: {onAnswer(i, correct, q), onDone({score,total,missed})} */
  function renderQuiz(host, questions, opts) {
    opts = opts || {};
    const qs = questions.slice();
    let idx = 0, score = 0, missed = [], chosen = -1;
    host.classList.add("quiz");
    function draw() {
      if (idx >= qs.length) return done();
      const q = qs[idx];
      host.innerHTML =
        '<div class="quiz-head"><span class="qcount">Question ' + (idx + 1) + " of " + qs.length + '</span><div class="bar" aria-hidden="true"><i style="width:' + Math.round(idx / qs.length * 100) + '%"></i></div></div>' +
        '<p class="qtext" id="qtext">' + esc(q.q) + "</p>" +
        '<div class="opts" role="group" aria-labelledby="qtext">' + q.options.map((o, i) =>
          '<button type="button" class="opt" data-i="' + i + '"><span class="key">' + "ABCDEF"[i] + "</span><span>" + esc(o) + "</span></button>").join("") + "</div>" +
        '<div class="feedback" role="status" aria-live="polite"></div>';
      chosen = -1;
    }
    function choose(i) {
      if (chosen !== -1) return;
      chosen = i; const q = qs[idx]; const ok = i === q.answer;
      if (ok) score++; else missed.push(q);
      $$(".opt", host).forEach((b, k) => { b.disabled = true; if (k === q.answer) b.classList.add("right"); if (k === i && !ok) b.classList.add("wrong"); });
      const fb = $(".feedback", host);
      fb.className = "feedback show " + (ok ? "ok" : "no");
      fb.innerHTML = '<p><strong>' + (ok ? "Correct." : "Not quite.") + "</strong> " + (ok ? "" : "The answer is " + "ABCDEF"[q.answer] + ". ") + esc(q.why) + '</p><button type="button" class="btn primary next">' + (idx + 1 >= qs.length ? "See results" : "Next question") + "</button>";
      $(".next", fb).focus();
      if (opts.onAnswer) opts.onAnswer(idx, ok, q);
    }
    function done() {
      const res = { score, total: qs.length, missed };
      const ratio = qs.length ? score / qs.length : 0;
      host.innerHTML =
        '<div class="quiz-result"><p class="big">' + score + " / " + qs.length + "</p><p>" + (ratio >= 0.85 ? "Strong. You know this section." : ratio >= 0.6 ? "Good. Review the ones you missed." : "Worth another pass. Reread the summary, then try again.") + "</p>" +
        (missed.length ? '<h4>Review these</h4><ul class="missed">' + missed.map(q => "<li><strong>" + esc(q.q) + "</strong><br>Answer: " + esc(q.options[q.answer]) + "<br><span class=\"muted\">" + esc(q.why) + "</span></li>").join("") + "</ul>" : "") +
        '<div class="row"><button type="button" class="btn primary retry-all">Try again</button>' + (missed.length ? '<button type="button" class="btn retry-missed">Retry only the ones I missed</button>' : "") + "</div></div>";
      if (opts.onDone) opts.onDone(res);
    }
    host.onclick = e => {
      const o = e.target.closest(".opt"); if (o && host.contains(o)) return choose(+o.dataset.i);
      if (e.target.closest(".next")) { idx++; draw(); const f = $(".opt", host); if (f) f.focus(); return; }
      if (e.target.closest(".retry-all")) { idx = 0; score = 0; missed = []; qs.splice(0, qs.length, ...questions); draw(); return; }
      if (e.target.closest(".retry-missed")) { const m = missed.slice(); idx = 0; score = 0; missed = []; qs.splice(0, qs.length, ...m); draw(); }
    };
    host.onkeydown = e => {
      if (/^[1-6]$/.test(e.key) && chosen === -1 && qs[idx] && +e.key <= qs[idx].options.length) { choose(+e.key - 1); e.preventDefault(); }
    };
    draw();
  }

  /* ---------- FLASHCARDS (Leitner spaced repetition) ---------- */
  const INTERVALS = [0, 1, 3, 7, 14, 30];
  function cardState(pid, idx) { return get(["flash", pid, idx], null); }
  function cardDue(pid, idx) { const c = cardState(pid, idx); return !c || c.due <= todayNum(); }
  function dueCards(pid) {
    const out = [];
    (P[pid].flashcards || []).forEach((c, i) => { if (cardDue(pid, i)) out.push({ pid, idx: i, card: c }); });
    return out;
  }
  function masteredCount(pid) { return (P[pid].flashcards || []).filter((c, i) => (cardState(pid, i) || { box: 0 }).box >= 3).length; }
  function renderFlashcards(host, list, opts) {
    opts = opts || {};
    let queue = list.slice(0, opts.max || 20), i = 0, flipped = false, got = 0, miss = 0;
    host.classList.add("flash");
    function draw() {
      if (!queue.length) { host.innerHTML = '<div class="empty"><p class="big">Nothing due right now.</p><p>You are caught up. Come back tomorrow, or choose "All cards" to practice anyway.</p></div>'; return; }
      if (i >= queue.length) {
        host.innerHTML = '<div class="quiz-result"><p class="big">Session done</p><p>Got it: <strong>' + got + "</strong> &nbsp; Missed: <strong>" + miss + "</strong></p><p class=\"muted\">Missed cards come back sooner. Cards you got right come back after longer gaps.</p><div class=\"row\"><button type=\"button\" class=\"btn primary again\">Another round</button></div></div>";
        return;
      }
      const it = queue[i]; const c = it.card; const st = cardState(it.pid, it.idx);
      host.innerHTML =
        '<div class="quiz-head"><span class="qcount">Card ' + (i + 1) + " of " + queue.length + (opts.showPlay ? " · " + esc(S.playMeta[it.pid].short) : "") + '</span><span class="chip">' + esc(c.cat) + " · box " + ((st && st.box) || 0) + '</span></div>' +
        '<button type="button" class="fcard ' + (flipped ? "flipped" : "") + '" aria-label="Flip card"><span class="face front"><span class="lbl">Question</span>' + esc(c.front) + '</span><span class="face back"><span class="lbl">Answer</span>' + esc(c.back) + "</span></button>" +
        '<div class="row center">' + (flipped
          ? '<button type="button" class="btn miss">Missed it</button><button type="button" class="btn primary got">Got it</button>'
          : '<button type="button" class="btn primary flip">Show answer</button>') + '</div><p class="hint">Tip: press Space to flip, 1 for missed, 2 for got it.</p>';
      const f = $(flipped ? ".got" : ".flip", host); if (f) f.focus();
    }
    function grade(ok) {
      const it = queue[i]; const st = cardState(it.pid, it.idx) || { box: 0, due: 0 };
      const box = ok ? Math.min(5, st.box + 1) : 0;
      set(["flash", it.pid, it.idx], { box, due: todayNum() + INTERVALS[box] });
      if (ok) got++; else miss++;
      i++; flipped = false; draw();
    }
    host.onclick = e => {
      if (e.target.closest(".fcard") || e.target.closest(".flip")) { flipped = !flipped; draw(); return; }
      if (e.target.closest(".got")) return grade(true);
      if (e.target.closest(".miss")) return grade(false);
      if (e.target.closest(".again")) { queue = (opts.refill ? opts.refill() : list).slice(0, opts.max || 20); i = 0; got = 0; miss = 0; flipped = false; draw(); }
    };
    host.tabIndex = -1;
    host.onkeydown = e => {
      if (e.key === " " && !e.target.closest(".btn")) { e.preventDefault(); if (queue[i]) { flipped = !flipped; draw(); } }
      else if (flipped && e.key === "1") grade(false);
      else if (flipped && e.key === "2") grade(true);
    };
    draw();
  }

  /* ---------- TIMELINE ordering ---------- */
  function renderTimeline(host, events) {
    let order = shuffle(events.map((t, i) => i)); let checked = false;
    function draw() {
      host.innerHTML = '<p class="muted">Put the events in the order they happen. Use the arrows to move an event.</p><ol class="tl">' + order.map((ei, pos) =>
        '<li class="' + (checked ? (ei === pos ? "right" : "wrong") : "") + '"><span class="tltext">' + esc(events[ei]) + '</span><span class="tlbtns"><button type="button" class="icon up" data-pos="' + pos + '" aria-label="Move up"' + (pos === 0 ? " disabled" : "") + '>▲</button><button type="button" class="icon down" data-pos="' + pos + '" aria-label="Move down"' + (pos === order.length - 1 ? " disabled" : "") + ">▼</button></span></li>").join("") + "</ol>" +
        '<div class="row"><button type="button" class="btn primary check">Check order</button><button type="button" class="btn shuf">Shuffle again</button><button type="button" class="btn show">Show correct order</button></div><div class="feedback' + (checked ? " show" : "") + '" role="status" aria-live="polite">' + (checked ? tlMsg() : "") + "</div>";
    }
    function tlMsg() { const n = order.filter((ei, pos) => ei === pos).length; return "<p><strong>" + n + " of " + events.length + " in the right place.</strong>" + (n === events.length ? " Perfect." : " Green means correct. Fix the red ones and check again.") + "</p>"; }
    host.onclick = e => {
      const b = e.target.closest("button"); if (!b) return;
      if (b.classList.contains("up") || b.classList.contains("down")) {
        const p = +b.dataset.pos, q = b.classList.contains("up") ? p - 1 : p + 1;
        [order[p], order[q]] = [order[q], order[p]]; checked = false; draw();
        const nb = $('.' + (b.classList.contains("up") ? "up" : "down") + '[data-pos="' + q + '"]', host); if (nb) nb.focus();
      } else if (b.classList.contains("check")) { checked = true; draw(); }
      else if (b.classList.contains("shuf")) { order = shuffle(order); checked = false; draw(); }
      else if (b.classList.contains("show")) { order = events.map((t, i) => i); checked = true; draw(); }
    };
    draw();
  }

  /* ---------- WRITING LAB: option B (copy prompt to Claude) + option C (self check) ---------- */
  function buildPrompt(cfg, text, revision) {
    const rub = (cfg.rubricFocus || []).concat(S.universalRubric);
    return [
      "You are an English literature professor at a small, diverse university grading a student's exam response. The student's goal is a solid B. Be honest, specific, and encouraging, and grade against the rubric below.",
      "",
      "WORK: " + cfg.playTitle,
      "QUESTION: " + cfg.prompt,
      "TARGET LENGTH: about " + (cfg.targetWords || 300) + " words",
      "",
      "RUBRIC:",
      rub.map(r => "- " + r).join("\n"),
      "",
      revision ? "This is a REVISION of an earlier draft you already graded in this chat. First tell me whether the main problems you pointed out earlier are fixed, then grade this version the same way." : "",
      "STUDENT RESPONSE:",
      '"""',
      text.trim() || "[the student has not written anything yet]",
      '"""',
      "",
      "Please give me:",
      "1. An estimated letter grade (A to F) with a one-sentence reason.",
      "2. The two strongest things about the response.",
      "3. The two most important things to fix, with a short explanation of each.",
      "4. Any factual mistakes about the play (names, events, order of events).",
      "5. One rewritten sentence showing a stronger version of something I wrote.",
      "6. One question that would push my argument further.",
      "Do not rewrite the whole response for me. Keep the feedback plain and practical."
    ].filter((l, i, a) => !(l === "" && a[i - 1] === "")).join("\n");
  }
  function renderWriter(host, cfg) {
    const key = cfg.key; const hasModel = !!cfg.modelParagraph;
    const draft = get(["drafts", key], "");
    const checks = get(["checks", key], []);
    host.classList.add("writer");
    host.innerHTML =
      '<div class="prompt-card"><span class="lbl">' + esc(cfg.typeLabel || "Practice question") + '</span><p class="prompt">' + esc(cfg.prompt) + '</p><p class="muted">Target: about ' + (cfg.targetWords || 300) + " words. Rubric focus: " + esc((cfg.rubricFocus || []).join(" · ")) + "</p></div>" +
      (cfg.thesisStarters ? '<details class="starter"><summary>Need a way to start? Thesis starters</summary>' + ul(cfg.thesisStarters) + "</details>" : "") +
      '<label class="lbl" for="w-' + esc(key) + '">Your response (saved on this device as you type)</label>' +
      '<textarea id="w-' + esc(key) + '" rows="10" placeholder="Write your own answer here first. Start with a clear thesis.">' + esc(draft) + "</textarea>" +
      '<div class="wc"><span class="count">0 words</span><span class="goal muted"></span></div>' +
      '<div class="steps"><h4>Option B: get feedback from Claude</h4><ol>' +
      "<li>Write your answer above.</li><li>Click <strong>Copy grading prompt</strong>. It bundles the question, the rubric and your answer.</li><li>Click <strong>Open Claude</strong>, start a new chat, and paste.</li><li>Read the feedback, revise your answer here, then click <strong>Copy revision prompt</strong> and paste it into the same chat.</li></ol>" +
      '<div class="row"><button type="button" class="btn primary copyb">Copy grading prompt</button><a class="btn" href="https://claude.ai/new" target="_blank" rel="noopener">Open Claude</a><button type="button" class="btn copyr">Copy revision prompt</button></div>' +
      '<p class="muted small">Write in your own words and check your professor\'s policy on using AI tools for feedback. The prompt asks Claude not to rewrite your answer.</p></div>' +
      (hasModel
        ? '<div class="steps"><h4>Option C: check yourself</h4><p class="muted">Write first. The model answer unlocks after about 40 words so you are not copying it.</p><button type="button" class="btn reveal" disabled>Show model answer and checklist</button><div class="model" hidden></div></div>'
        : "");
    const ta = $("textarea", host), cnt = $(".count", host), goal = $(".goal", host);
    function upd() {
      const n = words(ta.value); cnt.textContent = plural(n, "word");
      const t = cfg.targetWords || 300; goal.textContent = n >= t ? "Target reached" : "Target " + t;
      const r = $(".reveal", host); if (r) r.disabled = n < 40 && !r.dataset.open;
    }
    ta.addEventListener("input", () => { set(["drafts", key], ta.value); upd(); });
    upd();
    $(".copyb", host).onclick = () => copyText(buildPrompt(cfg, ta.value, false));
    $(".copyr", host).onclick = () => copyText(buildPrompt(cfg, ta.value, true));
    if (hasModel) {
      const r = $(".reveal", host), m = $(".model", host);
      function showModel() {
        r.dataset.open = "1"; r.hidden = true; m.hidden = false;
        const saved = get(["checks", key], []);
        m.innerHTML = "<h5>Model outline</h5>" + ul(cfg.modelOutline, "outline") + "<h5>Model B-level paragraph</h5><blockquote>" + esc(cfg.modelParagraph) + '</blockquote><p class="muted"><strong>Why it works:</strong> ' + esc(cfg.annotation || "") + "</p>" +
          "<h5>Self-check: what did your answer do?</h5>" + '<div class="chk">' + (cfg.checklist || []).map((c, i) => '<label><input type="checkbox" data-i="' + i + '"' + (saved[i] ? " checked" : "") + "> " + esc(c) + "</label>").join("") + '</div><p class="score" role="status"></p>';
        function sc() { const arr = $$(".chk input", m).map(x => x.checked); set(["checks", key], arr); const n = arr.filter(Boolean).length; $(".score", m).textContent = n + " of " + arr.length + " checked. " + (n >= arr.length - 1 ? "That is B-level or better." : n >= Math.ceil(arr.length / 2) ? "Getting there. Fix the unchecked items." : "Revise using the model outline, then check again."); }
        $$(".chk input", m).forEach(x => x.addEventListener("change", sc)); sc();
      }
      r.onclick = showModel;
      if (checks.length && words(draft) >= 40) showModel();
    }
  }

  window.LSG = { S, P, get, set, del, resetAll, $, $$, esc, escRe, shuffle, todayNum, words, playColor, plural, pct, rich, ul, toast, copyText, renderQuiz, renderFlashcards, renderTimeline, renderWriter, dueCards, cardDue, cardState, masteredCount, buildPrompt };

  /* glossary popover (delegated) */
  document.addEventListener("click", e => {
    const b = e.target.closest(".gl"); let pop = $("#glpop");
    if (!b) { if (pop && !e.target.closest("#glpop")) pop.classList.remove("show"); return; }
    if (!pop) { pop = document.createElement("div"); pop.id = "glpop"; pop.setAttribute("role", "tooltip"); document.body.appendChild(pop); }
    pop.innerHTML = "<strong>" + esc(b.dataset.term) + "</strong><br>" + esc(b.dataset.gl);
    pop.classList.add("show");
    const r = b.getBoundingClientRect(); const pw = Math.min(320, window.innerWidth - 24);
    pop.style.width = pw + "px";
    pop.style.left = Math.max(12, Math.min(window.scrollX + r.left, window.scrollX + window.innerWidth - pw - 12)) + "px";
    pop.style.top = (window.scrollY + r.bottom + 8) + "px";
  });
  document.addEventListener("keydown", e => { if (e.key === "Escape") { const p = $("#glpop"); if (p) p.classList.remove("show"); } });
})();
