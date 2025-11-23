/**
 * profile.js - User profile display and management module
 * Handles updating user profile information and profile picture preview
 */

class ProfileManager {
    constructor() {
        this.user = null;
        this.init();
    }

    /**
     * Initialize profile manager
     */
    init() {
        // Get user from auth manager if available
        if (window.authManager) {
            this.user = window.authManager.getUser();
        }

        if (this.user) {
            this.updateProfilePanel();
            this.updateSidebarProfile();
            this.attachImagePreviewHandler();
        }
    }

    /**
     * Update the main profile panel with user information
     */
    updateProfilePanel() {
        if (!this.user) return;

        const profileFields = {
            'user-email': this.user.email || 'N/A',
            'user-first_name': this.user.first_name || 'N/A',
            'user-last_name': this.user.last_name || 'N/A',
            'user-id': this.user.ID_number || this.user.id_number || 'N/A',
            'user-year': this.user.Year || 'N/A',
            'user-program': this.user.program || 'N/A',
            'user-gender': this.user.gender || 'N/A'
        };

        Object.entries(profileFields).forEach(([elementId, value]) => {
            const element = document.getElementById(elementId);
            if (element) {
                element.textContent = value;
            }
        });
    }

    /**
     * Update sidebar profile information
     */
    updateSidebarProfile() {
        if (!this.user) return;

        const sidebarName = document.getElementById('sidebar-name');
        if (sidebarName) {
            sidebarName.textContent = (this.user.first_name || '') + ' ' + (this.user.last_name || '');
        }

        const sidebarId = document.getElementById('sidebar-id');
        if (sidebarId) {
            sidebarId.textContent = this.user.ID_number || this.user.id_number || 'ID: ----';
        }
    }

    /**
     * Attach image preview handler for profile picture upload
     */
    attachImagePreviewHandler() {
        const fileInput = document.getElementById('profile-pic-input');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.previewImage(e));
        }
    }

    /**
     * Preview selected profile image
     * @param {Event} event - File input change event
     */
    previewImage(event) {
        const input = event.target;
        
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const largeImg = document.getElementById('profile-img-large');
                if (largeImg) {
                    largeImg.src = e.target.result;
                }
                
                const sidebarImg = document.getElementById('sidebar-img');
                if (sidebarImg) {
                    sidebarImg.src = e.target.result;
                }
            };
            
            reader.readAsDataURL(input.files[0]);
        }
    }

    /**
     * Get the current user object
     * @returns {Object} User object or null
     */
    getUser() {
        return this.user;
    }

    /**
     * Update user object (useful when user data changes)
     * @param {Object} userData - New user data
     */
    updateUser(userData) {
        this.user = userData;
        this.updateProfilePanel();
        this.updateSidebarProfile();
    }
}

// Export as global
window.profileManager = new ProfileManager();
