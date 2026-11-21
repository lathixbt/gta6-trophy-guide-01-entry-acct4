"use strict";

const STORE_KEY = "leonida-field-notes-v1";
const HOURS = { story: 4, missable: 4, collectibles: 8, activities: 3, online: 0 };
const GRADE_LETTER = { platinum: "P", gold: "G", silver: "S", bronze: "B" };
const GRADE_TOTAL = { platinum: 1, gold: 2, silver: 6, bronze: 46 };

const SOURCES = [
  { name: "PowerPyx", title: "GTA 6 (Grand Theft Auto VI) Trophy Guide & Roadmap", url: "https://powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/" },
  { name: "planetgta6.com", title: "GTA 6 Trophies: All 55 trophies and Xbox achievements", url: "https://planetgta6.com/en/gta-6-trophies/" },
  { name: "Push Square", title: "GTA 6: Trophy Guide & Roadmap (WIP)", url: "https://pushsquare.com/guides/gta-6-trophy-guide-and-roadmap" },
  { name: "GTABase", title: "GTA 6 Trophy Guide & Achievements List (PS5 & Xbox Series X|S)", url: "https://gtabase.com/articles/gta-6/gta-6-achievements-trophies-list-ps5-xbox-series" },
  { name: "sixshore.com", title: "GTA 6 Trophy and Achievement List: All 55, Missables and Roadmap", url: "https://sixshore.com/gta-6/guides/trophies-and-achievements/" },
  { name: "Insider Gaming", title: "Complete GTA 6 Trophy List—How To Get All Trophies & Achievements", url: "https://insider-gaming.com/complete-gta-6-trophy-list-how-to-get-all-trophies-achievements/" },
  { name: "Radio Times", title: "GTA 6 trophy guide: Full list of trophies and achievements", url: "https://radiotimes.com/technology/gaming/gta-6-trophies-achievements-list/" },
  { name: "KeenGamer", title: "GTA 6 Trophy Guide & Platinum Roadmap – All 55 Trophies", url: "https://keengamer.com/articles/guides/gta-6-trophy-guide-platinum-roadmap-all-55-trophies/" },
  { name: "GTA Scoop", title: "GTA 6 Trophies & Achievements: Full List of 55 and Platinum", url: "https://gtascoop.com/guides/gta-6-trophies-achievements/" },
  { name: "One More Game", title: "Grand Theft Auto VI Trophy List", url: "https://onemoregame.ph/2026/11/grand-theft-auto-vi-trophy-list/" },
  { name: "Vice City Hustle", title: "GTA 6 Trophy List: All 55 Trophies and Achievements", url: "https://vicecityhustle.com/guides/gta-6-trophy-list-all-55-trophies" },
  { name: "GTA Spotter", title: "GTA VI trophies and achievements: the full official list", url: "https://gtaspotter.com/en/guides/gta-6-trophies-and-achievements/" },
  { name: "EGamers.io", title: "GTA 6 Trophy List: All 55 Trophies And Achievements, Plus The Hardest Ones", url: "https://egamers.io/gta-6-trophy-list-all-55-trophies-and-achievements-plus-the-hardest-ones/" },
  { name: "Games.gg", title: "GTA 6 Trophy List: How to Unlock All Achievements & Trophies", url: "https://games.gg/grand-theft-auto-vi/guides/complete-grand-theft-auto-6-trophy-list/" },
  { name: "GTA Vibes", title: "GTA 6 Trophy List: All 55 Trophies and Achievements", url: "https://gtavibes.com/guides/gta-6-trophy-list-achievements" },
  { name: "Mobalytics", title: "Grand Theft Auto 6 - Full Trophy List & Walkthrough", url: "https://mobalytics.gg/gamebase/guides/grand-theft-auto-6-all-trophies" },
  { name: "Of Zen and Computing", title: "GTA 6 Trophy List (November 2026) All 55 Trophies", url: "https://ofzenandcomputing.com/gta-6-trophy-list-trophies-achievements/" },
  { name: "GameTrek", title: "GTA 6 Trophy Guide: All 55 Achievements and Platinum Roadmap", url: "https://gmtreks.com/gta6/page/01M7Q14ZF65PPK5FFXSY3CJNKQ" }
];

