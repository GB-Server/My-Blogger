class AuthHandler {
    constructor() {
        this.octokit = null;
        this.userInfo = null;
        this.isDeveloper = false;
        this.initialize();
    }

    initialize() {
        // Check for existing session
        const storedToken = localStorage.getItem(CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
        const storedUserInfo = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_INFO);
        const storedDeveloperToken = localStorage.getItem(CONFIG.STORAGE_KEYS.DEVELOPER_TOKEN);
        const storedIsDeveloper = localStorage.getItem(CONFIG.STORAGE_KEYS.IS_DEVELOPER);

        if (storedToken && storedUserInfo) {
            this.octokit = new Octokit({ auth: storedToken });
            this.userInfo = JSON.parse(storedUserInfo);
            this.isDeveloper = storedIsDeveloper === 'true';
            this.updateUI();
        }

        this.setupEventListeners();
    }

    setupEventListeners() {
        const loginBtn = document.getElementById('loginBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const verifyTokenBtn = document.getElementById('verifyToken');
        const closeModalBtn = document.getElementById('closeModal');
        const tokenModal = document.getElementById('tokenModal');

        loginBtn.addEventListener('click', () => this.login());
        logoutBtn.addEventListener('click', () => this.logout());
        verifyTokenBtn.addEventListener('click', () => this.verifyDeveloperToken());
        closeModalBtn.addEventListener('click', () => this.hideTokenModal());

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === tokenModal) {
                this.hideTokenModal();
            }
        });
    }

    login() {
        const scope = 'repo user';
        const authUrl = `${CONFIG.API_ENDPOINTS.GITHUB_AUTH}?client_id=${CONFIG.GITHUB_CLIENT_ID}&redirect_uri=${CONFIG.GITHUB_REDIRECT_URI}&scope=${scope}`;
        window.location.href = authUrl;
    }

    async handleCallback(code) {
        try {
            const response = await fetch(CONFIG.API_ENDPOINTS.GITHUB_TOKEN, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    client_id: CONFIG.GITHUB_CLIENT_ID,
                    code: code,
                }),
            });

            const data = await response.json();
            if (data.access_token) {
                this.octokit = new Octokit({ auth: data.access_token });
                await this.fetchUserInfo();
                localStorage.setItem(CONFIG.STORAGE_KEYS.ACCESS_TOKEN, data.access_token);
                this.showTokenModal();
            }
        } catch (error) {
            console.error('Authentication error:', error);
            this.showError('Authentication failed. Please try again.');
        }
    }

    async fetchUserInfo() {
        try {
            const { data } = await this.octokit.users.getAuthenticated();
            this.userInfo = data;
            localStorage.setItem(CONFIG.STORAGE_KEYS.USER_INFO, JSON.stringify(data));
            this.updateUI();
        } catch (error) {
            console.error('Error fetching user info:', error);
            this.showError('Failed to fetch user information.');
        }
    }

    async verifyDeveloperToken() {
        const tokenInput = document.getElementById('accessToken');
        const token = tokenInput.value.trim();

        if (!token) {
            this.showError('Please enter a token');
            return;
        }

        try {
            // Verify token by making a test API call
            const testOctokit = new Octokit({ auth: token });
            const { data: user } = await testOctokit.users.getAuthenticated();

            // Check if user is in the allowed developers list
            const isAllowed = await this.checkDeveloperAccess(user.login);
            
            if (isAllowed) {
                localStorage.setItem(CONFIG.STORAGE_KEYS.DEVELOPER_TOKEN, token);
                localStorage.setItem(CONFIG.STORAGE_KEYS.IS_DEVELOPER, 'true');
                this.isDeveloper = true;
                this.hideTokenModal();
                this.updateUI();
                this.showSuccess('Developer access granted!');
            } else {
                this.showError('Access denied. You are not authorized as a developer.');
            }
        } catch (error) {
            console.error('Token verification error:', error);
            this.showError('Invalid token. Please try again.');
        }
    }

    async checkDeveloperAccess(username) {
        try {
            // This should be replaced with your actual method of checking developer access
            // For example, checking against a list in GitHub Secrets or a specific file in the repo
            const { data } = await this.octokit.repos.getContent({
                owner: CONFIG.REPO_OWNER,
                repo: CONFIG.REPO_NAME,
                path: '.github/developers.json'
            });

            const developers = JSON.parse(atob(data.content));
            return developers.includes(username);
        } catch (error) {
            console.error('Error checking developer access:', error);
            return false;
        }
    }

    logout() {
        localStorage.removeItem(CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_INFO);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.DEVELOPER_TOKEN);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.IS_DEVELOPER);
        
        this.octokit = null;
        this.userInfo = null;
        this.isDeveloper = false;
        
        this.updateUI();
        window.location.reload();
    }

    showTokenModal() {
        const modal = document.getElementById('tokenModal');
        modal.classList.remove('hidden');
    }

    hideTokenModal() {
        const modal = document.getElementById('tokenModal');
        modal.classList.add('hidden');
    }

    updateUI() {
        const loginBtn = document.getElementById('loginBtn');
        const userInfo = document.getElementById('userInfo');
        const userAvatar = document.getElementById('userAvatar');
        const userName = document.getElementById('userName');
        const developerControls = document.getElementById('developerControls');

        if (this.userInfo) {
            loginBtn.classList.add('hidden');
            userInfo.classList.remove('hidden');
            userAvatar.src = this.userInfo.avatar_url;
            userName.textContent = this.userInfo.login;
            
            if (this.isDeveloper) {
                developerControls.classList.remove('hidden');
            } else {
                developerControls.classList.add('hidden');
            }
        } else {
            loginBtn.classList.remove('hidden');
            userInfo.classList.add('hidden');
            developerControls.classList.add('hidden');
        }
    }

    showError(message) {
        // Implement error message display
        console.error(message);
    }

    showSuccess(message) {
        // Implement success message display
        console.log(message);
    }
}

// Initialize auth handler
window.authHandler = new AuthHandler(); 