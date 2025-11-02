// Dashboard Logic for Secret Santa
let supabase;
let currentUser = null;
let userProfile = null;

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', async () => {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Debug: Check if QRCode library loaded
    if (typeof QRCode !== 'undefined') {
        console.log('✅ QRCode library loaded successfully', QRCode);
    } else {
        console.error('⚠️ QRCode library not loaded - QR features will not work');
    }
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
        // Not logged in, redirect to auth page
        window.location.href = 'auth.html';
        return;
    }
    
    currentUser = session.user;
    
    // Load user profile
    await loadUserProfile();
    
    // Initialize music based on consent
    initMusic();
    
    // Load user's groups
    await loadGroups();
    
    // Setup event listeners
    setupEventListeners();
    
    // Listen for real-time updates
    setupRealtimeListeners();
});

// Load User Profile
async function loadUserProfile() {
    try {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();
        
        if (error) {
            console.error('Error loading profile:', error);
            
            // Profile doesn't exist, create a basic one
            const email = currentUser.email || 'User';
            const name = email.split('@')[0]; // Use email prefix as name
            
            const { data: newProfile, error: createError } = await supabase
                .from('user_profiles')
                .insert([{
                    id: currentUser.id,
                    full_name: name,
                    spouse_name: null,
                    music_consent: false,
                    email: currentUser.email
                }])
                .select()
                .single();
            
            if (!createError && newProfile) {
                userProfile = newProfile;
            } else {
                // Fallback if still failing
                userProfile = {
                    id: currentUser.id,
                    full_name: name,
                    spouse_name: null,
                    music_consent: false
                };
            }
        } else {
            userProfile = data;
        }
        
        document.getElementById('userName').textContent = userProfile.full_name || currentUser.email;
        
    } catch (error) {
        console.error('Error loading profile:', error);
        // Absolute fallback
        userProfile = {
            id: currentUser.id,
            full_name: currentUser.email?.split('@')[0] || 'User',
            spouse_name: null,
            music_consent: false
        };
        document.getElementById('userName').textContent = userProfile.full_name;
    }
}

// Load User's Groups
async function loadGroups() {
    try {
        // Get all participants for current user
        const { data: participantData, error: participantError } = await supabase
            .from('participants')
            .select('id, group_id')
            .eq('user_id', currentUser.id);
        
        if (participantError) throw participantError;
        
        if (!participantData || participantData.length === 0) {
            document.getElementById('groupsGrid').innerHTML = '';
            document.getElementById('emptyState').style.display = 'block';
            return;
        }
        
        // Get group details for each participant record
        const groupIds = participantData.map(p => p.group_id);
        const { data: groups, error: groupsError } = await supabase
            .from('groups')
            .select('*')
            .in('id', groupIds);
        
        if (groupsError) throw groupsError;
        
        // Combine participant data with group data
        const participantDataWithGroups = participantData.map(p => {
            const group = groups.find(g => g.id === p.group_id);
            return {
                id: p.id,
                group_id: p.group_id,
                groups: group
            };
        });
        
        const groupsGrid = document.getElementById('groupsGrid');
        const emptyState = document.getElementById('emptyState');
        
        emptyState.style.display = 'none';
        groupsGrid.innerHTML = '';
        
        if (participantDataWithGroups.length === 0) {
            emptyState.style.display = 'block';
            return;
        }
        
        // Load details for each group
        for (const participant of participantDataWithGroups) {
            const group = participant.groups;
            if (group) {
                await createGroupCard(group, participant.id);
            }
        }
        
    } catch (error) {
        console.error('Error loading groups:', error);
        Toast.error('Error loading groups: ' + error.message);
    }
}

// Create Group Card
async function createGroupCard(group, participantId) {
    try {
        // Get participant count
        const { data: participants, error: participantsError } = await supabase
            .from('participants')
            .select('id, user_id')
            .eq('group_id', group.id);
        
        if (participantsError) throw participantsError;
        
        // Check if user is creator
        const isCreator = group.created_by === participantId;
        
        // Get assignment if draw is complete
        let assignment = null;
        let receiverName = null;
        
        if (group.is_drawn) {
            const { data: assignmentData } = await supabase
                .from('assignments')
                .select('*')
                .eq('giver_id', participantId)
                .single();
            
            if (assignmentData) {
                // Get receiver participant
                const { data: receiverParticipant } = await supabase
                    .from('participants')
                    .select('user_id')
                    .eq('id', assignmentData.receiver_id)
                    .single();
                
                if (receiverParticipant) {
                    // Get receiver profile
                    const { data: receiverProfile } = await supabase
                        .from('user_profiles')
                        .select('full_name')
                        .eq('id', receiverParticipant.user_id)
                        .single();
                    
                    receiverName = receiverProfile?.full_name || 'Unknown';
                }
                
                assignment = assignmentData;
            }
        }
        
        // Create card element
        const card = document.createElement('div');
        card.className = `group-card ${group.is_drawn ? 'drawn' : ''}`;
        card.onclick = () => showGroupDetails(group.id);
        
        let statusHtml = '';
        if (group.is_drawn) {
            statusHtml = '<span class="group-status complete">✅ Draw Complete</span>';
        } else {
            statusHtml = '<span class="group-status waiting">⏳ Waiting for Draw</span>';
        }
        
        let assignmentHtml = '';
        if (assignment && receiverName) {
            assignmentHtml = `
                <div class="group-assignment">
                    <p>🎁 You're buying for:</p>
                    <p class="receiver">${receiverName}</p>
                </div>
            `;
        }
        
        card.innerHTML = `
            <h3>${group.group_code}</h3>
            ${statusHtml}
            <p>👥 ${participants.length} participant${participants.length !== 1 ? 's' : ''}</p>
            ${isCreator ? '<p style="color: var(--gold); font-weight: 600;">👑 You\'re the organizer</p>' : ''}
            ${assignmentHtml}
        `;
        
        document.getElementById('groupsGrid').appendChild(card);
        
    } catch (error) {
        console.error('Error creating group card:', error);
    }
}

