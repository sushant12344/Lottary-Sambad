let selectedSeries = 5;
let prizeNumbers = {};
// allDrawsData is now loaded from draws-data.js
let selectedDate = '';
let selectedTime = '13:00';
let availableDates = [];

document.addEventListener('DOMContentLoaded', function() {
  initializeDatePicker();
  loadDrawsData();
  
  const seriesButtons = document.querySelectorAll('.series-btn');
  seriesButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      seriesButtons.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      selectedSeries = parseInt(this.dataset.series);
    });
  });
  
  // Time selection buttons
  const timeButtons = document.querySelectorAll('.time-btn');
  timeButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      timeButtons.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      selectedTime = this.dataset.time;
      loadSelectedDrawData();
    });
  });
  
  // Date picker change event
  const datePicker = document.getElementById('date-picker');
  datePicker.addEventListener('change', function() {
    selectedDate = this.value;
    loadSelectedDrawData();
  });
  
  // Date search functionality
  const dateSearch = document.getElementById('date-search');
  dateSearch.addEventListener('input', function() {
    const searchValue = this.value;
    if (searchValue.length >= 10) { // DD-MM-YYYY format
      const convertedDate = convertDateFormat(searchValue);
      if (convertedDate) {
        datePicker.value = convertedDate;
        selectedDate = convertedDate;
        loadSelectedDrawData();
      }
    }
  });
  
  dateSearch.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      const searchValue = this.value;
      const convertedDate = convertDateFormat(searchValue);
      if (convertedDate) {
        datePicker.value = convertedDate;
        selectedDate = convertedDate;
        loadSelectedDrawData();
      }
    }
  });
  
  // Update input reference
  const ticketInput = document.getElementById('ticket-input');
  if (ticketInput) {
    ticketInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        checkTicket();
      }
    });
  }
});

async function loadPrizeNumbers() {
  try {
    // Add timestamp to prevent caching
    const cacheBuster = new Date().getTime();
    console.log('Loading numbers.json with cache buster:', cacheBuster);
    const response = await fetch(`numbers.json?v=${cacheBuster}`);
    console.log('Response status:', response.status);
    prizeNumbers = await response.json();
    console.log('Loaded prize numbers:', prizeNumbers);
    updateDisplayNumbers();
    console.log('Display updated successfully');
  } catch (error) {
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
  }
}

function updateDisplayNumbers() {
  // Update date and time in first prize section
  if (prizeNumbers.drawDate && prizeNumbers.drawTime) {
    const datetimeEl = document.getElementById('draw-datetime');
    if (datetimeEl) datetimeEl.textContent = prizeNumbers.drawDate + ' - ' + prizeNumbers.drawTime;
  }
  
  // Update first prize display
  const firstPrizeEl = document.getElementById('first-prize-number');
  if (firstPrizeEl) firstPrizeEl.textContent = prizeNumbers.firstPrize;
  
  // Update consolation number
  const consolationEl = document.getElementById('consolation-number');
  if (consolationEl) consolationEl.textContent = prizeNumbers.consolation;
  
  // Update second prize numbers
  const secondPrizeContainer = document.getElementById('second-prize-numbers');
  if (secondPrizeContainer) {
    secondPrizeContainer.innerHTML = prizeNumbers.secondPrize.map(num => `<span>${num}</span>`).join('');
  }
  
  // Update third prize numbers
  const thirdPrizeContainer = document.getElementById('third-prize-numbers');
  if (thirdPrizeContainer) {
    thirdPrizeContainer.innerHTML = prizeNumbers.thirdPrize.map(num => `<span>${num}</span>`).join('');
  }
  
  // Update fourth prize numbers
  const fourthPrizeContainer = document.getElementById('fourth-prize-numbers');
  if (fourthPrizeContainer) {
    fourthPrizeContainer.innerHTML = prizeNumbers.fourthPrize.map(num => `<span>${num}</span>`).join('');
  }
  
  // Update fifth prize numbers with grid layout (5 columns x 10 rows)
  const fifthPrizeContainer = document.getElementById('fifth-prize-numbers');
  if (fifthPrizeContainer) {
    fifthPrizeContainer.innerHTML = prizeNumbers.fifthPrize.map(num => `<span>${num}</span>`).join('');
  }
}

