import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = path => readFileSync(new URL(path, import.meta.url), "utf8");
const { trophies } = JSON.parse(read("./app/data/trophies.json"));
const research = read("../gta6-trophy-guide-01-research/trophies.md");
const sources = read("../gta6-trophy-guide-01-research/sources.md");
const official = new Map([...research.matchAll(/^## (\d+)\. (.+) — (\w+) — (\w+)\n\n- \*\*Official description:\*\* "(.+)"$/gm)]
  .map(([, id, name, grade, visibility, description]) => [Number(id), { name, grade: grade.toLowerCase(), hidden: visibility === "Hidden", description }]));
const sourceIds = new Set([...sources.matchAll(/^### \[(\d+)\]/gm)].map(match => Number(match[1])));
const count = (key, value) => trophies.filter(trophy => trophy[key] === value).length;
const nonblank = value => typeof value === "string" && value.trim().length > 0;
let passes = 0;

function check(label, verify) {
  try { verify(); passes++; console.log(`PASS ${label}`); }
  catch (error) { process.exitCode = 1; console.error(`FAIL ${label}: ${error.message}`); }
}

check("55 trophies", () => assert.equal(trophies.length, 55));
check("IDs 1–55 sequential", () => assert.deepEqual(trophies.map(trophy => trophy.id), Array.from({ length: 55 }, (_, index) => index + 1)));
check("Grades 1P / 2G / 6S / 46B", () => {
  assert.deepEqual(["platinum", "gold", "silver", "bronze"].map(grade => count("grade", grade)), [1, 2, 6, 46]);
  for (const trophy of trophies) assert.equal(trophy.grade, official.get(trophy.id).grade, `Grade #${trophy.id}`);
});
check("28 hidden", () => {
  assert.equal(count("hidden", true), 28);
  for (const trophy of trophies) assert.equal(trophy.hidden, official.get(trophy.id).hidden, `Visibility #${trophy.id}`);
});
check("Exact official names/descriptions and nonblank guides/steps", () => {
  assert.equal(official.size, 55);
  for (const { id, name, description, guide, steps } of trophies) {
    assert.equal(name, official.get(id).name, `Name #${id}`);
    assert.equal(description, official.get(id).description, `Description #${id}`);
    assert.ok([name, description, guide].every(nonblank), `Missing text #${id}`);
    assert.ok(Array.isArray(steps) && steps.length && steps.every(step => nonblank(step.text)), `Missing step #${id}`);
  }
});
check("47 high / 7 medium / 1 low with expected IDs", () => {
  assert.equal(count("confidence", "high"), 47);
  assert.deepEqual(trophies.filter(trophy => trophy.confidence === "medium").map(trophy => trophy.id), [25, 28, 44, 45, 49, 50, 51]);
  assert.deepEqual(trophies.filter(trophy => trophy.confidence === "low").map(trophy => trophy.id), [29]);
});
check("Only #28 flagged and all citations resolve", () => {
  assert.equal(sourceIds.size, 18);
  const resolves = id => Number.isInteger(id) && id >= 1 && id <= 18 && sourceIds.has(id);
  for (const trophy of trophies) {
    assert.equal(trophy.missable, trophy.id === 28, `Missable flag #${trophy.id}`);
    if (trophy.missable) assert.equal(trophy.kind, "missable");
    assert.ok(trophy.sources.length && trophy.sources.every(resolves), `Source list #${trophy.id}`);
    for (const step of trophy.steps) assert.ok(step.cites.length && step.cites.every(id => resolves(id) && trophy.sources.includes(id)), `Step cite #${trophy.id}: ${step.text}`);
  }
});

console.log(`${passes}/7 PASS`);
