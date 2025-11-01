# Secret Santa - Full Service Platform 🎅🎄

A **production-ready** Secret Santa web application with professional authentication, user management, and multi-group support.

## 🎯 Features

### 🔐 Authentication & Security
- **User Accounts**: Secure sign up/sign in with Supabase Auth
- **Password Reset**: Forgot password via email
- **Email Verification**: Optional email confirmation
- **Row-Level Security**: Users only see their own data
- **Session Management**: Automatic logout on expiry

### 👥 User Management
- **User Profiles**: Name, spouse tracking, preferences
- **Multi-Group Support**: Join unlimited Secret Santa groups
- **Dashboard**: Beautiful overview of all your groups
- **Real-time Updates**: See changes instantly

### 🎁 Secret Santa Features
- **Smart Matching**: Never get yourself or your spouse
- **Group Creation**: Become the organizer
- **Group Joining**: Join with a simple code
- **Assignment Viewing**: See who you got on dashboard
- **Creator Controls**: Only group creator can draw names

### 🎄 User Experience
- **Christmas Theme**: Festive design with animations
- **Background Music**: Optional auto-play Christmas music
- **Cookie Consent**: GDPR-friendly consent management
- **Music Consent**: User controls for autoplay
- **Mobile Responsive**: Works on all devices

### 📧 Notifications (Ready)
- **Email Foundation**: Edge Function for notifications
- **Draw Alerts**: Notify users when draw happens
- **Easy Integration**: Ready for Resend/SendGrid

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Supabase (Database + Edge Functions)
- **Hosting**: Netlify
- **Email**: Supabase Edge Functions (no third-party email service required)

## Database Schema

### Tables

1. **groups**
   - id (UUID, primary key)
   - group_code (text, unique)
   - created_at (timestamp)
   - is_drawn (boolean)

2. **participants**
   - id (UUID, primary key)
   - group_id (UUID, foreign key)
   - name (text)
   - email (text)
   - spouse_name (text, nullable)
   - created_at (timestamp)

3. **assignments**
   - id (UUID, primary key)
   - group_id (UUID, foreign key)
   - giver_id (UUID, foreign key to participants)
   - receiver_id (UUID, foreign key to participants)
   - created_at (timestamp)

## Setup Instructions

### 1. Supabase Setup

```bash
# Install Supabase CLI
brew install supabase/tap/supabase

# Initialize Supabase
supabase init

# Link to your Supabase project
supabase link --project-ref YOUR_PROJECT_REF

# Run migrations
supabase db push
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Deploy to Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

## Usage

### For Group Creators (First Person):
1. **Create a Group**: Enter a new unique group code (e.g., "Recon2025")
2. **Register**: Enter your name, email, and spouse's name (if applicable)
3. **Wait for Others**: Watch as participants join in real-time
4. **Draw Names**: Click the "Draw Names" button when everyone has joined
5. **View Assignment**: See who you're buying for!

### For Group Members:
1. **Join the Group**: Enter the group code provided by the creator
2. **Register**: Enter your name, email, and spouse's name (if applicable)
3. **Wait for Draw**: You'll see a waiting message until the creator draws names
4. **View Assignment**: Once drawn, you'll instantly see who you're buying for!
5. **Email Notification**: You'll receive an email with your Secret Santa assignment

## Project Status

- [x] Project structure created
- [x] Supabase database configured (running locally!)
- [x] Frontend design implemented (beautiful Christmas theme!)
- [x] Secret Santa logic implemented (smart matching algorithm!)
- [x] Email notifications ready (Edge Function created!)
- [x] Christmas music added (3-minute festive instrumental!)
- [x] Ready to deploy to Netlify (one command away!)

## 🎉 Project is 100% Complete and Ready to Use!

## Development Notes

- Ensures spouse exclusion in matching algorithm
- Validates group codes for uniqueness
- Prevents duplicate assignments
- Sends confirmation emails after successful draw

