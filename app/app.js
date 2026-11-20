const byId = id => document.getElementById(id);
const storageKey = "leonida-field-notes-v1";
const grades = { platinum: "P", gold: "G", silver: "S", bronze: "B" };
const views = ["journal", "tracker", "missables", "planner", "sources"];
const options = {
  kind: ["story", "missable", "collectibles", "activities", "online"],
  grade: Object.keys(grades),
  chapter: ["Chapter 1", "Chapter 2", "Chapter 3", "Chapter 4", "Chapter 5", "Post-story", "Strangers", "Activities", "Crime", "Misc", "Money", "Platinum"],
  confidence: ["high", "medium", "low"],
};
const fields = { ...options, character: ["jason", "lucia"] };
const sources = ["PowerPyx", "planetgta6.com", "Push Square", "GTABase", "sixshore.com", "Insider Gaming", "Radio Times", "KeenGamer", "GTA Scoop", "One More Game", "Vice City Hustle", "GTA Spotter", "EGamers.io", "Games.gg", "GTA Vibes", "Mobalytics", "Of Zen and Computing", "GameTrek"];
const disputes = [
  ["Is anything missable?", "Seven guides flag the balcony [1][4][5][8][9][13][16]. Push Square knows of none [3]. planetgta6 leaves it open [2].", "Take Lucia’s Chapter 1 invitation. Its necessity is unconfirmed."],
  ["How long is the trip?", "Most estimate ~200 h [1][4][8][9]. sixshore gives 200–250+ h and quotes a reviewer at well over 100 h [5]. Push Square allows 250–300+ h [3].", "Budget about 200 hours and allow longer for cleanup."],
  ["Maximum Withdrawal grade", "PSN and 13 other guides report silver [1][2][4][5][6][7][8][9][11][12][13][14][15][16]. Push Square lists bronze [3].", "Record it as silver, matching PSN and the 1P / 2G / 6S / 46B split."],
  ["Twelve ranges or two?", "Three guides count 12 ranges [1][4][18]. Push Square names two venues [3]. Both report 42 challenges.", "Use 12 ranges for planning and 42 golds as the finish line."],
  ["How many hidden trophies?", "The PSN-sourced list includes Personal Best among 28 hidden trophies [2][4][5][6]. Push Square leaves it visible [3].", "Use 28 hidden and keep Personal Best marked hidden."],
  ["Final mission or Chapter 5?", "The PSN list specifies the final mission [2]. Insider Gaming calls it a Chapter 5 completion [6].", "Use the exact PSN description for trophy #7."],
  ["Xbox Gamerscore values", "TrueAchievements-derived lists give varied values [2][4][5]. Of Zen and Computing gives flat 50G silvers and 10G bronzes [17]. EGamers omits values [13].", "Favor the varied figures when cross-checking Xbox. This journal tracks PS5 grades."],
  ["Grade tally mismatch", "One More Game gives 1P / 3G / 14S / 18B and calls The Shootist bronze [10]. The PSN list and corroborating guides account for all 55 [1][2][4].", "Use 1P / 2G / 6S / 46B and record The Shootist as silver."],
  ["Chapter numbers shifted", "GameTrek attaches Paradise Lost and T**s Ass Drug Money to Chapters 2 and 3 [18]. PSN and the main guides attach them to Chapters 1 and 2 [1][2][4].", "Index them under Chapters 1 and 2. Their unlocks arrive as the next chapter begins."],
  ["Which stranger strands count?", "Kirk, Kyle, Yago and Pilot Pete count. Moses, Tyrone, Yasmani, Andy, Billy and Eddie do not. Other qualifying strands are unresolved [1][4].", "Check the PS5 trophy counter after each candidate strand."],
];
const chapters = [
  ["Chapter 1", "The Keys & the balcony", [2, 28, 3]],
  ["Chapter 2", "Port Gellhorn & the handoff", [8, 4]],
  ["Chapter 3", "Into Vice City", [9, 5]],
  ["Chapter 4", "The long way home", [10, 11, 12, 6]],
  ["Chapter 5", "The final stretch", [13, 7]],
  ["Post-story 100%", "Quotas, sets & checklists", [14, 35, 31, 30, 15, 17, 18, 19, 32, 29, 43, 40, 52]],
  ["Cleanup", "Loose ends & the platinum", [20, 23, 24, 22, 26, 27, 25, 16, 21, 33, 34, 36, 39, 41, 42, 37, 38, 44, 45, 46, 47, 48, 49, 50, 51, 53, 54, 55, 1]],
];
const quotas = ["100 optional missions", "200 / 277 base-model vehicle scans", "100 / 255 animal studies", "15 / 18 meditations", "70 / 80 challenges", "300 / 397 stunts", "100 WAiNK scans", "15 / 18 card sets", "33 underwater discoveries", "42 shooting-range golds", "42 drone races", "15 Bret Target Decks", "30 / 40 race wins", "10 / 13 race-challenge golds", "39 gang operations, 22 bank jobs, 7 payday loans and 8 bank vaults", "5 / 7 Kenton treasure sets", "30 / 34 books, comics and magazines", "100 / 125 Cocaine Flamingos", "2 unique playlists", "70 / 79 styles", "50 / 66 standard weapons", "34 / 35 Smash ’N’ Grabs", "50 / 91 Stick Ups", "$100,000 each in fenced narcotics and jewelry", "$250,000 in fenced marked bills and $200,000 in fenced vehicles", "Play all 4 video games", "5 / 7 pool opponents", "2 / 3 mini golf sites", "90 / 100 basketball hoops"];
const tracks = new Map();
const openGuides = new Set();
const openChapters = new Set();
let selection = null;
let sessionMinutes = 30;
let missablesVisited = false;
let statusTimer;
let state;

