/* ES5 Compatible Version - IE11 and older browser support */

var selectedSeries = 5;
var prizeNumbers = {};
// allDrawsData is now loaded from draws-data.js
var selectedDate = '';
var selectedTime = '13:00';
var availableDates = [];

document.addEventListener('DOMContentLoaded', function() {
  initializeDatePicker();
  loadDrawsData();
  
  var seriesButtons = document.querySelectorAll('.series-btn');
  Array.prototype.forEach.call(seriesButtons, function(btn) {
    btn.addEventListener('click', function() {
      Array.prototype.forEach.call(seriesButtons, function(b) {
        b.classList.remove('active');
      });
      this.classList.add('active');
      selectedSeries = parseInt(this.dataset.series);
    });
  });
  
  // Time selection buttons
  var timeButtons = document.querySelectorAll('.time-btn');
  Array.prototype.forEach.call(timeButtons, function(btn) {
    btn.addEventListener('click', function() {
      Array.prototype.forEach.call(timeButtons, function(b) {
        b.classList.remove('active');
      });
      this.classList.add('active');
      selectedTime = this.dataset.time;
      loadSelectedDrawData();
    });
  });
  
  // Date picker change event
  var datePicker = document.getElementById('date-picker');
  datePicker.addEventListener('change', function() {
    selectedDate = this.value;
    loadSelectedDrawData();
  });
  
  // Date search functionality
  var dateSearch = document.getElementById('date-search');
  dateSearch.addEventListener('input', function() {
    var searchValue = this.value;
    if (searchValue.length >= 10) { // DD-MM-YYYY format
      var convertedDate = convertDateFormat(searchValue);
      if (convertedDate) {
        datePicker.value = convertedDate;
        selectedDate = convertedDate;
        loadSelectedDrawData();
      }
    }
  });
  
  dateSearch.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      var searchValue = this.value;
      var convertedDate = convertDateFormat(searchValue);
      if (convertedDate) {
        datePicker.value = convertedDate;
        selectedDate = convertedDate;
        loadSelectedDrawData();
      }
    }
  });
  
  // Update input reference
  var ticketInput = document.getElementById('ticket-input');
  if (ticketInput) {
    ticketInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        checkTicket();
      }
    });
  }
});

function loadPrizeNumbers() {
  return new Promise(function(resolve, reject) {
    try {
      // Add timestamp to prevent caching
      var cacheBuster = new Date().getTime();
      console.log('Loading numbers.json with cache buster:', cacheBuster);
      
      fetch('numbers.json?v=' + cacheBuster)
        .then(function(response) {
          console.log('Response status:', response.status);
          return response.json();
        })
        .then(function(data) {
          prizeNumbers = data;
          console.log('Loaded prize numbers:', prizeNumbers);
          updateDisplayNumbers();
          console.log('Display updated successfully');
          resolve(data);
        })
        .catch(function(error) {
          console.error('Error loading numbers:', error);
          // Fallback to hardcoded numbers if JSON fails
          prizeNumbers = {
            firstPrize: '93D75084',
            consolation: '75084',
            secondPrize: ['70441','50516','52139','92835','84124','46182','08729','97818','68371','99958'],
            thirdPrize: ['1930','3022','3357','4831','8258','8279','9207','9221','9409','9870'],
            fourthPrize: ['2122','2395','2440','3633','4744','5259','5349','9027','9420','9834'],
            fifthPrize: ['0160','1137','1674','2890','3546','4851','5676','6477','7210','8287','0331','1193','1860','2953','3625','4915','5713','6578','7227','8407','0532','1236','1994','3028','3663','4938','5772','6597','7247','8444','0626','1316','2042','3033','3696','4982','5779','6647','7253','8497','0635','1353','2053','3038','4271','5237','5789','6737','7255','8543','0668','1369','2086','3051','4308','5338','6051','6745','7313','8647','0679','1475','2143','3159','4332','5483','6110','6844','7602','8672','0812','1493','2507','3205','4446','5577','6181','6882','7816','8953','0950','1588','2733','3373','4481','5673','6223','7085','7986','9266','1083','1642','2840','3390','4729','5674','6331','7165','8054','9862']
          };
          updateDisplayNumbers();
          reject(error);
        });
    } catch (error) {
      console.error('Error in loadPrizeNumbers:', error);
      reject(error);
    }
  });
}

