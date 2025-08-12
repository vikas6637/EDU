# Database Setup Guide for Educare Institute

## Step-by-Step Instructions

### 1. Access Supabase SQL Editor
- Go to your Supabase project dashboard
- Click on "SQL Editor" in the left sidebar
- Click "New Query" to create a new SQL script

### 2. Run the Database Setup Script
- Copy the entire contents of `database-setup.sql`
- Paste it into the SQL Editor
- Click "Run" to execute the script

### 3. Verify the Setup
After running the script, you should see:
- "Database setup completed successfully!"
- A count of users (should be 1 - the default admin)
- Counts for other tables (should be 0 initially)

### 4. Create Storage Bucket
- Go to "Storage" in the left sidebar
- Click "New Bucket"
- Name: `content-files`
- Public bucket: Check this if you want files to be publicly accessible
- Click "Create bucket"

### 5. Test the Connection
- Open `test-database.html` in your browser
- Click "Test Connection" to verify everything is working
- You should see "✅ Connection successful! Database is accessible."

### 6. Test Login
- Try logging in with the default admin account:
  - Email: `admin@educare.com`
  - Password: `admin123`

## Troubleshooting Common Errors

### Error: "column 'is_public' does not exist"
**Cause:** The script didn't run completely or there was a syntax error.
**Solution:** 
1. Make sure you copied the entire script
2. Run it in a fresh SQL Editor session
3. Check for any error messages during execution

### Error: "relation 'users' already exists"
**Cause:** Tables were created in a previous attempt.
**Solution:** 
1. The script uses `IF NOT EXISTS`, so this shouldn't happen
2. If it does, you can drop existing tables first:
   ```sql
   DROP TABLE IF EXISTS notifications CASCADE;
   DROP TABLE IF EXISTS content CASCADE;
   DROP TABLE IF EXISTS activity_logs CASCADE;
   DROP TABLE IF EXISTS users CASCADE;
   ```
3. Then run the setup script again

### Error: "permission denied"
**Cause:** Insufficient permissions for the anon role.
**Solution:** 
1. Make sure you're running the script as the postgres user
2. Check that the GRANT statements executed successfully

## What the Script Creates

1. **users table** - Stores user accounts and credentials
2. **activity_logs table** - Tracks user actions and sessions
3. **content table** - Stores uploaded files and content
4. **notifications table** - Manages user notifications
5. **Indexes** - For better query performance
6. **RLS Policies** - For data access control
7. **Triggers** - For automatic timestamp updates
8. **Default admin user** - Ready to use account

## Next Steps After Setup

1. Update your JavaScript files with your Supabase credentials
2. Test the login system
3. Try uploading content as admin
4. Test user registration and login

## Need Help?

If you encounter any errors:
1. Check the error message carefully
2. Make sure all steps were followed
3. Try running the script in smaller parts
4. Contact support with the specific error message
