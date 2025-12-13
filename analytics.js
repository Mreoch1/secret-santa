// Google Analytics 4 Configuration
// Replace G-XXXXXXXXXX with your actual GA4 Measurement ID

(function() {
    // GA4 Measurement ID - ACTIVE
    const GA_MEASUREMENT_ID = 'G-YS64XMF8QX'; // Your Google Analytics ID
    
    // Only load analytics in production
    const isProduction = window.location.hostname === 'holidaydrawnames.com';
    
    // Helper to get device type
    function getDeviceType() {
        return /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop';
    }
    
    // Helper to get user type (logged_in vs anonymous)
    // This will be updated dynamically when user logs in/out
    function getUserType() {
        // Check if we have a Supabase session
        if (window.supabase && typeof window.supabase.createClient === 'function') {
            try {
                // Try to get session synchronously (will be async in practice)
                // For now, default to anonymous - will be updated on auth events
                return 'anonymous';
            } catch (e) {
                return 'anonymous';
            }
        }
        return 'anonymous';
    }
    
    // Helper to enrich event params with device_type and user_type
    function enrichEventParams(params = {}) {
        return {
            ...params,
            device_type: getDeviceType(),
            user_type: getUserType()
        };
    }
    
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
            'cookie_flags': 'SameSite=None;Secure',
            'send_page_view': true
        });
        
        // Set user property for device type (optional - also sent as event param)
        gtag('set', { 'user_properties': {
            'device_type': getDeviceType()
        }});
        
        // Make gtag globally available
        window.gtag = gtag;
        
        // Store helper functions globally for use in Analytics object
        window._analyticsHelpers = {
            enrichEventParams: enrichEventParams,
            getUserType: getUserType,
            getDeviceType: getDeviceType
        };
        
        console.log('📊 Analytics loaded');
    } else {
        console.log('📊 Analytics disabled (not production)');
        // Mock gtag for development
        window.gtag = function() {
            console.log('Analytics event:', arguments);
        };
        
        // Mock helpers for development
        window._analyticsHelpers = {
            enrichEventParams: enrichEventParams,
            getUserType: getUserType,
            getDeviceType: getDeviceType
        };
    }
})();

// Custom event tracking helpers
const Analytics = {
    // Helper to enrich params with device_type and user_type
    _enrichParams: function(params = {}) {
        if (window._analyticsHelpers) {
            return window._analyticsHelpers.enrichEventParams(params);
        }
        return params;
    },
    
    // Update user type when auth state changes
    updateUserType: function(isLoggedIn) {
        if (window.gtag && window._analyticsHelpers) {
            const userType = isLoggedIn ? 'logged_in' : 'anonymous';
            gtag('set', { 'user_properties': {
                'user_type': userType
            }});
            // Update the helper function's return value
            window._analyticsHelpers.getUserType = () => userType;
        }
    },
    
    // Track page views
    pageView: function(pageName) {
        if (window.gtag) {
            gtag('event', 'page_view', this._enrichParams({
                page_title: pageName,
                page_location: window.location.href,
                page_path: window.location.pathname
            }));
        }
    },
    
    // Track user sign up
    signUp: function(method = 'email') {
        if (window.gtag) {
            gtag('event', 'sign_up', this._enrichParams({
                method: method
            }));
        }
    },
    
    // Track user sign in
    signIn: function(method = 'email') {
        if (window.gtag) {
            // Update user type to logged_in
            this.updateUserType(true);
            gtag('event', 'login', this._enrichParams({
                method: method
            }));
        }
    },
    
    // Track group creation
    createGroup: function(groupCode) {
        if (window.gtag) {
            gtag('event', 'create_group', this._enrichParams({
                event_category: 'engagement',
                event_label: 'Group Created',
                value: 1,
                group_code: groupCode || null
            }));
        }
    },
    
    // Track joining a group
    joinGroup: function() {
        if (window.gtag) {
            gtag('event', 'join_group', this._enrichParams({
                event_category: 'engagement',
                event_label: 'Joined Group',
                value: 1
            }));
        }
    },
    
    // Track name draw
    drawNames: function(participantCount) {
        if (window.gtag) {
            gtag('event', 'draw_names', this._enrichParams({
                event_category: 'engagement',
                event_label: 'Names Drawn',
                value: participantCount,
                participant_count: participantCount
            }));
        }
    },
    
    // Track email sent
    sendEmail: function(type) {
        if (window.gtag) {
            gtag('event', 'send_email', this._enrichParams({
                event_category: 'communication',
                event_label: type, // 'invite' or 'assignment'
                value: 1,
                email_type: type
            }));
        }
    },
    
    // Track invite sent (specific event for invites)
    inviteSent: function(count = 1) {
        if (window.gtag) {
            gtag('event', 'invite_sent', this._enrichParams({
                event_category: 'engagement',
                event_label: 'Invite Sent',
                value: count,
                invite_count: count
            }));
        }
    },
    
    // Track signup completion (after email verification or session creation)
    signupCompleted: function() {
        if (window.gtag) {
            // Update user type to logged_in
            this.updateUserType(true);
            gtag('event', 'signup_completed', this._enrichParams({
                event_category: 'conversion',
                event_label: 'Signup Completed',
                value: 1
            }));
        }
    },
    
    // Track errors
    error: function(errorMessage, errorContext) {
        if (window.gtag) {
            gtag('event', 'exception', this._enrichParams({
                description: errorMessage,
                fatal: false,
                event_category: 'error',
                event_label: errorContext
            }));
        }
    },
    
    // Track custom events
    event: function(eventName, params = {}) {
        if (window.gtag) {
            gtag('event', eventName, this._enrichParams(params));
        }
    }
};

// Export to window
window.Analytics = Analytics;

