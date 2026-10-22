// A made-up 7-day forecast for the area. Not real weather.
// `day` is days from today (0 is today), so the demo always shows a cold snap coming.
// Temperatures are degrees Celsius: the lowest overnight and the highest in the day.
window.DATA = window.DATA || {};
window.DATA.weather = {
  place: "Inverclyde (made-up forecast)",
  days: [
    { day: 0, low: 6, high: 10 },
    { day: 1, low: 3, high: 7 },
    { day: 2, low: -2, high: 3 },
    { day: 3, low: -4, high: 1 },
    { day: 4, low: -3, high: 2 },
    { day: 5, low: 1, high: 5 },
    { day: 6, low: 4, high: 8 }
  ]
};
