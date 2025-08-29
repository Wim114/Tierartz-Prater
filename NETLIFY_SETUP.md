# Netlify Environment Setup Guide

## 🔧 Required Environment Variables

Set these in your Netlify dashboard under **Site Settings > Environment Variables**:

### 1. DATABASE_URL
- **Value**: Your Neon database connection string
- **Format**: `postgresql://username:password@host/database?sslmode=require`
- **Where to find**: Neon dashboard > Your project > Connection string

### 2. ADMIN_PASSWORD  
- **Value**: A secure password for admin access
- **Example**: `SecureAdminPass123!`
- **Note**: This is used for admin panel authentication

### 3. NODE_ENV
- **Value**: `production`
- **Purpose**: Enables production mode for the functions

## 🗄️ Database Setup

1. **Log into your Neon Console**: https://console.neon.tech/
2. **Open SQL Editor** for your database
3. **Run the SQL script** from `database-setup.sql`
4. **Verify** the table was created successfully

## 🔍 Testing the Setup

After setting up:

1. **Redeploy your site** (Netlify will pick up new environment variables)
2. **Visit your admin panel**: `https://your-site.netlify.app/admin/`
3. **Try creating a test announcement**
4. **Check Netlify Functions logs** if there are still issues

## 🚨 Common Issues

- **"Database not configured"** → `DATABASE_URL` missing or incorrect
- **"Unauthorized"** → Admin authentication issue
- **"relation 'announcements' does not exist"** → Database table not created
- **CORS errors** → Check if your domain matches the CORS settings

## 📞 Support

If you encounter issues:
1. Check Netlify Functions logs
2. Verify all environment variables are set
3. Test database connection manually
4. Check browser console for detailed error messages
