// Bank holidays in Scotland, from https://www.gov.uk/bank-holidays.json (fetched 22 October 2026).
// The Awaab's Law guidance doesn't define "working day": skipping these is our assumption.
// Local holidays (such as Inverclyde's) aren't included.
window.DATA = window.DATA || {};
window.DATA.bankHolidays = [
  "2026-01-01", "2026-01-02", "2026-04-03", "2026-05-04", "2026-05-25", "2026-06-15",
  "2026-08-03", "2026-11-30", "2026-12-25", "2026-12-28",
  "2027-01-01", "2027-01-04", "2027-03-26", "2027-05-03", "2027-05-31", "2027-08-02",
  "2027-11-30", "2027-12-27", "2027-12-28"
];
