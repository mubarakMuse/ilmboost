# Supabase Migration Guide

This guide will help you migrate from localStorage to Supabase for persistent data storage.

## Step 1: Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and anon key from Settings > API
3. Get your service role key from Settings > API (keep this secret!)

## Step 2: Set Environment Variables

Add these to your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Step 3: Run Database Schema

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase-schema.sql`
4. Run the SQL script

This will create:
- `profiles` table (user data)
- `user_sessions` table (session management)
- `course_enrollments` table (course enrollments)
- `course_progress` table (learning progress)
- Row Level Security (RLS) policies

## Step 4: Update Your Code

⚠️ **Important**: Many auth functions are now `async` and need to be awaited:

### Before (localStorage):
```javascript
const user = getUser();
const isEnrolled = isEnrolled(courseId);
```

### After (Supabase):
```javascript
const user = await getUser();
const isEnrolled = await isEnrolled(courseId);
```

## Functions That Are Now Async

- `getUser()` → `await getUser()`
- `hasActiveSession()` → `await hasActiveSession()`
- `getUserMembership()` → `await getUserMembership()`
- `hasPaidMembership()` → `await hasPaidMembership()`
- `canAccessCourse()` → `await canAccessCourse()`
- `getEnrollments()` → `await getEnrollments()`
- `isEnrolled()` → `await isEnrolled()`
- `getProgress()` → `await getProgress()`
- `getCourseProgress()` → `await getCourseProgress()`
- `getCourseProgressPercentage()` → `await getCourseProgressPercentage()`

## Functions That Remain Async (unchanged)

- `login()` - already async
- `signup()` - already async
- `logout()` - already async
- `enrollInCourse()` - already async
- `unenrollFromCourse()` - already async
- `markSectionComplete()` - already async
- `markSectionIncomplete()` - already async

## Migration Notes

1. **Session Management**: Sessions are now stored in Supabase with 4-hour expiry
2. **Data Persistence**: All user data, enrollments, and progress are now in Supabase
3. **Security**: PINs and secret answers are hashed using SHA-256 (consider upgrading to bcrypt for production)
4. **Performance**: User data is cached in sessionStorage for faster access

## Next Steps

1. Update all components that use auth functions to handle async/await
2. Test the migration thoroughly
3. Consider migrating existing localStorage data (if any) to Supabase
4. Update Stripe webhook to update membership in Supabase

## TODO: Implement These API Routes

- `/api/auth/reset-pin` - Reset PIN using secret question
- `/api/auth/update-membership` - Update membership tier
- `/api/auth/update-profile` - Update user profile
- `/api/auth/update-pin` - Update PIN (requires current PIN)

