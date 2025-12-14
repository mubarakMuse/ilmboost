# When to Use auth.users vs Custom Auth

## Current System: Custom PIN-based Auth (Email + PIN)

**You are NOT using `auth.users`** - this is correct for your PIN-based system.

### How it works:
1. **Signup**: User provides email + PIN → Stored in `profiles` table
2. **Login**: User provides email + PIN → Verified against `profiles` table
3. **Session**: Custom session created in `user_sessions` table
4. **No Supabase Auth**: We bypass `auth.users` entirely

### Database Structure:
```
profiles (custom table)
├── id (UUID, primary key)
├── email
├── pin (hashed)
├── secret_answer (hashed)
└── ... other fields

user_sessions (custom table)
├── id
├── user_id (references profiles.id)
├── expires_at
└── ...
```

## When to Use auth.users (Supabase Auth)

Use `auth.users` **ONLY** if you want:
- ✅ Email/password authentication
- ✅ Email verification
- ✅ Password reset via email
- ✅ OAuth (Google, GitHub, etc.)
- ✅ Magic links
- ✅ Built-in security features

### If using auth.users:
```sql
-- Profile references auth.users
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  ...
);
```

## Your Current Setup ✅

Since you're using **Email + PIN** (custom auth):
- ✅ **DON'T** use `auth.users`
- ✅ Use custom `profiles` table (no foreign key to auth.users)
- ✅ Use custom `user_sessions` table
- ✅ Handle all auth logic in API routes
- ✅ Use service role key for database access

## Security Note

Your current setup uses:
- Service role key in API routes (server-side only)
- SHA-256 hashing for PINs (consider bcrypt for production)
- Session validation in API routes
- RLS policies allow service role (security in API layer)

This is fine for custom PIN-based auth!