function updateDisplayNumbers() {
  // Update date and time in first prize section
  if (prizeNumbers.drawDate && prizeNumbers.drawTime) {
    var datetimeEl = document.getElementById('draw-datetime');
    if (datetimeEl) datetimeEl.textContent = prizeNumbers.drawDate + ' - ' + prizeNumbers.drawTime;
  }
  
  // Update first prize display
  var firstPrizeEl = document.getElementById('first-prize-number');
  if (firstPrizeEl) firstPrizeEl.textContent = prizeNumbers.firstPrize;
  
  // Update consolation number
  var consolationEl = document.getElementById('consolation-number');
  if (consolationEl) consolationEl.textContent = prizeNumbers.consolation;
  
  // Update second prize numbers
  var secondPrizeContainer = document.getElementById('second-prize-numbers');
  if (secondPrizeContainer) {
    secondPrizeContainer.innerHTML = prizeNumbers.secondPrize.map(function(num) {
      return '<span>' + num + '</span>';
    }).join('');
  }
  
  // Update third prize numbers
  var thirdPrizeContainer = document.getElementById('third-prize-numbers');
  if (thirdPrizeContainer) {
    thirdPrizeContainer.innerHTML = prizeNumbers.thirdPrize.map(function(num) {
      return '<span>' + num + '</span>';
    }).join('');
  }
  
  // Update fourth prize numbers
  var fourthPrizeContainer = document.getElementById('fourth-prize-numbers');
  if (fourthPrizeContainer) {
    fourthPrizeContainer.innerHTML = prizeNumbers.fourthPrize.map(function(num) {
      return '<span>' + num + '</span>';
    }).join('');
  }
  
  // Update fifth prize numbers with grid layout (5 columns x 10 rows)
  var fifthPrizeContainer = document.getElementById('fifth-prize-numbers');
  if (fifthPrizeContainer) {
    fifthPrizeContainer.innerHTML = prizeNumbers.fifthPrize.map(function(num) {
      return '<span>' + num + '</span>';
    }).join('');
  }
}

