# Leonida Field Notes

[![GTA 6 trophy guide](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/competitions/gta6-trophy-guide-01)
[![Rank](https://make.fun/badge/gta6-trophy-guide-01/lathixbt/gta6-trophy-guide-01-entry-acct4/rank.svg)](https://make.fun/competitions/gta6-trophy-guide-01)
[![Reward](https://make.fun/badge/gta6-trophy-guide-01/lathixbt/gta6-trophy-guide-01-entry-acct4/reward.svg)](https://make.fun/competitions/gta6-trophy-guide-01)

A field journal to the GTA VI PS5 platinum. Follow the five chapters, finish the 100% checklist, and check off what remains. Each of the 55 entries has a guide with numbered sources. The tracker saves locally and supports JSON backups, share links, spoiler protection, and a printable checklist.

**Formula.** Kraft paper, ruled pages, red-pencil warnings, and a serif journal index. The chapter pages follow the story through the credits and endgame cleanup. Planner timings are estimates for blocks of work, and the hours-remaining estimate scales with the number of unchecked trophies.

**Kind mapping.** Story includes #2–13 and the two roadmap entries, #1 and #14. Missable is #28. Collectibles includes #30, #31, #35, and #42. Activities covers the remaining trophies, including stranger, crime, miscellaneous, and money tasks. Online is empty. The separate `stage` field preserves the more specific grouping.

## Run and verify

Serve the `app/` directory with `python3 -m http.server --bind 127.0.0.1 --directory app 8080`, then open `http://127.0.0.1:8080`. The app fetches its bundled JSON and makes no external requests. Share links work where the recipient can access the same app. The browser scripts open the local file with Chromium’s file-access flag.

Use Node 22. The data verifier reads the sibling research directory, and the browser and screenshot scripts use the workspace’s Playwright and Chromium installations.

```sh
node verify-data.mjs
node verify-browser.mjs
node take-shots.mjs
MAKEFUN_OUTPUT_DIR=/tmp/trophy-out-acct4 node main.ts
```
