// ── Craft emoji map ──
const CRAFT_EMOJI = {
  "Kanchipuram Silk Weaving": "🧵",
  "Blue Pottery": "🏺",
  "Kantha Stitch": "🪡",
  "Dhokra Metal Casting": "🔩",
  "Bidriware": "⚙️",
  "Pattachitra Painting": "🎨",
  "Leather Jutti Making": "👟",
  "Chikan Embroidery": "🌸",
  "Toda Embroidery": "🌿",
  "Ajrakh Printing": "🖨️",
  "Hand Block Printing": "🖐️",
  "Bamboo Craft": "🎋",
  "Phulkari Embroidery": "🌺",
  "Bagh Print": "🐯",
  "Pashmina Weaving": "🧣",
};

// ── State ──
let state = {
  region: "",
  craft: "",
  exp: "",
  name: "",
  materials: new Set(),   // selected raw material names
  sort: "match",
};

// ── Build: craft → materials lookup ──
const craftMaterials = {};   // craft → [material names]
const materialCraft  = {};   // material name → craft
MATERIALS.forEach(m => {
  if (!craftMaterials[m.craft]) craftMaterials[m.craft] = [];
  craftMaterials[m.craft].push(m.name);
  materialCraft[m.name] = m.craft;
});

// ── DOM refs ──
const filterRegion    = document.getElementById("filter-region");
const filterCraft     = document.getElementById("filter-craft");
const filterExp       = document.getElementById("filter-exp");
const filterName      = document.getElementById("filter-name");
const artisanGrid     = document.getElementById("artisan-grid");
const materialsGrid   = document.getElementById("materials-grid");
const noArtisans      = document.getElementById("no-artisans");
const noMaterials     = document.getElementById("no-materials");
const resultCount     = document.getElementById("result-count");
const btnReset        = document.getElementById("btn-reset");
const activePills     = document.getElementById("active-pills");
const materialGroups  = document.getElementById("material-groups");
const matSearch       = document.getElementById("mat-search");
const artisanBadge    = document.getElementById("artisan-count-badge");
const materialBadge   = document.getElementById("material-count-badge");

// ── Tab switching ──
document.querySelectorAll(".filter-tab").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-tab").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById("tab-" + btn.dataset.tab).classList.add("active");
  });
});

// ── Sort buttons ──
document.querySelectorAll(".sort-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".sort-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    state.sort = btn.dataset.sort;
    applyFilters();
  });
});

// ── Populate basic dropdowns ──
function populateDropdowns() {
  const regions = [...new Set(ARTISANS.map(a => a.city))].sort();
  const crafts  = [...new Set(ARTISANS.map(a => a.craft))].sort();

  regions.forEach(r => {
    const o = document.createElement("option");
    o.value = r; o.textContent = r;
    filterRegion.appendChild(o);
  });
  crafts.forEach(c => {
    const o = document.createElement("option");
    o.value = c; o.textContent = c;
    filterCraft.appendChild(o);
  });

  document.getElementById("stat-crafts").textContent    = crafts.length;
  document.getElementById("stat-regions").textContent   = regions.length;
  document.getElementById("stat-materials").textContent = MATERIALS.length;
}

// ── Build material preference chips grouped by craft ──
function buildMaterialChips(filter = "") {
  materialGroups.innerHTML = "";
  const lc = filter.toLowerCase();

  const crafts = [...new Set(MATERIALS.map(m => m.craft))].sort();

  crafts.forEach(craft => {
    const mats = craftMaterials[craft].filter(name =>
      !lc || name.toLowerCase().includes(lc) || craft.toLowerCase().includes(lc)
    );
    if (mats.length === 0) return;

    const group = document.createElement("div");
    group.className = "mat-group";

    const header = document.createElement("div");
    header.className = "mat-group-header";
    header.innerHTML = `<span>${CRAFT_EMOJI[craft] || "🌿"} ${craft}</span>
      <button class="mat-select-all" data-craft="${craft}">Select all</button>`;
    group.appendChild(header);

    const chips = document.createElement("div");
    chips.className = "mat-chips";

    mats.forEach(name => {
      const chip = document.createElement("button");
      chip.className = "mat-chip" + (state.materials.has(name) ? " selected" : "");
      chip.dataset.material = name;
      chip.textContent = name;
      chip.addEventListener("click", () => toggleMaterial(name));
      chips.appendChild(chip);
    });

    group.appendChild(chips);
    materialGroups.appendChild(group);
  });

  // Select-all buttons
  materialGroups.querySelectorAll(".mat-select-all").forEach(btn => {
    btn.addEventListener("click", () => {
      const craft = btn.dataset.craft;
      const mats  = craftMaterials[craft] || [];
      const allSelected = mats.every(m => state.materials.has(m));
      mats.forEach(m => allSelected ? state.materials.delete(m) : state.materials.add(m));
      buildMaterialChips(matSearch.value);
      applyFilters();
    });
  });
}