function checkTicket() {
  var ticketInput = document.getElementById('ticket-input');
  var resultDiv = document.getElementById('result');
  var ticketNumber = ticketInput ? ticketInput.value.trim() : '';
  
  if (!ticketNumber) {
    resultDiv.innerHTML = '<p style="color: red;">Please enter a ticket number</p>';
    return;
  }
  
  var highlightElements = document.querySelectorAll('.highlight');
  Array.prototype.forEach.call(highlightElements, function(el) {
    el.classList.remove('highlight');
  });
  
  var hasRange = ticketNumber.indexOf('-') !== -1;
  var ticketsToCheck = [];
  
  if (hasRange) {
    var rangeParts = ticketNumber.split('-');
    var baseTicket = rangeParts[0];
    var endRange = rangeParts[1];
    var cleanBase = baseTicket.replace(/\s+/g, '').toUpperCase();
    
    if (cleanBase.length === 4 && /^[0-9]{4}$/.test(cleanBase)) {
      var prefix = cleanBase.slice(0, -2);
      var startNum = parseInt(cleanBase.slice(-2));
      var endNum = parseInt(endRange);
      
      for (var i = startNum; i <= endNum; i++) {
        var paddedNum = i.toString();
        if (paddedNum.length === 1) paddedNum = '0' + paddedNum;
        ticketsToCheck.push(prefix + paddedNum);
      }
    } else if (cleanBase.length === 5 && /^[0-9]{5}$/.test(cleanBase)) {
      var firstDigit = cleanBase.charAt(0);
      var prefix = cleanBase.slice(1, -2);
      var startNum = parseInt(cleanBase.slice(-2));
      var endNum = parseInt(endRange);
      
      for (var i = startNum; i <= endNum; i++) {
        var paddedNum = i.toString();
        if (paddedNum.length === 1) paddedNum = '0' + paddedNum;
        ticketsToCheck.push(firstDigit + prefix + paddedNum);
      }
    } else if (cleanBase.length === 8 && /^[0-9]{2}[A-Z][0-9]{5}$/.test(cleanBase)) {
      var seriesPrefix = cleanBase.slice(0, 2);
      var startLetter = cleanBase.charAt(2);
      var numberPart = cleanBase.slice(3, 8);
      var startNum = parseInt(cleanBase.slice(-2));
      var endNum = parseInt(endRange);
      
      if (endNum < startNum || endNum > 99) {
        resultDiv.innerHTML = '<p style="color: red;">Check your number - Invalid range format</p>';
        return;
      }
      
      for (var i = startNum; i <= endNum; i++) {
        var paddedNum = i.toString();
        if (paddedNum.length === 1) paddedNum = '0' + paddedNum;
        var fullNumber = numberPart.slice(0, -2) + paddedNum;
        ticketsToCheck.push(seriesPrefix + startLetter + fullNumber);
      }
    } else {
      resultDiv.innerHTML = '<p style="color: red;">Check your number - Invalid ticket format</p>';
      return;
    }
  } else {
    ticketsToCheck = [ticketNumber];
  }
  
  var allMatches = [];
  var firstPrizeNumber = prizeNumbers.firstPrize;
  var consolationNumber = prizeNumbers.consolation;
  
  for (var t = 0; t < ticketsToCheck.length; t++) {
    var ticket = ticketsToCheck[t];
    var cleanTicket = ticket.replace(/\s+/g, '').toUpperCase();
    
    if (cleanTicket === firstPrizeNumber) {
      var firstPrizeEl = document.querySelector('.first-prize .number');
      if (firstPrizeEl) firstPrizeEl.classList.add('highlight');
      allMatches.push({ ticket: cleanTicket, prize: '1st prize', amount: 10000000 });
    } else if (cleanTicket.length === 8 && 
               cleanTicket.slice(0, 2) === firstPrizeNumber.slice(0, 2) && 
               cleanTicket.slice(3) === firstPrizeNumber.slice(3) && 
               isValidFirstPrizeTicket(cleanTicket.charAt(2), selectedSeries)) {
      var firstPrizeEl = document.querySelector('.first-prize .number');
      if (firstPrizeEl) firstPrizeEl.classList.add('highlight');
      allMatches.push({ ticket: cleanTicket, prize: '1st prize', amount: 10000000 });
    } else if (cleanTicket.length === 8 && 
               cleanTicket.slice(0, 2) === firstPrizeNumber.slice(0, 2) && 
               cleanTicket.slice(3) === firstPrizeNumber.slice(3)) {
      var ticketLetter = cleanTicket.charAt(2);
      var firstPrizeLetter = firstPrizeNumber.charAt(2);
      if (isValidConsolationTicket(ticketLetter, selectedSeries, cleanTicket) && 
          ticketLetter !== firstPrizeLetter) {
        var consolationEl = document.querySelector('.first-prize-desc');
        if (consolationEl) consolationEl.classList.add('highlight');
        allMatches.push({ 
          ticket: cleanTicket, 
          prize: 'Consolation prize', 
          amount: selectedSeries * 1000,
          winningNumber: firstPrizeNumber,
          inputTicket: cleanTicket
        });
      }
    } else if (cleanTicket.length === 8 && 
               cleanTicket.slice(-5) === firstPrizeNumber.slice(-5)) {
      // Check for consolation prize: last 5 numbers match but first 2 numbers or alphabet don't match
      var ticketPrefix = cleanTicket.slice(0, 2);
      var ticketLetter = cleanTicket.charAt(2);
      var firstPrizePrefix = firstPrizeNumber.slice(0, 2);
      var firstPrizeLetter = firstPrizeNumber.charAt(2);
      
      // Only award consolation if it's different series/letter AND valid for the selected series
      if ((ticketPrefix !== firstPrizePrefix || ticketLetter !== firstPrizeLetter) && 
          isValidConsolationTicket(ticketLetter, selectedSeries, cleanTicket)) {
        var consolationEl = document.querySelector('.first-prize-desc');
        if (consolationEl) consolationEl.classList.add('highlight');
        allMatches.push({ 
          ticket: cleanTicket, 
          prize: 'Consolation prize', 
          amount: selectedSeries * 1000,
          winningNumber: firstPrizeNumber,
          inputTicket: cleanTicket
        });
      }
    } else if (cleanTicket === consolationNumber || 
               (cleanTicket.length >= 5 && cleanTicket.slice(-5) === consolationNumber)) {
      var consolationEl = document.querySelector('.first-prize-desc');
      if (consolationEl) consolationEl.classList.add('highlight');
      allMatches.push({ 
        ticket: cleanTicket, 
        prize: 'Consolation prize', 
        amount: selectedSeries * 1000,
        winningNumber: consolationNumber,
        inputTicket: cleanTicket
      });
    } else {
      checkSecondPrize(cleanTicket, allMatches, selectedSeries);
      checkThirdPrize(cleanTicket, allMatches, selectedSeries);
      checkFourthPrize(cleanTicket, allMatches, selectedSeries);
      checkFifthPrize(cleanTicket, allMatches, selectedSeries);
    }
  }
  
  if (allMatches.length > 0) {
    var totalWinning = 0;
    for (var m = 0; m < allMatches.length; m++) {
      totalWinning += allMatches[m].amount;
    }
    
    var matchesHtml = '';
    for (var m = 0; m < allMatches.length; m++) {
      var match = allMatches[m];
      var bgColor = match.prize === '1st prize' ? '#ff6b35' : 
                   match.prize === '1st prize (Other Series)' ? '#ffa500' : 
                   match.prize === 'Consolation prize' ? '#feca57' : 
                   match.prize === '2nd prize' ? '#dc3545' : 
                   match.prize === '3rd prize' ? '#17a2b8' : 
                   match.prize === '4th prize' ? '#6f42c1' : '#28a745';
      var displayAmount = match.prize === '1st prize' ? '1 CRORE' : '₹' + match.amount.toLocaleString();
      
      // Show the actual winning numbers from the prize sections
      var displayNumber = match.ticket;
      
      // For consolation prizes, show the consolation number (77070) not the full first prize number
      if (match.prize === 'Consolation prize') {
        if (match.winningNumber === prizeNumbers.firstPrize) {
          // If it's a consolation prize related to first prize, show the consolation number
          displayNumber = prizeNumbers.consolation;
        } else {
          // If it's direct consolation match, show the consolation number
          displayNumber = prizeNumbers.consolation;
        }
      }
      
      matchesHtml += '<p style="color: #ffffff; font-size: 1.2rem; margin: 5px 0; font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.5); background: ' + bgColor + '; padding: 8px; border-radius: 8px;">⭐ ' + displayNumber + ' - ' + match.prize + ' - ' + displayAmount + '</p>';
    }
    
    var pluralText = allMatches.length > 1 ? 'MULTIPLE WINS!' : 'WINNER!';
    var prizeText = allMatches.length > 1 ? 's' : '';
    var luckText = allMatches.length > 1 ? 'Amazing luck! Multiple prizes!' : 'Congratulations on your win!';
    
    resultDiv.innerHTML = '<div style="text-align: center; padding: 20px; background: linear-gradient(45deg, #d4edda, #c3e6cb); border-radius: 12px; margin: 20px 0;"><h2 style="color: #155724; font-size: 2rem; margin: 10px 0;">🎉🎆 ' + pluralText + ' 🎆🎉</h2><p style="color: #155724; font-size: 1.4rem; font-weight: bold;">You won ' + allMatches.length + ' prize' + prizeText + '!</p><div style="background: linear-gradient(135deg, #ffffff, #f8f9fa); padding: 15px; border-radius: 12px; margin: 15px 0; border: 2px solid #28a745;">' + matchesHtml + '<hr style="border: 1px solid #28a745; margin: 10px 0;"><p style="color: #28a745; font-size: 2rem; font-weight: 900; margin: 10px 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">💰 Total: ₹' + totalWinning.toLocaleString() + ' 💰</p></div><p style="color: #6f42c1; font-size: 1.1rem;">🎆 ' + luckText + ' 🎆</p></div>';
  } else {
    resultDiv.innerHTML = '<div style="text-align: center; padding: 20px; background: linear-gradient(45deg, #f8d7da, #f5c6cb); border-radius: 12px; margin: 20px 0;"><p style="color: #721c24; font-size: 1.3rem;">🎯 No match found</p><p style="color: #856404; font-size: 1.1rem;">🍀 Keep trying!</p></div>';
  }
}

