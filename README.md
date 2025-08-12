# Educare Institute - Login System

A modern, comprehensive login system for Educare Institute with glassmorphism design, user/admin authentication, and Supabase database integration.

## Features

### 🔐 Authentication System
- **User/Admin Login**: Separate authentication for students, parents, and administrators
- **Registration**: New user registration with role selection
- **Session Management**: Unique session IDs and persistent login
- **Password Security**: Password visibility toggle and validation

### 🎨 Modern UI/UX
- **Glassmorphism Design**: Premium frosted glass effects
- **Responsive Layout**: Works perfectly on all devices
- **Smooth Animations**: Engaging user interactions
- **Dark Theme**: Eye-friendly gradient backgrounds

### 👨‍💼 Admin Dashboard
- **User Management**: View, add, edit, and delete users
- **Content Upload**: Upload notes, videos, images, and documents
- **Analytics**: User growth, content uploads, and activity monitoring
- **Activity Logs**: Track all user actions and system events
- **Settings**: Configure system preferences and security

### 👤 User Dashboard
- **Profile Management**: View and edit personal information
- **Content Access**: Browse and search available educational content
- **Activity Tracking**: View recent login and activity history
- **Notifications**: Real-time system notifications
- **Quick Actions**: Easy access to common features

### 🗄️ Database Features
- **Supabase Integration**: Real-time database with PostgreSQL
- **User Storage**: Secure user data and authentication
- **Content Management**: File uploads and metadata storage
- **Activity Logging**: Comprehensive audit trail
- **Session Tracking**: Monitor active user sessions

## Setup Instructions

### 1. Database Setup (Supabase)

1. **Create Supabase Account**
   - Go to [supabase.com](https://supabase.com)
   - Sign up for a free account
   - Create a new project

2. **Database Tables**
   Run these SQL commands in your Supabase SQL editor:

```sql
-- Users table
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    password VARCHAR NOT NULL,
    full_name VARCHAR,
    phone VARCHAR,
    role VARCHAR DEFAULT 'student' CHECK (role IN ('student', 'parent', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content table
CREATE TABLE content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR NOT NULL,
    description TEXT,
    type VARCHAR NOT NULL CHECK (type IN ('notes', 'videos', 'images', 'documents')),
    file_path VARCHAR,
    access_level VARCHAR DEFAULT 'public' CHECK (access_level IN ('public', 'students', 'parents', 'admin')),
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity logs table
CREATE TABLE activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    action VARCHAR NOT NULL,
    description TEXT,
    session_id VARCHAR,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Create policies (basic example)
CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Content is viewable by appropriate users" ON content
    FOR SELECT USING (
        access_level = 'public' OR 
        access_level = 'students' OR 
        access_level = 'parents'
    );
```

3. **Storage Setup**
   - Go to Storage in your Supabase dashboard
   - Create a new bucket called `content`
   - Set it to public or private based on your needs

### 2. Configuration

1. **Get Supabase Credentials**
   - Go to Settings > API in your Supabase dashboard
   - Copy your Project URL and anon/public key

2. **Update Configuration**
   - Open `js/login.js`
   - Replace `SUPABASE_URL` and `SUPABASE_ANON_KEY` with your actual values
   - Do the same for `js/admin-dashboard.js` and `js/user-dashboard.js`

```javascript
const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';
```

### 3. File Structure

```
EDU/
├── index.html              # Main homepage
├── login.html              # Login/Registration page
├── admin-dashboard.html    # Admin dashboard
├── user-dashboard.html     # User dashboard
├── css/
│   ├── login.css           # Login page styles
│   ├── admin-dashboard.css # Admin dashboard styles
│   ├── user-dashboard.css  # User dashboard styles
│   └── styles.css          # Main website styles
├── js/
│   ├── login.js            # Login system logic
│   ├── admin-dashboard.js  # Admin dashboard logic
│   └── user-dashboard.js   # User dashboard logic
└── images/                 # Website images
```

### 4. Running the Application

1. **Local Development**
   - Open `index.html` in your browser
   - Or use a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```

2. **Production Deployment**
   - Upload files to your web server
   - Ensure HTTPS is enabled for security
   - Configure CORS if needed

## Default Credentials

### Admin Account
- **Email**: admin@educare.com
- **Password**: admin123

### Test User Account
- **Email**: student@educare.com
- **Password**: student123

## Features in Detail

### Login System
- **Unique Session IDs**: Each login generates a unique session identifier
- **Role-based Access**: Different dashboards for users and admins
- **Remember Me**: Optional persistent login
- **Password Recovery**: Coming soon feature

### Admin Features
- **User Management**: Complete CRUD operations for users
- **Content Upload**: Drag-and-drop file uploads with metadata
- **Real-time Analytics**: Live statistics and charts
- **Activity Monitoring**: Track all user actions
- **System Settings**: Configure security and preferences

### User Features
- **Profile Management**: Update personal information
- **Content Browsing**: Search and filter educational materials
- **Activity History**: View recent actions
- **Notifications**: System alerts and updates

## Security Features

- **Password Validation**: Minimum 6 characters required
- **Email Verification**: Unique email addresses
- **Session Management**: Secure session handling
- **Role-based Permissions**: Access control based on user roles
- **Activity Logging**: Complete audit trail

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Customization

### Colors
The system uses a gradient theme that can be customized in the CSS files:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Logo
Replace `images/logo.png` with your institute's logo.

### Content Types
Add new content types by updating the database schema and UI components.

## Troubleshooting

### Common Issues

1. **Supabase Connection Error**
   - Verify your URL and API key are correct
   - Check if your Supabase project is active
   - Ensure RLS policies are configured properly

2. **File Upload Issues**
   - Check Supabase storage bucket permissions
   - Verify file size limits
   - Ensure proper CORS configuration

3. **Login Problems**
   - Clear browser cache and cookies
   - Check browser console for errors
   - Verify database tables are created correctly

### Debug Mode
Enable debug logging by opening browser console and checking for error messages.

## Future Enhancements

- [ ] Email verification system
- [ ] Password reset functionality
- [ ] Two-factor authentication
- [ ] Advanced analytics and reporting
- [ ] Mobile app integration
- [ ] Video conferencing features
- [ ] Assignment submission system
- [ ] Grade tracking
- [ ] Parent portal
- [ ] Payment integration

## Support

For technical support or questions:
- Check the browser console for error messages
- Verify all configuration steps are completed
- Ensure Supabase project is properly set up

## License

This project is created for Educare Institute. Please ensure proper licensing for your use case.

---

**Note**: This is a comprehensive login system designed for educational institutions. Make sure to implement proper security measures and comply with data protection regulations in your region.
