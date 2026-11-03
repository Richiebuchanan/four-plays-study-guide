# Content schema for each play data file

Each play lives in `data/<id>.js` and starts with:
```js
window.PLAYS = window.PLAYS || {};
window.PLAYS["<id>"] = { ...object below... };
```
Plain JS object literal, double-quoted strings, valid JSON-compatible values (no functions, no trailing commas needed but allowed). Paragraphs inside a string are separated by "\n\n". No HTML in strings except none; plain text only. Bold/emphasis is not supported; do not use markdown.

ids: "salesman", "raisin", "trifles", "sandbox".

## Top level
- id, title, author, year (number), genre (short), accent (leave out), 
- edition: string naming Elijah's edition (e.g. "Penguin Twentieth-Century Classics; page numbers match this edition")
- readTime: e.g. "About 2.5 hours to read"
- tagline: one sentence hook
- context: { author: "3-5 sentence bio paragraph(s)", background: "historical/cultural context paragraph(s)", whyItMatters: "paragraph", plot60: "plain 60-second plot overview (6-9 sentences)", profChecklist: ["8-10 things a college prof expects a student to be able to say about this play"] }
- sections: array of { id, label, where (pages or act/scene text matching his book), tag ("present"|"memory"|"mixed"|"") , setting (1 short line), summary (2-4 short paragraphs, 7th-grade reading level), why (one line: "why this matters"), keyMoments: [3-5 short bullets] }
- characters: array of { name, role (short), description (2-3 sentences), represents (what the character stands for, 1-2 sentences), relationships (1-2 sentences) }
- themes: array of { title, explanation (plain language, 3-5 sentences, the thing a college professor expects), evidence: [ { where, note } 2-4 items pointing to specific scenes/pages], examTip (1-2 sentences: how this shows up in exam questions) }
- symbols: array of { name, meaning, where }
- craft: array of { title, text } covering form, structure, staging, genre, language, point of view. Include literary-term names.
- vocab: array of { term, def } hard words, idioms, period slang a diverse student population might not know (15-30 items); def in plain language.
- quotes: array of { text (SHORT: max 12 words for copyrighted plays; Trifles may be longer), speaker, where, meaning (what it reveals, 2 sentences), themes: [theme titles] } 8-12 items
- whoSaid: array of { line (SHORT, max 12 words for copyrighted plays; or a paraphrase labelled so), options: [4 character names], answer: index 0-3, why } 8 items
- timeline: array of event strings IN CORRECT ORDER (10-14). The site shuffles them.
- themeMatch: array of { theme (a theme title), prompt (scenario question like "Which scene best shows ..."), options: [4 scene descriptions], answer: index, why } 5-6 items
- flashcards: array of { front, back, cat ("character"|"symbol"|"term"|"theme"|"plot"|"quote") }
- quizzes: object mapping section id -> array of 3-4 { q, options: [4 strings], answer: index 0-3, why } . EVERY section id must have a quiz. Vary question types: recall, inference, meaning-of-quote, theme link. Explanation (`why`) always required and says why wrong choices are wrong in one clause when helpful. Distribute correct answer positions evenly; do not put the answer at index 0 more than 35% of the time.
- examQuestions: array of { q, options: [4], answer, why } 8-14 items, harder than section quizzes, college-exam style; include some interpretation and literary-terms items
- presentMemory: ONLY for salesman: array of { scene (short description), answer ("present"|"memory"), why } 10-12 items. For other plays omit.
- essayPrompts: array of { id, type ("character"|"theme"|"craft"|"quote"|"short-answer"), prompt, targetWords (number), rubricFocus: [3-4 things graders look for], thesisStarters: [2-3 sentence starters], modelOutline: [4-6 bullet strings: thesis then points with evidence then conclusion idea], modelParagraph (a model B-level analytic paragraph, 110-160 words, claim-evidence-analysis, using only short quotes or paraphrase for copyrighted works), annotation (2-3 sentences explaining what makes the model paragraph work), checklist: [5-6 self-check yes/no statements] } 4 prompts
- watch: { version (what to watch), where (where to find it), link (url or ""), runtimeNote, differences: [honest notes about how that version may differ from his text; only claim what you are confident of; otherwise say "may" and tell him to watch for it], before: { brief (60-second context), lookFor: [exactly 3 things to watch for] }, during: array of 6-10 { cue (a story-event cue like "When Willy comes home early from his trip" - NOT timestamps, you cannot watch it), question, answer (short) }, after: { quiz: [3-5 {q, options:[4], answer, why}], reflection: [3 reflection questions], prompt (one practice essay prompt string) } , noteSheet: array of 4-6 { heading, items: [3-6 fill-in/jot prompts as strings] } }

## Style rules (critical)
- Summaries: 7th-grade reading level: short sentences, common words, define a hard word when you must use it, name who is speaking and where. Accuracy is more important than style; be faithful to HIS edition's text in /home/claude/... source txt files (see below).
- Tone: respectful, college-appropriate, not childish.
- Diverse readership: avoid idioms without explanation; explain period references (1949 salesman culture, 1959 Chicago housing, 1916 farm life) in plain words.
- COPYRIGHT: Salesman, Raisin, Sandbox are copyrighted. Do NOT copy passages. Paraphrase. Quotes at most 12 words each, and only the allotted quote items. Trifles is public domain (1916) and may be quoted more.
- Do not invent plot facts. Verify against the source text with grep/Read before writing. If unsure, check.
- Interpretations should reflect mainstream scholarship, and say "many critics argue" for contested readings.