// Show Group Details Modal
async function showGroupDetails(groupId) {
    try {
        // Get group details
        const { data: group, error: groupError } = await supabase
            .from('groups')
            .select('*')
            .eq('id', groupId)
            .single();
        
        if (groupError) throw groupError;
        
        // Get participants
        const { data: participants, error: participantsError } = await supabase
            .from('participants')
            .select('id, user_id')
            .eq('group_id', groupId);
        
        if (participantsError) throw participantsError;
        
        // Get user profiles for each participant
        const userIds = participants.map(p => p.user_id);
        
        console.log('🔍 Fetching profiles for user IDs:', userIds);
        
        const { data: profiles, error: profilesError } = await supabase
            .from('user_profiles')
            .select('*')  // Get ALL columns to see what's there
            .in('id', userIds);
        
        console.log('🔍 Profiles query result:', { 
            profiles, 
            error: profilesError,
            count: profiles?.length,
            firstProfile: profiles?.[0]
        });
        
        if (profilesError) {
            console.error('❌ Error fetching profiles:', profilesError);
            throw profilesError;
        }
        
        // Combine participants with their profiles
        const participantsWithProfiles = participants.map(p => {
            const profile = profiles.find(prof => prof.id === p.user_id);
            return {
                ...p,
                user_profiles: profile || { full_name: 'Unknown', spouse_name: null }
            };
        });
        
        // Check if current user is creator
        const currentUserParticipant = participantsWithProfiles.find(p => p.user_id === currentUser.id);
        const isCreator = group.created_by === currentUserParticipant?.id;
        
        console.log('DEBUG - Creator check:', {
            groupCreatedBy: group.created_by,
            currentUserId: currentUser.id,
            currentUserParticipantId: currentUserParticipant?.id,
            isCreator: isCreator,
            isDrawn: group.is_drawn
        });
        
        // Debug participant profiles - DETAILED
        console.log('DEBUG - RAW profiles from database:', profiles);
        console.log('DEBUG - Participants with profiles:', participantsWithProfiles.map(p => ({
            participantId: p.id,
            userId: p.user_id,
            hasProfile: !!p.user_profiles,
            profileObject: p.user_profiles,
            fullName: p.user_profiles?.full_name,
            email: p.user_profiles?.email
        })));
        
        // Get sent invites if user is creator
        let invites = [];
        if (isCreator) {
            const { data: invitesData, error: invitesError } = await supabase
                .from('group_invites')
                .select('*')
                .eq('group_id', groupId)
                .order('sent_at', { ascending: false });
            
            console.log('DEBUG - Invites:', { invitesData, invitesError });
            
            if (!invitesError && invitesData) {
                invites = invitesData;
            }
        }
        
        // Build modal content
        document.getElementById('groupDetailsTitle').textContent = group.group_code;
        
        // Show password and invite button if user is creator
        const passwordDisplay = document.getElementById('groupPasswordDisplay');
        const inviteSection = document.getElementById('inviteSection');
        
        console.log('Creator check:', { isCreator, hasPassword: !!group.group_password, password: group.group_password, invitesCount: invites.length });
        
        if (isCreator) {
            if (group.group_password) {
                document.getElementById('groupPasswordText').textContent = group.group_password;
                passwordDisplay.style.display = 'block';
                
                // Show invite button
                inviteSection.style.display = 'block';
                
                // Setup invite button click handler
                const sendInvitesBtn = document.getElementById('sendInvitesBtn');
                sendInvitesBtn.onclick = () => openInviteModal(group);
                
                // Show invite tracking list
                console.log('DEBUG - About to display invite list:', { invitesLength: invites.length });
                displayInviteList(invites, participantsWithProfiles, group);
            } else {
                // Show message that password should be set
                passwordDisplay.innerHTML = '<p style="color: #92400e; margin: 0;">⚠️ This group was created without a password. Anyone can join!</p>';
                passwordDisplay.style.display = 'block';
                inviteSection.style.display = 'none';
            }
        } else {
            passwordDisplay.style.display = 'none';
            inviteSection.style.display = 'none';
        }
        
        let content = `
            <div style="margin-bottom: 20px;">
                <p><strong>Status:</strong> ${group.is_drawn ? '✅ Draw Complete' : '⏳ Waiting for Draw'}</p>
                <p><strong>Participants:</strong> ${participantsWithProfiles.length}</p>
                ${isCreator ? '<p style="color: var(--gold);"><strong>👑 You\'re the organizer</strong></p>' : ''}
                ${group.budget_max ? `<p><strong>💰 Budget:</strong> $${group.budget_min}-$${group.budget_max}</p>` : ''}
                ${group.exchange_date ? `<p><strong>📅 Exchange Date:</strong> ${new Date(group.exchange_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>` : ''}
                ${group.exchange_location ? `<p><strong>📍 Location:</strong> ${group.exchange_location}</p>` : ''}
            </div>
            
            <h4>Participants:</h4>
            <ul style="list-style: none; padding: 0;">
        `;
        
        // Get blocklist to show who's blocked with whom
        const { data: blocks } = await supabase
            .from('participant_blocks')
            .select('*')
            .eq('group_id', groupId);
        
        participantsWithProfiles.forEach(p => {
            const profile = p.user_profiles;
            const displayName = profile ? (profile.full_name || profile.email || 'Unknown User') : 'Unknown User';
            const nameStyle = !profile?.full_name ? 'font-style: italic; color: #666;' : '';
            const isCurrentUser = p.user_id === currentUser.id;
            
            // Find who this person is blocked with
            const blockedWith = [];
            blocks?.forEach(block => {
                if (block.participant_a_id === p.id) {
                    const blockedPerson = participantsWithProfiles.find(pp => pp.id === block.participant_b_id);
                    if (blockedPerson?.user_profiles?.full_name) {
                        blockedWith.push(blockedPerson.user_profiles.full_name);
                    }
                } else if (block.participant_b_id === p.id) {
                    const blockedPerson = participantsWithProfiles.find(pp => pp.id === block.participant_a_id);
                    if (blockedPerson?.user_profiles?.full_name) {
                        blockedWith.push(blockedPerson.user_profiles.full_name);
                    }
                }
            });
            
            const blockDisplay = blockedWith.length > 0 
                ? ` <span style="color: #dc2626; font-size: 13px;">(🚫 blocked: ${blockedWith.join(', ')})</span>`
                : '';
            
            content += `
                <li style="padding: 10px; background: #f8f9fa; margin-bottom: 5px; border-radius: 5px; display: flex; justify-content: space-between; align-items: center;">
                    <div style="flex: 1;">
                        <div>
                            <span style="${nameStyle}">${displayName}</span>
                            ${blockDisplay}
                            ${!profile?.full_name && profile?.email ? '<small style="color: #999;"> (profile incomplete)</small>' : ''}
                            ${!profile ? '<small style="color: #f00;"> (⚠️ profile missing - data error)</small>' : ''}
                            ${isCurrentUser ? ' <span style="color: var(--gold);">(you)</span>' : ''}
                        </div>
                        ${isCreator ? `<small style="color: #666; font-size: 11px;">Email: ${profile?.email || 'unknown'}</small>` : ''}
                    </div>
                    ${isCreator && !group.is_drawn ? `
                        <div style="display: flex; gap: 5px;">
                            <button 
                                onclick="editParticipant('${p.user_id}', '${displayName}')" 
                                style="background: var(--gold); color: #333; border: none; padding: 5px 12px; border-radius: 6px; cursor: pointer; font-size: 13px;"
                                title="Edit name"
                            >
                                ✏️ Edit
                            </button>
                            ${!isCurrentUser ? `
                                <button 
                                    onclick="removeParticipant('${p.id}', '${groupId}', '${displayName}')" 
                                    style="background: #dc2626; color: white; border: none; padding: 5px 12px; border-radius: 6px; cursor: pointer; font-size: 13px;"
                                    title="Remove from group"
                                >
                                    🗑️ Remove
                                </button>
                            ` : ''}
                        </div>
                    ` : ''}
                </li>
            `;
        });
        
        content += '</ul>';
        
        // Add wishlist button for current user
        content += `
            <div style="margin-top: 20px; padding: 15px; background: #fef3c7; border: 2px solid var(--gold); border-radius: 10px;">
                <h4 style="margin: 0 0 10px 0; color: #92400e;">🎁 Gift Wishlist</h4>
                <p style="margin: 0 0 12px 0; color: #78350f; font-size: 14px;">
                    Add your gift ideas so your Secret Santa knows what you'd like!
                </p>
                <button onclick="openWishlist('${groupId}', '${currentUserParticipant?.id}', true)" class="btn" style="background: var(--gold); color: #333; width: 100%;">
                    🎁 My Wishlist
                </button>
            </div>
        `;
        
        // If draw is complete, show button to view receiver's wishlist
        if (group.is_drawn && currentUserParticipant) {
            // Get current user's assignment
            const { data: myAssignment } = await supabase
                .from('assignments')
                .select('receiver_id')
                .eq('giver_id', currentUserParticipant.id)
                .single();
            
            if (myAssignment) {
                // Get receiver's name
                const receiver = participantsWithProfiles.find(p => p.id === myAssignment.receiver_id);
                const receiverName = receiver?.user_profiles?.full_name || 'your recipient';
                
                content += `
                    <div style="margin-top: 15px; padding: 15px; background: #f0fdf4; border: 2px solid var(--green); border-radius: 10px;">
                        <h4 style="margin: 0 0 10px 0; color: var(--green);">🎅 Their Wishlist</h4>
                        <p style="margin: 0 0 12px 0; color: #166534; font-size: 14px;">
                            See what ${receiverName} would like!
                        </p>
                        <button onclick="openWishlist('${groupId}', '${myAssignment.receiver_id}', false)" class="btn" style="background: var(--green); color: white; width: 100%;">
                            🎁 View ${receiverName}'s Wishlist
                        </button>
                    </div>
                `;
            }
        }
        
        // Add delete group button for creator at the bottom
        if (isCreator) {
            content += `
                <div style="margin-top: 30px; padding-top: 20px; border-top: 2px dashed #ddd;">
                    <button onclick="deleteGroup('${groupId}', '${group.group_code}')" class="btn" style="
                        background: #7f1d1d;
                        color: white;
                        padding: 10px 20px;
                        font-size: 14px;
                        border: 2px solid #991b1b;
                        border-radius: 8px;
                        cursor: pointer;
                        width: 100%;
                    ">
                        🗑️ Delete This Group
                    </button>
                    <p style="margin: 10px 0 0 0; color: #999; font-size: 12px; text-align: center;">
                        Warning: This will permanently delete the group and all its data
                    </p>
                </div>
            `;
        }
        
        // Add blocklist management button for creator before drawing
        if (isCreator && !group.is_drawn && participantsWithProfiles.length >= 2) {
            content += `
                <div style="margin-top: 20px; padding: 15px; background: #f0f9ff; border: 2px solid #0284c7; border-radius: 10px;">
                    <h4 style="margin: 0 0 10px 0; color: #0284c7;">🚫 Manage Blocklist</h4>
                    <p style="margin: 0 0 12px 0; color: #666; font-size: 14px;">
                        Prevent certain people from being matched together (spouses, family, etc.)
                    </p>
                    <button onclick="manageBlocklist('${groupId}')" class="btn" style="background: #0284c7; color: white;">
                        🚫 Set Block Rules
                    </button>
                </div>
            `;
        }
        
        // Add draw/undo button for creator
        console.log('DEBUG - Button logic:', { isCreator, isDrawn: group.is_drawn, participantCount: participantsWithProfiles.length });
        
        if (isCreator && !group.is_drawn && participantsWithProfiles.length >= 2) {
            console.log('DEBUG - Adding DRAW button');
            content += `
                <div style="margin-top: 20px;">
                    <button onclick="drawNames('${groupId}')" class="btn btn-primary">
                        Draw Names 🎲
                    </button>
                    <p style="margin-top: 10px; color: #666; font-size: 0.9em;">
                        Make sure everyone has joined before drawing!
                    </p>
                </div>
            `;
        } else if (isCreator && group.is_drawn) {
            console.log('DEBUG - Adding UNDO button');
            content += `
                <div style="margin-top: 20px; padding: 20px; background: linear-gradient(135deg, #fff5f5 0%, #ffe5e5 100%); border: 2px solid var(--red); border-radius: 12px; box-shadow: 0 2px 8px rgba(196, 30, 58, 0.2);">
                    <h4 style="margin: 0 0 10px 0; color: var(--red); font-size: 18px; font-weight: 700;">
                        ⚠️ Reset Draw
                    </h4>
                    <p style="margin: 0 0 15px 0; color: #333; font-size: 14px; line-height: 1.5;">
                        Need to redraw names? This will clear all current assignments so you can draw again.
                    </p>
                    <button onclick="undoDrawNames('${groupId}')" class="btn" style="
                        background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
                        color: white;
                        padding: 14px 28px;
                        font-size: 16px;
                        font-weight: 700;
                        border: 2px solid #7f1d1d;
                        border-radius: 10px;
                        cursor: pointer;
                        box-shadow: 0 4px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2);
                        transition: all 0.2s;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                        display: inline-block;
                    " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 12px rgba(0,0,0,0.4)'" onmouseout="this.style.transform=''; this.style.boxShadow='0 4px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)'">
                        ↺ Undo & Redraw Names
                    </button>
                </div>
            `;
        } else if (isCreator && participantsWithProfiles.length < 2) {
            console.log('DEBUG - Not enough participants');
            content += `
                <p style="margin-top: 20px; color: #666;">
                    Need at least 2 participants to draw names
                </p>
            `;
        } else {
            console.log('DEBUG - No button (not creator or other reason)');
        }
        
        document.getElementById('groupDetailsContent').innerHTML = content;
        
        // Store current group ID for later reference
        const modal = document.getElementById('groupDetailsModal');
        modal.dataset.currentGroupId = groupId;
        modal.style.display = 'block';
        
    } catch (error) {
        console.error('Error showing group details:', error);
        Toast.error('Error loading group details: ' + error.message);
    }
}

// Manage Blocklist
async function manageBlocklist(groupId) {
    try {
        // Get all participants
        const { data: participants, error: participantsError } = await supabase
            .from('participants')
            .select('id, user_id')
            .eq('group_id', groupId);
        
        if (participantsError) throw participantsError;
        
        // Get profiles
        const userIds = participants.map(p => p.user_id);
        const { data: profiles } = await supabase
            .from('user_profiles')
            .select('*')
            .in('id', userIds);
        
        const participantsWithProfiles = participants.map(p => {
            const profile = profiles?.find(prof => prof.id === p.user_id);
            return {
                ...p,
                user_profiles: profile || { full_name: 'Unknown', spouse_name: null }
            };
        });
        
        // Get existing blocks
        const { data: existingBlocks, error: blocksError } = await supabase
            .from('participant_blocks')
            .select('*')
            .eq('group_id', groupId);
        
        if (blocksError) console.error('Error fetching blocks:', blocksError);
        
        // Build blocklist UI
        let content = '';
        
        for (let i = 0; i < participantsWithProfiles.length; i++) {
            const personA = participantsWithProfiles[i];
            const nameA = personA.user_profiles?.full_name || 'Unknown';
            
            content += `<div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">`;
            content += `<h4 style="margin: 0 0 10px 0; color: var(--red);">${nameA} cannot be matched with:</h4>`;
            
            for (let j = 0; j < participantsWithProfiles.length; j++) {
                if (i === j) continue; // Skip self
                
                const personB = participantsWithProfiles[j];
                const nameB = personB.user_profiles?.full_name || 'Unknown';
                
                // Check if block exists (in either direction)
                const isBlocked = existingBlocks?.some(block => 
                    (block.participant_a_id === personA.id && block.participant_b_id === personB.id) ||
                    (block.participant_a_id === personB.id && block.participant_b_id === personA.id)
                ) || false;
                
                content += `
                    <label style="display: block; padding: 8px; cursor: pointer; border-radius: 5px; margin-bottom: 5px; background: white;">
                        <input 
                            type="checkbox" 
                            class="block-checkbox" 
                            data-person-a="${personA.id}"
                            data-person-b="${personB.id}"
                            ${isBlocked ? 'checked' : ''}
                        >
                        <span style="margin-left: 8px;">${nameB}</span>
                    </label>
                `;
            }
            
            content += `</div>`;
        }
        
        document.getElementById('blocklistContent').innerHTML = content;
        
        // Store current group ID for saving
        document.getElementById('blocklistModal').dataset.groupId = groupId;
        
        // Show modal
        closeAllModals();
        document.getElementById('blocklistModal').style.display = 'block';
        
        // Setup save handler
        document.getElementById('saveBlocklistBtn').onclick = () => saveBlocklist(groupId);
        
    } catch (error) {
        console.error('Error managing blocklist:', error);
        Toast.error('Error loading blocklist: ' + error.message);
    }
}

// Save Blocklist
async function saveBlocklist(groupId) {
    try {
        const checkboxes = document.querySelectorAll('.block-checkbox');
        const blocksToCreate = [];
        const blocksToDelete = [];
        
        // Get existing blocks
        const { data: existingBlocks } = await supabase
            .from('participant_blocks')
            .select('*')
            .eq('group_id', groupId);
        
        checkboxes.forEach(checkbox => {
            const personAId = checkbox.dataset.personA;
            const personBId = checkbox.dataset.personB;
            
            // Check if block exists
            const existingBlock = existingBlocks?.find(block =>
                (block.participant_a_id === personAId && block.participant_b_id === personBId) ||
                (block.participant_a_id === personBId && block.participant_b_id === personAId)
            );
            
            if (checkbox.checked && !existingBlock) {
                // Need to create this block
                blocksToCreate.push({
                    group_id: groupId,
                    participant_a_id: personAId,
                    participant_b_id: personBId
                });
            } else if (!checkbox.checked && existingBlock) {
                // Need to delete this block
                blocksToDelete.push(existingBlock.id);
            }
        });
        
        // Delete unchecked blocks
        if (blocksToDelete.length > 0) {
            const { error: deleteError } = await supabase
                .from('participant_blocks')
                .delete()
                .in('id', blocksToDelete);
            
            if (deleteError) throw deleteError;
        }
        
        // Create new blocks
        if (blocksToCreate.length > 0) {
            const { error: insertError } = await supabase
                .from('participant_blocks')
                .insert(blocksToCreate);
            
            if (insertError) throw insertError;
        }
        
        Toast.success(`Blocklist saved!\n\n${blocksToCreate.length} blocks added\n${blocksToDelete.length} blocks removed`);
        
        closeAllModals();
        
    } catch (error) {
        console.error('Error saving blocklist:', error);
        Toast.error('Error saving blocklist: ' + error.message);
    }
}

// Delete Entire Group
async function deleteGroup(groupId, groupCode) {
    const confirmMsg = `This will PERMANENTLY delete:\n• The group\n• All participants\n• All assignments\n• All invites\n• Everything!\n\nThis CANNOT be undone!\n\nType "${groupCode}" below to confirm:`;
    
    const userInput = await Toast.prompt(confirmMsg, '', `⚠️ DELETE GROUP: ${groupCode}?`);
    
    if (userInput !== groupCode) {
        if (userInput !== null) {
            Toast.warning('Group code did not match. Deletion cancelled.');
        }
        return;
    }
    
    try {
        console.log('🗑️ Deleting group:', groupId);
        
        // Delete in order: assignments -> invites -> participants -> group
        
        // 1. Delete assignments
        const { error: assignmentsError } = await supabase
            .from('assignments')
            .delete()
            .eq('group_id', groupId);
        
        if (assignmentsError) {
            console.error('Error deleting assignments:', assignmentsError);
            // Continue anyway
        }
        
        // 2. Delete invites
        const { error: invitesError } = await supabase
            .from('group_invites')
            .delete()
            .eq('group_id', groupId);
        
        if (invitesError) {
            console.error('Error deleting invites:', invitesError);
            // Continue anyway
        }
        
        // 3. Delete participants
        const { error: participantsError } = await supabase
            .from('participants')
            .delete()
            .eq('group_id', groupId);
        
        if (participantsError) throw participantsError;
        
        // 4. Delete group
        const { error: groupError } = await supabase
            .from('groups')
            .delete()
            .eq('id', groupId);
        
        if (groupError) throw groupError;
        
        console.log('✅ Group deleted successfully');
        
        Toast.success(`Group "${groupCode}" has been permanently deleted.`);
        
        // Close modal and reload dashboard
        closeAllModals();
        await loadGroups();
        
    } catch (error) {
        console.error('❌ Error deleting group:', error);
        Toast.error(`Error deleting group: ${error.message}\n\nSome data may have been deleted. Please refresh the page.`);
    }
}

// Edit Participant Name
async function editParticipant(userId, currentName) {
    const newName = await Toast.prompt(
        `Current Name: ${currentName}\n\nEnter new name:`,
        currentName,
        'Edit Participant Name'
    );
    
    if (newName === null || newName.trim() === '') return; // Cancelled or empty
    
    try {
        console.log('🔄 Updating participant name:', userId);
        console.log('New name:', newName);
        
        const { data, error } = await supabase
            .from('user_profiles')
            .update({
                full_name: newName.trim(),
                updated_at: new Date().toISOString()
            })
            .eq('id', userId)
            .select();
        
        if (error) {
            console.error('❌ Update error:', error);
            throw error;
        }
        
        console.log('✅ Name updated successfully');
        
        Toast.success(`Name updated to: ${newName}`);
        
        // Reload the group details
        const groupId = document.getElementById('groupDetailsModal').dataset.currentGroupId;
        if (groupId) {
            closeAllModals();
            await loadGroups();
            setTimeout(() => showGroupDetails(groupId), 500);
        } else {
            await loadGroups();
        }
        
    } catch (error) {
        console.error('❌ Error updating participant:', error);
        Toast.error(`Error updating participant: ${error.message}`);
    }
}

// Remove Participant from Group
async function removeParticipant(participantId, groupId, participantName) {
    const confirmed = await Toast.confirm(
        `They will need to rejoin if you want them back.`,
        `Remove "${participantName}"?`
    );
    if (!confirmed) return;
    
    try {
        console.log('🗑️ Removing participant:', participantId, 'from group:', groupId);
        
        // Delete the participant
        const { data, error: deleteError } = await supabase
            .from('participants')
            .delete()
            .eq('id', participantId);
        
        if (deleteError) {
            console.error('❌ Delete error:', deleteError);
            throw deleteError;
        }
        
        console.log('✅ Participant deleted successfully');
        
        Toast.success(`${participantName} has been removed from the group.`);
        
        // Refresh the dashboard and group details
        closeAllModals();
        console.log('🔄 Reloading groups...');
        await loadGroups();
        console.log('🔄 Reopening group details...');
        setTimeout(() => {
            showGroupDetails(groupId);
        }, 500); // Increased delay to ensure refresh
        
    } catch (error) {
        console.error('❌ Error removing participant:', error);
        Toast.error(`Error removing participant: ${error.message}\n\nTry refreshing the page (F5) and removing again.`);
    }
}

// Undo Draw Names
async function undoDrawNames(groupId) {
    const confirmed = await Toast.confirm(
        'This will:\n• Delete all current assignments\n• Allow you to draw names again\n• Send new assignments when you redraw',
        'Undo Draw?'
    );
    if (!confirmed) return;
    
    try {
        // Delete all assignments for this group
        const { error: deleteError } = await supabase
            .from('assignments')
            .delete()
            .eq('group_id', groupId);
        
        if (deleteError) throw deleteError;
        
        // Mark group as not drawn
        const { error: updateError } = await supabase
            .from('groups')
            .update({ is_drawn: false })
            .eq('id', groupId);
        
        if (updateError) throw updateError;
        
        Toast.success('Draw has been reset! You can now draw names again.');
        
        // Refresh the dashboard and group details
        closeAllModals();
        await loadGroups();
        setTimeout(() => showGroupDetails(groupId), 300);
        
    } catch (error) {
        console.error('Error undoing draw:', error);
        Toast.error('Error undoing draw: ' + error.message);
    }
}

// Draw Names
async function drawNames(groupId) {
    const confirmed = await Toast.confirm(
        'This will:\n• Randomly assign Secret Santa pairs\n• Notify all participants',
        'Draw Names?'
    );
    if (!confirmed) return;
    
    try {
        // Get all participants
        const { data: participants, error: participantsError } = await supabase
            .from('participants')
            .select('id, user_id')
            .eq('group_id', groupId);
        
        if (participantsError) throw participantsError;
        
        // Get blocklist for this group
        const { data: blocks, error: blocksError } = await supabase
            .from('participant_blocks')
            .select('*')
            .eq('group_id', groupId);
        
        if (blocksError) console.error('Error fetching blocks:', blocksError);
        
        // Store blocks globally for matching algorithm to use
        window.currentBlocks = blocks || [];
        
        // Get user profiles for participants (need email for notifications)
        const userIds = participants.map(p => p.user_id);
        const { data: profiles, error: profilesError } = await supabase
            .from('user_profiles')
            .select('id, full_name, spouse_name, email')
            .in('id', userIds);
        
        if (profilesError) throw profilesError;
        
        // Combine participants with profiles
        const participantsWithProfiles = participants.map(p => {
            const profile = profiles.find(prof => prof.id === p.user_id);
            return {
                id: p.id,
                user_id: p.user_id,
                user_profiles: profile || { full_name: 'Unknown', spouse_name: null }
            };
        });
        
        if (participantsWithProfiles.length < 2) {
            Toast.warning('Need at least 2 participants to draw names');
            return;
        }
        
        // Perform Secret Santa matching
        const assignments = performSecretSantaMatching(participantsWithProfiles, groupId);
        
        if (!assignments) {
            Toast.error('Unable to create valid assignments with the given constraints. Please check spouse pairings.');
            return;
        }
        
        // Save assignments
        const { error: assignmentError } = await supabase
            .from('assignments')
            .insert(assignments);
        
        if (assignmentError) throw assignmentError;
        
        // Mark group as drawn
        const { error: updateError } = await supabase
            .from('groups')
            .update({ is_drawn: true })
            .eq('id', groupId);
        
        if (updateError) throw updateError;
        
        // Get group details for emails
        const { data: group, error: groupError } = await supabase
            .from('groups')
            .select('*')
            .eq('id', groupId)
            .single();
        
        if (!groupError && group) {
            // Send email notifications to all participants
            await sendDrawNotifications(assignments, participantsWithProfiles, group);
            
            // Send creator receipt with all assignments
            await sendCreatorReceipt(assignments, participantsWithProfiles, group);
        }
        
        Toast.success('🎉 Names drawn successfully!\n\nAll participants have been emailed their Secret Santa assignments!\n\nYou will also receive a master list via email for safekeeping.', 8000);
        Analytics.drawNames(participantsWithProfiles.length);
        
        // Close modal and reload groups
        document.getElementById('groupDetailsModal').style.display = 'none';
        await loadGroups();
        
    } catch (error) {
        console.error('Error drawing names:', error);
        Toast.error('Error drawing names: ' + error.message);
        Analytics.error('Draw names failed: ' + error.message, 'draw');
    }
}

// Send Draw Notifications to All Participants
async function sendDrawNotifications(assignments, participants, group) {
    console.log('📧 Sending draw notifications to all participants...');
    
    const emailEndpoint = window.EMAIL_ENDPOINT || 'http://localhost:5001/send-email';
    const siteUrl = window.location.origin;
    let emailsSent = 0;
    let emailsFailed = 0;
    
    for (const assignment of assignments) {
        try {
            // Find the giver (person buying the gift)
            const giver = participants.find(p => p.id === assignment.giver_id);
            if (!giver || !giver.user_profiles) continue;
            
            // Find the receiver (person getting the gift)
            const receiver = participants.find(p => p.id === assignment.receiver_id);
            if (!receiver || !receiver.user_profiles) continue;
            
            const giverEmail = giver.user_profiles.email;
            const giverName = giver.user_profiles.full_name || giverEmail;
            const receiverName = receiver.user_profiles.full_name || 'your Secret Santa recipient';
            
            if (!giverEmail) {
                console.error('No email for participant:', giverName);
                emailsFailed++;
                continue;
            }
            
            // Create email HTML
            const emailHtml = createDrawNotificationEmail(
                giverName,
                receiverName,
                group.group_code,
                siteUrl
            );
            
            console.log(`Sending assignment email to ${giverName} (${giverEmail})`);
            
            const response = await fetch(emailEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    from: 'Secret Santa <santa@holidaydrawnames.com>',
                    to: [giverEmail],
                    subject: `🎅 Your Secret Santa Assignment - ${group.group_code}`,
                    html: emailHtml
                })
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                emailsSent++;
                console.log('✅ Email sent to:', giverName);
            } else {
                emailsFailed++;
                console.error('❌ Failed to send to', giverName, result.error);
            }
            
        } catch (error) {
            emailsFailed++;
            console.error('Error sending email:', error);
        }
    }
    
    console.log(`📧 Email summary: ${emailsSent} sent, ${emailsFailed} failed`);
}

