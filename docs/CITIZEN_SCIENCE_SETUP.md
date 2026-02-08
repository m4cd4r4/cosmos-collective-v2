# Citizen Science Setup Guide

This guide walks you through setting up the full Zooniverse integration with user accounts and persistent progress tracking.

## Prerequisites

- PostgreSQL database (local or hosted)
- Node.js 18+ and npm
- Zooniverse account with app credentials

---

## 1. Database Setup

### Install PostgreSQL (if not already installed)

**Windows:**
```bash
# Download from https://www.postgresql.org/download/windows/
# Or use Docker:
docker run --name cosmos-postgres -e POSTGRES_PASSWORD=your_password -p 5432:5432 -d postgres:15
```

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Linux:**
```bash
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE cosmos_collective;

# Create user (optional)
CREATE USER cosmos_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE cosmos_collective TO cosmos_user;

# Exit
\q
```

### Update .env.local

Create or update `C:\Scratch\cosmos-collective-v2\.env.local`:

```env
# Database
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/cosmos_collective"

# Or with custom user:
# DATABASE_URL="postgresql://cosmos_user:your_secure_password@localhost:5432/cosmos_collective"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<generate with: openssl rand -base64 32>"

# Existing OAuth providers (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_ID="your-github-id"
GITHUB_SECRET="your-github-secret"

# NASA API
NEXT_PUBLIC_NASA_API_KEY="your-nasa-api-key-from-api.nasa.gov"
```

---

## 2. Zooniverse OAuth Setup

### Register Your Application

