// Supabase Configuration
const SUPABASE_URL = 'https://gjmuggtzcspazepfrowz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqbXVnZ3R6Y3NwYXplcGZyb3d6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MzIzNDEsImV4cCI6MjA3MDQwODM0MX0.7nDJOm0DC_cUpUNDNxqcT-I6E9BS7S4zFzE1J7YXzVY';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Global variables
let currentUser = null;
let userData = {
    profile: {},
    activities: [],
    content: [],
    notifications: [],
    stats: {},
    analytics: {},
    courseProgress: []
};

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', function() {
    console.log('User dashboard initializing...');
    checkUserAuth();
    setupEventListeners();
    loadUserData();
});

// Check user authentication
function checkUserAuth() {
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
    
    if (!savedUser || savedRole === 'admin') {
        console.log('No valid user session found, redirecting to login');
        window.location.href = 'login.html';
        return;
    }
    
    currentUser = JSON.parse(savedUser);
    updateUserInfo();
    
    console.log('User authenticated:', currentUser);
}

// Setup event listeners
function setupEventListeners() {
    // Content filters
    document.getElementById('contentFilter').addEventListener('change', filterContent);
    document.getElementById('contentSearch').addEventListener('input', filterContent);
    
    // Edit profile form
    document.getElementById('editProfileForm').addEventListener('submit', handleProfileUpdate);
    
    // Analytics period
    setupAnalyticsListeners();
}

// Update user information in header
function updateUserInfo() {
    document.getElementById('userName').textContent = currentUser.full_name || 'User';
    document.getElementById('userRole').textContent = currentUser.role || 'Student';
    document.getElementById('welcomeName').textContent = currentUser.full_name || 'User';
}

// Load user data
async function loadUserData() {
    showLoading(true);
    
    try {
        await Promise.all([
            loadUserProfile(),
            loadUserActivities(),
            loadAvailableContent(),
            loadNotifications(),
            loadUserStats(),
            loadAnalytics(),
            loadCourseProgress()
        ]);
        
        updateDashboard();
        
    } catch (error) {
        console.error('Error loading user data:', error);
        showToast('Failed to load dashboard data', 'error');
    } finally {
        showLoading(false);
    }
}