// Send Creator Receipt with All Assignments
async function sendCreatorReceipt(assignments, participants, group) {
    console.log('📧 Sending creator receipt with all assignments...');
    
    try {
        // Find the creator participant
        const creatorParticipant = participants.find(p => p.id === group.created_by);
        if (!creatorParticipant || !creatorParticipant.user_profiles) {
            console.error('Creator participant not found');
            return;
        }
        
        const creatorEmail = creatorParticipant.user_profiles.email;
        const creatorName = creatorParticipant.user_profiles.full_name || 'Organizer';
        
        if (!creatorEmail) {
            console.error('Creator email not found');
            return;
        }
        
        // Build assignment list
        const assignmentList = assignments.map(assignment => {
            const giver = participants.find(p => p.id === assignment.giver_id);
            const receiver = participants.find(p => p.id === assignment.receiver_id);
            
            return {
                giverName: giver?.user_profiles?.full_name || 'Unknown',
                receiverName: receiver?.user_profiles?.full_name || 'Unknown'
            };
        });
        
        const siteUrl = window.location.origin;
        const emailHtml = createCreatorReceiptEmail(
            creatorName,
            group.group_code,
            assignmentList,
            siteUrl
        );
        
        const emailEndpoint = window.EMAIL_ENDPOINT || 'http://localhost:5001/send-email';
        
        console.log(`Sending creator receipt to ${creatorName} (${creatorEmail})`);
        
        const response = await fetch(emailEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: 'Secret Santa <santa@holidaydrawnames.com>',
                to: [creatorEmail],
                subject: `📋 Secret Santa Master List - ${group.group_code} (For Your Records)`,
                html: emailHtml
            })
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            console.log('✅ Creator receipt sent successfully');
        } else {
            console.error('❌ Failed to send creator receipt:', result.error);
        }
        
    } catch (error) {
        console.error('Error sending creator receipt:', error);
    }
}

