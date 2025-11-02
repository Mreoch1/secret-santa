// Google Analytics 4 Configuration
// Replace G-XXXXXXXXXX with your actual GA4 Measurement ID

(function() {
    // GA4 Measurement ID - UPDATE THIS WITH YOUR ACTUAL ID
    const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // TODO: Replace with real ID
    
    // Only load analytics in production
    const isProduction = window.location.hostname === 'holidaydrawnames.com';
    
    if (isProduction) {
        // Load Google Analytics script
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
        document.head.appendChild(script);
        
        // Initialize Google Analytics
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', GA_MEASUREMENT_ID, {
            'anonymize_ip': true, // GDPR compliance
            'cookie_flags': 'SameSite=None;Secure'
        });
        
        // Make gtag globally available
        window.gtag = gtag;
        
        console.log('📊 Analytics loaded');
    } else {
        console.log('📊 Analytics disabled (not production)');
        // Mock gtag for development
        window.gtag = function() {
            console.log('Analytics event:', arguments);
        };
    }
})();

// Custom event tracking helpers
const Analytics = {
    // Track page views
    pageView: function(pageName) {
        if (window.gtag) {
            gtag('event', 'page_view', {
                page_title: pageName,
                page_location: window.location.href,
                page_path: window.location.pathname
            });
        }
    },
    
    // Track user sign up
    signUp: function(method = 'email') {
        if (window.gtag) {
            gtag('event', 'sign_up', {
                method: method
            });
        }
    },
    
    // Track user sign in
    signIn: function(method = 'email') {
        if (window.gtag) {
            gtag('event', 'login', {
                method: method
            });
        }
    },
    
    // Track group creation
    createGroup: function(groupCode) {
        if (window.gtag) {
            gtag('event', 'create_group', {
                event_category: 'engagement',
                event_label: 'Group Created',
                value: 1
            });
        }
    },
    
    // Track joining a group
    joinGroup: function() {
        if (window.gtag) {
            gtag('event', 'join_group', {
                event_category: 'engagement',
                event_label: 'Joined Group',
                value: 1
            });
        }
    },
    
    // Track name draw
    drawNames: function(participantCount) {
        if (window.gtag) {
            gtag('event', 'draw_names', {
                event_category: 'engagement',
                event_label: 'Names Drawn',
                value: participantCount
            });
        }
    },
    
    // Track email sent
    sendEmail: function(type) {
        if (window.gtag) {
            gtag('event', 'send_email', {
                event_category: 'communication',
                event_label: type, // 'invite' or 'assignment'
                value: 1
            });
        }
    },
    
    // Track errors
    error: function(errorMessage, errorContext) {
        if (window.gtag) {
            gtag('event', 'exception', {
                description: errorMessage,
                fatal: false,
                event_category: 'error',
                event_label: errorContext
            });
        }
    },
    
    // Track custom events
    event: function(eventName, params = {}) {
        if (window.gtag) {
            gtag('event', eventName, params);
        }
    }
};

// Export to window
window.Analytics = Analytics;

