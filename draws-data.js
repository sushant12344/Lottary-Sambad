// All draws data for the lottery website
// This file contains historical lottery draw results organized by date and time

let allDrawsData = {
  // Example format: "YYYY-MM-DD_HH:MM"
  // Add lottery draw data here when available from admin panel
  
  // When you create new lottery files using the admin panel,
  // the data will automatically be added here or loaded from individual JSON files
  
  // Example structure:
  // "2025-08-13_13:00": {
  //   "drawDate": "13/08/2025",
  //   "drawTime": "1:00 PM",
  //   "firstPrize": "65L29688",
  //   "consolation": "29688",
  //   "secondPrize": [...],
  //   "thirdPrize": [...],
  //   "fourthPrize": [...],
  //   "fifthPrize": [...]
  // }
};

// Export for use by other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = allDrawsData;
}