// Create Draw Notification Email HTML
function createDrawNotificationEmail(giverName, receiverName, groupCode, siteUrl) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Your Secret Santa Assignment</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background: linear-gradient(135deg, #1a472a 0%, #2d5a3d 100%); min-height: 100vh;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, #1a472a 0%, #2d5a3d 100%); padding: 40px 20px;">
                <tr>
                    <td align="center">
                        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background: white; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.3); overflow: hidden; max-width: 100%;">
                            
                            <!-- Header with Christmas Lights -->
                            <tr>
                                <td style="background: linear-gradient(135deg, #c41e3a 0%, #a01729 100%); padding: 30px 40px; text-align: center; position: relative;">
                                    <div style="font-size: 40px; margin-bottom: 10px;">🎅</div>
                                    <h1 style="color: white; margin: 0; font-size: 32px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
                                        Your Secret Santa Assignment!
                                    </h1>
                                    <p style="color: #ffe5e5; margin: 10px 0 0 0; font-size: 14px;">
                                        Group: <strong>${groupCode}</strong>
                                    </p>
                                </td>
                            </tr>
                            
                            <!-- Main Content -->
                            <tr>
                                <td style="padding: 40px;">
                                    <p style="color: #333; font-size: 18px; line-height: 1.6; margin: 0 0 20px 0;">
                                        Ho ho ho, ${giverName}! 🎄
                                    </p>
                                    
                                    <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                                        The names have been drawn! Here's your Secret Santa assignment:
                                    </p>
                                    
                                    <!-- Assignment Box -->
                                    <div style="background: linear-gradient(135deg, #fff5f5 0%, #ffe5e5 100%); border: 3px solid #c41e3a; border-radius: 15px; padding: 30px; text-align: center; margin: 30px 0;">
                                        <p style="color: #666; margin: 0 0 15px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                                            🎁 You're buying a gift for 🎁
                                        </p>
                                        <h2 style="color: #c41e3a; margin: 0; font-size: 36px; font-weight: bold;">
                                            ${receiverName}
                                        </h2>
                                    </div>
                                    
                                    <!-- Important Reminders -->
                                    <div style="background: #f8f9fa; border-left: 4px solid #0f7c3a; padding: 20px; margin: 30px 0; border-radius: 8px;">
                                        <p style="color: #333; margin: 0 0 10px 0; font-weight: bold; font-size: 16px;">
                                            🎅 Important Reminders:
                                        </p>
                                        <ul style="color: #555; margin: 10px 0; padding-left: 20px; line-height: 1.8;">
                                            <li><strong>Keep it secret!</strong> Don't tell anyone who you got</li>
                                            <li><strong>Budget:</strong> Check with your group organizer for spending limits</li>
                                            <li><strong>Deadline:</strong> Make sure to have your gift ready on time</li>
                                            <li><strong>Have fun!</strong> The joy is in the giving 🎄</li>
                                        </ul>
                                    </div>
                                    
                                    <!-- Call to Action -->
                                    <div style="text-align: center; margin: 40px 0 20px 0;">
                                        <a href="${siteUrl}/dashboard.html" style="display: inline-block; background: linear-gradient(135deg, #0f7c3a 0%, #0d6630 100%); color: white; text-decoration: none; padding: 15px 40px; border-radius: 30px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(15, 124, 58, 0.3);">
                                            View Dashboard
                                        </a>
                                    </div>
                                    
                                    <p style="color: #888; font-size: 14px; text-align: center; margin: 20px 0 0 0; line-height: 1.6;">
                                        You can always check your assignment by signing in to your dashboard at<br>
                                        <a href="${siteUrl}" style="color: #c41e3a; text-decoration: none;">${siteUrl}</a>
                                    </p>
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style="background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
                                    <p style="color: #666; font-size: 14px; margin: 0 0 10px 0;">
                                        🎄 <strong>Holiday Draw Names</strong> 🎄
                                    </p>
                                    <p style="color: #999; font-size: 12px; margin: 0;">
                                        Making Secret Santa easy and fun!
                                    </p>
                                    <p style="color: #999; font-size: 12px; margin: 10px 0 0 0;">
                                        <a href="${siteUrl}" style="color: #c41e3a; text-decoration: none;">holidaydrawnames.com</a>
                                    </p>
                                </td>
                            </tr>
                            
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `;
}

// Create Creator Receipt Email HTML
function createCreatorReceiptEmail(creatorName, groupCode, assignmentList, siteUrl) {
    // Build the assignment rows HTML
    let assignmentRows = '';
    assignmentList.forEach((assignment, index) => {
        const rowColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';
        assignmentRows += `
            <tr style="background: ${rowColor};">
                <td style="padding: 15px; border-bottom: 1px solid #e0e0e0;">
                    <strong>${assignment.giverName}</strong>
                </td>
                <td style="padding: 15px; text-align: center; border-bottom: 1px solid #e0e0e0; color: #c41e3a; font-size: 20px;">
                    🎁 →
                </td>
                <td style="padding: 15px; border-bottom: 1px solid #e0e0e0;">
                    <strong>${assignment.receiverName}</strong>
                </td>
            </tr>
        `;
    });
    
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Secret Santa Master List</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background: linear-gradient(135deg, #1a472a 0%, #2d5a3d 100%); min-height: 100vh;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, #1a472a 0%, #2d5a3d 100%); padding: 40px 20px;">
                <tr>
                    <td align="center">
                        <table width="700" cellpadding="0" cellspacing="0" border="0" style="background: white; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.3); overflow: hidden; max-width: 100%;">
                            
                            <!-- Header -->
                            <tr>
                                <td style="background: linear-gradient(135deg, #0f7c3a 0%, #0d6630 100%); padding: 40px; text-align: center;">
                                    <div style="font-size: 50px; margin-bottom: 10px;">📋</div>
                                    <h1 style="color: white; margin: 0; font-size: 36px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
                                        Secret Santa Master List
                                    </h1>
                                    <p style="color: #d1fae5; margin: 10px 0 0 0; font-size: 16px; font-weight: 600;">
                                        Group: ${groupCode}
                                    </p>
                                </td>
                            </tr>
                            
                            <!-- Main Content -->
                            <tr>
                                <td style="padding: 40px;">
                                    <p style="color: #333; font-size: 18px; line-height: 1.6; margin: 0 0 10px 0;">
                                        Hi ${creatorName}! 👑
                                    </p>
                                    
                                    <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                                        As the group organizer, here's your complete master list of all Secret Santa assignments. <strong>Keep this email safe</strong> in case anyone forgets their assignment or if there are any issues!
                                    </p>
                                    
                                    <!-- Warning Box -->
                                    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 0 0 30px 0; border-radius: 8px;">
                                        <p style="color: #92400e; margin: 0; font-weight: bold; font-size: 14px;">
                                            ⚠️ <strong>CONFIDENTIAL:</strong> This list shows ALL assignments. Keep it private!
                                        </p>
                                        <p style="color: #92400e; margin: 10px 0 0 0; font-size: 14px;">
                                            Don't share this with participants - everyone has received their individual assignment.
                                        </p>
                                    </div>
                                    
                                    <!-- Assignments Table -->
                                    <h2 style="color: #0f7c3a; font-size: 24px; margin: 30px 0 20px 0; text-align: center;">
                                        Complete Assignment List
                                    </h2>
                                    
                                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border: 2px solid #0f7c3a; border-radius: 10px; overflow: hidden; margin: 20px 0;">
                                        <thead>
                                            <tr style="background: linear-gradient(135deg, #0f7c3a 0%, #0d6630 100%);">
                                                <th style="padding: 15px; color: white; text-align: left; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                                                    Gift Giver
                                                </th>
                                                <th style="padding: 15px; color: white; text-align: center; font-size: 14px; width: 80px;">
                                                    →
                                                </th>
                                                <th style="padding: 15px; color: white; text-align: left; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                                                    Gift Receiver
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${assignmentRows}
                                        </tbody>
                                    </table>
                                    
                                    <!-- Stats Box -->
                                    <div style="background: #f0f9ff; border: 2px solid #0284c7; border-radius: 10px; padding: 20px; margin: 30px 0; text-align: center;">
                                        <p style="color: #0c4a6e; margin: 0; font-size: 16px; font-weight: 600;">
                                            📊 Total Participants: <span style="color: #0284c7; font-size: 24px;">${assignmentList.length}</span>
                                        </p>
                                        <p style="color: #64748b; margin: 10px 0 0 0; font-size: 14px;">
                                            All participants have been emailed their individual assignments
                                        </p>
                                    </div>
                                    
                                    <!-- Organizer Tips -->
                                    <div style="background: #f8f9fa; border-radius: 10px; padding: 25px; margin: 30px 0;">
                                        <h3 style="color: #0f7c3a; margin: 0 0 15px 0; font-size: 18px;">
                                            🎅 Organizer Tips:
                                        </h3>
                                        <ul style="color: #555; margin: 0; padding-left: 20px; line-height: 1.8;">
                                            <li><strong>Keep this email:</strong> Archive it for reference throughout the season</li>
                                            <li><strong>If someone asks:</strong> You can verify their assignment from this list</li>
                                            <li><strong>Budget reminder:</strong> Let everyone know the spending limit if you haven't already</li>
                                            <li><strong>Set the date:</strong> Make sure everyone knows when to exchange gifts</li>
                                            <li><strong>Check in:</strong> A week before, remind everyone to have their gifts ready</li>
                                        </ul>
                                    </div>
                                    
                                    <!-- Call to Action -->
                                    <div style="text-align: center; margin: 40px 0 20px 0;">
                                        <a href="${siteUrl}/dashboard.html" style="display: inline-block; background: linear-gradient(135deg, #c41e3a 0%, #a01729 100%); color: white; text-decoration: none; padding: 15px 40px; border-radius: 30px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(196, 30, 58, 0.3);">
                                            View Dashboard
                                        </a>
                                    </div>
                                    
                                    <p style="color: #888; font-size: 14px; text-align: center; margin: 20px 0 0 0; line-height: 1.6;">
                                        You can manage your group and send reminders from your dashboard at<br>
                                        <a href="${siteUrl}" style="color: #c41e3a; text-decoration: none;">${siteUrl}</a>
                                    </p>
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style="background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
                                    <p style="color: #666; font-size: 14px; margin: 0 0 10px 0;">
                                        🎄 <strong>Holiday Draw Names</strong> 🎄
                                    </p>
                                    <p style="color: #999; font-size: 12px; margin: 0;">
                                        Making Secret Santa organization easy!
                                    </p>
                                    <p style="color: #999; font-size: 12px; margin: 10px 0 0 0;">
                                        <a href="${siteUrl}" style="color: #c41e3a; text-decoration: none;">holidaydrawnames.com</a>
                                    </p>
                                </td>
                            </tr>
                            
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `;
}

