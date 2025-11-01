// Authentication Logic for Secret Santa
let supabase;

// Initialize Supabase
document.addEventListener('DOMContentLoaded', async () => {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Check if user is already logged in
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        // Redirect to dashboard
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
        
        // Successful login - redirect to dashboard
        window.location.href = 'index.html';
        
    } catch (error) {
        console.error('Sign in error:', error);
        alert('Error signing in: ' + error.message);
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
        alert('Please accept cookies to continue');
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
        
        alert('Account created! Please check your email to verify your account.');
        
        // If email confirmation is disabled, redirect to dashboard
        if (authData.session) {
            window.location.href = 'index.html';
        } else {
            showPage('signInPage');
        }
        
    } catch (error) {
        console.error('Sign up error:', error);
        alert('Error creating account: ' + error.message);
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
        
        alert('Password reset email sent! Please check your inbox.');
        showPage('signInPage');
        
    } catch (error) {
        console.error('Password reset error:', error);
        alert('Error sending reset email: ' + error.message);
    }
}

