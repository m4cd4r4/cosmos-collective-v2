# Future Features - Cosmos Collective

This document outlines features that are planned for future implementation. The UI elements for these features have been temporarily hidden to focus on core imagery functionality.

## Authentication System

The authentication system is already configured with NextAuth.js. To re-enable it:

### 1. Uncomment UI Elements

In `src/components/layout/Header.tsx`:
- Uncomment the `<UserMenu />` component (around line 386-388)
- Uncomment the mobile user section (around line 235-272)

### 2. GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: Cosmos Collective
   - **Homepage URL**: `https://cosmos-collective-v2.vercel.app` (or your domain)
   - **Authorization callback URL**: `https://cosmos-collective-v2.vercel.app/api/auth/callback/github`
4. After creation, copy the Client ID and generate a Client Secret
5. Add to `.env.local`:
   ```
   GITHUB_ID=your-github-client-id
   GITHUB_SECRET=your-github-client-secret
   ```
6. For Vercel deployment, add these to your Vercel project environment variables

### 3. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Configure the consent screen if prompted
6. Select "Web application" as application type
7. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://cosmos-collective-v2.vercel.app/api/auth/callback/google` (production)
8. Add to `.env.local`:
   ```
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

### 4. Database Integration (Optional)

For persisting user data, contributions, and progress:

1. Set up a PostgreSQL database (Vercel Postgres, Supabase, or Railway)
2. Add the connection string to `.env.local`:
   ```
   DATABASE_URL=postgresql://user:password@host:5432/cosmos_collective
   ```
3. Install Prisma:
   ```bash
   npm install prisma @prisma/client
   npx prisma init
   ```
4. Create schema for users, contributions, and badges

## User Dashboard

Location: `src/app/dashboard/`

Features to implement:
- View personal contribution history
- Track citizen science badges and achievements
- Save favorite observations
- Personal observation notes

## Citizen Science Contribution Tracking

The citizen science features are ready but require authentication to track:
- Galaxy classification submissions
- Radio source matching
- Contribution counts and streaks
- Leaderboards

## Settings Page

Location: `src/app/settings/`

Planned settings:
- Notification preferences
- Theme customization
- Accessibility options
- Data export

## Implementation Priority

1. **Phase 1 (Current)**: Core imagery and exploration features
2. **Phase 2**: Authentication with GitHub/Google OAuth
3. **Phase 3**: Database integration for user persistence
4. **Phase 4**: Full citizen science contribution tracking
5. **Phase 5**: Dashboard and personalization features

## Related Files

- `src/app/api/auth/[...nextauth]/route.ts` - NextAuth configuration
- `src/components/layout/Header.tsx` - Sign-in UI (commented out)
- `.env.example` - Environment variable template
- `next-auth.d.ts` - TypeScript type definitions for auth

## Notes

- The NextAuth.js configuration is already in place and functional
- NEXTAUTH_SECRET is already configured in production
- All auth routes are working, just the UI is hidden
- Re-enabling requires only uncommenting the Header UI elements and adding OAuth credentials
