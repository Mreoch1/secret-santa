// Support Ticket Form Handler
let supabase;

// Initialize Supabase client
async function initSupport() {
    // Check if Supabase is available
    if (!window.supabase || typeof window.supabase.createClient !== 'function') {
        console.error('Supabase not loaded');
        Toast.error('Failed to load. Please refresh the page.');
        return;
    }

    // Check if config is loaded
    if (typeof SUPABASE_URL === 'undefined' || typeof SUPABASE_ANON_KEY === 'undefined') {
        console.error('Supabase config not loaded');
        Toast.error('Configuration error. Please refresh the page.');
        return;
    }

    try {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        // Try to get current user (optional - support can be submitted without login)
        const { data: { session } } = await supabase.auth.getSession();
        
        // If user is logged in, pre-fill email and name
        if (session) {
            const { data: profile } = await supabase
                .from('user_profiles')
                .select('full_name, email')
                .eq('user_id', session.user.id)
                .single();
            
            if (profile) {
                const emailInput = document.getElementById('supportEmail');
                const nameInput = document.getElementById('supportName');
                
                if (emailInput && profile.email) {
                    emailInput.value = profile.email;
                }
                if (nameInput && profile.full_name) {
                    nameInput.value = profile.full_name;
                }
            }
        }
    } catch (error) {
        console.error('Error initializing support:', error);
        // Continue anyway - support form can work without auth
    }

    // Set up form handler
    const form = document.getElementById('supportForm');
    if (form) {
        form.addEventListener('submit', handleSupportSubmit);
    }
}

// Handle support form submission
async function handleSupportSubmit(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const form = document.getElementById('supportForm');
    const successMessage = document.getElementById('successMessage');
    
    // Get form data
    const name = document.getElementById('supportName').value.trim();
    const email = document.getElementById('supportEmail').value.trim();
    const groupCode = document.getElementById('supportGroupCode').value.trim();
    const message = document.getElementById('supportMessage').value.trim();
    
    // Validate
    if (!name || !email || !message) {
        Toast.error('Please fill in all required fields.');
        return;
    }
    
    if (!email.includes('@')) {
        Toast.error('Please enter a valid email address.');
        return;
    }
    
    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    
    try {
        // Get current user if logged in
        let userId = null;
        if (supabase) {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                userId = session.user.id;
            }
        }
        
        // Look up group_id from group_code if provided
        let groupId = null;
        if (groupCode && supabase) {
            try {
                const { data: group } = await supabase
                    .from('groups')
                    .select('id')
                    .eq('group_code', groupCode.toUpperCase())
                    .single();
                
                if (group) {
                    groupId = group.id;
                }
            } catch (error) {
                // Group not found or error - continue without group_id
                console.log('Group not found for code:', groupCode);
            }
        }
        
        // Create support ticket
        // Note: We need to use the anon key which allows INSERT for support_tickets
        const ticketData = {
            name: name,
            email: email,
            group_code: groupCode || null,
            group_id: groupId,
            message: message,
            user_id: userId,
            status: 'open'
        };
        
        const { data, error } = await supabase
            .from('support_tickets')
            .insert([ticketData])
            .select()
            .single();
        
        if (error) {
            throw error;
        }
        
        // Success!
        Toast.success('Support ticket submitted successfully! We\'ll get back to you soon.');
        
        // Hide form and show success message
        form.classList.add('hidden');
        successMessage.classList.remove('hidden');
        
        // Track analytics event
        if (window.Analytics) {
            Analytics.event('support_ticket_created', {
                event_category: 'support',
                event_label: 'Support Ticket Submitted'
            });
        }
        
    } catch (error) {
        console.error('Error submitting support ticket:', error);
        Toast.error('Failed to submit support ticket. Please try again or email us directly at mreoch82@hotmail.com');
        
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Support Ticket 🎁';
    }
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSupport);
} else {
    initSupport();
}

