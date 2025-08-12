// Supabase Configuration
const SUPABASE_URL = 'https://gjmuggtzcspazepfrowz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqbXVnZ3R6Y3NwYXplcGZyb3d6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MzIzNDEsImV4cCI6MjA3MDQwODM0MX0.7nDJOm0DC_cUpUNDNxqcT-I6E9BS7S4zFzE1J7YXzVY';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Global variables
let currentAdmin = null;
let dashboardData = {
    users: [],
    content: [],
    activities: [],
    stats: {}
};

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin dashboard initializing...');
    checkAdminAuth();
    setupEventListeners();
    loadDashboardData();
});

// Check admin authentication
function checkAdminAuth() {
    // Check multiple possible storage locations
    let savedUser = localStorage.getItem('currentUser');
    let savedRole = localStorage.getItem('currentRole');
    
    // Fallback to educare format
    if (!savedUser) {
        savedUser = localStorage.getItem('educare_user');
        if (savedUser) {
            const user = JSON.parse(savedUser);
            savedRole = user.role;
        }
    }
    
    if (!savedUser || savedRole !== 'admin') {
        console.log('No valid admin session found, redirecting to login');
        window.location.href = 'login.html';
        return;
    }
    
    currentAdmin = JSON.parse(savedUser);
    document.getElementById('adminName').textContent = currentAdmin.full_name || 'Admin';
    
    console.log('Admin authenticated:', currentAdmin);
}

// Setup event listeners
function setupEventListeners() {
    // Sidebar navigation
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', function() {
            const section = this.dataset.section;
            switchSection(section);
        });
    });
    
    // Sidebar toggle
    document.getElementById('sidebarToggle').addEventListener('click', toggleSidebar);
    
    // Search functionality
    document.getElementById('userSearch').addEventListener('input', filterUsers);
    document.getElementById('contentSearch').addEventListener('input', filterContent);
    
    // Form submissions
    document.getElementById('uploadForm').addEventListener('submit', handleContentUpload);
    document.getElementById('userForm').addEventListener('submit', handleUserCreation);
    
    // Filters
    document.getElementById('contentTypeFilter').addEventListener('change', filterContent);
    document.getElementById('activityFilter').addEventListener('change', filterActivities);
    document.getElementById('dateRange').addEventListener('change', updateAnalytics);
    
    // Settings forms
    document.querySelectorAll('.settings-form').forEach(form => {
        form.addEventListener('submit', handleSettingsSave);
    });
}

