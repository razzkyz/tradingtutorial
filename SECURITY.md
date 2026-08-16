# Security Documentation

This document outlines the security measures implemented in the Trading Tutorials application.

## Authentication & Authorization

### Supabase Auth
- **Authentication Provider**: Supabase Auth handles all authentication flows
- **Session Management**: Automatic token refresh and validation
- **Password Storage**: Passwords hashed by Supabase (never stored in plaintext)
- **JWT Tokens**: Secure JWT tokens for session management

### Session Flow
```
User Login
  ↓
Supabase Auth validates credentials
  ↓
JWT token issued
  ↓
Token stored in localStorage by Supabase client
  ↓
Auto-refresh before expiration
  ↓
Session validated on each protected route
```

## Row Level Security (RLS)

### Enabled on All Tables
- profiles
- balances
- trading_access
- withdrawals

### Policy Structure
All policies follow the pattern:
```sql
auth.uid() = user_id
```

This ensures users can only access their own data.

### User Isolation
- User A cannot read User B's data
- User A cannot modify User B's data
- User A cannot delete User B's data

## IDOR Protection

### Insecure Direct Object Reference Prevention

**❌ Vulnerable Pattern:**
```typescript
// BAD: Trusting user_id from request
const { user_id } = request.body
const profile = await getProfile(user_id)
```

**✅ Secure Pattern:**
```typescript
// GOOD: Using authenticated user_id
const { user } = useAuth()
const profile = await getProfile(user.id) // From auth session
```

### Database Queries
All queries are automatically filtered by RLS:
```sql
-- User tries to access another user's data
SELECT * FROM profiles WHERE user_id = 'other-user-id';
-- RLS automatically adds: AND auth.uid() = user_id
-- Result: No rows returned (access denied)
```

## Input Validation

### Client-Side Validation (UX)
Using Zod schemas:
```typescript
const withdrawalSchema = z.object({
  amount: z.number().positive().min(1),
  wallet_address: z.string().min(10).max(100),
  network: z.string().min(1).max(50),
})
```

### Server-Side Validation
- RLS policies enforce authorization
- Database constraints enforce data integrity
- CHECK constraints on amounts and status values

### SQL Injection Prevention
- Supabase client uses parameterized queries
- No raw SQL from user input
- TypeScript types prevent invalid data

## Balance & Trading Status Security

### Server-Controlled Data
Users have **read-only** access to:
- Balance amounts
- Trading status

### No Client-Side Manipulation
```typescript
// ❌ This would fail - no UPDATE policy for users
await supabase
  .from('balances')
  .update({ amount: 999999 })
  .eq('user_id', user.id)
// Result: RLS denies - no matching policy
```

### Admin-Only Updates
Balance and trading status changes require:
1. Service role key (never in frontend)
2. Backend/admin function
3. Proper authorization checks

## Withdrawal Security

### Validation Flow
```
1. Client validates input (Zod)
2. Submit to Supabase
3. RLS checks auth.uid() = user_id
4. Database validates constraints
5. Withdrawal created with status='pending'
```

### Critical Security Rules
1. **User ID from session**: Never trust user_id from request
2. **Balance check**: Client-side only for UX (real check should be server-side)
3. **No direct execution**: Withdrawals create requests, not transactions
4. **Status controlled**: Users cannot change withdrawal status

### Withdrawal Request Process
```
User submits withdrawal
  ↓
INSERT into withdrawals (status='pending')
  ↓
Admin reviews request
  ↓
Admin updates status (via backend/admin panel)
  ↓
If approved, process via external system
```

## Secret Management

### Frontend Environment Variables
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGc...
```

**✅ Safe to expose:**
- Supabase URL
- Anon/publishable key

**❌ NEVER expose:**
- Service role key
- Database password
- Private keys
- API secrets

### Service Role Key
```typescript
// ❌ NEVER DO THIS
const VITE_SUPABASE_SERVICE_KEY = "service_role_key_here"

// ✅ Service role key should only be in:
// - Backend server
// - Serverless functions
// - Admin tools
// - Never in git, never in frontend
```

## XSS Protection

### React Built-in Protection
React escapes all values by default:
```tsx
// Safe - React escapes automatically
<p>{userInput}</p>
```

### Avoiding Dangerous Patterns
```tsx
// ❌ NEVER USE
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ USE INSTEAD
<div>{userInput}</div>
```

## Error Handling

### Safe Error Messages
```typescript
// ❌ BAD: Exposes internal details
catch (error) {
  setError(error.message) // Might expose SQL errors, stack traces
}

