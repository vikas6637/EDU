// Supabase Configuration
const SUPABASE_URL = 'https://gjmuggtzcspazepfrowz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqbXVnZ3R6Y3NwYXplcGZyb3d6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MzIzNDEsImV4cCI6MjA3MDQwODM0MX0.7nDJOm0DC_cUpUNDNxqcT-I6E9BS7S4zFzE1J7YXzVY';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Global variables
let currentUser = null;
let currentRole = 'user';
let sessionId = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Login system initializing...');
    
    // Test Supabase connection first
    testSupabaseConnection().then(() => {
        initializeApp();
        setupEventListeners();
        generateSessionId();
        checkExistingSession();
    }).catch(error => {
        console.error('Supabase connection failed:', error);
        showToast('Database connection failed. Please check your configuration.', 'error');
    });
});

// Test Supabase connection
async function testSupabaseConnection() {
    try {
        console.log('Testing Supabase connection...');
        const { data, error } = await supabase.from('users').select('count').limit(1);
        
        if (error) {
            console.error('Supabase connection error:', error);
            throw new Error(`Database error: ${error.message}`);
        }
        
        console.log('Supabase connection successful');
        return true;
    } catch (error) {
        console.error('Connection test failed:', error);
        throw error;
    }
}

// Initialize the application
function initializeApp() {
    // Set up default admin account if not exists
    setupDefaultAdmin();
    
    // Initialize database tables if needed
    initializeDatabase();
}

// Generate unique session ID
function generateSessionId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    sessionId = `SESS_${timestamp}_${random}`;
    document.getElementById('sessionId').textContent = sessionId;
    
    // Store session ID
    localStorage.setItem('currentSessionId', sessionId);
    console.log('Session ID generated:', sessionId);
}

// Check for existing session
function checkExistingSession() {
    const savedSession = localStorage.getItem('currentSessionId');
    const savedUser = localStorage.getItem('currentUser');
    const savedRole = localStorage.getItem('currentRole');
    
    // Also check the educare_user format
    const educareUser = localStorage.getItem('educare_user');
    const educareSession = localStorage.getItem('educare_session_id');
    
    if ((savedSession && savedUser) || (educareSession && educareUser)) {
        // Use whichever session data is available
        if (savedSession && savedUser) {
            sessionId = savedSession;
            currentUser = JSON.parse(savedUser);
            currentRole = savedRole || 'user';
        } else {
            sessionId = educareSession;
            currentUser = JSON.parse(educareUser);
            currentRole = currentUser.role || 'user';
        }
        
        console.log('Existing session found:', currentUser);
        
        // Redirect to appropriate dashboard
        if (currentRole === 'admin') {
            window.location.href = 'admin-dashboard.html';
        } else {
            window.location.href = 'user-dashboard.html';
        }
    } else {
        console.log('No existing session found');
    }
}

// Setup default admin account
async function setupDefaultAdmin() {
    try {
        const { data: existingAdmin } = await supabase
            .from('users')
            .select('*')
            .eq('email', 'admin@educare.com')
            .single();
        
        if (!existingAdmin) {
            const { data, error } = await supabase
                .from('users')
                .insert([
                    {
                        email: 'admin@educare.com',
                        password: 'admin123', // In production, use proper hashing
                        full_name: 'System Administrator',
                        role: 'admin',
                        phone: '+1234567890',
                        created_at: new Date().toISOString()
                    }
                ]);
            
            if (error) {
                console.error('Error creating admin account:', error);
            } else {
                console.log('Default admin account created');
            }
        }
    } catch (error) {
        console.error('Error setting up admin account:', error);
    }
}

// Initialize database tables
async function initializeDatabase() {
    // This would typically be done through Supabase migrations
    // For now, we'll handle it in the application
    console.log('Database initialization complete');
}

// Setup event listeners
function setupEventListeners() {
    // Role selector
    document.querySelectorAll('.role-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const role = this.dataset.role;
            selectRole(role);
        });
    });
    
    // Form submissions
    document.getElementById('authForm').addEventListener('submit', handleLogin);
    document.getElementById('signupForm').addEventListener('submit', handleRegistration);
    
    // Form switching
    document.getElementById('showRegister').addEventListener('click', showRegisterForm);
    document.getElementById('showLogin').addEventListener('click', showLoginForm);
    
    // Password toggles
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', function() {
            togglePasswordVisibility(this);
        });
    });
    
    // Forgot password
    document.querySelector('.forgot-password').addEventListener('click', handleForgotPassword);
}

