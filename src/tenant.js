// The tenant's page: report damp or mould, or check on a report.
// It saves the report where the officer's board reads it (this browser's storage),
// so the board shows a flag. Open both pages side by side to see it arrive.
(function () {
  const C = window.CONTENT;
  const T = C.tenant;
  const homes = window.DATA.homes;
  const STORAGE_KEY = "healthier-homes-state";
  const { addWorkingDays, startOfToday, toISO, fromISO, newCase, awaabSteps } = window.Clock;

  // The questionnaire's answers, without "call me": that's covered by how to get in touch.
  const items = C.letterItems.slice(0, 5);
  const main = document.getElementById("main");

  function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, (ch) => (
      { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]
    ));
  }

  function formatDate(date) {
    return date.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  }

  function loadState() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (e) {
      return {};
    }
  }

  function saveState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      // Fine for a prototype: the report just won't reach the board.
    }
  }

  // A reference like H-101, or a full address. Someone reporting for a neighbour may only know the address.
  function findHome(text, allowAddress) {
    const ref = text.trim().toUpperCase();
    const byRef = homes.find((h) => h.id === ref);
    if (byRef || !allowAddress) return byRef;
    const plain = (s) => s.toLowerCase().replace(/[^a-z0-9/]/g, "");
    const wanted = plain(text);
    if (!wanted) return null;
    const exact = homes.find((h) => plain(h.address) === wanted);
    if (exact) return exact;
    // Without the flat number (like "2/1,"), only if that matches one home.
    const matches = homes.filter((h) => plain(h.address.replace(/^\d+\/\d+,\s*/, "")) === wanted);
    return matches.length === 1 ? matches[0] : null;
  }

  function showError(id, message) {
    const el = document.getElementById(id + "-error");
    el.textContent = message;
    el.hidden = !message;
  }

  function showSummary(errors) {
    const summary = document.getElementById("error-summary");
    summary.innerHTML = "<h2>" + T.errorSummary + "</h2><ul>" + errors.map((e) => (
      '<li><a href="#' + e.id + '">' + e.message + "</a></li>"
    )).join("") + "</ul>";
    summary.hidden = false;
    summary.focus();
  }

  function nav(current) {
    const link = (hash, label) => '<a href="' + hash + '"' + (current === hash ? ' aria-current="page"' : "") + ">" + label + "</a>";
    return '<nav class="tenant-nav" aria-label="Pages">' + link("#report", T.navReport) + link("#check", T.navCheck) + "</nav>";
  }

  const radios = (name, options) => options.map((option) => (
    '<label class="radio"><input type="radio" name="' + name + '" value="' + option + '"><span>' + option + "</span></label>"
  )).join("");

  const checks = (name, options) => options.map((option, i) => (
    '<label class="check"><input type="checkbox" name="' + name + '" value="' + i + '"><span>' + option + "</span></label>"
  )).join("");

  // ---------- Report a problem ----------

  function renderForm() {
    main.innerHTML = nav("#report") +
      '<h1 id="page-heading" tabindex="-1">' + T.title + "</h1>" +
      '<p class="intro">' + T.intro + "</p>" +
      '<div class="error-summary" id="error-summary" role="alert" tabindex="-1" hidden></div>' +
      '<form id="report-form" novalidate>' +
        '<fieldset id="who" aria-describedby="who-error"><legend>' + T.whoLegend + "</legend>" +
          '<p class="error" id="who-error" hidden></p>' +
          '<label class="radio"><input type="radio" name="who" value="tenant"><span>' + T.whoOptions.tenant + "</span></label>" +
          '<label class="radio"><input type="radio" name="who" value="other"><span>' + T.whoOptions.other + "</span></label>" +
        "</fieldset>" +
        '<div id="other-details" class="conditional" hidden>' +
          '<p class="error" id="other-error" hidden></p>' +
          '<div class="field"><label for="relation">' + T.relationLabel + "</label>" +
            '<select id="relation"><option value=""></option>' +
              T.relationOptions.map((r) => "<option>" + r + "</option>").join("") + "</select></div>" +
          '<fieldset id="knows" aria-describedby="knows-hint"><legend>' + T.knowsLegend + "</legend>" +
            '<p class="note" id="knows-hint">' + T.knowsHint + "</p>" + radios("knows", T.knowsOptions) +
          "</fieldset>" +
        "</div>" +
        '<div class="field">' +
          '<label for="ref" id="ref-label">' + T.refLabel + "</label>" +
          '<p class="note" id="ref-hint">' + T.refHint + "</p>" +
          '<p class="error" id="ref-error" hidden></p>' +
          '<input type="text" id="ref" class="short" autocomplete="off" spellcheck="false" aria-describedby="ref-hint ref-error">' +
        "</div>" +
        '<fieldset id="items" aria-describedby="items-hint items-error"><legend>' + T.itemsLegend + "</legend>" +
          '<p class="note" id="items-hint">' + T.itemsHint + "</p>" +
          '<p class="error" id="items-error" hidden></p>' + checks("item", items) +
        "</fieldset>" +
        '<div class="field">' +
          '<label for="note">' + T.noteLabel + "</label>" +
          '<p class="note" id="note-hint">' + T.noteHint + "</p>" +
          '<textarea id="note" rows="3" aria-describedby="note-hint"></textarea>' +
        "</div>" +
        '<fieldset id="risk" aria-describedby="risk-hint risk-error"><legend>' + T.riskLegend + "</legend>" +
          '<p class="note" id="risk-hint">' + T.riskHint + "</p>" +
          '<p class="error" id="risk-error" hidden></p>' + checks("risk", T.riskOptions) +
          '<label class="check consent"><input type="checkbox" id="risk-consent"><span>' + T.riskConsent + "</span></label>" +
        "</fieldset>" +
        '<fieldset aria-describedby="energy-hint"><legend>' + T.energyLegend + "</legend>" +
          '<p class="note" id="energy-hint">' + T.energyHint + "</p>" +
          '<label class="check"><input type="checkbox" id="energy"><span>' + T.energyCheck + "</span></label>" +
        "</fieldset>" +
        '<fieldset id="contact" aria-describedby="contact-error"><legend>' + T.contactLegend + "</legend>" +
          '<p class="error" id="contact-error" hidden></p>' + radios("contact", T.contactOptions) +
        "</fieldset>" +
        '<p class="note">' + T.emergency + "</p>" +
        '<button type="submit" class="button">' + T.sendButton + "</button>" +
      "</form>";

    const form = document.getElementById("report-form");
    // Reporting for someone else asks two more questions, and accepts their address.
    form.addEventListener("change", (event) => {
      if (event.target.name !== "who") return;
      const other = event.target.value === "other";
      document.getElementById("other-details").hidden = !other;
      // Only the tenant can agree to share who's at risk at home, so we don't ask anyone else.
      document.getElementById("risk").hidden = other;
      document.getElementById("ref-label").textContent = other ? T.refLabelOther : T.refLabel;
      document.getElementById("ref-hint").textContent = other ? T.refHintOther : T.refHint;
    });
    form.addEventListener("submit", submit);
  }

  function submit(event) {
    event.preventDefault();
    const form = event.target;
    const value = (selector) => { const el = form.querySelector(selector); return el ? el.value : ""; };
    const ticked = (name) => [...form.querySelectorAll('input[name="' + name + '"]:checked')].map((i) => Number(i.value));

    const who = value('input[name="who"]:checked');
    const other = who === "other";
    const relation = value("#relation");
    const knows = value('input[name="knows"]:checked');
    const refText = document.getElementById("ref").value;
    const home = findHome(refText, other);
    const problems = ticked("item");
    const risks = other ? [] : ticked("risk");
    const consent = !other && document.getElementById("risk-consent").checked;
    const energy = document.getElementById("energy").checked;
    const contact = value('input[name="contact"]:checked');

    const errors = [];
    // `target` is where the error summary's link jumps to, when it isn't the field with that id.
    const check = (id, message, target) => { showError(id, message); if (message) errors.push({ id: target || id, message }); };
    check("who", who ? "" : T.whoNeeded);
    check("other", other && (!relation || !knows) ? T.otherNeeded : "", "relation");
    check("ref", !refText.trim() ? T.refNeeded : !home ? (other ? T.refNotFoundOther : T.refNotFound) : "");
    check("items", problems.length || energy ? "" : T.itemsNeeded);
    check("risk", risks.length && !consent ? T.riskConsentNeeded : "");
    check("contact", contact ? "" : T.contactNeeded);
    if (errors.length) return showSummary(errors);

    // Save it as a reply the officer checks, like a questionnaire reply.
    // Who's at risk is only kept when the tenant has agreed.
    const state = loadState();
    const s = state[home.id] || (state[home.id] = { history: [], dismissed: null });
    const today = startOfToday();
    s.replies = s.replies || [];
    s.replies.push({
      date: toISO(today), items: problems, checked: false, source: "tenant",
      note: document.getElementById("note").value.trim(), contact,
      reporter: other ? { relation, knows } : null,
      atRisk: consent ? risks.map((i) => T.riskOptions[i]) : [],
      energyHelp: energy
    });
    // A report means the landlord is aware, so damp or mould starts the Awaab's Law clock today.
    const damp = problems.includes(0);
    const running = s.awaab && awaabSteps(s.awaab).some((step) => step.open);
    const entry = { label: other ? C.tenantHistoryOther : C.tenantHistory, date: formatDate(today) };
    if (damp && !running) {
      s.awaab = newCase();
      entry.awaab = C.replyDampStarted(formatDate(addWorkingDays(today, 10)));
    }
    s.history.push(entry);
    saveState(state);

    renderDone({ damp, energy, other, ref: home.id });
  }

  function renderDone({ damp, energy, other, ref }) {
    const lookBy = formatDate(addWorkingDays(startOfToday(), 10));
    const next = [];
    if (other) {
      next.push(T.nextOther);
      if (damp) next.push(T.nextLookOther(lookBy));
      if (energy) next.push(T.nextEnergyOther);
    } else {
      if (damp) next.push(T.nextLook(lookBy), T.nextWrite, T.nextRepair);
      if (energy) next.push(T.nextEnergy);
    }
    if (!next.length) next.push(T.nextNoDamp);
    main.innerHTML = nav("#report") +
      '<div class="success"><h1 id="page-heading" tabindex="-1">' + T.doneTitle + "</h1>" +
        "<p>" + T.doneIntro + "</p></div>" +
      "<h2>" + T.nextHeading + "</h2>" +
      "<ol>" + next.map((n) => "<li>" + n + "</li>").join("") + "</ol>" +
      (other ? "" : '<p><a href="#check">' + T.nextCheck(ref) + "</a></p>") +
      '<p class="note">' + T.emergency + "</p>" +
      '<p><a href="#report" id="again">' + T.again + "</a></p>";
    document.getElementById("page-heading").focus();
  }

  // ---------- Check on my report ----------

  function renderCheck() {
    main.innerHTML = nav("#check") +
      '<h1 id="page-heading" tabindex="-1">' + T.checkTitle + "</h1>" +
      '<p class="intro">' + T.checkIntro + "</p>" +
      '<form id="check-form" novalidate>' +
        '<div class="field">' +
          '<label for="check-ref">' + T.refLabel + "</label>" +
          '<p class="note" id="check-hint">' + T.refHint + "</p>" +
          '<p class="error" id="check-ref-error" role="alert" hidden></p>' +
          '<input type="text" id="check-ref" class="short" autocomplete="off" spellcheck="false" aria-describedby="check-hint check-ref-error">' +
        "</div>" +
        '<button type="submit" class="button">' + T.checkButton + "</button>" +
      "</form>" +
      '<div id="check-result" tabindex="-1"></div>' +
      '<p class="note">' + T.checkPrivacy + "</p>";

    document.getElementById("check-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const refText = document.getElementById("check-ref").value;
      const home = findHome(refText, false);
      showError("check-ref", !refText.trim() ? T.refNeeded : !home ? T.refNotFound : "");
      const result = document.getElementById("check-result");
      result.innerHTML = home ? progress(home.id) : "";
      if (home) result.focus();
    });
  }

  function progress(id) {
    const s = loadState()[id];
    const c = s && s.awaab;
    if (!c) return "<p>" + T.checkNothing + "</p>";
    const steps = awaabSteps(c);
    const late = steps.some((step) => step.open && step.daysLeft < 0);
    return "<h2>" + T.checkHeading(formatDate(fromISO(c.aware))) + "</h2>" +
      '<ol class="clock-steps">' + steps.map((step) => {
        let status;
        if (step.done) status = '<span class="clock-done">' + T.checkDone(formatDate(fromISO(step.done))) + "</span>";
        else if (step.notNeeded) status = T.checkNotNeeded;
        else if (step.open && step.delay) status = T.checkDelayed(formatDate(step.due));
        else if (step.open) status = '<span class="clock-due">' + T.checkDue(formatDate(step.due)) + "</span>";
        else status = '<span class="note">' + T.checkWaiting + "</span>";
        return "<li><strong>" + T.checkSteps[step.key] + "</strong><br>" + status + "</li>";
      }).join("") + "</ol>" +
      (late ? '<p class="warning">' + escapeHtml(T.checkLate) + "</p>" : "");
  }

  // ---------- Start ----------

  function route() {
    if (location.hash === "#check") renderCheck();
    else renderForm();
    document.getElementById("page-heading").focus();
  }

  document.getElementById("service-name").textContent = T.serviceName;
  document.getElementById("banner").textContent = C.banner;
  window.addEventListener("hashchange", route);
  // A link to the page you're already on (like "Report something else") starts it afresh.
  main.addEventListener("click", (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (link && link.getAttribute("href") === (location.hash || "#report")) {
      event.preventDefault();
      route();
    }
  });
  route();
})();
