// dashboardscript.js

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
            // 1. Update Profile Panel Information
            if (document.getElementById('user-email')) document.getElementById('user-email').textContent = user.email || 'N/A';
            if (document.getElementById('user-first_name')) document.getElementById('user-first_name').textContent = user.first_name || 'N/A';
            if (document.getElementById('user-last_name')) document.getElementById('user-last_name').textContent = user.last_name || 'N/A';
            if (document.getElementById('user-id')) document.getElementById('user-id').textContent = user.ID_number || user.id_number || 'N/A';
            if (document.getElementById('user-year')) document.getElementById('user-year').textContent = user.Year || 'N/A';
            if (document.getElementById('user-program')) document.getElementById('user-program').textContent = user.program || 'N/A';
            if (document.getElementById('user-gender')) document.getElementById('user-gender').textContent = user.gender || 'N/A';

            // 2. Update Sidebar Profile Information
            const sidebarName = document.getElementById('sidebar-name');
            const sidebarId = document.getElementById('sidebar-id');
            // sidebarInitials element is not defined in HTML, removing usage here
            
            if (sidebarName) sidebarName.textContent = user.first_name + ' ' + (user.last_name || '');
            if (sidebarId) sidebarId.textContent = user.ID_number || user.id_number || 'ID: ----';
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


// --- POST FEED LOGIC ---
const FEED_API_URL = '/app/posts'; 

/**
 * Renders a single post object into the feed container.
 */
function renderPostCard(post, container) {
    const postCard = document.createElement('div');
    postCard.className = 'bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200';
    
    // --- Fallback and Display Variables ---
    const postedBy = post.posted_by || 'Admin';
    const postTitle = post.title || 'Untitled Post';
    const postDescription = post.description || 'No description provided.';
    const postPhotoLink = post.post_photo_link || 'https://placehold.co/600x300/CCCCCC/white?text=No+Image';
    const profilePictureLink = post.profile_link;
    const initial = postedBy.charAt(0).toUpperCase();


    // 1. FIXED DATE LOGIC: Ensure a valid date is displayed
    let displayDate = 'Unknown Date';
    try {
        const dateObj = new Date(post.date_posted);
        // Date.parse returns NaN for invalid dates
        if (!isNaN(dateObj.getTime())) { 
            displayDate = dateObj.toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
            });
        }
    } catch (e) {
        console.error('Date parsing failed:', e);
    }
    
    // 2. FIXED PROFILE IMAGE/INITIAL LOGIC: Use the image URL if provided, otherwise use the initial
    let profileHTML;
    if (profilePictureLink && profilePictureLink !== 'null' && profilePictureLink !== 'undefined') {
        // Option A: Display the actual profile image
        profileHTML = `<img src="${profilePictureLink}" 
                            alt="${postedBy} Profile" 
                            class="w-full h-full object-cover">`;
    } else {
        // Option B: Fallback to the initial avatar
        profileHTML = `<div class="h-10 w-10 min-w-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                        ${initial}
                       </div>`;
    }

    // 3. Construct the HTML
    postCard.innerHTML = `
        <div class="flex items-center gap-3 p-4 border-b border-gray-50 bg-gray-50/50">
            <div class="h-10 w-10 min-w-10 rounded-full overflow-hidden relative">
                ${profileHTML}
            </div>
            <div>
                <h3 class="font-semibold text-gray-800 text-sm">${postedBy}</h3>
                <p class="text-xs text-gray-500">Posted ${displayDate}</p>
            </div>
        </div>
        <div class="p-4">
            <h4 class="text-gray-700 mb-2 font-bold">${postTitle}</h4>
            <p class="text-gray-700 mb-4">${postDescription}</p>
            
            <div class="rounded-lg overflow-hidden border border-gray-100">
                <img src="${postPhotoLink}" 
                     alt="${postTitle} Image" 
                     class="w-full h-auto object-cover max-h-96">
            </div>
        </div>
    `;

    container.appendChild(postCard);
}


/**
 * Main function to fetch all posts from the backend API.
 */
