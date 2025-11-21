// --- AUTHENTICATION CHECK ---
const userData = localStorage.getItem('user');
console.log('User data from localStorage:', userData);

if (!userData || userData === 'undefined' || userData === 'null') {
    console.log('No valid user data, redirecting to login');
    window.location.href = 'index.html';
} else {
    try {
        const user = JSON.parse(userData);
        console.log('Parsed user object:', user);

        if (!user || typeof user !== 'object') {
            console.error('Invalid user object');
            localStorage.removeItem('user');
            window.location.href = 'index.html';
        } else {
            // 1. Update Welcome Message
            const userName = user.first_name || 'Student';
            const userNameElement = document.getElementById('user-name');
            if (userNameElement) userNameElement.textContent = userName;

            // 2. Update Main Profile Panel Information
            if (document.getElementById('user-email')) document.getElementById('user-email').textContent = user.email || 'N/A';
            if (document.getElementById('user-first_name')) document.getElementById('user-first_name').textContent = user.first_name || 'N/A';
            if (document.getElementById('user-last_name')) document.getElementById('user-last_name').textContent = user.last_name || 'N/A';
            if (document.getElementById('user-id')) document.getElementById('user-id').textContent = user.ID_number || user.id_number || 'N/A';
            if (document.getElementById('user-year')) document.getElementById('user-year').textContent = user.Year || 'N/A';
            if (document.getElementById('user-program')) document.getElementById('user-program').textContent = user.program || 'N/A';
            if (document.getElementById('user-gender')) document.getElementById('user-gender').textContent = user.gender || 'N/A';

            // 3. NEW: Update Sidebar Profile Information
            const sidebarName = document.getElementById('sidebar-name');
            const sidebarId = document.getElementById('sidebar-id');
            const sidebarInitials = document.getElementById('sidebar-initials');

            if (sidebarName) sidebarName.textContent = user.first_name + ' ' + (user.last_name || '');
            if (sidebarId) sidebarId.textContent = user.ID_number || user.id_number || 'ID: ----';

            if (sidebarInitials) {
                const fInitial = (user.first_name || '').charAt(0).toUpperCase();
                const lInitial = (user.last_name || '').charAt(0).toUpperCase();
                sidebarInitials.textContent = (fInitial + lInitial) || 'U';
            }
        }
    } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    }
}

// --- LOGOUT FUNCTIONALITY ---
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', function (e) {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('user');
            window.location.href = 'index.html';
        }
    });
}

// --- NAVIGATION & PANEL LOGIC ---
function showPanel(panelId) {
    const jobs = document.getElementById('panel-jobs');
    const profile = document.getElementById('panel-profile');
    const appointments = document.getElementById('panel-appointments');

    // Hide all first
    if (jobs) jobs.classList.add('hidden');
    if (profile) profile.classList.add('hidden');
    if (appointments) appointments.classList.add('hidden');

    // Show the selected one
    if (panelId === 'jobs' && jobs) jobs.classList.remove('hidden');
    else if (panelId === 'profile' && profile) profile.classList.remove('hidden');
    else if (panelId === 'appointments' && appointments) appointments.classList.remove('hidden');
}
document.addEventListener('DOMContentLoaded', () => {
    // Define the relationship between Links and Panels
    const navItems = [
        { navId: 'nav-dashboard', panelId: 'panel-dashboard' },
        { navId: 'nav-profile', panelId: 'panel-profile' },
        { navId: 'nav-appointments', panelId: 'panel-appointments' },
        { navId: 'nav-resume', panelId: 'panel-resume' },
        { navId: 'nav-messages', panelId: 'panel-messages' }
    ];

    // Function to switch tabs
    function switchTab(clickedNavId) {
        navItems.forEach(item => {
            const link = document.getElementById(item.navId);
            const panel = document.getElementById(item.panelId);

            if (item.navId === clickedNavId) {
                // Activate this tab
                if(link) link.classList.add('bg-secondary');
                if(panel) panel.classList.remove('hidden');
            } else {
                // Deactivate others
                if(link) link.classList.remove('bg-secondary');
                if(panel) panel.classList.add('hidden');
            }
        });
    }

    // Add click event listeners to all links
    navItems.forEach(item => {
        const link = document.getElementById(item.navId);
        if (link) {
            link.addEventListener('click', (e) => {
                e.preventDefault(); // Stop the link from jumping to top
                switchTab(item.navId);
            });
        }
    });
});

// Wire up navigation buttons
const navProfile = document.getElementById('nav-profile');
const navDashboard = document.getElementById('nav-dashboard');
const navAppointments = document.getElementById('nav-appointments');

