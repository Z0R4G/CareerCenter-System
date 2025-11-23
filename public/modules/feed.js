/**
 * feed.js - Feed management module
 * Handles fetching posts, rendering feed cards, and uploading new posts
 */

class FeedManager {
    constructor() {
        this.feedContainer = null;
        this.postForm = null;
        this.init();
    }

    /**
     * Initialize feed module
     */
    init() {
        this.feedContainer = document.getElementById('counselor-feed');
        this.postForm = document.getElementById('post-form');
        
        if (this.postForm) {
            this.postForm.addEventListener('submit', (e) => this.uploadPost(e));
        }
    }

    /**
     * Fetch all posts from the backend API
     */
    async fetchAllPosts() {
        if (!this.feedContainer) return;

        this.feedContainer.innerHTML = '<p class="text-center text-gray-500">Loading posts...</p>';

        try {
            const response = await fetch('/app/posts');

            if (!response.ok) {
                throw new Error(`Failed to fetch posts: HTTP status ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success && result.data && Array.isArray(result.data)) {
                this.feedContainer.innerHTML = ''; // Clear loading message

                if (result.data.length === 0) {
                    this.feedContainer.innerHTML = '<p class="text-center text-gray-500">The feed is currently empty.</p>';
                    return;
                }

                // Render each post retrieved from the database
                result.data.forEach(post => {
                    this.renderPostCard(post);
                });
                
            } else {
                this.feedContainer.innerHTML = '<p class="text-center text-red-500">Error: Invalid data format received from server.</p>';
            }

        } catch (error) {
            console.error('API Fetch Error:', error);
            this.feedContainer.innerHTML = `<p class="text-center text-red-500">Could not connect to the API. Check your console for details. (URL: '/app/posts')</p>`;
        }
    }

    /**
     * Render a single post card in the feed
     * @param {Object} post - Post data object
     */
    renderPostCard(post) {
        if (!this.feedContainer) return;

        const postCard = document.createElement('div');
        postCard.className = 'bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200';
        
        // Fallback and display variables
        const postedBy = post.posted_by || 'Admin';
        const postTitle = post.title || 'Untitled Post';
        const postDescription = post.description || 'No description provided.';
        const postPhotoLink = post.post_photo_link || 'https://placehold.co/600x300/CCCCCC/white?text=No+Image';
        const profilePictureLink = post.profile_link;
        const initial = postedBy.charAt(0).toUpperCase();

        // Format date
        let displayDate = 'Unknown Date';
        try {
            const dateObj = new Date(post.date_posted);
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
        
        // Build profile HTML
        let profileHTML;
        if (profilePictureLink && profilePictureLink !== 'null' && profilePictureLink !== 'undefined') {
            profileHTML = `<img src="${profilePictureLink}" 
                                alt="${postedBy} Profile" 
                                class="w-full h-full object-cover">`;
        } else {
            profileHTML = `<div class="h-10 w-10 min-w-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                            ${initial}
                           </div>`;
        }

        // Construct HTML
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

        this.feedContainer.appendChild(postCard);
    }

    /**
     * Upload a new post to the backend
     * @param {Event} e - Form submit event
     */
    async uploadPost(e) {
        if (e && e.preventDefault) e.preventDefault();

        const form = document.getElementById('post-form');
        const titleEl = document.getElementById('post-title');
        const contentEl = document.getElementById('post-content');
        const fileInput = document.getElementById('post-image');
        const submitBtn = document.getElementById('post-submit-btn');

        if (!contentEl) {
            console.error('Post content element not found.');
            return;
        }

        const description = contentEl.value.trim();
        if (!description) {
            alert('Please enter post content.');
            return;
        }

        if (!fileInput || !fileInput.files || !fileInput.files[0]) {
            alert('Please select an image for the post (required by the server).');
            return;
        }

        // Build title from first line of content
        const title = titleEl && titleEl.value.trim() ? titleEl.value.trim() : description.split('\n')[0].slice(0, 50);

        // Get poster info from localStorage
        let posted_by = 'Counselor';
        let profile_link = '';
        try {
            const userRaw = localStorage.getItem('user');
            if (userRaw) {
                const user = JSON.parse(userRaw);
                posted_by = (user.first_name || '') + (user.last_name ? ' ' + user.last_name : '') || user.email || posted_by;
                profile_link = user.profile_link || user.profile || user.profilePicture || '';
            }
        } catch (err) {
            console.warn('Could not parse user from localStorage', err);
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('posted_by', posted_by);
        formData.append('profile_link', profile_link);
        formData.append('file', fileInput.files[0]);

        // Disable button during upload
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Publishing...';
        }

        try {
            const resp = await fetch('/app/uploadpost', {
                method: 'POST',
                body: formData
            });

            const result = await resp.json().catch(() => null);

            if (resp.ok && result && result.success) {
                // Close modal and reset form
                const postModal = document.getElementById('post-modal');
                if (postModal) {
                    postModal.classList.add('hidden');
                    postModal.classList.remove('flex');
                }
                form.reset();

                // Refresh feed
                this.fetchAllPosts();

                alert('Post published successfully.');
            } else {
                const msg = (result && result.message) ? result.message : `Upload failed (status ${resp.status})`;
                console.error('Upload error:', result || resp.statusText);
                alert('Error publishing post: ' + msg);
            }
        } catch (error) {
            console.error('Upload exception:', error);
            alert('Could not connect to server. Check console for details.');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Publish Post';
            }
        }
    }
}

// Export as global
window.feedManager = new FeedManager();
