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

    // Questionnaire replies count only once an officer has checked them.
    const replies = (state[home.id] && state[home.id].replies) || [];
    const ticked = new Set();
    replies.filter((r) => r.checked).forEach((r) => r.items.forEach((i) => ticked.add(i)));
    ticked.forEach((i) => add(C.letterPoints[i], C.reasons.reply(C.letterItems[i])));
    // Who's at risk at home, from a tenant's report. Only ever saved with their consent.
    const atRisk = new Set();
    replies.filter((r) => r.checked).forEach((r) => (r.atRisk || []).forEach((who) => atRisk.add(who)));
    atRisk.forEach((who) => add(2, C.reasons.atRisk(who)));

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

  // Worked out again when a checked reply changes a home's risk.
  let assessed = [];
  function reassess() {
    assessed = homes.map((home) => ({ home, ...assess(home) }));
  }
  reassess();
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

  function formatDate(date) {
    return date.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  }

  // ---------- The Awaab's Law clock ----------
  // The deadline maths lives in clock.js, so it can be tested on its own (open tests.html).
  const { addWorkingDays, startOfToday, toISO, fromISO, newCase, awaabSteps } = window.Clock;

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

  function awaabText(status) {
    return C.awaab.cardLabel + ": " + C.awaab.steps[status.next.key].label + ", " + daysText(status.next.daysLeft) +
      (status.next.delay ? " (" + C.awaab.delayedTag + ")" : "");
  }

  function awaabBadge(status) {
    return '<span class="badge awaab' + (status.late ? " is-late" : "") + '">' +
      (status.late ? '<span aria-hidden="true">! </span>' : "") + awaabText(status) + "</span>";
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

    // If a dismissed home gets an Awaab's Law clock (say, from a tenant's report), it goes back on the list.
    assessed.forEach((a) => {
      const s = homeState(a.home.id);
      if (s.dismissed && awaabStatus(a.home.id)) {
        s.dismissed = null;
        s.history.push({ label: C.dismissUndoneByClock, date: formatDate(startOfToday()) });
        saveState();
      }
    });

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
        // New reports and replies waiting for a check come first, so they're seen straight away.
        const ra = (homeState(a.home.id).replies || []).some((r) => !r.checked) ? 0 : 1;
        const rb = (homeState(b.home.id).replies || []).some((r) => !r.checked) ? 0 : 1;
        return da - db || ra - rb || levelOrder[a.level] - levelOrder[b.level] || b.score - a.score;
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
        : s.history.some((item) => item.type) ? '<span class="badge status">' + C.actionTakenLabel + "</span>" : "";
      const unchecked = (s.replies || []).filter((r) => !r.checked);
      const replyBadge = !unchecked.length ? "" : '<span class="badge reply">' +
        (unchecked.some((r) => r.source === "tenant") ? C.tenantReportToCheck : C.replyToCheck) + "</span>";
      const clock = awaabStatus(a.home.id);
      const shortReasons = a.reasons.slice(0, 2).join("; ") + (a.reasons.length > 2 ? "; and more" : "");
      // Screen readers and voice control get a short name: the address first (as seen on the card),
      // then the risk, any deadline and status. The reasons are read in the home's details instead.
      const spoken = [
        a.home.address,
        C.levels[a.level].label + ": " + C.levels[a.level].hint,
        clock ? awaabText(clock) : "",
        s.dismissed ? C.dismissedLabel : s.history.some((item) => item.type) ? C.actionTakenLabel : "",
        unchecked.length ? (unchecked.some((r) => r.source === "tenant") ? C.tenantReportToCheck : C.replyToCheck) : ""
      ].filter(Boolean).join(". ");
      return '<li><button type="button" class="home-card level-' + a.level + (s.dismissed ? " is-dismissed" : "") +
        '" data-id="' + a.home.id + '" aria-label="' + escapeHtml(spoken) + '"' +
        (a.home.id === selectedId ? ' aria-current="true"' : "") + ">" +
        '<span class="card-top"><span class="card-address">' + a.home.address + "</span>" +
        '<span class="card-ref">' + a.home.id + ", " + a.home.area + "</span></span>" +
        "<span>" + badge(a.level) + status + replyBadge + "</span>" +
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

    // A tenant who asked for help with energy bills has energy advice ticked ready.
    const wantsEnergy = (s.replies || []).some((r) => !r.checked && r.energyHelp);
    const actionOptions = Object.keys(C.actions).map((key) => (
      '<label class="radio"><input type="checkbox" name="action" value="' + key + '"' +
      (key === "energy" && wantsEnergy ? " checked" : "") + "><span>" +
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

    // The reply section shows once a questionnaire has been sent.
    const replies = s.replies || [];
    const sentLetter = s.history.some((item) => item.type === "letter");
    const replyBlock = !sentLetter && !replies.length ? "" :
      '<hr class="divider">' +
      "<h3>" + C.replyHeading + "</h3>" +
      replies.map((r, index) => (
        '<div class="letter reply-received"><p><strong>' +
          (r.source === "tenant" ? C.tenantReportReceived : C.replyReceived)(formatDate(fromISO(r.date))) + "</strong></p>" +
          (r.items.length ? "<ul>" + r.items.map((i) => "<li>" + C.letterItems[i] + "</li>").join("") + "</ul>" : "") +
          (r.reporter ? '<p class="tenant-note">' + escapeHtml(C.reportOther(r.reporter.relation, r.reporter.knows)) + "</p>" : "") +
          (r.atRisk && r.atRisk.length ? '<p class="tenant-note">' + C.reportAtRisk + escapeHtml(r.atRisk.join("; ")) + "</p>" : "") +
          (r.energyHelp ? '<p class="tenant-note">' + C.reportEnergy + "</p>" : "") +
          (r.note ?'<p class="tenant-note">' + C.tenantNoteLabel + "“" + escapeHtml(r.note) + "”</p>" : "") +
          (r.contact ? '<p class="tenant-note">' + C.tenantContactLabel + escapeHtml(r.contact.toLowerCase()) + "</p>" : "") +
          (r.checked
            ? '<p class="success">' + C.replyChecked + "</p>"
            : '<p><button type="button" class="button secondary" data-reply="' + index + '">' + C.replyCheckButton + "</button></p>") +
        "</div>"
      )).join("") +
      '<form id="reply-form" novalidate>' +
        '<p class="note">' + C.replyIntro + "</p>" +
        "<fieldset><legend>" + C.replyLegend + "</legend>" +
          C.letterItems.map((item, i) => (
            '<label class="check"><input type="checkbox" name="reply" value="' + i + '"><span>' + item + "</span></label>"
          )).join("") + "</fieldset>" +
        '<p class="error" id="reply-error" hidden></p>' +
        '<button type="submit" class="button secondary">' + C.replyButton + "</button>" +
      "</form>";

    // A home with an Awaab's Law clock running can't be dismissed: the legal deadlines still apply.
    const dismissBlock = s.dismissed
      ? '<p class="success">' + escapeHtml(C.dismissed(s.dismissed)) + "</p>" +
        '<button type="button" class="button secondary" id="undo-dismiss">' + C.undoDismiss + "</button>"
      : awaabStatus(h.id)
      ? '<p class="note">' + C.dismissBlocked + "</p>"
      : '<form id="dismiss-form" novalidate>' +
          '<div class="field"><label for="dismiss-reason">' + C.dismissLabel + "</label>" +
          '<p class="note" id="dismiss-hint">' + C.dismissHint + "</p>" +
          '<p class="error" id="dismiss-error" hidden></p>' +
          '<textarea id="dismiss-reason" rows="2" aria-describedby="dismiss-hint dismiss-error"></textarea></div>' +
          '<p><button type="submit" class="button secondary">' + C.dismissButton + "</button></p>" +
        "</form>";

    detailEl.innerHTML =
      '<h2 id="detail-heading" tabindex="-1">' + h.address + "</h2>" +
      '<p><a href="#home-list" class="back-link" id="back-to-list">' + C.backToList + "</a></p>" +
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
      replyBlock +

      '<hr class="divider">' +
      "<h3>" + C.dismissHeading + "</h3>" + dismissBlock;

    wireDetail(h);

    if (moveFocus) {
      const heading = document.getElementById("detail-heading");
      heading.focus();
      if (window.matchMedia("(max-width: 899px)").matches) {
        // No smooth scrolling for people who've asked their device to reduce motion.
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        heading.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
      }
    }
  }

  // Errors are alerts, so screen readers read them out as soon as they appear.
  // Clearing first means the same error is read out again if it happens twice in a row.
  function showError(el, message) {
    el.setAttribute("role", "alert");
    el.textContent = "";
    el.hidden = !message;
    if (message) setTimeout(() => { el.textContent = message; }, 50);
  }

  function wireDetail(home) {
    const s = homeState(home.id);

    // Back to the list: focus returns to this home's card, so the next one is a Tab away.
    document.getElementById("back-to-list").addEventListener("click", (event) => {
      event.preventDefault();
      const card = listEl.querySelector('.home-card[data-id="' + home.id + '"]');
      if (card) {
        card.focus();
        card.scrollIntoView({ block: "center" });
      } else {
        listEl.focus();
      }
    });

    const actionForm = document.getElementById("action-form");
    actionForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const error = document.getElementById("action-error");
      const chosen = [...actionForm.querySelectorAll('input[name="action"]:checked')].map((i) => i.value);
      if (!chosen.length) return showError(error, C.chooseAction);
      if (!document.getElementById("confirm-check").checked) return showError(error, C.confirmNeeded);
      showError(error, "");

      const today = new Date();
      const urgency = document.getElementById("urgency").value;
      const entries = chosen.map((type) => {
        const action = C.actions[type];
        const entry = { type, label: action.label, team: action.team, urgency, date: formatDate(today) };
        // A damp check means the landlord is aware, so the Awaab's Law clock starts,
        // unless one is already running for this home.
        if (type === "damp") {
          if (awaabStatus(home.id)) {
            entry.awaab = C.awaabAlreadyRunning;
          } else {
            s.awaab = newCase();
            entry.awaab = C.awaabStarted(formatDate(addWorkingDays(startOfToday(), 10)));
          }
        }
        return entry;
      });

      s.history.push(...entries);
      saveState();
      renderList();
      renderDetail(false);
      const result = document.getElementById("action-result");
      result.innerHTML = '<p class="success" tabindex="-1" id="action-success">' + entries.map((entry) => (
        escapeHtml(entry.label) + ": done." + (entry.awaab ? " " + escapeHtml(entry.awaab) : "")
      )).join("<br>") + "</p>";
      document.getElementById("action-success").focus();
    });

    // Open the questionnaire preview when that action is chosen.
    actionForm.addEventListener("change", (event) => {
      if (event.target.name === "action" && event.target.value === "letter") {
        document.getElementById("letter-preview").open = event.target.checked;
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

    // Recording a questionnaire reply. Damp or mould means the landlord is now aware,
    // so the Awaab's Law clock starts today, before an officer checks the reply.
    const replyForm = document.getElementById("reply-form");
    if (replyForm) {
      replyForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const items = [...replyForm.querySelectorAll('input[name="reply"]:checked')].map((i) => Number(i.value));
        if (!items.length) return showError(document.getElementById("reply-error"), C.replyNeeded);

        s.replies = s.replies || [];
        s.replies.push({ date: toISO(startOfToday()), items, checked: false });
        const entry = { label: C.replyHistory, date: formatDate(startOfToday()) };
        if (items.includes(0)) {
          if (awaabStatus(home.id)) {
            entry.awaab = C.awaabAlreadyRunning;
          } else {
            s.awaab = newCase();
            entry.awaab = C.replyDampStarted(formatDate(addWorkingDays(startOfToday(), 10)));
          }
        }
        s.history.push(entry);
        saveState();
        renderList();
        renderDetail(false);
        if (entry.awaab) {
          const clock = document.getElementById("awaab-clock");
          clock.setAttribute("tabindex", "-1");
          clock.focus();
        }
      });
    }

    // An officer checks a reply before it changes the home's risk.
    detailEl.querySelectorAll("button[data-reply]").forEach((button) => {
      button.addEventListener("click", () => {
        s.replies[Number(button.dataset.reply)].checked = true;
        s.history.push({ label: C.replyCheckedHistory, date: formatDate(startOfToday()) });
        saveState();
        reassess();
        renderList();
        renderDetail(true);
      });
    });

    const dismissForm = document.getElementById("dismiss-form");
    if (dismissForm) {
      dismissForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const reason = document.getElementById("dismiss-reason").value.trim();
        if (!reason) return showError(document.getElementById("dismiss-error"), C.dismissNeeded);
        if (awaabStatus(home.id)) return showError(document.getElementById("dismiss-error"), C.dismissBlocked);
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
  document.getElementById("tenant-link").textContent = C.tenantPageLink;
  document.getElementById("list-heading").textContent = C.listHeading;
  document.getElementById("list-intro").textContent = C.listIntro;
  document.getElementById("filter-level-label").textContent = C.filterLevel;
  document.getElementById("filter-search-label").textContent = C.filterSearch;

  renderList();
  renderDetail(false);

  // A tenant's report from tenant.html, open in another tab, shows up here straight away.
  window.addEventListener("storage", (event) => {
    if (event.key !== STORAGE_KEY) return;
    state = loadState();
    reassess();
    renderList();
    renderDetail(false);
  });
})();