const DISPUTES = [
  { id: "D1", trophy: 28, topic: "Is there a missable trophy?",
    a: "Possibly 1 (#28) — [1][4][5][8][9][13][16].",
    b: "None known — [3]; \u201ccan\u2019t tell yet\u201d — [2].",
    call: "Treat #28 as missable — take the balcony meditation in Chapter 1 either way." },
  { id: "D2", trophy: 14, topic: "Time to platinum",
    a: "~200 h — [1][4][8][9].",
    b: "200–250+ h [5]; 250+/300 h [3].",
    call: "~200 h is the modal estimate; 300 h is the outlier." },
  { id: "D3", trophy: 40, topic: "#40 Maximum Withdrawal grade",
    a: "Silver — 14 sources including the PSN list [2].",
    b: "Bronze — [3] only.",
    call: "Silver. One source against fourteen, PSN included." },
  { id: "D4", trophy: 17, topic: "Shooting-range locations",
    a: "12 ranges / 42 challenges — [1][4][18].",
    b: "2 locations — [3].",
    call: "12 ranges, 42 challenges." },
  { id: "D5", trophy: 47, topic: "Hidden count",
    a: "28 hidden — [2][4][5][6].",
    b: "27 hidden — [3] (Personal Best not marked hidden).",
    call: "28 hidden. Personal Best is hidden on PSN." },
  { id: "D6", trophy: 7, topic: "#7 description",
    a: "\u201cComplete the final mission\u201d — PSN [2].",
    b: "\u201cComplete Chapter 5\u201d — [6].",
    call: "\u201cComplete the final mission\u201d. PSN wording wins." },
  { id: "D7", trophy: 1, topic: "Gamerscore values",
    a: "Varied values (TrueAchievements-sourced) — [2][4][5].",
    b: "Flat 50G/10G — [17].",
    call: "Varied values. The flat table contradicts the PSN-sourced lists." },
  { id: "D8", trophy: 17, topic: "One More Game grade split",
    a: "1P/3G/14S/18B (= 36) — [10]; it also lists The Shootist as Bronze.",
    b: "1P/2G/6S/46B — 17 sources.",
    call: "Disregard [10] grades. Its split does not even add up to 55." },
  { id: "D9", trophy: 3, topic: "GameTrek chapter numbers",
    a: "PSN chapters — [1][2][4].",
    b: "Off by one — [18] (Paradise Lost as \u201cChapter 2\u201d).",
    call: "PSN chapters. Paradise Lost completes Chapter 1." },
  { id: "D10", trophy: 25, topic: "Strangers & Freaks qualifying strands",
    a: "Kirk, Kyle, Yago and Pilot Pete count; Moses, Tyrone, Yasmani, Andy, Billy and Eddie do not — [1][4].",
    b: "The remaining strands are unconfirmed.",
    call: "Use the in-game counter. Start with the four confirmed strands." }
];

const DISPUTE_BY_TROPHY = {};
for (const d of DISPUTES) (DISPUTE_BY_TROPHY[d.trophy] = DISPUTE_BY_TROPHY[d.trophy] || []).push(d);

const ROADMAP_ORDER = [28, 2, 3, 4, 8, 5, 9, 6, 10, 11, 12, 7, 13, 22, 23, 24, 26, 27, 29, 14, 15, 16, 17, 18, 19, 20, 21, 25, 30, 31, 32, 35, 42, 33, 34, 36, 37, 38, 39, 40, 41, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 1];

const CHAPTERS = [
  { title: "Chapter 1 — The Keys & the balcony", ids: [2, 28, 3] },
  { title: "Chapter 2 — Port Gellhorn & the handoff", ids: [4, 8] },
  { title: "Chapter 3 — Into Vice City", ids: [5, 9] },
  { title: "Chapter 4 — The long way home", ids: [6, 10, 11, 12] },
  { title: "Chapter 5 — The final stretch", ids: [7, 13] },
  { title: "Post-story 100% — Quotas, sets & checklists", ids: [14, 15, 16, 17, 18, 19, 20, 21, 30, 31, 32, 35, 42] },
  { title: "Cleanup — Loose ends & the platinum", ids: [1, 22, 23, 24, 25, 26, 27, 29, 33, 34, 36, 37, 38, 39, 40, 41, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55] }
];

