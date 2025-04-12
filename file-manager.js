class FileManager {
    constructor() {
        this.currentFolder = null;
        this.initialize();
    }

    initialize() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        const dropZone = document.getElementById('dropZone');
        const fileInput = document.getElementById('fileInput');
        const uploadFilesBtn = document.getElementById('uploadFilesBtn');
        const closeUploadModal = document.getElementById('closeUploadModal');
        const uploadModal = document.getElementById('uploadModal');

        // Drag and drop events
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('dragover');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            const files = Array.from(e.dataTransfer.files);
            this.handleFiles(files);
        });

        // File input change
        fileInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            this.handleFiles(files);
        });

        // Upload button click
        uploadFilesBtn.addEventListener('click', () => {
            if (this.currentFolder) {
                uploadModal.classList.remove('hidden');
            } else {
                this.showError('Please select a folder first');
            }
        });

        // Close modal
        closeUploadModal.addEventListener('click', () => {
            uploadModal.classList.add('hidden');
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === uploadModal) {
                uploadModal.classList.add('hidden');
            }
        });
    }

    async handleFiles(files) {
        if (!this.currentFolder) {
            this.showError('Please select a folder first');
            return;
        }

        const validFiles = this.validateFiles(files);
        if (validFiles.length === 0) {
            this.showError('No valid files to upload');
            return;
        }

        try {
            this.showProgress();
            await githubAPI.uploadFiles(this.currentFolder, validFiles);
            this.hideProgress();
            this.showSuccess('Files uploaded successfully');
            this.closeUploadModal();
            // Refresh the blog list
            window.app.refreshBlogList();
        } catch (error) {
            this.hideProgress();
            this.showError('Failed to upload files');
        }
    }

    validateFiles(files) {
        return files.filter(file => {
            const isValidType = CONFIG.UI.ALLOWED_FILE_TYPES.includes(file.type);
            const isValidSize = file.size <= CONFIG.UI.MAX_FILE_SIZE;

            if (!isValidType) {
                this.showError(`File type not allowed: ${file.name}`);
            }
            if (!isValidSize) {
                this.showError(`File too large: ${file.name}`);
            }

            return isValidType && isValidSize;
        });
    }

    setCurrentFolder(folderName) {
        this.currentFolder = folderName;
    }

    showProgress() {
        const progress = document.getElementById('uploadProgress');
        progress.classList.remove('hidden');
    }

    hideProgress() {
        const progress = document.getElementById('uploadProgress');
        progress.classList.add('hidden');
    }

    closeUploadModal() {
        const modal = document.getElementById('uploadModal');
        modal.classList.add('hidden');
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

// Initialize file manager
window.fileManager = new FileManager(); 