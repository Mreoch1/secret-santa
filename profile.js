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
        document.getElementById('spouseName').value = profile.spouse_name || '';
        document.getElementById('email').value = profile.email || currentUser.email;
        
    } catch (error) {
        console.error('Error loading profile:', error);
        alert('Error loading profile. Please refresh the page.');
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
    const spouseName = document.getElementById('spouseName').value.trim() || null;
    
    if (!fullName) {
        alert('Please enter your full name');
        return;
    }
    
    try {
        const { error } = await supabase
            .from('user_profiles')
            .update({
                full_name: fullName,
                spouse_name: spouseName,
                updated_at: new Date().toISOString()
            })
            .eq('id', currentUser.id);
        
        if (error) throw error;
        
        alert('✅ Profile updated successfully!');
        
        // Optionally redirect back to dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
        
    } catch (error) {
        console.error('Error updating profile:', error);
        alert('Error updating profile: ' + error.message);
    }
}

// Handle Delete Account
async function handleDeleteAccount() {
    const confirmation = prompt(
        '⚠️ DELETE YOUR ACCOUNT?\n\n' +
        'This will PERMANENTLY:\n' +
        '• Delete your account\n' +
        '• Remove you from ALL groups\n' +
        '• Delete all your data\n\n' +
        'This CANNOT be undone!\n\n' +
        'Type "DELETE" to confirm:'
    );
    
    if (confirmation !== 'DELETE') {
        if (confirmation !== null) {
            alert('Account deletion cancelled.');
        }
        return;
    }
    
    try {
        // 1. Remove from all participants
        const { error: participantsError } = await supabase
            .from('participants')
            .delete()
            .eq('user_id', currentUser.id);
        
        if (participantsError) {
            console.error('Error removing from groups:', participantsError);
        }
        
        // 2. Delete profile
        const { error: profileError } = await supabase
            .from('user_profiles')
            .delete()
            .eq('id', currentUser.id);
        
        if (profileError) {
            console.error('Error deleting profile:', profileError);
        }
        
        // 3. Delete auth user
        const { error: authError } = await supabase.auth.admin.deleteUser(currentUser.id);
        
        if (authError) {
            console.error('Error deleting auth user:', authError);
            alert('Error deleting account: ' + authError.message);
            return;
        }
        
        // 4. Sign out
        await supabase.auth.signOut();
        
        alert('✅ Your account has been deleted.');
        
        // Redirect to home
        window.location.href = 'index.html';
        
    } catch (error) {
        console.error('Error deleting account:', error);
        alert('Error deleting account: ' + error.message);
    }
}