let TROPHIES = [];
const byId = id => TROPHIES.find(t => t.id === id);

const state = {
  view: "tracker", earned: new Set(), spoiler: true, counts: {},
  kind: "all", grade: "all", chapter: "all", confidence: "all",
  character: "both", search: "", chip: "all",
  selectedId: null, openGuide: null
};

const $ = sel => document.querySelector(sel);
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const citeLinks = cites => cites.map(n => `<a href="#" data-cite="${n}">[${n}]</a>`).join(" ");
const masked = t => state.spoiler && t.hidden && !state.earned.has(t.id);
const disputedIds = new Set(DISPUTES.map(d => d.trophy));

function save() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({
      view: state.view, earned: [...state.earned].sort((a, b) => a - b),
      spoiler: state.spoiler, counts: state.counts
    }));
  } catch (e) { /* storage unavailable: the journal still works in memory */ }
}

function loadStored() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (Array.isArray(data.earned)) state.earned = new Set(data.earned.filter(n => Number.isInteger(n) && n >= 1 && n <= 55));
    if (typeof data.spoiler === "boolean") state.spoiler = data.spoiler;
    if (data.counts && typeof data.counts === "object") state.counts = data.counts;
    if (typeof data.view === "string" && document.querySelector(`#tabs [data-view="${data.view}"]`)) state.view = data.view;
  } catch (e) { /* corrupted storage: start clean */ }
}

function loadHash() {
  const raw = location.hash.replace(/^#/, "");
  if (!raw) return;
  const p = new URLSearchParams(raw);
  if (p.has("view") && document.querySelector(`#tabs [data-view="${p.get("view")}"]`)) state.view = p.get("view");
  if (p.has("earned")) state.earned = new Set(p.get("earned").split(",").map(Number).filter(n => Number.isInteger(n) && n >= 1 && n <= 55));
  if (p.has("spoiler")) state.spoiler = p.get("spoiler") !== "0";
  for (const key of ["kind", "grade", "chapter", "confidence", "character", "search"]) {
    if (p.has(key)) state[key] = p.get(key);
  }
}

function buildHash() {
  const p = new URLSearchParams();
  p.set("view", state.view);
  p.set("earned", [...state.earned].sort((a, b) => a - b).join(","));
  if (state.kind !== "all") p.set("kind", state.kind);
  if (state.grade !== "all") p.set("grade", state.grade);
  if (state.chapter !== "all") p.set("chapter", state.chapter);
  if (state.confidence !== "all") p.set("confidence", state.confidence);
  if (state.character !== "both") p.set("character", state.character);
  if (state.search) p.set("search", state.search);
  p.set("spoiler", state.spoiler ? "1" : "0");
  return "#" + p.toString();
}

function hoursLeft() {
  let used = 0;
  for (const id of state.earned) {
    const t = byId(id);
    if (t) used += HOURS[t.kind] || 0;
  }
  return 200 - used;
}

function renderTopbar() {
  const earned = state.earned.size;
  $("#earned-count").textContent = `${earned} / 55 earned`;
  const per = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const id of state.earned) { const t = byId(id); if (t) per[t.grade]++; }
  $("#grades").textContent = `${per.platinum}/1P${per.gold}/2G${per.silver}/6S${per.bronze}/46B`;
  const jason = [...state.earned].filter(id => { const t = byId(id); return t && (t.character === "jason" || t.character === "both"); }).length;
  const lucia = [...state.earned].filter(id => { const t = byId(id); return t && (t.character === "lucia" || t.character === "both"); }).length;
  $("#dual-count").textContent = `Jason ${jason}/55 · Lucia ${lucia}/55`;
  const coll = [...state.earned].filter(id => { const t = byId(id); return t && t.kind === "collectibles"; }).length;
  $("#collectibles").textContent = `Collectibles ${coll}/4 logged`;
  $("#remaining").textContent = `${hoursLeft()} h remaining (estimate)`;
  const ring = $("#ring-fg");
  ring.style.strokeDashoffset = String(163.4 * (1 - earned / 55));
  $("#ring-text").textContent = `${Math.round(earned / 55 * 100)}%`;
  $("#spoiler").checked = state.spoiler;
}

