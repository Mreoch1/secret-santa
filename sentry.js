/**
 * Sentry Error Monitoring
 * Catches and reports production errors
 */

(function() {
    // Sentry DSN - UPDATE THIS with your actual Sentry project DSN
    // Get it from: https://sentry.io/settings/projects/YOUR-PROJECT/keys/
    const SENTRY_DSN = 'https://YOUR-DSN-HERE@sentry.io/YOUR-PROJECT-ID';
    
    // Only load Sentry in production
    const isProduction = window.location.hostname === 'holidaydrawnames.com';
    
    if (isProduction && SENTRY_DSN.includes('YOUR-DSN')) {
        console.log('🐛 Sentry: DSN not configured yet. Skipping...');
        // Create mock Sentry for development
        window.Sentry = {
            captureException: (error) => console.error('Sentry (mock):', error),
            captureMessage: (msg) => console.log('Sentry (mock):', msg)
        };
        return;
    }
    
    if (isProduction) {
        // Load Sentry script
        const script = document.createElement('script');
        script.src = 'https://browser.sentry-cdn.com/7.91.0/bundle.min.js';
        script.crossOrigin = 'anonymous';
        script.onload = function() {
            if (window.Sentry) {
                Sentry.init({
                    dsn: SENTRY_DSN,
                    integrations: [
                        new Sentry.BrowserTracing(),
                        new Sentry.Replay()
                    ],
                    // Performance Monitoring
                    tracesSampleRate: 0.1, // 10% of transactions
                    
                    // Session Replay
                    replaysSessionSampleRate: 0.1, // 10% of sessions
                    replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
                    
                    environment: 'production',
                    
                    // Add custom context
                    beforeSend(event, hint) {
                        // Add user context if available
                        if (window.currentUser) {
                            event.user = {
                                id: window.currentUser.id,
                                email: window.currentUser.email
                            };
                        }
                        
                        // Add custom tags
                        event.tags = event.tags || {};
                        event.tags.page = window.location.pathname;
                        
                        return event;
                    },
                    
                    // Don't send errors from browser extensions
                    ignoreErrors: [
                        'top.GLOBALS',
                        'chrome-extension://',
                        'moz-extension://'
                    ]
                });
                
                console.log('🐛 Sentry error monitoring active');
            }
        };
        script.onerror = function() {
            console.error('Failed to load Sentry');
        };
        document.head.appendChild(script);
    } else {
        console.log('🐛 Sentry: disabled (not production)');
        // Create mock Sentry for development
        window.Sentry = {
            captureException: (error) => console.error('Sentry (dev mode):', error),
            captureMessage: (msg) => console.log('Sentry (dev mode):', msg)
        };
    }
})();

// Helper function to report errors
window.reportError = function(error, context = {}) {
    console.error('Error:', error);
    
    if (window.Sentry) {
        Sentry.captureException(error, {
            extra: context
        });
    }
    
    if (window.Analytics) {
        Analytics.error(error.message || String(error), context.area || 'unknown');
    }
};