function toggleMaterial(name) {
  if (state.materials.has(name)) state.materials.delete(name);
  else state.materials.add(name);
  buildMaterialChips(matSearch.value);
  applyFilters();
}

// ── Active pills ──
function renderPills() {
  activePills.innerHTML = "";

  const add = (label, onRemove) => {
    const pill = document.createElement("span");
    pill.className = "pill";
    pill.innerHTML = `${label} <button class="pill-remove" title="Remove">×</button>`;
    pill.querySelector(".pill-remove").addEventListener("click", onRemove);
    activePills.appendChild(pill);
  };

  if (state.region) add(`📍 ${state.region}`, () => { state.region = ""; filterRegion.value = ""; applyFilters(); renderPills(); });
  if (state.craft)  add(`🪡 ${state.craft}`,  () => { state.craft  = ""; filterCraft.value  = ""; applyFilters(); renderPills(); });
  if (state.exp)    add(`⭐ ${expLabel(state.exp === "beginner" ? 5 : state.exp === "intermediate" ? 15 : 35)}`,
                        () => { state.exp = ""; filterExp.value = ""; applyFilters(); renderPills(); });
  if (state.name)   add(`🔍 "${state.name}"`, () => { state.name = ""; filterName.value = ""; applyFilters(); renderPills(); });

  state.materials.forEach(m => {
    add(`🌿 ${m}`, () => { state.materials.delete(m); buildMaterialChips(matSearch.value); applyFilters(); renderPills(); });
  });
}

// ── Experience helpers ──
function expLevel(years) {
  if (years <= 10) return "beginner";
  if (years <= 25) return "intermediate";
  return "expert";
}
function expLabel(years) {
  const lvl = expLevel(years);
  if (lvl === "beginner")     return "🌱 Beginner";
  if (lvl === "intermediate") return "📘 Intermediate";
  return "🏆 Expert";
}

// ── Match score: how many selected materials map to this artisan's craft ──
function matchScore(artisan) {
  if (state.materials.size === 0) return 0;
  const craftMats = craftMaterials[artisan.craft] || [];
  return [...state.materials].filter(m => craftMats.includes(m)).length;
}

// ── Render artisans ──
function renderArtisans(list) {
  artisanGrid.innerHTML = "";
  artisanBadge.textContent = list.length;

  if (list.length === 0) {
    noArtisans.classList.remove("hidden");
    return;
  }
  noArtisans.classList.add("hidden");

  list.forEach((a, i) => {
    const lvl   = expLevel(a.exp);
    const emoji = CRAFT_EMOJI[a.craft] || "🎭";
    const score = matchScore(a);
    const totalMats = craftMaterials[a.craft] ? craftMaterials[a.craft].length : 0;

    // Which selected materials match this artisan
    const matchedMats = state.materials.size > 0
      ? [...state.materials].filter(m => (craftMaterials[a.craft] || []).includes(m))
      : [];

    const isHighlighted = score > 0;

    const card = document.createElement("div");
    card.className = "artisan-card" + (isHighlighted ? " highlighted" : "");
    card.style.animationDelay = `${Math.min(i * 20, 400)}ms`;

    // Match bar
    const matchBar = state.materials.size > 0 ? `
      <div class="match-row">
        <div class="match-bar-wrap">
          <div class="match-bar-fill" style="width:${totalMats ? Math.round(score/state.materials.size*100) : 0}%"></div>
        </div>
        <span class="match-score">${score}/${state.materials.size} material match</span>
      </div>` : "";

    // Matched material tags
    const matchTags = matchedMats.length > 0 ? `
      <div class="matched-mats">
        ${matchedMats.map(m => `<span class="mat-tag">🌿 ${m}</span>`).join("")}
      </div>` : "";

    card.innerHTML = `
      ${isHighlighted ? '<div class="highlight-ribbon">✦ Match</div>' : ""}
      <div class="card-sl">Sl. No ${a.id}</div>
      <div class="card-name">${a.name}</div>
      <div class="card-craft">${emoji} ${a.craft}</div>
      <div class="card-meta">
        <div class="card-meta-row"><span class="icon">📍</span><span>${a.location}</span></div>
        <div class="card-meta-row"><span class="icon">⏳</span><span>${a.exp} years of experience</span></div>
      </div>
      <div class="exp-badge exp-${lvl}">${expLabel(a.exp)}</div>
      ${matchBar}
      ${matchTags}
    `;
    artisanGrid.appendChild(card);
  });
}