1. Go to [Zooniverse OAuth Applications](https://www.zooniverse.org/settings/applications)
2. Click "Register a new application"
3. Fill in details:
   - **Name:** Cosmos Collective
   - **Redirect URI:** `http://localhost:3000/api/auth/callback/zooniverse`
   - **Scopes:** Select `public`, `classification`, `user`
4. Click "Register Application"
5. Copy your **Client ID** and **Client Secret**

### Add Zooniverse Credentials to .env.local

```env
# Zooniverse OAuth
ZOONIVERSE_CLIENT_ID="your-client-id-from-zooniverse"
ZOONIVERSE_CLIENT_SECRET="your-client-secret-from-zooniverse"
ZOONIVERSE_REDIRECT_URI="http://localhost:3000/api/auth/callback/zooniverse"
```

---

## 3. Initialize Database Schema

Run Prisma migrations to create all tables:

```bash
cd C:\Scratch\cosmos-collective-v2

# Generate Prisma client
npx prisma generate

# Run migrations (creates tables)
npx prisma db push

# Optional: Open Prisma Studio to view database
npx prisma studio
```

This creates all tables:
- NextAuth tables: `Account`, `Session`, `User`, `VerificationToken`
- Citizen Science tables: `Classification`, `UserStats`, `Badge`, `BadgeAward`, `ActivityLog`, `UserFavoriteProject`, `ZooniverseProject`

---

## 4. Seed Initial Badges

Create starter badges:

```bash
# Run the seed script
npx prisma db seed
```

Or manually insert badges via Prisma Studio or SQL:

```sql
INSERT INTO "Badge" ("id", "name", "description", "icon", "rarity", "requirementType", "requirementValue", "createdAt")
VALUES
  ('first-classification', 'First Steps', 'Complete your first classification', 'star', 'common', 'classification_count', 1, NOW()),
  ('ten-classifications', 'Getting Started', 'Complete 10 classifications', 'rocket', 'common', 'classification_count', 10, NOW()),
  ('fifty-classifications', 'Contributor', 'Complete 50 classifications', 'trophy', 'uncommon', 'classification_count', 50, NOW()),
  ('hundred-classifications', 'Dedicated', 'Complete 100 classifications', 'award', 'uncommon', 'classification_count', 100, NOW()),
  ('five-hundred', 'Expert', 'Complete 500 classifications', 'shield', 'rare', 'classification_count', 500, NOW()),
  ('thousand', 'Master', 'Complete 1000 classifications', 'crown', 'epic', 'classification_count', 1000, NOW()),
  ('five-projects', 'Explorer', 'Contribute to 5 different projects', 'compass', 'uncommon', 'project_count', 5, NOW()),
  ('week-streak', 'Consistent', 'Maintain a 7-day streak', 'flame', 'uncommon', 'streak', 7, NOW()),
  ('month-streak', 'Dedicated', 'Maintain a 30-day streak', 'calendar', 'rare', 'streak', 30, NOW());
```

---

## 5. Start Development Server

```bash
npm run dev
```

Navigate to `http://localhost:3000` and test:

1. **Sign in** with Zooniverse (or Google/GitHub)
2. Go to **Citizen Science** page
3. Click **Classify** on a project
4. Submit a classification
5. Check **Dashboard** to see stats update
6. View **Leaderboard** to see rankings

---

## 6. Verify Integration

### Test Classification Flow

1. Sign in with Zooniverse account
2. Navigate to `/citizen-science`
3. Click "Classify" on any project
4. Answer the classification task
5. Click "Submit"
6. Check database:

```bash
npx prisma studio
# Navigate to Classification table
# Verify classification was stored
# Check UserStats table for updated counts
```

### Test Leaderboard

1. Navigate to `/citizen-science/leaderboard`
2. Verify you appear in rankings
3. Check that stats match your dashboard

### Test Badges

1. Complete required classifications for a badge
2. Check ActivityLog for `badge_earned` events
3. View badges in `/dashboard`

---

## 7. Production Deployment

### Update Environment Variables

For production (Vercel, Railway, etc.):

```env
# Production Database (example: Railway PostgreSQL)
DATABASE_URL="postgresql://user:pass@hostname:5432/dbname"

# Production URL
NEXTAUTH_URL="https://your-domain.com"

# Zooniverse Production Callback
ZOONIVERSE_REDIRECT_URI="https://your-domain.com/api/auth/callback/zooniverse"
```

### Update Zooniverse OAuth Settings

1. Go to [Zooniverse OAuth Applications](https://www.zooniverse.org/settings/applications)
2. Edit your application
3. Add production redirect URI: `https://your-domain.com/api/auth/callback/zooniverse`
4. Save changes

### Run Migrations

```bash
# Production migration
npx prisma migrate deploy
```

---

## 8. Troubleshooting

### "Prisma Client not found"

```bash
npx prisma generate
```

### "Database connection failed"

- Verify DATABASE_URL is correct
- Check PostgreSQL is running: `pg_isready`
- Test connection: `psql $DATABASE_URL`

### "Zooniverse OAuth error"

- Verify credentials in `.env.local`
- Check redirect URI matches exactly
- Ensure scopes include `public`, `classification`, `user`

### "Classification not submitting to Zooniverse"

- Check user has linked Zooniverse account
- Verify access token is valid
- Check network tab for API errors
- Classifications still save locally even if Zooniverse submission fails

### "Leaderboard empty"

- Verify at least one user has classifications
- Check UserStats table exists and has data
- Run: `SELECT * FROM "UserStats" ORDER BY "classificationsCount" DESC LIMIT 10;`

---

## 9. Optional: Cron Jobs for Data Sync

Set up periodic sync with Zooniverse API:

### Sync Project Metadata (Daily)

```typescript
// src/scripts/sync-projects.ts
import { prisma } from '@/lib/prisma'
import { createZooniverseClient } from '@/services/zooniverse-client'

async function syncProjects() {
  const client = createZooniverseClient()
  const projects = await client.getFeaturedProjects()

  for (const project of projects) {
    await prisma.zooniverseProject.upsert({
      where: { id: project.id },
      update: {
        displayName: project.displayName,
        description: project.description,
        classificationsCount: project.classification_count,
        subjectsCount: project.subjects_count,
        completeness: project.completeness,
        lastFetchedAt: new Date(),
      },
      create: {
        id: project.id,
        slug: project.slug,
        displayName: project.displayName,
        description: project.description,
        classificationsCount: project.classification_count,
        subjectsCount: project.subjects_count,
        completeness: project.completeness,
      },
    })
  }
}
```

---

## 10. Monitoring

### Check Classification Rate

```sql
SELECT
  DATE(created_at) as date,
  COUNT(*) as classifications
FROM "Classification"
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### Check Active Users

```sql
SELECT
  COUNT(DISTINCT user_id) as active_users
FROM "Classification"
WHERE created_at >= NOW() - INTERVAL '7 days';
```

### Check Zooniverse Submission Success Rate

```sql
SELECT
  submitted_to_zooniverse,
  COUNT(*) as count
FROM "Classification"
GROUP BY submitted_to_zooniverse;
```

---

## Support

For issues with:
- **Zooniverse API**: https://www.zooniverse.org/talk/18
- **Cosmos Collective**: [GitHub Issues](https://github.com/m4cd4r4/cosmos-collective-v2/issues)
- **Prisma**: https://www.prisma.io/docs
- **NextAuth.js**: https://next-auth.js.org/getting-started/introduction