// Load user profile
async function loadUserProfile() {
    try {
        // Enhanced profile data
        const enhancedProfile = {
            ...currentUser,
            phone: '+1 (555) 123-4567',
            location: 'New York, USA',
            education: 'High School',
            languages: 'English, Spanish',
            achievements: ['Top Learner', 'Perfect Score', 'Consistent Attendance'],
            stats: {
                activeCourses: 5,
                certificates: 3,
                learningPoints: 1250
            }
        };
        
        userData.profile = enhancedProfile;
        updateProfileDisplay();
        
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

// Update profile display
function updateProfileDisplay() {
    const profile = userData.profile;
    if (!profile) return;
    
    // Update basic info
    document.getElementById('profileName').textContent = profile.full_name || 'User Name';
    document.getElementById('profileEmail').textContent = profile.email || 'user@example.com';
    document.getElementById('profileRole').textContent = profile.role || 'Student';
    
    // Update additional details
    document.getElementById('profilePhone').textContent = profile.phone || 'N/A';
    document.getElementById('profileLocation').textContent = profile.location || 'N/A';
    document.getElementById('profileEducation').textContent = profile.education || 'N/A';
    document.getElementById('profileLanguages').textContent = profile.languages || 'N/A';
    
    // Update stats
    if (profile.stats) {
        document.getElementById('profileCourses').textContent = profile.stats.activeCourses || 0;
        document.getElementById('profileCertificates').textContent = profile.stats.certificates || 0;
        document.getElementById('profilePoints').textContent = profile.stats.learningPoints || 0;
    }
}

// Load user activities
async function loadUserActivities() {
    try {
        // Show loading state
        showActivityLoading();
        
        const { data: activities, error } = await supabase
            .from('activity_logs')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('timestamp', { ascending: false })
            .limit(15);
        
        if (error) throw error;
        
        // If no activities from database, create sample activities
        if (!activities || activities.length === 0) {
            userData.activities = generateSampleActivities();
        } else {
            userData.activities = activities;
        }
        
        updateActivityList();
        setupActivityFilters();
        
    } catch (error) {
        console.error('Error loading user activities:', error);
        // Fallback to sample activities
        userData.activities = generateSampleActivities();
        updateActivityList();
        setupActivityFilters();
    }
}

// Generate sample activities for demonstration
function generateSampleActivities() {
    const now = new Date();
    return [
        {
            id: 1,
            action: 'login',
            description: 'Successfully logged into your account',
            timestamp: new Date(now.getTime() - 5 * 60000).toISOString(), // 5 minutes ago
            category: 'login',
            status: 'success'
        },
        {
            id: 2,
            action: 'course_enroll',
            description: 'Enrolled in Advanced Mathematics course',
            timestamp: new Date(now.getTime() - 2 * 3600000).toISOString(), // 2 hours ago
            category: 'course',
            status: 'success'
        },
        {
            id: 3,
            action: 'lesson_complete',
            description: 'Completed lesson: Introduction to Algebra',
            timestamp: new Date(now.getTime() - 4 * 3600000).toISOString(), // 4 hours ago
            category: 'progress',
            status: 'success'
        },
        {
            id: 4,
            action: 'content_download',
            description: 'Downloaded study notes for Chapter 3',
            timestamp: new Date(now.getTime() - 6 * 3600000).toISOString(), // 6 hours ago
            category: 'content',
            status: 'info'
        },
        {
            id: 5,
            action: 'quiz_attempt',
            description: 'Attempted quiz: Basic Mathematics - Score: 85%',
            timestamp: new Date(now.getTime() - 8 * 3600000).toISOString(), // 8 hours ago
            category: 'progress',
            status: 'warning'
        },
        {
            id: 6,
            action: 'profile_update',
            description: 'Updated your profile information',
            timestamp: new Date(now.getTime() - 24 * 3600000).toISOString(), // 1 day ago
            category: 'login',
            status: 'info'
        },
        {
            id: 7,
            action: 'course_progress',
            description: 'Reached 60% completion in Science Fundamentals',
            timestamp: new Date(now.getTime() - 2 * 24 * 3600000).toISOString(), // 2 days ago
            category: 'progress',
            status: 'success'
        }
    ];
}

// Show loading state for activities
function showActivityLoading() {
    const container = document.getElementById('userActivityList');
    container.innerHTML = Array(5).fill(0).map((_, i) => `
        <div class="activity-item loading">
            <div class="activity-icon">
                <i class="fas fa-spinner fa-spin"></i>
            </div>
            <div class="activity-content">
                <div class="activity-title">Loading activity...</div>
                <div class="activity-time">Just now</div>
            </div>
        </div>
    `).join('');
}

// Setup activity filters
function setupActivityFilters() {
    const filterChips = document.querySelectorAll('.filter-chip');
    
    filterChips.forEach(chip => {
        chip.addEventListener('click', () => {
            // Remove active class from all chips
            filterChips.forEach(c => c.classList.remove('active'));
            // Add active class to clicked chip
            chip.classList.add('active');
            
            const filter = chip.dataset.filter;
            filterActivities(filter);
        });
    });
}

// Filter activities based on selected category
function filterActivities(category) {
    const activities = userData.activities;
    let filteredActivities = activities;
    
    if (category !== 'all') {
        filteredActivities = activities.filter(activity => 
            activity.category === category || activity.action.includes(category)
        );
    }
    
    updateActivityListWithData(filteredActivities);
}

// Update activity list with filtered data
function updateActivityListWithData(activities) {
    const container = document.getElementById('userActivityList');
    
    if (activities.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fas fa-inbox"></i>
                </div>
                <div class="empty-state-title">No activities found</div>
                <div class="empty-state-description">No activities match the selected filter.</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = activities.map(activity => `
        <div class="activity-item" data-category="${activity.category}">
            <div class="activity-icon">
                <i class="fas fa-${getActivityIcon(activity.action)}"></i>
            </div>
            <div class="activity-content">
                <div class="activity-title">${activity.description}</div>
                <div class="activity-time">${formatTimeAgo(activity.timestamp)}</div>
            </div>
            <div class="activity-badge ${activity.status || 'info'}">
                <i class="fas fa-${getStatusIcon(activity.status)}"></i>
                ${activity.status || 'info'}
            </div>
        </div>
    `).join('');
}

// Get status icon based on activity status
function getStatusIcon(status) {
    switch (status) {
        case 'success': return 'check-circle';
        case 'warning': return 'exclamation-triangle';
        case 'error': return 'times-circle';
        case 'info': return 'info-circle';
        default: return 'info-circle';
    }
}

// Load notifications
async function loadNotifications() {
    try {
        // Show loading state
        showNotificationLoading();
        
        // Mock notifications for now - in real app, fetch from database
        userData.notifications = [
            {
                id: 1,
                title: 'New Course Available',
                message: 'Advanced Physics course has been added to your curriculum. Start learning now!',
                timestamp: new Date().toISOString(),
                read: false,
                type: 'course',
                priority: 'high'
            },
            {
                id: 2,
                title: 'Assignment Due Soon',
                message: 'Your Mathematics assignment is due in 2 days. Don\'t forget to submit!',
                timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
                read: false,
                type: 'assignment',
                priority: 'medium'
            },
            {
                id: 3,
                title: 'Welcome to Educare Institute',
                message: 'Thank you for joining our learning community! We\'re excited to have you on board.',
                timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
                read: true,
                type: 'welcome',
                priority: 'low'
            },
            {
                id: 4,
                title: 'Study Reminder',
                message: 'You haven\'t studied for 3 days. Keep up the momentum!',
                timestamp: new Date(Date.now() - 3 * 24 * 3600000).toISOString(),
                read: true,
                type: 'reminder',
                priority: 'medium'
            },
            {
                id: 5,
                title: 'Certificate Earned',
                message: 'Congratulations! You\'ve earned a certificate for completing Basic Mathematics.',
                timestamp: new Date(Date.now() - 5 * 24 * 3600000).toISOString(),
                read: true,
                type: 'achievement',
                priority: 'high'
            }
        ];
        
        updateNotificationsList();
        
    } catch (error) {
        console.error('Error loading notifications:', error);
        showToast('Failed to load notifications', 'error');
    }
}

// Show loading state for notifications
function showNotificationLoading() {
    const container = document.getElementById('notificationsList');
    container.innerHTML = Array(3).fill(0).map((_, i) => `
        <div class="notification-item loading">
            <div class="notification-icon">
                <i class="fas fa-spinner fa-spin"></i>
            </div>
            <div class="notification-content">
                <div class="notification-title">Loading notification...</div>
                <div class="notification-message">Please wait...</div>
                <div class="notification-time">Just now</div>
            </div>
        </div>
    `).join('');
}

// Load available content
async function loadAvailableContent() {
    try {
        // Mock content data with more details
        const content = [
            {
                id: 1,
                title: 'Mathematics Chapter 5: Calculus',
                description: 'Advanced calculus concepts including derivatives and integrals',
                type: 'notes',
                size: '2.4 MB',
                uploadDate: '2024-01-15',
                downloads: 45,
                rating: 4.8
            },
            {
                id: 2,
                title: 'Physics Lab Video: Wave Motion',
                description: 'Demonstration of wave properties and experiments',
                type: 'videos',
                size: '156 MB',
                uploadDate: '2024-01-14',
                views: 128,
                duration: '15:32'
            },
            {
                id: 3,
                title: 'English Essay Template',
                description: 'Professional essay writing structure and guidelines',
                type: 'documents',
                size: '1.2 MB',
                uploadDate: '2024-01-13',
                downloads: 67,
                format: 'PDF'
            },
            {
                id: 4,
                title: 'History Timeline Infographic',
                description: 'Visual timeline of major historical events',
                type: 'images',
                size: '3.8 MB',
                uploadDate: '2024-01-12',
                views: 89,
                resolution: '1920x1080'
            },
            {
                id: 5,
                title: 'Chemistry Quiz: Organic Compounds',
                description: 'Practice quiz on organic chemistry fundamentals',
                type: 'quizzes',
                size: 'N/A',
                uploadDate: '2024-01-11',
                attempts: 156,
                avgScore: 78
            },
            {
                id: 6,
                title: 'Programming Assignment: Python Basics',
                description: 'Coding exercises for Python programming fundamentals',
                type: 'assignments',
                size: 'N/A',
                uploadDate: '2024-01-10',
                submissions: 23,
                dueDate: '2024-01-20'
            }
        ];
        
        userData.content = content;
        updateContentGrid();
        
    } catch (error) {
        console.error('Error loading content:', error);
        showToast('Failed to load content', 'error');
    }
}

// Enhanced content grid update
function updateContentGrid() {
    const contentGrid = document.getElementById('contentGrid');
    if (!contentGrid || !userData.content) return;
    
    const contentHTML = userData.content.map(item => `
        <div class="content-item" data-type="${item.type}" data-id="${item.id}">
            <div class="content-header">
                <div class="content-icon">
                    <i class="${getContentIcon(item.type)}"></i>
                </div>
                <div class="content-info">
                    <h4>${item.title}</h4>
                    <p>${item.description}</p>
                </div>
            </div>
            <div class="content-meta">
                <span>${formatDate(item.uploadDate)}</span>
                <div class="content-actions">
                    <button onclick="viewContent(${item.id})" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="downloadContent(${item.id})" title="Download">
                        <i class="fas fa-download"></i>
                    </button>
                    <button onclick="shareContent(${item.id})" title="Share">
                        <i class="fas fa-share"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    contentGrid.innerHTML = contentHTML;
}

// New quick action functions
function scheduleStudy() {
    showToast('Study scheduling feature coming soon!', 'info');
    // In a real app, this would open a calendar/scheduling interface
}

function joinDiscussion() {
    showToast('Discussion forums coming soon!', 'info');
    // In a real app, this would open discussion boards
}

function customizeActions() {
    showToast('Action customization feature coming soon!', 'info');
    // In a real app, this would allow users to customize their quick actions
}

function refreshContent() {
    showToast('Refreshing content...', 'info');
    loadAvailableContent();
}

// Enhanced content interaction functions
function viewContent(contentId) {
    const content = userData.content.find(c => c.id === contentId);
    if (!content) return;
    
    showToast(`Opening ${content.title}...`, 'info');
    // In a real app, this would open the content in a viewer
}

function downloadContent(contentId) {
    const content = userData.content.find(c => c.id === contentId);
    if (!content) return;
    
    showToast(`Downloading ${content.title}...`, 'success');
    // In a real app, this would trigger a download
}

function shareContent(contentId) {
    const content = userData.content.find(c => c.id === contentId);
    if (!content) return;
    
    showToast(`Sharing ${content.title}...`, 'info');
    // In a real app, this would open sharing options
}

// Load user stats
async function loadUserStats() {
    try {
        // Mock stats for now - in real app, calculate from database
        const totalCourses = 5;
        const completedLessons = 12;
        const totalLessons = 20;
        const totalHours = 24;
        
        userData.stats = {
            totalCourses,
            completedLessons,
            totalLessons,
            totalHours,
            progressPercentage: Math.round((completedLessons / totalLessons) * 100)
        };
        
        updateStats();
        updateProgressBar();
        
    } catch (error) {
        console.error('Error loading user stats:', error);
    }
}

// Update stats
function updateStats() {
    const stats = userData.stats;
    
    document.getElementById('totalCourses').textContent = stats.totalCourses;
    document.getElementById('completedLessons').textContent = stats.completedLessons;
    document.getElementById('totalHours').textContent = stats.totalHours;
}

// Update progress bar
function updateProgressBar() {
    const progressPercentage = userData.stats.progressPercentage || 0;
    const progressFill = document.getElementById('progressFill');
    const overallProgress = document.getElementById('overallProgress');
    
    if (progressFill && overallProgress) {
        // Animate the progress bar
        setTimeout(() => {
            progressFill.style.width = `${progressPercentage}%`;
        }, 500);
        
        overallProgress.textContent = `${progressPercentage}%`;
        
        // Update progress message based on percentage
        updateProgressMessage(progressPercentage);
    }
}

// Update progress message based on percentage
function updateProgressMessage(percentage) {
    const progressStats = document.querySelector('.progress-stats span');
    if (progressStats) {
        let message = '';
        
        if (percentage >= 90) {
            message = 'Excellent! You\'re almost there!';
        } else if (percentage >= 70) {
            message = 'Great progress! Keep up the momentum!';
        } else if (percentage >= 50) {
            message = 'Good work! You\'re halfway there!';
        } else if (percentage >= 25) {
            message = 'Keep going! Every lesson counts!';
        } else {
            message = 'Start your learning journey today!';
        }
        
        progressStats.textContent = message;
    }
}

// Update activity list
function updateActivityList() {
    const container = document.getElementById('userActivityList');
    const activities = userData.activities;
    
    if (activities.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fas fa-chart-line"></i>
                </div>
                <div class="empty-state-title">No Recent Activity</div>
                <div class="empty-state-description">Start learning to see your activity here!</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = activities.map(activity => `
        <div class="activity-item" data-category="${activity.category || 'general'}">
            <div class="activity-icon">
                <i class="fas fa-${getActivityIcon(activity.action)}"></i>
            </div>
            <div class="activity-content">
                <div class="activity-title">${activity.description}</div>
                <div class="activity-time">${formatTimeAgo(activity.timestamp)}</div>
            </div>
            <div class="activity-badge ${activity.status || 'info'}">
                <i class="fas fa-${getStatusIcon(activity.status)}"></i>
                ${activity.status || 'info'}
            </div>
        </div>
    `).join('');
}

// Update notifications list
function updateNotificationsList() {
    const container = document.getElementById('notificationsList');
    const notifications = userData.notifications;
    
    if (notifications.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fas fa-bell"></i>
                </div>
                <div class="empty-state-title">No Notifications</div>
                <div class="empty-state-description">You're all caught up!</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = notifications.map(notification => `
        <div class="notification-item ${notification.read ? 'read' : 'unread'}" data-id="${notification.id}">
            <div class="notification-icon">
                <i class="fas fa-${getNotificationIcon(notification.type)}"></i>
            </div>
            <div class="notification-content">
                <div class="notification-title">${notification.title}</div>
                <div class="notification-message">${notification.message}</div>
                <div class="notification-time">${formatTimeAgo(notification.timestamp)}</div>
            </div>
            <div class="notification-status">
                ${!notification.read ? '<div class="notification-badge"></div>' : ''}
                <div class="notification-priority ${notification.priority || 'low'}">${notification.priority || 'low'}</div>
            </div>
        </div>
    `).join('');
    
    // Add click handlers for notifications
    addNotificationClickHandlers();
    
    // Update notification count in header
    updateNotificationCount();
}

// Update notification count in header
function updateNotificationCount() {
    const unreadCount = userData.notifications.filter(n => !n.read).length;
    const countElement = document.getElementById('notificationCount');
    
    if (countElement) {
        countElement.textContent = unreadCount;
        
        // Hide count if no unread notifications
        if (unreadCount === 0) {
            countElement.style.display = 'none';
        } else {
            countElement.style.display = 'block';
        }
    }
}

// Toggle notifications panel (for future implementation)
function toggleNotifications() {
    // Scroll to notifications section
    const notificationsSection = document.querySelector('.notifications-card');
    if (notificationsSection) {
        notificationsSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
        
        // Add highlight effect
        notificationsSection.style.animation = 'pulse 0.6s ease-in-out';
        setTimeout(() => {
            notificationsSection.style.animation = '';
        }, 600);
    }
    
    showToast('Notifications section highlighted', 'info');
}

// Mark all notifications as read
function markAllRead() {
    userData.notifications.forEach(notification => {
        notification.read = true;
    });
    
    updateNotificationsList();
    showToast('All notifications marked as read', 'success');
}

// Get notification icon based on type
function getNotificationIcon(type) {
    switch (type) {
        case 'course': return 'graduation-cap';
        case 'assignment': return 'clipboard-list';
        case 'welcome': return 'hand-wave';
        case 'reminder': return 'clock';
        case 'achievement': return 'trophy';
        default: return 'bell';
    }
}

// Add click handlers for notifications
function addNotificationClickHandlers() {
    const notificationItems = document.querySelectorAll('.notification-item');
    
    notificationItems.forEach(item => {
        item.addEventListener('click', () => {
            if (item.classList.contains('unread')) {
                markNotificationAsRead(item);
            }
            // You can add more actions here like opening details, etc.
        });
    });
}

// Mark notification as read
function markNotificationAsRead(notificationElement) {
    const notificationId = notificationElement.dataset.id;
    
    // Update the notification in the data
    const notification = userData.notifications.find(n => n.id == notificationId);
    if (notification) {
        notification.read = true;
    }
    
    // Update the UI
    notificationElement.classList.remove('unread');
    notificationElement.classList.add('read');
    
    // Update the notification status
    const statusElement = notificationElement.querySelector('.notification-status');
    if (statusElement) {
        statusElement.innerHTML = '<div class="notification-priority low">low</div>';
    }
    
    showToast('Notification marked as read', 'success');
}

// Content filtering functionality
function filterContent() {
    const filterSelect = document.getElementById('contentFilter');
    const searchInput = document.getElementById('contentSearch');
    const contentGrid = document.getElementById('contentGrid');
    
    if (!filterSelect || !searchInput || !contentGrid || !userData.content) return;
    
    const selectedType = filterSelect.value;
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    let filteredContent = userData.content;
    
    // Filter by type
    if (selectedType) {
        filteredContent = filteredContent.filter(item => item.type === selectedType);
    }
    
    // Filter by search term
    if (searchTerm) {
        filteredContent = filteredContent.filter(item => 
            item.title.toLowerCase().includes(searchTerm) ||
            item.description.toLowerCase().includes(searchTerm)
        );
    }
    
    // Update the display
    if (filteredContent.length === 0) {
        contentGrid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <div class="empty-state-icon">
                    <i class="fas fa-search"></i>
                </div>
                <div class="empty-state-title">No content found</div>
                <div class="empty-state-description">
                    Try adjusting your filters or search terms
                </div>
            </div>
        `;
    } else {
        updateContentGridWithData(filteredContent);
    }
}

// Update content grid with specific data
function updateContentGridWithData(contentData) {
    const contentGrid = document.getElementById('contentGrid');
    if (!contentGrid) return;
    
    const contentHTML = contentData.map(item => `
        <div class="content-item" data-type="${item.type}" data-id="${item.id}">
            <div class="content-header">
                <div class="content-icon">
                    <i class="${getContentIcon(item.type)}"></i>
                </div>
                <div class="content-info">
                    <h4>${item.title}</h4>
                    <p>${item.description}</p>
                </div>
            </div>
            <div class="content-meta">
                <span>${formatDate(item.uploadDate)}</span>
                <div class="content-actions">
                    <button onclick="viewContent(${item.id})" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="downloadContent(${item.id})" title="Download">
                        <i class="fas fa-download"></i>
                    </button>
                    <button onclick="shareContent(${item.id})" title="Share">
                        <i class="fas fa-share"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    contentGrid.innerHTML = contentHTML;
}

// Enhanced profile update handling
async function handleProfileUpdate(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const updates = {
        full_name: formData.get('full_name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        location: formData.get('location'),
        education: formData.get('education'),
        languages: formData.get('languages')
    };
    
    try {
        // In a real app, this would update the database
        // For now, just update the local data
        Object.assign(userData.profile, updates);
        updateProfileDisplay();
        
        showToast('Profile updated successfully!', 'success');
        
        // Close the edit form
        const editForm = document.getElementById('editProfileForm');
        if (editForm) {
            editForm.style.display = 'none';
        }
        
    } catch (error) {
        console.error('Error updating profile:', error);
        showToast('Failed to update profile', 'error');
    }
}

// Action functions
function editProfile() {
    // Populate form with current data
    document.getElementById('editFullName').value = currentUser.full_name || '';
    document.getElementById('editEmail').value = currentUser.email || '';
    document.getElementById('editPhone').value = currentUser.phone || '';
    
    showModal('editProfileModal');
}

function viewAllActivity() {
    showToast('View all activity feature coming soon!', 'info');
}

function viewCourses() {
    showToast('View courses feature coming soon!', 'info');
}

function downloadNotes() {
    showToast('Download notes feature coming soon!', 'info');
}

function contactSupport() {
    showToast('Contact support feature coming soon!', 'info');
}

function viewProgress() {
    showToast('View progress feature coming soon!', 'info');
}

function markAllRead() {
    userData.notifications.forEach(notification => {
        notification.read = true;
    });
    updateNotificationsList();
    showToast('All notifications marked as read', 'success');
}

// Load analytics data
async function loadAnalytics() {
    try {
        // For now, use mock data
        const analyticsData = {
            studyTime: {
                week: { total: 28, distribution: { 'Mathematics': 8, 'Science': 6, 'English': 5, 'History': 4, 'Other': 5 } },
                month: { total: 120, distribution: { 'Mathematics': 35, 'Science': 28, 'English': 22, 'History': 18, 'Other': 17 } },
                quarter: { total: 360, distribution: { 'Mathematics': 105, 'Science': 84, 'English': 66, 'History': 54, 'Other': 51 } },
                year: { total: 1440, distribution: { 'Mathematics': 420, 'Science': 336, 'English': 264, 'History': 216, 'Other': 204 } }
            },
            performance: {
                avgScore: 85,
                completionRate: 78,
                studyStreak: 12
            }
        };
        
        userData.analytics = analyticsData;
        updateAnalytics();
        
    } catch (error) {
        console.error('Error loading analytics:', error);
    }
}

// Load course progress
async function loadCourseProgress() {
    try {
        // Mock course progress data
        const courseProgress = [
            { id: 1, name: 'Advanced Mathematics', progress: 75, totalLessons: 24, completedLessons: 18, lastAccessed: '2024-01-15' },
            { id: 2, name: 'Physics Fundamentals', progress: 60, totalLessons: 20, completedLessons: 12, lastAccessed: '2024-01-14' },
            { id: 3, name: 'English Literature', progress: 90, totalLessons: 16, completedLessons: 14, lastAccessed: '2024-01-15' },
            { id: 4, name: 'World History', progress: 45, totalLessons: 18, completedLessons: 8, lastAccessed: '2024-01-12' }
        ];
        
        userData.courseProgress = courseProgress;
        updateCourseProgress();
        
    } catch (error) {
        console.error('Error loading course progress:', error);
    }
}

// Update analytics display
function updateAnalytics() {
    const period = document.getElementById('analyticsPeriod').value;
    const analytics = userData.analytics;
    
    if (!analytics) return;
    
    // Update performance metrics
    document.getElementById('avgScore').textContent = `${analytics.performance.avgScore}%`;
    document.getElementById('completionRate').textContent = `${analytics.performance.completionRate}%`;
    document.getElementById('studyStreak').textContent = `${analytics.performance.studyStreak} days`;
    
    // Update study time chart (placeholder for now)
    updateStudyTimeChart(analytics.studyTime[period]);
}

// Update study time chart
function updateStudyTimeChart(data) {
    const chartContainer = document.getElementById('studyTimeChart');
    if (!chartContainer) return;
    
    // For now, show a simple text representation
    // In a real app, you'd use a charting library like Chart.js
    const totalHours = data.total;
    const distribution = data.distribution;
    
    let chartHTML = `
        <div class="study-time-summary">
            <div class="total-time">
                <h4>${totalHours} Hours</h4>
                <p>Total Study Time</p>
            </div>
            <div class="time-breakdown">
    `;
    
    Object.entries(distribution).forEach(([subject, hours]) => {
        const percentage = Math.round((hours / totalHours) * 100);
        chartHTML += `
            <div class="time-item">
                <span class="subject">${subject}</span>
                <span class="hours">${hours}h (${percentage}%)</span>
            </div>
        `;
    });
    
    chartHTML += `
            </div>
        </div>
    `;
    
    chartContainer.innerHTML = chartHTML;
}

// Update course progress
function updateCourseProgress() {
    const progressList = document.getElementById('courseProgressList');
    if (!progressList || !userData.courseProgress) return;
    
    const progressHTML = userData.courseProgress.map(course => `
        <div class="course-progress-item">
            <div class="course-info">
                <h4>${course.name}</h4>
                <p>${course.completedLessons}/${course.totalLessons} lessons completed</p>
            </div>
            <div class="course-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${course.progress}%"></div>
                </div>
                <span class="progress-text">${course.progress}%</span>
            </div>
            <div class="course-meta">
                <small>Last accessed: ${formatDate(course.lastAccessed)}</small>
            </div>
        </div>
    `).join('');
    
    progressList.innerHTML = progressHTML;
}

// Setup analytics period change listener
function setupAnalyticsListeners() {
    const analyticsPeriod = document.getElementById('analyticsPeriod');
    if (analyticsPeriod) {
        analyticsPeriod.addEventListener('change', function() {
            updateAnalytics();
        });
    }
}

// Utility functions
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

// Enhanced date formatting
function formatDate(dateString) {
    if (!dateString) return 'Unknown date';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays === 0) return 'Today';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    
    return date.toLocaleDateString('en-US', { 
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

// Enhanced content icon mapping
function getContentIcon(type) {
    const icons = {
        notes: 'fas fa-sticky-note',
        videos: 'fas fa-video',
        images: 'fas fa-image',
        documents: 'fas fa-file-pdf',
        quizzes: 'fas fa-question-circle',
        assignments: 'fas fa-tasks',
        audio: 'fas fa-music',
        presentations: 'fas fa-presentation',
        spreadsheets: 'fas fa-table',
        code: 'fas fa-code'
    };
    return icons[type] || 'fas fa-file';
}

function getActivityIcon(action) {
    const icons = {
        login: 'sign-in-alt',
        registration: 'user-plus',
        upload: 'upload',
        download: 'download',
        profile_update: 'user-edit'
    };
    return icons[action] || 'info-circle';
}

// Enhanced notification icon mapping
function getNotificationIcon(type) {
    const icons = {
        info: 'fas fa-info-circle',
        success: 'fas fa-check-circle',
        warning: 'fas fa-exclamation-triangle',
        error: 'fas fa-times-circle',
        reminder: 'fas fa-bell',
        achievement: 'fas fa-trophy',
        course: 'fas fa-graduation-cap',
        assignment: 'fas fa-tasks',
        quiz: 'fas fa-question-circle',
        system: 'fas fa-cog'
    };
    return icons[type] || 'fas fa-bell';
}

// Enhanced status icon mapping
function getStatusIcon(status) {
    const icons = {
        completed: 'fas fa-check-circle',
        in_progress: 'fas fa-clock',
        pending: 'fas fa-hourglass-half',
        failed: 'fas fa-times-circle',
        success: 'fas fa-check-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    return icons[status] || 'fas fa-circle';
}

// Logout function
function logout() {
    console.log('Logging out user...');
    
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
    if (currentUser && currentUser.id) {
        logActivity('logout', currentUser.id, 'User logged out successfully');
    }
    
    // Show logout message
    showToast('Logged out successfully!', 'success');
    
    // Redirect to login page after a short delay
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1000);
}

// Export functions for global access
window.editProfile = editProfile;
window.viewAllActivity = viewAllActivity;
window.viewCourses = viewCourses;
window.downloadNotes = downloadNotes;
window.contactSupport = contactSupport;
window.viewProgress = viewProgress;
window.markAllRead = markAllRead;
window.closeModal = closeModal;
window.logout = logout;
