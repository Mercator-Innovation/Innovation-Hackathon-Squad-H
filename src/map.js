// A simple drawn map of the made-up streets, with each home marked by risk. Not a real map.
// Uses the same risk rules as the board (risk.js). Choosing a home opens it on the board.
(function () {
  const C = window.CONTENT;
  const M = C.map;
  const homes = window.DATA.homes;
  const STORAGE_KEY = "healthier-homes-state";
  const { addWorkingDays, startOfToday, toISO, awaabSteps } = window.Clock;

  // Where each made-up area and street sits on the drawing (an 800 by 600 box).
  const AREAS = {
    North: { x: 220, y: 20, w: 360, h: 140 },
    West: { x: 20, y: 180, w: 240, h: 220 },
    Central: { x: 280, y: 180, w: 240, h: 220 },
    East: { x: 540, y: 180, w: 240, h: 220 },
    South: { x: 220, y: 420, w: 360, h: 160 }
  };
  const STREETS = {
    "Thistle Walk": { x1: 250, y1: 100, x2: 550, y2: 100 },
    "Bramble Lane": { x1: 45, y1: 250, x2: 235, y2: 250 },
    "Osprey Gardens": { x1: 45, y1: 345, x2: 235, y2: 345 },
    "Ferry View": { x1: 305, y1: 300, x2: 495, y2: 300 },
    "Heather Court": { x1: 565, y1: 300, x2: 755, y2: 300 },
    "Kestrel Drive": { x1: 250, y1: 480, x2: 550, y2: 480 },
    "Puffin Close": { x1: 250, y1: 545, x2: 550, y2: 545 }
  };

  function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, (ch) => (
      { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]
    ));
  }

  // What officers have done, plus the made-up cases already under way, as the board loads them.
  function loadState() {
    let state = {};
    try {
      state = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (e) {
      // Fine: the map shows the made-up starting picture.
    }
    const seeds = window.DATA.awaabCases || {};
    Object.keys(seeds).forEach((id) => {
      const s = state[id] || (state[id] = { history: [], dismissed: null });
      if (s.awaab !== undefined) return;
      const seed = seeds[id];
      const daysAgo = (n) => (n == null ? null : toISO(addWorkingDays(startOfToday(), -n)));
      s.awaab = {
        aware: daysAgo(seed.aware), investigated: daysAgo(seed.investigated), substantial: seed.substantial,
        summarySent: daysAgo(seed.summarySent), repairsStarted: daysAgo(seed.repairsStarted),
        repairsFinished: daysAgo(seed.repairsFinished)
      };
    });
    return state;
  }

  // A different shape for each level, so it's never colour alone (matching the board's icons).
  function marker(level, x, y) {
    if (level === "high") return '<path class="mk mk-high" d="M' + x + " " + (y - 11) + " L" + (x + 10) + " " + (y + 7) + " L" + (x - 10) + " " + (y + 7) + ' Z"/>';
    if (level === "check") return '<path class="mk mk-check" d="M' + x + " " + (y - 11) + " L" + (x + 11) + " " + y + " L" + x + " " + (y + 11) + " L" + (x - 11) + " " + y + ' Z"/>';
    if (level === "medium") return '<circle class="mk mk-medium" cx="' + x + '" cy="' + y + '" r="9"/>';
    if (level === "low") return '<path class="mk mk-low" d="M' + (x - 10) + " " + (y - 7) + " L" + (x + 10) + " " + (y - 7) + " L" + x + " " + (y + 11) + ' Z"/>';
    return '<rect class="mk mk-none" x="' + (x - 6) + '" y="' + (y - 6) + '" width="12" height="12"/>';
  }

  function render() {
    const state = loadState();
    const rows = homes.map((home) => {
      const s = state[home.id] || { history: [] };
      const risk = window.Risk.assess(home, s);
      const waiting = (s.replies || []).some((r) => !r.checked);
      const level = s.dismissed ? "none" : waiting && risk.level !== "high" ? "check" : risk.level;
      const clock = !!s.awaab && awaabSteps(s.awaab).some((step) => step.open);
      const m = home.address.match(/(\d+)\s+([A-Za-z ]+)$/);
      return { home, risk, level, clock, number: Number(m[1]), street: m[2], sensor: !!window.Risk.sensorSummary(home.id) };
    });

    // Each street's homes spread out along it, in house-number order.
    const byStreet = {};
    rows.forEach((r) => (byStreet[r.street] = byStreet[r.street] || []).push(r));
    Object.values(byStreet).forEach((list) => list.sort((a, b) => a.number - b.number || a.home.id.localeCompare(b.home.id)));

    let svg = '<svg viewBox="0 0 800 600" role="group" aria-label="' + M.alt + '" class="map-svg">';
    Object.keys(AREAS).forEach((name) => {
      const a = AREAS[name];
      svg += '<rect class="map-area" x="' + a.x + '" y="' + a.y + '" width="' + a.w + '" height="' + a.h + '" rx="14"/>' +
        '<text class="map-area-name" x="' + (a.x + 14) + '" y="' + (a.y + 26) + '">' + name + "</text>";
    });
    Object.keys(STREETS).forEach((name) => {
      const st = STREETS[name];
      const list = byStreet[name] || [];
      svg += '<line class="map-street" x1="' + st.x1 + '" y1="' + st.y1 + '" x2="' + st.x2 + '" y2="' + st.y2 + '"/>' +
        '<text class="map-street-name" x="' + st.x1 + '" y="' + (st.y1 + 34) + '">' + name + "</text>";
      list.forEach((r, i) => {
        const x = Math.round(st.x1 + (st.x2 - st.x1) * (i + 1) / (list.length + 1));
        const y = st.y1 - 4;
        const label = r.home.address + ". " + C.levels[r.level].label + ": " + C.levels[r.level].hint +
          (r.clock ? ". " + C.awaab.cardLabel : "");
        svg += '<a href="index.html#' + r.home.id + '" aria-label="' + escapeHtml(label) + '"><title>' + escapeHtml(label) + "</title>" +
          (r.clock ? '<circle class="mk-ring" cx="' + x + '" cy="' + y + '" r="15"/>' : "") +
          marker(r.level, x, y) +
          (r.sensor ? '<circle class="mk-sensor" cx="' + (x + 11) + '" cy="' + (y - 11) + '" r="4"/>' : "") +
          '<text class="map-num" x="' + x + '" y="' + (y + 24) + '" text-anchor="middle">' + r.number + "</text></a>";
      });
    });
    svg += "</svg>";

    const legendItem = (level) => "<li>" + '<svg viewBox="-14 -14 28 28" width="24" height="24" aria-hidden="true">' + marker(level, 0, 0) + "</svg> " +
      C.levels[level].label + ": " + C.levels[level].hint + "</li>";
    const legend = '<ul class="map-legend">' + ["high", "check", "medium", "low", "none"].filter((l) => C.levels[l]).map(legendItem).join("") +
      '<li><svg viewBox="-16 -16 32 32" width="24" height="24" aria-hidden="true"><circle class="mk-ring" r="13"/></svg> ' + M.clock + "</li>" +
      '<li><svg viewBox="-6 -6 12 12" width="12" height="12" aria-hidden="true"><circle class="mk-sensor" r="4"/></svg> ' + M.sensor + "</li></ul>";

    const snap = window.Risk.coldSnap();
    const list = Object.keys(STREETS).map((name) => "<h3>" + name + "</h3><ul>" + (byStreet[name] || []).map((r) => (
      '<li><a href="index.html#' + r.home.id + '">' + escapeHtml(r.home.address) + "</a>: " + C.levels[r.level].label +
      (r.clock ? ", " + C.awaab.cardLabel : "") + "</li>"
    )).join("") + "</ul>").join("");

    document.getElementById("main").innerHTML =
      "<h1>" + M.title + "</h1>" +
      '<p class="intro">' + M.intro + "</p>" +
      (snap ? '<p class="cold-banner quiet-banner">' + C.coldSnapBanner(C.dayName(snap.from), C.dayName(snap.to), snap.lowest) + "</p>" : "") +
      '<div class="map-wrap">' + svg + "</div>" +
      "<h2>" + M.legendHeading + "</h2>" + legend +
      '<details class="map-list"><summary>' + M.listHeading + "</summary><p>" + M.listIntro + "</p>" + list + "</details>";
  }

  render();
  // Changes on the board in another tab show here straight away.
  window.addEventListener("storage", (event) => { if (event.key === STORAGE_KEY) render(); });
})();
