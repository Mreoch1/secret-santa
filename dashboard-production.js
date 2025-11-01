// Production version of dashboard.js with environment detection
// Automatically uses correct email endpoint based on environment

// Detect environment and set email endpoint
function getEmailEndpoint() {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        // Local development - use Python proxy
        return 'http://localhost:5001/send-email';
    } else {
        // Production - use Netlify Function
        return '/.netlify/functions/send-email';
    }
}

// Store this globally for use in email sending
window.EMAIL_ENDPOINT = getEmailEndpoint();

console.log('📧 Email endpoint:', window.EMAIL_ENDPOINT);

