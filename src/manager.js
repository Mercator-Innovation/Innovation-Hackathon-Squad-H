// The manager summary: the whole picture across every home, using the same rules as the board.
// It only reads what officers have done (this browser's storage); it never changes anything.
(function () {
  const C = window.CONTENT;
  const M = C.manager;
  const homes = window.DATA.homes;
  const STORAGE_KEY = "healthier-homes-state";
  const { addWorkingDays, startOfToday, toISO, fromISO, awaabSteps } = window.Clock;

  function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, (ch) => (
      { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]
    ));
  }

  function formatDate(date) {
    return date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  }

  function loadState() {
    let state = {};
    try {
      state = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (e) {
      // Fine: the summary shows the made-up starting picture.
    }
    // The made-up cases already under way, as the board loads them.
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

  // The monthly reminders sent, so tenants who don't reply count as gone quiet.
  function remindersState() {
    try {
      return JSON.parse(localStorage.getItem("healthier-homes-reminders")) || null;
    } catch (e) {
      return null;
    }
  }

  function render() {
    const state = loadState();
    const rows = homes.map((home) => {
      const s = state[home.id] || { history: [] };
      const steps = s.awaab ? awaabSteps(s.awaab) : [];
      const open = steps.filter((step) => step.open);
      return {
        home, s, steps, open,
        risk: window.Risk.assess(home, s),
        waiting: (s.replies || []).some((r) => !r.checked),
        running: open.length > 0,
        late: open.some((step) => step.daysLeft < 0),
        quiet: !!window.Quiet.check(home, s, remindersState(), window.DATA.contactPreferences, window.Clock.startOfToday())
      };
    });
    const live = rows.filter((r) => !r.s.dismissed);
    const count = (list, test) => list.filter(test).length;

    // The tiles at the top.
    const tile = (n, label, tone) => '<li class="tile' + (tone ? " " + tone : "") + '"><span class="tile-n">' + n + "</span> " + label + "</li>";
    const tiles =
      tile(count(live, (r) => r.risk.level === "high"), M.levels.high, "tone-high") +
      tile(count(live, (r) => r.risk.level === "medium"), M.levels.medium, "tone-medium") +
      tile(count(live, (r) => r.risk.level === "low"), M.levels.low, "tone-low") +
      tile(count(rows, (r) => r.waiting), M.waiting, "tone-check") +
      tile(count(live, (r) => r.quiet), C.quiet.tile, "tone-low") +
      tile(count(rows, (r) => r.running), M.running) +
      tile(count(rows, (r) => r.late), M.late, count(rows, (r) => r.late) ? "tone-high" : "") +
      tile(count(rows, (r) => r.s.dismissed), M.dismissed);

    // Deadlines: anything missed, and anything due within 5 working days. Most urgent first.
    const due = [];
    rows.forEach((r) => r.open.forEach((step) => { if (step.daysLeft <= 5) due.push({ r, step }); }));
    due.sort((a, b) => a.step.daysLeft - b.step.daysLeft);
    const dueTable = !due.length ? "<p>" + M.dueNone + "</p>" :
      '<div class="table-wrap"><table><caption class="visually-hidden">' + M.dueHeading + "</caption><thead><tr>" +
        M.dueCols.map((c) => '<th scope="col">' + c + "</th>").join("") + "</tr></thead><tbody>" +
        due.map(({ r, step }) => "<tr><td>" + escapeHtml(r.home.address) + "</td><td>" + C.awaab.steps[step.key].label + "</td><td>" +
          formatDate(step.due) + "</td><td" + (step.daysLeft < 0 ? ' class="clock-late"' : "") + ">" +
          (step.daysLeft < 0 ? '<span aria-hidden="true">! </span>' + M.lateWord(-step.daysLeft) : M.leftWord(step.daysLeft)) + "</td></tr>").join("") +
      "</tbody></table></div>";

    // Risk by area.
    const areas = [...new Set(homes.map((h) => h.area))].sort();
    const areaTable = '<div class="table-wrap"><table><caption class="visually-hidden">' + M.areaHeading + "</caption><thead><tr>" +
      M.areaCols.map((c) => '<th scope="col">' + c + "</th>").join("") + "</tr></thead><tbody>" +
      areas.map((area) => {
        const inArea = live.filter((r) => r.home.area === area);
        return '<tr><th scope="row">' + area + "</th><td>" + count(inArea, (r) => r.risk.level === "high") + "</td><td>" +
          count(inArea, (r) => r.risk.level === "medium") + "</td><td>" + count(inArea, (r) => r.risk.level === "low") + "</td><td>" +
          count(rows.filter((r) => r.home.area === area), (r) => r.running) + "</td></tr>";
      }).join("") + "</tbody></table></div>";

    // Damp and mould figures.
    const cases = rows.filter((r) => r.s.awaab);
    const investigateStep = (r) => r.steps.find((step) => step.key === "investigate");
    const onTime = count(cases, (r) => r.s.awaab.investigated && fromISO(r.s.awaab.investigated) <= investigateStep(r).due);
    const lateInv = count(cases, (r) => (r.s.awaab.investigated && fromISO(r.s.awaab.investigated) > investigateStep(r).due) ||
      (!r.s.awaab.investigated && investigateStep(r).open && investigateStep(r).daysLeft < 0));
    const delays = cases.reduce((n, r) => n + Object.keys(r.s.awaab.delays || {}).length, 0);
    const figure = (label, n) => "<li><strong>" + n + "</strong> " + label + "</li>";
    const figures = "<ul class=\"figures\">" +
      figure(M.figures.cases, cases.length) +
      figure(M.figures.investigatedOnTime, onTime) +
      figure(M.figures.investigatedLate, lateInv) +
      figure(M.figures.repairsFinished, count(cases, (r) => r.s.awaab.repairsFinished)) +
      figure(M.figures.delays, delays) + "</ul>";

    // Outcomes recorded by officers.
    const tally = {};
    rows.forEach((r) => { if (r.s.outcome) tally[r.s.outcome.result] = (tally[r.s.outcome.result] || 0) + 1; });
    const outcomes = !Object.keys(tally).length ? "<p>" + M.outcomesNone + "</p>" :
      '<ul class="figures">' + C.outcome.options.filter((o) => tally[o]).map((o) => figure(o.toLowerCase(), tally[o])).join("") + "</ul>";

    document.getElementById("main").innerHTML =
      "<h1>" + M.title + "</h1>" +
      '<p class="intro">' + M.intro + "</p>" +
      '<ul class="tiles">' + tiles + "</ul>" +
      "<section><h2>" + M.dueHeading + "</h2>" + dueTable + "</section>" +
      "<section><h2>" + M.areaHeading + "</h2>" + areaTable + "</section>" +
      "<section><h2>" + M.figuresHeading + "</h2>" + figures + '<p class="note">' + M.figuresNote + "</p></section>" +
      "<section><h2>" + M.outcomesHeading + "</h2>" + outcomes + "</section>";
  }

  render();
  // Changes made on the board in another tab show up here straight away.
  window.addEventListener("storage", (event) => { if (event.key === STORAGE_KEY) render(); });
})();
