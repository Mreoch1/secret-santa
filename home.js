(function () {
    function initHome() {
        const seoContent = document.getElementById('seo-content');
        const loader = document.querySelector('.loader');

        // Show SEO content by default for SEO and crawlers
        // Hide loader by default
        if (seoContent) {
            seoContent.style.display = 'block';
        }
        if (loader) {
            loader.style.display = 'none';
        }

        // Check if Supabase is available before trying to redirect
        if (!window.supabase || typeof window.supabase.createClient !== 'function') {
            // Supabase not loaded - keep SEO content visible for crawlers
            return;
        }

        // Check if SUPABASE_URL and SUPABASE_ANON_KEY are defined
        if (typeof SUPABASE_URL === 'undefined' || typeof SUPABASE_ANON_KEY === 'undefined') {
            // Config not loaded - keep SEO content visible
            return;
        }

        const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

        (async () => {
            try {
                const { data: { session } } = await supabaseClient.auth.getSession();

                // Only redirect logged-in users to dashboard
                // Non-logged-in users stay on homepage to see SEO content
                if (session) {
                    // Hide SEO content and show loader before redirect
                    if (seoContent) seoContent.style.display = 'none';
                    if (loader) loader.style.display = 'block';
                    // Small delay to ensure smooth transition
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 100);
                }
                // If no session, do nothing - let users see the SEO content
            } catch (error) {
                console.error('Error checking session on homepage', error);
                // On error, ensure SEO content is visible
                if (seoContent) seoContent.style.display = 'block';
                if (loader) loader.style.display = 'none';
            }
        })();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHome);
    } else {
        initHome();
    }
})();


