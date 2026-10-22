// The words on the monthly reminders page, and in the email and letter tenants get.
window.REMINDERS_CONTENT = {
  heading: "Monthly check-in reminders",
  intro: "Every month or two, we remind tenants to tell us about damp, mould, cold or repairs. The tenants who never get in touch are the ones we most need to hear from.",
  prototypeNote: "This is a prototype: nothing is really sent.",

  settingsHeading: "How often",
  frequencyLabel: "Send a reminder",
  frequencies: { 1: "Every month", 2: "Every 2 months", 3: "Every 3 months" },
  sendDayNote: "Reminders go out on the first working day of the month.",
  nextSend: (date) => "Next reminders go out on " + date + ".",

  whoHeading: "Who gets one",
  countEmail: (n) => n + (n === 1 ? " tenant gets" : " tenants get") + " an email with a link to tell us how their home is",
  countLetter: (n) => n + (n === 1 ? " tenant gets" : " tenants get") + " a letter with boxes to tick and send back",
  countNone: (n) => n + (n === 1 ? " tenant has" : " tenants have") + " asked not to get reminders",
  channelLabel: { email: "Email", letter: "Letter", none: "Opted out" },
  tableCaption: "Homes and how they get their reminder",
  colHome: "Home",
  colHow: "How",
  colLast: "Last reminder",
  never: "Not yet",

  previewHeading: "What tenants get",
  emailTab: "The email",
  letterTab: "The letter",
  emailSubject: "How is your home this month?",
  emailBody: [
    "Hello,",
    "Every month we check your home is warm, dry and healthy.",
    "Have you seen damp, mould or cold? Does anything need fixing? Please tell us. It takes a minute. You won't be blamed.",
    "You can also phone us or reply to this email."
  ],
  emailLink: "Tell us how your home is",
  emailStop: "Don't want these emails? Reply STOP.",
  letterTitle: "How is your home this month?",
  letterIntro: "Every month we check your home is warm, dry and healthy. Tick anything that's true and post this back. There are no wrong answers. You won't be blamed.",
  // The tick boxes come from content.js (letterItems), so they match the reply form on the board.
  letterEnd: "Post it back in the free envelope. You don't need a stamp. Or tell us online or by phone.",
  letterStop: "Don't want these letters? Write STOP on this page and post it back.",

  sendHeading: "Send this round",
  sendButton: "Send this month's reminders (prototype)",
  sentResult: (emails, letters, next) => "Sent " + emails + " emails and " + letters + " letters. Next round: " + next + ".",
  historyHeading: "Rounds sent",
  noHistory: "No reminders sent yet.",
  historyItem: (date, emails, letters) => date + ": " + emails + " emails, " + letters + " letters",
  repliesNote: "When a letter comes back, record the ticked boxes on the board: open the home and add the questionnaire reply. If it mentions damp or mould, the Awaab's Law clock starts.",

  backToBoard: "Back to the board"
};
