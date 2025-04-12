const CONFIG = {
    // GitHub OAuth App settings
    GITHUB_CLIENT_ID: 'Ov23liKBeH9T318eEj44', // To be filled by the user
    GITHUB_REDIRECT_URI: window.location.origin + '/callback.html',
    
    // Repository settings
    REPO_OWNER: 'GB-Server', // To be filled by the user
    REPO_NAME: 'TestBlogger', // To be filled by the user
    REPO_BRANCH: 'main',
    
    // GitHub Pages settings
    GITHUB_PAGES_URL: '', // Will be constructed based on repo settings
    
    // Local storage keys
    STORAGE_KEYS: {
        ACCESS_TOKEN: 'github_access_token',
        USER_INFO: 'github_user_info',
        DEVELOPER_TOKEN: 'developer_token',
        IS_DEVELOPER: 'is_developer'
    },
    
    // API endpoints
    API_ENDPOINTS: {
        GITHUB_API: 'https://api.github.com',
        GITHUB_AUTH: 'https://github.com/login/oauth/authorize',
        GITHUB_TOKEN: 'https://github.com/login/oauth/access_token'
    },
    
    // UI settings
    UI: {
        ITEMS_PER_PAGE: 12,
        MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
        ALLOWED_FILE_TYPES: [
            'image/jpeg',
            'image/png',
            'image/gif',
            'text/markdown',
            'text/plain',
            'text/html',
            'application/pdf'
        ]
    }
};

// Function to initialize configuration
function initializeConfig() {
    // Get the current hostname
    const hostname = window.location.hostname;
    
    // Set GitHub Pages URL
    CONFIG.GITHUB_PAGES_URL = `https://${CONFIG.REPO_OWNER}.github.io/${CONFIG.REPO_NAME}`;
    
    // Update redirect URI based on environment
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        CONFIG.GITHUB_REDIRECT_URI = 'http://localhost:8000/callback.html';
    }
    
    return CONFIG;
}

// Export the configuration
window.CONFIG = initializeConfig(); 