// Role selection
function selectRole(role) {
    currentRole = role;
    
    // Update active button
    document.querySelectorAll('.role-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.role === role) {
            btn.classList.add('active');
        }
    });
    
    console.log('Role selected:', role);
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    if (!email || !password) {
        showToast('Please fill in all fields', 'error');
        return;
    }
    
    showLoading(true);
    
    try {
        // For demo purposes, we'll use a simple authentication
        // In production, use Supabase Auth
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .eq('password', password)
            .single();
        
        if (error) {
            console.error('Login query error:', error);
            if (error.code === 'PGRST116') {
                showToast('Invalid email or password', 'error');
            } else {
                showToast(`Database error: ${error.message}`, 'error');
            }
            return;
        }
        
        if (!user) {
            showToast('Invalid email or password', 'error');
            return;
        }
        
        // Check role permissions
        if (currentRole === 'admin' && user.role !== 'admin') {
            showToast('Access denied. Admin privileges required.', 'error');
            return;
        }
        
        // Store user session in the format expected by user-session.js
        currentUser = user;
        localStorage.setItem('educare_user', JSON.stringify(user));
        localStorage.setItem('educare_session_id', sessionId);
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('currentRole', user.role);
        localStorage.setItem('currentSessionId', sessionId);
        
        if (rememberMe) {
            localStorage.setItem('rememberMe', 'true');
        }
        
        // Log login activity
        await logActivity('login', user.id, 'User logged in successfully');
        
        showToast('Login successful! Redirecting...', 'success');
        
        // Redirect to appropriate dashboard
        setTimeout(() => {
            if (user.role === 'admin') {
                window.location.href = 'admin-dashboard.html';
            } else {
                window.location.href = 'user-dashboard.html';
            }
        }, 1500);
        
    } catch (error) {
        console.error('Login error:', error);
        showToast('Login failed. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

// Handle registration
async function handleRegistration(e) {
    e.preventDefault();
    
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('regEmail').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const termsAccepted = document.getElementById('termsAccepted').checked;
    
    // Validation
    if (!fullName || !email || !phone || !password || !confirmPassword) {
        showToast('Please fill in all fields', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
    }
    
    if (password.length < 6) {
        showToast('Password must be at least 6 characters long', 'error');
        return;
    }
    
    if (!termsAccepted) {
        showToast('Please accept the terms and conditions', 'error');
        return;
    }
    
    // Get selected role from the registration form
    const selectedRoleBtn = document.querySelector('#registerForm .role-btn.active');
    const role = selectedRoleBtn ? selectedRoleBtn.dataset.role : 'student';
    
    showLoading(true);
    
    try {
        // Check if email already exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();
        
        if (existingUser) {
            showToast('Email already registered', 'error');
            return;
        }
        
        // Create new user
        const { data: newUser, error } = await supabase
            .from('users')
            .insert([
                {
                    email: email,
                    password: password, // In production, use proper hashing
                    full_name: fullName,
                    phone: phone,
                    role: role,
                    created_at: new Date().toISOString()
                }
            ])
            .select()
            .single();
        
        if (error) {
            console.error('Registration error:', error);
            if (error.code === '23505') {
                showToast('Email already registered', 'error');
            } else {
                showToast(`Registration failed: ${error.message}`, 'error');
            }
            return;
        }
        
        // Log registration activity
        await logActivity('registration', newUser.id, 'New user registered');
        
        showToast('Registration successful! Please login.', 'success');
        
        // Switch back to login form
        setTimeout(() => {
            showLoginForm();
            // Clear registration form
            document.getElementById('signupForm').reset();
        }, 1500);
        
    } catch (error) {
        console.error('Registration error:', error);
        showToast('Registration failed. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

// Handle forgot password
function handleForgotPassword(e) {
    e.preventDefault();
    showToast('Password reset feature coming soon!', 'info');
}

// Show registration form
function showRegisterForm() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.remove('hidden');
}

// Show login form
function showLoginForm() {
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('loginForm').classList.remove('hidden');
}

// Toggle password visibility
function togglePasswordVisibility(button) {
    const input = button.parentElement.querySelector('input');
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

// Show loading overlay
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (show) {
        overlay.classList.add('show');
    } else {
        overlay.classList.remove('show');
    }
}

// Show toast notification
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? 'fas fa-check-circle' :
                 type === 'error' ? 'fas fa-exclamation-circle' :
                 'fas fa-info-circle';
    
    toast.innerHTML = `
        <i class="${icon}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    // Show toast
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Remove toast after 5 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (container.contains(toast)) {
                container.removeChild(toast);
            }
        }, 300);
    }, 5000);
}

// Log activity
async function logActivity(action, userId, description) {
    try {
        await supabase
            .from('activity_logs')
            .insert([
                {
                    user_id: userId,
                    action: action,
                    description: description,
                    session_id: sessionId,
                    timestamp: new Date().toISOString()
                }
            ]);
    } catch (error) {
        console.error('Error logging activity:', error);
    }
}

// Utility functions
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^[\+]?[1-9][\d]{0,15}$/;
    return re.test(phone);
}

// Export functions for use in other files
window.loginSystem = {
    currentUser,
    currentRole,
    sessionId,
    logout: function() {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('currentRole');
        localStorage.removeItem('currentSessionId');
        window.location.href = 'login.html';
    }
};
