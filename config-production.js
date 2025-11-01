// Environment-aware configuration
// Automatically uses local or production Supabase based on hostname

const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Supabase Configuration
const SUPABASE_URL = isDevelopment 
  ? 'http://127.0.0.1:54321'  // Local Supabase
  : 'YOUR_PRODUCTION_SUPABASE_URL'; // TODO: Replace with your cloud Supabase URL from supabase.com

const SUPABASE_ANON_KEY = isDevelopment
  ? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'  // Local key
  : 'YOUR_PRODUCTION_SUPABASE_ANON_KEY'; // TODO: Replace with your cloud anon key

// Resend API Key (configured in Netlify environment variables)
const RESEND_API_KEY = 're_cfiPFoPP_DNJvMhYgMM28Edh6bxoMchdj';

// Site URL for emails
const SITE_URL = isDevelopment
  ? 'http://localhost:8000'
  : 'https://holiday-draw-names.netlify.app';

console.log('🌍 Environment:', isDevelopment ? 'Development' : 'Production');
console.log('🗄️ Supabase URL:', SUPABASE_URL);
console.log('🌐 Site URL:', SITE_URL);