// Rest of the functions converted to ES5 syntax...
function isValidFirstPrizeTicket(letter, series) {
  var groupA = ['A', 'B', 'C', 'D', 'E'];
  var groupG = ['G', 'H', 'J', 'K', 'L'];
  var allLetters = groupA.concat(groupG);
  var firstPrizeLetter = prizeNumbers.firstPrize.charAt(2); // Get actual first prize letter
  
  switch(series) {
    case 5:
    case 25:
      // For Series 5 & 25, determine group based on first prize letter
      if (groupA.indexOf(firstPrizeLetter) !== -1) {
        return groupA.indexOf(letter) !== -1;
      } else {
        return groupG.indexOf(letter) !== -1;
      }
    case 10:
    case 50:
    case 100:
    case 200:
      // For these series, all 10 letters are valid
      return allLetters.indexOf(letter) !== -1;
    default:
      return allLetters.indexOf(letter) !== -1;
  }
}

function checkSecondPrize(cleanTicket, allMatches, selectedSeries) {
  var matchNumber = cleanTicket.length >= 5 ? cleanTicket.slice(-5) : cleanTicket;
  
  if (prizeNumbers.secondPrize.indexOf(matchNumber) !== -1) {
    var spans = document.querySelectorAll('.prize-numbers span');
    Array.prototype.forEach.call(spans, function(span) {
      if (span.textContent.trim() === matchNumber) {
        span.classList.add('highlight');
      }
    });
    allMatches.push({ ticket: matchNumber, prize: '2nd prize', amount: selectedSeries * 9000 });
  }
}

