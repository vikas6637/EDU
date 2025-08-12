// User Session Management for Educare Institute
// This script manages user sessions across all pages

class UserSessionManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.checkLoginStatus();
        this.updateNavigation();
        this.setupEventListeners();
    }

    // Check if user is logged in
    checkLoginStatus() {
        const userData = localStorage.getItem('educare_user');
        if (userData) {
            try {
                this.currentUser = JSON.parse(userData);
                console.log('User session found:', this.currentUser);
            } catch (error) {
                console.error('Error parsing user data:', error);
                this.clearSession();
            }
        }
    }

    // Update navigation based on login status
    updateNavigation() {
        const loginBtn = document.querySelector('.login-btn');
        const userMenu = document.querySelector('.user-menu');
        
        if (this.currentUser) {
            // User is logged in - show user menu
            if (loginBtn) {
                loginBtn.style.display = 'none';
            }
            
            // Create or update user menu
            this.createUserMenu();
        } else {
            // User is not logged in - show login button
            if (loginBtn) {
                loginBtn.style.display = 'inline-flex';
            }
            
            // Remove user menu if exists
            if (userMenu) {
                userMenu.remove();
            }
        }
    }

    // Create user menu in navigation
    createUserMenu() {
        // Remove existing user menu if any
        const existingMenu = document.querySelector('.user-menu');
        if (existingMenu) {
            existingMenu.remove();
        }

        const navList = document.querySelector('.nav-list');
        if (!navList) return;

        // Create user menu HTML
        const userMenuHTML = `
            <li class="user-menu">
                <div class="user-menu-trigger">
                    <i class="fas fa-user-circle"></i>
                    <span class="user-name">${this.currentUser.full_name || 'User'}</span>
                    <i class="fas fa-chevron-down"></i>
                </div>
                <div class="user-dropdown">
                    <div class="user-info">
                        <i class="fas fa-user"></i>
                        <span>${this.currentUser.full_name || 'User'}</span>
                        <small>${this.currentUser.role || 'User'}</small>
                    </div>
                    <div class="dropdown-divider"></div>
                    <a href="user-dashboard.html" class="dropdown-item">
                        <i class="fas fa-tachometer-alt"></i>
                        Dashboard
                    </a>
                    <a href="index.html" class="dropdown-item">
                        <i class="fas fa-home"></i>
                        Back to Home
                    </a>
                    <div class="dropdown-divider"></div>
                    <button class="dropdown-item logout-btn" onclick="userSessionManager.logout()">
                        <i class="fas fa-sign-out-alt"></i>
                        Logout
                    </button>
                </div>
            </li>
        `;

        // Insert before the mobile menu button
        const mobileMenuBtn = navList.querySelector('.mobile-menu-btn');
        if (mobileMenuBtn) {
            mobileMenuBtn.insertAdjacentHTML('beforebegin', userMenuHTML);
        } else {
            navList.insertAdjacentHTML('beforeend', userMenuHTML);
        }

        // Also update mobile navigation
        this.updateMobileNavigation();
    }

    // Update mobile navigation
    updateMobileNavigation() {
        const mobileNavList = document.querySelector('.mobile-nav-list');
        if (!mobileNavList) return;

        // Remove existing user menu from mobile nav
        const existingMobileMenu = mobileNavList.querySelector('.user-menu');
        if (existingMobileMenu) {
            existingMobileMenu.remove();
        }

        if (this.currentUser) {
            // Hide login button in mobile nav
            const mobileLoginBtn = mobileNavList.querySelector('.login-btn');
            if (mobileLoginBtn) {
                mobileLoginBtn.style.display = 'none';
            }

            // Add user menu to mobile nav
            const userMenuHTML = `
                <li class="user-menu">
                    <div class="user-info">
                        <i class="fas fa-user-circle"></i>
                        <span>${this.currentUser.full_name || 'User'}</span>
                        <small>${this.currentUser.role || 'User'}</small>
                    </div>
                    <a href="user-dashboard.html" class="nav-link">
                        <i class="fas fa-tachometer-alt"></i>
                        Dashboard
                    </a>
                    <a href="index.html" class="nav-link">
                        <i class="fas fa-home"></i>
                        Back to Home
                    </a>
                    <button class="nav-link logout-btn" onclick="userSessionManager.logout()">
                        <i class="fas fa-sign-out-alt"></i>
                        Logout
                    </button>
                </li>
            `;

            mobileNavList.insertAdjacentHTML('beforeend', userMenuHTML);
        } else {
            // Show login button in mobile nav
            const mobileLoginBtn = mobileNavList.querySelector('.login-btn');
            if (mobileLoginBtn) {
                mobileLoginBtn.style.display = 'block';
            }
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Handle user menu dropdown
        document.addEventListener('click', (e) => {
            const userMenuTrigger = e.target.closest('.user-menu-trigger');
            if (userMenuTrigger) {
                const userMenu = userMenuTrigger.closest('.user-menu');
                const dropdown = userMenu.querySelector('.user-dropdown');
                dropdown.classList.toggle('active');
            } else {
                // Close dropdown when clicking outside
                const dropdowns = document.querySelectorAll('.user-dropdown.active');
                dropdowns.forEach(dropdown => dropdown.classList.remove('active'));
            }
        });

        // Handle window resize for mobile menu
        window.addEventListener('resize', () => {
            this.updateNavigation();
        });
    }

    // Logout user
    logout() {
        console.log('User session manager logout called...');
        
        // Clear session data
        this.clearSession();
        
        // Update navigation
        this.updateNavigation();
        
        // Show logout message
        this.showMessage('Logged out successfully!', 'success');
        
        // Redirect to login page after a short delay
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    }

    // Clear user session
    clearSession() {
        console.log('Clearing all session data...');
        
        // Clear all localStorage items
        localStorage.removeItem('educare_user');
        localStorage.removeItem('educare_session_id');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('currentRole');
        localStorage.removeItem('currentSessionId');
        localStorage.removeItem('rememberMe');
        
        // Clear sessionStorage
        sessionStorage.clear();
        
        // Clear cookies if any
        document.cookie.split(";").forEach(function(c) { 
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
        });
        
        // Reset current user
        this.currentUser = null;
        
        console.log('Session data cleared successfully');
    }

    // Show message to user
    showMessage(message, type = 'info') {
        // Create message element
        const messageEl = document.createElement('div');
        messageEl.className = `message message-${type}`;
        messageEl.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">&times;</button>
        `;
        
        // Add to page
        document.body.appendChild(messageEl);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (messageEl.parentElement) {
                messageEl.remove();
            }
        }, 3000);
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Check if user is logged in
    isLoggedIn() {
        return !!this.currentUser;
    }

    // Check if user is admin
    isAdmin() {
        return this.currentUser && this.currentUser.role === 'admin';
    }
}

// Initialize user session manager
const userSessionManager = new UserSessionManager();

// Export for use in other scripts
window.userSessionManager = userSessionManager;