function renderAudit() {
  const total = TROPHIES.length;
  const official = TROPHIES.filter(t => t.name && t.description && t.grade).length;
  const hidden = TROPHIES.filter(t => t.hidden).length;
  const steps = TROPHIES.reduce((n, t) => n + t.steps.length, 0);
  const cited = TROPHIES.reduce((n, t) => n + t.steps.filter(s => s.cites && s.cites.length).length, 0);
  const citeGuides = TROPHIES.filter(t => t.sources && t.sources.length >= 1).length;
  const backed = TROPHIES.filter(t => t.sources && t.sources.length >= 2).length;
  const missable = TROPHIES.filter(t => t.missable).length;
  const atRisk = TROPHIES.filter(t => t.confidence !== "high").length;
  const sep = '<span class="sep">·</span>';
  $("#audit").innerHTML =
    `<b>${official}/${total}</b> official name, description, grade ${sep} <b>1P 2G 6S 46B</b> ${sep} <b>${hidden}</b> PSN-hidden ${sep} <b>${cited}/${steps}</b> steps cited ${sep} <b>${citeGuides}/${total}</b> guides cite sources ${sep} <b>${backed}/${total}</b> backed by 2+ sources ${sep} <b>${SOURCES.length}</b> pages · <b>${SOURCES.length}</b> sites · read 20 Nov 2026 ${sep} <b>${missable}</b> possibly missable ${sep} <b>${atRisk}</b> at risk ${sep} <b>0</b> fully unconfirmed ${sep} <b>${DISPUTES.length}</b> disputes shown both ways`;
}

function renderTabs() {
  for (const btn of document.querySelectorAll("#tabs button")) {
    if (btn.dataset.view === state.view) btn.setAttribute("aria-current", "true");
    else btn.removeAttribute("aria-current");
  }
  for (const sec of document.querySelectorAll(".view")) {
    sec.hidden = sec.id !== `view-${state.view}`;
  }
}

function visibleTrophies() {
  const q = state.search.trim().toLowerCase();
  return TROPHIES.filter(t => {
    if (state.kind !== "all" && t.kind !== state.kind) return false;
    if (state.grade !== "all" && t.grade !== state.grade) return false;
    if (state.chapter !== "all" && t.chapter !== state.chapter) return false;
    if (state.confidence !== "all" && t.confidence !== state.confidence) return false;
    if (state.character !== "both" && t.character !== state.character) return false;
    if (state.chip === "hidden" && !t.hidden) return false;
    if (state.chip === "disputed" && !disputedIds.has(t.id)) return false;
    if (state.chip === "not-earned" && state.earned.has(t.id)) return false;
    if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))) return false;
    return true;
  });
}

function rowHtml(t) {
  const isMasked = masked(t);
  const name = isMasked ? "Story trophy · hidden until earned" : esc(t.name);
  const desc = isMasked ? "hidden until earned" : esc(t.description);
  const earned = state.earned.has(t.id);
  const gradeClass = `grade-${t.grade[0]}`;
  const flags = [];
  if (t.missable) flags.push('<span class="badge flag-missable">POSSIBLY MISSABLE</span>');
  if (t.hidden) flags.push('<span class="badge flag-hidden">PSN-hidden</span>');
  if (disputedIds.has(t.id)) flags.push('<span class="badge flag-disputed">DISPUTED</span>');
  if (t.kind === "story") flags.push('<span class="badge">Story</span>');
  const selected = state.selectedId === t.id ? "true" : "false";
  return `<div class="row${earned ? " earned" : ""}" id="trophy-${t.id}" data-kind="${t.kind}" data-id="${t.id}" data-selected="${selected}" role="listitem">
    <input type="checkbox" data-earned-id="${t.id}"${earned ? " checked" : ""} aria-label="Mark ${isMasked ? "this story trophy" : esc(t.name)} earned">
    <div class="row-body">
      <button type="button" class="guide-toggle" data-guide="${t.id}" aria-expanded="${state.openGuide === t.id}">
        <span class="t-name">${name}</span>
        <span class="t-desc">${desc}</span>
        <span class="show-guide">Show guide ▸</span>
      </button>
      <div class="t-meta">
        <span class="badge ${gradeClass}">${GRADE_LETTER[t.grade]}</span>
        <span class="badge">${esc(t.chapter)}</span>
        <span class="confidence" data-level="${t.confidence}">${t.confidence} confidence</span>
        ${flags.join(" ")}
      </div>
      <div class="guide" id="guide-${t.id}"${state.openGuide === t.id ? "" : " hidden"}></div>
    </div>
  </div>`;
}

