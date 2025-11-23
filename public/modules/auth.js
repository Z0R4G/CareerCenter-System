/**
 * auth.js - Authentication and user validation module
 * Handles user login checks, localStorage validation, and logout functionality
 */

class AuthManager {
    constructor() {
        this.user = null;
        this.init();
    }

    /**
     * Initialize authentication on page load
     */
    init() {
        this.validateUser();
        this.attachLogoutHandler();
    }

    /**
     * Validate user from localStorage and redirect if invalid
     */
    validateUser() {
        const userData = localStorage.getItem('user');
        console.log('User data from localStorage:', userData);

        if (!userData || userData === 'undefined' || userData === 'null') {
            console.log('No valid user data, redirecting to login');
            window.location.href = 'index.html';
            return false;
        }

        try {
            this.user = JSON.parse(userData);
            console.log('Parsed user object:', this.user);

            if (!this.user || typeof this.user !== 'object') {
                console.error('Invalid user object');
                this.logout();
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error parsing user data:', error);
            this.logout();
            return false;
        }
    }

    /**
     * Get current authenticated user
     * @returns {Object} User object or null
     */
    getUser() {
        return this.user;
    }

    /**
     * Attach logout button event listener
     */
    attachLogoutHandler() {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (confirm('Are you sure you want to logout?')) {
                    this.logout();
                }
            });
        }
    }

    /**
     * Clear user session and redirect to login
     */
    logout() {
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    }
}

// Export as global
window.authManager = new AuthManager();
