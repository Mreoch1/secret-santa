// Initialize Supabase client
let supabase;

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Supabase
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Initialize music control
    initMusic();
    
    // Check if user has active session
    checkSession();
    
    // Setup event listeners
    setupEventListeners();
});

// Music Control - Auto-starts on ANY user interaction
function initMusic() {
    const musicToggle = document.getElementById('musicToggle');
    const bgMusic = document.getElementById('bgMusic');
    let musicStarted = false;
    
    // Set initial volume and loop
    bgMusic.volume = 0.3; // Lower volume so it's not too loud
    bgMusic.loop = true;
    
    // Function to start music
    const startMusic = async () => {
        if (!musicStarted) {
            try {
                bgMusic.currentTime = 0;
                const playPromise = bgMusic.play();
                
                if (playPromise !== undefined) {
                    await playPromise;
                    if (musicToggle) {
                        musicToggle.textContent = '🔇 Pause Music';
                        musicToggle.classList.add('playing');
                    }
                    musicStarted = true;
                    console.log('🎵 Music started automatically!');
                }
            } catch (error) {
                console.log('Music autoplay prevented:', error.message);
                if (musicToggle) {
                    musicToggle.textContent = '🎵 Play Music';
                    musicToggle.classList.remove('playing');
                }
            }
        }
    };
    
    // AUTOMATIC START on first interaction
    const handleFirstInteraction = async () => {
        await startMusic();
    };
    
    // Listen for ANY interaction - music starts automatically!
    document.addEventListener('click', handleFirstInteraction, { capture: true, once: true });
    document.addEventListener('touchstart', handleFirstInteraction, { capture: true, once: true });
    document.addEventListener('keydown', handleFirstInteraction, { capture: true, once: true });
    document.addEventListener('mousemove', handleFirstInteraction, { once: true });
    document.addEventListener('scroll', handleFirstInteraction, { once: true });
    
    // Toggle music on button click (pause/play)
    if (musicToggle) {
        musicToggle.addEventListener('click', async (e) => {
            e.stopPropagation();
            
            if (bgMusic.paused) {
                try {
                    await bgMusic.play();
                    musicToggle.textContent = '🔇 Pause Music';
                    musicToggle.classList.add('playing');
                    musicStarted = true;
                } catch (error) {
                    console.error('Failed to play music:', error);
                }
            } else {
                bgMusic.pause();
                musicToggle.textContent = '🎵 Play Music';
                musicToggle.classList.remove('playing');
            }
        });
    }
}