// Secret Santa Matching Algorithm
function performSecretSantaMatching(participants, groupId) {
    const maxAttempts = 100;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        let givers = [...participants];
        let receivers = [...participants];
        let assignments = [];
        let valid = true;
        
        // Shuffle receivers
        receivers.sort(() => Math.random() - 0.5);
        
        for (let giver of givers) {
            const giverProfile = giver.user_profiles;
            
            // Filter valid receivers
            let validReceivers = receivers.filter(receiver => {
                const receiverProfile = receiver.user_profiles;
                
                // Can't give to self
                if (receiver.id === giver.id) return false;
                
                // Can't give to blocked participants (check blocklist)
                if (window.currentBlocks) {
                    const isBlocked = window.currentBlocks.some(block =>
                        (block.participant_a_id === giver.id && block.participant_b_id === receiver.id) ||
                        (block.participant_a_id === receiver.id && block.participant_b_id === giver.id)
                    );
                    if (isBlocked) return false;
                }
                
                return true;
            });
            
            if (validReceivers.length === 0) {
                valid = false;
                break;
            }
            
            // Pick random valid receiver
            const receiver = validReceivers[Math.floor(Math.random() * validReceivers.length)];
            
            assignments.push({
                group_id: groupId,
                giver_id: giver.id,
                receiver_id: receiver.id
            });
            
            // Remove receiver from pool
            receivers = receivers.filter(r => r.id !== receiver.id);
        }
        
        if (valid) {
            return assignments;
        }
    }
    
    return null;
}

