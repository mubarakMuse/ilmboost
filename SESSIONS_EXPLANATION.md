# When to Use user_sessions Table

## Current System: Custom PIN-based Auth

**You NEED `user_sessions`** because you're using custom authentication (not Supabase Auth).

### When user_sessions is Used:

1. **On Login** ✅
   - User logs in with email + PIN
   - API creates a new session in `user_sessions` table
   - Returns `sessionId` to client
   - Session expires in 4 hours

2. **On Every Request** ✅
   - Client sends `sessionId` with API requests
   - API verifies session exists and hasn't expired
   - If valid → allow request
   - If expired → reject request

3. **On Logout** ✅
   - Client calls logout API
   - API deletes session from `user_sessions` table

4. **Session Validation** ✅
   - `hasActiveSession()` checks if session exists and is valid
   - `getUser()` fetches user data using sessionId

### How It Works:

```
Login Flow:
1. User enters email + PIN
2. API verifies PIN → creates session in user_sessions
3. Returns sessionId to client
4. Client stores sessionId in sessionStorage
5. Client uses sessionId for all API calls

Request Flow:
1. Client sends request with sessionId
2. API checks user_sessions table:
   - Does session exist?
   - Is it expired? (expires_at > now)
3. If valid → get user_id → proceed
4. If invalid → return 401 Unauthorized
```

## When You DON'T Need user_sessions

### If Using Supabase Auth:
- ❌ Don't need `user_sessions` table
- ✅ Supabase handles sessions automatically
- ✅ Sessions stored in cookies by Supabase
- ✅ Use `supabase.auth.getSession()` instead

### If Using JWT Tokens:
- ❌ Don't need `user_sessions` table
- ✅ JWT contains session info
- ✅ Verify JWT signature instead

## Your Current Implementation

Since you're using **Email + PIN (custom auth)**:

✅ **You NEED `user_sessions`** because:
- No Supabase Auth (so no built-in sessions)
- No JWT tokens
- Need to track who's logged in
- Need session expiry (4 hours)
- Need to validate requests

### Database Structure:
```
user_sessions
├── id (UUID) - sessionId returned to client
├── user_id (references profiles.id)
├── email (for quick lookup)
├── expires_at (4 hours from creation)
└── created_at
```

### API Usage:
- `/api/auth/login` → Creates session
- `/api/auth/user` → Validates session
- `/api/auth/logout` → Deletes session
- `/api/courses/*` → Validates session before proceeding

## Summary

**Use `user_sessions` when:**
- ✅ Custom authentication (not Supabase Auth)
- ✅ Need to track active sessions
- ✅ Need session expiry
- ✅ Need to validate requests server-side

**Don't use `user_sessions` when:**
- ❌ Using Supabase Auth (has built-in sessions)
- ❌ Using JWT tokens (token is the session)
- ❌ Stateless authentication

Your current system **requires** `user_sessions` because you're using custom PIN-based auth!

