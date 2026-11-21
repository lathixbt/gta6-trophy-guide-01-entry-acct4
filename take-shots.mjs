import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir, readFile, stat } from "node:fs/promises";

const require = createRequire(import.meta.url);
const { chromium } = require("/home/hatch/workspace/xe-sdk/node_modules/playwright");
const executablePath = "/home/hatch/.cache/ms-playwright/chromium_headless_shell-1255/chrome-headless-shell-linux64/chrome-headless-shell";
const entry = new URL("./app/index.html", import.meta.url);
const directory = new URL("./screenshots/", import.meta.url);
const shots = JSON.parse(await readFile(new URL("./shots.json", import.meta.url), "utf8"));
const checkpoints = { journal: [], tracker: [2, 3, 4, 8, 16, 35], missables: [], sources: [] };
await mkdir(directory, { recursive: true });
const browser = await chromium.launch({ executablePath, args: ["--allow-file-access-from-files", "--no-sandbox"] });

try {
  for (const { file, view, viewport } of shots) {
    const page = await browser.newPage({ viewport });
    try {
      const state = { view, earned: checkpoints[view], spoiler: true };
      await page.addInitScript(snapshot => localStorage.setItem("leonida-field-notes-v1", JSON.stringify(snapshot)), state);
      const url = new URL(entry);
      url.hash = new URLSearchParams({ ...state, spoiler: "1", earned: state.earned.join(",") }).toString();
      await page.goto(url.href);
      await page.locator(`#tabs [data-view="${view}"][aria-current]`).waitFor();
      await page.locator("h2:visible").first().waitFor();
      if (view === "tracker") {
        await page.locator("[data-guide=\"1\"]").click();
        await page.locator("#guide-1").waitFor();
        await page.evaluate(() => window.scrollTo(0, 0));
      }
      await page.evaluate(() => document.fonts.ready);
      const path = new URL(file, directory);
      await page.screenshot({ path: decodeURIComponent(path.pathname), type: "jpeg", quality: 80, animations: "disabled" });
      const { size } = await stat(path);
      console.log(`screenshots/${file} ${size} bytes`);
      assert.ok(size <= 262144, `${file} exceeds 256 KiB`);
    } finally {
      await page.close();
    }
  }
} finally {
  await browser.close();
}
