// Behaviour for the monthly reminders page. Nothing is really sent: this is a prototype.
(function () {
  const R = window.REMINDERS_CONTENT;
  const C = window.CONTENT;
  const { isWorkingDay, startOfToday, toISO, fromISO } = window.Clock;
  const homes = window.DATA.homes;
  const prefs = window.DATA.contactPreferences || {};
  const STORAGE_KEY = "healthier-homes-reminders";

  // { frequency: months between rounds, rounds: [{ date, emails, letters }], lastByHome: { id: date } }
  let state = loadState();

  function loadState() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { frequency: 1, rounds: [], lastByHome: {} };
    } catch (e) {
      return { frequency: 1, rounds: [], lastByHome: {} };
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      // Fine: the page still works, it just won't remember after a refresh.
    }
  }

  function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, (ch) => (
      { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]
    ));
  }

  function formatDate(date) {
    return date.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  }

  const channelOf = (home) => prefs[home.id] || "letter";

  // Reminders go out on the first working day of the month (skipping weekends and bank holidays).
  function firstWorkingDay(year, month) {
    const day = new Date(year, month, 1);
    while (!isWorkingDay(day)) day.setDate(day.getDate() + 1);
    return day;
  }

  // The next round: the first working day of the month after the last round (plus the frequency),
  // or of next month if nothing has been sent yet.
  function nextSendDate() {
    const last = state.rounds.length ? fromISO(state.rounds[state.rounds.length - 1].date) : null;
    const base = last || startOfToday();
    const monthsAhead = last ? Number(state.frequency) : 1;
    return firstWorkingDay(base.getFullYear(), base.getMonth() + monthsAhead);
  }

  // ---------- Render ----------

  function renderSchedule() {
    document.getElementById("next-send").textContent = R.nextSend(formatDate(nextSendDate()));
  }

  function renderWho() {
    const counts = { email: 0, letter: 0, none: 0 };
    homes.forEach((h) => counts[channelOf(h)]++);
    document.getElementById("counts").innerHTML =
      "<li>" + R.countEmail(counts.email) + "</li>" +
      "<li>" + R.countLetter(counts.letter) + "</li>" +
      "<li>" + R.countNone(counts.none) + "</li>";
    document.getElementById("table-summary").textContent = R.tableCaption;

    document.getElementById("homes-table").innerHTML = homes.map((h) => {
      const last = state.lastByHome[h.id];
      return "<tr><td>" + h.address + ' <span class="note">(' + h.id + ")</span></td>" +
        '<td><span class="channel channel-' + channelOf(h) + '">' + R.channelLabel[channelOf(h)] + "</span></td>" +
        "<td>" + (last ? formatDate(fromISO(last)) : R.never) + "</td></tr>";
    }).join("");
  }

  function renderPreviews() {
    document.getElementById("email-preview").innerHTML =
      '<p class="email-subject"><strong>Subject:</strong> ' + R.emailSubject + "</p>" +
      R.emailBody.map((p) => "<p>" + p + "</p>").join("") +
      '<p><a class="email-button" href="tenant.html">' + R.emailLink + "</a></p>" +
      '<p class="note">' + R.emailStop + "</p>";

    document.getElementById("letter-preview").innerHTML =
      "<p><strong>" + R.letterTitle + "</strong></p>" +
      "<p>" + R.letterIntro + "</p>" +
      "<ul>" + C.letterItems.map((i) => "<li>" + i + "</li>").join("") + "</ul>" +
      "<p>" + R.letterEnd + "</p>" +
      '<p class="note">' + R.letterStop + "</p>";
  }

  function renderHistory() {
    const list = document.getElementById("history");
    list.innerHTML = state.rounds.length
      ? state.rounds.slice().reverse().map((r) => (
          "<li>" + escapeHtml(R.historyItem(formatDate(fromISO(r.date)), r.emails, r.letters)) + "</li>"
        )).join("")
      : '<li class="note">' + R.noHistory + "</li>";
  }

  // ---------- Sending (pretend) ----------

  document.getElementById("send-button").addEventListener("click", () => {
    const today = toISO(startOfToday());
    let emails = 0;
    let letters = 0;
    homes.forEach((h) => {
      const channel = channelOf(h);
      if (channel === "none") return;
      if (channel === "email") emails++; else letters++;
      state.lastByHome[h.id] = today;
    });
    state.rounds.push({ date: today, emails, letters });
    saveState();
    renderSchedule();
    renderWho();
    renderHistory();
    document.getElementById("send-result").innerHTML =
      '<p class="success">' + escapeHtml(R.sentResult(emails, letters, formatDate(nextSendDate()))) + "</p>";
  });

  const frequency = document.getElementById("frequency");
  frequency.addEventListener("change", () => {
    state.frequency = Number(frequency.value);
    saveState();
    renderSchedule();
  });

  // ---------- Start ----------

  const text = {
    heading: R.heading, intro: R.intro, "prototype-note": R.prototypeNote,
    "settings-heading": R.settingsHeading, "frequency-label": R.frequencyLabel, "send-day": R.sendDayNote,
    "who-heading": R.whoHeading, "table-caption": R.tableCaption,
    "col-home": R.colHome, "col-how": R.colHow, "col-last": R.colLast,
    "preview-heading": R.previewHeading, "email-tab": R.emailTab, "letter-tab": R.letterTab,
    "replies-note": R.repliesNote, "send-heading": R.sendHeading, "send-button": R.sendButton,
    "history-heading": R.historyHeading, "back-link": R.backToBoard
  };
  Object.keys(text).forEach((id) => { document.getElementById(id).textContent = text[id]; });

  frequency.innerHTML = Object.keys(R.frequencies).map((n) => (
    '<option value="' + n + '"' + (Number(n) === Number(state.frequency) ? " selected" : "") + ">" + R.frequencies[n] + "</option>"
  )).join("");

  renderSchedule();
  renderWho();
  renderPreviews();
  renderHistory();
})();