function guideHtml(t) {
  if (masked(t)) return `<p>Hidden until earned — mark this trophy earned to read its guide.</p>`;
  const parts = [];
  parts.push(`<h4>OFFICIAL DESCRIPTION</h4><blockquote>&ldquo;${esc(t.description)}&rdquo; — ${t.grade} · #${t.id} of 55</blockquote>`);
  parts.push(`<p>${esc(t.guide)}</p>`);
  if (t.id === 28) {
    parts.push(`<div class="missable-note"><b>POSSIBLY MISSABLE.</b> Last chance: Chapter 1 — before Tourist Trap. Lucia&rsquo;s balcony meditation exists only in Chapter 1, and no page has tested the trophy without it. ${citeLinks([1, 4, 5, 8])}</div>`);
    const n = state.counts[28] || 0;
    parts.push(`<div class="count-box"><button type="button" data-count="28" data-delta="-1" aria-label="One fewer meditation">−</button><span id="count-28">YOUR COUNT — ${n} / 18 meditations</span><button type="button" data-count="28" data-delta="1" aria-label="One more meditation">+</button></div>`);
  }
  parts.push(`<h4>HOW TO EARN IT — ${t.steps.length} step${t.steps.length === 1 ? "" : "s"} in our own words, each with its sources</h4>`);
  parts.push(`<ol>${t.steps.map((s, i) => `<li>${esc(s.text)} ${citeLinks(s.cites)}</li>`).join("")}</ol>`);
  for (const d of (DISPUTE_BY_TROPHY[t.id] || [])) {
    parts.push(`<div class="dispute-note"><b>SOURCES DIFFER — ${esc(d.topic)}: both versions shown.</b><br>A · ${esc(d.a)}<br>B · ${esc(d.b)}<br><b>Our call.</b> ${esc(d.call)}</div>`);
  }
  parts.push(`<p><b>SOURCES FOR THIS GUIDE</b> — ${t.sources.map(n => `<a href="#" data-cite="${n}">[${n}] ${esc(SOURCES[n - 1].name)}</a>`).join(" · ")}</p>`);
  return parts.join("");
}

function renderTracker() {
  const list = visibleTrophies();
  if (!list.some(t => t.id === state.selectedId)) state.selectedId = list.length ? list[0].id : null;
  $("#trophy-list").innerHTML = list.map(rowHtml).join("");
  for (const t of list) {
    if (state.openGuide === t.id) {
      const panel = $(`#guide-${t.id}`);
      if (panel) panel.innerHTML = guideHtml(t);
    }
  }
  const empty = $("#empty");
  if (list.length === 0) {
    empty.hidden = false;
    empty.textContent = state.kind === "online"
      ? "No online trophies — GTA VI has none [1][4]"
      : "No trophies match these filters.";
  } else {
    empty.hidden = true;
  }
  renderChips();
  renderRail();
}

function renderChips() {
  const count = (fn) => TROPHIES.filter(fn).length;
  const chips = [
    { key: "all", label: `All 55` },
    { key: "story", label: `Story ${count(t => t.kind === "story")}` },
    { key: "missable", label: `Missable ${count(t => t.kind === "missable")}` },
    { key: "collectibles", label: `Collectibles ${count(t => t.kind === "collectibles")}` },
    { key: "activities", label: `Activities ${count(t => t.kind === "activities")}` },
    { key: "online", label: `Online ${count(t => t.kind === "online")}` },
    { key: "hidden", label: `${count(t => t.hidden)} PSN-hidden` },
    { key: "disputed", label: `Disputed ${DISPUTES.length}` },
    { key: "not-earned", label: `Not earned ${55 - state.earned.size}` },
    { key: "grade-p", label: `P ${GRADE_TOTAL.platinum}` },
    { key: "grade-g", label: `G ${GRADE_TOTAL.gold}` },
    { key: "grade-s", label: `S ${GRADE_TOTAL.silver}` },
    { key: "grade-b", label: `B ${GRADE_TOTAL.bronze}` }
  ];
  $("#chips").innerHTML = chips.map(c => {
    let active = false;
    if (c.key === "all") active = state.chip === "all" && state.kind === "all" && state.grade === "all";
    else if (c.key === state.kind) active = true;
    else if (c.key === `grade-${state.grade[0]}` && state.grade !== "all") active = true;
    else if (c.key === state.chip) active = true;
    return `<button type="button" data-chip="${c.key}" aria-pressed="${active}">${esc(c.label)}</button>`;
  }).join("");
}