// ── Render materials ──
function renderMaterials(list) {
  materialsGrid.innerHTML = "";
  materialBadge.textContent = list.length;

  if (list.length === 0) {
    noMaterials.classList.remove("hidden");
    return;
  }
  noMaterials.classList.add("hidden");

  list.forEach((m, i) => {
    const emoji      = CRAFT_EMOJI[m.craft] || "🌿";
    const isSelected = state.materials.has(m.name);

    const card = document.createElement("div");
    card.className = "material-card" + (isSelected ? " mat-selected" : "");
    card.style.animationDelay = `${Math.min(i * 20, 400)}ms`;
    card.innerHTML = `
      <div class="material-name">🌿 ${m.name}</div>
      <div class="material-craft">${emoji} ${m.craft}</div>
      <div class="material-region"><span>📍</span><span>${m.region}</span></div>
      ${isSelected ? '<div class="mat-selected-badge">✓ In your preferences</div>' : ""}
    `;

    // Clicking a material card toggles it as a preference
    card.title = isSelected ? "Click to remove from preferences" : "Click to add to preferences";
    card.style.cursor = "pointer";
    card.addEventListener("click", () => {
      toggleMaterial(m.name);
      renderPills();
    });

    materialsGrid.appendChild(card);
  });
}

// ── Main filter + render ──
function applyFilters() {
  const { region, craft, exp, name, sort } = state;

  // ── Filter artisans ──
  let artisans = ARTISANS.filter(a => {
    if (region && a.city !== region) return false;
    if (craft  && a.craft !== craft) return false;
    if (exp    && expLevel(a.exp) !== exp) return false;
    if (name   && !a.name.toLowerCase().includes(name.toLowerCase())) return false;
    // If materials selected: only show artisans whose craft uses at least one
    if (state.materials.size > 0 && matchScore(a) === 0) return false;
    return true;
  });

  // ── Sort ──
  artisans = [...artisans].sort((a, b) => {
    if (sort === "match") {
      const diff = matchScore(b) - matchScore(a);
      if (diff !== 0) return diff;
      return b.exp - a.exp; // tiebreak by experience
    }
    if (sort === "exp-desc") return b.exp - a.exp;
    if (sort === "exp-asc")  return a.exp - b.exp;
    if (sort === "name")     return a.name.localeCompare(b.name);
    return 0;
  });

  // ── Filter materials ──
  // Determine which crafts are relevant from current artisan results
  const relevantCrafts = new Set(artisans.map(a => a.craft));

  let materials = MATERIALS.filter(m => {
    // If a material is in selected preferences, always show it
    if (state.materials.has(m.name)) return true;
    // Otherwise filter by craft/region from basic filters
    if (craft  && m.craft !== craft) return false;
    if (region && m.region.toLowerCase() !== region.toLowerCase()) return false;
    // If no basic filters but artisans are filtered, show materials for those crafts
    if (!craft && !region && artisans.length < ARTISANS.length) {
      return relevantCrafts.has(m.craft);
    }
    return true;
  });

  renderArtisans(artisans);
  renderMaterials(materials);
  renderPills();

  // Result count
  const hasFilter = region || craft || exp || name || state.materials.size > 0;
  resultCount.innerHTML = hasFilter
    ? `Showing <strong>${artisans.length}</strong> artisan${artisans.length !== 1 ? "s" : ""} · <strong>${materials.length}</strong> material${materials.length !== 1 ? "s" : ""}`
    : `All <strong>${ARTISANS.length}</strong> artisans · <strong>${MATERIALS.length}</strong> materials`;
}

// ── Event listeners ──
filterRegion.addEventListener("change", e => { state.region = e.target.value; applyFilters(); });
filterCraft.addEventListener("change",  e => { state.craft  = e.target.value; applyFilters(); });
filterExp.addEventListener("change",    e => { state.exp    = e.target.value; applyFilters(); });
filterName.addEventListener("input",    e => { state.name   = e.target.value; applyFilters(); });

matSearch.addEventListener("input", e => buildMaterialChips(e.target.value));

btnReset.addEventListener("click", () => {
  state = { region: "", craft: "", exp: "", name: "", materials: new Set(), sort: state.sort };
  filterRegion.value = "";
  filterCraft.value  = "";
  filterExp.value    = "";
  filterName.value   = "";
  matSearch.value    = "";
  buildMaterialChips();
  applyFilters();
});

// ── Init ──
populateDropdowns();
buildMaterialChips();
applyFilters();