async function fetchAllPosts() {
    const feedContainer = document.getElementById('counselor-feed');
    
    feedContainer.innerHTML = '<p class="text-center text-gray-500">Loading posts...</p>';

    try {
        const response = await fetch(FEED_API_URL);

        if (!response.ok) {
            throw new Error(`Failed to fetch posts: HTTP status ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success && result.data && Array.isArray(result.data)) {
            feedContainer.innerHTML = ''; // Clear loading message

            if (result.data.length === 0) {
                 feedContainer.innerHTML = '<p class="text-center text-gray-500">The feed is currently empty.</p>';
                 return;
            }

            // Render each post retrieved from the database
            result.data.forEach(post => {
                renderPostCard(post, feedContainer);
            });
            
        } else {
            feedContainer.innerHTML = '<p class="text-center text-red-500">Error: Invalid data format received from server.</p>';
        }

    } catch (error) {
        console.error('API Fetch Error:', error);
        feedContainer.innerHTML = `<p class="text-center text-red-500">Could not connect to the API. Check your console for details. (URL: ${FEED_API_URL})</p>`;
    }
}


// --- NAVIGATION & PANEL LOGIC ---

// Centralized function to show a panel and handle specific actions (like fetching posts)
function showPanel(panelId) {
    const panels = document.querySelectorAll('.panel-section');
    panels.forEach(panel => {
        if (panel.id === panelId) {
            panel.classList.remove('hidden');
        } else {
            panel.classList.add('hidden');
        }
    });

    // ❗ Call the fetch function when the dashboard is opened ❗
    if (panelId === 'panel-dashboard') {
        fetchAllPosts();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const navItems = [
        { navId: 'nav-dashboard', panelId: 'panel-dashboard' },
        { navId: 'nav-profile', panelId: 'panel-profile' },
        { navId: 'nav-appointments', panelId: 'panel-appointments' },
        { navId: 'nav-resume', panelId: 'panel-resume' },
        { navId: 'nav-messages', panelId: 'panel-messages' }
    ];

    function switchTab(clickedNavId) {
        navItems.forEach(item => {
            const link = document.getElementById(item.navId);
            
            if (item.navId === clickedNavId) {
                if(link) link.classList.add('bg-secondary');
                showPanel(item.panelId); 
            } else {
                if(link) link.classList.remove('bg-secondary');
            }
        });
    }

    navItems.forEach(item => {
        const link = document.getElementById(item.navId);
        if (link) {
            link.addEventListener('click', (e) => {
                e.preventDefault(); 
                switchTab(item.navId);
            });
        }
    });
    
    // Initialize Default View: Dashboard and fetch posts
    switchTab('nav-dashboard'); 
});


// --- SIDEBAR TOGGLE ANIMATION ---
const sidebar = document.getElementById('sidebar');
const sidebarToggleBtn = document.getElementById('sidebar-toggle');
const sidebarTexts = document.querySelectorAll('.sidebar-text');

if (sidebar && sidebarToggleBtn) {
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

    const isCollapsed = localStorage.getItem('sidebarCollapsed') !== 'false'; 
    if (isCollapsed) {
        collapseSidebar();
    } else {
        expandSidebar();
    }

    sidebarToggleBtn.addEventListener('click', () => {
        const currentlyCollapsed = sidebar.classList.contains('w-24');
        if (currentlyCollapsed) {
            expandSidebar();
            localStorage.setItem('sidebarCollapsed', 'false');
        } else {
            collapseSidebar();
            localStorage.setItem('sidebarCollapsed', 'true');
        }
    });
}

// Function to OPEN the modal
function openAppointmentModal(counselorName, role) {
    const modal = document.getElementById('appointment-modal');
    const nameDisplay = document.getElementById('modal-counselor-name');
    
    if(nameDisplay) {
        nameDisplay.textContent = counselorName;
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

// Function to CLOSE the modal
function closeModal(event) {
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
            const largeImg = document.getElementById('profile-img-large');
            if(largeImg) largeImg.src = e.target.result;
            
            const sidebarImg = document.getElementById('sidebar-img');
            if(sidebarImg) sidebarImg.src = e.target.result;
        }
        
        reader.readAsDataURL(input.files[0]);
    }
}