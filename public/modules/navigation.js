/**
 * navigation.js - Navigation and panel switching module
 * Handles tab navigation and panel visibility toggling
 */

class NavigationManager {
    constructor() {
        this.navItems = [
            { navId: 'nav-dashboard', panelId: 'panel-dashboard' },
            { navId: 'nav-profile', panelId: 'panel-profile' },
            { navId: 'nav-appointments', panelId: 'panel-appointments' },
            { navId: 'nav-resume', panelId: 'panel-resume' },
            { navId: 'nav-messages', panelId: 'panel-messages' }
        ];
        
        this.init();
    }

    /**
     * Initialize navigation on DOM content loaded
     */
    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.attachEventListeners());
        } else {
            this.attachEventListeners();
        }
    }

    /**
     * Attach click listeners to navigation items
     */
    attachEventListeners() {
        this.navItems.forEach(item => {
            const link = document.getElementById(item.navId);
            if (link) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.switchTab(item.navId);
                });
            }
        });
        
        // Initialize with dashboard view
        this.switchTab('nav-dashboard');
    }

    /**
     * Switch to a specific tab and show corresponding panel
     * @param {string} clickedNavId - The navigation item ID that was clicked
     */
    switchTab(clickedNavId) {
        this.navItems.forEach(item => {
            const link = document.getElementById(item.navId);
            
            if (item.navId === clickedNavId) {
                if (link) link.classList.add('bg-secondary');
                this.showPanel(item.panelId);
            } else {
                if (link) link.classList.remove('bg-secondary');
            }
        });
    }

    /**
     * Show a specific panel and hide others
     * @param {string} panelId - The panel ID to show
     */
    showPanel(panelId) {
        const panels = document.querySelectorAll('.panel-section');
        panels.forEach(panel => {
            if (panel.id === panelId) {
                panel.classList.remove('hidden');
            } else {
                panel.classList.add('hidden');
            }
        });

        // Fetch posts when dashboard panel is opened
        if (panelId === 'panel-dashboard' && window.feedManager) {
            window.feedManager.fetchAllPosts();
        }
    }
}

// Export as global
window.navigationManager = new NavigationManager();
