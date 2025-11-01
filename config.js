// Supabase Configuration
// Environment-aware configuration

const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const SUPABASE_URL = isDevelopment 
  ? 'http://127.0.0.1:54321'  // Local development
  : 'https://ywyxkvoxsnzhyslrantd.supabase.co'; // Production Supabase

const SUPABASE_ANON_KEY = isDevelopment
  ? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'  // Local key
  : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3eXhrdm94c256aHlzbHJhbnRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwMzAxNjksImV4cCI6MjA3NzYwNjE2OX0.es2p6Xzjfm_LicDWbDhUEyI0QpBE45M8FrUQsaxO8js'; // Production key

// Resend API Key - DO NOT COMMIT TO PUBLIC REPOS
// Use Netlify environment variables in production
const RESEND_API_KEY = 're_cfiPFoPP_DNJvMhYgMM28Edh6bxoMchdj';

// Site URL
const SITE_URL = isDevelopment
  ? 'http://localhost:8000'
  : 'https://holidaydrawnames.com';

// Supabase client is loaded via CDN in index.html
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

