// The risk rules, on their own so the board and the manager summary use exactly the same ones.
// The rules are simple on purpose, so anyone can read why a home was flagged.
(function () {
  // `homeState` is what officers have done for this home (checked replies count), or undefined.
  function assess(home, homeState) {
    const C = window.CONTENT;
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
    const replies = (homeState && homeState.replies) || [];
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

  window.Risk = { assess };
})();
