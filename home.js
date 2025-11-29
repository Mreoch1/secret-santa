(function () {
    function initHome() {
        const seoContent = document.getElementById('seo-content');
        const loader = document.querySelector('.loader');

        if (seoContent && loader) {
            seoContent.style.display = 'none';
            loader.style.display = 'block';
        }

        if (!window.supabase || typeof window.supabase.createClient !== 'function') {
            console.error('Supabase not loaded on homepage');
            if (seoContent && loader) {
                loader.style.display = 'block';
            }
            return;
        }

        const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

        (async () => {
            try {
                const { data: { session } } = await supabaseClient.auth.getSession();

                if (session) {
                    window.location.href = 'dashboard.html';
                } else {
                    window.location.href = 'auth.html';
                }
            } catch (error) {
                console.error('Error checking session on homepage', error);
                if (seoContent && loader) {
                    loader.style.display = 'none';
                    seoContent.style.display = 'block';
                }
            }
        })();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHome);
    } else {
        initHome();
    }
})();


