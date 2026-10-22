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

  // Where the main north to south roads run (see basemap), so houses aren't drawn on them.
  const MAIN_ROADS_X = [140, 270, 400, 530, 660];

  // The drawing under the homes: land, a river along the north, parks with trees, and the main
  // roads joining the streets. It's a made-up neighbourhood, labelled as such, not a real place.
  function basemap() {
    const road = (d) => '<path class="map-road-edge main" d="' + d + '"/><path class="map-road main" d="' + d + '"/>';
    const trees = (points) => points.map(([x, y]) => '<circle class="map-tree" cx="' + x + '" cy="' + y + '" r="7"/>').join("");
    return '<g aria-hidden="true">' +
      '<rect class="map-land" x="0" y="0" width="800" height="600"/>' +
      // The river, with a riverside path.
      '<path class="map-water" d="M0 0 H800 V22 C700 44 610 10 500 28 C390 46 300 12 190 30 C110 42 50 24 0 34 Z"/>' +
      '<text class="map-water-name" x="640" y="20">River</text>' +
      // Parks.
      '<rect class="map-park" x="600" y="48" width="180" height="104" rx="18"/>' +
      trees([[625, 75], [650, 95], [700, 70], [745, 90], [760, 130], [630, 130]]) +
      '<text class="map-park-name" x="660" y="122">Riverside Park</text>' +
      '<rect class="map-park" x="18" y="410" width="196" height="172" rx="18"/>' +
      trees([[45, 440], [80, 470], [60, 545], [170, 440], [190, 520], [130, 560]]) +
      '<text class="map-park-name" x="70" y="505">Green Park</text>' +
      '<rect class="map-park" x="586" y="410" width="196" height="172" rx="18"/>' +
      trees([[610, 440], [650, 470], [760, 445], [740, 545], [615, 555], [700, 500]]) +
      '<text class="map-park-name" x="640" y="525">Playing Fields</text>' +
      // Main roads joining the streets.
      road("M0 170 C200 160 600 180 800 168") +
      road("M400 100 V170") +
      road("M270 170 V600") +
      road("M530 172 V600") +
      road("M140 170 V345") +
      road("M660 168 V300") +
      '<text class="map-main-road-name" x="20" y="162">High Road</text>' +
      // A compass and an honest label.
      '<g class="map-compass" transform="translate(40 80)"><circle r="18"/><path d="M0 -14 L6 4 L0 0 L-6 4 Z"/><text y="-22" text-anchor="middle">N</text></g>' +
      '<text class="map-made-up" x="790" y="594" text-anchor="end">Made-up area. Not a real place.</text>' +
      "</g>";
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

    let svg = '<svg viewBox="0 0 800 600" role="group" aria-label="' + M.alt + '" class="map-svg">' + basemap();
    Object.keys(AREAS).forEach((name) => {
      const a = AREAS[name];
      // South's label sits a little higher, clear of the first row of houses.
      svg += '<text class="map-area-name" x="' + (a.x + 14) + '" y="' + (a.y + (name === "South" ? 8 : 26)) + '">' + name + "</text>";
    });
    Object.keys(STREETS).forEach((name) => {
      const st = STREETS[name];
      const list = byStreet[name] || [];
      // Each street is drawn like a road on a map, with a row of houses along it.
      // No houses where a main road crosses, and no row at all if it would cover the name of the
      // street just above.
      const crowded = Object.keys(STREETS).some((other) => {
        const o = STREETS[other];
        return other !== name && st.y1 - o.y1 > 0 && st.y1 - o.y1 < 70 && o.x1 < st.x2 && o.x2 > st.x1;
      });
      let houses = "";
      for (let hx = st.x1 + 6; !crowded && hx < st.x2 - 14; hx += 24) {
        if (MAIN_ROADS_X.some((rx) => hx < rx + 10 && hx + 18 > rx - 10)) continue;
        houses += '<rect class="map-block" x="' + hx + '" y="' + (st.y1 - 42) + '" width="18" height="14" rx="2"/>';
      }
      svg += houses +
        '<line class="map-road-edge" x1="' + st.x1 + '" y1="' + st.y1 + '" x2="' + st.x2 + '" y2="' + st.y2 + '"/>' +
        '<line class="map-road" x1="' + st.x1 + '" y1="' + st.y1 + '" x2="' + st.x2 + '" y2="' + st.y2 + '"/>' +
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
