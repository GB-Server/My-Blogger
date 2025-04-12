# My Blogger

A GitHub Pages-hosted blog platform that allows you to create and manage blog posts using GitHub repositories. This application provides a user-friendly interface for creating, managing, and viewing blog posts while leveraging GitHub's infrastructure for storage and hosting.

## Features

- GitHub OAuth authentication
- Create and manage blog posts as GitHub repository folders
- Drag-and-drop file uploads
- Developer access control
- Responsive design
- GitHub Pages integration

## Setup Instructions

1. Create a new GitHub repository for your blog
2. Enable GitHub Pages in your repository settings
3. Create a GitHub OAuth App:
   - Go to GitHub Settings > Developer Settings > OAuth Apps > New OAuth App
   - Set the following:
     - Application name: My Blogger
     - Homepage URL: `https://<your-username>.github.io/<repo-name>`
     - Authorization callback URL: `https://<your-username>.github.io/<repo-name>/callback.html`

4. Create a `.github/developers.json` file in your repository with the following content:
   ```json
   ["username1", "username2"]
   ```
   Replace `username1`, `username2` with the GitHub usernames that should have developer access.

5. Update the `config.js` file with your settings:
   ```javascript
   const CONFIG = {
       GITHUB_CLIENT_ID: 'your-client-id',
       REPO_OWNER: 'your-github-username',
       REPO_NAME: 'your-repo-name',
       // ... other settings remain unchanged
   };
   ```

6. Push all files to your repository:
   ```
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

## Usage

1. Visit your GitHub Pages URL: `https://<your-username>.github.io/<repo-name>`
2. Click "Login with GitHub" to authenticate
3. If you have developer access:
   - Enter your GitHub access token when prompted
   - Create new blog posts using the "Create New Blog" button
   - Upload files using drag-and-drop or file selection
   - Delete blog posts as needed
4. Regular users can:
   - View all blog posts
   - Navigate through blog content
   - Read and interact with blog posts

## Security Considerations

- Store sensitive information (like access tokens) in GitHub Secrets
- Regularly rotate access tokens
- Limit developer access to trusted users only
- Use HTTPS for all communications

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is licensed under the MIT License - see the LICENSE file for details. 