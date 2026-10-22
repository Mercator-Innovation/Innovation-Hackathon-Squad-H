// The words people see. Change them here without touching app.js.
window.CONTENT = {
  serviceName: "Healthier homes board",
  banner: "Prototype with made-up homes. Not a real service and no real tenants.",
  listHeading: "Homes to help first",
  listIntro: "Homes most at risk come first. Each one says why. You decide what happens.",
  filterLevel: "Show",
  filterSearch: "Search by address or reference",
  levels: {
    high: { label: "High", hint: "act this week", icon: "▲" },
    medium: { label: "Medium", hint: "act this month", icon: "●" },
    low: { label: "Low", hint: "keep an eye on", icon: "▽" },
    none: { label: "No signs", hint: "nothing to do now", icon: "–" },
    check: { label: "New report", hint: "check today", icon: "◆" }
  },
  checkLevelNote: "Check the report below. Once you have, the board works out this home's risk again.",
  dismissedLabel: "Dismissed",
  actionTakenLabel: "Action booked",
  emptyDetail: "Pick a home to see why it's on the list and what you can do.",
  noResults: "No homes match. Try a different search or filter.",

  reasonsHeading: "Why this home is on the list",
  noReasons: "No signs of risk right now.",
  aboutHeading: "About this home",
  consentYes: "The tenant said we can use their support notes.",
  consentNo: "The tenant hasn't said yes, so we don't use their support notes.",
  notesNotUsed: (n) => n + (n === 1 ? " support note" : " support notes") + " not used. The tenant hasn't said yes.",

  actionHeading: "What to do",
  actionLegend: "What will you do? Choose one or more.",
  urgencyLabel: "How urgent",
  urgencies: ["Today", "This week", "This month"],
  confirmCheck: "I've read the reasons. This is my decision.",
  confirmButton: "Book these actions",
  backToList: "Back to the list of homes",
  confirmNeeded: "Tick the box to say you've read the reasons.",
  chooseAction: "Choose at least one thing to do.",

  actions: {
    energy: { label: "Book a visit from energy advice", team: "Energy advice service" },
    damp: { label: "Book a damp and mould check", team: "Repairs team" },
    wellbeing: { label: "Ask community support to call", team: "Community support team" },
    letter: { label: "Send the 'How is your home?' letter", team: "Housing officer" }
  },
  awaabStarted: (date) => "Awaab's Law clock started. Someone must look at the home by " + date + " (10 working days).",
  awaabAlreadyRunning: "This home already has an Awaab's Law clock running.",

  // The Awaab's Law clock. Timescales from our research note (sketches/research-awaabs-law-and-cloch.md).
  awaab: {
    heading: "Awaab's Law clock",
    intro: "The clock started when we first heard about possible damp or mould. These are the legal deadlines. They count working days only.",
    cardLabel: "Awaab's Law",
    steps: {
      investigate: { label: "Investigate", rule: "within 10 working days of hearing about it" },
      summary: { label: "Tell the tenant what we found, in writing", rule: "within 3 working days of investigating" },
      start: { label: "Start repairs", rule: "within 5 working days of investigating, if there's substantial damp or mould" },
      finish: { label: "Finish repairs", rule: "within 20 working days of starting" }
    },
    aware: (date) => "We first heard on " + date + ".",
    done: (date) => "Done " + date,
    notNeeded: "Not needed: no substantial damp or mould found",
    waiting: "Starts after the step before",
    dueBy: (date) => "Due by " + date,
    left: (n) => n === 0 ? "due today" : n + " working " + (n === 1 ? "day" : "days") + " left",
    late: (n) => n + " working " + (n === 1 ? "day" : "days") + " late",
    closed: "All steps done",
    lateNote: "A deadline has passed. Tell the tenant why, and give them a new date. Keep stopping the damp or mould from spreading.",
    markInvestigated: "Mark investigation done",
    substantialLegend: "Did the investigation find substantial damp or mould?",
    substantialYes: "Yes",
    substantialNo: "No",
    substantialNeeded: "Say whether substantial damp or mould was found.",
    markSummary: "Mark summary sent",
    markStarted: "Mark repairs started",
    markFinished: "Mark repairs finished",
    undoStep: (label) => "Undo the last step (" + label.toLowerCase() + ")",
    undone: (label) => label + ": undone, it was marked done by mistake",
    compensation: (amount) => "If it stays late, the tenant may be owed about £" + amount + " so far: £15, then £3 for each extra working day, up to £100 a repair. This is our estimate, not legal advice.",

    // Recording a delay. Reasons and interim steps are the examples in the Scottish Government guidance.
    delayHeading: "Can't meet a deadline?",
    delayIntro: "If something you can't control holds you up, tell the tenant: which deadline, why, and the new date. Keep stopping the damp or mould from spreading.",
    delayStepLabel: "Which deadline",
    delayReasonLabel: "Why",
    delayReasons: [
      "Severe weather or travel problems",
      "Illness or bereavement",
      "Contractor or supply problems",
      "No access to the home, despite reasonable attempts",
      "Waiting for another organisation to say yes"
    ],
    delayDateLabel: "New date",
    delayInterimLegend: "Steps you're taking in the meantime",
    delayInterim: [
      "Temporary mould removal",
      "Temporary extractor fan",
      "Temporary sealant on a leak",
      "Monitoring while we find out more"
    ],
    delayToldCheck: "I've told the tenant which deadline we'll miss, why, and the new date, in a way that works for them.",
    delayButton: "Record the delay",
    delayDateNeeded: "Choose a new date after the current deadline.",
    delayInterimNeeded: "Choose at least one step you're taking in the meantime.",
    delayToldNeeded: "Tick the box to say you've told the tenant.",
    delayed: (date, reason) => "Delayed to " + date + ": " + reason,
    delayInterimShown: (steps) => "In the meantime: " + steps.join(", ").toLowerCase(),
    delayRecorded: (step) => step + ": delay recorded",
    delayedTag: "new date",
    summaryCount: (running, late) => running + " Awaab's Law " + (running === 1 ? "clock" : "clocks") + " running, " + late + " late."
  },

  letterPreviewSummary: "See the questionnaire the tenant gets",
  letterTitle: "How is your home?",
  letterIntro: "We want your home to be warm, dry and healthy. Tick anything that's true and send this back. There are no wrong answers. You won't be blamed.",
  letterItems: [
    "There's damp or mould in my home",
    "My home is hard to keep warm",
    "I can't always afford to heat my home",
    "My windows are wet in the morning",
    "Something needs fixing",
    "I'd like someone to call me"
  ],
  letterEnd: "Post it back in the free envelope. Or tell us by phone or text.",
  // How much each ticked answer adds to the home's risk, in the same order as letterItems.
  letterPoints: [2, 2, 2, 1, 1, 1],

  replyHeading: "The tenant's reply",
  replyIntro: "Record what the tenant ticked. It might come by post, phone or text.",
  replyLegend: "What the tenant ticked",
  replyButton: "Record reply",
  replyNeeded: "Tick at least one answer.",
  replyReceived: (date) => "Reply received " + date,
  replyToCheck: "Reply to check",
  replyCheckButton: "I've checked this reply",
  replyChecked: "Checked. It now counts towards this home's risk.",
  tenantReportReceived: (date) => "Reported online, " + date,
  tenantHistoryOther: "Someone else reported this online",
  tenantReportToCheck: "New report from tenant",
  otherReportToCheck: "New report from someone else",
  tenantHistory: "The tenant reported this online",
  tenantNoteLabel: "In their words: ",
  tenantContactLabel: "Get in touch by: ",
  tenantPageLink: "Tenant's view (opens in a new tab)",
  replyHistory: "Reply received",
  replyCheckedHistory: "Reply checked",
  replyDampStarted: (date) => "The tenant mentioned damp or mould, so the Awaab's Law clock started today. Investigate by " + date + " (10 working days).",

  // The tenant's page (tenant.html). Short, kind and no blame.
  tenant: {
    serviceName: "Report damp or mould",
    title: "Tell us about damp or mould in your home",
    intro: "Damp and mould are not your fault. Tell us and we'll come and look. It takes about 2 minutes.",
    navReport: "Report a problem",
    navCheck: "Check on my report",
    navHelp: "Help and your rights",

    whoLegend: "Who's telling us?",
    whoOptions: { tenant: "I live there (I'm the tenant)", other: "I'm telling you about someone else's home" },
    whoNeeded: "Choose who's telling us.",
    relationLabel: "How do you know them?",
    relationOptions: ["Family or friend", "Support worker", "Neighbour", "Someone else"],
    knowsLegend: "Do they know you're telling us?",
    knowsOptions: ["Yes", "No", "Not sure"],
    knowsHint: "We'll talk to them gently first. We won't say who told us unless you're happy for us to.",
    otherNeeded: "Say how you know them and whether they know you're telling us.",

    refLabel: "Your tenancy reference",
    refLabelOther: "Their tenancy reference or address",
    refHint: "It's on your rent letter. For example, H-101.",
    refHintOther: "Their reference, like H-101, or their full address, like 14 Thistle Walk.",
    refNeeded: "Enter your tenancy reference, like H-101.",
    refNeededOther: "Enter their tenancy reference or address, like H-101 or 14 Thistle Walk.",
    refNotFound: "We can't find that. Check the reference on the rent letter. It looks like H-101.",
    refNotFoundOther: "We can't find that. Try their reference, like H-101, or their full address, like 2/1, 14 Thistle Walk.",

    riskLegend: "Is anyone at home more at risk from damp or cold? (optional)",
    riskHint: "This helps us come sooner. You don't have to tell us.",
    riskOptions: ["A baby or child under 5", "Someone aged 75 or over", "Someone with a breathing condition, like asthma", "Someone who is pregnant", "Someone with a long-term illness or disability"],
    riskConsent: "I'm happy for the housing team to use this to help sooner. It's kept private and only used for repairs and support.",
    riskConsentNeeded: "Tick the box to say we can use this, or untick the answers about who's at risk.",

    photoLabel: "Add a photo (optional)",
    photoHint: "A photo of the damp or mould helps us see how bad it is. Only the housing team sees it. Try not to include people.",
    photoRemove: "Remove photo",
    photoAlt: "Your photo of the damp or mould",
    photoProblem: "That photo didn't work. Try a different one, or send the report without it.",

    visitLegend: "When's best for us to visit? (optional)",
    visitHint: "Tick all that suit you.",
    visitTimes: ["Weekday mornings", "Weekday afternoons", "Early evenings", "Any time"],
    needsLegend: "Anything we should know before we visit? (optional)",
    needsOptions: ["There's a dog or other pet", "I need an interpreter", "I need time to get to the door", "I'd like someone with me, like family or a support worker"],
    needsNoteLabel: "Anything else about the visit (optional)",
    needsNoteHint: "For example: which language, or the best door to use.",

    moreSummary: "Tell us more (optional): who's at risk, a photo, when to visit",
    moreHint: "This helps us come sooner, and be ready when we visit. You can skip it.",
    energyLegend: "Help with heating costs",
    energyCheck: "I'd like free help with my energy bills",
    energyHint: "Our energy advice team can visit to help with bills, tariffs and keeping warm for less.",
    itemsLegend: "What's happening in your home?",
    itemsHint: "Tick all that apply.",
    itemsNeeded: "Tick at least one thing that's happening.",
    noteLabel: "Where is it, and how long has it been there? (optional)",
    noteHint: "For example: black mould on the bedroom ceiling, for about a month.",
    contactLegend: "How should we get in touch?",
    contactOptions: ["Phone call", "Text message", "Letter"],
    contactNeeded: "Choose how we should get in touch.",
    errorSummary: "There's a problem",
    sendButton: "Send",
    doneTitle: "Thanks, we've got it",
    doneIntro: "Your housing officer can see your report now.",
    nextHeading: "What happens next",
    nextLook: (date) => "Someone will come and look at your home by " + date + ".",
    nextWrite: "Within 3 working days after that, we'll tell you what we found.",
    nextRepair: "If repairs are needed, they'll start within 5 working days.",
    nextNoDamp: "Your housing officer will be in touch about what you've told us.",
    nextEnergy: "Our energy advice team will be in touch about help with your bills.",
    nextOther: "We'll get in touch with the tenant. Thank you for looking out for them.",
    nextLookOther: (date) => "Someone will come and look at their home by " + date + ", and keep the tenant updated.",
    nextEnergyOther: "Our energy advice team will offer the tenant help with their bills.",
    nextCheck: (ref) => "You can check how it's going any time. Use the reference " + ref + ".",
    emergency: "If water is coming through a ceiling or there's a leak, phone the emergency repairs line now.",
    again: "Report something else",

    checkTitle: "Check on my report",
    checkIntro: "Enter your tenancy reference to see where things are up to.",
    checkButton: "Check",
    checkNothing: "We haven't got a damp or mould report for this home yet. If you've just sent one, wait a minute and try again.",
    checkHeading: (date) => "You told us on " + date,
    checkSteps: {
      investigate: "We come and look at your home",
      summary: "We tell you what we found",
      start: "Repairs start",
      finish: "Repairs are finished"
    },
    checkDone: (date) => "Done, " + date,
    checkDue: (date) => "By " + date,
    checkWaiting: "After the step before",
    checkNotNeeded: "Not needed: we didn't find damp or mould that needs repairs",
    checkDelayed: (date) => "Delayed. New date: " + date + ". We'll have told you why.",
    checkLate: "This is late. We're sorry. Your housing officer will be in touch.",
    checkPrivacy: "In a real service, you'd sign in first so only you can see this.",
    helpLink: "Help while you wait, and your rights",

    // Help and your rights. From Shelter Scotland's advice on damp and mould in social housing,
    // and our research note. General help, not medical or legal advice.
    helpTitle: "Help and your rights",
    waitHeading: "While you wait",
    waitIntro: "Damp and mould are not your fault. These small things can help a bit until we come.",
    waitTips: [
      "Open a window a little, or use the fan, when you cook, shower or dry clothes.",
      "Keep a small gap between big furniture and outside walls.",
      "Don't paint over mould. Leave it for us to look at.",
      "If heating costs worry you, ask us for free help with your energy bills."
    ],
    healthHeading: "If it's affecting your health",
    healthTips: [
      "If you or someone at home feels unwell, call NHS 24 on 111, or speak to your GP.",
      "In an emergency, call 999.",
      "Your GP can write a letter about how damp or mould affects your health. Keep it: it helps if you need to complain."
    ],
    rightsHeading: "Your rights",
    rightsIntro: "The law (Awaab's Law) sets deadlines for us once you tell us about damp or mould:",
    rightsSteps: [
      "We look at your home within 10 working days.",
      "We tell you in writing what we found within 3 working days after that.",
      "If repairs are needed, they start within 5 working days.",
      "Repairs are finished within 20 working days of starting."
    ],
    rightsLate: "If we can't meet a deadline, we must tell you why in writing and give you a new date. We should also help in the meantime, for example with a dehumidifier.",
    complainHeading: "If you're not happy",
    complainSteps: [
      "Tell us. We'll try to sort it out within 5 working days.",
      "Still not happy? Ask for a senior person to look at it. They'll reply within 20 working days.",
      "Still not happy after that? You can complain to the Scottish Public Services Ombudsman (SPSO). It's free and independent. Do this within a year of first telling us."
    ],
    complainTip: "Keep a note of dates, and take photos. It helps if you need to complain.",
    moreHelp: "Free advice: Shelter Scotland's helpline, or your local Citizens Advice."
  },

  // What we know about your home (tenant page, check view). Friendly words, no judgement.
  knowHeading: "What we use to decide who to help first",
  knowIntro: "We look at a few things together, never just one, to see who might need help with damp or cold before it makes anyone ill. A person always decides.",
  know: {
    epc: (b) => "Your home's energy rating is " + b + " (A is best, G is worst).",
    built: (y) => "Your home was built in " + y + ".",
    jobs: (c, l) => "In the last year: " + c + " condensation or mould " + (c === 1 ? "repair" : "repairs") + " and " + l + " leak " + (l === 1 ? "repair" : "repairs") + ".",
    arrears: "Whether rent is behind. This is only so we can offer help, never to blame anyone.",
    fuel: "Whether you've asked us for fuel vouchers.",
    gas: "Whether we could get in for the last gas safety check.",
    contact: "When we last spoke to you.",
    age: "The age of the oldest person at home.",
    notesYes: "Notes from our support team, because you agreed we can use them.",
    notesNo: "You haven't agreed to us using notes from our support team, so we don't.",
    reports: "What you've told us in reports or questionnaires."
  },
  knowChange: "If something's wrong, or you'd like us to stop using something, tell your housing officer.",

  // The manager summary page (manager.html).
  manager: {
    title: "Manager summary",
    intro: "The whole picture across every home, worked out with the same rules as the board.",
    risk: "Homes by risk",
    levels: { high: "High: act this week", medium: "Medium: act this month", low: "Low: keep an eye on" },
    waiting: "New reports waiting for a check",
    running: "Awaab's Law clocks running",
    late: "Deadlines missed",
    dismissed: "Flags dismissed",
    dueHeading: "Legal deadlines in the next 5 working days, and any missed",
    dueNone: "Nothing due in the next 5 working days.",
    dueCols: ["Home", "Step", "Due", "Days left"],
    areaHeading: "Risk by area",
    areaCols: ["Area", "High", "Medium", "Low", "Clocks running"],
    figuresHeading: "Damp and mould figures (for reporting)",
    figuresNote: "Since April 2025 the Scottish Housing Regulator asks landlords for damp and mould figures. The exact measures would need checking with Cloch: these show the kind of thing the board can count.",
    figures: {
      cases: "Damp and mould cases opened (clock started)",
      investigatedOnTime: "Investigated within 10 working days",
      investigatedLate: "Investigated late",
      repairsFinished: "Repairs finished",
      delays: "Delays recorded, with the tenant told"
    },
    outcomesHeading: "Did it work?",
    outcomesNone: "No outcomes recorded yet. Officers record them on each home.",
    lateWord: (n) => n + (n === 1 ? " day late" : " days late"),
    leftWord: (n) => n === 0 ? "Due today" : n + (n === 1 ? " day" : " days")
  },

  // How tenant reports show on the board.
  reportOther: (relation, knows) => "Reported by someone else (" + relation.toLowerCase() + "). Does the tenant know? " + knows,
  reportAtRisk: "At risk at home (shared with consent): ",
  reportEnergy: "Asked for help with energy bills",
  reportVisitTimes: "Best time to visit: ",
  reportVisitNeeds: "Before visiting: ",
  reportPhotoAlt: "Photo of the damp or mould, sent with the report",

  dismissHeading: "Not needed?",
  dismissLabel: "Why isn't this needed?",
  dismissHint: "For example: we're already in touch, or the tenant has moved.",
  dismissButton: "Dismiss this home",
  dismissNeeded: "Say why it isn't needed.",
  dismissed: (reason) => "Dismissed: " + reason,
  undoDismiss: "Undo dismiss",
  dismissBlocked: "You can't dismiss this home while its Awaab's Law clock is running. The legal deadlines still apply. Finish the steps, or record a delay.",
  dismissUndoneByClock: "Back on the list: an Awaab's Law clock started",

  historyHeading: "What's been done",
  noHistory: "Nothing yet.",

  // The written summary letter (Awaab's Law: within 3 working days of investigating).
  summaryLetter: {
    heading: "Draft the letter to the tenant",
    intro: "Check and change this draft, then send it and mark the summary sent.",
    label: "Letter to the tenant",
    copy: "Copy the letter",
    copied: "Copied. Paste it into your letter or email.",
    text: (o) => [
      "Dear tenant,",
      "",
      "We came to look at damp or mould in your home on " + o.investigated + ". Thank you for letting us in.",
      "",
      "What we found:",
      o.substantial
        ? "There is damp or mould that needs repairs. [Add where, and what's causing it.]"
        : "We didn't find damp or mould that needs repairs. [Add what we saw, and any advice.]",
      "",
      "What happens next:",
      o.substantial
        ? "Repairs will start by " + o.startBy + ". We'll finish them within 20 working days of starting. We'll tell you if anything changes, and why."
        : "If it comes back or gets worse, please tell us straight away.",
      "",
      "If you're not happy with this, tell us and we'll try to sort it out. You can also complain to the Scottish Public Services Ombudsman.",
      "",
      "From your housing officer"
    ].join("\n")
  },

  // Did it work? (recorded by the officer once help has been given)
  outcome: {
    heading: "Did it work?",
    legend: "Since we helped, the risk for this home has",
    options: ["Gone down", "Stayed the same", "Gone up", "Too early to tell"],
    noteLabel: "What changed (optional)",
    noteHint: "For example: new extractor fan fitted, tenant now warmer.",
    button: "Record the outcome",
    needed: "Choose what happened.",
    recorded: (result) => "Outcome: " + result.toLowerCase(),
    latest: (result, date) => "Last outcome: " + result.toLowerCase() + ", " + date
  },
  filterArea: "Area",
  filterBooked: "Booked",

  reasons: {
    epcPoor: (b) => "Energy rating " + b + ": hard and costly to heat",
    epcFair: (b) => "Energy rating " + b,
    oldHome: (y) => "Built in " + y,
    condensation: (n) => n + " condensation or mould " + (n === 1 ? "job" : "jobs") + " in the last year",
    leak: (n) => n + " leak " + (n === 1 ? "job" : "jobs") + " in the last year",
    arrears: (w) => "Rent arrears: " + w + " weeks",
    fuel: (n) => "Asked for fuel vouchers " + n + (n === 1 ? " time" : " times"),
    gasNoAccess: "No access at the last gas safety check",
    quiet: (m) => "No contact for " + m + " months",
    supportNote: (note) => "Support note (tenant said yes): " + note,
    reply: (item) => "Tenant said: " + item,
    atRisk: (who) => "At risk at home (shared with consent): " + who,
    olderPlus: "Tenant is 75 or over, and there are other signs",
    olderCheckIn: "Tenant is 75 or over: time for a regular check-in"
  }
};
