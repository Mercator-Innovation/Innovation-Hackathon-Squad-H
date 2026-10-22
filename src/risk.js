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

    // Sensor pilot: damp air or a cold home on most of the last 7 days.
    const sensor = sensorSummary(home.id);
    if (sensor && sensor.dampDays >= 3) add(2, C.reasons.sensorDamp(sensor.dampDays));
    if (sensor && sensor.coldDays >= 3) add(2, C.reasons.sensorCold(sensor.coldDays, sensor.coldest));

    // A cold snap coming raises homes that are hard to heat AND have someone more vulnerable to cold.
    const snap = coldSnap();
    const older = home.oldestAge >= 75;
    if (snap) {
      const vulnerable = older || atRisk.size > 0 || /baby|under 5/i.test(home.household) ||
        (home.consent && home.supportNotes.some((n) => /breath|copd|asthma|health|hospital|dementia|wheelchair|illness|early/i.test(n)));
      const hardToHeat = ["E", "F", "G"].includes(home.epc) || home.fuelVouchers > 0 || (sensor && sensor.coldDays >= 3);
      if (vulnerable && hardToHeat) add(2, C.reasons.coldSnap(snap.lowest));
    }

    // Age raises priority only alongside other signs; on its own it means a regular check-in.
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

  // Damp air means humidity of 70% or more; a cold home means below 16°C. Both are our assumptions
  // for the prototype: the thresholds would need checking with Cloch and the sensor supplier.
  function sensorSummary(id) {
    const s = window.DATA && window.DATA.sensors && window.DATA.sensors[id];
    if (!s) return null;
    return {
      humidity: s.humidity, temp: s.temp,
      dampDays: s.humidity.filter((h) => h >= 70).length,
      coldDays: s.temp.filter((t) => t < 16).length,
      coldest: Math.min(...s.temp),
      dampest: Math.max(...s.humidity)
    };
  }

  // A cold snap: a night at or below 0°C in the next 5 days of the forecast.
  function coldSnap() {
    const w = window.DATA && window.DATA.weather;
    if (!w) return null;
    const cold = w.days.filter((d) => d.day <= 5 && d.low <= 0);
    if (!cold.length) return null;
    return { from: cold[0].day, to: cold[cold.length - 1].day, lowest: Math.min(...cold.map((d) => d.low)) };
  }

  window.Risk = { assess, sensorSummary, coldSnap };
})();
