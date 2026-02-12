# FileQRkaro

A web application that allows users to upload files and folders, then generates QR codes for easy downloading.

## Features

- Upload single files or entire folders
- Automatic QR code generation for downloads
- Files stored securely on Cloudinary
- QR codes expire after 24 hours
- Contact form support

## Hugging Face Spaces Deployment

This application can be deployed on Hugging Face Spaces using Docker.

### Steps to Deploy on Hugging Face Spaces

1. **Create a new Space:**
   - Go to [huggingface.co/spaces](https://huggingface.co/spaces)
   - Click "Create new Space"
   - Choose a name for your Space
   - Select **"Docker"** as the Space SDK
   - Choose visibility (Public or Private)
   - Click "Create Space"

2. **Configure Secrets (Environment Variables):**
   In your Space settings, add these secrets:
   - `MONGO_URI` - Your MongoDB connection string
   - `CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
   - `CLOUDINARY_API_KEY` - Your Cloudinary API key
   - `CLOUDINARY_API_SECRET` - Your Cloudinary API secret
   - `BASE_URL` - Your Hugging Face Space URL (e.g., `https://your-username-fileqrkaro.hf.space`)

3. **Upload Files:**
   Upload all the files from this repository to your Space, or connect your GitHub repository to the Space.

4. **Wait for Build:**
   Hugging Face will automatically build and deploy your Docker container.

### Required Services

Before deploying, you need to set up:

1. **MongoDB Atlas (Free Tier):**
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free cluster
   - Get your connection string

2. **Cloudinary (Free Tier):**
   - Go to [cloudinary.com](https://cloudinary.com)
   - Sign up for a free account
   - Get your cloud name, API key, and API secret from the dashboard

## Local Development

1. Clone the repository
2. Create a `.env` file in the `backend` folder with your credentials:
   ```
   MONGO_URI=your_mongodb_connection_string
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   BASE_URL=http://localhost:10000
   ```
3. Install dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```
4. Run the application:
   ```bash
   cd backend
   python server.py
   ```
5. Open http://localhost:10000 in your browser


