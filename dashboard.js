// Dashboard Logic for Secret Santa
let supabase;
let currentUser = null;
let userProfile = null;

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', async () => {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
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
        
        if (error) throw error;
        
        userProfile = data;
        document.getElementById('userName').textContent = userProfile.full_name;
        
    } catch (error) {
        console.error('Error loading profile:', error);
        document.getElementById('userName').textContent = currentUser.email;
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
        alert('Error loading groups: ' + error.message);
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
        const { data: profiles, error: profilesError } = await supabase
            .from('user_profiles')
            .select('id, full_name, spouse_name')
            .in('id', userIds);
        
        if (profilesError) throw profilesError;
        
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
        
        // Build modal content
        document.getElementById('groupDetailsTitle').textContent = group.group_code;
        
        // Show password and invite button if user is creator
        const passwordDisplay = document.getElementById('groupPasswordDisplay');
        const inviteSection = document.getElementById('inviteSection');
        
        console.log('Creator check:', { isCreator, hasPassword: !!group.group_password, password: group.group_password });
        
        if (isCreator) {
            if (group.group_password) {
                document.getElementById('groupPasswordText').textContent = group.group_password;
                passwordDisplay.style.display = 'block';
                
                // Show invite button
                inviteSection.style.display = 'block';
                
                // Setup invite button click handler
                const sendInvitesBtn = document.getElementById('sendInvitesBtn');
                sendInvitesBtn.onclick = () => openInviteModal(group);
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
            </div>
            
            <h4>Participants:</h4>
            <ul style="list-style: none; padding: 0;">
        `;
        
        participantsWithProfiles.forEach(p => {
            const profile = p.user_profiles;
            content += `
                <li style="padding: 10px; background: #f8f9fa; margin-bottom: 5px; border-radius: 5px;">
                    ${profile.full_name}
                    ${profile.spouse_name ? ` (married to ${profile.spouse_name})` : ''}
                </li>
            `;
        });
        
        content += '</ul>';
        
        // Add draw button for creator if not drawn yet
        if (isCreator && !group.is_drawn && participantsWithProfiles.length >= 2) {
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
        } else if (isCreator && participantsWithProfiles.length < 2) {
            content += `
                <p style="margin-top: 20px; color: #666;">
                    Need at least 2 participants to draw names
                </p>
            `;
        }
        
        document.getElementById('groupDetailsContent').innerHTML = content;
        document.getElementById('groupDetailsModal').style.display = 'block';
        
    } catch (error) {
        console.error('Error showing group details:', error);
        alert('Error loading group details: ' + error.message);
    }
}

// Draw Names
async function drawNames(groupId) {
    if (!confirm('Are you sure you want to draw names? This cannot be undone!')) {
        return;
    }
    
    try {
        // Get all participants
        const { data: participants, error: participantsError } = await supabase
            .from('participants')
            .select('id, user_id')
            .eq('group_id', groupId);
        
        if (participantsError) throw participantsError;
        
        // Get user profiles for participants
        const userIds = participants.map(p => p.user_id);
        const { data: profiles, error: profilesError } = await supabase
            .from('user_profiles')
            .select('id, full_name, spouse_name')
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
            alert('Need at least 2 participants to draw names');
            return;
        }
        
        // Perform Secret Santa matching
        const assignments = performSecretSantaMatching(participantsWithProfiles, groupId);
        
        if (!assignments) {
            alert('Unable to create valid assignments with the given constraints. Please check spouse pairings.');
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
        
        alert('Names drawn successfully! All participants can now see their assignments.');
        
        // Close modal and reload groups
        document.getElementById('groupDetailsModal').style.display = 'none';
        await loadGroups();
        
    } catch (error) {
        console.error('Error drawing names:', error);
        alert('Error drawing names: ' + error.message);
    }
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
                
                // Can't give to spouse (check both directions)
                if (giverProfile.spouse_name && receiverProfile.full_name === giverProfile.spouse_name) return false;
                if (receiverProfile.spouse_name && giverProfile.full_name === receiverProfile.spouse_name) return false;
                
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
            alert('Group not found! Please check the group code or create a new group.');
            return;
        } else if (groupError) {
            throw groupError;
        }
        
        // Verify password
        if (group.group_password !== groupPassword) {
            alert('Incorrect password! Please check with your group organizer.');
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
            alert('You\'re already in this group!');
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
        
        alert(`Successfully joined ${groupCode}! 🎄`);
        closeAllModals();
        await loadGroups();
        
    } catch (error) {
        console.error('Error joining group:', error);
        alert('Error joining group: ' + error.message);
    }
}

// Create Group
async function createGroup(groupCode, groupPassword) {
    try {
        groupCode = groupCode.trim().toUpperCase();
        
        // Check if group code already exists
        const { data: existing } = await supabase
            .from('groups')
            .select('id')
            .eq('group_code', groupCode)
            .single();
        
        if (existing) {
            alert('This group code is already taken! Please choose a different one.');
            return;
        }
        
        // Create the group
        const { data: newGroup, error: createError } = await supabase
            .from('groups')
            .insert([{ 
                group_code: groupCode, 
                group_password: groupPassword,
                is_drawn: false 
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
        
        alert(`Group "${groupCode}" created successfully! 🎅\n\nShare this info with your group:\nCode: ${groupCode}\nPassword: ${groupPassword}`);
        closeAllModals();
        await loadGroups();
        
    } catch (error) {
        console.error('Error creating group:', error);
        alert('Error creating group: ' + error.message);
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
        
        if (password !== confirmPassword) {
            alert('Passwords do not match! Please try again.');
            return;
        }
        
        await createGroup(groupCode, password);
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
        alert('Error: Group information not found');
        return;
    }
    
    // Parse email addresses (one per line)
    const emails = emailsText
        .split('\n')
        .map(e => e.trim())
        .filter(e => e.length > 0 && e.includes('@'));
    
    if (emails.length === 0) {
        alert('Please enter at least one valid email address');
        return;
    }
    
    try {
        // Send emails directly via Resend API
        const siteUrl = window.location.origin;
        let emailsSent = 0;
        let emailsFailed = 0;
        
        for (const email of emails) {
            const emailHtml = createInviteEmailHtml(
                group.group_code,
                group.group_password,
                personalMessage,
                userProfile.full_name,
                siteUrl,
                email
            );
            
            try {
                // Determine email endpoint based on environment
                const emailEndpoint = window.EMAIL_ENDPOINT || 'http://localhost:5001/send-email';
                
                const response = await fetch(emailEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        from: 'Secret Santa <onboarding@resend.dev>',
                        to: [email],
                        subject: `🎅 You're Invited to Secret Santa - ${group.group_code}`,
                        html: emailHtml
                    })
                });
                
                const result = await response.json();
                
                if (response.ok && result.success) {
                    emailsSent++;
                    console.log('✅ Email sent to:', email);
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
                message += `\n\n⚠️ Note: ${emailsFailed} email(s) couldn't be sent.\n\nResend's free tier only allows sending to YOUR email (mreoch82@hotmail.com) until you verify a domain.\n\nTo send to others: Visit resend.com/domains to verify a domain, or use the clipboard copy feature!`;
            }
            
            alert(message);
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
                alert(`⚠️ Email API unavailable (likely CORS restriction).\n\n✅ Invitation text copied to clipboard!\n\nPaste and send to:\n${emails.join('\n')}\n\nvia your email, text, or messaging app.`);
            } catch (clipError) {
                alert(`⚠️ Email API unavailable.\n\nCopy this invitation and send manually:\n\n${inviteText}\n\nTo: ${emails.join(', ')}`);
            }
        }
        
        // Close modal and clear form
        closeAllModals();
        document.getElementById('sendInvitesForm').reset();
        
        // Reopen group details
        setTimeout(() => showGroupDetails(group.id), 300);
        
    } catch (error) {
        console.error('Error sending invites:', error);
        alert('Error sending invites. Please try again or share the group code manually.');
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
                alert('Unable to play music');
            }
        } else {
            bgMusic.pause();
            musicToggle.textContent = '🎵 Play Music';
            musicToggle.classList.remove('playing');
        }
    });
}

// Make drawNames available globally for onclick
window.drawNames = drawNames;

