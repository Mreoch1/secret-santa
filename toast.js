/**
 * Toast Notification System
 * Professional alternative to alert() and confirm()
 */

class ToastManager {
    constructor() {
        this.container = null;
        this.init();
    }
    
    init() {
        // Create toast container if it doesn't exist
        if (!document.getElementById('toast-container')) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            this.container.setAttribute('aria-live', 'polite');
            this.container.setAttribute('aria-atomic', 'true');
            document.body.appendChild(this.container);
        } else {
            this.container = document.getElementById('toast-container');
        }
    }
    
    /**
     * Show a toast notification
     * @param {string} message - The message to display
     * @param {string} type - Type: 'success', 'error', 'warning', 'info'
     * @param {number} duration - Duration in ms (0 = permanent until closed)
     */
    show(message, type = 'info', duration = 4000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.setAttribute('role', 'alert');
        
        // Icon based on type
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        const icon = icons[type] || icons.info;
        
        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-message">${message}</div>
            <button class="toast-close" aria-label="Close notification">×</button>
        `;
        
        // Add close handler
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => this.remove(toast));
        
        // Add to container
        this.container.appendChild(toast);
        
        // Trigger animation
        setTimeout(() => toast.classList.add('toast-show'), 10);
        
        // Auto remove after duration
        if (duration > 0) {
            setTimeout(() => this.remove(toast), duration);
        }
        
        return toast;
    }
    
    remove(toast) {
        toast.classList.remove('toast-show');
        toast.classList.add('toast-hide');
        setTimeout(() => {
            if (toast.parentElement) {
                toast.parentElement.removeChild(toast);
            }
        }, 300);
    }
    
    success(message, duration = 4000) {
        return this.show(message, 'success', duration);
    }
    
    error(message, duration = 6000) {
        return this.show(message, 'error', duration);
    }
    
    warning(message, duration = 5000) {
        return this.show(message, 'warning', duration);
    }
    
    info(message, duration = 4000) {
        return this.show(message, 'info', duration);
    }
    
    /**
     * Show a confirmation dialog
     * Returns a Promise that resolves with true/false
     */
    confirm(message, title = 'Confirm Action') {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'toast-confirm-modal';
            modal.innerHTML = `
                <div class="toast-confirm-overlay"></div>
                <div class="toast-confirm-dialog" role="dialog" aria-labelledby="confirm-title" aria-describedby="confirm-message">
                    <h3 id="confirm-title">${title}</h3>
                    <p id="confirm-message">${message}</p>
                    <div class="toast-confirm-buttons">
                        <button class="toast-confirm-cancel" data-action="cancel">Cancel</button>
                        <button class="toast-confirm-ok" data-action="confirm" autofocus>Confirm</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Focus trap
            const dialog = modal.querySelector('.toast-confirm-dialog');
            const focusableElements = dialog.querySelectorAll('button');
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            
            // Handle button clicks
            const handleClick = (e) => {
                const action = e.target.dataset.action;
                if (action) {
                    modal.classList.add('toast-confirm-hide');
                    setTimeout(() => {
                        document.body.removeChild(modal);
                        resolve(action === 'confirm');
                    }, 200);
                }
            };
            
            modal.addEventListener('click', (e) => {
                if (e.target.classList.contains('toast-confirm-overlay')) {
                    handleClick({ target: { dataset: { action: 'cancel' }}});
                } else {
                    handleClick(e);
                }
            });
            
            // ESC key to cancel
            const handleEscape = (e) => {
                if (e.key === 'Escape') {
                    handleClick({ target: { dataset: { action: 'cancel' }}});
                    document.removeEventListener('keydown', handleEscape);
                }
            };
            document.addEventListener('keydown', handleEscape);
            
            // Tab focus trap
            dialog.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    if (e.shiftKey) {
                        if (document.activeElement === firstElement) {
                            e.preventDefault();
                            lastElement.focus();
                        }
                    } else {
                        if (document.activeElement === lastElement) {
                            e.preventDefault();
                            firstElement.focus();
                        }
                    }
                }
            });
            
            // Show animation
            setTimeout(() => modal.classList.add('toast-confirm-show'), 10);
            
            // Auto focus confirm button
            setTimeout(() => {
                const confirmBtn = modal.querySelector('.toast-confirm-ok');
                if (confirmBtn) confirmBtn.focus();
            }, 100);
        });
    }
    
    /**
     * Show a prompt dialog
     * Returns a Promise that resolves with the input value or null if cancelled
     */
    prompt(message, defaultValue = '', title = 'Enter Value') {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'toast-confirm-modal';
            modal.innerHTML = `
                <div class="toast-confirm-overlay"></div>
                <div class="toast-confirm-dialog" role="dialog" aria-labelledby="prompt-title">
                    <h3 id="prompt-title">${title}</h3>
                    <p>${message}</p>
                    <input type="text" class="toast-prompt-input" value="${defaultValue}" autofocus>
                    <div class="toast-confirm-buttons">
                        <button class="toast-confirm-cancel" data-action="cancel">Cancel</button>
                        <button class="toast-confirm-ok" data-action="confirm">OK</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            const input = modal.querySelector('.toast-prompt-input');
            input.select();
            
            const handleClick = (e) => {
                const action = e.target.dataset.action;
                if (action) {
                    const value = action === 'confirm' ? input.value : null;
                    modal.classList.add('toast-confirm-hide');
                    setTimeout(() => {
                        document.body.removeChild(modal);
                        resolve(value);
                    }, 200);
                }
            };
            
            modal.addEventListener('click', (e) => {
                if (e.target.classList.contains('toast-confirm-overlay')) {
                    handleClick({ target: { dataset: { action: 'cancel' }}});
                } else {
                    handleClick(e);
                }
            });
            
            // Enter to confirm, ESC to cancel
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleClick({ target: { dataset: { action: 'confirm' }}});
                } else if (e.key === 'Escape') {
                    handleClick({ target: { dataset: { action: 'cancel' }}});
                }
            });
            
            setTimeout(() => modal.classList.add('toast-confirm-show'), 10);
        });
    }
    
    /**
     * Loading toast - shows until manually closed
     */
    loading(message = 'Loading...') {
        const toast = this.show(message, 'info', 0);
        toast.classList.add('toast-loading');
        return {
            close: () => this.remove(toast),
            update: (newMessage) => {
                const messageEl = toast.querySelector('.toast-message');
                if (messageEl) messageEl.textContent = newMessage;
            }
        };
    }
}

// Initialize toast manager
const Toast = new ToastManager();

// Export to window
window.Toast = Toast;

// Backward compatibility - create wrapper functions
window.toast = {
    show: (msg, type, duration) => Toast.show(msg, type, duration),
    success: (msg, duration) => Toast.success(msg, duration),
    error: (msg, duration) => Toast.error(msg, duration),
    warning: (msg, duration) => Toast.warning(msg, duration),
    info: (msg, duration) => Toast.info(msg, duration),
    confirm: (msg, title) => Toast.confirm(msg, title),
    prompt: (msg, defaultVal, title) => Toast.prompt(msg, defaultVal, title),
    loading: (msg) => Toast.loading(msg)
};