function renderRail() {
  const next = ROADMAP_ORDER.filter(id => !state.earned.has(id)).slice(0, 5);
  $("#next-up").innerHTML = next.map(id => {
    const t = byId(id);
    const pos = ROADMAP_ORDER.indexOf(id) + 1;
    return `<li><b>${pos}.</b> ${esc(t.name)} · ${t.grade} · ${esc(t.chapter)}${t.missable ? " · missable" : ""}</li>`;
  }).join("");
  $("#rail-sources").innerHTML = SOURCES.map((s, i) =>
    `<li><a class="src-link" href="${esc(s.url)}" target="_blank" rel="noopener">[${i + 1}] ${esc(s.name)}</a> — ${esc(s.title)}</li>`).join("");
}

function renderRoadmapChapters() {
  $("#roadmap-chapter-list").innerHTML = CHAPTERS.map(c =>
    `<li><b>${esc(c.title)}</b> — ${c.ids.length} troph${c.ids.length === 1 ? "y" : "ies"}</li>`).join("");
}

function renderMissables() {
  const atRisk = TROPHIES.filter(t => t.confidence !== "high").sort((a, b) => (a.id === 28 ? -1 : b.id === 28 ? 1 : a.id - b.id));
  $("#missable-cards").innerHTML = atRisk.map(t => {
    const isMasked = masked(t);
    const name = isMasked ? "Story trophy · hidden until earned" : esc(t.name);
    const desc = isMasked ? "hidden until earned" : esc(t.description);
    const lastChance = t.id === 28
      ? `<p><b>Last chance: Chapter 1 — before Tourist Trap.</b> Take Lucia&rsquo;s balcony meditation before the chapter ends.</p>` : "";
    return `<article class="miss-card" id="miss-${t.id}">
      <h3>${name}</h3>
      <p class="t-desc">${desc}</p>
      <p><span class="badge ${t.missable ? "flag-missable" : ""}">${t.missable ? "POSSIBLY MISSABLE" : "AT RISK"}</span>
      <span class="confidence" data-level="${t.confidence}">${t.confidence} confidence</span>
      <span class="badge">${esc(t.chapter)}</span></p>
      ${lastChance}
      <p>${esc(t.guide)}</p>
      <button type="button" data-open-guide="${t.id}">Open guide</button>
    </article>`;
  }).join("");
}

function renderJournal() {
  $("#journal-chapters").innerHTML = CHAPTERS.map(c => {
    const items = c.ids.map(id => {
      const t = byId(id);
      const name = masked(t) ? "Story trophy · hidden until earned" : esc(t.name);
      return `<li>${name} <span class="c-grade">${t.grade} · ${esc(t.chapter)}</span></li>`;
    }).join("");
    return `<details class="chapter"><summary>${esc(c.title)} · ${c.ids.length} trophies</summary><ul>${items}</ul></details>`;
  }).join("");
}

function renderSources() {
  $("#source-list").innerHTML = SOURCES.map((s, i) =>
    `<li id="source-${i + 1}"><b>[${i + 1}]</b> ${esc(s.name)} — ${esc(s.title)} — <a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.url)}</a></li>`).join("");
  $("#disputes").innerHTML = DISPUTES.map(d =>
    `<div class="dispute" id="${d.id}"><h4>${d.id} — ${esc(d.topic)}</h4><p><b>Side A:</b> ${esc(d.a)}</p><p><b>Side B:</b> ${esc(d.b)}</p><p><b>Our call.</b> ${esc(d.call)}</p></div>`).join("");
}

