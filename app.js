class App {
    constructor() {
        this.initialize();
    }

    initialize() {
        this.setupEventListeners();
        this.refreshBlogList();
    }

    setupEventListeners() {
        const createFolderBtn = document.getElementById('createFolderBtn');
        createFolderBtn.addEventListener('click', () => this.showCreateFolderModal());
    }

    async refreshBlogList() {
        try {
            const blogs = await githubAPI.listBlogs();
            this.renderBlogList(blogs);
        } catch (error) {
            console.error('Error refreshing blog list:', error);
            this.showError('Failed to load blogs');
        }
    }

    renderBlogList(blogs) {
        const blogGrid = document.getElementById('blogGrid');
        blogGrid.innerHTML = '';

        blogs.forEach(blog => {
            const blogCard = this.createBlogCard(blog);
            blogGrid.appendChild(blogCard);
        });
    }

    createBlogCard(blog) {
        const card = document.createElement('div');
        card.className = 'blog-card';
        
        const title = document.createElement('h3');
        title.textContent = blog.name;
        
        const link = document.createElement('a');
        link.href = blog.url;
        link.className = 'btn';
        link.textContent = 'View Blog';
        
        card.appendChild(title);
        card.appendChild(link);

        // Add developer controls if user is a developer
        if (window.authHandler.isDeveloper) {
            const controls = document.createElement('div');
            controls.className = 'blog-controls';
            
            const uploadBtn = document.createElement('button');
            uploadBtn.className = 'btn';
            uploadBtn.textContent = 'Upload Files';
            uploadBtn.addEventListener('click', () => {
                fileManager.setCurrentFolder(blog.name);
                document.getElementById('uploadModal').classList.remove('hidden');
            });
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn btn-danger';
            deleteBtn.textContent = 'Delete';
            deleteBtn.addEventListener('click', () => this.deleteBlog(blog));
            
            controls.appendChild(uploadBtn);
            controls.appendChild(deleteBtn);
            card.appendChild(controls);
        }

        return card;
    }

    showCreateFolderModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Create New Blog</h2>
                <input type="text" id="folderName" placeholder="Enter blog name">
                <button id="createFolder" class="btn">Create</button>
                <button id="cancelCreate" class="btn">Cancel</button>
            </div>
        `;

        document.body.appendChild(modal);

        const createBtn = modal.querySelector('#createFolder');
        const cancelBtn = modal.querySelector('#cancelCreate');
        const folderInput = modal.querySelector('#folderName');

        createBtn.addEventListener('click', async () => {
            const folderName = folderInput.value.trim();
            if (folderName) {
                try {
                    await githubAPI.createBlog(folderName);
                    this.refreshBlogList();
                    modal.remove();
                    this.showSuccess('Blog created successfully');
                } catch (error) {
                    this.showError('Failed to create blog');
                }
            } else {
                this.showError('Please enter a blog name');
            }
        });

        cancelBtn.addEventListener('click', () => {
            modal.remove();
        });

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    async deleteBlog(blog) {
        if (confirm(`Are you sure you want to delete "${blog.name}"?`)) {
            try {
                await githubAPI.deleteBlog(blog.name);
                this.refreshBlogList();
                this.showSuccess('Blog deleted successfully');
            } catch (error) {
                this.showError('Failed to delete blog');
            }
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

// Initialize app
window.app = new App(); 