// Join Group
async function joinGroup(groupCode, groupPassword) {
    try {
        groupCode = groupCode.trim().toUpperCase();
        
        // Check if group exists
        let { data: group, error: groupError } = await supabase
            .from('groups')
            .select('*')
            .eq('group_code', groupCode)
            .single();
        
        if (groupError && groupError.code === 'PGRST116') {
            Toast.error('Group not found! Please check the group code or create a new group.');
            return;
        } else if (groupError) {
            throw groupError;
        }
        
        // Verify password
        if (group.group_password !== groupPassword) {
            Toast.error('Incorrect password! Please check with your group organizer.');
            return;
        }
        
        // Check if already in group
        const { data: existing } = await supabase
            .from('participants')
            .select('id')
            .eq('group_id', group.id)
            .eq('user_id', currentUser.id)
            .single();
        
        if (existing) {
            Toast.info('You\'re already in this group!');
            return;
        }
        
        // Add user to group
        const { data: participant, error: participantError } = await supabase
            .from('participants')
            .insert([{
                group_id: group.id,
                user_id: currentUser.id
            }])
            .select()
            .single();
        
        if (participantError) throw participantError;
        
        Toast.success(`Successfully joined ${groupCode}! 🎄`);
        Analytics.joinGroup();
        closeAllModals();
        await loadGroups();
        
    } catch (error) {
        console.error('Error joining group:', error);
        Toast.error('Error joining group: ' + error.message);
    }
}

// Create Group
async function createGroup(groupCode, groupPassword, details = {}) {
    try {
        groupCode = groupCode.trim().toUpperCase();
        
        // Check if group code already exists
        const { data: existing } = await supabase
            .from('groups')
            .select('id')
            .eq('group_code', groupCode)
            .single();
        
        if (existing) {
            Toast.warning('This group code is already taken! Please choose a different one.');
            return;
        }
        
        // Create the group
        const { data: newGroup, error: createError } = await supabase
            .from('groups')
            .insert([{ 
                group_code: groupCode, 
                group_password: groupPassword,
                is_drawn: false,
                budget_min: details.budgetMin || 20,
                budget_max: details.budgetMax || 50,
                currency: 'USD',
                exchange_date: details.exchangeDate || null,
                exchange_location: details.exchangeLocation || null
            }])
            .select()
            .single();
        
        if (createError) throw createError;
        
        // Add creator as first participant
        const { data: participant, error: participantError } = await supabase
            .from('participants')
            .insert([{
                group_id: newGroup.id,
                user_id: currentUser.id
            }])
            .select()
            .single();
        
        if (participantError) throw participantError;
        
        // Set creator
        await supabase
            .from('groups')
            .update({ created_by: participant.id })
            .eq('id', newGroup.id);
        
        Toast.success(`Group "${groupCode}" created successfully! 🎅\n\nCode: ${groupCode}\nPassword: ${groupPassword}`, 8000);
        Analytics.createGroup(groupCode);
        closeAllModals();
        await loadGroups();
        
    } catch (error) {
        console.error('Error creating group:', error);
        Toast.error('Error creating group: ' + error.message);
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        await supabase.auth.signOut();
        window.location.href = 'auth.html';
    });
    
    // Join Group Button
    document.getElementById('joinGroupBtn').addEventListener('click', () => {
        document.getElementById('joinGroupModal').style.display = 'block';
    });
    
    // Create Group Button (on dashboard)
    const createGroupBtn2 = document.getElementById('createGroupBtn2');
    if (createGroupBtn2) {
        createGroupBtn2.addEventListener('click', () => {
            document.getElementById('createGroupModal').style.display = 'block';
        });
    }
    
    // Join Group Form
    document.getElementById('joinGroupForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const groupCode = document.getElementById('groupCode').value;
        const groupPassword = document.getElementById('groupPassword').value;
        await joinGroup(groupCode, groupPassword);
    });
    
    // Create Group Button
    document.getElementById('createGroupBtn').addEventListener('click', () => {
        document.getElementById('joinGroupModal').style.display = 'none';
        document.getElementById('createGroupModal').style.display = 'block';
    });
    
    // Create Group Form
    document.getElementById('createGroupForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const groupCode = document.getElementById('newGroupCode').value;
        const password = document.getElementById('newGroupPassword').value;
        const confirmPassword = document.getElementById('confirmGroupPassword').value;
        const budgetMin = parseInt(document.getElementById('budgetMin').value) || 20;
        const budgetMax = parseInt(document.getElementById('budgetMax').value) || 50;
        const exchangeDate = document.getElementById('exchangeDate').value || null;
        const exchangeLocation = document.getElementById('exchangeLocation').value.trim() || null;
        
        if (password !== confirmPassword) {
            Toast.error('Passwords do not match! Please try again.');
            return;
        }
        
        await createGroup(groupCode, password, { budgetMin, budgetMax, exchangeDate, exchangeLocation });
    });
    
    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeAllModals();
        }
    });
    
    // Send Invites Form
    document.getElementById('sendInvitesForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleSendInvites();
    });
}

