import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";

const require = createRequire(import.meta.url);
const { chromium } = require("/home/hatch/workspace/xe-sdk/node_modules/playwright");
const executablePath = "/home/hatch/.cache/ms-playwright/chromium_headless_shell-1255/chrome-headless-shell-linux64/chrome-headless-shell";
const entry = new URL("./app/index.html", import.meta.url).href;
const browser = await chromium.launch({ executablePath, args: ["--allow-file-access-from-files", "--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, acceptDownloads: true });
page.setDefaultTimeout(4000);
const consoleErrors = [];
const pageErrors = [];
const tab = view => page.locator(`#tabs [data-view="${view}"]`).click();
const rows = page.locator(".row");
const earned = id => page.locator(`[data-earned-id="${id}"]`);
const text = selector => page.locator(selector).textContent();
const hash = () => page.evaluate(() => location.hash);
const reset = async fragment => {
  await page.goto(`${entry}#${fragment}`);
  await page.reload();
  await page.locator("h2").first().waitFor();
};
let passes = 0;
let backup;

page.on("console", message => { if (message.type() === "error") consoleErrors.push(message.text()); });
page.on("pageerror", error => pageErrors.push(error.message));

async function check(label, verify) {
  try { await verify(); passes++; console.log(`PASS ${label}`); }
  catch (error) { process.exitCode = 1; console.error(`FAIL ${label}: ${error.message}`); }
}

try {
  await check("Page loads from the local bundle", async () => {
    await page.goto(entry);
    await page.getByRole("heading", { name: "Journal index" }).waitFor();
  });
  await check("Title", async () => assert.match(await page.title(), /Leonida Field Notes/));
  await check("55 trophy rows", async () => { await tab("tracker"); assert.equal(await rows.count(), 55); });
  await check("SVG progress ring", async () => assert.ok(await page.locator("svg#progress-ring").isVisible()));
  await check("Grade breakdown and hours estimate", async () => {
    assert.equal(await text("#grades"), "0/1P0/2G0/6S0/46B");
    assert.match(await text("#remaining"), /200 h remaining \(estimate\)/);
  });
  await check("Spoiler toggle masks name and description until earned", async () => {
    await page.locator("#spoiler").uncheck();
    assert.match(await text("#trophy-2"), /Just Like Paradise/);
    await page.locator("#spoiler").check();
    assert.equal((await page.locator("#trophy-2 .guide-toggle").innerText()).match(/hidden until earned/g).length, 2);
    assert.doesNotMatch(await text("#trophy-2"), /Gone Fishing|Just Like Paradise/);
    await earned(2).check();
    assert.match(await text("#trophy-2"), /Just Like Paradise.*Complete Gone Fishing\./s);
    assert.match(await text("#remaining"), /196 h/);
    await earned(2).uncheck();
  });
  for (const [kind, expected] of Object.entries({ story: 14, missable: 1, collectibles: 4, activities: 36, online: 0 })) {
    await check(`Kind filter ${kind}`, async () => {
      await page.locator("#filter-kind").selectOption(kind);
      assert.equal(await rows.count(), expected);
      assert.equal(await page.locator(`.row[data-kind="${kind}"]`).count(), expected);
      if (kind === "online") assert.match(await text(".empty"), /No online trophies — GTA VI has none \[1\]\[4\]/);
    });
  }
  await check("Search and grade, chapter, confidence filters", async () => {
    await page.locator("#clear-filters").click();
    await page.locator("#search").fill("Meditate");
    assert.ok(await page.locator("#trophy-28").isVisible());
    await page.locator("#search").fill("Positive Mental Attitude");
    for (const [filter, value] of [["grade", "bronze"], ["chapter", "Chapter 1"], ["confidence", "medium"]]) {
      await page.locator(`#filter-${filter}`).selectOption(value);
      assert.equal(await rows.count(), 1);
    }
    assert.match(await text("#trophy-28"), /Positive Mental Attitude/);
    await page.locator("#clear-filters").click();
  });
  await check("Jason and Lucia switch with dual earned counts", async () => {
    await earned(2).check();
    await earned(22).check();
    await earned(14).check();
    await page.locator("#character").selectOption("jason");
    assert.equal(await text("#dual-count"), "Jason 2/55 · Lucia 2/55");
    assert.equal(await page.locator("#trophy-22").count(), 0);
    await page.locator("#character").selectOption("lucia");
    assert.equal(await page.locator("#trophy-2").count(), 0);
    await earned(22).uncheck();
    assert.equal(await text("#dual-count"), "Jason 2/55 · Lucia 1/55");
    await page.locator("#character").selectOption("both");
  });
  for (const minutes of [30, 60, 120]) {
    await check(`${minutes}-minute plan puts missable first`, async () => {
      await tab("planner");
      await page.locator(`[data-minutes="${minutes}"]`).click();
      assert.match(await page.locator(".plan li").first().innerText(), /Missable first · Positive Mental Attitude/);
      const total = (await text("#plan-total")).match(/Total: (\d+) \/ (\d+) min/);
      const blocks = await page.locator(".plan li strong").allTextContents();
      assert.equal(Number(total[2]), minutes);
      assert.equal(Number(total[1]), blocks.reduce((sum, block) => sum + parseInt(block, 10), 0));
      assert.ok(Number(total[1]) > 0 && Number(total[1]) <= minutes);
    });
  }
  await check("Trophy confidence meter", async () => {
    await tab("tracker");
    assert.match(await text("#trophy-28 .confidence[data-level=medium]"), /medium/i);
  });
  await check("Keyboard j and k select, x checks, slash opens search", async () => {
    await page.locator("h2").click();
    const selected = () => rows.locator("xpath=self::*[@data-selected=\"true\"]").getAttribute("data-id");
    const before = await selected();
    await page.keyboard.press("j");
    const next = await selected();
    assert.notEqual(next, before);
    await page.keyboard.press("k");
    assert.equal(await selected(), before);
    await page.keyboard.press("j");
    const wasChecked = await earned(next).isChecked();
    await page.keyboard.press("x");
    assert.equal(await earned(next).isChecked(), !wasChecked);
    await page.keyboard.press("/");
    assert.equal(await page.locator("#search").evaluate(input => input === document.activeElement), true);
  });
  await check("Export downloads JSON and local storage survives a hash-free reload", async () => {
    const [download] = await Promise.all([page.waitForEvent("download"), page.locator("#export").click()]);
    assert.equal(download.suggestedFilename(), "leonida-field-notes.json");
    backup = await readFile(await download.path());
    const parsed = JSON.parse(backup);
    assert.equal(parsed.version, 1);
    assert.ok(parsed.earned.includes(14));
    await page.evaluate(() => history.replaceState(null, "", location.pathname));
    await page.reload();
    await earned(14).waitFor();
    assert.ok(await earned(14).isChecked());
  });
  await check("Import accepts exported JSON", async () => {
    await earned(14).uncheck();
    await page.locator("#import").setInputFiles({ name: "journal.json", mimeType: "application/json", buffer: backup });
    await page.getByRole("status").filter({ hasText: "Journal imported." }).waitFor();
    assert.ok(await earned(14).isChecked());
  });
  await check("Copy link writes current hash", async () => {
    await page.evaluate(() => history.replaceState(null, "", location.pathname));
    await page.locator("#copy").click();
    assert.match(await hash(), /^#view=tracker&earned=/);
    assert.match(await hash(), /spoiler=1/);
  });
  await check("Hash reload restores earned, filters and spoiler setting", async () => {
    await reset("view=tracker&earned=2%2C28&kind=story&spoiler=0");
    assert.ok(await earned(2).isChecked());
    assert.equal(await text("#earned-count"), "2 / 55 earned");
    assert.equal(await page.locator("#filter-kind").inputValue(), "story");
    assert.equal(await page.locator("#spoiler").isChecked(), false);
  });
  await check("Sources panel has 18 numbered sources", async () => {
    await tab("sources");
    const items = await page.locator(".source-list li").allTextContents();
    assert.equal(items.length, 18);
    items.forEach((item, index) => assert.ok(item.startsWith(`[${index + 1}] `)));
  });
  await check("Disagreements D1–D10 include calls", async () => {
    assert.equal(await page.locator(".dispute").count(), 10);
    for (let index = 1; index <= 10; index++) assert.match(await text(`#D${index}`), /Our call\./);
  });
  await check("Three-stage roadmap, chapter order and printable checklist", async () => {
    assert.equal(await page.locator("#roadmap li").count(), 3);
    assert.match(await text("#roadmap"), /15 manual saves plus autosave.*Cheats disable trophies/s);
    await tab("journal");
    assert.equal(await page.locator(".chapter").count(), 7);
    await page.locator(".chapter summary").first().click();
    assert.match(await page.locator(".chapter ul").first().innerText(), /Just Like Paradise.*Positive Mental Attitude.*Paradise Lost/s);
    await page.evaluate(() => { window.print = () => { document.body.dataset.printed = "yes"; }; });
    await page.locator("#print").click();
    assert.equal(await page.locator("body").getAttribute("data-printed"), "yes");
    await page.emulateMedia({ media: "print" });
    assert.ok(await page.locator("#print-checklist").isVisible());
    assert.equal(await page.locator("#print-checklist li").count(), 55);
    assert.match(await text("#print-checklist"), /☑ Just Like Paradise/);
  });
  await check("Zero console and page errors", () => {
    assert.deepEqual(consoleErrors, []);
    assert.deepEqual(pageErrors, []);
  });
} finally {
  await browser.close();
}

console.log(`${passes}/26 PASS · ${consoleErrors.length} console errors · ${pageErrors.length} page errors`);
if (passes !== 26) process.exitCode = 1;
