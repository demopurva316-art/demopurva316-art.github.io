// ── Craft emoji map ──
const CRAFT_EMOJI = {
  "Kanchipuram Silk Weaving": "🧵",
  "Blue Pottery": "🏺",
  "Kantha Stitch": "��",
  "Dhokra Metal Casting": "🔩",
  "Bidriware": "⚙️",
  "Pattachitra Painting": "🎨",
  "Leather Jutti Making": "👟",
  "Chikan Embroidery": "🌸",
  "Toda Embroidery": "🌿",
  "Ajrakh Printing": "��️",
  "Hand Block Printing": "🖐️",
  "Bamboo Craft": "🎋",
  "Phulkari Embroidery": "🌺",
  "Bagh Print": "🐯",
  "Pashmina Weaving": "🧣",
};

// ── State ──
let state = { region: "", craft: "", exp: "", name: "" };

// ── DOM refs ──
const filterRegion = document.getElementById("filter-region");
const filterCraft  = document.getElementById("filter-craft");
const filterExp    = document.getElementById("filter-exp");
const filterName   = document.getElementById("filter-name");
const artisanGrid  = document.getElementById("artisan-grid");
const materialsGrid= document.getElementById("materials-grid");
const noArtisans   = document.getElementById("no-artisans");
const noMaterials  = document.getElementById("no-materials");
const resultCount  = document.getElementById("result-count");
const btnReset     = document.getElementById("btn-reset");

// ── Populate dropdowns ──
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

  // Stats
  document.getElementById("stat-crafts").textContent = crafts.length;
  document.getElementById("stat-regions").textContent = regions.length;
  document.getElementById("stat-materials").textContent = MATERIALS.length;
}

// ── Experience helpers ──
function expLevel(years) {
  if (years <= 10) return "beginner";
  if (years <= 25) return "intermediate";
  return "expert";
}
function expLabel(years) {
  const lvl = expLevel(years);
  if (lvl === "beginner") return "🌱 Beginner";
  if (lvl === "intermediate") return "📘 Intermediate";
  return "🏆 Expert";
}

// ── Render artisans ──
function renderArtisans(list) {
  artisanGrid.innerHTML = "";
  if (list.length === 0) {
    noArtisans.classList.remove("hidden");
    return;
  }
  noArtisans.classList.add("hidden");

  list.forEach((a, i) => {
    const lvl = expLevel(a.exp);
    const emoji = CRAFT_EMOJI[a.craft] || "🎭";
    const card = document.createElement("div");
    card.className = "artisan-card";
    card.style.animationDelay = `${Math.min(i * 30, 300)}ms`;
    card.innerHTML = `
      <div class="card-sl">Sl. No ${a.id}</div>
      <div class="card-name">${a.name}</div>
      <div class="card-craft">${emoji} ${a.craft}</div>
      <div class="card-meta">
        <div class="card-meta-row"><span class="icon">📍</span><span>${a.location}</span></div>
        <div class="card-meta-row"><span class="icon">⏳</span><span>${a.exp} years of experience</span></div>
      </div>
      <div class="exp-badge exp-${lvl}">${expLabel(a.exp)}</div>
    `;
    artisanGrid.appendChild(card);
  });
}

// ── Render materials ──
function renderMaterials(list) {
  materialsGrid.innerHTML = "";
  if (list.length === 0) {
    noMaterials.classList.remove("hidden");
    return;
  }
  noMaterials.classList.add("hidden");

  list.forEach((m, i) => {
    const emoji = CRAFT_EMOJI[m.craft] || "🌿";
    const card = document.createElement("div");
    card.className = "material-card";
    card.style.animationDelay = `${Math.min(i * 25, 300)}ms`;
    card.innerHTML = `
      <div class="material-name">🌿 ${m.name}</div>
      <div class="material-craft">${emoji} ${m.craft}</div>
      <div class="material-region"><span>📍</span><span>${m.region}</span></div>
    `;
    materialsGrid.appendChild(card);
  });
}

// ── Filter & render ──
function applyFilters() {
  const { region, craft, exp, name } = state;

  // Filter artisans
  let artisans = ARTISANS.filter(a => {
    if (region && a.city !== region) return false;
    if (craft  && a.craft !== craft) return false;
    if (exp    && expLevel(a.exp) !== exp) return false;
    if (name   && !a.name.toLowerCase().includes(name.toLowerCase())) return false;
    return true;
  });

  // Filter materials — match by craft OR by region city
  let materials = MATERIALS.filter(m => {
    const craftMatch  = craft  ? m.craft === craft  : true;
    const regionMatch = region ? m.region.toLowerCase() === region.toLowerCase() : true;
    // If both set, require both; if only one set, require that one
    if (craft && region) return m.craft === craft && m.region.toLowerCase() === region.toLowerCase();
    if (craft)  return m.craft === craft;
    if (region) return m.region.toLowerCase() === region.toLowerCase();
    return true;
  });

  renderArtisans(artisans);
  renderMaterials(materials);

  // Update count
  const hasFilter = region || craft || exp || name;
  resultCount.innerHTML = hasFilter
    ? `Showing <strong>${artisans.length}</strong> artisan${artisans.length !== 1 ? "s" : ""} · <strong>${materials.length}</strong> material${materials.length !== 1 ? "s" : ""}`
    : "";
}

// ── Event listeners ──
filterRegion.addEventListener("change", e => { state.region = e.target.value; applyFilters(); });
filterCraft.addEventListener("change",  e => { state.craft  = e.target.value; applyFilters(); });
filterExp.addEventListener("change",    e => { state.exp    = e.target.value; applyFilters(); });
filterName.addEventListener("input",    e => { state.name   = e.target.value; applyFilters(); });

btnReset.addEventListener("click", () => {
  state = { region: "", craft: "", exp: "", name: "" };
  filterRegion.value = "";
  filterCraft.value  = "";
  filterExp.value    = "";
  filterName.value   = "";
  applyFilters();
});

// ── Init ──
populateDropdowns();
applyFilters();
