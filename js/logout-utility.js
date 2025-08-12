// Logout Utility Script
// This script provides a simple logout function that can be used on any page

// Global logout function
function performLogout() {
    console.log('Performing logout...');
    
    // Clear all session data
    const keysToRemove = [
        'educare_user',
        'educare_session_id', 
        'currentUser',
        'currentRole',
        'currentSessionId',
        'rememberMe'
    ];
    
    keysToRemove.forEach(key => {
        localStorage.removeItem(key);
    });
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Clear cookies
    document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    
    // Show logout message
    showLogoutMessage('Logged out successfully!');
    
    // Redirect to login page after delay
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1500);
}

// Show logout message
function showLogoutMessage(message) {
    // Remove existing message if any
    const existingMessage = document.querySelector('.logout-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = 'logout-message';
    messageEl.innerHTML = `
        <div class="message-content">
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add styles
    messageEl.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-family: Arial, sans-serif;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideIn 0.3s ease-out;
    `;
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        .logout-message i { font-size: 16px; }
    `;
    document.head.appendChild(style);
    
    // Add to page
    document.body.appendChild(messageEl);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        if (messageEl.parentElement) {
            messageEl.style.animation = 'slideOut 0.3s ease-in';
            messageEl.style.transform = 'translateX(100%)';
            messageEl.style.opacity = '0';
            setTimeout(() => {
                if (messageEl.parentElement) {
                    messageEl.remove();
                }
            }, 300);
        }
    }, 3000);
}

// Check if user is logged in
function isUserLoggedIn() {
    const userData = localStorage.getItem('educare_user') || localStorage.getItem('currentUser');
    const sessionId = localStorage.getItem('educare_session_id') || localStorage.getItem('currentSessionId');
    return !!(userData && sessionId);
}

// Get current user info
function getCurrentUser() {
    const userData = localStorage.getItem('educare_user') || localStorage.getItem('currentUser');
    if (userData) {
        try {
            return JSON.parse(userData);
        } catch (error) {
            console.error('Error parsing user data:', error);
            return null;
        }
    }
    return null;
}

// Create logout button
function createLogoutButton(container, options = {}) {
    const defaults = {
        text: 'Logout',
        className: 'logout-btn',
        style: 'default',
        size: 'medium'
    };
    
    const config = { ...defaults, ...options };
    
    const button = document.createElement('button');
    button.textContent = config.text;
    button.className = config.className;
    button.onclick = performLogout;
    
    // Apply styles based on style option
    const styles = {
        default: {
            background: '#dc3545',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
        },
        outline: {
            background: 'transparent',
            color: '#dc3545',
            border: '2px solid #dc3545',
            padding: '6px 14px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
        },
        minimal: {
            background: 'transparent',
            color: '#6c757d',
            border: 'none',
            padding: '4px 8px',
            cursor: 'pointer',
            fontSize: '12px',
            textDecoration: 'underline'
        }
    };
    
    // Apply size variations
    const sizes = {
        small: { padding: '4px 8px', fontSize: '12px' },
        medium: { padding: '8px 16px', fontSize: '14px' },
        large: { padding: '12px 24px', fontSize: '16px' }
    };
    
    const finalStyle = { ...styles[config.style], ...sizes[config.size] };
    
    Object.assign(button.style, finalStyle);
    
    // Add hover effects
    button.addEventListener('mouseenter', () => {
        if (config.style === 'default') {
            button.style.background = '#c82333';
        } else if (config.style === 'outline') {
            button.style.background = '#dc3545';
            button.style.color = 'white';
        }
    });
    
    button.addEventListener('mouseleave', () => {
        if (config.style === 'default') {
            button.style.background = '#dc3545';
        } else if (config.style === 'outline') {
            button.style.background = 'transparent';
            button.style.color = '#dc3545';
        }
    });
    
    // Add to container
    if (container) {
        container.appendChild(button);
    }
    
    return button;
}

// Auto-add logout button to pages that need it
function autoAddLogoutButton() {
    // Only add if user is logged in
    if (!isUserLoggedIn()) {
        return;
    }
    
    // Check if logout button already exists
    if (document.querySelector('.logout-btn')) {
        return;
    }
    
    // Find suitable container (header, nav, or body)
    let container = document.querySelector('header') || 
                   document.querySelector('nav') || 
                   document.querySelector('.nav-list') ||
                   document.body;
    
    if (container) {
        createLogoutButton(container, {
            text: 'Logout',
            style: 'outline',
            size: 'small'
        });
    }
}

// Export functions for global access
window.performLogout = performLogout;
window.showLogoutMessage = showLogoutMessage;
window.isUserLoggedIn = isUserLoggedIn;
window.getCurrentUser = getCurrentUser;
window.createLogoutButton = createLogoutButton;
window.autoAddLogoutButton = autoAddLogoutButton;

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoAddLogoutButton);
} else {
    autoAddLogoutButton();
}

console.log('Logout utility loaded successfully');

