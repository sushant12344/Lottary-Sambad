// Loading Utilities for Lottery Website
class LoadingManager {
    constructor() {
        this.activeLoaders = new Set();
        this.init();
    }

    init() {
        // Create main loading overlay if it doesn't exist
        if (!document.getElementById('main-loading-overlay')) {
            this.createMainLoadingOverlay();
        }
    }

    createMainLoadingOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'main-loading-overlay';
        overlay.className = 'loading-overlay';
        
        overlay.innerHTML = `
            <div class="loading-spinner">
                <div class="lottery-balls">
                    <div class="lottery-ball"></div>
                    <div class="lottery-ball"></div>
                    <div class="lottery-ball"></div>
                    <div class="lottery-ball"></div>
                    <div class="lottery-ball"></div>
                </div>
            </div>
            <div class="loading-text">Loading Lottery Results...</div>
            <div class="loading-subtext">Please wait while we fetch the latest data</div>
            <div class="loading-progress">
                <div class="progress-bar"></div>
            </div>
        `;
        
        document.body.appendChild(overlay);
    }

    // Show main loading overlay
    showMainLoading(text = 'Loading Lottery Results...', subtext = 'Please wait while we fetch the latest data') {
        const overlay = document.getElementById('main-loading-overlay');
        const textElement = overlay.querySelector('.loading-text');
        const subtextElement = overlay.querySelector('.loading-subtext');
        
        if (textElement) textElement.textContent = text;
        if (subtextElement) subtextElement.textContent = subtext;
        
        overlay.classList.add('active');
        this.activeLoaders.add('main');
    }

    // Hide main loading overlay
    hideMainLoading() {
        const overlay = document.getElementById('main-loading-overlay');
        overlay.classList.remove('active');
        this.activeLoaders.delete('main');
    }

    // Show loading for a specific element
    showElementLoading(elementId, type = 'spinner') {
        const element = document.getElementById(elementId);
        if (!element) return;

        element.classList.add('loading');
        this.activeLoaders.add(elementId);

        if (type === 'skeleton') {
            this.applySkeletonLoading(element);
        }
    }

    // Hide loading for a specific element
    hideElementLoading(elementId) {
        const element = document.getElementById(elementId);
        if (!element) return;

        element.classList.remove('loading');
        this.activeLoaders.delete(elementId);
        
        // Remove skeleton loading if applied
        this.removeSkeletonLoading(element);
    }

    // Apply skeleton loading to prize numbers
    applySkeletonLoading(container) {
        const originalContent = container.innerHTML;
        container.setAttribute('data-original-content', originalContent);
        
        let skeletonHTML = '';
        
        // First prize skeleton
        skeletonHTML += '<div class="skeleton-loader skeleton-first-prize"></div>';
        
        // Other prizes skeleton
        for (let i = 0; i < 10; i++) {
            skeletonHTML += '<div class="skeleton-loader skeleton-prize-number"></div>';
        }
        
        container.innerHTML = `<div class="skeleton-container">${skeletonHTML}</div>`;
    }

    // Remove skeleton loading and restore original content
    removeSkeletonLoading(container) {
        const originalContent = container.getAttribute('data-original-content');
        if (originalContent) {
            container.innerHTML = originalContent;
            container.removeAttribute('data-original-content');
        }
    }

    // Show button loading state
    showButtonLoading(buttonElement, originalText) {
        buttonElement.classList.add('btn-loading');
        buttonElement.setAttribute('data-original-text', originalText || buttonElement.textContent);
        buttonElement.textContent = 'Loading...';
        buttonElement.disabled = true;
    }

    // Hide button loading state
    hideButtonLoading(buttonElement) {
        buttonElement.classList.remove('btn-loading');
        const originalText = buttonElement.getAttribute('data-original-text');
        if (originalText) {
            buttonElement.textContent = originalText;
            buttonElement.removeAttribute('data-original-text');
        }
        buttonElement.disabled = false;
    }

    // Show success animation
    showSuccess(message = 'Success!', duration = 3000) {
        this.showNotification(message, 'success', duration);
    }

    // Show error animation
    showError(message = 'Something went wrong!', duration = 5000) {
        this.showNotification(message, 'error', duration);
    }

    // Generic notification system
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        `;

        // Set background color based on type
        switch (type) {
            case 'success':
                notification.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
                notification.innerHTML = `<div class="success-animation"><div class="success-checkmark"></div></div>${message}`;
                break;
            case 'error':
                notification.style.background = 'linear-gradient(135deg, #dc3545, #e74c3c)';
                notification.innerHTML = `<div class="error-animation"><div class="error-cross"></div></div>${message}`;
                break;
            default:
                notification.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
                notification.innerHTML = message;
        }

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Auto remove
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    }

    // Show ticket checking animation
    showTicketCheck(container) {
        container.classList.add('ticket-checking');
        this.activeLoaders.add('ticket-check');
    }

    // Hide ticket checking animation
    hideTicketCheck(container) {
        container.classList.remove('ticket-checking');
        this.activeLoaders.delete('ticket-check');
    }

    // Create number rolling effect
    createNumberRolling(container, finalNumbers, duration = 2000) {
        const rollers = [];
        container.innerHTML = '';

        finalNumbers.forEach((number, index) => {
            const roller = document.createElement('div');
            roller.className = 'number-roller';
            
            const rollContent = document.createElement('div');
            rollContent.className = 'number-roll';
            rollContent.textContent = '0';
            
            roller.appendChild(rollContent);
            container.appendChild(roller);
            rollers.push({ element: rollContent, finalNumber: number });
        });

        // Animate number rolling
        rollers.forEach((roller, index) => {
            const delay = index * 200; // Stagger the animations
            
            setTimeout(() => {
                let currentNumber = 0;
                const interval = setInterval(() => {
                    currentNumber = Math.floor(Math.random() * 100);
                    roller.element.textContent = currentNumber.toString().padStart(2, '0');
                }, 50);

                setTimeout(() => {
                    clearInterval(interval);
                    roller.element.textContent = roller.finalNumber.toString().padStart(2, '0');
                    roller.element.style.color = '#28a745';
                    roller.element.style.transform = 'scale(1.1)';
                    
                    setTimeout(() => {
                        roller.element.style.transform = 'scale(1)';
                    }, 200);
                }, duration - delay);
            }, delay);
        });
    }

    // Utility to wrap async operations with loading
    async withLoading(operation, options = {}) {
        const {
            mainLoading = false,
            elementId = null,
            buttonElement = null,
            loadingText = 'Loading...',
            successMessage = null,
            errorMessage = 'Operation failed'
        } = options;

        try {
            // Show appropriate loading states
            if (mainLoading) {
                this.showMainLoading(loadingText);
            }
            
            if (elementId) {
                this.showElementLoading(elementId);
            }
            
            if (buttonElement) {
                this.showButtonLoading(buttonElement);
            }

            // Execute the operation
            const result = await operation();

            // Show success if configured
            if (successMessage) {
                this.showSuccess(successMessage);
            }

            return result;

        } catch (error) {
            console.error('Operation failed:', error);
            this.showError(errorMessage);
            throw error;
        } finally {
            // Hide loading states
            if (mainLoading) {
                this.hideMainLoading();
            }
            
            if (elementId) {
                this.hideElementLoading(elementId);
            }
            
            if (buttonElement) {
                this.hideButtonLoading(buttonElement);
            }
        }
    }

    // Check if any loaders are active
    hasActiveLoaders() {
        return this.activeLoaders.size > 0;
    }

    // Get list of active loaders
    getActiveLoaders() {
        return Array.from(this.activeLoaders);
    }

    // Hide all active loaders (emergency cleanup)
    hideAllLoaders() {
        this.hideMainLoading();
        this.activeLoaders.forEach(loaderId => {
            if (loaderId !== 'main') {
                this.hideElementLoading(loaderId);
            }
        });
        this.activeLoaders.clear();
    }
}

// Utility functions for common loading scenarios
const LoadingUtils = {
    // Simulate loading delay (for testing)
    delay: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

    // Format loading time remaining
    formatTimeRemaining: (milliseconds) => {
        const seconds = Math.ceil(milliseconds / 1000);
        if (seconds < 60) return `${seconds}s remaining`;
        const minutes = Math.ceil(seconds / 60);
        return `${minutes}m remaining`;
    },

    // Create loading dots animation
    createLoadingDots: (container, count = 3) => {
        container.innerHTML = '';
        container.className = 'pulse-loader';
        
        for (let i = 0; i < count; i++) {
            const dot = document.createElement('div');
            dot.className = 'pulse-dot';
            container.appendChild(dot);
        }
    },

    // Progressive loading for large datasets
    progressiveLoad: async (items, processor, batchSize = 10, progressCallback = null) => {
        const results = [];
        const total = items.length;
        
        for (let i = 0; i < total; i += batchSize) {
            const batch = items.slice(i, i + batchSize);
            const batchResults = await Promise.all(batch.map(processor));
            results.push(...batchResults);
            
            if (progressCallback) {
                const progress = Math.min(100, Math.round(((i + batchSize) / total) * 100));
                progressCallback(progress, i + batchSize, total);
            }
            
            // Small delay to prevent blocking the UI
            await LoadingUtils.delay(10);
        }
        
        return results;
    }
};

// Initialize loading manager when DOM is ready
let loadingManager;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        loadingManager = new LoadingManager();
    });
} else {
    loadingManager = new LoadingManager();
}

// Global access to loading manager
window.LoadingManager = loadingManager;
window.LoadingUtils = LoadingUtils;

// Example usage functions (can be removed in production)
function demonstrateLoadingEffects() {
    console.log('Loading effects demonstration started');
    
    // Show main loading
    loadingManager.showMainLoading('Fetching lottery results...', 'This may take a few moments');
    
    setTimeout(() => {
        loadingManager.hideMainLoading();
        loadingManager.showSuccess('Lottery results loaded successfully!');
    }, 3000);
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LoadingManager, LoadingUtils };
}
