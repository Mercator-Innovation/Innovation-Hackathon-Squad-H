// Behaviour for the healthier homes board.
// The rules below are simple on purpose, so anyone can read why a home was flagged.
(function () {
  const C = window.CONTENT;
  const homes = window.DATA.homes;
  const STORAGE_KEY = "healthier-homes-state";

  // What officers have done: { [homeId]: { history: [...], dismissed: "reason" | null } }
  let state = loadState();
  let selectedId = null;

  // ---------- Risk rules ----------

  function assess(home) {
    const reasons = [];
    let score = 0;
    const add = (points, text) => { score += points; reasons.push({ points, text }); };

    if (home.epc === "F" || home.epc === "G") add(2, C.reasons.epcPoor(home.epc));
    else if (home.epc === "E") add(1, C.reasons.epcFair(home.epc));
    if (home.built < 1960) add(1, C.reasons.oldHome(home.built));
    if (home.condensationJobs >= 2) add(2, C.reasons.condensation(home.condensationJobs));
    else if (home.condensationJobs === 1) add(1, C.reasons.condensation(1));
    if (home.leakJobs > 0) add(1, C.reasons.leak(home.leakJobs));
    if (home.arrearsWeeks > 0) add(1, C.reasons.arrears(home.arrearsWeeks));
    if (home.fuelVouchers > 0) add(2, C.reasons.fuel(home.fuelVouchers));
    if (home.gasNoAccess) add(1, C.reasons.gasNoAccess);
    if (home.monthsSinceContact >= 18) add(1, C.reasons.quiet(home.monthsSinceContact));

    // Support notes count only with the tenant's consent.
    if (home.consent && home.supportNotes.length) {
      home.supportNotes.forEach((note) => add(2, C.reasons.supportNote(note)));
    }

    // Age raises priority only alongside other signs; on its own it means a regular check-in.
    const older = home.oldestAge >= 75;
    if (older && score >= 2) add(2, C.reasons.olderPlus);

    let level = "none";
    if (score >= 7) level = "high";
    else if (score >= 4) level = "medium";
    else if (score >= 1) level = "low";
    if (older && level === "none") {
      level = "low";
      reasons.push({ points: 0, text: C.reasons.olderCheckIn });
    }

    // Strongest reasons first, so the card shows what matters most.
    reasons.sort((a, b) => b.points - a.points);
    const unusedNotes = home.consent ? 0 : home.supportNotes.length;
    return { score, level, reasons: reasons.map((r) => r.text), unusedNotes };
  }

  const assessed = homes.map((home) => ({ home, ...assess(home) }));
  const levelOrder = { high: 0, medium: 1, low: 2, none: 3 };

  // ---------- Saving what officers did ----------

  function loadState() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (e) {
      return {};
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      // Fine: the board still works, it just won't remember after a refresh.
    }
  }

  function homeState(id) {
    if (!state[id]) state[id] = { history: [], dismissed: null };
    return state[id];
  }

  // ---------- Helpers ----------

  function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, (ch) => (
      { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]
    ));
  }

  function addWorkingDays(date, days) {
    const result = new Date(date);
    let added = 0;
    while (added < days) {
      result.setDate(result.getDate() + 1);
      const day = result.getDay();
      if (day !== 0 && day !== 6) added++;
    }
    return result;
  }

  function formatDate(date) {
    return date.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  }

  function badge(level) {
    const l = C.levels[level];
    return '<span class="badge level-' + level + '"><span aria-hidden="true">' + l.icon + "</span> " +
      l.label + ": " + l.hint + "</span>";
  }

  // ---------- The list ----------

  const listEl = document.getElementById("home-list");
  const detailEl = document.getElementById("detail");
  const levelFilter = document.getElementById("filter-level");
  const searchFilter = document.getElementById("filter-search");
  const summaryEl = document.getElementById("summary");

  function renderList() {
    const level = levelFilter.value;
    const search = searchFilter.value.trim().toLowerCase();

    const visible = assessed
      .filter((a) => {
        const dismissed = !!homeState(a.home.id).dismissed;
        if (level === "dismissed") return dismissed;
        if (level !== "all" && (dismissed || a.level !== level)) return false;
        if (search && !(a.home.address + " " + a.home.id).toLowerCase().includes(search)) return false;
        return true;
      })
      .sort((a, b) => {
        const da = homeState(a.home.id).dismissed ? 1 : 0;
        const db = homeState(b.home.id).dismissed ? 1 : 0;
        return da - db || levelOrder[a.level] - levelOrder[b.level] || b.score - a.score;
      });

    const counts = { high: 0, medium: 0, low: 0 };
    assessed.forEach((a) => {
      if (!homeState(a.home.id).dismissed && counts[a.level] !== undefined) counts[a.level]++;
    });
    summaryEl.textContent = visible.length + " of " + assessed.length + " homes shown. " +
      counts.high + " high, " + counts.medium + " medium, " + counts.low + " low.";

    if (!visible.length) {
      listEl.innerHTML = '<li class="note">' + C.noResults + "</li>";
      return;
    }

    listEl.innerHTML = visible.map((a) => {
      const s = homeState(a.home.id);
      const status = s.dismissed
        ? '<span class="badge status">' + C.dismissedLabel + "</span>"
        : s.history.length ? '<span class="badge status">' + C.actionTakenLabel + "</span>" : "";
      const shortReasons = a.reasons.slice(0, 2).join("; ") + (a.reasons.length > 2 ? "; and more" : "");
      return '<li><button type="button" class="home-card level-' + a.level + (s.dismissed ? " is-dismissed" : "") +
        '" data-id="' + a.home.id + '"' + (a.home.id === selectedId ? ' aria-current="true"' : "") + ">" +
        '<span class="card-top"><span class="card-address">' + a.home.address + "</span>" +
        '<span class="card-ref">' + a.home.id + ", " + a.home.area + "</span></span>" +
        "<span>" + badge(a.level) + status + "</span>" +
        '<span class="card-reasons">' + (shortReasons || C.noReasons) + "</span>" +
        "</button></li>";
    }).join("");
  }

  listEl.addEventListener("click", (event) => {
    const card = event.target.closest(".home-card");
    if (!card) return;
    selectedId = card.dataset.id;
    renderList();
    renderDetail(true);
  });

  levelFilter.addEventListener("change", renderList);
  searchFilter.addEventListener("input", renderList);

  // ---------- The detail panel ----------

  function renderDetail(moveFocus) {
    if (!selectedId) {
      detailEl.innerHTML = '<p class="note">' + C.emptyDetail + "</p>";
      return;
    }
    const a = assessed.find((x) => x.home.id === selectedId);
    const h = a.home;
    const s = homeState(h.id);

    const reasons = a.reasons.length
      ? '<ul class="reasons">' + a.reasons.map((r) => "<li>" + r + "</li>").join("") + "</ul>"
      : '<p>' + C.noReasons + "</p>";

    const actionOptions = Object.keys(C.actions).map((key) => (
      '<label class="radio"><input type="radio" name="action" value="' + key + '"><span>' +
      C.actions[key].label + "<small>" + C.actions[key].team + "</small></span></label>"
    )).join("");

    const urgencyOptions = C.urgencies.map((u) => "<option>" + u + "</option>").join("");

    const history = s.history.length
      ? '<ul class="history">' + s.history.map((item) => (
          "<li><strong>" + escapeHtml(item.label) + "</strong> (" + escapeHtml(item.team) + ", " +
          escapeHtml(item.urgency.toLowerCase()) + "), booked " + escapeHtml(item.date) +
          (item.awaab ? ". " + escapeHtml(item.awaab) : "") + "</li>"
        )).join("") + "</ul>"
      : '<p class="note">' + C.noHistory + "</p>";

    const dismissBlock = s.dismissed
      ? '<p class="success">' + escapeHtml(C.dismissed(s.dismissed)) + "</p>" +
        '<button type="button" class="button secondary" id="undo-dismiss">' + C.undoDismiss + "</button>"
      : '<form id="dismiss-form" novalidate>' +
          '<div class="field"><label for="dismiss-reason">' + C.dismissLabel + "</label>" +
          '<p class="note" id="dismiss-hint">' + C.dismissHint + "</p>" +
          '<p class="error" id="dismiss-error" hidden></p>' +
          '<textarea id="dismiss-reason" rows="2" aria-describedby="dismiss-hint dismiss-error"></textarea></div>' +
          '<p><button type="submit" class="button secondary">' + C.dismissButton + "</button></p>" +
        "</form>";

    detailEl.innerHTML =
      '<h2 id="detail-heading" tabindex="-1">' + h.address + "</h2>" +
      "<p>" + badge(a.level) + "</p>" +

      "<h3>" + C.reasonsHeading + "</h3>" + reasons +
      (a.unusedNotes ? '<p class="note">' + C.notesNotUsed(a.unusedNotes) + "</p>" : "") +

      "<h3>" + C.aboutHeading + "</h3>" +
      '<dl class="facts">' +
        "<dt>Reference</dt><dd>" + h.id + ", " + h.area + "</dd>" +
        "<dt>Household</dt><dd>" + h.household + "</dd>" +
        "<dt>Oldest tenant</dt><dd>" + h.oldestAge + "</dd>" +
        "<dt>Energy rating</dt><dd>" + h.epc + "</dd>" +
        "<dt>Built</dt><dd>" + h.built + "</dd>" +
        "<dt>Consent</dt><dd>" + (h.consent ? C.consentYes : C.consentNo) + "</dd>" +
      "</dl>" +

      '<hr class="divider">' +
      "<h3>" + C.actionHeading + "</h3>" +
      '<form id="action-form" novalidate>' +
        '<fieldset><legend>' + C.actionLegend + "</legend>" + actionOptions + "</fieldset>" +
        '<details id="letter-preview"><summary>' + C.letterPreviewSummary + "</summary>" +
          '<div class="letter"><p><strong>' + C.letterTitle + "</strong></p><p>" + C.letterIntro + "</p>" +
          "<ul>" + C.letterItems.map((i) => "<li>" + i + "</li>").join("") + "</ul>" +
          "<p>" + C.letterEnd + "</p></div>" +
        "</details>" +
        '<div class="field"><label for="urgency">' + C.urgencyLabel + "</label>" +
          '<select id="urgency">' + urgencyOptions + "</select></div>" +
        '<label class="check"><input type="checkbox" id="confirm-check"><span>' + C.confirmCheck + "</span></label>" +
        '<p class="error" id="action-error" hidden></p>' +
        '<button type="submit" class="button">' + C.confirmButton + "</button>" +
        '<div id="action-result"></div>' +
      "</form>" +

      "<h3>" + C.historyHeading + "</h3>" + history +

      '<hr class="divider">' +
      "<h3>" + C.dismissHeading + "</h3>" + dismissBlock;

    wireDetail(h);

    if (moveFocus) {
      const heading = document.getElementById("detail-heading");
      heading.focus();
      if (window.matchMedia("(max-width: 899px)").matches) heading.scrollIntoView({ behavior: "smooth" });
    }
  }

  function showError(el, message) {
    el.textContent = message;
    el.hidden = !message;
  }

  function wireDetail(home) {
    const s = homeState(home.id);

    const actionForm = document.getElementById("action-form");
    actionForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const error = document.getElementById("action-error");
      const chosen = actionForm.querySelector('input[name="action"]:checked');
      if (!chosen) return showError(error, C.chooseAction);
      if (!document.getElementById("confirm-check").checked) return showError(error, C.confirmNeeded);
      showError(error, "");

      const action = C.actions[chosen.value];
      const today = new Date();
      const entry = {
        type: chosen.value,
        label: action.label,
        team: action.team,
        urgency: document.getElementById("urgency").value,
        date: formatDate(today)
      };
      // A damp check means the landlord is aware, so the Awaab's Law clock starts.
      if (chosen.value === "damp") entry.awaab = C.awaabStarted(formatDate(addWorkingDays(today, 10)));

      s.history.push(entry);
      saveState();
      renderList();
      renderDetail(false);
      const result = document.getElementById("action-result");
      result.innerHTML = '<p class="success" tabindex="-1" id="action-success">' +
        escapeHtml(entry.label) + ": done." + (entry.awaab ? " " + escapeHtml(entry.awaab) : "") + "</p>";
      document.getElementById("action-success").focus();
    });

    // Open the questionnaire preview when that action is chosen.
    actionForm.addEventListener("change", (event) => {
      if (event.target.name === "action") {
        document.getElementById("letter-preview").open = event.target.value === "letter";
      }
    });

    const dismissForm = document.getElementById("dismiss-form");
    if (dismissForm) {
      dismissForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const reason = document.getElementById("dismiss-reason").value.trim();
        if (!reason) return showError(document.getElementById("dismiss-error"), C.dismissNeeded);
        s.dismissed = reason;
        saveState();
        renderList();
        renderDetail(true);
      });
    }

    const undo = document.getElementById("undo-dismiss");
    if (undo) {
      undo.addEventListener("click", () => {
        s.dismissed = null;
        saveState();
        renderList();
        renderDetail(true);
      });
    }
  }

  // ---------- Start ----------

  document.getElementById("service-name").textContent = C.serviceName;
  document.getElementById("banner").textContent = C.banner;
  document.getElementById("list-heading").textContent = C.listHeading;
  document.getElementById("list-intro").textContent = C.listIntro;
  document.getElementById("filter-level-label").textContent = C.filterLevel;
  document.getElementById("filter-search-label").textContent = C.filterSearch;

  renderList();
  renderDetail(false);
})();