function cleanState(raw = {}) {
  const earned = Array.isArray(raw.earned) ? raw.earned.filter(id => tracks.has(id)) : [];
  const clean = {
    earned: new Set(earned),
    spoiler: raw.spoiler !== false,
    view: views.includes(raw.view) ? raw.view : "journal",
    query: typeof raw.query === "string" ? raw.query.slice(0, 150) : "",
  };
  for (const [key, values] of Object.entries(fields)) clean[key] = values.includes(raw[key]) ? raw[key] : "";
  return clean;
}

function localState() {
  try { return JSON.parse(localStorage.getItem(storageKey)) ?? {}; }
  catch { return {}; }
}

function hashState() {
  const params = new URLSearchParams(location.hash.slice(1));
  if (!params.has("view") && !params.has("earned")) return null;
  return { ...Object.fromEntries(params), spoiler: params.get("spoiler") !== "0", earned: (params.get("earned") ?? "").split(",").map(Number) };
}

function snapshot() {
  return { ...state, earned: [...state.earned].sort((first, second) => first - second) };
}

function save() {
  const stored = snapshot();
  try { localStorage.setItem(storageKey, JSON.stringify(stored)); }
  catch { notify("Local storage is unavailable. Export a backup to keep this session."); }
  const params = new URLSearchParams({ view: stored.view, earned: stored.earned.join(","), spoiler: stored.spoiler ? "1" : "0" });
  for (const key of [...Object.keys(fields), "query"]) if (stored[key]) params.set(key, stored[key]);
  history.replaceState(null, "", `#${params}`);
}

function notify(message) {
  clearTimeout(statusTimer);
  byId("status").textContent = message;
  statusTimer = setTimeout(() => { byId("status").textContent = ""; }, 4500);
}

function masked(trophy) {
  return state.spoiler && trophy.hidden && trophy.kind === "story" && !state.earned.has(trophy.id);
}

