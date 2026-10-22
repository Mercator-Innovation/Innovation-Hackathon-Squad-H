// The Awaab's Law deadline maths, on its own so it can be tested (open tests.html).
// Timescales from our research note (sketches/research-awaabs-law-and-cloch.md).
// Functions that depend on today take an optional `today`, so tests can fix the date.
(function () {
  // Working days are Monday to Friday, skipping Scottish bank holidays (data/bank-holidays.js).
  const bankHolidays = new Set((window.DATA && window.DATA.bankHolidays) || []);

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
  function workingDaysFromToday(due, today) {
    const day = new Date(today || startOfToday());
    const step = due >= day ? 1 : -1;
    let count = 0;
    while (day.getTime() !== due.getTime()) {
      day.setDate(day.getDate() + step);
      if (isWorkingDay(day)) count += step;
    }
    return count;
  }

  // A case is { aware, investigated, substantial, summarySent, repairsStarted, repairsFinished, delays },
  // with dates as "YYYY-MM-DD" (null until that step happens).
  function newCase(today) {
    return { aware: toISO(today || startOfToday()), investigated: null, substantial: null,
      summarySent: null, repairsStarted: null, repairsFinished: null };
  }

  function awaabSteps(c, today) {
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
      if (s.open) s.daysLeft = workingDaysFromToday(s.due, today);
    });
    return steps;
  }

  window.Clock = {
    isWorkingDay, addWorkingDays, startOfToday, toISO, fromISO,
    workingDaysFromToday, newCase, awaabSteps
  };
})();
