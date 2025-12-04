# Database Setup Guide

This guide will help you set up the Supabase database for the AI Accounting Assistant.

## Prerequisites

1. A Supabase account (sign up at [supabase.com](https://supabase.com))
2. A new Supabase project created

## Setup Steps

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in project details:
   - **Name**: AI Accounting Assistant
   - **Database Password**: Choose a strong password
   - **Region**: Select closest to your users
4. Click "Create new project" and wait for it to initialize

### 2. Run Database Migration

1. Open your Supabase project
2. Navigate to the **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `migrations/001_initial_schema.sql`
5. Paste into the SQL Editor
6. Click **Run** (or press `Ctrl/Cmd + Enter`)
7. Verify success - you should see "Success. No rows returned"

### 3. Verify Tables Created

1. Go to **Table Editor** in the left sidebar
2. You should see these tables:
   - `companies`
   - `users`
   - `financial_transactions`
   - `documents`
   - `conversations`
   - `faq_content`
   - `escalations`

3. Each table should contain mock data for testing

### 4. Get API Keys

1. Go to **Project Settings** (gear icon in left sidebar)
2. Click **API** in the left menu
3. Copy the following values to your `.env` file:
   - **URL**: Copy "Project URL" → `SUPABASE_URL`
   - **anon public**: Copy "anon public" key → `SUPABASE_ANON_KEY`
   - **service_role**: Copy "service_role" key → `SUPABASE_SERVICE_ROLE_KEY`

⚠️ **IMPORTANT**: The `service_role` key should NEVER be exposed to the client. Only use it server-side.

### 5. Configure Authentication

1. Go to **Authentication** in the left sidebar
2. Click **Providers**
3. Scroll to **Phone** provider
4. Enable phone authentication
5. Configure your phone provider (Twilio, MessageBird, etc.) if using OTP
   - For this app, we're using phone as username (no OTP), so you can skip this step

### 6. Set Up Storage Buckets

For document uploads, you need to create a storage bucket:

1. Go to **Storage** in the left sidebar
2. Click **New bucket**
3. Bucket name: `documents`
4. Make it **Public** (for easy file access)
5. Click **Create bucket**

**Set Storage Policies:**
1. Click on the `documents` bucket
2. Go to **Policies** tab
3. Add the following policies:

**Upload Policy** (allows authenticated users to upload):
```sql
CREATE POLICY "Users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');
```

**Read Policy** (allows authenticated users to read):
```sql
CREATE POLICY "Users can read documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents');
```

### 7. Test Database Connection

Create a `.env` file in your project root:

```bash
cp .env.example .env
```

Add your Supabase credentials:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## Mock Data Overview

The migration includes comprehensive mock data for testing:

### Companies (4 test companies)

1. **TechStart Solutions** - Technology company
   - Phone: +14155551001
   - 2023 Revenue: $79,000
   - 2024 Revenue: $97,700 (22% growth)

2. **Green Leaf Consulting** - Consulting firm
   - Phone: +14155551002
   - 2023 Revenue: $70,100
   - 2024 Revenue: $80,600 (15% growth)

3. **Bright Future Retail** - Retail business
   - Phone: +14155551003

4. **Admin Test Company** - For testing admin features
   - Phone: +14155559999

### Users

- **Client Users**: Linked to their respective companies
- **Admin User**: Phone +14155559999 (use for testing admin features)

### Financial Transactions

- **TechStart Solutions**: 50+ transactions across 2023-2024
  - Revenue by category (Software Development, Consulting, Managed Services)
  - Expenses by category (Rent, Payroll, Marketing, Technology, etc.)

- **Green Leaf Consulting**: 30+ transactions
  - Consulting revenue across different service types
  - Operating expenses

### FAQ Content

17 pre-loaded FAQ entries covering:
- Services offered
- Pricing packages
- Tax deadlines
- Process explanations
- Document requirements
- Support and contact information

## Row Level Security (RLS)

The database is configured with strict Row Level Security:

- **Companies**: Users can only see their own company data
- **Users**: Users can only see users in their company
- **Financial Transactions**: Isolated by company_id
- **Documents**: Isolated by company_id
- **Conversations**: Users see their own, admins see all in their company
- **FAQ**: Public read access, admin-only write access
- **Escalations**: Users see their own, admins see all

## Testing Your Setup

### Using Supabase SQL Editor

Test query to see TechStart Solutions' 2024 revenue:

```sql
SELECT
  SUM(amount) as total_revenue
FROM financial_transactions
WHERE company_id = '11111111-1111-1111-1111-111111111111'
  AND fiscal_year = 2024
  AND transaction_type = 'revenue';
```

Expected result: $97,700

### Using the Application

1. Start your development server: `npm run dev`
2. Try signing in with test credentials:
   - Phone: `+14155551001` (TechStart Solutions)
   - Create a password on first sign-up
3. Ask the AI: "What was my revenue in 2024?"
4. Expected response: "$97,700"

## Maintenance

### Auto-cleanup

The database includes automatic cleanup:
- Conversations older than 30 days are automatically deleted
- Run manually: `SELECT cleanup_old_conversations();`

### Backup

Supabase provides automatic daily backups. To download:
1. Go to **Database** → **Backups**
2. Click **Download** on any backup

### Monitoring

Monitor your database:
1. Go to **Database** → **Roles**
2. View connection pooling and active connections

## Troubleshooting

### "relation does not exist" error

- Make sure you ran the migration script completely
- Check if all tables appear in Table Editor

### RLS policy blocking queries

- RLS is enabled by default for security
- Make sure you're authenticated when querying from the app
- Use service_role key for server-side admin operations

### Phone authentication not working

- Check that phone auth is enabled in Authentication → Providers
- Verify phone number format: `+1XXXXXXXXXX` (E.164 format)
- For this app, we use phone as username (password-based), not OTP

## Next Steps

Once your database is set up:

1. ✅ Database schema and mock data loaded
2. 🔄 Configure environment variables in `.env`
3. 🔄 Install dependencies: `npm install`
4. 🔄 Start development server: `npm run dev`
5. 🔄 Test authentication with mock users
6. 🔄 Test AI queries against financial data

## Support

If you encounter issues:
- Check [Supabase Docs](https://supabase.com/docs)
- Review error messages in Supabase Dashboard → **Logs**
- Verify environment variables are correctly set