// Create Invite Email HTML
function createInviteEmailHtml(groupCode, groupPassword, personalMessage, senderName, siteUrl, recipientEmail) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              background: linear-gradient(135deg, #0f7c3a 0%, #c41e3a 100%);
              padding: 20px;
              margin: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: white;
              border-radius: 20px;
              padding: 40px;
              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            }
            h1 {
              color: #c41e3a;
              font-size: 2.5em;
              text-align: center;
              margin-bottom: 20px;
            }
            .invitation-box {
              background: #f0fdf4;
              padding: 25px;
              border-radius: 10px;
              margin: 30px 0;
              border: 3px solid #0f7c3a;
            }
            .credential {
              background: white;
              padding: 15px;
              border-radius: 8px;
              margin: 10px 0;
              font-family: monospace;
              font-size: 1.1em;
            }
            .label {
              color: #666;
              font-size: 0.9em;
              margin-bottom: 5px;
            }
            .value {
              color: #c41e3a;
              font-weight: bold;
              font-size: 1.2em;
            }
            .button {
              display: inline-block;
              background: #c41e3a;
              color: white;
              padding: 15px 30px;
              text-decoration: none;
              border-radius: 10px;
              font-weight: bold;
              margin: 20px auto;
              text-align: center;
            }
            .message-box {
              background: #fef3c7;
              padding: 20px;
              border-radius: 10px;
              margin: 20px 0;
              border-left: 4px solid #ffd700;
            }
            .footer {
              text-align: center;
              color: #666;
              margin-top: 30px;
              font-size: 0.9em;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🎄 You're Invited! 🎅</h1>
            
            <p>Hi there!</p>
            
            ${personalMessage ? `
              <div class="message-box">
                <p style="margin: 0;"><strong>${senderName || 'Your friend'}</strong> says:</p>
                <p style="margin: 10px 0 0 0; font-style: italic;">"${personalMessage}"</p>
              </div>
            ` : ''}
            
            <p>You've been invited to join a Secret Santa group!</p>
            
            <div class="invitation-box">
              <h3 style="color: #0f7c3a; margin-top: 0;">Join Information</h3>
              
              <div class="credential">
                <div class="label">Group Code:</div>
                <div class="value">${groupCode}</div>
              </div>
              
              <div class="credential">
                <div class="label">Password:</div>
                <div class="value">${groupPassword}</div>
              </div>
            </div>
            
            <div style="text-align: center;">
              <a href="${siteUrl}" class="button">
                Join Secret Santa 🎁
              </a>
            </div>
            
            <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 10px;">
              <h4 style="margin-top: 0;">How to Join:</h4>
              <ol style="line-height: 1.8;">
                <li>Click the button above or visit: <a href="${siteUrl}">${siteUrl}</a></li>
                <li>Create an account or sign in</li>
                <li>Click "Join a Group"</li>
                <li>Enter the group code and password above</li>
                <li>Wait for the organizer to draw names</li>
                <li>See who you got and start shopping! 🎅</li>
              </ol>
            </div>
            
            <div class="footer">
              <p>🎄 Secret Santa 2025 🎄</p>
              <p>Spreading holiday cheer, one gift at a time!</p>
            </div>
          </div>
        </body>
        </html>
    `;
}

// Display Invite List with Join Status
function displayInviteList(invites, participants, group) {
    console.log('displayInviteList called:', { invitesLength: invites.length, participantsLength: participants.length });
    
    // Get the container where we'll insert the list
    const container = document.getElementById('inviteListContainer');
    
    if (!container) {
        console.error('❌ inviteListContainer element not found in DOM!');
        return;
    }
    
    console.log('✅ Container found:', container);
    
    // Clear any existing content
    container.innerHTML = '';
    container.style.display = 'block';
    
    if (invites.length === 0) {
        console.log('No invites to display');
        return; // No invites sent yet
    }
    
    // Build the invite list HTML
    container.style.cssText = 'display: block; margin-top: 20px; padding: 15px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 10px;';
    
    let listHtml = '<h3 style="color: var(--gold); margin-top: 0;">📧 Sent Invitations</h3>';
    listHtml += '<div style="display: flex; flex-direction: column; gap: 10px;">';
    
    invites.forEach(invite => {
        // Check if this email has joined by looking for a participant with this email
        const hasJoined = participants.some(p => 
            p.user_profiles && p.user_profiles.email && 
            p.user_profiles.email.toLowerCase() === invite.email.toLowerCase()
        );
        
        const statusIcon = hasJoined ? '✅' : '⏳';
        const statusText = hasJoined ? 'Joined' : 'Pending';
        const statusColor = hasJoined ? '#10b981' : '#f59e0b';
        
        listHtml += `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 8px;">
                <div style="flex: 1;">
                    <span style="color: white; font-weight: 500;">${invite.email}</span>
                    <br>
                    <small style="color: #9ca3af;">Sent ${new Date(invite.sent_at).toLocaleDateString()}</small>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="color: ${statusColor}; font-weight: 600;">${statusIcon} ${statusText}</span>
                    ${!hasJoined ? `
                        <button 
                            class="btn-resend-invite" 
                            data-email="${invite.email}" 
                            data-group-id="${group.id}"
                            style="padding: 5px 12px; background: var(--green); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;"
                        >
                            🔄 Resend
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    });
    
    listHtml += '</div>';
    container.innerHTML = listHtml;
    
    console.log('✅ Invite list HTML inserted into container');
    
    // Add event listeners for resend buttons
    setTimeout(() => {
        const resendButtons = document.querySelectorAll('.btn-resend-invite');
        console.log('Found resend buttons:', resendButtons.length);
        
        resendButtons.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                const email = btn.dataset.email;
                const groupId = btn.dataset.groupId;
                
                if (await Toast.confirm(`Resend invitation to ${email}?`, 'Resend Invite?')) {
                    await resendSingleInvite(email, group);
                }
            });
        });
    }, 100);
}

// Resend Single Invite
async function resendSingleInvite(email, group) {
    try {
        const siteUrl = window.location.origin;
        const senderName = userProfile?.full_name || currentUser?.email || 'Your Friend';
        
        const emailHtml = createInviteEmailHtml(
            group.group_code,
            group.group_password,
            'Reminder: You\'re invited to join our Secret Santa!',
            senderName,
            siteUrl,
            email
        );
        
        const emailEndpoint = window.EMAIL_ENDPOINT || 'http://localhost:5001/send-email';
        
        const response = await fetch(emailEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: 'Secret Santa <santa@holidaydrawnames.com>',
                to: [email],
                subject: `🎅 Reminder: Join Secret Santa - ${group.group_code}`,
                html: emailHtml
            })
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            Toast.success(`Reminder sent to ${email}!`);
            
            // Update timestamp in database
            await supabase
                .from('group_invites')
                .update({ sent_at: new Date().toISOString() })
                .eq('group_id', group.id)
                .eq('email', email);
            
            // Refresh group details
            setTimeout(() => showGroupDetails(group.id), 300);
        } else {
            Toast.error(`Failed to send reminder to ${email}. Please try again.`);
        }
    } catch (error) {
        console.error('Error resending invite:', error);
        Toast.error('Error sending reminder. Please try again.');
    }
}

// Open Invite Modal
function openInviteModal(group) {
    // Close group details modal
    document.getElementById('groupDetailsModal').style.display = 'none';
    
    // Open invite modal
    document.getElementById('sendInvitesModal').style.display = 'block';
    
    // Set group info in preview
    document.getElementById('inviteGroupName').textContent = group.group_code;
    document.getElementById('previewGroupCode').textContent = group.group_code;
    document.getElementById('previewGroupPassword').textContent = group.group_password;
    
    // Store current group for sending
    window.currentInviteGroup = group;
}

// Handle Send Invites
async function handleSendInvites() {
    const emailsText = document.getElementById('inviteEmails').value;
    const personalMessage = document.getElementById('inviteMessage').value.trim();
    const group = window.currentInviteGroup;
    
    if (!group) {
        Toast.error('Error: Group information not found');
        return;
    }
    
    // Parse email addresses (one per line)
    const emails = emailsText
        .split('\n')
        .map(e => e.trim())
        .filter(e => e.length > 0 && e.includes('@'));
    
    if (emails.length === 0) {
        Toast.warning('Please enter at least one valid email address');
        return;
    }
    
    try {
        // Send emails via Netlify function
        const siteUrl = window.location.origin;
        let emailsSent = 0;
        let emailsFailed = 0;
        
        console.log('Sending invites to:', emails);
        console.log('Using endpoint:', window.EMAIL_ENDPOINT);
        
        for (const email of emails) {
            const senderName = userProfile?.full_name || currentUser?.email || 'Your Friend';
            
            const emailHtml = createInviteEmailHtml(
                group.group_code,
                group.group_password,
                personalMessage,
                senderName,
                siteUrl,
                email
            );
            
            try {
                // Determine email endpoint based on environment
                const emailEndpoint = window.EMAIL_ENDPOINT || 'http://localhost:5001/send-email';
                
                console.log(`Sending to ${email} via ${emailEndpoint}`);
                
                const response = await fetch(emailEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        from: 'Secret Santa <santa@holidaydrawnames.com>',
                        to: [email],
                        subject: `🎅 You're Invited to Secret Santa - ${group.group_code}`,
                        html: emailHtml
                    })
                });
                
                let result;
                const responseText = await response.text();
                console.log('Response:', responseText);
                
                try {
                    result = JSON.parse(responseText);
                } catch (parseError) {
                    console.error('Failed to parse response:', responseText);
                    throw new Error(`Invalid response from server: ${responseText.substring(0, 100)}`);
                }
                
                if (response.ok && result.success) {
                    emailsSent++;
                    console.log('✅ Email sent to:', email);
                    
                    // Save invite to database
                    await supabase
                        .from('group_invites')
                        .upsert({
                            group_id: group.id,
                            email: email,
                            sent_by: currentUser.id
                        }, { onConflict: 'group_id,email' });
                    
                } else {
                    emailsFailed++;
                    console.error('Failed to send to', email, result.error);
                    
                    // Check if it's a Resend domain verification error
                    if (result.error && result.error.includes('verify a domain')) {
                        console.log('⚠️ Resend requires domain verification to send to other emails');
                    }
                }
            } catch (emailError) {
                emailsFailed++;
                console.error('Error sending to', email, emailError.message);
                
                // Check if it's a CORS error
                if (emailError.message.includes('CORS') || emailError.message.includes('fetch')) {
                    console.log('CORS error detected - Resend API requires server-side calls');
                }
            }
        }
        
        if (emailsSent > 0) {
            let message = `✅ Success! Invitations sent to ${emailsSent} recipient(s)! 🎄\n\nCheck your inbox!`;
            
            if (emailsFailed > 0) {
                message += `\n\n⚠️ Note: ${emailsFailed} email(s) couldn't be sent.\n\nCheck the Resend dashboard for details or verify your domain is properly configured.`;
            }
            
            Toast.success(message, 8000);
        } else {
            // All failed - create copyable text as fallback
            let inviteText = `🎄 SECRET SANTA INVITATION 🎅\n\n`;
            inviteText += `You're invited to join our Secret Santa group!\n\n`;
            
            if (personalMessage) {
                inviteText += `${userProfile.full_name} says: "${personalMessage}"\n\n`;
            }
            
            inviteText += `JOIN INFORMATION:\n`;
            inviteText += `━━━━━━━━━━━━━━━━━━━━\n`;
            inviteText += `Group Code: ${group.group_code}\n`;
            inviteText += `Password: ${group.group_password}\n`;
            inviteText += `Website: ${window.location.origin}\n`;
            inviteText += `━━━━━━━━━━━━━━━━━━━━\n\n`;
            inviteText += `HOW TO JOIN:\n`;
            inviteText += `1. Visit ${window.location.origin}\n`;
            inviteText += `2. Create an account or sign in\n`;
            inviteText += `3. Click "Join a Group"\n`;
            inviteText += `4. Enter the code and password above\n`;
            inviteText += `5. Wait for the draw!\n\n`;
            inviteText += `🎁 Happy Holidays! 🎄`;
            
            // Copy to clipboard
            try {
                await navigator.clipboard.writeText(inviteText);
                Toast.warning(`Email API unavailable (likely CORS restriction).\n\n✅ Invitation text copied to clipboard!\n\nPaste and send to:\n${emails.join('\n')}\n\nvia your email, text, or messaging app.`, 10000);
            } catch (clipError) {
                Toast.warning(`Email API unavailable.\n\nCopy this invitation and send manually:\n\n${inviteText}\n\nTo: ${emails.join(', ')}`, 10000);
            }
        }
        
        // Close modal and clear form
        closeAllModals();
        document.getElementById('sendInvitesForm').reset();
        
        // Reopen group details to refresh invite list
        setTimeout(() => showGroupDetails(group.id), 300);
        
    } catch (error) {
        console.error('Error sending invites:', error);
        console.error('Error details:', error.message, error.stack);
        
        // More helpful error message
        let errorMsg = 'Error sending invites.\n\n';
        errorMsg += 'Details: ' + error.message + '\n\n';
        errorMsg += 'Please check:\n';
        errorMsg += '1. Your internet connection\n';
        errorMsg += '2. Email addresses are valid\n';
        errorMsg += '3. Try again in a moment\n\n';
        errorMsg += 'Or share the group code and password manually.';
        
        Toast.error(errorMsg, 8000);
    }
}

// Close All Modals
function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
    
    // Clear forms
    document.getElementById('joinGroupForm').reset();
    document.getElementById('createGroupForm').reset();
    document.getElementById('sendInvitesForm')?.reset();
}

// Setup Real-time Listeners
function setupRealtimeListeners() {
    // Listen for changes in user's groups
    supabase
        .channel('dashboard-changes')
        .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'participants',
            filter: `user_id=eq.${currentUser.id}`
        }, () => {
            loadGroups();
        })
        .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'groups'
        }, () => {
            loadGroups();
        })
        .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'assignments'
        }, () => {
            loadGroups();
        })
        .subscribe();
}

// Music Control
function initMusic() {
    const musicToggle = document.getElementById('musicToggle');
    const bgMusic = document.getElementById('bgMusic');
    let musicStarted = false;
    
    bgMusic.volume = 0.5;
    
    // Check if user gave consent
    const shouldAutoplay = userProfile?.music_consent || false;
    
    const startMusic = async () => {
        if (!musicStarted) {
            try {
                bgMusic.currentTime = 0;
                await bgMusic.play();
                musicToggle.textContent = '🎵 Pause Music';
                musicToggle.classList.add('playing');
                musicStarted = true;
            } catch (error) {
                console.log('Music autoplay prevented');
                musicToggle.textContent = '🎵 Play Music';
            }
        }
    };
    
    // Auto-play if user gave consent
    if (shouldAutoplay) {
        // Try immediately
        startMusic();
        
        // Try on first interaction
        const handleFirstInteraction = () => {
            startMusic();
        };
        
        document.addEventListener('click', handleFirstInteraction, { once: true });
        document.addEventListener('touchstart', handleFirstInteraction, { once: true });
    }
    
    // Manual toggle
    musicToggle.addEventListener('click', async () => {
        if (bgMusic.paused) {
            try {
                await bgMusic.play();
                musicToggle.textContent = '🎵 Pause Music';
                musicToggle.classList.add('playing');
                musicStarted = true;
            } catch (error) {
                Toast.info('Unable to play music. Try clicking the button again.');
            }
        } else {
            bgMusic.pause();
            musicToggle.textContent = '🎵 Play Music';
            musicToggle.classList.remove('playing');
        }
    });
}