function renderPrintList() {
  $("#print-list").innerHTML = TROPHIES.map(t => `<li>☑ ${esc(t.name)}</li>`).join("");
}

function renderAll() {
  renderTopbar();
  renderAudit();
  renderTabs();
  renderTracker();
  renderRoadmapChapters();
  renderMissables();
  renderJournal();
  renderSources();
  renderPrintList();
}

function showView(view) {
  state.view = view;
  renderTabs();
  save();
}

function toggleEarned(id) {
  if (state.earned.has(id)) state.earned.delete(id);
  else state.earned.add(id);
  save();
  renderTopbar();
  renderTracker();
  renderMissables();
  renderJournal();
}

function buildPlan(minutes) {
  const blocks = [{ mins: 15, html: `Missable first · <b>Positive Mental Attitude</b> — take the balcony meditation before Chapter 1 ends.` }];
  const want = minutes / 15;
  for (const id of ROADMAP_ORDER) {
    if (blocks.length >= want) break;
    if (id === 28) continue;
    const t = byId(id);
    blocks.push({ mins: 15, html: `<b>${esc(t.name)}</b> — ${t.grade} · ${esc(t.chapter)} · ${t.kind}.` });
  }
  const total = blocks.reduce((n, b) => n + b.mins, 0);
  $("#plan-total").textContent = `Total: ${total} / ${minutes} min`;
  $("#plan").innerHTML = blocks.map(b => `<li><strong>${b.mins} min</strong> ${b.html}</li>`).join("");
}

function setStatus(msg) {
  $("#status").textContent = msg;
}

