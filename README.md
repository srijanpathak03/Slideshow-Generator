# Slideshow Application

## Overview
The Slideshow Application is a full-stack project that enables users to upload images, create a slideshow, and generate a video from those images. This application uses React for the frontend and Node.js with Express for the backend, leveraging Cloudinary for image storage and video generation.

![Slideshow Preview](assets/images/slideshow.png)

## Deployment
- **Frontend**: https://slideshow-generator-two.vercel.app/
- **Backend**: https://slideshow-generator-backend.onrender.com

## Features
- **Image Upload**: Users can upload multiple images easily.
- **Image Preview**: Uploaded images are displayed as a slideshow before video generation.
- **Video Generation**: Convert uploaded images into a video with playback controls.

## Technologies Used
- **Frontend**: React, Axios, React Dropzone, Tailwind CSS
- **Backend**: Node.js, Express.js, Cloudinary
- **Database**: Cloudinary for storage

## Running the Application Locally

### Prerequisites
- Node.js (v14 or later)
- npm
- Cloudinary account (for API credentials)

### Backend Setup
1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/Slideshow-Generator.git
   cd slideshow-generator/server
   npm install
  bash```
  
3. **Set up environment variables: Create a .env file in the backend directory**:
   ```bash
    CLOUDINARY_CLOUD_NAME=your_cloud_name
    CLOUDINARY_API_KEY=your_api_key
    CLOUDINARY_API_SECRET=your_api_secret
    PORT=3000
  bash```
  
4. **Start the server**:
    ```bash
      npm start
  bash```
  
### Frontend Setup

5. **Navigate to the frontend directory**:
    ```bash
    cd ../client
    npm install
  bash```
  
6. **Start the React application**:
    ```bash
    npm start
  bash```
