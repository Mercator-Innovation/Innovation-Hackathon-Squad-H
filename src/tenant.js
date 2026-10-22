// The tenant's page: report damp or mould.
// It saves the report where the officer's board reads it (this browser's storage),
// so the board shows a flag. Open both pages side by side to see it arrive.
(function () {
  const C = window.CONTENT;
  const T = C.tenant;
  const homes = window.DATA.homes;
  const STORAGE_KEY = "healthier-homes-state";
  const { addWorkingDays, startOfToday, toISO, newCase, awaabSteps } = window.Clock;

  // The questionnaire's answers, without "call me": that's covered by how to get in touch.
  const items = C.letterItems.slice(0, 5);
  const main = document.getElementById("main");

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

  function renderForm() {
    main.innerHTML =
      '<h1 id="page-heading" tabindex="-1">' + T.title + "</h1>" +
      '<p class="intro">' + T.intro + "</p>" +
      '<div class="error-summary" id="error-summary" role="alert" tabindex="-1" hidden></div>' +
      '<form id="report-form" novalidate>' +
        '<div class="field">' +
          '<label for="ref">' + T.refLabel + "</label>" +
          '<p class="note" id="ref-hint">' + T.refHint + "</p>" +
          '<p class="error" id="ref-error" hidden></p>' +
          '<input type="text" id="ref" class="short" autocomplete="off" spellcheck="false" aria-describedby="ref-hint ref-error">' +
        "</div>" +
        '<fieldset id="items" aria-describedby="items-hint items-error"><legend>' + T.itemsLegend + "</legend>" +
          '<p class="note" id="items-hint">' + T.itemsHint + "</p>" +
          '<p class="error" id="items-error" hidden></p>' +
          items.map((item, i) => (
            '<label class="check"><input type="checkbox" name="item" value="' + i + '"><span>' + item + "</span></label>"
          )).join("") +
        "</fieldset>" +
        '<div class="field">' +
          '<label for="note">' + T.noteLabel + "</label>" +
          '<p class="note" id="note-hint">' + T.noteHint + "</p>" +
          '<textarea id="note" rows="3" aria-describedby="note-hint"></textarea>' +
        "</div>" +
        '<fieldset id="contact" aria-describedby="contact-error"><legend>' + T.contactLegend + "</legend>" +
          '<p class="error" id="contact-error" hidden></p>' +
          T.contactOptions.map((option) => (
            '<label class="radio"><input type="radio" name="contact" value="' + option + '"><span>' + option + "</span></label>"
          )).join("") +
        "</fieldset>" +
        '<p class="note">' + T.emergency + "</p>" +
        '<button type="submit" class="button">' + T.sendButton + "</button>" +
      "</form>";

    document.getElementById("report-form").addEventListener("submit", submit);
  }

  function showError(id, message) {
    const el = document.getElementById(id + "-error");
    el.textContent = message;
    el.hidden = !message;
  }

  function submit(event) {
    event.preventDefault();
    const form = event.target;
    const ref = document.getElementById("ref").value.trim().toUpperCase();
    const home = homes.find((h) => h.id === ref);
    const ticked = [...form.querySelectorAll('input[name="item"]:checked')].map((i) => Number(i.value));
    const contact = form.querySelector('input[name="contact"]:checked');

    const errors = [];
    const refMessage = !ref ? T.refNeeded : !home ? T.refNotFound : "";
    showError("ref", refMessage);
    if (refMessage) errors.push({ id: "ref", message: refMessage });
    showError("items", ticked.length ? "" : T.itemsNeeded);
    if (!ticked.length) errors.push({ id: "items", message: T.itemsNeeded });
    showError("contact", contact ? "" : T.contactNeeded);
    if (!contact) errors.push({ id: "contact", message: T.contactNeeded });

    const summary = document.getElementById("error-summary");
    if (errors.length) {
      summary.innerHTML = "<h2>" + T.errorSummary + "</h2><ul>" + errors.map((e) => (
        '<li><a href="#' + e.id + '">' + e.message + "</a></li>"
      )).join("") + "</ul>";
      summary.hidden = false;
      summary.focus();
      return;
    }

    // Save it as a reply the officer checks, like a questionnaire reply.
    const state = loadState();
    const s = state[home.id] || (state[home.id] = { history: [], dismissed: null });
    const today = startOfToday();
    const note = document.getElementById("note").value.trim();
    s.replies = s.replies || [];
    s.replies.push({ date: toISO(today), items: ticked, checked: false, source: "tenant", note, contact: contact.value });
    // A report means the landlord is aware, so damp or mould starts the Awaab's Law clock today.
    const damp = ticked.includes(0);
    const running = s.awaab && awaabSteps(s.awaab).some((step) => step.open);
    const entry = { label: C.tenantHistory, date: formatDate(today) };
    if (damp && !running) {
      s.awaab = newCase();
      entry.awaab = C.replyDampStarted(formatDate(addWorkingDays(today, 10)));
    }
    s.history.push(entry);
    saveState(state);

    renderDone(damp);
  }

  function renderDone(damp) {
    const lookBy = formatDate(addWorkingDays(startOfToday(), 10));
    main.innerHTML =
      '<div class="success"><h1 id="page-heading" tabindex="-1">' + T.doneTitle + "</h1>" +
        "<p>" + T.doneIntro + "</p></div>" +
      "<h2>" + T.nextHeading + "</h2>" +
      (damp
        ? "<ol><li>" + T.nextLook(lookBy) + "</li><li>" + T.nextWrite + "</li><li>" + T.nextRepair + "</li></ol>"
        : "<p>" + T.nextNoDamp + "</p>") +
      '<p class="note">' + T.emergency + "</p>" +
      '<p><a href="tenant.html">' + T.again + "</a></p>";
    document.getElementById("page-heading").focus();
  }

  document.getElementById("service-name").textContent = T.serviceName;
  document.getElementById("banner").textContent = C.banner;
  renderForm();
})();