const redacted = "████████ — hidden until earned";
const displayName = trophy => masked(trophy) ? redacted : trophy.name;
const titleCase = text => text.charAt(0).toUpperCase() + text.slice(1);
const safe = text => String(text).replace(/[&<>"\u0027]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "\u0027": "&#39;" })[character]);
const namedCites = ids => ids.map(id => `[${id}] ${safe(sources[id - 1])}`).join(" · ");
const matchesCharacter = (trophy, character) => !character || trophy.character === "both" || trophy.character === character;

function progress() {
  const total = tracks.size;
  const earned = [...state.earned].map(id => tracks.get(id));
  const percent = Math.round(100 * earned.length / total);
  byId("percent").textContent = `${percent}%`;
  byId("progress-arc").setAttribute("stroke-dasharray", `${100 * earned.length / total} 100`);
  byId("earned-count").textContent = `${earned.length} / ${total} earned`;
  byId("grades").innerHTML = Object.entries(grades).map(([grade, symbol]) => {
    const done = earned.filter(trophy => trophy.grade === grade).length;
    const count = [...tracks.values()].filter(trophy => trophy.grade === grade).length;
    return `<span title="${titleCase(grade)}">${done}/${count}${symbol}</span>`;
  }).join("");
  byId("remaining").textContent = `~${Math.round(200 * (total - earned.length) / total)} h remaining (estimate)`;
  byId("print-checklist").innerHTML = `<h1>Leonida Field Notes</h1><p>${earned.length} of ${total} earned · PS5 checklist</p><ol>${[...tracks.values()].map(trophy => `<li>${state.earned.has(trophy.id) ? "☑" : "☐"} ${safe(displayName(trophy))} · ${titleCase(trophy.grade)}</li>`).join("")}</ol>`;
}

function characterCounts() {
  return ["jason", "lucia"].map(character => {
    const count = [...state.earned].filter(id => matchesCharacter(tracks.get(id), character)).length;
    return `${titleCase(character)} ${count}/${tracks.size}`;
  }).join(" · ");
}

function roadmap() {
  return `<section class="margin-note" id="roadmap"><p class="eyebrow">The three-stage route · [1] [4] [8]</p>
    <ol><li><b>60–80 h.</b> Story and optional jobs. Scan cars, study animals and take the balcony detour.</li>
    <li><b>~100 h.</b> Finish the in-game 100% checklist, including 70 of 80 challenges.</li>
    <li><b>~10 h.</b> Wrap up stranger strands and loose ends.</li></ol>
    <p><b>One playthrough · ~200 h.</b> Use 15 manual saves plus autosave. Keep chapter boundary saves. Cheats disable trophies and saving [1][3][4][5].</p></section>`;
}

function balconyNote() {
  return `<section class="margin-note warning"><p class="eyebrow">Before you leave Chapter 1</p><h3>Take the balcony detour.</h3><p>When Lucia steps onto Jason’s balcony, follow her and accept the meditation. The scene does not return after the chapter.</p><p class="annotation">One possible missable · [1] [4] [5] [8]</p><p><button class="text-button" data-view="missables">Read the warning →</button></p></section>`;
}

function journal() {
  return `<div class="folio"><section><p class="eyebrow">Route to platinum</p><h2>Journal index</h2>
    <p class="lede">I keep a page for each chapter, then turn to the checklist after the credits.</p>
    <div class="chapter-list">${chapters.map(([chapter, cue, ids], index) => `<details class="chapter" data-chapter="${index}" ${openChapters.has(index) ? "open" : ""}><summary><span class="index-number">0${index + 1}</span><span><strong>${chapter}</strong><span class="cue">${cue}</span></span><small>${ids.length} trophies</small></summary>
    <ul>${ids.map(id => `<li><button type="button" data-open="${id}">${safe(displayName(tracks.get(id)))}</button> <small>· ${titleCase(tracks.get(id).grade)}${state.earned.has(id) ? " · Earned" : ""}</small></li>`).join("")}</ul></details>`).join("")}</div>
    <details class="quota-list"><summary><b>The full 100% checklist</b> · [1] [4] [8]</summary><p>Progress › Stats › 100% Completion. These quotas add up to roughly 60% of everything in the game [1].</p><ul>${quotas.map(quota => `<li>${quota}</li>`).join("")}</ul></details>
    </section><aside>${balconyNote()}${roadmap()}</aside></div>`;
}

function trophyCard(trophy) {
  const { id, grade, chapter, stage, confidence, character } = trophy;
  const earned = state.earned.has(id);
  const hidden = masked(trophy);
  const open = openGuides.has(id) && !hidden;
  return `<article class="row" id="trophy-${id}" data-id="${id}" data-kind="${trophy.kind}" data-selected="${selection === id}" data-earned="${earned}">
    <div class="row-head"><label class="earned"><input type="checkbox" data-earned-id="${id}" aria-label="Mark trophy ${id} earned" ${earned ? "checked" : ""}></label>
    <button type="button" class="guide-toggle" data-guide="${id}" aria-expanded="${open}" aria-controls="guide-${id}" ${hidden ? "disabled" : ""}>
    <span><strong>${safe(displayName(trophy))}</strong><span class="official">${safe(hidden ? redacted : trophy.description)}</span></span>
    <span class="row-meta"><span>#${String(id).padStart(2, "0")}</span><span>${grade}</span><span class="confidence" data-level="${confidence}">${confidence}</span><span aria-hidden="true">${open ? "−" : "+"}</span></span></button></div>
    <div class="guide" id="guide-${id}" ${open ? "" : "hidden"}>${hidden ? "" : `<p class="eyebrow">${chapter} · ${stage} · ${character === "both" ? "Jason & Lucia" : titleCase(character)}${trophy.missable ? " · Possible missable" : ""}</p>
    <p>${safe(trophy.guide)}</p><ol>${trophy.steps.map(step => `<li>${safe(step.text)} <span class="cites">${namedCites(step.cites)}</span></li>`).join("")}</ol>
    <p class="cites">Sources · ${namedCites(trophy.sources)}</p>`}</div></article>`;
}

function filteredTrophies() {
  const query = state.query.trim().toLowerCase();
  return [...tracks.values()].filter(trophy => {
    if (!matchesCharacter(trophy, state.character)) return false;
    if (Object.keys(options).some(key => state[key] && state[key] !== trophy[key])) return false;
    const searchable = masked(trophy) ? "" : `${trophy.name} ${trophy.description} ${trophy.guide} ${trophy.steps.map(step => step.text).join(" ")}`.toLowerCase();
    return !query || searchable.includes(query);
  }).sort((first, second) => Number(second.missable) - Number(first.missable) || first.id - second.id);
}

function tracker() {
  const visible = filteredTrophies();
  return `<div class="tracker-top"><div><p class="eyebrow">Earned stamps</p><h2>Trophy tracker</h2></div><div class="tools"><button id="export" type="button">Export JSON</button><button id="import-button" type="button">Import JSON</button><input id="import" type="file" accept=".json,application/json" hidden></div></div>
    <div class="filters">${Object.entries(options).map(([key, values]) => `<label>${titleCase(key)}<select id="filter-${key}" data-filter="${key}"><option value="">All</option>${values.map(value => `<option value="${value}" ${state[key] === value ? "selected" : ""}>${titleCase(value)}</option>`).join("")}</select></label>`).join("")}<button id="clear-filters" type="button">Clear filters</button></div>
    <div class="tracker-meta"><p><b>${visible.length} / ${tracks.size} trophies</b> · <span id="dual-count">${characterCounts()}</span></p><p><kbd>j</kbd> / <kbd>k</kbd> select · <kbd>x</kbd> mark · <kbd>/</kbd> search</p></div>
    ${visible.length ? visible.map(trophyCard).join("") : `<p class="empty">${state.kind === "online" ? "No online trophies — GTA VI has none [1][4]" : "No trophies match these filters."}</p>`}`;
}

function missables() {
  return `<div class="folio"><section class="warning-list"><p class="eyebrow">Chapter 1 · Time-sensitive</p><h2>Missables</h2><p class="lede">There is one possible missable. Open the note below for the full meditation route.</p>${trophyCard(tracks.get(28))}</section><aside>
    <section class="margin-note warning"><p class="eyebrow">Save before leaving</p><h3>Keep a Chapter 1 save.</h3><p>Take Lucia’s optional balcony meditation at Jason’s house when she offers. If the chapter has ended, the balcony scene is gone, so a save from before the scene may help [1][4][5][8].</p><p>The trophy requirement for that extra point remains unconfirmed. See D1 in Sources.</p></section></aside></div>`;
}

function plan() {
  const tasks = [[28, 5, "Take the Chapter 1 balcony detour"], [16, 15, "Try missing activity types"], [35, 10, "Scan traffic"], [31, 20, "Scan landmarks"], [2, 20, "Start the opening story route"], [19, 25, "Win new races"], [32, 25, "Batch short challenges"], [15, 30, "Work through stunt spots"], [14, 30, "Work through the 100% checklist"]];
  const scheduled = [];
  let remaining = sessionMinutes;
  for (const [id, minutes, note] of tasks) {
    const trophy = tracks.get(id);
    if (state.earned.has(id) || !matchesCharacter(trophy, state.character) || minutes > remaining) continue;
    scheduled.push({ trophy, minutes, note });
    remaining -= minutes;
  }
  if (remaining >= 10) {
    const next = chapters.flatMap(chapter => chapter[2]).map(id => tracks.get(id))
      .find(trophy => !state.earned.has(trophy.id) && matchesCharacter(trophy, state.character) && !scheduled.some(task => task.trophy.id === trophy.id));
    if (next) scheduled.push({ trophy: next, minutes: Math.min(remaining, 30), note: "Work on the next journal entry" });
  }
  return `<p class="eyebrow">Plan a session</p><h2>Run planner</h2><p class="lede">Session estimates are time blocks for making progress. Skip anything your current chapter has yet to unlock.</p>
    <div class="plan-options" aria-label="Session length">${[30, 60, 120].map(minutes => `<button type="button" data-minutes="${minutes}" aria-pressed="${sessionMinutes === minutes}">${minutes} min</button>`).join("")}</div>
    <section class="plan" aria-label="Session plan"><ul>${scheduled.map(({ trophy, minutes, note }) => `<li data-task="${trophy.id}"><span>${trophy.missable ? `<b class="annotation">Missable first · </b>` : ""}${safe(displayName(trophy))}${masked(trophy) ? "" : ` · <em>${note}</em>`}</span><strong>${minutes} min</strong></li>`).join("")}</ul>
    ${scheduled.length ? "" : "<p>No unearned trophies fit this session.</p>"}<p id="plan-total"><b>Total: ${scheduled.reduce((total, task) => total + task.minutes, 0)} / ${sessionMinutes} min</b></p></section>`;
}

function sourcePage() {
  const tally = Object.fromEntries(options.confidence.map(level => [level, [...tracks.values()].filter(trophy => trophy.confidence === level).length]));
  return `<div class="folio"><section><p class="eyebrow">Research ledger</p><h2>Sources &amp; disagreements</h2><p class="lede">Field notes on where the 18 guides agree, and which call I use when they differ.</p>
    <div class="disputes">${disputes.map(([title, sides, call], index) => `<article class="dispute" id="D${index + 1}"><h3><span class="index-number">D${index + 1}</span> · ${safe(title)}</h3><p>${safe(sides)}</p><p><b class="annotation">Our call.</b> ${safe(call)}</p></article>`).join("")}</div></section>
    <aside><section class="margin-note"><p class="eyebrow">18 numbered sources</p><ol class="source-list">${sources.map((name, index) => `<li id="source-${index + 1}">[${index + 1}] ${safe(name)}</li>`).join("")}</ol></section>
    <section class="margin-note" id="confidence-summary"><p class="eyebrow">Method confidence</p><p><b>${tally.high} High</b> · corroborated method<br><b>${tally.medium} Medium</b> · single-source or partly unresolved<br><b>${tally.low} Low</b> · exact trigger unresolved</p></section>${roadmap()}</aside></div>`;
}

const renderers = { journal, tracker, missables, planner: plan, sources: sourcePage };

function render(focusSelector) {
  document.body.dataset.view = state.view;
  progress();
  if (byId("search").value !== state.query) byId("search").value = state.query;
  byId("spoiler").checked = state.spoiler;
  byId("character").value = state.character || "both";
  for (const tab of byId("tabs").querySelectorAll("button")) {
    if (tab.dataset.view === state.view) tab.setAttribute("aria-current", "page");
    else tab.removeAttribute("aria-current");
  }
  if (state.view === "missables" && !missablesVisited) {
    missablesVisited = true;
    openGuides.add(28);
  }
  byId("content").innerHTML = renderers[state.view]();
  if (focusSelector) document.querySelector(focusSelector)?.focus({ preventScroll: true });
}

function update(focusSelector) {
  save();
  render(focusSelector);
}

function changeEarned(id, checked, focusSelector) {
  if (checked) state.earned.add(id);
  else state.earned.delete(id);
  selection = id;
  update(focusSelector);
}

function exportProgress() {
  const blob = new Blob([JSON.stringify({ version: 1, ...snapshot() }, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "leonida-field-notes.json";
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

async function importProgress(input) {
  const file = input.files[0];
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    if (parsed?.version !== 1 || !Array.isArray(parsed.earned) || !parsed.earned.every(id => tracks.has(id))) throw new Error("Invalid backup");
    state = cleanState({ ...parsed, view: "tracker" });
    update("#export");
    notify("Journal imported.");
  } catch {
    notify("Could not import this file. Choose a Leonida Field Notes JSON backup.");
  } finally {
    input.value = "";
  }
}

async function copyLink() {
  save();
  try {
    await navigator.clipboard.writeText(location.href);
    notify("Journal link copied.");
  } catch {
    const field = document.createElement("textarea");
    field.value = location.href;
    field.style.position = "fixed";
    field.style.top = "-100px";
    document.body.append(field);
    field.select();
    const copied = document.execCommand("copy");
    field.remove();
    byId("copy").focus();
    notify(copied ? "Journal link copied." : "Copy the journal link from your address bar.");
  }
}

function bind() {
  document.querySelector(".skip").addEventListener("click", event => {
    event.preventDefault();
    byId("content").focus();
  });

  document.addEventListener("click", event => {
    const button = event.target.closest("button");
    if (!button) return;
    const { view, open, guide, minutes } = button.dataset;
    if (view) {
      state.view = view;
      update(view === "missables" ? `#tabs [data-view="${view}"]` : undefined);
    } else if (open) {
      const id = Number(open);
      state = cleanState({ earned: [...state.earned], spoiler: state.spoiler, view: "tracker" });
      openGuides.add(id);
      selection = id;
      update();
      byId(`trophy-${id}`).scrollIntoView({ block: "center" });
      document.querySelector(`[data-earned-id="${id}"]`).focus({ preventScroll: true });
    } else if (guide) {
      const id = Number(guide);
      if (openGuides.has(id)) openGuides.delete(id);
      else openGuides.add(id);
      selection = id;
      progress();
      byId("content").innerHTML = renderers[state.view]();
      document.querySelector(`[data-guide="${id}"]`)?.focus({ preventScroll: true });
    } else if (minutes) {
      sessionMinutes = Number(minutes);
      render(`[data-minutes="${minutes}"]`);
    } else if (button.id === "clear-filters") {
      for (const key of [...Object.keys(fields), "query"]) state[key] = "";
      update("#clear-filters");
    } else if (button.id === "export") exportProgress();
    else if (button.id === "import-button") byId("import").click();
    else if (button.id === "copy") copyLink();
    else if (button.id === "print") window.print();
  });

  document.addEventListener("change", event => {
    const input = event.target;
    if (input.id === "spoiler") { state.spoiler = input.checked; update(); }
    else if (input.id === "character") { state.character = input.value === "both" ? "" : input.value; update(); }
    else if (input.dataset.filter) { state[input.dataset.filter] = input.value; update(`#${input.id}`); }
    else if (input.dataset.earnedId) changeEarned(Number(input.dataset.earnedId), input.checked, `[data-earned-id="${input.dataset.earnedId}"]`);
    else if (input.id === "import") importProgress(input);
  });

  byId("search").addEventListener("input", event => {
    state.query = event.target.value.slice(0, 150);
    state.view = "tracker";
    update();
  });

  byId("content").addEventListener("toggle", event => {
    if (!event.target.matches(".chapter")) return;
    const index = Number(event.target.dataset.chapter);
    if (event.target.open) openChapters.add(index);
    else openChapters.delete(index);
  }, true);

  document.addEventListener("keydown", event => {
    if (event.altKey || event.metaKey || event.ctrlKey || event.target.matches("input:not([type=checkbox]),select,textarea,[contenteditable]")) return;
    if (event.key === "/") { event.preventDefault(); byId("search").focus(); return; }
    if (!["j", "k", "x"].includes(event.key)) return;
    const cards = [...document.querySelectorAll(".row[data-id]")];
    if (!cards.length) return;
    event.preventDefault();
    const current = cards.findIndex(card => Number(card.dataset.id) === selection);
    if (event.key === "x") {
      if (current >= 0 && !event.repeat) changeEarned(selection, !state.earned.has(selection), `[data-earned-id="${selection}"]`);
      return;
    }
    const index = current < 0 ? (event.key === "j" ? 0 : cards.length - 1) : (current + (event.key === "j" ? 1 : -1) + cards.length) % cards.length;
    selection = Number(cards[index].dataset.id);
    for (const card of cards) card.dataset.selected = String(Number(card.dataset.id) === selection);
    cards[index].querySelector("input").focus({ preventScroll: true });
    cards[index].scrollIntoView({ block: "nearest" });
  });

  window.addEventListener("hashchange", () => { state = cleanState(hashState() ?? localState()); update(); });
}

async function start() {
  const response = await fetch("./data/trophies.json");
  if (!response.ok) throw new Error("Trophy data unavailable");
  const { trophies } = await response.json();
  for (const trophy of trophies) tracks.set(trophy.id, trophy);
  state = cleanState(hashState() ?? localState());
  if (hashState()) save();
  bind();
  render();
}

start().catch(() => { byId("content").textContent = "Could not open the trophy data. Open the app from a local static server."; });
