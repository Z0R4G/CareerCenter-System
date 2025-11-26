/**
 * sidebar.js - Sidebar management module
 * Handles sidebar collapse/expand animations, mobile drawer behavior, and state persistence
 */

class SidebarManager {
    constructor() {
        this.sidebar = document.getElementById('sidebar');
        this.sidebarToggleBtn = document.getElementById('sidebar-toggle');
        this.mobileMenuBtn = document.getElementById('mobile-menu-btn');
        this.sidebarTexts = document.querySelectorAll('.sidebar-text');
        this.mainContent = document.querySelector('main');
        this.overlay = null;
        this.isMobile = window.innerWidth < 768; // md breakpoint
        
        if (this.sidebar && this.sidebarToggleBtn) {
            this.init();
            this.setupResponsiveListeners();
        }
        
        // Setup mobile menu button if it exists
        if (this.mobileMenuBtn) {
            this.mobileMenuBtn.addEventListener('click', () => {
                this.openMobileDrawer();
            });
        }
    }

    /**
     * Setup responsive listeners for window resize
     */
    setupResponsiveListeners() {
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                const wasMobile = this.isMobile;
                this.isMobile = window.innerWidth < 768;
                
                // If switching from mobile to desktop or vice versa, reset sidebar state
                if (wasMobile !== this.isMobile) {
                    if (this.isMobile) {
                        // Switching to mobile - close sidebar and add overlay
                        this.closeMobileDrawer();
                        // Remove desktop margin classes
                        if (this.mainContent) {
                            this.mainContent.classList.remove('lg:ml-24', 'lg:ml-64');
                        }
                        // Show mobile menu button
                        if (this.mobileMenuBtn) {
                            this.mobileMenuBtn.style.display = 'block';
                        }
                    } else {
                        // Switching to desktop - remove overlay, restore desktop state
                        this.removeOverlay();
                        const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
                        if (isCollapsed) {
                            this.collapse();
                        } else {
                            this.expand();
                        }
                        // Hide mobile menu button
                        if (this.mobileMenuBtn) {
                            this.mobileMenuBtn.style.display = 'none';
                        }
                    }
                }
            }, 250);
        });
    }

    /**
     * Create overlay for mobile drawer
     */
    createOverlay() {
        if (this.overlay) return;
        
        this.overlay = document.createElement('div');
        this.overlay.className = 'fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden';
        this.overlay.addEventListener('click', () => {
            this.closeMobileDrawer();
        });
        document.body.appendChild(this.overlay);
    }

    /**
     * Remove overlay
     */
    removeOverlay() {
        if (this.overlay) {
            this.overlay.remove();
            this.overlay = null;
        }
    }

    /**
     * Open mobile drawer
     */
    openMobileDrawer() {
        if (!this.sidebar) return;
        
        this.sidebar.classList.remove('-translate-x-full');
        this.sidebar.classList.add('translate-x-0');
        this.createOverlay();
        document.body.style.overflow = 'hidden';
        
        // Hide mobile menu button when sidebar is open
        if (this.mobileMenuBtn) {
            this.mobileMenuBtn.style.display = 'none';
        }
    }

    /**
     * Close mobile drawer
     */
    closeMobileDrawer() {
        if (!this.sidebar) return;
        
        this.sidebar.classList.remove('translate-x-0');
        this.sidebar.classList.add('-translate-x-full');
        this.removeOverlay();
        document.body.style.overflow = '';
        
        // Show mobile menu button when sidebar is closed
        if (this.mobileMenuBtn) {
            this.mobileMenuBtn.style.display = 'block';
        }
    }

    /**
     * Initialize sidebar on page load
     */
    init() {
        if (this.isMobile) {
            // Mobile: Start with sidebar closed
            this.sidebar.classList.add('-translate-x-full');
            this.sidebar.classList.remove('w-64', 'w-24');
            this.sidebar.classList.add('w-64'); // Full width on mobile when open
            
            // Show mobile menu button on mobile
            if (this.mobileMenuBtn) {
                this.mobileMenuBtn.style.display = 'block';
            }
        } else {
            // Desktop: Restore sidebar state from localStorage
            const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
            if (isCollapsed) {
                this.collapse();
            } else {
                this.expand();
            }
            
            // Hide mobile menu button on desktop
            if (this.mobileMenuBtn) {
                this.mobileMenuBtn.style.display = 'none';
            }
        }

        // Attach toggle button event listener
        this.sidebarToggleBtn.addEventListener('click', () => {
            this.toggleSidebar();
        });
    }

    /**
     * Collapse the sidebar (desktop only)
     */
    collapse() {
        if (!this.sidebar || this.isMobile) return;

        this.sidebar.classList.remove('w-64');
        this.sidebar.classList.add('w-24');
        
        this.sidebarTexts.forEach(text => {
            text.classList.add('opacity-0');
            text.classList.add('pointer-events-none');
        });
        
        this.sidebarToggleBtn.classList.remove('right-4');
        this.sidebarToggleBtn.classList.add('right-9');
        
        // Update main content margin with smooth transition (only on desktop)
        if (this.mainContent && !this.isMobile) {
            // Use requestAnimationFrame to ensure smooth transition
            requestAnimationFrame(() => {
                this.mainContent.classList.remove('lg:ml-64');
                this.mainContent.classList.add('lg:ml-24');
            });
        }
    }

    /**
     * Expand the sidebar (desktop only)
     */
    expand() {
        if (!this.sidebar || this.isMobile) return;

        this.sidebar.classList.remove('w-24');
        this.sidebar.classList.add('w-64');
        
        this.sidebarTexts.forEach(text => {
            text.classList.remove('opacity-0');
            text.classList.remove('pointer-events-none');
        });
        
        this.sidebarToggleBtn.classList.remove('right-9');
        this.sidebarToggleBtn.classList.add('right-4');
        
        // Update main content margin with smooth transition (only on desktop)
        if (this.mainContent && !this.isMobile) {
            // Use requestAnimationFrame to ensure smooth transition
            requestAnimationFrame(() => {
                this.mainContent.classList.remove('lg:ml-24');
                this.mainContent.classList.add('lg:ml-64');
            });
        }
    }

    /**
     * Toggle sidebar between expanded and collapsed states
     */
    toggleSidebar() {
        if (this.isMobile) {
            // Mobile: Toggle drawer
            const isOpen = !this.sidebar.classList.contains('-translate-x-full');
            if (isOpen) {
                this.closeMobileDrawer();
            } else {
                this.openMobileDrawer();
            }
        } else {
            // Desktop: Toggle collapse/expand
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
}

// Export as global
window.sidebarManager = new SidebarManager();
