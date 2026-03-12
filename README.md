# Letters to Future Self

A quiet little corner of the internet where you can write a letter to yourself and lock it until a date you choose.

Built this because futureme.org works but looks like it hasn't been touched since 2009. Wanted something that actually feels like writing a letter — candlelit, unhurried, a bit melancholic in the good way.

---

## What it does

You write a letter. Pick a date. It gets sealed. When that date arrives, you can open it.

That's it. No accounts, no email blasts, no tracking. Just you and something you wanted to remember.

---

## How the storage works

Letters are saved in your browser's `localStorage`. This means:

- They live on **your machine, in your browser only**
- Pushing to GitHub won't expose them to anyone — the code and the data are completely separate
- If you clear your browser data, they're gone. So don't do that.
- They won't follow you to a different device or browser

If you want real email delivery someday, that needs a backend. This version is purely local.

---

## Running it

No build step. No npm install. Just open `index.html` in a browser.

Or host it on GitHub Pages — push to a repo, enable Pages under Settings, and you're live.

---

## Stack

Plain HTML, CSS, and JavaScript. Three files. No frameworks, no dependencies, no nonsense.

Fonts loaded from Google Fonts: Cormorant Garamond, Crimson Pro, and IM Fell English.

---

## What's missing (for now)

- Actual email delivery on the unlock date
- Export / backup your letters
- Multiple themes

PRs welcome if any of that interests you.
