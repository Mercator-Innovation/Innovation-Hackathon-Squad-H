// Made-up readings from a small sensor pilot (6 homes). Not real homes or real readings.
// For each of the last 7 days (oldest first): the highest humidity (%) and the lowest temperature (°C)
// in the main living room.
window.DATA = window.DATA || {};
window.DATA.sensors = {
  "H-101": { humidity: [74, 78, 81, 77, 79, 83, 80], temp: [16, 15, 16, 15, 14, 15, 15] },
  "H-104": { humidity: [52, 55, 50, 54, 57, 53, 55], temp: [20, 19, 20, 21, 20, 19, 20] },
  "H-115": { humidity: [72, 75, 71, 76, 80, 78, 82], temp: [13, 12, 14, 12, 11, 12, 11] },
  "H-120": { humidity: [58, 61, 57, 60, 59, 62, 60], temp: [19, 19, 18, 19, 20, 19, 18] },
  "H-124": { humidity: [68, 72, 74, 71, 69, 75, 77], temp: [17, 17, 16, 17, 16, 17, 16] },
  "H-126": { humidity: [60, 62, 63, 61, 64, 62, 65], temp: [15, 14, 13, 14, 13, 13, 12] }
};
