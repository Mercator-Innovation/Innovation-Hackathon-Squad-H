// Made-up Awaab's Law cases already under way, so the clock has something to show.
// Dates are working days before today, so the demo looks the same whatever day it runs.
// null means that step hasn't happened yet.
window.DATA = window.DATA || {};
window.DATA.awaabCases = {
  // Aware 8 working days ago, not investigated yet: 2 days left.
  "H-124": { aware: 8, investigated: null, substantial: null, summarySent: null, repairsStarted: null, repairsFinished: null },
  // Investigated 4 days ago, damp found, summary not sent: 1 day late.
  "H-117": { aware: 12, investigated: 4, substantial: true, summarySent: null, repairsStarted: null, repairsFinished: null },
  // Repairs started 12 days ago: 8 days left to finish.
  "H-121": { aware: 25, investigated: 15, substantial: true, summarySent: 14, repairsStarted: 12, repairsFinished: null },
  // Aware 13 working days ago and never investigated: 3 days late.
  "H-101": { aware: 13, investigated: null, substantial: null, summarySent: null, repairsStarted: null, repairsFinished: null }
};