function checkTicket() {
  const ticketInput = document.getElementById('ticket-input');
  const resultDiv = document.getElementById('result');
  const ticketNumber = ticketInput ? ticketInput.value.trim() : '';
  
  if (!ticketNumber) {
    resultDiv.innerHTML = '<p style="color: red;">Please enter a ticket number</p>';
    return;
  }
  
  document.querySelectorAll('.highlight').forEach(el => el.classList.remove('highlight'));
  
  const hasRange = ticketNumber.includes('-');
  let ticketsToCheck = [];
  
  if (hasRange) {
    const [baseTicket, endRange] = ticketNumber.split('-');
    const cleanBase = baseTicket.replace(/\s+/g, '').toUpperCase();
    
    if (cleanBase.length === 4 && /^[0-9]{4}$/.test(cleanBase)) {
      const prefix = cleanBase.slice(0, -2);
      const startNum = parseInt(cleanBase.slice(-2));
      const endNum = parseInt(endRange);
      
      for (let i = startNum; i <= endNum; i++) {
        ticketsToCheck.push(prefix + i.toString().padStart(2, '0'));
      }
    } else if (cleanBase.length === 5 && /^[0-9]{5}$/.test(cleanBase)) {
      const firstDigit = cleanBase.charAt(0);
      const prefix = cleanBase.slice(1, -2);
      const startNum = parseInt(cleanBase.slice(-2));
      const endNum = parseInt(endRange);
      
      for (let i = startNum; i <= endNum; i++) {
        ticketsToCheck.push(firstDigit + prefix + i.toString().padStart(2, '0'));
      }
    } else if (cleanBase.length === 8 && /^[0-9]{2}[A-Z][0-9]{5}$/.test(cleanBase)) {
      const seriesPrefix = cleanBase.slice(0, 2);
      const startLetter = cleanBase.charAt(2);
      const numberPart = cleanBase.slice(3, 8);
      const startNum = parseInt(cleanBase.slice(-2));
      const endNum = parseInt(endRange);
      
      if (endNum < startNum || endNum > 99) {
        resultDiv.innerHTML = '<p style="color: red;">Check your number - Invalid range format</p>';
        return;
      }
      
      for (let i = startNum; i <= endNum; i++) {
        const fullNumber = numberPart.slice(0, -2) + i.toString().padStart(2, '0');
        ticketsToCheck.push(seriesPrefix + startLetter + fullNumber);
      }
    } else {
      resultDiv.innerHTML = '<p style="color: red;">Check your number - Invalid ticket format</p>';
      return;
    }
  } else {
    ticketsToCheck = [ticketNumber];
  }
  
  let allMatches = [];
  const firstPrizeNumber = prizeNumbers.firstPrize;
  const consolationNumber = prizeNumbers.consolation;
  
  for (let ticket of ticketsToCheck) {
    const cleanTicket = ticket.replace(/\s+/g, '').toUpperCase();
    
    if (cleanTicket === firstPrizeNumber) {
      document.querySelector('.first-prize .number').classList.add('highlight');
      allMatches.push({ ticket: cleanTicket, prize: '1st prize', amount: 10000000 });
    } else if (cleanTicket.length === 8 && cleanTicket.slice(0, 2) === firstPrizeNumber.slice(0, 2) && cleanTicket.slice(3) === firstPrizeNumber.slice(3) && isValidFirstPrizeTicket(cleanTicket.charAt(2), selectedSeries)) {
      document.querySelector('.first-prize .number').classList.add('highlight');
      allMatches.push({ ticket: cleanTicket, prize: '1st prize', amount: 10000000 });
    } else if (cleanTicket.length === 8 && cleanTicket.slice(0, 2) === firstPrizeNumber.slice(0, 2) && cleanTicket.slice(3) === firstPrizeNumber.slice(3)) {
      const ticketLetter = cleanTicket.charAt(2);
      const firstPrizeLetter = firstPrizeNumber.charAt(2);
      if (isValidConsolationTicket(ticketLetter, selectedSeries, cleanTicket) && ticketLetter !== firstPrizeLetter) {
        document.querySelector('.first-prize-desc').classList.add('highlight');
        allMatches.push({ 
          ticket: cleanTicket, 
          prize: 'Consolation prize', 
          amount: selectedSeries * 1000,
          winningNumber: firstPrizeNumber,
          inputTicket: cleanTicket
        });
      }
    } else if (cleanTicket.length === 8 && cleanTicket.slice(-5) === firstPrizeNumber.slice(-5)) {
      // Check for consolation prize: last 5 numbers match but first 2 numbers or alphabet don't match
      const ticketPrefix = cleanTicket.slice(0, 2);
      const ticketLetter = cleanTicket.charAt(2);
      const firstPrizePrefix = firstPrizeNumber.slice(0, 2);
      const firstPrizeLetter = firstPrizeNumber.charAt(2);
      
      // Only award consolation if it's different series/letter AND valid for the selected series
      if ((ticketPrefix !== firstPrizePrefix || ticketLetter !== firstPrizeLetter) && 
          isValidConsolationTicket(ticketLetter, selectedSeries, cleanTicket)) {
        document.querySelector('.first-prize-desc').classList.add('highlight');
        allMatches.push({ 
          ticket: cleanTicket, 
          prize: 'Consolation prize', 
          amount: selectedSeries * 1000,
          winningNumber: firstPrizeNumber,
          inputTicket: cleanTicket
        });
      }
    } else if (cleanTicket === consolationNumber || (cleanTicket.length >= 5 && cleanTicket.slice(-5) === consolationNumber)) {
      document.querySelector('.first-prize-desc').classList.add('highlight');
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
    const totalWinning = allMatches.reduce((sum, match) => sum + match.amount, 0);
    let matchesHtml = allMatches.map(match => {
      const bgColor = match.prize === '1st prize' ? '#ff6b35' : 
                     match.prize === '1st prize (Other Series)' ? '#ffa500' : 
                     match.prize === 'Consolation prize' ? '#feca57' : 
                     match.prize === '2nd prize' ? '#dc3545' : 
                     match.prize === '3rd prize' ? '#17a2b8' : 
                     match.prize === '4th prize' ? '#6f42c1' : '#28a745';
      const displayAmount = match.prize === '1st prize' ? '1 CRORE' : '₹' + match.amount.toLocaleString();
      
      // Show the actual winning numbers from the prize sections
      let displayNumber = match.ticket;
      
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
      
      return '<p style="color: #ffffff; font-size: 1.2rem; margin: 5px 0; font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.5); background: ' + bgColor + '; padding: 8px; border-radius: 8px;">⭐ ' + displayNumber + ' - ' + match.prize + ' - ' + displayAmount + '</p>';
    }).join('');
    
    resultDiv.innerHTML = '<div style="text-align: center; padding: 20px; background: linear-gradient(45deg, #d4edda, #c3e6cb); border-radius: 12px; margin: 20px 0;"><h2 style="color: #155724; font-size: 2rem; margin: 10px 0;">🎉🎆 ' + (allMatches.length > 1 ? 'MULTIPLE WINS!' : 'WINNER!') + ' 🎆🎉</h2><p style="color: #155724; font-size: 1.4rem; font-weight: bold;">You won ' + allMatches.length + ' prize' + (allMatches.length > 1 ? 's' : '') + '!</p><div style="background: linear-gradient(135deg, #ffffff, #f8f9fa); padding: 15px; border-radius: 12px; margin: 15px 0; border: 2px solid #28a745;">' + matchesHtml + '<hr style="border: 1px solid #28a745; margin: 10px 0;"><p style="color: #28a745; font-size: 2rem; font-weight: 900; margin: 10px 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">💰 Total: ₹' + totalWinning.toLocaleString() + ' 💰</p></div><p style="color: #6f42c1; font-size: 1.1rem;">🎆 ' + (allMatches.length > 1 ? 'Amazing luck! Multiple prizes!' : 'Congratulations on your win!') + ' 🎆</p></div>';
  } else {
    resultDiv.innerHTML = '<div style="text-align: center; padding: 20px; background: linear-gradient(45deg, #f8d7da, #f5c6cb); border-radius: 12px; margin: 20px 0;"><p style="color: #721c24; font-size: 1.3rem;">🎯 No match found</p><p style="color: #856404; font-size: 1.1rem;">🍀 Keep trying!</p></div>';
  }
}

function isValidFirstPrizeTicket(letter, series) {
  const groupA = ['A', 'B', 'C', 'D', 'E'];
  const groupG = ['G', 'H', 'J', 'K', 'L'];
  const allLetters = [...groupA, ...groupG];
  const firstPrizeLetter = prizeNumbers.firstPrize.charAt(2); // Get actual first prize letter
  
  switch(series) {
    case 5:
    case 25:
      // For Series 5 & 25, determine group based on first prize letter
      if (groupA.includes(firstPrizeLetter)) {
        return groupA.includes(letter);
      } else {
        return groupG.includes(letter);
      }
    case 10:
    case 50:
    case 100:
    case 200:
      // For these series, all 10 letters are valid
      return allLetters.includes(letter);
    default:
      return allLetters.includes(letter);
  }
}

function checkSecondPrize(cleanTicket, allMatches, selectedSeries) {
  const matchNumber = cleanTicket.length >= 5 ? cleanTicket.slice(-5) : cleanTicket;
  
  if (prizeNumbers.secondPrize.includes(matchNumber)) {
    document.querySelectorAll('.prize-numbers span').forEach(span => {
      if (span.textContent.trim() === matchNumber) {
        span.classList.add('highlight');
      }
    });
    allMatches.push({ ticket: matchNumber, prize: '2nd prize', amount: selectedSeries * 9000 });
  }
}

function checkThirdPrize(cleanTicket, allMatches, selectedSeries) {
  const matchNumber = cleanTicket.length >= 4 ? cleanTicket.slice(-4) : cleanTicket;
  
  if (prizeNumbers.thirdPrize.includes(matchNumber)) {
    document.querySelectorAll('.prize-numbers span').forEach(span => {
      if (span.textContent.trim() === matchNumber) {
        span.classList.add('highlight');
      }
    });
    allMatches.push({ ticket: matchNumber, prize: '3rd prize', amount: selectedSeries * 450 });
  }
}

function checkFourthPrize(cleanTicket, allMatches, selectedSeries) {
  const matchNumber = cleanTicket.length >= 4 ? cleanTicket.slice(-4) : cleanTicket;
  
  if (prizeNumbers.fourthPrize.includes(matchNumber)) {
    document.querySelectorAll('.prize-numbers span').forEach(span => {
      if (span.textContent.trim() === matchNumber) {
        span.classList.add('highlight');
      }
    });
    allMatches.push({ ticket: matchNumber, prize: '4th prize', amount: selectedSeries * 250 });
  }
}

function checkFifthPrize(cleanTicket, allMatches, selectedSeries) {
  const matchNumber = cleanTicket.length >= 4 ? cleanTicket.slice(-4) : cleanTicket;
  
  if (prizeNumbers.fifthPrize.includes(matchNumber)) {
    // Target the fifth prize grid spans specifically
    document.querySelectorAll('#fifth-prize-numbers span').forEach(span => {
      if (span.textContent.trim() === matchNumber) {
        span.classList.add('highlight');
      }
    });
    allMatches.push({ ticket: matchNumber, prize: '5th prize', amount: selectedSeries * 120 });
  }
}

function isValidConsolationTicket(letter, series, inputTicket) {
  const groupA = ['A', 'B', 'C', 'D', 'E'];
  const groupG = ['G', 'H', 'J', 'K', 'L'];
  const allLetters = [...groupA, ...groupG];
  const firstPrizeLetter = prizeNumbers.firstPrize.charAt(2);
  
  switch(series) {
    case 5:
    case 25:
      // For Series 5 & 25, ALL valid letters are eligible for consolation prizes
      // Both groups A and G are valid for consolation
      if (groupA.includes(firstPrizeLetter)) {
        return allLetters.includes(letter); // Accept both A and G groups
      } else {
        return allLetters.includes(letter); // Accept both A and G groups
      }
    case 10:
    case 50:
    case 100:
    case 200:
      // For these series, all 10 letters are valid
      return allLetters.includes(letter);
    default:
      return allLetters.includes(letter);
  }
}

// New functions for multi-draw functionality
function initializeDatePicker() {
  const today = new Date();
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

async function loadSelectedDrawData() {
  // Try to load from filename-based system first
  const success = await loadFromDateTimeFile();
  
  if (!success) {
    // Fallback to multi-draw system
    const drawKey = `${selectedDate}_${selectedTime}`;
    
    if (allDrawsData && allDrawsData[drawKey]) {
      prizeNumbers = allDrawsData[drawKey];
      
      // Override the date and time to match selected date/time (in case of renamed files)
      const dateParts = selectedDate.split('-');
      const displayDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`; // DD/MM/YYYY
      const displayTime = formatTimeForDisplay(selectedTime);
      
      prizeNumbers.drawDate = displayDate;
      prizeNumbers.drawTime = displayTime;
      
      console.log(`Loaded data from allDrawsData for ${drawKey} with corrected date/time:`, prizeNumbers);
      updateDisplayNumbers();
      updateCurrentSelectionDisplay();
    } else {
      console.log(`No data found for ${drawKey}`);
      // Show no data message instead of falling back to old data
      showNoDataMessage();
      updateCurrentSelectionDisplay();
    }
  }
}

async function loadFromDateTimeFile() {
  try {
    // Convert selectedDate from YYYY-MM-DD to DD-MM-YYYY for filename
    const dateParts = selectedDate.split('-');
    const dateStr = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
    
    // Convert selectedTime from 24-hour to filename format (e.g., "13:00" to "1pm")
    const timeStr = formatTimeForFilename(selectedTime);
    
    // Generate filename that matches admin panel output
    const filename = `${dateStr}_${timeStr}_lottery.json`;
    
    console.log(`Attempting to load: ${filename}`);
    
    const response = await fetch(filename);
    if (response.ok) {
      prizeNumbers = await response.json();
      
      // Override the date and time from filename (in case file was renamed)
      // Convert filename date back to display format
      const filenameDate = `${dateParts[0]}/${dateParts[1]}/${dateParts[2]}`; // DD/MM/YYYY
      const filenameTime = formatTimeForDisplay(selectedTime);
      
      // Update the prize data with correct date/time from filename
      prizeNumbers.drawDate = filenameDate;
      prizeNumbers.drawTime = filenameTime;
      
      console.log(`Successfully loaded from ${filename} with corrected date/time:`, prizeNumbers);
      updateDisplayNumbers();
      updateCurrentSelectionDisplay();
      return true; // Success
    } else {
      console.log(`File not found: ${filename}`);
      return false; // File not found
    }
  } catch (error) {
    console.log('Error loading from date-time file:', error);
    return false; // Error occurred
  }
}

function formatTimeForFilename(time24) {
  const [hours, minutes] = time24.split(':');
  const hour12 = parseInt(hours) % 12 || 12;
  const ampm = parseInt(hours) >= 12 ? 'pm' : 'am';
  return `${hour12}${ampm}`;
}

function updateAvailableDates() {
  availableDates = [];
  Object.keys(allDrawsData).forEach(key => {
    const [date, time] = key.split('_');
    if (!availableDates.includes(date)) {
      availableDates.push(date);
    }
  });
  
  // Sort dates in descending order (newest first)
  availableDates.sort((a, b) => new Date(b) - new Date(a));
  console.log('Available dates:', availableDates);
}

function convertDateFormat(dateString) {
  return LotteryUtils.dateTime.convertDateFormat(dateString);
}

function updateCurrentSelectionDisplay() {
  const currentDateTimeEl = document.getElementById('current-date-time');
  if (currentDateTimeEl) {
    const formattedDate = formatDateForDisplay(selectedDate);
    const formattedTime = formatTimeForDisplay(selectedTime);
    currentDateTimeEl.textContent = `${formattedDate} - ${formattedTime}`;
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
  const firstPrizeEl = document.getElementById('first-prize-number');
  const consolationEl = document.getElementById('consolation-number');
  const datetimeEl = document.getElementById('draw-datetime');
  
  if (firstPrizeEl) firstPrizeEl.textContent = 'No Data Available';
  if (consolationEl) consolationEl.textContent = 'No Data';
  if (datetimeEl) datetimeEl.textContent = 'No Data Available';
  
  // Clear prize containers
  ['second-prize-numbers', 'third-prize-numbers', 'fourth-prize-numbers', 'fifth-prize-numbers'].forEach(id => {
    const container = document.getElementById(id);
    if (container) {
      container.innerHTML = '<span style="color: #999; font-style: italic; text-align: center; display: block; padding: 20px;">No data available for this date/time</span>';
    }
  });
  
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