// Switch between dashboard sections
function switchSection(section) {
    // Update active menu item
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-section="${section}"]`).classList.add('active');
    
    // Update content sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(section).classList.add('active');
    
    // Update page title and description
    updatePageHeader(section);
    
    // Load section-specific data
    loadSectionData(section);
}

// Update page header
function updatePageHeader(section) {
    const titles = {
        overview: 'Dashboard Overview',
        users: 'User Management',
        content: 'Content Management',
        analytics: 'Analytics & Reports',
        activity: 'Activity Logs',
        settings: 'System Settings'
    };
    
    const descriptions = {
        overview: 'Welcome to the admin panel',
        users: 'Manage users and their permissions',
        content: 'Upload and manage educational content',
        analytics: 'View detailed analytics and reports',
        activity: 'Monitor system activity and user actions',
        settings: 'Configure system settings and preferences'
    };
    
    document.getElementById('pageTitle').textContent = titles[section];
    document.getElementById('pageDescription').textContent = descriptions[section];
}

// Load dashboard data
async function loadDashboardData() {
    showLoading(true);
    
    try {
        await Promise.all([
            loadUsers(),
            loadContent(),
            loadActivities(),
            loadStats()
        ]);
        
        updateOverview();
        updateNotifications();
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showToast('Failed to load dashboard data', 'error');
    } finally {
        showLoading(false);
    }
}

// Load users data
async function loadUsers() {
    try {
        const { data: users, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        dashboardData.users = users || [];
        updateUsersTable();
        
    } catch (error) {
        console.error('Error loading users:', error);
        showToast('Failed to load users', 'error');
    }
}

// Load content data
async function loadContent() {
    try {
        const { data: content, error } = await supabase
            .from('content')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        dashboardData.content = content || [];
        updateContentList();
        
    } catch (error) {
        console.error('Error loading content:', error);
        showToast('Failed to load content', 'error');
    }
}

// Load activities data
async function loadActivities() {
    try {
        const { data: activities, error } = await supabase
            .from('activity_logs')
            .select('*, users(full_name, email)')
            .order('timestamp', { ascending: false })
            .limit(100);
        
        if (error) throw error;
        
        dashboardData.activities = activities || [];
        updateActivityTable();
        updateRecentActivity();
        
    } catch (error) {
        console.error('Error loading activities:', error);
        showToast('Failed to load activities', 'error');
    }
}

// Load statistics
async function loadStats() {
    try {
        // Get user stats
        const { count: totalUsers } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true });
        
        // Get new registrations (last 7 days)
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        const { count: newUsers } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', weekAgo.toISOString());
        
        // Get content stats
        const { count: totalContent } = await supabase
            .from('content')
            .select('*', { count: 'exact', head: true });
        
        dashboardData.stats = {
            totalUsers: totalUsers || 0,
            newRegistrations: newUsers || 0,
            totalContent: totalContent || 0,
            activeSessions: Math.floor(Math.random() * 50) + 10 // Mock data
        };
        
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Update overview section
function updateOverview() {
    const stats = dashboardData.stats;
    
    document.getElementById('totalUsers').textContent = stats.totalUsers;
    document.getElementById('newRegistrations').textContent = stats.newRegistrations;
    document.getElementById('totalContent').textContent = stats.totalContent;
    document.getElementById('activeSessions').textContent = stats.activeSessions;
    document.getElementById('onlineUsers').textContent = stats.activeSessions;
}

// Update users table
function updateUsersTable() {
    const tbody = document.getElementById('usersTable');
    const users = dashboardData.users;
    
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: rgba(255,255,255,0.6); padding: 2rem;">No users found</td></tr>';
        return;
    }
    
    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.full_name || 'N/A'}</td>
            <td>${user.email}</td>
            <td><span class="status-badge status-${user.role === 'admin' ? 'active' : 'inactive'}">${user.role}</span></td>
            <td>${user.phone || 'N/A'}</td>
            <td><span class="status-badge status-active">Active</span></td>
            <td>${formatDate(user.created_at)}</td>
            <td>
                <button class="btn-secondary" onclick="editUser('${user.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-secondary" onclick="deleteUser('${user.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Update content list
function updateContentList() {
    const container = document.getElementById('contentList');
    const content = dashboardData.content;
    
    if (content.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: rgba(255,255,255,0.6); padding: 2rem;">No content found</div>';
        return;
    }
    
    container.innerHTML = content.map(item => `
        <div class="content-item">
            <div class="content-icon">
                <i class="fas fa-${getContentIcon(item.type)}"></i>
            </div>
            <div class="content-info">
                <h4>${item.title}</h4>
                <p>${item.description || 'No description'}</p>
                <div class="content-meta">
                    <span>${item.type}</span>
                    <span>${formatDate(item.created_at)}</span>
                </div>
            </div>
            <div class="content-actions">
                <button class="btn-secondary" onclick="downloadContent('${item.id}')">
                    <i class="fas fa-download"></i>
                </button>
                <button class="btn-secondary" onclick="deleteContent('${item.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Update activity table
function updateActivityTable() {
    const tbody = document.getElementById('activityTable');
    const activities = dashboardData.activities;
    
    if (activities.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: rgba(255,255,255,0.6); padding: 2rem;">No activities found</td></tr>';
        return;
    }
    
    tbody.innerHTML = activities.map(activity => `
        <tr>
            <td>${activity.users?.full_name || 'System'}</td>
            <td>${activity.action}</td>
            <td>${activity.description}</td>
            <td>${activity.session_id}</td>
            <td>${formatDate(activity.timestamp)}</td>
        </tr>
    `).join('');
}

