/**
 * Quick Start Test Script
 * Run this in browser console on dashboard.html
 * 
 * Usage:
 * 1. Open https://holidaydrawnames.com/dashboard.html
 * 2. Open console (F12)
 * 3. Copy and paste this entire file
 * 4. Run: await quickTest()
 */

async function quickTest() {
    console.log('🚀 Starting Quick Test...\n');
    
    if (!window.supabase || typeof SUPABASE_URL === 'undefined') {
        console.error('❌ Supabase not loaded. Please refresh the page.');
        return;
    }
    
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
        console.error('❌ Not logged in. Please sign in first.');
        return;
    }
    
    console.log('✅ Logged in as:', session.user.email);
    
    // Test 1: Create Group
    console.log('\n📝 Test 1: Creating test group...');
    const groupCode = 'TEST' + Date.now().toString().slice(-6);
    const groupPassword = 'Test123';
    
    try {
        const { data: group, error } = await supabase
            .from('groups')
            .insert([{
                group_code: groupCode,
                group_password: groupPassword,
                is_drawn: false,
                budget_min: 20,
                budget_max: 50
            }])
            .select()
            .single();
        
        if (error) throw error;
        
        console.log('✅ Group created:', groupCode);
        
        // Add creator
        const { data: participant, error: pError } = await supabase
            .from('participants')
            .insert([{
                group_id: group.id,
                user_id: session.user.id
            }])
            .select()
            .single();
        
        if (pError) throw pError;
        
        await supabase
            .from('groups')
            .update({ created_by: participant.id })
            .eq('id', group.id);
        
        console.log('✅ Creator added as participant');
        
        // Test 2: Check Group
        console.log('\n📊 Test 2: Checking group details...');
        const { data: groupDetails } = await supabase
            .from('groups')
            .select('*')
            .eq('id', group.id)
            .single();
        
        console.log('Group Details:', {
            code: groupDetails.group_code,
            budget: `$${groupDetails.budget_min}-$${groupDetails.budget_max}`,
            isDrawn: groupDetails.is_drawn
        });
        
        // Test 3: Participant Count
        console.log('\n👥 Test 3: Checking participants...');
        const { data: participants } = await supabase
            .from('participants')
            .select('id')
            .eq('group_id', group.id);
        
        console.log(`✅ Participant count: ${participants.length}`);
        
        // Test 4: Check Assignments
        console.log('\n🎁 Test 4: Checking assignments...');
        const { data: assignments } = await supabase
            .from('assignments')
            .select('*')
            .eq('group_id', group.id);
        
        if (assignments.length > 0) {
            console.log(`✅ Found ${assignments.length} assignments`);
            
            // Check for self-assignments
            const selfAssignments = assignments.filter(a => a.giver_id === a.receiver_id);
            if (selfAssignments.length > 0) {
                console.error(`❌ Found ${selfAssignments.length} self-assignments!`);
            } else {
                console.log('✅ No self-assignments');
            }
        } else {
            console.log('ℹ️ No assignments yet (names not drawn)');
        }
        
        // Summary
        console.log('\n📋 Test Summary:');
        console.log({
            groupCode,
            groupPassword,
            groupId: group.id,
            participants: participants.length,
            assignments: assignments.length,
            isDrawn: groupDetails.is_drawn
        });
        
        console.log('\n✅ Quick test completed!');
        console.log(`\n📝 Next steps:`);
        console.log(`1. Add participants via dashboard`);
        console.log(`2. Draw names when ready`);
        console.log(`3. Check assignments`);
        console.log(`\nGroup Code: ${groupCode}`);
        console.log(`Password: ${groupPassword}`);
        
        return {
            groupCode,
            groupPassword,
            groupId: group.id,
            participants: participants.length
        };
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        return null;
    }
}

// Auto-run helper
console.log('✅ Quick test loaded!');
console.log('Run: await quickTest()');