function bindEvents() {
  document.querySelectorAll("#tabs button").forEach(btn => {
    btn.addEventListener("click", () => showView(btn.dataset.view));
  });

  $("#spoiler").addEventListener("change", e => {
    state.spoiler = e.target.checked;
    save();
    renderTracker();
    renderMissables();
    renderJournal();
  });

  $("#search").addEventListener("input", e => { state.search = e.target.value; renderTracker(); });
  $("#filter-kind").addEventListener("change", e => { state.kind = e.target.value; state.chip = "all"; renderTracker(); });
  $("#filter-grade").addEventListener("change", e => { state.grade = e.target.value; state.chip = "all"; renderTracker(); });
  $("#filter-chapter").addEventListener("change", e => { state.chapter = e.target.value; renderTracker(); });
  $("#filter-confidence").addEventListener("change", e => { state.confidence = e.target.value; renderTracker(); });
  $("#character").addEventListener("change", e => { state.character = e.target.value; renderTracker(); });
  $("#clear-filters").addEventListener("click", () => {
    state.search = ""; state.kind = "all"; state.grade = "all"; state.chapter = "all";
    state.confidence = "all"; state.character = "both"; state.chip = "all";
    $("#search").value = ""; $("#filter-kind").value = "all"; $("#filter-grade").value = "all";
    $("#filter-chapter").value = "all"; $("#filter-confidence").value = "all"; $("#character").value = "both";
    renderTracker();
  });

  $("#chips").addEventListener("click", e => {
    const btn = e.target.closest("[data-chip]");
    if (!btn) return;
    const key = btn.dataset.chip;
    if (key === "all") {
      state.kind = "all"; state.grade = "all"; state.chip = "all";
      $("#filter-kind").value = "all"; $("#filter-grade").value = "all";
    } else if (["story", "missable", "collectibles", "activities", "online"].includes(key)) {
      state.kind = key; state.chip = "all";
      $("#filter-kind").value = key;
    } else if (key.startsWith("grade-")) {
      state.grade = { "grade-p": "platinum", "grade-g": "gold", "grade-s": "silver", "grade-b": "bronze" }[key];
      state.chip = "all";
      $("#filter-grade").value = state.grade;
    } else {
      state.chip = key;
    }
    renderTracker();
  });

  $("#trophy-list").addEventListener("change", e => {
    const box = e.target.closest("[data-earned-id]");
    if (!box) return;
    const id = Number(box.dataset.earnedId);
    if (box.checked) state.earned.add(id); else state.earned.delete(id);
    save();
    renderTopbar();
    renderTracker();
    renderMissables();
    renderJournal();
  });

  $("#trophy-list").addEventListener("click", e => {
    const cite = e.target.closest("[data-cite]");
    if (cite) {
      e.preventDefault();
      showView("sources");
      const li = $(`#source-${cite.dataset.cite}`);
      if (li) li.scrollIntoView({ block: "center" });
      return;
    }
    const counter = e.target.closest("[data-count]");
    if (counter) {
      const id = Number(counter.dataset.count);
      const next = Math.max(0, Math.min(18, (state.counts[id] || 0) + Number(counter.dataset.delta)));
      state.counts[id] = next;
      save();
      const label = $("#count-28");
      if (label) label.textContent = `YOUR COUNT — ${next} / 18 meditations`;
      return;
    }
    const toggle = e.target.closest("[data-guide]");
    if (!toggle) return;
    const id = Number(toggle.dataset.guide);
    state.openGuide = state.openGuide === id ? null : id;
    renderTracker();
  });

  $("#missable-cards").addEventListener("click", e => {
    const btn = e.target.closest("[data-open-guide]");
    if (!btn) return;
    const id = Number(btn.dataset.openGuide);
    state.openGuide = id;
    showView("tracker");
    renderTracker();
    const row = $(`#trophy-${id}`);
    if (row) row.scrollIntoView({ block: "start" });
  });

  document.querySelectorAll("[data-minutes]").forEach(btn => {
    btn.addEventListener("click", () => buildPlan(Number(btn.dataset.minutes)));
  });

  $("#export").addEventListener("click", () => {
    const data = { version: 1, earned: [...state.earned].sort((a, b) => a - b), counts: state.counts };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "leonida-field-notes.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    setStatus("Journal exported.");
  });

  $("#import").addEventListener("change", e => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (data.version !== 1 || !Array.isArray(data.earned)) throw new Error("bad file");
        state.earned = new Set(data.earned.filter(n => Number.isInteger(n) && n >= 1 && n <= 55));
        if (data.counts && typeof data.counts === "object") state.counts = data.counts;
        save();
        renderTopbar();
        renderTracker();
        renderMissables();
        renderJournal();
        setStatus("Journal imported.");
      } catch (err) {
        setStatus("Import failed — not a Leonida Field Notes file.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  });

  $("#copy").addEventListener("click", async () => {
    const hash = buildHash();
    location.hash = hash;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) await navigator.clipboard.writeText(location.href);
    } catch (err) { /* headless shells deny clipboard: the hash is the link */ }
    setStatus("Link copied — the address bar now holds this journal.");
  });

  $("#print").addEventListener("click", () => window.print());

  document.addEventListener("keydown", e => {
    const tag = (e.target && e.target.tagName) || "";
    if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === "/") { e.preventDefault(); $("#search").focus(); return; }
    if (e.key !== "j" && e.key !== "k" && e.key !== "x") return;
    const visible = visibleTrophies();
    if (!visible.length) return;
    let idx = visible.findIndex(t => t.id === state.selectedId);
    if (idx < 0) idx = 0;
    if (e.key === "j") idx = Math.min(visible.length - 1, idx + 1);
    if (e.key === "k") idx = Math.max(0, idx - 1);
    state.selectedId = visible[idx].id;
    if (e.key === "x") { toggleEarned(state.selectedId); return; }
    renderTracker();
    const row = $(`#trophy-${state.selectedId}`);
    if (row) row.scrollIntoView({ block: "nearest" });
  });
}

async function init() {
  try {
    const res = await fetch("data/trophies.json");
    const data = await res.json();
    TROPHIES = data.trophies;
  } catch (err) {
    $("#trophy-list").innerHTML = `<p class="empty">Could not load data/trophies.json.</p>`;
    return;
  }
  loadStored();
  loadHash();
  $("#search").value = state.search;
  $("#filter-kind").value = state.kind;
  $("#filter-grade").value = state.grade;
  $("#filter-chapter").value = state.chapter;
  $("#filter-confidence").value = state.confidence;
  $("#character").value = state.character;
  save();
  renderAll();
  bindEvents();
}

init();
