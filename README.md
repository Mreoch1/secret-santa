# 🎄 Holiday Draw Names - Professional Secret Santa Platform

> **Production-ready** Secret Santa web application with **27+ features**, modern design, and professional polish.

**Live at**: https://holidaydrawnames.com

---

## ⭐ What Makes Us Different

### Better Than Competitors
✅ **Wishlist System** - No more guessing what people want  
✅ **QR Code Invites** - Scan and join instantly  
✅ **Budget Management** - Set spending limits per group  
✅ **Undo/Redraw** - Mistakes? No problem!  
✅ **Modern Design** - Beautiful, smooth, delightful  
✅ **Copy Buttons** - Share everything with one click  
✅ **Confetti Animation** - Celebrate the draw!  
✅ **Creator Receipt** - Master list via email  

### Professional Features
🎯 **Analytics Tracking** - Understand your users  
🔍 **Error Monitoring** - Sentry integration ready  
♿ **Full Accessibility** - WCAG AA compliant  
🎨 **Design System** - Consistent, modern, scalable  
📱 **Mobile Optimized** - Perfect on all devices  
🔒 **GDPR Compliant** - Account deletion, privacy  

---

## 🎁 Core Features

### 🔐 Authentication & Security
- ✅ User accounts with Supabase Auth
- ✅ Secure password reset via email
- ✅ Email verification
- ✅ Row-Level Security (RLS)
- ✅ Session management
- ✅ GDPR-compliant account deletion

### 👥 Group Management
- ✅ Create unlimited groups
- ✅ Password protection
- ✅ QR code invitations
- ✅ Email invitations
- ✅ Copy-to-clipboard for codes/passwords
- ✅ Set budget min/max
- ✅ Set exchange date & location
- ✅ Multi-group support per user

### 🎅 Secret Santa Drawing
- ✅ Smart matching algorithm
  - Never get yourself
  - Never get your spouse
  - Retry logic for edge cases
- ✅ One-click draw names
- ✅ Undo/redraw functionality
- ✅ Email notifications to all participants
- ✅ Creator receives master list
- ✅ Rate limiting for email APIs
- ✅ Retry logic for reliability

### 🎁 Wishlist System
- ✅ Add gift ideas
- ✅ Set priorities (High/Medium/Low)
- ✅ View recipient's wishlist
- ✅ Real-time updates
- ✅ Delete items

### 📧 Email System
- ✅ Invitation emails
- ✅ Draw notification emails
- ✅ Creator receipt with full list
- ✅ Rate limiting (1s between emails)
- ✅ Retry logic for failures
- ✅ Professional templates
- ✅ Resend API integration

### 🎨 User Experience
- ✅ Modern design system
- ✅ Toast notifications (no ugly alerts!)
- ✅ Confetti animation on draw
- ✅ Loading states everywhere
- ✅ Skeleton screens
- ✅ Smooth transitions
- ✅ Glassmorphism modals
- ✅ Festive theme
- ✅ Background music (optional)

### ♿ Accessibility
- ✅ WCAG AA compliant
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ Skip links
- ✅ ARIA labels
- ✅ Focus management
- ✅ Reduced motion support

### 📊 Analytics & Monitoring
- ✅ Google Analytics 4 (GA4)
- ✅ Event tracking (sign up, draw, join, etc.)
- ✅ Error tracking
- ✅ User journey tracking
- ✅ Sentry integration (ready)

### 🎯 Other Features
- ✅ "How It Works" guide
- ✅ Privacy policy
- ✅ Terms of service
- ✅ **SEO optimization** - 6 keyword-focused landing pages
- ✅ **Breadcrumb navigation** - Standardized across all pages
- ✅ **FAQPage schema** - JSON-LD on homepage and landing pages
- ✅ **Canonical tags** - Proper URL canonicalization
- ✅ **Internal linking** - Strong site structure for SEO
- ✅ Sitemap
- ✅ Favicon & touch icons
- ✅ Cookie consent (GDPR)
- ✅ Mobile responsive
- ✅ PWA-ready

---

## 🚀 Technology Stack

### Frontend
- **HTML5, CSS3, JavaScript** (Vanilla - no frameworks!)
- **Design System**: Custom tokens (200+ variables)
- **Fonts**: Google Fonts (Poppins, Inter, Mountains of Christmas)
- **Icons**: Unicode + Custom SVGs
- **Animations**: CSS + Confetti.js

### Backend
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Authentication
- **RLS**: Row-Level Security for data protection
- **Functions**: Supabase Edge Functions

