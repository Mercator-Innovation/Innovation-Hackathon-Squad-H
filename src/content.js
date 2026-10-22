// The words people see. Change them here without touching app.js.
window.CONTENT = {
  serviceName: "Healthier homes board",
  banner: "Prototype with made-up homes. Not a real service and no real tenants.",
  listHeading: "Homes to help first",
  listIntro: "Homes with the most signs of risk come first. Each one says why. You make the final call.",
  filterLevel: "Show",
  filterSearch: "Search by address or reference",
  levels: {
    high: { label: "High", hint: "act this week", icon: "▲" },
    medium: { label: "Medium", hint: "act this month", icon: "●" },
    low: { label: "Low", hint: "keep an eye on", icon: "▽" },
    none: { label: "No signs", hint: "nothing to do now", icon: "–" }
  },
  dismissedLabel: "Dismissed",
  actionTakenLabel: "Action booked",
  emptyDetail: "Choose a home from the list to see why it was flagged and what you can do.",
  noResults: "No homes match. Try a different search or filter.",

  reasonsHeading: "Why this home was flagged",
  noReasons: "No signs of risk right now.",
  aboutHeading: "About this home",
  consentYes: "The tenant agreed that support notes can be used.",
  consentNo: "The tenant hasn't agreed, so support notes aren't used.",
  notesNotUsed: (n) => n + (n === 1 ? " support note isn't" : " support notes aren't") + " used, because the tenant hasn't agreed.",

  actionHeading: "Choose what to do",
  actionLegend: "Action",
  urgencyLabel: "How urgent",
  urgencies: ["Today", "This week", "This month"],
  confirmCheck: "I've checked the reasons and I'm making this decision.",
  confirmButton: "Book this action",
  confirmNeeded: "Tick the box to say you've checked the reasons.",
  chooseAction: "Choose an action first.",

  actions: {
    energy: { label: "Book an energy advice visit", team: "Energy advice service" },
    damp: { label: "Book a damp and mould check", team: "Repairs team" },
    wellbeing: { label: "Arrange a wellbeing call", team: "Community support team" },
    letter: { label: "Send the tick-box questionnaire", team: "Housing officer" }
  },
  awaabStarted: (date) => "Awaab's Law clock started. Investigate by " + date + " (10 working days).",

  letterPreviewSummary: "See the questionnaire the tenant gets",
  letterTitle: "How is your home?",
  letterIntro: "We want to make sure your home is warm, dry and healthy. Tick anything that's true for you and send it back. There's no wrong answer, and you won't be blamed.",
  letterItems: [
    "There's damp or mould somewhere in my home",
    "My home is hard to keep warm",
    "I can't always afford to heat my home",
    "Windows run with water in the morning",
    "Something needs fixing",
    "I'd like someone to call me"
  ],
  letterEnd: "Send it back in the free envelope, or tell us by phone or text.",

  dismissHeading: "Not needed?",
  dismissLabel: "Why you're dismissing this flag",
  dismissHint: "For example: already in touch, or the tenant has moved.",
  dismissButton: "Dismiss flag",
  dismissNeeded: "Say why you're dismissing it.",
  dismissed: (reason) => "Flag dismissed: " + reason,
  undoDismiss: "Undo dismiss",

  historyHeading: "What's been done",
  noHistory: "Nothing yet.",

  reasons: {
    epcPoor: (b) => "Energy rating " + b + ": hard and costly to heat",
    epcFair: (b) => "Energy rating " + b,
    oldHome: (y) => "Built in " + y,
    condensation: (n) => n + " condensation or mould " + (n === 1 ? "job" : "jobs") + " in the last year",
    leak: (n) => n + " leak " + (n === 1 ? "job" : "jobs") + " in the last year",
    arrears: (w) => "Rent arrears of " + w + " weeks",
    fuel: (n) => "Asked for fuel vouchers " + n + (n === 1 ? " time" : " times"),
    gasNoAccess: "No access at the last gas safety check",
    quiet: (m) => "No contact for " + m + " months",
    supportNote: (note) => "Support note (shared with consent): " + note,
    olderPlus: "Tenant aged 75 or over, as well as other signs",
    olderCheckIn: "Tenant aged 75 or over: regular check-in due"
  }
};
