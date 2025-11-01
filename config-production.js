// Environment-aware configuration
// Automatically uses local or production Supabase based on hostname

const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Supabase Configuration
const SUPABASE_URL = isDevelopment 
  ? 'http://127.0.0.1:54321'  // Local Supabase
  : 'YOUR_PRODUCTION_SUPABASE_URL'; // Replace with your cloud Supabase URL

const SUPABASE_ANON_KEY = isDevelopment
  ? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'  // Local key
  : 'YOUR_PRODUCTION_SUPABASE_ANON_KEY'; // Replace with your cloud anon key

// Resend API Key (same for both environments)
const RESEND_API_KEY = 're_cfiPFoPP_DNJvMhYgMM28Edh6bxoMchdj';

console.log('🌍 Environment:', isDevelopment ? 'Development' : 'Production');
console.log('🗄️ Supabase URL:', SUPABASE_URL);