if (navProfile) {
    navProfile.addEventListener('click', (e) => {
        e.preventDefault();
        showPanel('profile');
    });
}
if (navDashboard) {
    navDashboard.addEventListener('click', (e) => {
        e.preventDefault();
        showPanel('jobs');
    });
}
if (navAppointments) {
    navAppointments.addEventListener('click', (e) => {
        e.preventDefault();
        showPanel('appointments');
    });
}

// Initialize Default View
showPanel('jobs');


// --- COUNSELOR & APPOINTMENT LOGIC ---
const counselorsList = document.getElementById('counselors-list');
if (counselorsList) {
    const counselors = [
        { name: 'Counselor A', id: 'counselor-a' },
        { name: 'Counselor B', id: 'counselor-b' },
    ];

    counselors.forEach(counselor => {
        const listItem = document.createElement('LI');
        listItem.className = 'cursor-pointer hover:text-primary transition-colors'; // Added hover effect
        listItem.onclick = function () {
            const modal = document.getElementById('appointment-modal');
            if (modal) {
                modal.classList.remove('hidden');
                const modalDateDisplay = document.getElementById('modal-date-display');
                if (modalDateDisplay) modalDateDisplay.textContent = counselor.name;
                
                const appointmentDateInput = document.getElementById('appointment-date-input');
                if (appointmentDateInput) appointmentDateInput.value = counselor.id;
            }
        };
        const listText = document.createTextNode(counselor.name);
        listItem.appendChild(listText);
        counselorsList.appendChild(listItem);
    });
}
// --- SIDEBAR TOGGLE ANIMATION ---
const sidebar = document.getElementById('sidebar');
const sidebarToggleBtn = document.getElementById('sidebar-toggle');
const sidebarTexts = document.querySelectorAll('.sidebar-text');

if (sidebar && sidebarToggleBtn) {
    // Function to apply collapsed state
    function collapseSidebar() {
        sidebar.classList.remove('w-64');
        sidebar.classList.add('w-24');
        sidebarTexts.forEach(text => {
            text.classList.add('opacity-0');
            text.classList.add('pointer-events-none');
        });
        sidebarToggleBtn.classList.remove('right-4');
        sidebarToggleBtn.classList.add('right-9');
    }

    // Function to apply expanded state
    function expandSidebar() {
        sidebar.classList.remove('w-24');
        sidebar.classList.add('w-64');
        sidebarTexts.forEach(text => {
            text.classList.remove('opacity-0');
            text.classList.remove('pointer-events-none');
        });
        sidebarToggleBtn.classList.remove('right-9');
        sidebarToggleBtn.classList.add('right-4');
    }

    // Load state from localStorage on page load (default to collapsed)
    const isCollapsed = localStorage.getItem('sidebarCollapsed') !== 'false'; // Default to true (collapsed) if not set
    if (isCollapsed) {
        collapseSidebar();
    } else {
        expandSidebar();
    }

    // Toggle event listener
    sidebarToggleBtn.addEventListener('click', () => {
        const currentlyCollapsed = sidebar.classList.contains('w-24');
        if (currentlyCollapsed) {
            // EXPAND
            expandSidebar();
            localStorage.setItem('sidebarCollapsed', 'false');
        } else {
            // MINIMIZE
            collapseSidebar();
            localStorage.setItem('sidebarCollapsed', 'true');
        }
    });
}

// Function to OPEN the modal
function openAppointmentModal(counselorName, role) {
    const modal = document.getElementById('appointment-modal');
    const nameDisplay = document.getElementById('modal-counselor-name');
    
    // Set the name in the modal so the user knows who they are booking
    if(nameDisplay) {
        nameDisplay.textContent = counselorName;
    }

    // Show modal
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

// Function to CLOSE the modal
function closeModal(event) {
    // If event is passed, check if clicked outside (backdrop)
    if (event && event.target.id !== 'appointment-modal') {
        return; 
    }
    
    const modal = document.getElementById('appointment-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

// Handle Form Submission (Optional - just logs data for now)
document.getElementById('appointment-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Gather data
    const topic = document.getElementById('meeting-topic').value;
    const date = document.getElementById('meeting-date').value;
    const time = document.getElementById('meeting-time').value;
    const mode = document.querySelector('input[name="meeting_mode"]:checked').value;
    const counselor = document.getElementById('modal-counselor-name').textContent;

    alert(`Appointment Set!\n\nCounselor: ${counselor}\nTopic: ${topic}\nDate: ${date}\nTime: ${time}\nMode: ${mode}`);
    
    closeModal();
});

function previewImage(event) {
    const input = event.target;
    
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            // 1. Update the large profile image in the Profile Panel
            const largeImg = document.getElementById('profile-img-large');
            if(largeImg) largeImg.src = e.target.result;
            
            // 2. Update the small sidebar image
            const sidebarImg = document.getElementById('sidebar-img');
            if(sidebarImg) sidebarImg.src = e.target.result;
        }
        
        // Read the image file
        reader.readAsDataURL(input.files[0]);
    }
}