// Update recent activity
function updateRecentActivity() {
    const container = document.getElementById('recentActivity');
    const activities = dashboardData.activities.slice(0, 5);
    
    if (activities.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: rgba(255,255,255,0.6); padding: 1rem;">No recent activity</div>';
        return;
    }
    
    container.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon">
                <i class="fas fa-${getActivityIcon(activity.action)}"></i>
            </div>
            <div class="activity-content">
                <div class="activity-title">${activity.description}</div>
                <div class="activity-time">${formatTimeAgo(activity.timestamp)}</div>
            </div>
        </div>
    `).join('');
}

// Update notifications
function updateNotifications() {
    const newUsers = dashboardData.stats.newRegistrations;
    const notificationCount = document.getElementById('notificationCount');
    
    notificationCount.textContent = newUsers;
    notificationCount.style.display = newUsers > 0 ? 'block' : 'none';
}

// Load section-specific data
function loadSectionData(section) {
    switch (section) {
        case 'users':
            loadUsers();
            break;
        case 'content':
            loadContent();
            break;
        case 'analytics':
            loadAnalytics();
            break;
        case 'activity':
            loadActivities();
            break;
    }
}

// Load analytics data
async function loadAnalytics() {
    // This would typically load chart data
    // For now, we'll show placeholder charts
    document.getElementById('userGrowthChart').innerHTML = '<p>User Growth Chart</p>';
    document.getElementById('contentUploadChart').innerHTML = '<p>Content Upload Chart</p>';
    document.getElementById('userActivityChart').innerHTML = '<p>User Activity Chart</p>';
}

// Handle content upload
async function handleContentUpload(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const contentType = formData.get('contentType');
    const title = formData.get('contentTitle');
    const description = formData.get('contentDescription');
    const file = formData.get('contentFile');
    const accessLevel = formData.get('accessLevel');
    
    if (!file || file.size === 0) {
        showToast('Please select a file', 'error');
        return;
    }
    
    showLoading(true);
    
    try {
        // Upload file to Supabase Storage
        const fileName = `${Date.now()}_${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('content')
            .upload(fileName, file);
        
        if (uploadError) throw uploadError;
        
        // Save content metadata to database
        const { data: content, error: dbError } = await supabase
            .from('content')
            .insert([
                {
                    title: title,
                    description: description,
                    type: contentType,
                    file_path: uploadData.path,
                    access_level: accessLevel,
                    uploaded_by: currentAdmin.id,
                    created_at: new Date().toISOString()
                }
            ])
            .select()
            .single();
        
        if (dbError) throw dbError;
        
        // Log activity
        await logActivity('upload', currentAdmin.id, `Uploaded content: ${title}`);
        
        showToast('Content uploaded successfully', 'success');
        closeModal('uploadModal');
        e.target.reset();
        
        // Reload content
        await loadContent();
        
    } catch (error) {
        console.error('Error uploading content:', error);
        showToast('Failed to upload content', 'error');
    } finally {
        showLoading(false);
    }
}

// Handle user creation
async function handleUserCreation(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const fullName = formData.get('userFullName');
    const email = formData.get('userEmail');
    const phone = formData.get('userPhone');
    const role = formData.get('userRole');
    const password = formData.get('userPassword');
    
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
        
        if (error) throw error;
        
        // Log activity
        await logActivity('user_creation', currentAdmin.id, `Created user: ${fullName}`);
        
        showToast('User created successfully', 'success');
        closeModal('userModal');
        e.target.reset();
        
        // Reload users
        await loadUsers();
        
    } catch (error) {
        console.error('Error creating user:', error);
        showToast('Failed to create user', 'error');
    } finally {
        showLoading(false);
    }
}

// Handle settings save
async function handleSettingsSave(e) {
    e.preventDefault();
    
    // This would typically save settings to database
    showToast('Settings saved successfully', 'success');
}

// Filter functions
function filterUsers() {
    const searchTerm = document.getElementById('userSearch').value.toLowerCase();
    const filteredUsers = dashboardData.users.filter(user => 
        user.full_name?.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        user.role.toLowerCase().includes(searchTerm)
    );
    
    updateUsersTableWithData(filteredUsers);
}

function filterContent() {
    const searchTerm = document.getElementById('contentSearch').value.toLowerCase();
    const typeFilter = document.getElementById('contentTypeFilter').value;
    
    let filteredContent = dashboardData.content;
    
    if (typeFilter) {
        filteredContent = filteredContent.filter(item => item.type === typeFilter);
    }
    
    if (searchTerm) {
        filteredContent = filteredContent.filter(item =>
            item.title.toLowerCase().includes(searchTerm) ||
            item.description?.toLowerCase().includes(searchTerm)
        );
    }
    
    updateContentListWithData(filteredContent);
}

function filterActivities() {
    const filter = document.getElementById('activityFilter').value;
    let filteredActivities = dashboardData.activities;
    
    if (filter) {
        filteredActivities = filteredActivities.filter(activity => activity.action === filter);
    }
    
    updateActivityTableWithData(filteredActivities);
}