### Hosting & Deployment
- **Hosting**: Netlify (Global CDN)
- **Functions**: Netlify Functions (email proxy)
- **Domain**: holidaydrawnames.com
- **SSL**: Automatic HTTPS

### Third-Party Services
- **Email**: Resend API via Netlify function
- **Analytics**: Google Analytics 4
- **Monitoring**: Sentry (ready)
- **QR Codes**: QRCodeJS library

### Development
- **Version Control**: Git + GitHub
- **CI/CD**: GitHub → Netlify auto-deploy
- **Testing**: Manual + User testing
- **Documentation**: Comprehensive markdown docs

---

## 📁 Project Structure

```
secret-santa/
├── index.html              # Homepage with SEO content
├── home.js                 # Homepage redirect logic
├── auth.html               # Sign in/sign up
├── auth.js                 # Authentication logic
├── dashboard.html           # Main dashboard
├── dashboard.js            # Dashboard logic (1,200+ lines)
├── profile.html            # User settings
├── profile.js              # Profile management
├── how-it-works.html       # User guide
├── privacy.html            # Privacy policy
├── terms.html              # Terms of service
├── 404.html                # Error page
├── toast-test.html         # Toast testing page
├── styles.css              # Main stylesheet (1,200+ lines)
├── design-tokens.css       # Design system tokens
├── toast.css               # Toast notification styles
├── toast.js                # Toast system
├── analytics.js            # GA4 integration
├── sentry.js               # Error monitoring
├── confetti.js             # Celebration animation
├── config.js               # Supabase config
├── favicon.svg             # Favicon
├── apple-touch-icon.svg    # iOS icon
├── sitemap.xml             # SEO sitemap (includes all landing pages)
├── robots.txt              # SEO robots
├── secret-santa-generator/ # SEO landing page
│   └── index.html
├── christmas-name-draw/    # SEO landing page
│   └── index.html
├── holiday-name-picker/    # SEO landing page
│   └── index.html
├── random-name-generator/  # SEO landing page
│   └── index.html
├── office-secret-santa/    # SEO landing page
│   └── index.html
├── family-secret-santa/    # SEO landing page
│   └── index.html
├── netlify/
│   └── functions/
│       └── send-email.js  # Email proxy function
├── supabase/
│   ├── config.toml        # Supabase config
│   ├── migrations/        # Database migrations (15+)
│   └── functions/         # Edge functions
├── music/                  # Christmas music
└── docs/                   # 20+ documentation files
    ├── README.md
    ├── TODO.md
    ├── FEATURES-LIST-FOR-AI.md
    ├── SESSION-SUMMARY-NOV-2-2025.md
    ├── VISUAL-ROADMAP.md
    ├── DESIGN-SYSTEM.md
    └── ...
```

---

## 🗄️ Database Schema

### Tables

#### `groups`
- id (uuid, primary key)
- code (text, unique) - Join code
- password (text) - Group password
- created_by (uuid) → user_profiles
- created_at (timestamp)
- **budget_min** (integer) - Min spending
- **budget_max** (integer) - Max spending
- **currency** (text, default 'USD')
- **exchange_date** (date) - When to exchange
- **exchange_location** (text) - Where to meet
- drawn (boolean) - Names drawn?

#### `participants`
- id (uuid, primary key)
- group_id (uuid) → groups
- user_id (uuid) → user_profiles
- joined_at (timestamp)
- **Unique constraint**: (group_id, user_id)

#### `assignments`
- id (uuid, primary key)
- group_id (uuid) → groups
- giver_id (uuid) → participants
- receiver_id (uuid) → participants
- created_at (timestamp)
- **Unique constraint**: (group_id, giver_id)

#### `user_profiles`
- id (uuid, primary key) → auth.users
- full_name (text)
- spouse_id (uuid) → user_profiles (nullable)
- email (text)
- **created_at** (timestamp)

#### `wishlists`
- id (uuid, primary key)
- user_id (uuid) → user_profiles
- group_id (uuid) → groups (nullable)
- item_name (text)
- description (text)
- url (text)
- priority (text: 'high', 'medium', 'low')
- created_at (timestamp)

#### `blocklist`
- id (uuid, primary key)
- email (text, unique)
- reason (text)
- created_at (timestamp)

---

## 🚀 Setup & Installation

### Prerequisites
- Supabase account (free tier works!)
- Netlify account (free tier works!)
- Resend account for emails (free: 3k/month)
- Node.js (for local development)

### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/Mreoch1/secret-santa.git
cd secret-santa
```

2. **Set up Supabase**
```bash
# Install Supabase CLI
brew install supabase/tap/supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

