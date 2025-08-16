// Admin Panel JavaScript
class LotteryAdmin {
    constructor() {
        this.adminPassword = 'lottery2024'; // Default password - change this!
        this.allDrawsData = {};
        this.history = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadHistory();
        this.checkAutoLogin();
    }

    // Event Bindings
    bindEvents() {
        // Login form
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Logout
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.logout();
        });

        // Navigation tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Form controls
        document.getElementById('load-current').addEventListener('click', () => {
            this.loadCurrentData();
        });

        document.getElementById('clear-form').addEventListener('click', () => {
            this.clearForm();
        });
        
        // Quick time selection buttons
        document.querySelectorAll('.quick-time-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.quick-time-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                const timeValue = e.target.dataset.time;
                document.getElementById('draw-time').value = timeValue;
            });
        });
        
        // Draw time select change
        document.getElementById('draw-time').addEventListener('change', (e) => {
            const timeValue = e.target.value;
            document.querySelectorAll('.quick-time-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.time === timeValue);
            });
        });
        
        document.getElementById('import-from-text').addEventListener('click', () => {
            this.showBulkImportModal();
        });

        // First prize input listener
        document.getElementById('first-prize').addEventListener('input', (e) => {
            this.updateConsolationNumber(e.target.value);
        });

        // Import buttons for each prize category
        document.getElementById('import-second').addEventListener('click', () => {
            this.importPrizeNumbers('second', 10, 5);
        });

        document.getElementById('import-third').addEventListener('click', () => {
            this.importPrizeNumbers('third', 10, 4);
        });

        document.getElementById('import-fourth').addEventListener('click', () => {
            this.importPrizeNumbers('fourth', 10, 4);
        });

        document.getElementById('import-fifth').addEventListener('click', () => {
            this.importPrizeNumbers('fifth', 100, 4);
        });

        // Form actions
        document.getElementById('preview-btn').addEventListener('click', () => {
            this.previewChanges();
        });

        document.getElementById('lottery-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveData();
        });

        document.getElementById('reset-btn').addEventListener('click', () => {
            this.resetForm();
        });

        // Modal controls
        document.getElementById('close-preview').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('cancel-preview').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('confirm-save').addEventListener('click', () => {
            this.confirmSave();
        });

        // Settings
        document.getElementById('change-password').addEventListener('click', () => {
            this.changePassword();
        });

        // History actions
        document.getElementById('export-history').addEventListener('click', () => {
            this.exportHistory();
        });

        document.getElementById('backup-data').addEventListener('click', () => {
            this.createBackup();
        });

        // Allow manual date selection - no default date
        // document.getElementById('draw-date').value = new Date().toISOString().split('T')[0];

        this.createPrizeInputs();
    }

    // Authentication
    handleLogin() {
        const password = document.getElementById('admin-password').value;
        if (password === this.adminPassword) {
            localStorage.setItem('lottery_admin_logged_in', 'true');
            localStorage.setItem('lottery_admin_login_time', Date.now());
            this.showDashboard();
            this.showNotification('Welcome to Admin Panel!', 'success');
        } else {
            this.showNotification('Invalid password!', 'error');
            document.getElementById('admin-password').value = '';
        }
    }

    checkAutoLogin() {
        const isLoggedIn = localStorage.getItem('lottery_admin_logged_in');
        const loginTime = localStorage.getItem('lottery_admin_login_time');
        const currentTime = Date.now();
        const sessionDuration = 24 * 60 * 60 * 1000; // 24 hours

        if (isLoggedIn && loginTime && (currentTime - loginTime) < sessionDuration) {
            this.showDashboard();
        }
    }

    logout() {
        localStorage.removeItem('lottery_admin_logged_in');
        localStorage.removeItem('lottery_admin_login_time');
        document.getElementById('login-screen').style.display = 'flex';
        document.getElementById('admin-dashboard').style.display = 'none';
        this.showNotification('Logged out successfully!', 'info');
    }

    showDashboard() {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('admin-dashboard').style.display = 'block';
        this.updateLastUpdateTime();
        this.loadAnalytics();
    }

    // Tab Navigation
    switchTab(tabName) {
        // Remove active class from all tabs and contents
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        // Add active class to selected tab and content
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');

        // Load tab-specific data
        if (tabName === 'analytics') {
            this.loadAnalytics();
        } else if (tabName === 'history') {
            this.displayHistory();
        }
    }

    // Data Management
    async loadCurrentData() {
        try {
            const response = await fetch('numbers.json');
            this.currentData = await response.json();
            this.populateForm(this.currentData);
            this.showNotification('Current data loaded successfully!', 'success');
        } catch (error) {
            console.error('Error loading current data:', error);
            this.showNotification('Error loading current data!', 'error');
        }
    }

    populateForm(data) {
        // Set date and time
        if (data.drawDate) {
            const dateParts = data.drawDate.split('-');
            const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
            document.getElementById('draw-date').value = formattedDate;
        }
        
        if (data.drawTime) {
            const timeParts = data.drawTime.split(' ');
            const time24 = this.convertTo24Hour(timeParts[0]);
            document.getElementById('draw-time').value = time24;
        }

        // Set first prize
        if (data.firstPrize) {
            document.getElementById('first-prize').value = data.firstPrize;
            document.getElementById('consolation').value = data.consolation;
        }

        // Set prize numbers
        this.populatePrizeGrid('second', data.secondPrize || []);
        this.populatePrizeGrid('third', data.thirdPrize || []);
        this.populatePrizeGrid('fourth', data.fourthPrize || []);
        this.populatePrizeGrid('fifth', data.fifthPrize || []);
    }

    convertTo24Hour(time12h) {
        const [time, period] = time12h.split(' ');
        let [hours, minutes] = time.split(':');
        
        if (period && period.toLowerCase() === 'pm' && hours !== '12') {
            hours = parseInt(hours, 10) + 12;
        } else if (period && period.toLowerCase() === 'am' && hours === '12') {
            hours = '00';
        }
        
        return `${hours.toString().padStart(2, '0')}:${minutes}`;
    }

    clearForm() {
        if (confirm('Are you sure you want to clear the form?')) {
            document.getElementById('lottery-form').reset();
            
            // Clear all prize inputs
            ['second', 'third', 'fourth', 'fifth'].forEach(prizeType => {
                const inputs = document.querySelectorAll(`#${prizeType}-prize-grid input`);
                inputs.forEach(input => {
                    input.value = '';
                    input.classList.remove('generated');
                });
                // Clear textareas
                document.getElementById(`${prizeType}-textarea`).value = '';
            });
            
            document.getElementById('consolation').value = '';
            document.getElementById('draw-date').value = new Date().toISOString().split('T')[0];
            
            this.showNotification('Form cleared successfully!', 'info');
        }
    }

    showBulkImportModal() {
        const modalHtml = `
            <div class="modal-overlay" id="bulk-import-modal" style="display: flex;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>📄 Bulk Import Lottery Numbers</h2>
                        <button id="close-bulk-import" class="close-btn">✖️</button>
                    </div>
                    <div class="modal-body">
                        <p>Paste your complete lottery results here. Format example:</p>
                        <pre style="background: #f8fafc; padding: 1rem; border-radius: 8px; margin: 1rem 0; font-size: 0.9rem;">
First Prize: 65L29688
Second Prize: 04347,17943,18402,21140,34235,47484,55668,85007,86622,98536
Third Prize: 0480,1142,1510,4697,4888,5421,5786,6929,8269,9784
Fourth Prize: 0718,1333,3925,3962,4938,5498,5616,7592,9550,9858
Fifth Prize: 0145,1572,2502,3378,4747... (all 100 numbers)
                        </pre>
                        <textarea id="bulk-import-textarea" style="width: 100%; height: 200px; padding: 1rem; border: 2px solid #e2e8f0; border-radius: 8px; font-family: monospace;" placeholder="Paste your lottery results here..."></textarea>
                    </div>
                    <div class="modal-footer">
                        <button id="process-bulk-import" class="confirm-btn">📥 Import Numbers</button>
                        <button id="cancel-bulk-import" class="cancel-btn">❌ Cancel</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Add event listeners
        document.getElementById('close-bulk-import').addEventListener('click', () => {
            document.getElementById('bulk-import-modal').remove();
        });
        
        document.getElementById('cancel-bulk-import').addEventListener('click', () => {
            document.getElementById('bulk-import-modal').remove();
        });
        
        document.getElementById('process-bulk-import').addEventListener('click', () => {
            this.processBulkImport();
        });
    }

    processBulkImport() {
        const text = document.getElementById('bulk-import-textarea').value.trim();
        if (!text) {
            this.showNotification('Please paste your lottery results!', 'error');
            return;
        }
        
        try {
            const lines = text.split('\n').map(line => line.trim()).filter(line => line);
            
            lines.forEach(line => {
                const lowerLine = line.toLowerCase();
                
                if (lowerLine.includes('first prize')) {
                    const match = line.match(/([0-9]{2}[A-Z][0-9]{5})/i);
                    if (match) {
                        document.getElementById('first-prize').value = match[1].toUpperCase();
                        this.updateConsolationNumber(match[1].toUpperCase());
                    }
                } else if (lowerLine.includes('second prize')) {
                    const numbers = this.extractNumbers(line, 5);
                    if (numbers.length > 0) {
                        document.getElementById('second-textarea').value = numbers.join('\n');
                    }
                } else if (lowerLine.includes('third prize')) {
                    const numbers = this.extractNumbers(line, 4);
                    if (numbers.length > 0) {
                        document.getElementById('third-textarea').value = numbers.join('\n');
                    }
                } else if (lowerLine.includes('fourth prize')) {
                    const numbers = this.extractNumbers(line, 4);
                    if (numbers.length > 0) {
                        document.getElementById('fourth-textarea').value = numbers.join('\n');
                    }
                } else if (lowerLine.includes('fifth prize')) {
                    const numbers = this.extractNumbers(line, 4);
                    if (numbers.length > 0) {
                        document.getElementById('fifth-textarea').value = numbers.join('\n');
                    }
                }
            });
            
            document.getElementById('bulk-import-modal').remove();
            this.showNotification('Numbers imported successfully! Please review and import each category.', 'success');
            
        } catch (error) {
            this.showNotification('Error processing import data. Please check the format.', 'error');
            console.error('Import error:', error);
        }
    }
    
    extractNumbers(text, expectedLength) {
        return LotteryUtils.numbers.extractNumbers(text, expectedLength);
    }

    sortNumbers(numbers, prizeType) {
        return LotteryUtils.numbers.sortNumbers(numbers, prizeType);
    }

    updateConsolationNumber(firstPrize) {
        if (firstPrize.length >= 5) {
            const consolation = firstPrize.slice(-5);
            document.getElementById('consolation').value = consolation;
        }
    }

    // Prize Number Generation
    createPrizeInputs() {
        // Create second prize inputs
        this.createPrizeGrid('second', 10);
        // Create third prize inputs
        this.createPrizeGrid('third', 10);
        // Create fourth prize inputs
        this.createPrizeGrid('fourth', 10);
        // Create fifth prize inputs
        this.createPrizeGrid('fifth', 100);
    }

    createPrizeGrid(prizeType, count) {
        const container = document.getElementById(`${prizeType}-prize-grid`);
        container.innerHTML = '';
        
        for (let i = 0; i < count; i++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'prize-input';
            input.id = `${prizeType}-${i}`;
            input.placeholder = prizeType === 'fifth' ? '0000' : (prizeType === 'second' ? '00000' : '0000');
            input.maxLength = prizeType === 'second' ? 5 : 4;
            container.appendChild(input);
        }
    }

    populatePrizeGrid(prizeType, numbers) {
        const inputs = document.querySelectorAll(`#${prizeType}-prize-grid input`);
        inputs.forEach((input, index) => {
            if (numbers[index]) {
                input.value = numbers[index];
                input.classList.add('generated');
            } else {
                input.value = '';
                input.classList.remove('generated');
            }
        });
    }

    importPrizeNumbers(prizeType, expectedCount, expectedLength) {
        const textarea = document.getElementById(`${prizeType}-textarea`);
        const text = textarea.value.trim();
        
        if (!text) {
            this.showNotification(`Please paste ${prizeType} prize numbers in the textarea!`, 'error');
            return;
        }
        
        // Extract numbers from textarea
        let numbers = this.extractNumbers(text, expectedLength);
        
        if (numbers.length !== expectedCount) {
            this.showNotification(`Expected ${expectedCount} numbers, but found ${numbers.length}. Please check your input.`, 'warning');
        }
        
        if (numbers.length === 0) {
            this.showNotification('No valid numbers found. Please check your format.', 'error');
            return;
        }
        
        // Sort numbers based on prize type
        numbers = this.sortNumbers(numbers, prizeType);
        
        // Populate the grid with sorted imported numbers
        this.populatePrizeGrid(prizeType, numbers);
        
        // Mark as imported
        const inputs = document.querySelectorAll(`#${prizeType}-prize-grid input`);
        inputs.forEach(input => {
            if (input.value) {
                input.classList.add('generated');
            }
        });
        
        // Clear textarea after successful import
        textarea.value = '';
        
        this.showNotification(`${numbers.length} ${prizeType} prize numbers imported and sorted successfully!`, 'success');
    }

    // Data Collection and Saving
    collectFormData() {
        const drawDate = document.getElementById('draw-date').value;
        const drawTime = document.getElementById('draw-time').value;
        const firstPrize = document.getElementById('first-prize').value;
        const consolation = document.getElementById('consolation').value;

        // Format date
        const dateParts = drawDate.split('-');
        const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
        
        // Format time
        const timeFormatted = this.convertTo12Hour(drawTime);

        // Collect prize numbers
        const secondPrize = this.collectPrizeNumbers('second');
        const thirdPrize = this.collectPrizeNumbers('third');
        const fourthPrize = this.collectPrizeNumbers('fourth');
        const fifthPrize = this.collectPrizeNumbers('fifth');

        return {
            drawDate: formattedDate,
            drawTime: timeFormatted,
            firstPrize,
            consolation,
            secondPrize,
            thirdPrize,
            fourthPrize,
            fifthPrize
        };
    }

    convertTo12Hour(time24) {
        const [hours, minutes] = time24.split(':');
        const hour12 = hours % 12 || 12;
        const ampm = hours >= 12 ? 'PM' : 'AM';
        return `${hour12}:${minutes} ${ampm}`;
    }

    collectPrizeNumbers(prizeType) {
        const inputs = document.querySelectorAll(`#${prizeType}-prize-grid input`);
        return Array.from(inputs)
            .map(input => input.value.trim())
            .filter(value => value !== '');
    }

    // Preview and Save
    previewChanges() {
        const data = this.collectFormData();
        
        if (!this.validateData(data)) {
            return;
        }

        const previewHtml = this.generatePreviewHTML(data);
        document.getElementById('preview-content').innerHTML = previewHtml;
        document.getElementById('preview-modal').style.display = 'flex';
    }

    validateData(data) {
        if (!data.drawDate || !data.drawTime) {
            this.showNotification('Please fill in draw date and time!', 'error');
            return false;
        }

        if (!data.firstPrize || data.firstPrize.length !== 8) {
            this.showNotification('Please enter a valid first prize number (8 characters)!', 'error');
            return false;
        }

        if (data.secondPrize.length < 10) {
            this.showNotification('Please enter all 10 second prize numbers!', 'error');
            return false;
        }

        if (data.thirdPrize.length < 10) {
            this.showNotification('Please enter all 10 third prize numbers!', 'error');
            return false;
        }

        if (data.fourthPrize.length < 10) {
            this.showNotification('Please enter all 10 fourth prize numbers!', 'error');
            return false;
        }

        if (data.fifthPrize.length < 100) {
            this.showNotification('Please enter all 100 fifth prize numbers!', 'error');
            return false;
        }

        return true;
    }

    generatePreviewHTML(data) {
        return `
            <div class="preview-section">
                <h3>📅 Draw Information</h3>
                <p><strong>Date:</strong> ${data.drawDate}</p>
                <p><strong>Time:</strong> ${data.drawTime}</p>
            </div>
            
            <div class="preview-section">
                <h3>🥇 First Prize</h3>
                <p><strong>Number:</strong> ${data.firstPrize}</p>
                <p><strong>Consolation:</strong> ${data.consolation}</p>
            </div>
            
            <div class="preview-section">
                <h3>🥈 Second Prize (${data.secondPrize.length} numbers)</h3>
                <div class="preview-numbers">
                    ${data.secondPrize.map(num => `<span>${num}</span>`).join('')}
                </div>
            </div>
            
            <div class="preview-section">
                <h3>🥉 Third Prize (${data.thirdPrize.length} numbers)</h3>
                <div class="preview-numbers">
                    ${data.thirdPrize.map(num => `<span>${num}</span>`).join('')}
                </div>
            </div>
            
            <div class="preview-section">
                <h3>🏅 Fourth Prize (${data.fourthPrize.length} numbers)</h3>
                <div class="preview-numbers">
                    ${data.fourthPrize.map(num => `<span>${num}</span>`).join('')}
                </div>
            </div>
            
            <div class="preview-section">
                <h3>🎖️ Fifth Prize (${data.fifthPrize.length} numbers)</h3>
                <div class="preview-numbers preview-numbers-small">
                    ${data.fifthPrize.map(num => `<span>${num}</span>`).join('')}
                </div>
            </div>
            
            <style>
                .preview-section {
                    margin-bottom: 2rem;
                    padding: 1rem;
                    background: #f8fafc;
                    border-radius: 8px;
                }
                .preview-numbers {
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    gap: 0.5rem;
                    margin-top: 1rem;
                }
                .preview-numbers-small {
                    grid-template-columns: repeat(10, 1fr);
                    gap: 0.25rem;
                }
                .preview-numbers span {
                    background: white;
                    padding: 0.5rem;
                    text-align: center;
                    border-radius: 4px;
                    font-weight: 600;
                    border: 1px solid #e2e8f0;
                }
            </style>
        `;
    }

    closeModal() {
        document.getElementById('preview-modal').style.display = 'none';
    }

    confirmSave() {
        this.closeModal();
        this.saveData();
    }

    saveData() {
        const data = this.collectFormData();
        
        if (!this.validateData(data)) {
            return;
        }

        // Directly download single file without modal
        this.downloadSingleFile(data);
    }
    
    // Simplified: Just download one file with date-time filename
    downloadSingleFile(data) {
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        // Generate filename with date and time in name
        const drawDate = document.getElementById('draw-date').value;
        const drawTime = document.getElementById('draw-time').value;
        
        // Convert YYYY-MM-DD to DD-MM-YYYY
        const dateParts = drawDate.split('-');
        const dateStr = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
        
        // Convert 24-hour time to readable format (e.g., "13:00" to "1pm")
        const timeStr = this.formatTimeForFilename(drawTime);
        
        const filename = `${dateStr}_${timeStr}_lottery.json`;
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Save to localStorage as backup and add to history
        localStorage.setItem('lottery_data_backup', JSON.stringify(data));
        this.addToHistory(data);
        
        this.showNotification(`File saved as: ${filename}`, 'success');
        this.updateLastUpdateTime();
        this.loadAnalytics();
    }
    
    formatTimeForFilename(time24) {
        return LotteryUtils.dateTime.formatTimeForFilename(time24);
    }
    
    processSelectedDownloads(data) {
        const downloadNumbers = document.getElementById('download-numbers').checked;
        const downloadDraws = document.getElementById('download-draws').checked;
        const downloadDrawsJS = document.getElementById('download-draws-js').checked;
        
        if (!downloadNumbers && !downloadDraws && !downloadDrawsJS) {
            this.showNotification('Please select at least one file to download!', 'error');
            return;
        }
        
        // Get the current form data
        const drawDate = document.getElementById('draw-date').value;
        const drawTime = document.getElementById('draw-time').value;
        
        // Save to localStorage as backup
        localStorage.setItem('lottery_data_backup', JSON.stringify(data));
        
        // Add to history
        this.addToHistory(data);
        
        let downloadedFiles = [];
        
        // Download selected files
        if (downloadNumbers) {
            this.downloadIndividualDrawFile(data);
            downloadedFiles.push('numbers.json');
        }
        
        if (downloadDraws || downloadDrawsJS) {
            // Load existing draws data or create new one
            let allDrawsData = {};
            
            try {
                const existingDraws = localStorage.getItem('all_draws_data');
                if (existingDraws) {
                    allDrawsData = JSON.parse(existingDraws);
                }
            } catch (error) {
                console.log('Creating new draws data structure');
            }
            
            // Create the draw key (YYYY-MM-DD_HH:MM format)
            const drawKey = `${drawDate}_${drawTime}`;
            allDrawsData[drawKey] = data;
            
            // Save back to localStorage
            localStorage.setItem('all_draws_data', JSON.stringify(allDrawsData));
            
            if (downloadDraws) {
                this.downloadDrawsJSON(allDrawsData, drawDate);
                downloadedFiles.push('draws.json');
            }
            
            if (downloadDrawsJS) {
                this.downloadDrawsDataJS(allDrawsData, drawDate);
                downloadedFiles.push('draws-data.js');
            }
        }
        
        // Close modal
        document.getElementById('download-options-modal').remove();
        
        // Show success message
        this.showNotification(`Data saved successfully! Downloaded: ${downloadedFiles.join(', ')}`, 'success');
        this.updateLastUpdateTime();
        this.loadAnalytics();
    }

    downloadIndividualDrawFile(data) {
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        // Format filename with date and time
        const filename = this.generateFileName('numbers.json', data.drawDate, data.drawTime);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    downloadDrawsJSON(allDrawsData, drawDate) {
        const jsonString = JSON.stringify(allDrawsData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        // Use the date from admin panel form
        const dateParts = drawDate.split('-'); // YYYY-MM-DD
        const dateStr = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`; // DD/MM/YYYY format
        const filename = `${dateStr} draws.json`;
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    downloadDrawsDataJS(allDrawsData, drawDate) {
        // Create JavaScript variable format
        const jsContent = `var allDrawsData = ${JSON.stringify(allDrawsData, null, 2)};`;
        const blob = new Blob([jsContent], { type: 'application/javascript' });
        const url = URL.createObjectURL(blob);
        
        // Use the date from admin panel form
        const dateParts = drawDate.split('-'); // YYYY-MM-DD
        const dateStr = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`; // DD/MM/YYYY format
        const filename = `${dateStr} draws-data.js`;
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Generate filename with date and time
    generateFileName(baseFilename, drawDate, drawTime) {
        // Convert DD-MM-YYYY to DD/MM/YYYY format for filename
        const dateForFilename = drawDate.replace(/-/g, '/');
        
        // Convert time format (e.g., "1:00 PM" to "1pm")
        const timeForFilename = drawTime.toLowerCase()
            .replace(':00', '')
            .replace(' ', '')
            .replace('pm', 'pm')
            .replace('am', 'am');
        
        // Get file extension
        const extension = baseFilename.split('.').pop();
        const baseName = baseFilename.replace(`.${extension}`, '');
        
        return `${dateForFilename} ${timeForFilename} ${baseName}.${extension}`;
    }

    resetForm() {
        if (confirm('Are you sure you want to reset the form? All unsaved data will be lost.')) {
            document.getElementById('lottery-form').reset();
            
            // Clear all prize inputs
            ['second', 'third', 'fourth', 'fifth'].forEach(prizeType => {
                const inputs = document.querySelectorAll(`#${prizeType}-prize-grid input`);
                inputs.forEach(input => {
                    input.value = '';
                    input.classList.remove('generated');
                });
            });
            
            document.getElementById('consolation').value = '';
            document.getElementById('draw-date').value = new Date().toISOString().split('T')[0];
            
            this.showNotification('Form reset successfully!', 'info');
        }
    }

    // History Management
    addToHistory(data) {
        const historyItem = {
            ...data,
            timestamp: Date.now(),
            id: Date.now().toString()
        };
        
        this.history.unshift(historyItem);
        
        // Keep only last 50 entries
        if (this.history.length > 50) {
            this.history = this.history.slice(0, 50);
        }
        
        localStorage.setItem('lottery_history', JSON.stringify(this.history));
    }

    loadHistory() {
        const saved = localStorage.getItem('lottery_history');
        if (saved) {
            this.history = JSON.parse(saved);
        }
    }

    displayHistory() {
        const container = document.getElementById('history-list');
        
        if (this.history.length === 0) {
            container.innerHTML = '<p>No history available.</p>';
            return;
        }
        
        const historyHTML = this.history.map(item => `
            <div class="history-item">
                <div class="history-date">${item.drawDate} - ${item.drawTime}</div>
                <div><strong>First Prize:</strong> ${item.firstPrize}</div>
                <div class="history-numbers">
                    <div><strong>2nd:</strong> ${item.secondPrize.slice(0, 5).join(', ')}...</div>
                    <div><strong>3rd:</strong> ${item.thirdPrize.slice(0, 5).join(', ')}...</div>
                </div>
                <small>Saved: ${new Date(item.timestamp).toLocaleString()}</small>
            </div>
        `).join('');
        
        container.innerHTML = historyHTML;
    }

    exportHistory() {
        if (this.history.length === 0) {
            this.showNotification('No history to export!', 'warning');
            return;
        }
        
        const jsonString = JSON.stringify(this.history, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `lottery_history_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('History exported successfully!', 'success');
    }

    createBackup() {
        const backup = {
            currentData: this.currentData,
            history: this.history,
            timestamp: Date.now(),
            version: '1.0'
        };
        
        const jsonString = JSON.stringify(backup, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `lottery_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Backup created successfully!', 'success');
    }

    // Analytics
    loadAnalytics() {
        document.getElementById('total-draws').textContent = this.history.length;
        
        // Calculate most frequent numbers
        this.calculateFrequentNumbers();
        
        // Update recent activity
        this.updateRecentActivity();
    }

    calculateFrequentNumbers() {
        const numberCounts = {};
        
        this.history.forEach(draw => {
            // Count all numbers from all prizes
            const allNumbers = [
                ...draw.secondPrize,
                ...draw.thirdPrize,
                ...draw.fourthPrize,
                ...draw.fifthPrize
            ];
            
            allNumbers.forEach(num => {
                numberCounts[num] = (numberCounts[num] || 0) + 1;
            });
        });
        
        // Get top 10 most frequent
        const sortedNumbers = Object.entries(numberCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);
        
        const frequentHtml = sortedNumbers.length > 0 
            ? sortedNumbers.map(([num, count]) => `<div>${num} (${count}x)</div>`).join('')
            : 'No data available';
            
        document.getElementById('frequent-numbers').innerHTML = frequentHtml;
    }

    updateRecentActivity() {
        const recent = this.history.slice(0, 5);
        const activityHtml = recent.length > 0
            ? recent.map(item => `<div>${item.drawDate} - Updated</div>`).join('')
            : 'No recent activity';
            
        document.getElementById('recent-activity').innerHTML = activityHtml;
    }

    // Settings
    changePassword() {
        const newPassword = document.getElementById('new-password').value;
        if (newPassword.length < 6) {
            this.showNotification('Password must be at least 6 characters!', 'error');
            return;
        }
        
        this.adminPassword = newPassword;
        localStorage.setItem('lottery_admin_password', newPassword);
        document.getElementById('new-password').value = '';
        this.showNotification('Password changed successfully!', 'success');
    }

    // Utilities
    updateLastUpdateTime() {
        const now = new Date().toLocaleString();
        document.getElementById('last-update').textContent = `Last update: ${now}`;
    }

    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.style.display = 'block';
        
        // Trigger animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Hide after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.style.display = 'none';
            }, 300);
        }, 3000);
    }
}

// Initialize the admin panel
document.addEventListener('DOMContentLoaded', () => {
    new LotteryAdmin();
});