function checkThirdPrize(cleanTicket, allMatches, selectedSeries) {
  var matchNumber = cleanTicket.length >= 4 ? cleanTicket.slice(-4) : cleanTicket;
  
  if (prizeNumbers.thirdPrize.indexOf(matchNumber) !== -1) {
    var spans = document.querySelectorAll('.prize-numbers span');
    Array.prototype.forEach.call(spans, function(span) {
      if (span.textContent.trim() === matchNumber) {
        span.classList.add('highlight');
      }
    });
    allMatches.push({ ticket: matchNumber, prize: '3rd prize', amount: selectedSeries * 450 });
  }
}

function checkFourthPrize(cleanTicket, allMatches, selectedSeries) {
  var matchNumber = cleanTicket.length >= 4 ? cleanTicket.slice(-4) : cleanTicket;
  
  if (prizeNumbers.fourthPrize.indexOf(matchNumber) !== -1) {
    var spans = document.querySelectorAll('.prize-numbers span');
    Array.prototype.forEach.call(spans, function(span) {
      if (span.textContent.trim() === matchNumber) {
        span.classList.add('highlight');
      }
    });
    allMatches.push({ ticket: matchNumber, prize: '4th prize', amount: selectedSeries * 250 });
  }
}

function checkFifthPrize(cleanTicket, allMatches, selectedSeries) {
  var matchNumber = cleanTicket.length >= 4 ? cleanTicket.slice(-4) : cleanTicket;
  
  if (prizeNumbers.fifthPrize.indexOf(matchNumber) !== -1) {
    // Target the fifth prize grid spans specifically
    var spans = document.querySelectorAll('#fifth-prize-numbers span');
    Array.prototype.forEach.call(spans, function(span) {
      if (span.textContent.trim() === matchNumber) {
        span.classList.add('highlight');
      }
    });
    allMatches.push({ ticket: matchNumber, prize: '5th prize', amount: selectedSeries * 120 });
  }
}

