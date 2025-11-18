// Check if user is logged in
const userData = localStorage.getItem('user');

console.log('User data from localStorage:', userData); // Debug log

if (!userData || userData === 'undefined' || userData === 'null') {
    // Redirect to login if not logged in
    console.log('No valid user data, redirecting to login');
    window.location.href = 'index.html';
} else {
    // Display user information
    try {
        const user = JSON.parse(userData);
        console.log('Parsed user object:', user); // Debug log

        // Check if user object is valid
        if (!user || typeof user !== 'object') {
            console.error('Invalid user object');
            localStorage.removeItem('user');
            window.location.href = 'index.html';
        } else {
            // Update user name in welcome message
            const userName = user.first_name || 'Student';
            document.getElementById('user-name').textContent = userName;

            // Update profile information
            document.getElementById('user-email').textContent = user.email || 'N/A';
            document.getElementById('user-first_name').textContent = user.first_name || 'N/A';
            document.getElementById('user-last_name').textContent = user.last_name || 'N/A';
            document.getElementById('user-id').textContent = user.ID_number || user.id_number || 'N/A';
            document.getElementById('user-year').textContent = user.Year || 'N/A';
            document.getElementById('user-program').textContent = user.program || 'N/A';
            document.getElementById('user-gender').textContent = user.gender || 'N/A';
        }
    } catch (error) {
        console.error('Error parsing user data:', error);
        // If there's an error parsing user data, redirect to login
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    }
}

// Logout functionality
document.getElementById('logout-btn').addEventListener('click', function (e) {
    e.preventDefault();

    // Confirm logout
    if (confirm('Are you sure you want to logout?')) {
        // Clear user data from localStorage
        localStorage.removeItem('user');

        // Redirect to login page
        window.location.href = 'index.html';
    }
});

// Panel toggle: show jobs by default, show profile when profile nav clicked
function showPanel(panelId) {
    const jobs = document.getElementById('panel-jobs');
    const profile = document.getElementById('panel-profile');
    const appointments = document.getElementById('panel-appointments');
    if (!jobs || !profile) return;

    if (panelId === 'jobs') {
        jobs.classList.remove('hidden');
        profile.classList.add('hidden');
        appointments.classList.add('hidden');
    } else if (panelId === 'profile') {
        profile.classList.remove('hidden');
        jobs.classList.add('hidden');
        appointments.classList.add('hidden');
    } else if (panelId === 'appointments') {
        if (!appointments) return;
        appointments.classList.remove('hidden');
        jobs.classList.add('hidden');
        profile.classList.add('hidden');
    }
}

// Wire nav buttons
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

// Populate counselors list and wire up appointment modal
const counselorsList = document.getElementById('counselors-list');
const counselors = [
    { name: 'Counselor A', id: 'counselor-a' },
    { name: 'Counselor B', id: 'counselor-b' },
    // Add more counselors here
];
counselors.forEach(counselor => {
    const listItem = document.createElement('LI');
    listItem.className = 'cursor-pointer';
    listItem.onclick = function () {
        const modal = document.getElementById('appointment-modal');
        modal.classList.remove('hidden');
        const modalDateDisplay = document.getElementById('modal-date-display');
        modalDateDisplay.textContent = counselor.name;
        const appointmentDateInput = document.getElementById('appointment-date-input');
        appointmentDateInput.value = counselor.id;
    };
    const listText = document.createTextNode(counselor.name);
    listItem.appendChild(listText);
    counselorsList.appendChild(listItem);
});

// Ensure default is jobs feed
showPanel('jobs');