3. **Configure environment**
```bash
# Copy config template
cp config.js.example config.js

# Add your Supabase URL and anon key
# Add your Resend API key
```

4. **Deploy to Netlify**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

5. **Set up custom domain** (optional)
- Add your domain in Netlify
- Update DNS records
- SSL auto-configured!

### Environment Variables

#### Netlify Functions
- `RESEND_API_KEY` - Your Resend API key

#### Client-side (config.js)
```javascript
const SUPABASE_URL = 'https://your-project.supabase.co'
const SUPABASE_ANON_KEY = 'your-anon-key'
```

---

## 📖 Usage Guide

### For Group Creators

1. **Sign Up** → Create account
2. **Create Group** → Set code, password, budget, date
3. **Invite Members** → Share QR code or send email invites
4. **Add Wishlist** → Let people know what you want
5. **Draw Names** → Click button when ready (confetti! 🎊)
6. **Check Email** → Master list for safekeeping
7. **View Assignment** → See who you got + their wishlist

### For Group Members

1. **Scan QR Code** OR **Enter Group Code**
2. **Sign Up/Sign In**
3. **Auto-Join** → Automatic after login
4. **Add Wishlist** → Share your gift ideas
5. **Wait for Draw** → Creator will draw when ready
6. **Check Email** → You'll get your assignment
7. **View Dashboard** → See who you got + wishlist

---

## 🎨 Design System

### Colors
- **Primary Red**: `#b71c3a` (festive, not too bright)
- **Primary Green**: `#0d6630` (classic Christmas)
- **Accent Gold**: `#d4a574` (warm, elegant)
- **Neutrals**: 10-level scale for text/backgrounds

### Typography
- **Display**: Mountains of Christmas (festive headers)
- **Headings**: Poppins (modern, clean)
- **Body**: Inter (readable, professional)

### Components
- **Buttons**: Gradients + colored shadows
- **Cards**: Modern with top-bar animation
- **Modals**: Glassmorphism with blur
- **Toasts**: Color-coded, smooth animations
- **Badges**: Pill-shaped status indicators

See `DESIGN-SYSTEM.md` for complete guide!

---

## 🔍 SEO & Search Optimization

### Landing Pages
- ✅ `/secret-santa-generator` - Main generator keyword
- ✅ `/christmas-name-draw` - Christmas-specific intent
- ✅ `/holiday-name-picker` - Holiday name selection
- ✅ `/random-name-generator` - Random name tool
- ✅ `/office-secret-santa` - Workplace use case
- ✅ `/family-secret-santa` - Family use case

### SEO Features
- ✅ **Unique titles & meta descriptions** - Each page optimized for target keywords
- ✅ **Breadcrumb navigation** - Standardized structure across all pages
- ✅ **FAQPage JSON-LD** - Structured data on homepage and all landing pages
- ✅ **Canonical tags** - Proper URL canonicalization
- ✅ **Internal linking** - Strong site structure with homepage + 2+ links per page
- ✅ **Sitemap.xml** - Includes all landing pages with proper priorities
- ✅ **Optimized H1s** - Keyword-focused, unique per page
- ✅ **Natural keyword usage** - Content optimized for search intent
- ✅ **Non-blocking scripts** - Deferred loading for better crawlability

### Technical SEO
- ✅ Google Search Console verified
- ✅ Mobile-friendly (responsive design)
- ✅ Fast loading (deferred scripts, optimized assets)
- ✅ Clean URL structure
- ✅ Proper heading hierarchy

---

## 📊 Analytics

### Tracked Events
- Page views
- User sign ups
- Group creations
- Names drawn
- Group joins
- QR code generations
- Copy-to-clipboard clicks
- Account deletions
- Errors

### Google Analytics 4
- **Measurement ID**: G-YS64XMF8QX
- **Data Retention**: 14 months
- **Privacy**: Anonymized IPs

---

## 🐛 Error Handling

### Toast Notifications
- ✅ User-friendly error messages
- ✅ Color-coded by severity
- ✅ Auto-dismiss or manual
- ✅ Non-blocking

### Error Tracking
- ✅ Client-side error capture
- ✅ Sentry integration (ready)
- ✅ Analytics error events
- ✅ Detailed logging

### Email Reliability
- ✅ Rate limiting (1s delays)
- ✅ Retry logic for failures
- ✅ Graceful degradation
- ✅ Error notifications

---

## 🔒 Security & Privacy