function isValidConsolationTicket(letter, series, inputTicket) {
  var groupA = ['A', 'B', 'C', 'D', 'E'];
  var groupG = ['G', 'H', 'J', 'K', 'L'];
  var allLetters = groupA.concat(groupG);
  var firstPrizeLetter = prizeNumbers.firstPrize.charAt(2);
  
  switch(series) {
    case 5:
    case 25:
      // For Series 5 & 25, ALL valid letters are eligible for consolation prizes
      // Both groups A and G are valid for consolation
      if (groupA.indexOf(firstPrizeLetter) !== -1) {
        return allLetters.indexOf(letter) !== -1; // Accept both A and G groups
      } else {
        return allLetters.indexOf(letter) !== -1; // Accept both A and G groups
      }
    case 10:
    case 50:
    case 100:
    case 200:
      // For these series, all 10 letters are valid
      return allLetters.indexOf(letter) !== -1;
    default:
      return allLetters.indexOf(letter) !== -1;
  }
}

// New functions for multi-draw functionality
function initializeDatePicker() {
  var today = new Date();
  selectedDate = today.toISOString().split('T')[0];
  document.getElementById('date-picker').value = selectedDate;
  updateCurrentSelectionDisplay();
}

function loadDrawsData() {
  try {
    // Check if allDrawsData is loaded from draws-data.js
    if (typeof allDrawsData !== 'undefined' && Object.keys(allDrawsData).length > 0) {
      console.log('Loaded draws data from draws-data.js:', allDrawsData);
      updateAvailableDates();
      loadSelectedDrawData();
    } else {
      throw new Error('allDrawsData not found');
    }
  } catch (error) {
    console.error('Error loading draws data:', error);
    // Show no data message instead of falling back to old system
    showNoDataMessage();
    updateCurrentSelectionDisplay();
  }
}

function loadSelectedDrawData() {
  return loadFromDateTimeFile().then(function(success) {
    if (!success) {
      // Fallback to multi-draw system
      var drawKey = selectedDate + '_' + selectedTime;
      
      if (allDrawsData && allDrawsData[drawKey]) {
        prizeNumbers = allDrawsData[drawKey];
        
        // Override the date and time to match selected date/time (in case of renamed files)
        var dateParts = selectedDate.split('-');
        var displayDate = dateParts[2] + '/' + dateParts[1] + '/' + dateParts[0]; // DD/MM/YYYY
        var displayTime = formatTimeForDisplay(selectedTime);
        
        prizeNumbers.drawDate = displayDate;
        prizeNumbers.drawTime = displayTime;
        
        console.log('Loaded data from allDrawsData for ' + drawKey + ' with corrected date/time:', prizeNumbers);
        updateDisplayNumbers();
        updateCurrentSelectionDisplay();
      } else {
        console.log('No data found for ' + drawKey);
        // Show no data message instead of falling back to old data
        showNoDataMessage();
        updateCurrentSelectionDisplay();
      }
    }
  });
}

