class GitHubAPI {
    constructor() {
        this.octokit = null;
        this.initialize();
    }

    initialize() {
        const storedToken = localStorage.getItem(CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
        if (storedToken) {
            this.octokit = new Octokit({ auth: storedToken });
        }
    }

    async listBlogs() {
        try {
            const { data } = await this.octokit.repos.getContent({
                owner: CONFIG.REPO_OWNER,
                repo: CONFIG.REPO_NAME,
                path: '',
                ref: CONFIG.REPO_BRANCH
            });

            return data
                .filter(item => item.type === 'dir')
                .map(dir => ({
                    name: dir.name,
                    path: dir.path,
                    url: `${CONFIG.GITHUB_PAGES_URL}/${dir.path}`,
                    sha: dir.sha
                }));
        } catch (error) {
            console.error('Error listing blogs:', error);
            throw new Error('Failed to fetch blog list');
        }
    }

    async createBlog(folderName) {
        try {
            // Create a new folder with an index.html file
            const indexContent = this.generateIndexHtml(folderName);
            
            await this.octokit.repos.createOrUpdateFileContents({
                owner: CONFIG.REPO_OWNER,
                repo: CONFIG.REPO_NAME,
                path: `${folderName}/index.html`,
                message: `Create blog: ${folderName}`,
                content: btoa(indexContent),
                branch: CONFIG.REPO_BRANCH
            });

            return {
                name: folderName,
                path: folderName,
                url: `${CONFIG.GITHUB_PAGES_URL}/${folderName}`
            };
        } catch (error) {
            console.error('Error creating blog:', error);
            throw new Error('Failed to create blog');
        }
    }

    async uploadFiles(folderPath, files) {
        try {
            const uploadPromises = files.map(async (file) => {
                const filePath = `${folderPath}/${file.name}`;
                const content = await this.readFileAsBase64(file);
                
                return this.octokit.repos.createOrUpdateFileContents({
                    owner: CONFIG.REPO_OWNER,
                    repo: CONFIG.REPO_NAME,
                    path: filePath,
                    message: `Upload file: ${file.name}`,
                    content: content,
                    branch: CONFIG.REPO_BRANCH
                });
            });

            await Promise.all(uploadPromises);
            return true;
        } catch (error) {
            console.error('Error uploading files:', error);
            throw new Error('Failed to upload files');
        }
    }

    async deleteBlog(folderName) {
        try {
            // Get all files in the folder
            const { data: files } = await this.octokit.repos.getContent({
                owner: CONFIG.REPO_OWNER,
                repo: CONFIG.REPO_NAME,
                path: folderName,
                ref: CONFIG.REPO_BRANCH
            });

            // Delete each file
            const deletePromises = files.map(file => 
                this.octokit.repos.deleteFile({
                    owner: CONFIG.REPO_OWNER,
                    repo: CONFIG.REPO_NAME,
                    path: file.path,
                    message: `Delete blog: ${folderName}`,
                    sha: file.sha,
                    branch: CONFIG.REPO_BRANCH
                })
            );

            await Promise.all(deletePromises);
            return true;
        } catch (error) {
            console.error('Error deleting blog:', error);
            throw new Error('Failed to delete blog');
        }
    }

    generateIndexHtml(folderName) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${folderName} - My Blogger</title>
    <link rel="stylesheet" href="../styles.css">
</head>
<body>
    <div class="blog-container">
        <header class="blog-header">
            <h1>${folderName}</h1>
            <a href="../" class="btn">Back to Home</a>
        </header>
        <main class="blog-content">
            <!-- Blog content will be loaded here -->
        </main>
    </div>
    <script src="../app.js"></script>
</body>
</html>`;
    }

    readFileAsBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64String = reader.result
                    .toString()
                    .split(',')[1];
                resolve(base64String);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    async getFileContent(path) {
        try {
            const { data } = await this.octokit.repos.getContent({
                owner: CONFIG.REPO_OWNER,
                repo: CONFIG.REPO_NAME,
                path: path,
                ref: CONFIG.REPO_BRANCH
            });

            return atob(data.content);
        } catch (error) {
            console.error('Error getting file content:', error);
            throw new Error('Failed to get file content');
        }
    }
}

// Initialize GitHub API handler
window.githubAPI = new GitHubAPI(); 