// ✅ GOOD: Generic message
catch (error) {
  console.error('Internal error:', error) // Log for debugging
  setError('Invalid email or password.') // Safe user message
}
```

### What NOT to Expose
- SQL error messages
- Stack traces
- Database schema details
- Internal API structure
- User existence (timing attacks)

## HTTPS & Transport Security

### Production Requirements
- ✅ HTTPS only (enforced by Vercel)
- ✅ Secure cookies (handled by Supabase)
- ✅ CORS properly configured
- ✅ No mixed content warnings

## Content Security

### No User-Generated HTML
- All user content rendered as text
- No markdown parsing of user input
- No iframe embedding of user URLs

## Rate Limiting

### Supabase Built-in Protection
- API rate limits per project
- Auth rate limits (login attempts)
- Database connection pooling

### Recommended Additional Measures
For production, consider:
- Rate limiting on withdrawal requests
- Captcha on login form
- IP-based throttling

## Access Control Matrix

| Resource | User (Read) | User (Write) | Admin (Read) | Admin (Write) |
|----------|-------------|--------------|--------------|---------------|
| Own Profile | ✅ | ✅ | ✅ | ✅ |
| Other Profiles | ❌ | ❌ | ✅ | ✅ |
| Own Balances | ✅ | ❌ | ✅ | ✅ |
| Other Balances | ❌ | ❌ | ✅ | ✅ |
| Own Trading Status | ✅ | ❌ | ✅ | ✅ |
| Own Withdrawals | ✅ | INSERT only | ✅ | ✅ |
| Withdrawal Status | ✅ (read) | ❌ | ✅ | ✅ |

## Testing Security

### Manual Security Tests

#### 1. Test User Isolation
```typescript
// Try to access another user's data
const response = await supabase
  .from('profiles')
  .select('*')
  .eq('user_id', 'OTHER_USER_ID')

// Expected: Empty array (RLS blocks access)
```

#### 2. Test Balance Manipulation
```typescript
// Try to update own balance
const response = await supabase
  .from('balances')
  .update({ amount: 999999 })
  .eq('user_id', currentUser.id)

// Expected: Error (no UPDATE policy for users)
```

#### 3. Test IDOR
```
GET /profile?user_id=other-user-uuid
Expected: See only own profile or error
```

#### 4. Test Withdrawal Validation
```typescript
// Try to submit withdrawal with invalid data
const result = await createWithdrawal(userId, {
  amount: -100, // Invalid
  wallet_address: '',
  network: ''
})

// Expected: Validation error
```

## Security Checklist

- [x] Authentication via Supabase Auth
- [x] Session management with auto-refresh
- [x] RLS enabled on all tables
- [x] User isolation via auth.uid()
- [x] IDOR protection
- [x] Input validation (Zod)
- [x] No service role key in frontend
- [x] No hardcoded secrets
- [x] Safe error messages
- [x] No XSS vulnerabilities
- [x] Protected routes
- [x] Balance server-controlled
- [x] Trading status server-controlled
- [x] Withdrawal validation
- [x] HTTPS enforced
- [x] .env in .gitignore

## Reporting Security Issues

If you discover a security vulnerability:
1. **DO NOT** create a public GitHub issue
2. Email: security@example.com
3. Include detailed description and reproduction steps
4. Allow time for fix before public disclosure

## Future Security Enhancements

### Recommended for Production

1. **Two-Factor Authentication (2FA)**
   - Add via Supabase Auth
   - Require for withdrawals

2. **Email Verification**
   - Require verified email
   - Send confirmation emails

3. **Withdrawal Limits**
   - Daily withdrawal limits
   - Require additional verification for large amounts

4. **Audit Logging**
   - Log all withdrawal requests
   - Log failed login attempts
   - Monitor suspicious activity

5. **IP Whitelisting**
   - Optional IP restrictions
   - Geolocation checks

6. **Device Fingerprinting**
   - Detect suspicious devices
   - Alert on new device login

## Compliance Considerations

### Data Privacy
- User data stored in Supabase (EU/US regions available)
- Users can request data deletion
- No unnecessary data collection

### Financial Regulations
- **Note**: This is a demo app
- Real money handling requires:
  - KYC (Know Your Customer)
  - AML (Anti-Money Laundering)
  - Regulatory compliance
  - Licensed payment processors

## Conclusion

This application implements industry-standard security practices suitable for a demo/MVP. For production deployment with real funds, additional security measures, compliance checks, and third-party audits are required.
