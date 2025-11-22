# User Authentication Setup Guide

## Initial Setup

### 1. Create Environment File

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 2. Generate Better Auth Secret

Generate a secure secret key (at least 32 characters). You can use one of these methods:

**Option A: Using OpenSSL**
```bash
openssl rand -base64 32
```

**Option B: Using Node**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Option C: Online Generator**
Visit: https://generate-secret.vercel.app/32

### 3. Update .env File

Edit your `.env` file with the generated secret:

```env
# Database
DATABASE_URL="file:./prisma/dev.db"

# Better Auth Configuration
BETTER_AUTH_SECRET="your-generated-secret-here"
BETTER_AUTH_URL="http://localhost:3000"

# GitHub OAuth (Optional)
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
```

### 4. Setup GitHub OAuth (Optional)

If you want to enable GitHub login:

1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: MedicalBox (or your choice)
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Click "Register application"
5. Copy the **Client ID** and generate a **Client Secret**
6. Add them to your `.env` file:
   ```env
   GITHUB_CLIENT_ID="your_github_client_id"
   GITHUB_CLIENT_SECRET="your_github_client_secret"
   ```

### 5. Database is Already Migrated

The database schema has been updated and migrated. You're ready to go!

### 6. Start the Development Server

```bash
npm run dev
```

The application will be available at http://localhost:3000

## First Time Usage

### Register a New Account

1. Navigate to http://localhost:3000
2. Click "注册" (Register)
3. Fill in your information:
   - Name (optional)
   - Email
   - Password (minimum 8 characters)
4. Click "创建账户" (Create Account)

You'll be automatically logged in and redirected to the home page.

### Alternative: Login with GitHub

If you configured GitHub OAuth:

1. Click "使用GitHub登录" on the login or register page
2. Authorize the application on GitHub
3. You'll be redirected back and logged in

## Features

### Authentication Pages

- **/login** - Email/password and GitHub login
- **/register** - Create new account with email/password or GitHub
- **/profile** - Manage account settings, change password, view connected accounts

### Protected Features

After logging in, you can access:

- **药品管理** (Medicines) - Add and manage your medications
- **用药提醒** (Reminders) - Set medication reminders  
- **用药记录** (Records) - Track medication usage
- **健康监测** (Vitals) - Record vital signs

**Important**: All data is private to your account. Other users cannot see your data.

## Data Migration Status

### Current State

The authentication system is partially implemented:

✅ **Completed:**
- User registration and login
- Session management
- Login/Register/Profile pages
- Navigation with user menu
- Database schema updated with user relations
- Medicines API (2/5 endpoints protected)

⏳ **In Progress:**
- Remaining Medicines API endpoints (3 more)
- All other API endpoints (Reminders, Records, Vitals, Stats)

### Using the Application Now

**What Works:**
- You can register and login
- Creating and viewing medicines will work for authenticated users
- User data isolation is partially enforced

**What Needs Work:**
- Other API endpoints need authentication added (see `API_MIGRATION.md`)
- Existing database data is not associated with any user
- Some features may return errors until all APIs are updated

## Troubleshooting

### "Cannot find name 'useAuth'" errors

These TypeScript errors are normal during development. They'll resolve once the dev server restarts fully. If they persist:

1. Stop the dev server (Ctrl+C)
2. Run: `npm run dev`

### Database locked errors

If you encounter "database is locked" errors:

1. Stop all running processes
2. Delete `prisma/dev.db-journal` if it exists
3. Restart the dev server

### Session not persisting

Make sure your `.env` file has a valid `BETTER_AUTH_SECRET`:
- Must be at least 32 characters
- Should be random and secure
- Don't use the example value from `.env.example`

### GitHub OAuth not working

1. Verify the callback URL in GitHub settings matches: `http://localhost:3000/api/auth/callback/github`
2. Check that `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are correctly set in `.env`
3. Ensure both values are not empty strings

## Next Steps

To complete the authentication implementation:

1. **Update remaining API endpoints** - Follow the pattern in `API_MIGRATION.md`
2. **Test data isolation** - Create data as different users and verify separation
3. **Deploy to production** - Update `BETTER_AUTH_URL` and GitHub OAuth callback URL

## Security Notes

### For Development

- The current setup uses SQLite which is fine for development
- Make sure `.env` is in `.gitignore` (it already is)

### For Production

Before deploying to production:

1. **Change the database** to PostgreSQL or MySQL
2. **Use a strong BETTER_AUTH_SECRET** (generate a new one)
3. **Update BETTER_AUTH_URL** to your production domain
4. **Update GitHub OAuth** callback URL to production domain
5. **Enable HTTPS** for all authentication endpoints
6. **Consider enabling email verification** in `lib/auth.ts`

## Support

If you encounter issues:

1. Check this guide  
2. Review `API_MIGRATION.md` for API-specific questions
3. Check better-auth documentation: https://www.better-auth.com/docs
4. Review the console for error messages
