// Authentication Logic for Secret Santa
let supabase;

// Initialize Supabase
document.addEventListener('DOMContentLoaded', async () => {
    // Check if Supabase and config are available
    if (!window.supabase || typeof window.supabase.createClient !== 'function') {
        console.error('Supabase library not loaded');
        if (window.Toast) {
            Toast.error('Failed to load required libraries. Please refresh the page.');
        }
        return;
    }
    
    if (typeof SUPABASE_URL === 'undefined' || typeof SUPABASE_ANON_KEY === 'undefined') {
        console.error('Supabase configuration not loaded');
        if (window.Toast) {
            Toast.error('Configuration error. Please refresh the page.');
        }
        return;
    }
    
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Check for QR code join parameters in URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('join')) {
        const groupCode = urlParams.get('join');
        const groupPassword = urlParams.get('pwd');
        
        // Store in sessionStorage to use after login
        sessionStorage.setItem('pendingGroupJoin', JSON.stringify({
            code: groupCode,
            password: groupPassword
        }));
        
        // Show helpful message
        Toast.info(`You're joining group: ${groupCode}\n\nPlease sign in or create an account first!`, 6000);
    }
    
    // Check if user is already logged in
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        // Redirect to dashboard (where auto-join will happen)
        window.location.href = 'index.html';
        return;
    }
    
    // Setup event listeners
    setupAuthListeners();
});

// Setup Event Listeners
function setupAuthListeners() {
    // Sign In Form
    document.getElementById('signInForm').addEventListener('submit', handleSignIn);
    
    // Sign Up Form
    document.getElementById('signUpForm').addEventListener('submit', handleSignUp);
    
    // Forgot Password Form
    document.getElementById('forgotPasswordForm').addEventListener('submit', handleForgotPassword);
    
    // Navigation Links
    document.getElementById('showSignUp').addEventListener('click', (e) => {
        e.preventDefault();
        showPage('signUpPage');
    });
    
    document.getElementById('showSignIn').addEventListener('click', (e) => {
        e.preventDefault();
        showPage('signInPage');
    });
    
    document.getElementById('showForgotPassword').addEventListener('click', (e) => {
        e.preventDefault();
        showPage('forgotPasswordPage');
    });
    
    document.getElementById('backToSignIn').addEventListener('click', (e) => {
        e.preventDefault();
        showPage('signInPage');
    });
}

// Show specific page
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
}

// Handle Sign In
async function handleSignIn(e) {
    e.preventDefault();
    
    const email = document.getElementById('signInEmail').value.trim();
    const password = document.getElementById('signInPassword').value;
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) throw error;
        
        // Update analytics user type and user_id BEFORE tracking login event
        // This ensures user_id is set before the event fires for proper attribution
        if (window.Analytics) {
            Analytics.updateUserType(true, data.user.id);
            // Small delay to ensure user_id is set before event fires
            setTimeout(() => {
                Analytics.signIn();
            }, 100);
        }
        
        // Successful login - redirect to dashboard
        window.location.href = 'index.html';
        
    } catch (error) {
        console.error('Sign in error:', error);
        Toast.error('Error signing in: ' + error.message);
        Analytics.error('Sign in failed: ' + error.message, 'auth');
    }
}

// Handle Sign Up
async function handleSignUp(e) {
    e.preventDefault();
    
        const fullName = document.getElementById('signUpName').value.trim();
        const email = document.getElementById('signUpEmail').value.trim();
        const password = document.getElementById('signUpPassword').value;
        const musicConsent = document.getElementById('musicConsent').checked;
    const cookieConsent = document.getElementById('cookieConsent').checked;
    
    if (!cookieConsent) {
        Toast.warning('Please accept cookies to continue');
        return;
    }
    
    try {
        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName
                }
            }
        });
        
        if (authError) throw authError;
        
        // Wait a moment for auth session to fully establish
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Create user profile
        const { error: profileError } = await supabase
            .from('user_profiles')
            .insert([{
                id: authData.user.id,
                full_name: fullName,
                spouse_name: null,
                music_consent: musicConsent,
                email: authData.user.email
            }]);
        
        if (profileError) {
            console.error('Profile creation error:', profileError);
            // If profile creation fails, still let them continue
            // They can add profile info later
            console.log('Continuing without profile - user can update later');
        }
        
        // Store music consent in localStorage
        if (musicConsent) {
            localStorage.setItem('musicAutoplay', 'true');
        }
        
        // Store cookie consent
        localStorage.setItem('cookieConsent', 'true');
        
        Toast.success('Account created! Please check your email to verify your account.');
        Analytics.signUp();
        
        // If email confirmation is disabled, redirect to dashboard
        if (authData.session) {
            // Update analytics user type and user_id BEFORE tracking signup_completed
            // This ensures user_id is set before the conversion event fires
            Analytics.updateUserType(true, authData.user.id);
            // Small delay to ensure user_id is set before event fires
            setTimeout(() => {
                Analytics.signupCompleted();
            }, 100);
            window.location.href = 'index.html';
        } else {
            showPage('signInPage');
        }
        
    } catch (error) {
        console.error('Sign up error:', error);
        Toast.error('Error creating account: ' + error.message);
        Analytics.error('Sign up failed: ' + error.message, 'auth');
    }
}

// Handle Forgot Password
async function handleForgotPassword(e) {
    e.preventDefault();
    
    const email = document.getElementById('resetEmail').value.trim();
    
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/reset-password.html'
        });
        
        if (error) throw error;
        
        Toast.success('Password reset email sent! Please check your inbox.');
        showPage('signInPage');
        
    } catch (error) {
        console.error('Password reset error:', error);
        Toast.error('Error sending reset email: ' + error.message);
        Analytics.error('Password reset failed: ' + error.message, 'auth');
    }
}