function loadFromDateTimeFile() {
  return new Promise(function(resolve) {
    try {
      // Convert selectedDate from YYYY-MM-DD to DD-MM-YYYY for filename
      var dateParts = selectedDate.split('-');
      var dateStr = dateParts[2] + '-' + dateParts[1] + '-' + dateParts[0];
      
      // Convert selectedTime from 24-hour to filename format (e.g., "13:00" to "1pm")
      var timeStr = formatTimeForFilename(selectedTime);
      
      // Generate filename that matches admin panel output
      var filename = dateStr + '_' + timeStr + '_lottery.json';
      
      console.log('Attempting to load: ' + filename);
      
      fetch(filename)
        .then(function(response) {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error('File not found: ' + filename);
          }
        })
        .then(function(data) {
          prizeNumbers = data;
          
          // Override the date and time from filename (in case file was renamed)
          // Convert filename date back to display format
          var filenameDate = dateParts[0] + '/' + dateParts[1] + '/' + dateParts[2]; // DD/MM/YYYY
          var filenameTime = formatTimeForDisplay(selectedTime);
          
          // Update the prize data with correct date/time from filename
          prizeNumbers.drawDate = filenameDate;
          prizeNumbers.drawTime = filenameTime;
          
          console.log('Successfully loaded from ' + filename + ' with corrected date/time:', prizeNumbers);
          updateDisplayNumbers();
          updateCurrentSelectionDisplay();
          resolve(true); // Success
        })
        .catch(function(error) {
          console.log('Error loading from date-time file:', error);
          resolve(false); // File not found
        });
    } catch (error) {
      console.log('Error in loadFromDateTimeFile:', error);
      resolve(false); // Error occurred
    }
  });
}

function formatTimeForFilename(time24) {
  return LotteryUtils.fileUtils.formatTimeForFilename(time24);
}

function updateAvailableDates() {
  availableDates = [];
  var keys = Object.keys(allDrawsData);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var keyParts = key.split('_');
    var date = keyParts[0];
    var time = keyParts[1];
    if (availableDates.indexOf(date) === -1) {
      availableDates.push(date);
    }
  }
  
  // Sort dates in descending order (newest first)
  availableDates.sort(function(a, b) {
    return new Date(b) - new Date(a);
  });
  console.log('Available dates:', availableDates);
}

function convertDateFormat(dateString) {
  return LotteryUtils.dateTime.convertDateFormat(dateString);
}

function updateCurrentSelectionDisplay() {
  var currentDateTimeEl = document.getElementById('current-date-time');
  if (currentDateTimeEl) {
    var formattedDate = formatDateForDisplay(selectedDate);
    var formattedTime = formatTimeForDisplay(selectedTime);
    currentDateTimeEl.textContent = formattedDate + ' - ' + formattedTime;
  }
}

function formatDateForDisplay(dateString) {
  return LotteryUtils.dateTime.formatDateForDisplay(dateString);
}

function formatTimeForDisplay(timeString) {
  return LotteryUtils.dateTime.formatTimeForDisplay(timeString);
}

function showNoDataMessage() {
  // Clear all displays
  var firstPrizeEl = document.getElementById('first-prize-number');
  var consolationEl = document.getElementById('consolation-number');
  var datetimeEl = document.getElementById('draw-datetime');
  
  if (firstPrizeEl) firstPrizeEl.textContent = 'No Data Available';
  if (consolationEl) consolationEl.textContent = 'No Data';
  if (datetimeEl) datetimeEl.textContent = 'No Data Available';
  
  // Clear prize containers
  var containerIds = ['second-prize-numbers', 'third-prize-numbers', 'fourth-prize-numbers', 'fifth-prize-numbers'];
  for (var i = 0; i < containerIds.length; i++) {
    var container = document.getElementById(containerIds[i]);
    if (container) {
      container.innerHTML = '<span style="color: #999; font-style: italic; text-align: center; display: block; padding: 20px;">No data available for this date/time</span>';
    }
  }
  
  // Clear any existing prize data to prevent showing old data
  prizeNumbers = {
    firstPrize: '',
    consolation: '',
    secondPrize: [],
    thirdPrize: [],
    fourthPrize: [],
    fifthPrize: []
  };
}