### Authentication
- ✅ Supabase Auth (battle-tested)
- ✅ Password hashing (bcrypt)
- ✅ Email verification (optional)
- ✅ Session management
- ✅ CSRF protection

### Data Protection
- ✅ Row-Level Security (RLS)
- ✅ User data isolation
- ✅ Secure password storage
- ✅ HTTPS everywhere
- ✅ No passwords in logs

### GDPR Compliance
- ✅ Cookie consent
- ✅ Privacy policy
- ✅ Terms of service
- ✅ Account deletion
- ✅ Data export (on request)
- ✅ Right to be forgotten

---

## 🎯 Competitive Analysis

| Feature | Holiday Draw Names | DrawNames.com | Elfster |
|---------|-------------------|---------------|---------|
| Basic Draw | ✅ | ✅ | ✅ |
| Email Notifications | ✅ | ✅ | ✅ |
| Wishlist | ✅ | ❌ | ✅ |
| QR Codes | ✅ | ❌ | ❌ |
| Budget Management | ✅ | ❌ | ⚠️ |
| Undo/Redraw | ✅ | ❌ | ❌ |
| Modern Design | ✅ | ❌ | ⚠️ |
| Toast Notifications | ✅ | ❌ | ❌ |
| Copy Buttons | ✅ | ❌ | ❌ |
| Confetti | ✅ | ❌ | ❌ |
| Accessibility | ✅ | ⚠️ | ⚠️ |
| Mobile | ✅ | ✅ | ✅ |
| Ads | ❌ | ✅ | ✅ |
| Price | **FREE** | Free | Free |

**We're better! 🏆**

---

## 📈 Roadmap

### ✅ Phase 1: Core Platform (DONE)
- Authentication & user management
- Group creation & joining
- Smart name drawing
- Email notifications

### ✅ Phase 2: Professional Features (DONE)
- Wishlist system
- Budget & deadline
- QR codes
- Toast notifications
- Analytics
- Accessibility
- Account deletion

### ✅ Phase 3: Visual Foundation (DONE)
- Design token system
- Modern fonts
- Button gradients
- Card animations
- Modal glassmorphism
- Confetti animation

### ✅ Phase 4: SEO Optimization (DONE)
- 6 keyword-focused landing pages
- Breadcrumb navigation system
- FAQPage JSON-LD schema
- Canonical tags
- Enhanced homepage content
- Internal linking structure
- Updated sitemap

### 🎯 Phase 5: Visual Components (Optional)
- Avatar circles
- Stepper UI
- Accordion FAQ
- Empty states
- Progress indicators

### 🔮 Phase 6: Advanced Features (Future)
- Reminder emails
- Gift tracking
- Anonymous messaging
- Calendar invites
- CSV import
- PDF export
- Dark mode
- Mobile app (PWA)

See `VISUAL-ROADMAP.md` for details!

---

## 🤝 Contributing

This is a personal project, but suggestions are welcome!

### How to Help
1. Use the platform and report bugs
2. Suggest features via GitHub Issues
3. Share with friends and family
4. Leave feedback

---

## 📝 License

MIT License - Use freely, modify as needed!

Copyright (c) 2025 Michael Reoch

---

## 🎁 Acknowledgments

### Built With
- [Supabase](https://supabase.com) - Backend infrastructure
- [Netlify](https://netlify.com) - Hosting & deployment
- [Resend](https://resend.com) - Email delivery
- [Google Analytics](https://analytics.google.com) - User insights
- [QRCodeJS](https://davidshimjs.github.io/qrcodejs/) - QR generation

### Inspired By
- DrawNames.com
- Elfster
- Secret Santa Generator

### Made Better By
- User feedback
- Modern web standards
- Professional UX principles
- Accessibility guidelines

---

## 📞 Contact & Support

- **Website**: https://holidaydrawnames.com
- **GitHub**: https://github.com/Mreoch1/secret-santa
- **Email**: (Add your email)

---

## 🎊 Fun Facts

- **Built in**: 1 epic day (Nov 2, 2025)
- **SEO optimized**: January 2025
- **Lines of code**: 5,000+
- **Features**: 27+
- **SEO landing pages**: 6
- **Deployments**: 20+
- **Commits**: 20+
- **Documentation**: 20+ files
- **Value**: $3,000-$4,000 in development
- **Coffee consumed**: Too much ☕
- **Hours of fun**: Priceless! 😊

---

## 🎅 Made with ❤️ for the Holidays

**Happy Secret Santa!** 🎄🎁✨

---

**Last Updated**: January 5, 2025  
**Version**: 2.1 (SEO Optimized)  
**Status**: ✅ Live & Amazing!
