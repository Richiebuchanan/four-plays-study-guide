/* Pages and router. */
(function () {
  "use strict";
  const L = window.LSG, S = L.S, P = L.P;
  const { get, set, $, $$, esc, rich, ul, words, plural, pct, renderQuiz, renderFlashcards, renderTimeline, renderWriter } = L;
  const app = () => $("#app");
  let cleanup = null;

  const TABS = [["start", "Start here"], ["read", "Read"], ["understand", "Understand"], ["watch", "Watch"], ["practice", "Practice"], ["write", "Write"]];
  const TAGTXT = { present: "Present", memory: "Memory", mixed: "Present and memory" };

  /* ---------- small helpers ---------- */
  function bar(v) { return '<div class="bar" role="img" aria-label="' + pct(v) + ' complete"><i style="width:' + Math.round(v * 100) + '%"></i></div>'; }
  function playTitleOnly(pid) { return S.playMeta[pid].short; }
  function playProgress(pid) {
    const p = P[pid], n = p.sections.length;
    const read = p.sections.filter(s => get(["read", pid, s.id])).length / n;
    const quiz = p.sections.filter(s => get(["quiz", pid, s.id])).length / n;
    const flash = p.flashcards.length ? L.masteredCount(pid) / p.flashcards.length : 0;
    const essays = p.essayPrompts.filter(e => words(get(["drafts", pid + ":" + e.id], "")) >= 40).length / p.essayPrompts.length;
    const w = ["before", "during", "after"].filter(k => get(["watch", pid, k])).length / 3;
    return (read + quiz + flash + essays + w) / 5;
  }
  function fmtDay(n) { return new Date(n * 86400000).toLocaleDateString(undefined, { month: "short", day: "numeric", timeZone: "UTC" }); }
  function examNum() {
    const v = get(["exam"], "2026-12-01"); const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
    if (!m) return L.todayNum() + 28;
    return Math.round(Date.UTC(+m[1], +m[2] - 1, +m[3]) / 86400000);
  }
  function planDates() {
    const start = L.todayNum(), total = Math.max(7, examNum() - start); let acc = 0;
    return S.planPhases.map(ph => { const s = start + Math.round(acc * total); acc += ph.share; const e = Math.max(s, start + Math.round(acc * total) - 1); return { ph, s, e }; });
  }
  function missKeys() { return Object.keys(get(["misses"], {})); }
  function questionByKey(k) {
    const [pid, sid, i] = k.split("|"); const p = P[pid]; if (!p) return null;
    const q = sid === "exam" ? p.examQuestions[+i] : sid === "watch" ? p.watch.after.quiz[+i] : (p.quizzes[sid] || [])[+i];
    return q ? Object.assign({}, q, { _key: k, _pid: pid }) : null;
  }
  function trackOpts(keyMap, extra) {
    return {
      onAnswer(i, ok, q) { const k = keyMap.get(q); if (k) { if (ok) L.del(["misses", k]); else set(["misses", k], 1); } if (extra && extra.onAnswer) extra.onAnswer(i, ok, q); },
      onDone(r) { if (extra && extra.onDone) extra.onDone(r); }
    };
  }
  function keyMapFor(qs, keyFn) { const m = new Map(); qs.forEach((q, i) => m.set(q, keyFn(i, q))); return m; }
  function setPlayTheme(pid) { const a = app(); a.dataset.play = pid || ""; }
  function pageHead(h, sub, pid) {
    return '<header class="page-head' + (pid ? " play" : "") + '"><h1 id="pagetitle">' + esc(h) + "</h1>" + (sub ? '<p class="lede">' + esc(sub) + "</p>" : "") + "</header>";
  }

  /* ---------- HOME ---------- */
  function home(host) {
    setPlayTheme("");
    const days = examNum() - L.todayNum();
    const due = S.playOrder.reduce((n, pid) => n + L.dueCards(pid).length, 0), misses = missKeys().length;
    const hist = get(["exams"], []); const last = hist[hist.length - 1];
    const plan = planDates(); const t = L.todayNum();
    host.innerHTML =
      '<section class="hero"><p class="eyebrow">English Literature · Cumberland University</p><h1 id="pagetitle">Four plays. One exam.</h1>' +
      '<p class="lede">A plain-language study guide to <em>Trifles</em>, <em>The Sandbox</em>, <em>A Raisin in the Sun</em>, and <em>Death of a Salesman</em>. Read, watch, practice, and write your way to a solid B.</p>' +
      '<div class="countdown"><div><span class="num">' + (days > 0 ? days : 0) + '</span><span class="lab">days until the exam</span></div><label class="exam-date">Exam date <input type="date" id="examdate" value="' + esc(get(["exam"], "2026-12-01")) + '"></label></div>' +
      '<div class="row"><a class="btn primary" href="#/review">Daily review' + (due + misses ? " (" + (due + misses) + ")" : "") + '</a><a class="btn" href="#/practice-exam">Practice exam</a><a class="btn" href="#/exam-prep">Exam prep guide</a></div></section>' +
      '<section><h2>Your study plan</h2><p class="muted">Dates adjust to your exam date. Plays are ordered from shortest to longest, with review at the end.</p><div class="plan">' +
      plan.map(({ ph, s, e }, i) => {
        const now = t >= s && t <= e, prog = ph.plays.length ? ph.plays.reduce((a, pid) => a + playProgress(pid), 0) / ph.plays.length : 0;
        return '<article class="phase' + (now ? " now" : "") + '"><span class="wk">' + (now ? "This stretch · " : "") + fmtDay(s) + " – " + fmtDay(e) + "</span><h3>" + esc(ph.title) + "</h3><p>" + esc(ph.note) + "</p>" +
          (ph.plays.length ? bar(prog) + '<div class="row">' + ph.plays.map(pid => '<a class="chip lnk ' + S.playMeta[pid].color + '" href="#/play/' + pid + '">' + esc(S.playMeta[pid].short) + "</a>").join("") + "</div>" : '<div class="row"><a class="chip lnk" href="#/compare">Compare the plays</a><a class="chip lnk" href="#/practice-exam">Practice exam</a></div>') + "</article>";
      }).join("") + "</div></section>" +
      '<section><h2>The plays</h2><div class="grid plays">' + S.playOrder.map(pid => {
        const p = P[pid], pr = playProgress(pid);
        return '<a class="playcard ' + S.playMeta[pid].color + '" href="#/play/' + pid + '"><span class="wk">' + S.playMeta[pid].week + "</span><h3>" + esc(p.title) + "</h3><p class=\"by\">" + esc(p.author) + ", " + p.year + "</p><p>" + esc(p.tagline) + "</p>" + bar(pr) + '<span class="pr">' + pct(pr) + " complete</span></a>";
      }).join("") + "</div></section>" +
      '<section class="split"><div class="card"><h2>How this guide works</h2>' + ul([
        "Start here: who wrote it, why it matters, and the sixty-second plot.",
        "Read: scene-by-scene summaries at a plain reading level, with a quick check after each.",
        "Understand: characters, themes, symbols, and craft, the things a literature professor expects.",
        "Watch: a before, during, and after guide for the film or stage version, with a printable note sheet.",
        "Practice: quizzes, flashcards that come back when you need them, matching games, and a timeline builder.",
        "Write: practice essays. Get feedback from Claude (copy the grading prompt) or check yourself against a model answer."]) + '</div>' +
      '<div class="card"><h2>Where you stand</h2><ul><li><strong>' + plural(due, "flashcard") + "</strong> due today</li><li><strong>" + plural(misses, "missed question") + "</strong> waiting for review</li><li>Practice exam: " + (last ? "<strong>" + last.score + "%</strong> on " + esc(last.date) : "not taken yet") + '</li></ul><p class="muted small">Your progress is saved in this browser on this device only. There is no account and nothing is sent anywhere.</p></div></section>';
    $("#examdate").addEventListener("change", e => { if (e.target.value) { set(["exam"], e.target.value); home(host); } });
  }

  /* ---------- PLAY ---------- */
  function play(host, pid, tab, sub) {
    const p = P[pid]; setPlayTheme(S.playMeta[pid].color);
    if (!TABS.some(t => t[0] === tab)) tab = "start";
    host.innerHTML = '<header class="page-head play"><p class="eyebrow">' + esc(p.author) + " · " + p.year + " · " + esc(p.genre || "") + '</p><h1 id="pagetitle">' + esc(p.title) + '</h1><p class="lede">' + esc(p.tagline) + '</p><p class="muted small">' + esc(p.edition) + " · " + esc(p.readTime || "") + "</p></header>" +
      '<nav class="tabs" aria-label="Sections of this play">' + TABS.map(t => '<a href="#/play/' + pid + "/" + t[0] + '"' + (t[0] === tab ? ' aria-current="page"' : "") + ">" + t[1] + "</a>").join("") + '</nav><div id="tabbody"></div>';
    const body = $("#tabbody");
    ({ start: tabStart, read: tabRead, understand: tabUnderstand, watch: tabWatch, practice: tabPractice, write: tabWrite })[tab](body, pid, sub);
  }

  function tabStart(body, pid) {
    const p = P[pid], c = p.context;
    body.innerHTML = '<div class="split"><section class="card"><h2>About the author</h2>' + rich(c.author, pid) + '</section><section class="card"><h2>Background and context</h2>' + rich(c.background, pid) + "</section></div>" +
      '<section class="card"><h2>Why it matters</h2>' + rich(c.whyItMatters, pid) + "</section>" +
      '<section class="callout big"><h2>The 60-second plot</h2>' + rich(c.plot60, pid) + "</section>" +
      '<section class="card"><h2>What your professor will expect you to be able to say</h2><p class="muted">Check each box when you could explain it out loud in your own words.</p><div class="chk">' +
      c.profChecklist.map((t, i) => '<label><input type="checkbox" data-i="' + i + '"' + (get(["start", pid, i]) ? " checked" : "") + "> " + esc(t) + "</label>").join("") + '</div><p class="score" role="status"></p></section>' +
      '<section class="card"><h2>Watching it</h2><p><strong>' + esc(p.watch.version) + "</strong></p><p class=\"muted\">" + esc(p.watch.where) + '</p><a class="btn primary" href="#/play/' + pid + '/watch">Open the watch-along guide</a></section>';
    function sc() { const all = $$(".chk input", body); const n = all.filter(x => x.checked).length; $(".score", body).textContent = n + " of " + all.length + " ready"; }
    $$(".chk input", body).forEach(x => x.addEventListener("change", () => { set(["start", pid, +x.dataset.i], x.checked); sc(); })); sc();
  }

  function tabRead(body, pid) {
    const p = P[pid];
    body.innerHTML =
      '<div class="readlayout"><aside class="toc card" aria-label="Sections"><h2>Sections</h2><ol>' + p.sections.map(s => '<li><a href="#sec-' + s.id + '" data-jump="' + s.id + '"><span class="dot' + (get(["read", pid, s.id]) ? " on" : "") + '"></span>' + esc(s.label) + "</a></li>").join("") + "</ol></aside><div class=\"secs\">" +
      (pid === "salesman" ? '<div class="callout"><strong>Present or memory?</strong> This play jumps between Willy\'s real day and his memories without warning. Every section is tagged. <span class="tagchip present">Present</span> is what is really happening now. <span class="tagchip memory">Memory</span> is Willy remembering (or imagining) the past. <span class="tagchip mixed">Present and memory</span> means it switches back and forth.</div>' : "") +
      '<p class="muted">Read the pages in your book first (or at the same time). These summaries are a map, not a replacement for the play.</p>' +
      p.sections.map((s, i) =>
        '<article class="sec" id="sec-' + s.id + '"><header><span class="where">' + esc(s.where) + "</span><h3>" + (i + 1) + ". " + esc(s.label) + "</h3>" + (s.tag ? '<span class="tagchip ' + s.tag + '">' + TAGTXT[s.tag] + "</span>" : "") + "</header>" +
        (s.setting ? '<p class="setting">' + esc(s.setting) + "</p>" : "") + rich(s.summary, pid) +
        '<div class="callout why"><strong>Why it matters.</strong> ' + esc(s.why) + "</div>" +
        (s.keyMoments && s.keyMoments.length ? "<h4>Key moments</h4>" + ul(s.keyMoments) : "") +
        '<div class="row between"><label class="check"><input type="checkbox" class="markread" data-sid="' + s.id + '"' + (get(["read", pid, s.id]) ? " checked" : "") + "> I read this section</label>" +
        '<button type="button" class="btn quick" data-sid="' + s.id + '">Quick check (' + (p.quizzes[s.id] || []).length + ' questions)' + (get(["quiz", pid, s.id]) ? " · best " + get(["quiz", pid, s.id]).best + "/" + (p.quizzes[s.id] || []).length : "") + '</button></div><div class="quizhost card" hidden></div></article>').join("") + "</div></div>";
    body.addEventListener("change", e => {
      const m = e.target.closest(".markread"); if (!m) return;
      set(["read", pid, m.dataset.sid], m.checked);
      const d = $('[data-jump="' + m.dataset.sid + '"] .dot', body); if (d) d.classList.toggle("on", m.checked);
    });
    body.addEventListener("click", e => {
      const q = e.target.closest(".quick");
      if (q) {
        const sid = q.dataset.sid, art = q.closest(".sec"), host = $(".quizhost", art);
        if (!host.hidden) { host.hidden = true; return; }
        host.hidden = false;
        const qs = p.quizzes[sid], km = keyMapFor(qs, i => pid + "|" + sid + "|" + i);
        renderQuiz(host, qs, trackOpts(km, { onDone(r) { const prev = get(["quiz", pid, sid]); set(["quiz", pid, sid], { best: Math.max(r.score, prev ? prev.best : 0), last: r.score }); q.textContent = "Quick check (" + qs.length + " questions) · best " + Math.max(r.score, prev ? prev.best : 0) + "/" + qs.length; } }));
        host.scrollIntoView({ block: "nearest", behavior: "smooth" });
        return;
      }
      const j = e.target.closest("[data-jump]");
      if (j) { e.preventDefault(); const t = $("#sec-" + j.dataset.jump); if (t) { t.scrollIntoView({ behavior: "smooth", block: "start" }); t.setAttribute("tabindex", "-1"); t.focus({ preventScroll: true }); } }
    });
  }

  function tabUnderstand(body, pid) {
    const p = P[pid];
    body.innerHTML =
      '<nav class="subnav" aria-label="On this page"><a href="#" data-to="chars">Characters</a><a href="#" data-to="themes">Themes</a><a href="#" data-to="symbols">Symbols</a><a href="#" data-to="craft">Craft</a><a href="#" data-to="vocab">Vocabulary</a></nav>' +
      '<section id="chars"><h2>Character map</h2><div class="grid chars">' + p.characters.map(c =>
        '<article class="card char"><h3>' + esc(c.name) + '</h3><p class="role">' + esc(c.role) + "</p><p>" + esc(c.description) + '</p><p><strong>Stands for:</strong> ' + esc(c.represents) + "</p><p><strong>Relationships:</strong> " + esc(c.relationships) + "</p></article>").join("") + "</div></section>" +
      '<section id="themes"><h2>Themes</h2><p class="muted">These are the big ideas a college literature professor expects you to discuss. Open each one for evidence from the play and an exam tip.</p>' +
      p.themes.map((t, i) => '<details class="theme"' + (i === 0 ? " open" : "") + "><summary>" + esc(t.title) + "</summary>" + rich(t.explanation, pid) + "<h4>Where to find it</h4><ul>" + t.evidence.map(e => "<li><strong>" + esc(e.where) + ":</strong> " + esc(e.note) + "</li>").join("") + '</ul><div class="callout why"><strong>Exam tip.</strong> ' + esc(t.examTip) + "</div></details>").join("") + "</section>" +
      '<section id="symbols"><h2>Symbols and motifs</h2><div class="grid syms">' + p.symbols.map(s => '<article class="card"><h3>' + esc(s.name) + "</h3><p>" + esc(s.meaning) + '</p><p class="muted small">' + esc(s.where) + "</p></article>").join("") + "</div></section>" +
      '<section id="craft"><h2>Craft: how the play is built</h2>' + p.craft.map(c => '<article class="card craft"><h3>' + esc(c.title) + "</h3>" + rich(c.text, pid) + "</article>").join("") + "</section>" +
      '<section id="vocab"><h2>Vocabulary and references</h2><label class="lbl" for="vq">Search</label><input id="vq" class="search" type="search" placeholder="Type a word"><dl class="vocab">' + p.vocab.map(v => '<div data-t="' + esc((v.term + " " + v.def).toLowerCase()) + '"><dt>' + esc(v.term) + "</dt><dd>" + esc(v.def) + "</dd></div>").join("") + "</dl></section>";
    $(".subnav", body).addEventListener("click", e => { const a = e.target.closest("a"); if (!a) return; e.preventDefault(); const t = $("#" + a.dataset.to); if (t) t.scrollIntoView({ behavior: "smooth" }); });
    $("#vq", body).addEventListener("input", e => { const q = e.target.value.toLowerCase(); $$(".vocab > div", body).forEach(d => { d.hidden = q && d.dataset.t.indexOf(q) < 0; }); });
  }

  /* --- watch-along --- */
  function buildPrintSheet(pid) {
    const p = P[pid], w = p.watch; let sh = $("#printSheet"); if (!sh) { sh = document.createElement("div"); sh.id = "printSheet"; document.body.appendChild(sh); }
    const lines = n => '<div class="ln"></div>'.repeat(n);
    sh.innerHTML = "<h1>" + esc(p.title) + " · watch-along note sheet</h1><p>" + esc(w.version) + ". Name: ____________________ Date: __________</p>" +
      "<h2>Look for</h2><ol>" + w.before.lookFor.map(x => "<li>" + esc(x) + "</li>").join("") + "</ol>" +
      (pid === "salesman" ? "<h2>Present or memory tracker</h2><p>For each scene change, write P (present) or M (memory) and what told you.</p>" + lines(6) : "") +
      "<h2>Pause points</h2><ol>" + w.during.map(d => "<li>" + esc(d.cue) + " <em>" + esc(d.question) + "</em>" + lines(2) + "</li>").join("") + "</ol>" +
      w.noteSheet.map(n => "<h2>" + esc(n.heading) + "</h2><ul>" + n.items.map(i => "<li>" + esc(i) + lines(1) + "</li>").join("") + "</ul>").join("");
  }
  function tabWatch(body, pid) {
    const p = P[pid], w = p.watch, wd = k => get(["watch", pid, k], false);
    const tracker = get(["tracker", pid], []);
    body.innerHTML =
      '<div class="card"><h2>Which version?</h2><p><strong>' + esc(w.version) + "</strong></p><p>" + esc(w.where) + (w.link ? ' <a href="' + esc(w.link) + '" target="_blank" rel="noopener">Find it</a>' : "") + '</p><p class="muted">' + esc(w.runtimeNote || "") + '</p><h4>Differences from your book</h4>' + ul(w.differences) + '<div class="row"><button type="button" class="btn" id="printbtn">Print the note sheet</button></div></div>' +
      '<section class="stage"><h2><span class="n">1</span> Before you watch</h2>' + rich(w.before.brief, pid) + "<h4>Three things to watch for</h4><ol>" + w.before.lookFor.map(x => "<li>" + esc(x) + "</li>").join("") + '</ol><label class="check"><input type="checkbox" data-stage="before"' + (wd("before") ? " checked" : "") + "> I read the brief</label></section>" +
      '<section class="stage"><h2><span class="n">2</span> While you watch</h2><p class="muted">Pause at each cue, think about the question, then open the answer.</p><ol class="cues">' +
      w.during.map((d, i) => '<li><label class="check"><input type="checkbox" data-cue="' + i + '"' + (get(["watch", pid, "cue" + i]) ? " checked" : "") + "> <strong>" + esc(d.cue) + '</strong></label><p>' + esc(d.question) + "</p><details><summary>Show a sample answer</summary><p>" + esc(d.answer) + "</p></details></li>").join("") + "</ol>" +
      (pid === "salesman" ? '<div class="card tracker"><h3>Present or memory tracker</h3><p class="muted">Tap a button each time the play shifts. Add a clue (a sound, light, or a person who appears) if you can.</p><div class="row"><input id="trclue" class="search" type="text" placeholder="What told you? (optional)"><button type="button" class="btn tagchip present" data-tr="Present">Present</button><button type="button" class="btn tagchip memory" data-tr="Memory">Memory</button></div><ol class="trlog"></ol><button type="button" class="btn small" id="trclear">Clear log</button></div>' : "") +
      '</section><section class="stage"><h2><span class="n">3</span> After you watch</h2><h4>Quick recall quiz</h4><div class="quizhost card" id="watchquiz"></div><h4>Reflect</h4>' +
      w.after.reflection.map((r, i) => '<label class="lbl" for="rf' + i + '">' + esc(r) + '</label><textarea id="rf' + i + '" rows="3" data-i="' + i + '">' + esc(get(["reflect", pid, i], "")) + "</textarea>").join("") +
      '<h4>Practice essay</h4><div id="watchessay"></div><label class="check"><input type="checkbox" data-stage="after"' + (wd("after") ? " checked" : "") + "> I finished the after-watching work</label></section>";
    $$("[data-stage]", body).forEach(x => x.addEventListener("change", () => set(["watch", pid, x.dataset.stage], x.checked)));
    $$("[data-cue]", body).forEach(x => x.addEventListener("change", () => { set(["watch", pid, "cue" + x.dataset.cue], x.checked); const all = $$("[data-cue]", body); set(["watch", pid, "during"], all.every(y => y.checked)); }));
    $$("textarea[data-i]", body).forEach(t => t.addEventListener("input", () => set(["reflect", pid, +t.dataset.i], t.value)));
    const qs = w.after.quiz, km = keyMapFor(qs, i => pid + "|watch|" + i);
    renderQuiz($("#watchquiz", body), qs, trackOpts(km));
    renderWriter($("#watchessay", body), { key: pid + ":watch", playTitle: p.title, prompt: w.after.prompt, targetWords: 300, rubricFocus: ["Thesis answers the question", "Uses scenes from the version you watched"], typeLabel: "After-watching prompt" });
    $("#printbtn", body).onclick = () => { buildPrintSheet(pid); document.body.classList.add("print-sheet"); window.print(); setTimeout(() => document.body.classList.remove("print-sheet"), 500); };
    if (pid === "salesman") {
      const log = $(".trlog", body);
      const draw = () => { const t = get(["tracker", pid], []); log.innerHTML = t.map(x => '<li><span class="tagchip ' + x.m.toLowerCase() + '">' + x.m + "</span> " + esc(x.c || "") + "</li>").join(""); };
      draw();
      body.addEventListener("click", e => {
        const b = e.target.closest("[data-tr]"); if (b) { const t = get(["tracker", pid], []).slice(); t.push({ m: b.dataset.tr, c: $("#trclue", body).value }); set(["tracker", pid], t); $("#trclue", body).value = ""; draw(); }
        if (e.target.id === "trclear") { set(["tracker", pid], []); draw(); }
      });
    }
  }

  /* --- practice hub --- */
  function tabPractice(body, pid, mode) {
    const p = P[pid];
    const modes = [["quiz", "Section quizzes", "One quiz per section, with feedback on every answer."], ["flash", "Flashcards", "Spaced repetition. Missed cards come back sooner."], ["who", "Who said it?", "Match a line to the character."], ["timeline", "Timeline builder", "Put the events in order."], ["match", "Theme match", "Match a theme to the strongest scene."], ["quote", "Quote lab", "Say what a line reveals, then compare."], ["exam", "Exam-style questions", "Harder questions in the style of a college exam."]];
    if (pid === "salesman") modes.splice(5, 0, ["pm", "Present or memory?", "Decide where each scene happens."]);
    body.innerHTML = '<nav class="chips" aria-label="Practice activities">' + modes.map(m => '<a class="chip lnk' + (m[0] === mode ? " on" : "") + '" href="#/play/' + pid + "/practice/" + m[0] + '"' + (m[0] === mode ? ' aria-current="page"' : "") + ">" + m[1] + "</a>").join("") + '</nav><div id="mode" class="card"></div>';
    const host = $("#mode", body);
    if (!mode) {
      host.className = "grid modes"; host.innerHTML = modes.map(m => '<a class="card modecard" href="#/play/' + pid + "/practice/" + m[0] + '"><h3>' + m[1] + "</h3><p>" + m[2] + "</p></a>").join(""); return;
    }
    const intro = (t, d) => '<h2>' + t + '</h2><p class="muted">' + d + '</p><div class="act"></div>';
    if (mode === "quiz") {
      host.innerHTML = "<h2>Section quizzes</h2><div class=\"sqlist\">" + p.sections.map(s => { const r = get(["quiz", pid, s.id]); return '<div class="sqrow"><div><strong>' + esc(s.label) + '</strong><br><span class="muted small">' + esc(s.where) + '</span></div><div><span class="muted small">' + (r ? "best " + r.best + "/" + p.quizzes[s.id].length : "not tried") + '</span> <button type="button" class="btn small" data-sid="' + s.id + '">Start</button></div></div>'; }).join("") + '</div><div class="act"></div>';
      host.addEventListener("click", e => {
        const b = e.target.closest("[data-sid]"); if (!b) return; const sid = b.dataset.sid, qs = p.quizzes[sid], km = keyMapFor(qs, i => pid + "|" + sid + "|" + i);
        $(".sqlist", host).hidden = true; const act = $(".act", host); act.className = "act quizhost";
        act.insertAdjacentHTML("beforebegin", '<button type="button" class="btn small back">Back to list</button>');
        renderQuiz(act, qs, trackOpts(km, { onDone(r) { const prev = get(["quiz", pid, sid]); set(["quiz", pid, sid], { best: Math.max(r.score, prev ? prev.best : 0), last: r.score }); } }));
      });
      host.addEventListener("click", e => { if (e.target.closest(".back")) { practiceRerender(); } });
      return;
    }
    if (mode === "flash") {
      host.innerHTML = '<h2>Flashcards</h2><div class="row"><label class="lbl" for="fcat">Show</label><select id="fcat"><option value="due">Due today</option><option value="all">All cards</option>' + Array.from(new Set(p.flashcards.map(c => c.cat))).map(c => '<option value="' + esc(c) + '">' + esc(c) + " only</option>").join("") + '</select><span class="muted small">Mastered: ' + L.masteredCount(pid) + " of " + p.flashcards.length + '</span></div><div class="act"></div>';
      const run = () => {
        const v = $("#fcat", host).value; const all = p.flashcards.map((c, i) => ({ pid, idx: i, card: c }));
        const pool = () => v === "due" ? all.filter(x => L.cardDue(pid, x.idx)) : v === "all" ? L.shuffle(all) : all.filter(x => x.card.cat === v);
        renderFlashcards($(".act", host), pool(), { refill: pool });
      };
      $("#fcat", host).addEventListener("change", run); run(); return;
    }
    if (mode === "who") {
      host.innerHTML = intro("Who said it?", "Pick the character.");
      const qs = p.whoSaid.map(w => ({ q: 'Who says: "' + w.line + '"?', options: w.options, answer: w.answer, why: w.why })); renderQuiz($(".act", host), L.shuffle(qs)); return;
    }
    if (mode === "timeline") { host.innerHTML = intro("Timeline builder", "Put the story events in order."); renderTimeline($(".act", host), p.timeline); return; }
    if (mode === "match") {
      host.innerHTML = intro("Theme match", "Which scene or moment best supports the theme?");
      const qs = p.themeMatch.map(m => ({ q: "Theme: " + m.theme + ". " + m.prompt, options: m.options, answer: m.answer, why: m.why })); renderQuiz($(".act", host), qs); return;
    }
    if (mode === "pm") {
      host.innerHTML = intro("Present or memory?", "Is the scene happening now in Willy's real day, or is it a memory (or imagining)?");
      const qs = p.presentMemory.map(m => ({ q: m.scene, options: ["Present", "Memory"], answer: m.answer === "present" ? 0 : 1, why: m.why })); renderQuiz($(".act", host), L.shuffle(qs)); return;
    }
    if (mode === "exam") {
      host.innerHTML = intro("Exam-style questions", "A mix of harder questions on this play.");
      const qs = p.examQuestions, km = keyMapFor(qs, i => pid + "|exam|" + i); renderQuiz($(".act", host), qs, trackOpts(km)); return;
    }
    if (mode === "quote") {
      host.innerHTML = '<h2>Quote lab</h2><p class="muted">Read the line. Write what it reveals about the character or theme. Then check your thinking.</p><div class="qlab"></div>';
      const list = L.shuffle(p.quotes); const qh = $(".qlab", host);
      qh.innerHTML = list.map((q, i) => '<article class="card ql"><blockquote>' + esc(q.text) + '</blockquote><p class="muted small">' + esc(q.speaker) + " · " + esc(q.where) + '</p><label class="lbl" for="ql' + i + '">What does this line reveal?</label><textarea id="ql' + i + '" rows="3"></textarea><button type="button" class="btn small rv">Compare with the guide</button><div class="callout why" hidden><p>' + esc(q.meaning) + '</p><p class="muted small">Themes: ' + esc((q.themes || []).join(", ")) + "</p></div></article>").join("");
      qh.addEventListener("click", e => { const b = e.target.closest(".rv"); if (b) { b.nextElementSibling.hidden = false; b.hidden = true; } });
    }
    function practiceRerender() { tabPractice(body, pid, mode); }
  }

  /* --- write tab --- */
  function tabWrite(body, pid) {
    const p = P[pid];
    body.innerHTML = '<div class="callout"><strong>How this works.</strong> Pick a prompt and write your own answer first. Then either copy a ready-made grading prompt into Claude for feedback (Option B), or compare your answer with a model outline and checklist (Option C).</div>' +
      p.essayPrompts.map((e, i) => '<details class="essaybox"' + (i === 0 ? " open" : "") + "><summary>" + (i + 1) + ". " + esc(e.type) + " · " + esc(e.prompt.length > 90 ? e.prompt.slice(0, 90) + "…" : e.prompt) + (words(get(["drafts", pid + ":" + e.id], "")) >= 40 ? ' <span class="chip">drafted</span>' : "") + '</summary><div class="wr" data-i="' + i + '"></div></details>').join("");
    $$(".wr", body).forEach(h => { const e = p.essayPrompts[+h.dataset.i]; renderWriter(h, Object.assign({}, e, { key: pid + ":" + e.id, playTitle: p.title, typeLabel: "Practice prompt · " + e.type })); });
  }

  /* ---------- COMPARE ---------- */
  function compare(host) {
    setPlayTheme("");
    const C = S.compare;
    host.innerHTML = pageHead("Compare the plays", "College exams often ask you to connect works. Use these side-by-side notes to find shared ideas and differences.") +
      '<section><h2>Themes across the plays</h2>' + C.themes.map((t, i) =>
        '<details class="theme cmp"' + (i === 0 ? " open" : "") + "><summary>" + esc(t.title) + "</summary><p>" + esc(t.summary) + '</p><div class="cmpgrid">' + S.playOrder.slice().reverse().map(pid => '<div class="cell ' + S.playMeta[pid].color + '"><h4>' + esc(S.playMeta[pid].short) + "</h4><p>" + esc(t.cells[pid]) + "</p></div>").join("") + "</div></details>").join("") + "</section>" +
      '<section><h2>The realism spectrum</h2><p class="muted">Form is a favorite exam topic. The plays fall along a line from everyday realism to absurdism.</p><div class="spectrum">' + C.spectrum.map(s => '<div class="spot ' + S.playMeta[s.play].color + '"><strong>' + esc(S.playMeta[s.play].short) + "</strong><span>" + esc(s.label) + "</span></div>").join("") + "</div></section>" +
      '<section><h2>Practice comparison essays</h2>' + C.essays.map((e, i) => '<details class="essaybox"' + (i === 0 ? " open" : "") + "><summary>" + (i + 1) + ". " + esc(e.prompt.length > 100 ? e.prompt.slice(0, 100) + "…" : e.prompt) + '</summary><div class="wr" data-i="' + i + '"></div></details>').join("") + "</section>";
    $$(".wr", host).forEach(h => { const e = C.essays[+h.dataset.i]; renderWriter(h, Object.assign({}, e, { key: "cmp:" + e.id, playTitle: "Comparison of the course plays (Trifles, The Sandbox, A Raisin in the Sun, Death of a Salesman)", typeLabel: "Comparison prompt" })); });
  }

  /* ---------- EXAM PREP ---------- */
  function examPrep(host) {
    setPlayTheme(""); const X = S.examPrep, T = X.tragedyBox;
    host.innerHTML = pageHead("Exam prep guide", "How to turn what you know into a B-level answer.") +
      '<section class="split"><div class="card"><h2>Study habits that work</h2>' + ul(X.planTips) + '</div><div class="card"><h2>Know your question type</h2><dl class="vocab">' + X.questionTypes.map(q => "<div><dt>" + esc(q.type) + "</dt><dd>" + esc(q.tip) + "</dd></div>").join("") + "</dl></div></section>" +
      "<section><h2>The paragraph that earns a B</h2><div class=\"grid four\">" + X.paragraphGuide.map((s, i) => '<article class="card step"><span class="n">' + (i + 1) + "</span><h3>" + esc(s.step) + "</h3><p>" + esc(s.text) + "</p></article>").join("") + "</div></section>" +
      '<section class="card"><h2>Paragraph builder</h2><p class="muted">Fill in each part, then combine them.</p><label class="lbl" for="pb1">Claim</label><textarea id="pb1" rows="2"></textarea><label class="lbl" for="pb2">Evidence (scene or short quote)</label><textarea id="pb2" rows="2"></textarea><label class="lbl" for="pb3">Analysis (so what?)</label><textarea id="pb3" rows="3"></textarea><div class="row"><button type="button" class="btn primary" id="pbgo">Combine</button><button type="button" class="btn" id="pbcopy">Copy paragraph</button></div><blockquote id="pbout" hidden></blockquote></section>' +
      '<section class="split"><div class="card"><h2>What a C, B, and A look like</h2><dl class="vocab">' + X.rubricLevels.map(r => "<div><dt>" + r.grade + "</dt><dd>" + esc(r.looks) + "</dd></div>").join("") + '</dl></div><div class="card"><h2>Common mistakes</h2>' + ul(X.mistakes) + "</div></section>" +
      '<section class="card"><h2>Thesis formulas</h2>' + ul(X.thesisFormulas) + "</section>" +
      '<section class="card"><h2>' + esc(T.title) + "</h2><p>" + esc(T.aristotle) + "</p><p>" + esc(T.miller) + '</p><div class="split"><div class="callout"><strong>The case for:</strong> ' + esc(T.yes) + '</div><div class="callout"><strong>The case against:</strong> ' + esc(T.no) + "</div></div><p><strong>Exam tip:</strong> " + esc(T.tip) + "</p></section>" +
      '<section class="card"><h2>The universal rubric</h2>' + ul(S.universalRubric) + '<p class="muted">The writing lab uses this rubric when you copy the grading prompt.</p></section>';
    $("#pbgo", host).onclick = () => { const o = $("#pbout", host); o.hidden = false; o.textContent = [$("#pb1", host).value, $("#pb2", host).value, $("#pb3", host).value].map(s => s.trim()).filter(Boolean).join(" "); };
    $("#pbcopy", host).onclick = () => { $("#pbgo", host).click(); L.copyText($("#pbout", host).textContent); };
  }

  /* ---------- GLOSSARY ---------- */
  function glossary(host) {
    setPlayTheme(""); const cats = Array.from(new Set(S.glossary.map(g => g.cat)));
    host.innerHTML = pageHead("Glossary of literary terms", "Terms your professor will use. Click a highlighted word anywhere in the guide to see its meaning.") +
      '<div class="row"><label class="lbl" for="gq">Search</label><input id="gq" class="search" type="search" placeholder="Type a term"><select id="gc" aria-label="Category"><option value="">All categories</option>' + cats.map(c => '<option>' + esc(c) + "</option>").join("") + '</select></div><dl class="vocab big">' +
      S.glossary.slice().sort((a, b) => a.term.localeCompare(b.term)).map(g => '<div data-c="' + esc(g.cat) + '" data-t="' + esc((g.term + " " + g.def).toLowerCase()) + '"><dt>' + esc(g.term) + ' <span class="chip">' + esc(g.cat) + "</span></dt><dd>" + esc(g.def) + "</dd></div>").join("") + "</dl>";
    const f = () => { const q = $("#gq", host).value.toLowerCase(), c = $("#gc", host).value; $$(".vocab > div", host).forEach(d => { d.hidden = (q && d.dataset.t.indexOf(q) < 0) || (c && d.dataset.c !== c); }); };
    $("#gq", host).addEventListener("input", f); $("#gc", host).addEventListener("change", f);
  }

  /* ---------- REVIEW ---------- */
  function review(host) {
    setPlayTheme("");
    const all = []; S.playOrder.forEach(pid => L.dueCards(pid).forEach(x => all.push(x)));
    const mk = missKeys().map(questionByKey).filter(Boolean);
    host.innerHTML = pageHead("Daily review", "Spaced repetition: cards you missed come back soon. Cards you know come back later.") +
      '<section class="split"><div class="card"><h2>Flashcards due (' + all.length + ')</h2><div id="rf"></div></div><div class="card"><h2>Missed questions (' + mk.length + ')</h2><p class="muted">Quiz answers you missed are saved here. Answer one correctly and it leaves the list.</p><div id="rq"></div></div></section>';
    renderFlashcards($("#rf", host), L.shuffle(all), { showPlay: true, max: 20, refill: () => L.shuffle([].concat(...S.playOrder.map(pid => L.dueCards(pid)))) });
    const rq = $("#rq", host);
    if (!mk.length) rq.innerHTML = '<div class="empty"><p class="big">No missed questions.</p><p>Take some quizzes first, then come back here.</p></div>';
    else { const qs = L.shuffle(mk).slice(0, 10); const km = keyMapFor(qs, (i, q) => q._key); renderQuiz(rq, qs, trackOpts(km)); }
  }

  /* ---------- PRACTICE EXAM ---------- */
  function practiceExam(host) {
    setPlayTheme("");
    let timer = null; cleanup = () => { if (timer) clearInterval(timer); };
    const hist = get(["exams"], []);
    host.innerHTML = pageHead("Practice exam", "Multiple choice across all four plays, quote identification, and one essay. Take it without your book first.") +
      '<section class="card" id="exsetup"><h2>Choose a version</h2><div class="row"><button type="button" class="btn primary" data-v="full">Full exam (24 questions, 3 quotes, essay)</button><button type="button" class="btn" data-v="quick">Quick check (12 questions, 2 quotes)</button></div><label class="check"><input type="checkbox" id="extimer"> Show a stopwatch</label>' +
      (hist.length ? "<h3>Past attempts</h3><ul>" + hist.slice(-5).reverse().map(h => "<li>" + esc(h.date) + ": " + h.score + "% (" + esc(h.version) + ")</li>").join("") + "</ul>" : "") + '</section><section id="exrun" hidden></section>';
    $("#exsetup", host).addEventListener("click", e => { const b = e.target.closest("[data-v]"); if (b) start(b.dataset.v); });
    function pick(pid, n) { const p = P[pid]; return L.shuffle(p.examQuestions.map((q, i) => Object.assign({}, q, { _pid: pid, _key: pid + "|exam|" + i }))).slice(0, n); }
    function start(v) {
      const full = v === "full"; const counts = full ? { salesman: 7, raisin: 7, trifles: 5, sandbox: 5 } : { salesman: 3, raisin: 3, trifles: 3, sandbox: 3 };
      const qs = L.shuffle([].concat(...S.playOrder.map(pid => pick(pid, counts[pid]))));
      const tally = {}; S.playOrder.forEach(pid => { tally[pid] = { ok: 0, n: 0 }; });
      $("#exsetup", host).hidden = true; const run = $("#exrun", host); run.hidden = false;
      const showTimer = $("#extimer", host).checked;
      run.innerHTML = (showTimer ? '<p class="timer" aria-live="off">Time: <span id="tm">0:00</span></p>' : "") + '<div class="card" id="part1"><h2>Part I. Multiple choice</h2><div id="p1q"></div></div><div id="part2"></div><div id="part3"></div><div id="part4"></div>';
      if (showTimer) { const t0 = Date.now(); timer = setInterval(() => { const s = Math.floor((Date.now() - t0) / 1000); const el = $("#tm"); if (el) el.textContent = Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); }, 1000); }
      let score = 0;
      const km = new Map(); qs.forEach(q => km.set(q, q._key));
      renderQuiz($("#p1q", run), qs, trackOpts(km, {
        onAnswer(i, ok, q) { tally[q._pid].n++; if (ok) tally[q._pid].ok++; },
        onDone(r) { score = r.score; part2(); }
      }));
      function part2() {
        const pool = L.shuffle([].concat(...S.playOrder.map(pid => P[pid].quotes.map(q => Object.assign({ pid }, q))))).slice(0, full ? 3 : 2);
        $("#part2", run).innerHTML = '<div class="card"><h2>Part II. Identify and explain</h2><p class="muted">For each line, write: who says it, which play, and why it matters (2 to 4 sentences).</p>' + pool.map((q, i) => '<article class="ql"><blockquote>' + esc(q.text) + '</blockquote><textarea rows="3" aria-label="Your answer"></textarea><button type="button" class="btn small rv">Check my answer</button><div class="callout why" hidden><p><strong>' + esc(q.speaker) + "</strong>, " + esc(S.playMeta[q.pid].short) + " (" + esc(q.where) + ")</p><p>" + esc(q.meaning) + "</p></div></article>").join("") + '<button type="button" class="btn primary" id="to3">Continue to the essay</button></div>';
        $("#part2", run).scrollIntoView({ behavior: "smooth", block: "start" });
        $("#part2", run).addEventListener("click", e => { const b = e.target.closest(".rv"); if (b) { b.nextElementSibling.hidden = false; b.hidden = true; } if (e.target.id === "to3") part3(); });
      }
      function part3() {
        const comp = S.compare.essays; const opts = L.shuffle(S.playOrder).slice(0, 2).map(pid => ({ pid, e: L.shuffle(P[pid].essayPrompts)[0] })); const c = L.shuffle(comp)[0];
        $("#part3", run).innerHTML = '<div class="card"><h2>Part III. Essay</h2><p class="muted">Choose one question. Spend five minutes on an outline first.</p><div class="row essopts"><button type="button" class="chip lnk" data-o="0">Option A: ' + esc(S.playMeta[opts[0].pid].short) + '</button><button type="button" class="chip lnk" data-o="1">Option B: ' + esc(S.playMeta[opts[1].pid].short) + '</button><button type="button" class="chip lnk" data-o="2">Option C: Comparison</button></div><div id="exw"></div><div class="row"><button type="button" class="btn primary" id="finish">Finish the exam</button></div></div>';
        $("#part3", run).scrollIntoView({ behavior: "smooth", block: "start" });
        $("#part3", run).addEventListener("click", e => {
          const o = e.target.closest("[data-o]");
          if (o) { const i = +o.dataset.o; const cfg = i === 2 ? Object.assign({}, c, { key: "exam:" + c.id, playTitle: "Comparison of the course plays", typeLabel: "Exam essay" }) : Object.assign({}, opts[i].e, { key: "exam:" + opts[i].pid + ":" + opts[i].e.id, playTitle: P[opts[i].pid].title, typeLabel: "Exam essay" }); renderWriter($("#exw", run), cfg); }
          if (e.target.id === "finish") finish();
        });
      }
      function finish() {
        if (timer) { clearInterval(timer); timer = null; }
        const total = qs.length, scorePct = Math.round(score / total * 100); const h = get(["exams"], []).slice(); h.push({ date: new Date().toLocaleDateString(), score: scorePct, version: full ? "full" : "quick" }); set(["exams"], h);
        const rows = S.playOrder.map(pid => ({ pid, n: tally[pid].n, ok: tally[pid].ok })).filter(r => r.n);
        const weak = rows.slice().sort((a, b) => a.ok / a.n - b.ok / b.n)[0];
        $("#part4", run).innerHTML = '<div class="card result"><h2>Your results</h2><p class="big">' + scorePct + '%</p><p>Multiple choice: ' + score + " of " + total + ' correct.</p><ul>' + rows.map(r => '<li><strong>' + esc(S.playMeta[r.pid].short) + ":</strong> " + r.ok + " of " + r.n + "</li>").join("") + "</ul>" + (weak ? '<p>Weakest area: <a href="#/play/' + weak.pid + '/practice">' + esc(S.playMeta[weak.pid].short) + '</a>. Missed questions were added to your <a href="#/review">daily review</a>.</p>' : "") + '<p class="muted">Check the essay with the model outline or copy the grading prompt into Claude.</p></div>';
        $("#part4", run).scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }

  /* ---------- ROUTER ---------- */
  function route() {
    if (cleanup) { cleanup(); cleanup = null; }
    const parts = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean); const host = app();
    $$("#glpop").forEach(x => x.classList.remove("show"));
    if (parts[0] === "play" && P[parts[1]]) play(host, parts[1], parts[2] || "start", parts[3]);
    else if (parts[0] === "compare") compare(host);
    else if (parts[0] === "exam-prep") examPrep(host);
    else if (parts[0] === "practice-exam") practiceExam(host);
    else if (parts[0] === "glossary") glossary(host);
    else if (parts[0] === "review") review(host);
    else home(host);
    const key = parts[0] === "play" ? "play/" + parts[1] : parts[0] || "";
    $$("#mainnav a").forEach(a => { const h = a.getAttribute("href").replace(/^#\/?/, ""); if (h === key) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
    window.scrollTo(0, 0);
    const t = $("#pagetitle"); if (t) { t.setAttribute("tabindex", "-1"); t.focus({ preventScroll: true }); }
  }
  window.addEventListener("hashchange", route);

  /* ---------- settings: text size, theme, reset ---------- */
  const root = document.documentElement;
  function applyPrefs() {
    root.style.setProperty("--scale", [0.9, 1, 1.12, 1.25][get(["prefs", "size"], 1)] || 1);
    const th = get(["prefs", "theme"], "auto"); if (th === "auto") root.removeAttribute("data-theme"); else root.setAttribute("data-theme", th);
  }
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-pref]"); if (!b) return;
    if (b.dataset.pref === "size") { const cur = get(["prefs", "size"], 1); set(["prefs", "size"], Math.max(0, Math.min(3, cur + (+b.dataset.d)))); }
    if (b.dataset.pref === "theme") { const order = ["auto", "light", "dark"]; const cur = get(["prefs", "theme"], "auto"); const nx = order[(order.indexOf(cur) + 1) % 3]; set(["prefs", "theme"], nx); b.textContent = "Theme: " + nx; }
    applyPrefs();
  });
  document.addEventListener("click", e => {
    const b = e.target.closest("#resetbtn"); if (!b) return;
    if (b.dataset.armed) { L.resetAll(); location.hash = "#/"; location.reload(); }
    else { b.dataset.armed = "1"; b.textContent = "Click again to erase all progress"; setTimeout(() => { delete b.dataset.armed; b.textContent = "Reset my progress"; }, 5000); }
  });
  applyPrefs();
  const tb = $('[data-pref="theme"]'); if (tb) tb.textContent = "Theme: " + get(["prefs", "theme"], "auto");
  route();
})();
