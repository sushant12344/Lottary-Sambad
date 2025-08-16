// Shared Utility Functions
// Common functions used across both main site and admin panel

const LotteryUtils = {
  // Date formatting utilities
  dateTime: {
    // Convert DD-MM-YYYY or DD/MM/YYYY to YYYY-MM-DD
    convertDateFormat: function(dateString) {
      const parts = dateString.replace(/[\/\-]/g, '-').split('-');
      if (parts.length === 3) {
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = parts[2];
        
        if (year.length === 4) {
          return `${year}-${month}-${day}`;
        }
      }
      return null;
    },

    // Convert 24-hour time to 12-hour format
    convertTo12Hour: function(time24) {
      const [hours, minutes] = time24.split(':');
      const hour12 = hours % 12 || 12;
      const ampm = hours >= 12 ? 'PM' : 'AM';
      return `${hour12}:${minutes} ${ampm}`;
    },

    // Convert 12-hour time to 24-hour format
    convertTo24Hour: function(time12h) {
      const [time, period] = time12h.split(' ');
      let [hours, minutes] = time.split(':');
      
      if (period && period.toLowerCase() === 'pm' && hours !== '12') {
        hours = parseInt(hours, 10) + 12;
      } else if (period && period.toLowerCase() === 'am' && hours === '12') {
        hours = '00';
      }
      
      return `${hours.toString().padStart(2, '0')}:${minutes}`;
    },

    // Format date for display (Today, Yesterday, or DD/MM/YYYY)
    formatDateForDisplay: function(dateString) {
      const date = new Date(dateString + 'T00:00:00');
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const isToday = date.toDateString() === today.toDateString();
      const isYesterday = date.toDateString() === yesterday.toDateString();
      
      if (isToday) return 'Today';
      if (isYesterday) return 'Yesterday';
      
      return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
    },

    // Format time for display (map 24h to readable format)
    formatTimeForDisplay: function(timeString) {
      const timeMap = {
        '13:00': '1:00 PM',
        '18:00': '6:00 PM', 
        '20:00': '8:00 PM'
      };
      return timeMap[timeString] || timeString;
    },

    // Format time for filename (13:00 -> 1pm)
    formatTimeForFilename: function(time24) {
      const [hours, minutes] = time24.split(':');
      const hour12 = hours % 12 || 12;
      const ampm = hours >= 12 ? 'pm' : 'am';
      return `${hour12}${ampm}`;
    }
  },

  // Common validation utilities
  validation: {
    // Validate first prize format (2 digits + 1 letter + 5 digits)
    isValidFirstPrize: function(value) {
      return /^[0-9]{2}[A-Z][0-9]{5}$/.test(value);
    },

    // Validate if string is numeric with specific length
    isNumericWithLength: function(value, length) {
      return new RegExp(`^[0-9]{${length}}$`).test(value);
    },

    // Check if date is valid
    isValidDate: function(dateString) {
      const date = new Date(dateString);
      return date instanceof Date && !isNaN(date);
    }
  },

  // Number processing utilities
  numbers: {
    // Extract numbers from text with expected length
    extractNumbers: function(text, expectedLength) {
      // Split by any non-digit character and filter
      let numbers = text.split(/[^0-9]+/)
        .map(num => num.trim())
        .filter(num => num.length > 0)
        .map(num => {
          // Pad with leading zeros if shorter than expected
          return num.padStart(expectedLength, '0');
        })
        .filter(num => num.length === expectedLength);
      
      return numbers;
    },

    // Sort numbers based on prize type
    sortNumbers: function(numbers, prizeType) {
      if (prizeType === 'second') {
        // For second prize, sort by the last 4 digits
        return numbers.sort((a, b) => {
          const lastFourA = a.slice(-4);
          const lastFourB = b.slice(-4);
          return parseInt(lastFourA) - parseInt(lastFourB);
        });
      } else {
        // For all other prizes, sort normally from small to big
        return numbers.sort((a, b) => parseInt(a) - parseInt(b));
      }
    },

    // Generate consolation number from first prize
    getConsolationNumber: function(firstPrize) {
      if (firstPrize.length >= 5) {
        return firstPrize.slice(-5);
      }
      return '';
    }
  },

  // File utilities
  file: {
    // Generate filename with date and time
    generateLotteryFilename: function(drawDate, drawTime, extension = 'json') {
      // Convert YYYY-MM-DD to DD-MM-YYYY
      const dateParts = drawDate.split('-');
      const dateStr = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
      
      // Convert 24-hour time to readable format (e.g., "13:00" to "1pm")
      const timeStr = LotteryUtils.dateTime.formatTimeForFilename(drawTime);
      
      return `${dateStr}_${timeStr}_lottery.${extension}`;
    }
  },

  // Common DOM utilities
  dom: {
    // Show notification (can be customized per page)
    showNotification: function(message, type = 'info', duration = 3000) {
      // This is a basic implementation - each page can override this
      console.log(`${type.toUpperCase()}: ${message}`);
    },

    // Toggle active class on buttons
    toggleActiveButton: function(clickedButton, buttonGroup) {
      buttonGroup.forEach(btn => btn.classList.remove('active'));
      clickedButton.classList.add('active');
    }
  }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LotteryUtils;
}