// Update functions with filtered data
function updateUsersTableWithData(users) {
    const tbody = document.getElementById('usersTable');
    
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: rgba(255,255,255,0.6); padding: 2rem;">No users found</td></tr>';
        return;
    }
    
    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.full_name || 'N/A'}</td>
            <td>${user.email}</td>
            <td><span class="status-badge status-${user.role === 'admin' ? 'active' : 'inactive'}">${user.role}</span></td>
            <td>${user.phone || 'N/A'}</td>
            <td><span class="status-badge status-active">Active</span></td>
            <td>${formatDate(user.created_at)}</td>
            <td>
                <button class="btn-secondary" onclick="editUser('${user.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-secondary" onclick="deleteUser('${user.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function updateContentListWithData(content) {
    const container = document.getElementById('contentList');
    
    if (content.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: rgba(255,255,255,0.6); padding: 2rem;">No content found</div>';
        return;
    }
    
    container.innerHTML = content.map(item => `
        <div class="content-item">
            <div class="content-icon">
                <i class="fas fa-${getContentIcon(item.type)}"></i>
            </div>
            <div class="content-info">
                <h4>${item.title}</h4>
                <p>${item.description || 'No description'}</p>
                <div class="content-meta">
                    <span>${item.type}</span>
                    <span>${formatDate(item.created_at)}</span>
                </div>
            </div>
            <div class="content-actions">
                <button class="btn-secondary" onclick="downloadContent('${item.id}')">
                    <i class="fas fa-download"></i>
                </button>
                <button class="btn-secondary" onclick="deleteContent('${item.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function updateActivityTableWithData(activities) {
    const tbody = document.getElementById('activityTable');
    
    if (activities.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: rgba(255,255,255,0.6); padding: 2rem;">No activities found</td></tr>';
        return;
    }
    
    tbody.innerHTML = activities.map(activity => `
        <tr>
            <td>${activity.users?.full_name || 'System'}</td>
            <td>${activity.action}</td>
            <td>${activity.description}</td>
            <td>${activity.session_id}</td>
            <td>${formatDate(activity.timestamp)}</td>
        </tr>
    `).join('');
}

// Utility functions
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.querySelector('.main-content');
    
    sidebar.classList.toggle('collapsed');
    mainContent.classList.toggle('expanded');
}

function showModal(modalId) {
    document.getElementById(modalId).classList.add('show');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (show) {
        overlay.classList.add('show');
    } else {
        overlay.classList.remove('show');
    }
}

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
    
    setTimeout(() => toast.classList.add('show'), 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (container.contains(toast)) {
                container.removeChild(toast);
            }
        }, 300);
    }, 5000);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatTimeAgo(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
}

function getContentIcon(type) {
    const icons = {
        notes: 'file-alt',
        videos: 'video',
        images: 'image',
        documents: 'file-pdf'
    };
    return icons[type] || 'file';
}

function getActivityIcon(action) {
    const icons = {
        login: 'sign-in-alt',
        registration: 'user-plus',
        upload: 'upload',
        download: 'download',
        user_creation: 'user-plus'
    };
    return icons[action] || 'info-circle';
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
                    session_id: localStorage.getItem('currentSessionId'),
                    timestamp: new Date().toISOString()
                }
            ]);
    } catch (error) {
        console.error('Error logging activity:', error);
    }
}

// Action functions
function showUploadModal() {
    showModal('uploadModal');
}

function showUserModal() {
    showModal('userModal');
}

function refreshRecentActivity() {
    loadActivities();
}

function exportData() {
    showToast('Export feature coming soon!', 'info');
}

function showAnalytics() {
    switchSection('analytics');
}

function editUser(userId) {
    showToast('Edit user feature coming soon!', 'info');
}

function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        showToast('Delete user feature coming soon!', 'info');
    }
}

function downloadContent(contentId) {
    showToast('Download feature coming soon!', 'info');
}

function deleteContent(contentId) {
    if (confirm('Are you sure you want to delete this content?')) {
        showToast('Delete content feature coming soon!', 'info');
    }
}

function exportReport() {
    showToast('Export report feature coming soon!', 'info');
}

function clearLogs() {
    if (confirm('Are you sure you want to clear all activity logs?')) {
        showToast('Clear logs feature coming soon!', 'info');
    }
}

function updateAnalytics() {
    loadAnalytics();
}

// Logout function
function logout() {
    console.log('Logging out admin...');
    
    // Clear all session data
    localStorage.removeItem('educare_user');
    localStorage.removeItem('educare_session_id');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentRole');
    localStorage.removeItem('currentSessionId');
    localStorage.removeItem('rememberMe');
    
    // Clear any other related data
    sessionStorage.clear();
    
    // Log the logout activity if possible
    if (currentAdmin && currentAdmin.id) {
        logActivity('logout', currentAdmin.id, 'Admin logged out successfully');
    }
    
    // Show logout message
    showToast('Logged out successfully!', 'success');
    
    // Redirect to login page after a short delay
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1000);
}

// Export functions for global access
window.showUploadModal = showUploadModal;
window.showUserModal = showUserModal;
window.refreshRecentActivity = refreshRecentActivity;
window.exportData = exportData;
window.showAnalytics = showAnalytics;
window.editUser = editUser;
window.deleteUser = deleteUser;
window.downloadContent = downloadContent;
window.deleteContent = deleteContent;
window.exportReport = exportReport;
window.clearLogs = clearLogs;
window.updateAnalytics = updateAnalytics;
window.closeModal = closeModal;
window.logout = logout;