// ========================================
// UTILITY FUNCTIONS: COPY & QR CODE
// ========================================

// Copy to Clipboard
async function copyToClipboard(text, successMessage = 'Copied to clipboard!') {
    try {
        await navigator.clipboard.writeText(text);
        Toast.success(successMessage);
        Analytics.event('copy_to_clipboard', { content_type: 'text' });
    } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            Toast.success(successMessage);
            Analytics.event('copy_to_clipboard_fallback');
        } catch (e) {
            Toast.error('Failed to copy');
        }
        document.body.removeChild(textArea);
    }
}

// Generate and Show QR Code
async function showQRCode(groupCode, groupPassword) {
    try {
        // Check if QRCode library is loaded
        if (typeof QRCode === 'undefined') {
            Toast.error('QR Code library not loaded. Please refresh the page.');
            console.error('QRCode library not available');
            return;
        }
        
        const joinUrl = `${window.location.origin}/auth.html?join=${groupCode}&pwd=${encodeURIComponent(groupPassword)}`;
        
        // Show modal
        document.getElementById('qrModal').style.display = 'block';
        document.getElementById('qrGroupCode').textContent = `Group: ${groupCode}`;
        
        // Get container (div, not canvas with QRCodeJS)
        const qrContainer = document.getElementById('qrCodeContainer');
        
        // Clear previous QR code
        qrContainer.innerHTML = '';
        
        // Generate QR code using QRCodeJS library
        new QRCode(qrContainer, {
            text: joinUrl,
            width: 256,
            height: 256,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
        });
        
        // Store group code for download
        window.currentQRGroupCode = groupCode;
        window.currentQRContainer = qrContainer;
        
        Analytics.event('generate_qr_code');
        
    } catch (error) {
        console.error('Error generating QR code:', error);
        Toast.error('Error generating QR code: ' + error.message);
    }
}

// Download QR Code as Image
function downloadQRCode() {
    if (!window.currentQRContainer) {
        Toast.error('No QR code to download');
        return;
    }
    
    try {
        // QRCodeJS creates a canvas inside the container
        const canvas = window.currentQRContainer.querySelector('canvas');
        if (!canvas) {
            // Try to find img instead
            const img = window.currentQRContainer.querySelector('img');
            if (img) {
                const link = document.createElement('a');
                link.download = `${window.currentQRGroupCode}-qr-code.png`;
                link.href = img.src;
                link.click();
                Toast.success('QR code downloaded!');
                Analytics.event('download_qr_code');
                return;
            }
            Toast.error('QR code not found');
            return;
        }
        
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `${window.currentQRGroupCode}-qr-code.png`;
        link.href = url;
        link.click();
        Toast.success('QR code downloaded!');
        Analytics.event('download_qr_code');
    } catch (error) {
        console.error('Error downloading QR:', error);
        Toast.error('Error downloading QR code');
    }
}

// Helper functions for group details buttons
function copyGroupPassword() {
    const password = document.getElementById('groupPasswordText').textContent;
    copyToClipboard(password, 'Password copied!');
}

function copyGroupCode() {
    const groupCode = document.getElementById('groupDetailsTitle').textContent;
    copyToClipboard(groupCode, 'Group code copied!');
}

function showGroupQR() {
    const groupCode = document.getElementById('groupDetailsTitle').textContent;
    const password = document.getElementById('groupPasswordText').textContent;
    showQRCode(groupCode, password);
}

// Make functions globally available
window.copyToClipboard = copyToClipboard;
window.showQRCode = showQRCode;
window.downloadQRCode = downloadQRCode;
window.copyGroupPassword = copyGroupPassword;
window.copyGroupCode = copyGroupCode;
window.showGroupQR = showGroupQR;

// ========================================
// WISHLIST FEATURE
// ========================================

// Open Wishlist Modal
async function openWishlist(groupId, participantId, isOwnWishlist = true) {
    try {
        // Store current context
        window.currentWishlistContext = { groupId, participantId, isOwnWishlist };
        
        // Load wishlist items
        await loadWishlistItems(groupId, participantId);
        
        // Update modal title
        const modal = document.getElementById('wishlistModal');
        const title = modal.querySelector('h2');
        const infoText = modal.querySelector('.info-text');
        
        if (isOwnWishlist) {
            title.textContent = '🎁 My Wishlist';
            infoText.textContent = 'Add gift ideas for your Secret Santa to see!';
            document.getElementById('addWishlistItemForm').parentElement.style.display = 'block';
        } else {
            // Get participant name
            const { data: participant } = await supabase
                .from('participants')
                .select('user_id')
                .eq('id', participantId)
                .single();
            
            if (participant) {
                const { data: profile } = await supabase
                    .from('user_profiles')
                    .select('full_name')
                    .eq('id', participant.user_id)
                    .single();
                
                const name = profile?.full_name || 'Unknown';
                title.textContent = `🎁 ${name}'s Wishlist`;
                infoText.textContent = `Gift ideas from your Secret Santa recipient!`;
            }
            // Hide add form when viewing someone else's wishlist
            document.getElementById('addWishlistItemForm').parentElement.style.display = 'none';
        }
        
        modal.style.display = 'block';
        
    } catch (error) {
        console.error('Error opening wishlist:', error);
        Toast.error('Error loading wishlist: ' + error.message);
    }
}

// Load Wishlist Items
async function loadWishlistItems(groupId, participantId) {
    try {
        const { data: items, error } = await supabase
            .from('wishlists')
            .select('*')
            .eq('group_id', groupId)
            .eq('participant_id', participantId)
            .order('priority', { ascending: true })
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        const container = document.getElementById('wishlistItemsContainer');
        
        if (!items || items.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">No items yet. Add your first gift idea above!</p>';
            return;
        }
        
        const isOwnWishlist = window.currentWishlistContext?.isOwnWishlist;
        
        let html = '<div style="display: flex; flex-direction: column; gap: 15px;">';
        
        items.forEach(item => {
            const priorityLabels = {
                1: '⭐ High Priority',
                2: '⭐⭐ Medium',
                3: '⭐⭐⭐ Low Priority'
            };
            
            const priorityColors = {
                1: '#dc2626',
                2: '#f59e0b',
                3: '#10b981'
            };
            
            html += `
                <div style="background: white; border: 2px solid #e5e7eb; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                        <h4 style="margin: 0; color: var(--red); font-size: 1.2em;">${item.item_name}</h4>
                        <div style="display: flex; gap: 8px; align-items: center;">
                            <span style="background: ${priorityColors[item.priority]}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.85em; font-weight: 600;">
                                ${priorityLabels[item.priority]}
                            </span>
                            ${isOwnWishlist ? `
                                <button onclick="deleteWishlistItem('${item.id}')" style="background: #ef4444; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 0.9em;">
                                    🗑️ Remove
                                </button>
                            ` : ''}
                        </div>
                    </div>
                    ${item.item_description ? `<p style="color: #666; margin: 10px 0; line-height: 1.6;">${item.item_description}</p>` : ''}
                    <div style="display: flex; gap: 15px; margin-top: 12px; flex-wrap: wrap;">
                        ${item.item_url ? `<a href="${item.item_url}" target="_blank" style="color: #3b82f6; text-decoration: none; font-size: 0.95em;">🔗 View Item</a>` : ''}
                        ${item.price_range ? `<span style="color: #10b981; font-weight: 600; font-size: 0.95em;">💰 ${item.price_range}</span>` : ''}
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading wishlist items:', error);
        Toast.error('Error loading wishlist items');
    }
}

// Add Wishlist Item
async function addWishlistItem() {
    const context = window.currentWishlistContext;
    if (!context) {
        Toast.error('Wishlist context error');
        return;
    }
    
    const itemName = document.getElementById('wishlistItemName').value.trim();
    const itemDescription = document.getElementById('wishlistItemDescription').value.trim();
    const itemUrl = document.getElementById('wishlistItemUrl').value.trim();
    const itemPrice = document.getElementById('wishlistItemPrice').value.trim();
    const priority = parseInt(document.getElementById('wishlistItemPriority').value);
    
    if (!itemName) {
        Toast.warning('Please enter a gift idea');
        return;
    }
    
    try {
        const { error } = await supabase
            .from('wishlists')
            .insert([{
                group_id: context.groupId,
                participant_id: context.participantId,
                item_name: itemName,
                item_description: itemDescription || null,
                item_url: itemUrl || null,
                price_range: itemPrice || null,
                priority: priority
            }]);
        
        if (error) throw error;
        
        Toast.success(`"${itemName}" added to wishlist!`);
        
        // Clear form
        document.getElementById('addWishlistItemForm').reset();
        
        // Reload items
        await loadWishlistItems(context.groupId, context.participantId);
        
    } catch (error) {
        console.error('Error adding wishlist item:', error);
        if (error.code === '23505') {
            Toast.error('This item is already in your wishlist');
        } else {
            Toast.error('Error adding item: ' + error.message);
        }
    }
}

// Delete Wishlist Item
async function deleteWishlistItem(itemId) {
    const confirmed = await Toast.confirm(
        'Remove this item from your wishlist?',
        'Remove Item?'
    );
    
    if (!confirmed) return;
    
    try {
        const { error } = await supabase
            .from('wishlists')
            .delete()
            .eq('id', itemId);
        
        if (error) throw error;
        
        Toast.success('Item removed from wishlist');
        
        // Reload items
        const context = window.currentWishlistContext;
        if (context) {
            await loadWishlistItems(context.groupId, context.participantId);
        }
        
    } catch (error) {
        console.error('Error deleting wishlist item:', error);
        Toast.error('Error removing item: ' + error.message);
    }
}

// Make functions globally available for onclick
window.openWishlist = openWishlist;
window.addWishlistItem = addWishlistItem;
window.deleteWishlistItem = deleteWishlistItem;

// Make drawNames available globally for onclick
window.drawNames = drawNames;