// Setup Event Listeners
function setupEventListeners() {
    const joinForm = document.getElementById('joinForm');
    const drawNamesBtn = document.getElementById('drawNamesBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const joinAnotherBtn = document.getElementById('joinAnotherBtn');
    
    joinForm.addEventListener('submit', handleJoinGroup);
    drawNamesBtn.addEventListener('click', handleDrawNames);
    logoutBtn.addEventListener('click', handleLogout);
    
    if (joinAnotherBtn) {
        joinAnotherBtn.addEventListener('click', () => {
            // Go back to main page to join another group
            document.getElementById('dashboardPage').classList.remove('active');
            document.getElementById('mainPage').classList.add('active');
            
            // Clear the form
            document.getElementById('joinForm').reset();
        });
    }
}

// Check if user has active session
async function checkSession() {
    const sessions = JSON.parse(localStorage.getItem('secretSantaSessions') || '[]');
    
    if (sessions.length > 0) {
        // Get current active group or use the first one
        const currentGroupId = localStorage.getItem('currentGroupId');
        let session = sessions.find(s => s.groupId === currentGroupId) || sessions[0];
        
        // Fetch latest group data to get created_by
        const { data: group, error } = await supabase
            .from('groups')
            .select('*')
            .eq('id', session.groupId)
            .single();
        
        if (!error && group) {
            session.group = group;
            session.isCreator = group.created_by === session.participantId;
        }
        
        // Show group selector if multiple groups
        if (sessions.length > 1) {
            showGroupSelector(sessions, session.groupId);
        }
        
        loadDashboard(session);
    }
}

// Handle Join Group Form Submission
async function handleJoinGroup(e) {
    e.preventDefault();
    
    const groupCode = document.getElementById('groupCode').value.trim().toUpperCase();
    const participantName = document.getElementById('participantName').value.trim();
    const participantEmail = document.getElementById('participantEmail').value.trim();
    const spouseName = document.getElementById('spouseName').value.trim() || null;
    
    try {
        // Check if group exists, if not create it
        let { data: group, error: groupError } = await supabase
            .from('groups')
            .select('*')
            .eq('group_code', groupCode)
            .single();
        
        if (groupError && groupError.code === 'PGRST116') {
            // Group doesn't exist, this user is creating it
            // We'll set created_by after creating the participant
            const { data: newGroup, error: createError } = await supabase
                .from('groups')
                .insert([{ group_code: groupCode, is_drawn: false }])
                .select()
                .single();
            
            if (createError) throw createError;
            group = newGroup;
        } else if (groupError) {
            throw groupError;
        }
        
        // Check if group has already drawn names
        if (group.is_drawn) {
            alert('This group has already completed the Secret Santa draw. Please create a new group or contact your group organizer.');
            return;
        }
        
        // Check if participant already exists in this group
        const { data: existingParticipant } = await supabase
            .from('participants')
            .select('*')
            .eq('group_id', group.id)
            .eq('email', participantEmail)
            .single();
        
        if (existingParticipant) {
            // User already joined, save session and load dashboard
            saveSession(group, existingParticipant);
            
            // Get all sessions to check if multiple groups
            const sessions = JSON.parse(localStorage.getItem('secretSantaSessions') || '[]');
            if (sessions.length > 1) {
                showGroupSelector(sessions, group.id);
            }
            
            loadDashboard({ group, participant: existingParticipant });
            return;
        }
        
        // Add participant to group
        const { data: participant, error: participantError } = await supabase
            .from('participants')
            .insert([{
                group_id: group.id,
                name: participantName,
                email: participantEmail,
                spouse_name: spouseName
            }])
            .select()
            .single();
        
        if (participantError) throw participantError;
        
        // If this is a new group (no created_by set), set this participant as the creator
        if (!group.created_by) {
            const { error: updateError } = await supabase
                .from('groups')
                .update({ created_by: participant.id })
                .eq('id', group.id);
            
            if (updateError) throw updateError;
            group.created_by = participant.id;
        }
        
        // Save session
        saveSession(group, participant);
        
        // Load dashboard
        loadDashboard({ group, participant });
        
    } catch (error) {
        console.error('Error joining group:', error);
        alert('Error joining group: ' + error.message);
    }
}

// Save session to localStorage (supports multiple groups)
function saveSession(group, participant) {
    const newSession = {
        groupId: group.id,
        groupCode: group.group_code,
        participantId: participant.id,
        participantName: participant.name,
        participantEmail: participant.email,
        isCreator: group.created_by === participant.id
    };
    
    // Get existing sessions
    let sessions = JSON.parse(localStorage.getItem('secretSantaSessions') || '[]');
    
    // Check if session for this group already exists
    const existingIndex = sessions.findIndex(s => s.groupId === group.id && s.participantEmail === participant.email);
    
    if (existingIndex >= 0) {
        // Update existing session
        sessions[existingIndex] = newSession;
    } else {
        // Add new session
        sessions.push(newSession);
    }
    
    // Save all sessions
    localStorage.setItem('secretSantaSessions', JSON.stringify(sessions));
    
    // Set current active group
    localStorage.setItem('currentGroupId', group.id);
}

// Load Dashboard
async function loadDashboard(session) {
    // Hide main page, show dashboard
    document.getElementById('mainPage').classList.remove('active');
    document.getElementById('dashboardPage').classList.add('active');
    
    // Update user info
    document.getElementById('userName').textContent = session.participant?.name || session.participantName;
    document.getElementById('userGroupCode').textContent = session.group?.group_code || session.groupCode;
    
    // Load participants list
    await loadParticipants(session.group || { id: session.groupId });
    
    // Check if draw has been completed
    await checkAssignment(session);
    
    // Check if current user is the creator and show/hide appropriate section
    const isCreator = session.participant?.id === session.group?.created_by || session.isCreator;
    const groupAdmin = document.getElementById('groupAdmin');
    const groupMember = document.getElementById('groupMember');
    
    if (!isCreator) {
        // Show member view, hide admin view
        groupAdmin.style.display = 'none';
        groupMember.style.display = 'block';
    } else {
        // Show admin view, hide member view
        groupAdmin.style.display = 'block';
        groupMember.style.display = 'none';
    }
    
    // Set up real-time updates
    setupRealtimeUpdates(session);
}

// Load Participants
async function loadParticipants(group) {
    try {
        const { data: participants, error } = await supabase
            .from('participants')
            .select('*')
            .eq('group_id', group.id);
        
        if (error) throw error;
        
        const participantsList = document.getElementById('participantsList');
        const participantsListMember = document.getElementById('participantsListMember');
        const participantCount = document.getElementById('participantCount');
        
        participantsList.innerHTML = '';
        participantsListMember.innerHTML = '';
        participantCount.textContent = participants.length;
        
        participants.forEach(p => {
            // Create list item for admin view
            const liAdmin = document.createElement('li');
            liAdmin.textContent = p.name;
            if (p.spouse_name) {
                liAdmin.textContent += ` (married to ${p.spouse_name})`;
            }
            participantsList.appendChild(liAdmin);
            
            // Create list item for member view
            const liMember = document.createElement('li');
            liMember.textContent = p.name;
            if (p.spouse_name) {
                liMember.textContent += ` (married to ${p.spouse_name})`;
            }
            participantsListMember.appendChild(liMember);
        });
        
    } catch (error) {
        console.error('Error loading participants:', error);
    }
}

// Check Assignment
async function checkAssignment(session) {
    try {
        const participantId = session.participant?.id || session.participantId;
        
        const { data: assignment, error } = await supabase
            .from('assignments')
            .select('*, receiver:receiver_id(*)')
            .eq('giver_id', participantId)
            .single();
        
        if (error && error.code !== 'PGRST116') throw error;
        
        if (assignment) {
            // Show assignment
            document.getElementById('waitingMessage').classList.add('hidden');
            const assignmentResult = document.getElementById('assignmentResult');
            assignmentResult.classList.remove('hidden');
            document.getElementById('receiverName').textContent = assignment.receiver.name;
            
            // Hide admin/member sections once draw is complete
            document.getElementById('groupAdmin').style.display = 'none';
            document.getElementById('groupMember').style.display = 'none';
        } else {
            // Still waiting for draw
            document.getElementById('waitingMessage').classList.remove('hidden');
            document.getElementById('assignmentResult').classList.add('hidden');
        }
        
    } catch (error) {
        console.error('Error checking assignment:', error);
    }
}

// Handle Draw Names
async function handleDrawNames() {
    const session = JSON.parse(localStorage.getItem('secretSantaSession'));
    
    if (!confirm('Are you sure all participants have joined? This will assign Secret Santa names!')) {
        return;
    }
    
    try {
        // Get all participants in the group
        const { data: participants, error: participantsError } = await supabase
            .from('participants')
            .select('*')
            .eq('group_id', session.groupId);
        
        if (participantsError) throw participantsError;
        
        if (participants.length < 2) {
            alert('You need at least 2 participants to draw names!');
            return;
        }
        
        // Perform Secret Santa matching
        const assignments = performSecretSantaMatching(participants);
        
        if (!assignments) {
            alert('Unable to create valid assignments. Please check that the spouse constraints can be satisfied.');
            return;
        }
        
        // Save assignments to database
        const { error: assignmentError } = await supabase
            .from('assignments')
            .insert(assignments);
        
        if (assignmentError) throw assignmentError;
        
        // Mark group as drawn
        const { error: updateError } = await supabase
            .from('groups')
            .update({ is_drawn: true })
            .eq('id', session.groupId);
        
        if (updateError) throw updateError;
        
        // Send emails via Edge Function
        await sendAssignmentEmails(assignments, participants);
        
        alert('Secret Santa assignments complete! Everyone will receive an email with their assignment.');
        
        // Reload dashboard to show assignment
        location.reload();
        
    } catch (error) {
        console.error('Error drawing names:', error);
        alert('Error drawing names: ' + error.message);
    }
}

// Secret Santa Matching Algorithm
function performSecretSantaMatching(participants) {
    // Create a list of givers and receivers
    let givers = [...participants];
    let receivers = [...participants];
    let assignments = [];
    
    // Try to create valid assignments (with retry logic)
    for (let attempt = 0; attempt < 100; attempt++) {
        assignments = [];
        let tempReceivers = [...receivers];
        let valid = true;
        
        for (let giver of givers) {
            // Filter out invalid receivers (self and spouse)
            let validReceivers = tempReceivers.filter(receiver => {
                if (receiver.id === giver.id) return false; // Can't give to self
                if (giver.spouse_name && receiver.name === giver.spouse_name) return false; // Can't give to spouse
                if (receiver.spouse_name && giver.name === receiver.spouse_name) return false; // Can't give to spouse (reverse check)
                return true;
            });
            
            if (validReceivers.length === 0) {
                // No valid assignment possible, retry
                valid = false;
                break;
            }
            
            // Randomly select a receiver
            const randomIndex = Math.floor(Math.random() * validReceivers.length);
            const selectedReceiver = validReceivers[randomIndex];
            
            // Create assignment
            assignments.push({
                group_id: giver.group_id,
                giver_id: giver.id,
                receiver_id: selectedReceiver.id
            });
            
            // Remove selected receiver from pool
            tempReceivers = tempReceivers.filter(r => r.id !== selectedReceiver.id);
        }
        
        if (valid) {
            return assignments;
        }
    }
    
    // Failed to find valid assignment after 100 attempts
    return null;
}

// Send Assignment Emails
async function sendAssignmentEmails(assignments, participants) {
    try {
        // Call Supabase Edge Function to send emails
        const { data, error } = await supabase.functions.invoke('send-assignment-emails', {
            body: { assignments, participants }
        });
        
        if (error) throw error;
        
        console.log('Emails sent successfully');
    } catch (error) {
        console.error('Error sending emails:', error);
        // Don't fail the draw if emails fail
    }
}

// Setup Real-time Updates
function setupRealtimeUpdates(session) {
    const groupId = session.group?.id || session.groupId;
    
    // Subscribe to changes in participants
    supabase
        .channel('participants-changes')
        .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'participants',
            filter: `group_id=eq.${groupId}`
        }, () => {
            loadParticipants({ id: groupId });
        })
        .subscribe();
    
    // Subscribe to changes in assignments
    supabase
        .channel('assignments-changes')
        .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'assignments'
        }, () => {
            checkAssignment(session);
        })
        .subscribe();
}

