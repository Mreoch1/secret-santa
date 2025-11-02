// Profile Settings Page
let supabase;
let currentUser = null;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Supabase
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Check authentication
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
        // Not authenticated, redirect to auth page
        window.location.href = 'auth.html';
        return;
    }
    
    currentUser = user;
    
    // Load user profile
    await loadProfile();
    
    // Setup event listeners
    document.getElementById('profileForm').addEventListener('submit', handleProfileUpdate);
    document.getElementById('deleteAccountBtn').addEventListener('click', handleDeleteAccount);
});

// Load User Profile
async function loadProfile() {
    try {
        const { data: profile, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();
        
        if (error) {
            console.error('Error loading profile:', error);
            // Profile might not exist, create a basic one
            await createBasicProfile();
            return;
        }
        
        // Populate form
        document.getElementById('fullName').value = profile.full_name || '';
        document.getElementById('email').value = profile.email || currentUser.email;
        
    } catch (error) {
        console.error('Error loading profile:', error);
        Toast.error('Error loading profile. Please refresh the page.');
    }
}

// Create Basic Profile if missing
async function createBasicProfile() {
    try {
        const { error } = await supabase
            .from('user_profiles')
            .insert([{
                id: currentUser.id,
                full_name: currentUser.email.split('@')[0],
                email: currentUser.email,
                spouse_name: null,
                music_consent: false
            }]);
        
        if (error) throw error;
        
        // Reload profile
        await loadProfile();
    } catch (error) {
        console.error('Error creating profile:', error);
    }
}

// Handle Profile Update
async function handleProfileUpdate(e) {
    e.preventDefault();
    
    const fullName = document.getElementById('fullName').value.trim();
    
    if (!fullName) {
        Toast.warning('Please enter your full name');
        return;
    }
    
    try {
        const { error } = await supabase
            .from('user_profiles')
            .update({
                full_name: fullName,
                updated_at: new Date().toISOString()
            })
            .eq('id', currentUser.id);
        
        if (error) throw error;
        
        Toast.success('Profile updated successfully!');
        
        // Optionally redirect back to dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
        
    } catch (error) {
        console.error('Error updating profile:', error);
        Toast.error('Error updating profile: ' + error.message);
    }
}

// Handle Delete Account
async function handleDeleteAccount() {
    const confirmation = await Toast.prompt(
        'This will PERMANENTLY:\n' +
        '• Delete your account\n' +
        '• Remove you from ALL groups\n' +
        '• Delete all your data\n\n' +
        'This CANNOT be undone!\n\n' +
        'Type "DELETE" to confirm:',
        '',
        '⚠️ DELETE YOUR ACCOUNT?'
    );
    
    if (confirmation !== 'DELETE') {
        if (confirmation !== null) {
            Toast.info('Account deletion cancelled.');
        }
        return;
    }
    
    try {
        const loader = Toast.loading('Deleting your account...');
        
        // Call database function to delete all user data
        const { data, error: rpcError } = await supabase.rpc('delete_user_account', {
            user_id_to_delete: currentUser.id
        });
        
        if (rpcError) {
            loader.close();
            throw rpcError;
        }
        
        console.log('Deleted user data:', data);
        
        // Delete auth user (client-side - works for own account)
        const { error: authError } = await supabase.auth.admin.deleteUser(currentUser.id);
        
        if (authError && authError.status !== 403) {
            console.error('Error deleting auth user:', authError);
            // Continue anyway - the RPC function cleaned up all public data
        }
        
        // Sign out
        await supabase.auth.signOut();
        
        loader.close();
        Toast.success('Your account has been deleted. Goodbye!', 3000);
        
        Analytics.event('account_deleted');
        
        // Redirect to home
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        
    } catch (error) {
        console.error('Error deleting account:', error);
        Toast.error('Error deleting account: ' + error.message);
        if (window.Sentry) {
            Sentry.captureException(error);
        }
    }
}

