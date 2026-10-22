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

  // Working days are Monday to Friday, skipping Scottish bank holidays (data/bank-holidays.js).
  const bankHolidays = new Set(window.DATA.bankHolidays || []);

  function isWorkingDay(date) {
    const day = date.getDay();
    return day !== 0 && day !== 6 && !bankHolidays.has(toISO(date));
  }

  function addWorkingDays(date, days) {
    const result = new Date(date);
    const step = days < 0 ? -1 : 1;
    let added = 0;
    while (added < Math.abs(days)) {
      result.setDate(result.getDate() + step);
      if (isWorkingDay(result)) added++;
    }
    return result;
  }

  function startOfToday() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  function toISO(date) {
    return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" +
      String(date.getDate()).padStart(2, "0");
  }

  function fromISO(text) {
    const [y, m, d] = text.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  // Working days from today until a date: negative once it has passed.
  function workingDaysFromToday(due) {
    const day = startOfToday();
    const step = due >= day ? 1 : -1;
    let count = 0;
    while (day.getTime() !== due.getTime()) {
      day.setDate(day.getDate() + step);
      if (isWorkingDay(day)) count += step;
    }
    return count;
  }

  function formatDate(date) {
    return date.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  }

  // ---------- The Awaab's Law clock ----------
  // A case is { aware, investigated, substantial, summarySent, repairsStarted, repairsFinished },
  // with dates as "YYYY-MM-DD" (null until that step happens).

  function newCase() {
    return { aware: toISO(startOfToday()), investigated: null, substantial: null,
      summarySent: null, repairsStarted: null, repairsFinished: null };
  }

  function awaabSteps(c) {
    const investigated = c.investigated && fromISO(c.investigated);
    const noRepairs = c.substantial === false;
    const steps = [
      { key: "investigate", due: addWorkingDays(fromISO(c.aware), 10), done: c.investigated },
      { key: "summary", due: investigated ? addWorkingDays(investigated, 3) : null, done: c.summarySent },
      { key: "start", due: investigated && c.substantial ? addWorkingDays(investigated, 5) : null,
        done: c.repairsStarted, notNeeded: noRepairs },
      { key: "finish", due: c.repairsStarted ? addWorkingDays(fromISO(c.repairsStarted), 20) : null,
        done: c.repairsFinished, notNeeded: noRepairs }
    ];
    // A recorded delay replaces that step's deadline with the new date.
    const delays = c.delays || {};
    steps.forEach((s) => {
      s.delay = delays[s.key] || null;
      if (s.delay && !s.done) s.due = fromISO(s.delay.newDate);
      s.open = !s.done && !s.notNeeded && !!s.due;
      if (s.open) s.daysLeft = workingDaysFromToday(s.due);
    });
    return steps;
  }

  // The most urgent open step, or null when the clock isn't running.
  function awaabStatus(id) {
    const c = homeState(id).awaab;
    if (!c) return null;
    const open = awaabSteps(c).filter((s) => s.open).sort((a, b) => a.daysLeft - b.daysLeft);
    if (!open.length) return null;
    return { next: open[0], late: open.some((s) => s.daysLeft < 0) };
  }

  function daysText(daysLeft) {
    return daysLeft < 0 ? C.awaab.late(-daysLeft) : C.awaab.left(daysLeft);
  }

  function awaabBadge(status) {
    return '<span class="badge awaab' + (status.late ? " is-late" : "") + '">' +
      (status.late ? '<span aria-hidden="true">! </span>' : "") + C.awaab.cardLabel + ": " +
      C.awaab.steps[status.next.key].label + ", " + daysText(status.next.daysLeft) +
      (status.next.delay ? " (" + C.awaab.delayedTag + ")" : "") + "</span>";
  }

  function renderAwaab(c) {
    const steps = awaabSteps(c);
    const anyLate = steps.some((s) => s.open && s.daysLeft < 0);

    const items = steps.map((s) => {
      const step = C.awaab.steps[s.key];
      let status;
      if (s.done) status = '<span class="clock-done">' + C.awaab.done(formatDate(fromISO(s.done))) + "</span>";
      else if (s.notNeeded) status = '<span class="note">' + C.awaab.notNeeded + "</span>";
      else if (s.open) {
        status = '<span class="' + (s.daysLeft < 0 ? "clock-late" : "clock-due") + '">' +
          C.awaab.dueBy(formatDate(s.due)) + ": " + daysText(s.daysLeft) + "</span>";
        if (s.delay) {
          status += '<br><span class="note">' + escapeHtml(C.awaab.delayed(formatDate(s.due), s.delay.reason)) +
            ". " + escapeHtml(C.awaab.delayInterimShown(s.delay.interim)) + ".</span>";
        }
      } else status = '<span class="note">' + C.awaab.waiting + "</span>";
      return "<li><strong>" + step.label + "</strong> <span class=\"note\">" + step.rule + "</span><br>" + status + "</li>";
    }).join("");

    const open = {};
    steps.forEach((s) => { if (s.open) open[s.key] = true; });
    let controls = "";
    if (open.investigate) {
      controls += '<fieldset><legend>' + C.awaab.substantialLegend + "</legend>" +
        '<label class="radio"><input type="radio" name="substantial" value="yes"><span>' + C.awaab.substantialYes + "</span></label>" +
        '<label class="radio"><input type="radio" name="substantial" value="no"><span>' + C.awaab.substantialNo + "</span></label>" +
        "</fieldset>" +
        '<p class="error" id="awaab-error" hidden></p>' +
        '<p><button type="button" class="button secondary" data-step="investigate">' + C.awaab.markInvestigated + "</button></p>";
    }
    if (open.summary) controls += '<p><button type="button" class="button secondary" data-step="summary">' + C.awaab.markSummary + "</button></p>";
    if (open.start) controls += '<p><button type="button" class="button secondary" data-step="start">' + C.awaab.markStarted + "</button></p>";
    if (open.finish) controls += '<p><button type="button" class="button secondary" data-step="finish">' + C.awaab.markFinished + "</button></p>";

    const openSteps = steps.filter((s) => s.open);
    const delayForm = !openSteps.length ? "" :
      '<details class="delay"><summary>' + C.awaab.delayHeading + "</summary>" +
        '<p class="note">' + C.awaab.delayIntro + "</p>" +
        '<form id="delay-form" novalidate>' +
          '<div class="field"><label for="delay-step">' + C.awaab.delayStepLabel + "</label>" +
            '<select id="delay-step">' + openSteps.map((s) => (
              '<option value="' + s.key + '">' + C.awaab.steps[s.key].label + " (" + C.awaab.dueBy(formatDate(s.due)).toLowerCase() + ")</option>"
            )).join("") + "</select></div>" +
          '<div class="field"><label for="delay-reason">' + C.awaab.delayReasonLabel + "</label>" +
            '<select id="delay-reason">' + C.awaab.delayReasons.map((r) => "<option>" + r + "</option>").join("") + "</select></div>" +
          '<div class="field"><label for="delay-date">' + C.awaab.delayDateLabel + "</label>" +
            '<input type="date" id="delay-date"></div>' +
          "<fieldset><legend>" + C.awaab.delayInterimLegend + "</legend>" +
            C.awaab.delayInterim.map((step) => (
              '<label class="check"><input type="checkbox" name="interim" value="' + step + '"><span>' + step + "</span></label>"
            )).join("") + "</fieldset>" +
          '<label class="check"><input type="checkbox" id="delay-told"><span>' + C.awaab.delayToldCheck + "</span></label>" +
          '<p class="error" id="delay-error" hidden></p>' +
          '<button type="submit" class="button secondary">' + C.awaab.delayButton + "</button>" +
        "</form>" +
      "</details>";

    return '<div class="clock" id="awaab-clock">' +
      "<h3>" + C.awaab.heading + "</h3>" +
      '<p class="note">' + C.awaab.intro + " " + C.awaab.aware(formatDate(fromISO(c.aware))) + "</p>" +
      '<ol class="clock-steps">' + items + "</ol>" +
      (anyLate ? '<p class="warning">' + C.awaab.lateNote + "</p>" : "") +
      (controls ? '<div id="awaab-controls">' + controls + "</div>" : '<p class="clock-done">' + C.awaab.closed + "</p>") +
      delayForm +
      "</div>";
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
        if (search && !(a.home.address + " " + a.home.id).toLowerCase().includes(search)) return false;
        if (level === "awaab") return !!awaabStatus(a.home.id);
        if (level === "dismissed") return dismissed;
        if (level !== "all" && (dismissed || a.level !== level)) return false;
        return true;
      })
      .sort((a, b) => {
        // In the Awaab's Law view, the nearest deadline comes first.
        if (level === "awaab") return awaabStatus(a.home.id).next.daysLeft - awaabStatus(b.home.id).next.daysLeft;
        const da = homeState(a.home.id).dismissed ? 1 : 0;
        const db = homeState(b.home.id).dismissed ? 1 : 0;
        return da - db || levelOrder[a.level] - levelOrder[b.level] || b.score - a.score;
      });

    const counts = { high: 0, medium: 0, low: 0 };
    let running = 0;
    let late = 0;
    assessed.forEach((a) => {
      if (!homeState(a.home.id).dismissed && counts[a.level] !== undefined) counts[a.level]++;
      const status = awaabStatus(a.home.id);
      if (status) { running++; if (status.late) late++; }
    });
    summaryEl.textContent = visible.length + " of " + assessed.length + " homes shown. " +
      counts.high + " high, " + counts.medium + " medium, " + counts.low + " low. " +
      C.awaab.summaryCount(running, late);

    if (!visible.length) {
      listEl.innerHTML = '<li class="note">' + C.noResults + "</li>";
      return;
    }

    listEl.innerHTML = visible.map((a) => {
      const s = homeState(a.home.id);
      const status = s.dismissed
        ? '<span class="badge status">' + C.dismissedLabel + "</span>"
        : s.history.length ? '<span class="badge status">' + C.actionTakenLabel + "</span>" : "";
      const clock = awaabStatus(a.home.id);
      const shortReasons = a.reasons.slice(0, 2).join("; ") + (a.reasons.length > 2 ? "; and more" : "");
      return '<li><button type="button" class="home-card level-' + a.level + (s.dismissed ? " is-dismissed" : "") +
        '" data-id="' + a.home.id + '"' + (a.home.id === selectedId ? ' aria-current="true"' : "") + ">" +
        '<span class="card-top"><span class="card-address">' + a.home.address + "</span>" +
        '<span class="card-ref">' + a.home.id + ", " + a.home.area + "</span></span>" +
        "<span>" + badge(a.level) + status + "</span>" +
        (clock ? '<span class="card-clock">' + awaabBadge(clock) + "</span>" : "") +
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
          "<li><strong>" + escapeHtml(item.label) + "</strong>" +
          (item.team ? " (" + escapeHtml(item.team) + ", " + escapeHtml(item.urgency.toLowerCase()) + ")" : "") +
          ", " + escapeHtml(item.date) +
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
      (s.awaab ? renderAwaab(s.awaab) : "") +

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
      // A damp check means the landlord is aware, so the Awaab's Law clock starts,
      // unless one is already running for this home.
      if (chosen.value === "damp") {
        if (awaabStatus(home.id)) {
          entry.awaab = C.awaabAlreadyRunning;
        } else {
          s.awaab = newCase();
          entry.awaab = C.awaabStarted(formatDate(addWorkingDays(startOfToday(), 10)));
        }
      }

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

    // Ticking off Awaab's Law steps.
    const controls = document.getElementById("awaab-controls");
    if (controls) {
      controls.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-step]");
        if (!button) return;
        const step = button.dataset.step;
        const todayISO = toISO(startOfToday());
        if (step === "investigate") {
          const found = controls.querySelector('input[name="substantial"]:checked');
          if (!found) return showError(document.getElementById("awaab-error"), C.awaab.substantialNeeded);
          s.awaab.investigated = todayISO;
          s.awaab.substantial = found.value === "yes";
        }
        if (step === "summary") s.awaab.summarySent = todayISO;
        if (step === "start") s.awaab.repairsStarted = todayISO;
        if (step === "finish") s.awaab.repairsFinished = todayISO;
        s.history.push({ label: C.awaab.steps[step].label + ": done", date: formatDate(startOfToday()) });
        saveState();
        renderList();
        renderDetail(false);
        const clock = document.getElementById("awaab-clock");
        clock.setAttribute("tabindex", "-1");
        clock.focus();
      });
    }

    // Recording a delay: which deadline, why, a new date, interim steps, and that the tenant was told.
    const delayForm = document.getElementById("delay-form");
    if (delayForm) {
      delayForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const error = document.getElementById("delay-error");
        const key = document.getElementById("delay-step").value;
        const step = awaabSteps(s.awaab).find((x) => x.key === key);
        const newDate = document.getElementById("delay-date").value;
        const interim = [...delayForm.querySelectorAll('input[name="interim"]:checked')].map((i) => i.value);
        if (!newDate || fromISO(newDate) <= step.due || fromISO(newDate) < startOfToday()) {
          return showError(error, C.awaab.delayDateNeeded);
        }
        if (!interim.length) return showError(error, C.awaab.delayInterimNeeded);
        if (!document.getElementById("delay-told").checked) return showError(error, C.awaab.delayToldNeeded);

        const reason = document.getElementById("delay-reason").value;
        s.awaab.delays = s.awaab.delays || {};
        s.awaab.delays[key] = { reason, newDate, interim, recorded: toISO(startOfToday()) };
        s.history.push({
          label: C.awaab.delayRecorded(C.awaab.steps[key].label),
          date: formatDate(startOfToday()),
          awaab: C.awaab.delayed(formatDate(fromISO(newDate)), reason)
        });
        saveState();
        renderList();
        renderDetail(false);
        const clock = document.getElementById("awaab-clock");
        clock.setAttribute("tabindex", "-1");
        clock.focus();
      });
    }

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

  // Load the made-up cases already under way, unless an officer has changed them.
  const seeds = window.DATA.awaabCases || {};
  Object.keys(seeds).forEach((id) => {
    const s = homeState(id);
    if (s.awaab !== undefined) return;
    const seed = seeds[id];
    const daysAgo = (n) => (n == null ? null : toISO(addWorkingDays(startOfToday(), -n)));
    s.awaab = {
      aware: daysAgo(seed.aware), investigated: daysAgo(seed.investigated), substantial: seed.substantial,
      summarySent: daysAgo(seed.summarySent), repairsStarted: daysAgo(seed.repairsStarted),
      repairsFinished: daysAgo(seed.repairsFinished)
    };
  });

  document.getElementById("service-name").textContent = C.serviceName;
  document.getElementById("banner").textContent = C.banner;
  document.getElementById("list-heading").textContent = C.listHeading;
  document.getElementById("list-intro").textContent = C.listIntro;
  document.getElementById("filter-level-label").textContent = C.filterLevel;
  document.getElementById("filter-search-label").textContent = C.filterSearch;

  renderList();
  renderDetail(false);
})();
