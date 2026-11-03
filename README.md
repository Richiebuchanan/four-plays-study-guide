# Four Plays Study Guide

A static study guide for *Trifles*, *The Sandbox*, *A Raisin in the Sun*, and *Death of a Salesman*.
Plain HTML, CSS and JavaScript. No build step, no server, no accounts. Student progress is saved in the browser only.

## Deploy to GitHub Pages

### Option 1: GitHub website only (no tools needed)
1. Sign in at github.com. Click **+** (top right) then **New repository**.
2. Name it, for example `four-plays-study-guide`. Choose **Public** (free GitHub Pages needs a public repo unless you have a paid plan). Click **Create repository**.
3. On the new repo page click **uploading an existing file**.
4. Unzip `four-plays-study-guide.zip` on your computer. Open the unzipped folder, select **everything inside it** (index.html, css, js, data, tools, README.md, .nojekyll) and drag it into the browser window. Make sure `index.html` ends up at the top level of the repo, not inside another folder. (Hidden files like `.nojekyll` may not show in your file picker; the site works without it.)
5. Scroll down and click **Commit changes**.
6. Go to **Settings** (repo tab) then **Pages** (left menu).
7. Under **Build and deployment**, set **Source** to **Deploy from a branch**. Set **Branch** to **main** and the folder to **/ (root)**. Click **Save**.
8. Wait 1 to 2 minutes and refresh the Pages screen. A banner shows **Your site is live at** `https://YOUR-USERNAME.github.io/four-plays-study-guide/`. Open it.
9. Send Elijah that link. On his phone, he can use "Add to Home Screen".

### Option 2: Command line
```bash
cd four-plays-study-guide
git init -b main
git add .
git commit -m "Add study guide"
git remote add origin https://github.com/YOUR-USERNAME/four-plays-study-guide.git
git push -u origin main
```
Then do steps 6 to 8 above.

### Updating later
Edit a file on GitHub (pencil icon) or push a new commit. The site rebuilds in about a minute. If the page looks unchanged, hard refresh (Ctrl+Shift+R, or Cmd+Shift+R on Mac).

## Where things live
- `data/*.js`: one file per play (summaries, quizzes, flashcards, watch guide, essays). Edit text here.
- `js/shared.js`: glossary, comparison pages, exam-prep guidance, study-plan phases.
- `js/core.js` and `js/pages.js`: the site engine.
- `css/styles.css`: design.
- `tools/validate.js` checks the play files: run `node tools/validate.js` after editing. `tools/SCHEMA.md` documents the format.

## Notes
- The exam date defaults to December 1, 2026. Change it on the home page; the study plan dates update.
- Progress and drafts are stored in the browser's local storage, per device. Clearing site data erases them.
- Google Fonts are optional; the site falls back to system fonts offline.
- Content is original. Quotations from copyrighted plays are limited to short phrases. Use alongside the actual texts.
