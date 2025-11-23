/**
 * sidebar.js - Sidebar management module
 * Handles sidebar collapse/expand animations and state persistence
 */

class SidebarManager {
    constructor() {
        this.sidebar = document.getElementById('sidebar');
        this.sidebarToggleBtn = document.getElementById('sidebar-toggle');
        this.sidebarTexts = document.querySelectorAll('.sidebar-text');
        
        if (this.sidebar && this.sidebarToggleBtn) {
            this.init();
        }
    }

    /**
     * Initialize sidebar on page load
     */
    init() {
        // Restore sidebar state from localStorage
        const isCollapsed = localStorage.getItem('sidebarCollapsed') !== 'false';
        if (isCollapsed) {
            this.collapse();
        } else {
            this.expand();
        }

        // Attach toggle button event listener
        this.sidebarToggleBtn.addEventListener('click', () => {
            this.toggleSidebar();
        });
    }

    /**
     * Collapse the sidebar
     */
    collapse() {
        if (!this.sidebar) return;

        this.sidebar.classList.remove('w-64');
        this.sidebar.classList.add('w-24');
        
        this.sidebarTexts.forEach(text => {
            text.classList.add('opacity-0');
            text.classList.add('pointer-events-none');
        });
        
        this.sidebarToggleBtn.classList.remove('right-4');
        this.sidebarToggleBtn.classList.add('right-9');
    }

    /**
     * Expand the sidebar
     */
    expand() {
        if (!this.sidebar) return;

        this.sidebar.classList.remove('w-24');
        this.sidebar.classList.add('w-64');
        
        this.sidebarTexts.forEach(text => {
            text.classList.remove('opacity-0');
            text.classList.remove('pointer-events-none');
        });
        
        this.sidebarToggleBtn.classList.remove('right-9');
        this.sidebarToggleBtn.classList.add('right-4');
    }

    /**
     * Toggle sidebar between expanded and collapsed states
     */
    toggleSidebar() {
        const currentlyCollapsed = this.sidebar.classList.contains('w-24');
        
        if (currentlyCollapsed) {
            this.expand();
            localStorage.setItem('sidebarCollapsed', 'false');
        } else {
            this.collapse();
            localStorage.setItem('sidebarCollapsed', 'true');
        }
    }
}

// Export as global
window.sidebarManager = new SidebarManager();
