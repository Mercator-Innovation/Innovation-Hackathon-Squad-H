// Tenants who've gone quiet, and the contact ladder officers work through to reach them.
// Gone quiet: no contact for 6 months or more, no access at the last gas safety check,
// or no reply to 2 or more monthly reminders. Hearing from them (a reply, a report, or an
// officer speaking to them) in the last 6 months takes them off the list.
// The ladder: a letter or text, then a phone call, then a door knock from the community
// support team. Functions take `today`, so tests can fix the date (open tests.html).
(function () {
  const { addWorkingDays, fromISO, workingDaysFromToday } = window.Clock;

  const QUIET_MONTHS = 6;
  const LADDER = ["letter", "call", "visit"];
  // Working days to wait for an answer before the next step is due.
  const WAIT = { letter: 10, call: 5, visit: 10 };

  function monthsAgo(today, months) {
    const d = new Date(today);
    d.setMonth(d.getMonth() - months);
    return d;
  }

  // Monthly reminder rounds sent since the tenant last replied (none if they've opted out).
  function unansweredReminders(home, s, reminders, prefs) {
    if ((prefs || {})[home.id] === "none" || !reminders || !reminders.rounds) return 0;
    const replies = (s.replies || []).map((r) => r.date).sort();
    const lastReply = replies.length ? replies[replies.length - 1] : "";
    return reminders.rounds.filter((round) => round.date > lastReply).length;
  }

  // Null if the tenant isn't quiet; otherwise why, what's been tried, and the next step.
  function check(home, s, reminders, prefs, today) {
    s = s || {};
    const since = monthsAgo(today, QUIET_MONTHS);
    const contacts = s.contacts || [];
    const heardFrom = (s.replies || []).some((r) => fromISO(r.date) >= since) ||
      contacts.some((c) => c.result === "spoke" && fromISO(c.date) >= since);
    if (heardFrom || s.dismissed) return null;

    const reasons = [];
    if (home.monthsSinceContact >= QUIET_MONTHS) reasons.push({ key: "months", n: home.monthsSinceContact });
    if (home.gasNoAccess) reasons.push({ key: "gas" });
    const unanswered = unansweredReminders(home, s, reminders, prefs);
    if (unanswered >= 2) reasons.push({ key: "reminders", n: unanswered });
    if (!reasons.length) return null;

    const tries = contacts.filter((c) => c.result !== "spoke");
    const last = tries[tries.length - 1];
    const method = LADDER[Math.min(tries.length, LADDER.length - 1)];
    const due = last ? addWorkingDays(fromISO(last.date), WAIT[last.method]) : new Date(today);
    return {
      reasons, tries, method, due,
      daysLeft: workingDaysFromToday(due, today),
      escalate: tries.length >= LADDER.length
    };
  }

  window.Quiet = { check, unansweredReminders, LADDER, WAIT, QUIET_MONTHS };
})();