// Show Group Selector
function showGroupSelector(sessions, currentGroupId) {
    const groupSelectorContainer = document.getElementById('groupSelector');
    const groupSelectorSelect = document.getElementById('groupSelectorSelect');
    
    if (!groupSelectorContainer || !groupSelectorSelect) return;
    
    // Show the selector
    groupSelectorContainer.style.display = 'block';
    
    // Clear existing options
    groupSelectorSelect.innerHTML = '';
    
    // Add options for each group
    sessions.forEach(session => {
        const option = document.createElement('option');
        option.value = session.groupId;
        option.textContent = `${session.groupCode} (${session.participantName})`;
        if (session.groupId === currentGroupId) {
            option.selected = true;
        }
        groupSelectorSelect.appendChild(option);
    });
    
    // Add change event listener
    groupSelectorSelect.addEventListener('change', async (e) => {
        const newGroupId = e.target.value;
        localStorage.setItem('currentGroupId', newGroupId);
        location.reload();
    });
}

// Handle Logout
function handleLogout() {
    const sessions = JSON.parse(localStorage.getItem('secretSantaSessions') || '[]');
    const currentGroupId = localStorage.getItem('currentGroupId');
    
    if (sessions.length > 1) {
        // Multiple groups - ask if they want to leave this one or all
        const choice = confirm('Leave just this group? (Cancel to leave ALL groups)');
        
        if (choice) {
            // Leave only current group
            const updatedSessions = sessions.filter(s => s.groupId !== currentGroupId);
            localStorage.setItem('secretSantaSessions', JSON.stringify(updatedSessions));
            
            if (updatedSessions.length > 0) {
                // Switch to another group
                localStorage.setItem('currentGroupId', updatedSessions[0].groupId);
                location.reload();
            } else {
                // No groups left
                localStorage.removeItem('secretSantaSessions');
                localStorage.removeItem('currentGroupId');
                location.reload();
            }
        } else {
            // Leave all groups
            localStorage.removeItem('secretSantaSessions');
            localStorage.removeItem('currentGroupId');
            location.reload();
        }
    } else {
        // Only one group
        if (confirm('Are you sure you want to leave this group?')) {
            localStorage.removeItem('secretSantaSessions');
            localStorage.removeItem('currentGroupId');
            location.reload();
        }
    }
}

