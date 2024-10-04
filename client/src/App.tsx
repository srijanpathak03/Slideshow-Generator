import React, { useState } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);

  const onDrop = (acceptedFiles: File[]) => {
    setSelectedFiles(acceptedFiles);
    const urls = acceptedFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const handleUpload = async () => {
    setLoading(true);
    const formData = new FormData();
    selectedFiles.forEach(file => formData.append('images', file));

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/upload`, formData);
      const { imageUrls } = response.data;
      await generateVideo(imageUrls);
    } catch (error) {
      toast.error('Failed to upload images');
    } finally {
      setLoading(false);
    }
  };

  const generateVideo = async (imageUrls: string[]) => {
    setProcessing(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/generate-video`, { imageUrls });
      const videoId = response.data.videoId;
      pollVideoStatus(videoId);
    } catch (error) {
      toast.error('Failed to generate video');
      setProcessing(false);
    }
  };

  const pollVideoStatus = (videoId: string) => {
    const intervalId = setInterval(async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/video-status/${videoId}`);
        if (response.data.status === 'ready') {
          setVideoUrl(response.data.url);
          clearInterval(intervalId);
          setProcessing(false);
          toast.success('Video generated successfully!');
        }
      } catch (error) {
        console.error('Error checking video status:', error);
      }
    }, 5000);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-500">
      <div className="bg-white rounded-lg shadow-xl p-10 max-w-lg w-full">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-6">Slideshow Generator</h1>
        
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-lg p-6 mb-6 transition ${isDragActive ? 'border-blue-400 bg-blue-100' : 'border-gray-300'}`}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p className="text-center text-gray-700">Drop the images here ...</p>
          ) : (
            <p className="text-center text-gray-500">Drag & drop images here, or click to select files</p>
          )}
        </div>

        <button
          onClick={handleUpload}
          disabled={selectedFiles.length === 0 || loading}
          className={`w-full py-3 rounded-lg font-semibold text-white ${loading ? 'bg-gray-500' : 'bg-blue-600 hover:bg-blue-700'} transition`}
        >
          {loading ? (
            <>
              <span className="loader"></span>
              Processing...
            </>
          ) : (
            'Generate Video'
          )}
        </button>

        {previewUrls.length > 0 && (
          <div className="mt-6">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Image Preview</h2>
            <div className="grid grid-cols-2 gap-4">
              {previewUrls.map((url, index) => (
                <img key={index} src={url} alt={`Preview ${index + 1}`} className="w-full h-32 object-cover rounded-lg shadow-md" />
              ))}
            </div>
          </div>
        )}

        {processing && <p className="mt-4 text-blue-600 text-center">Video is being processed. Please wait...</p>}

        {videoUrl && (
          <div className="mt-6">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Generated Video</h2>
            <video controls src={videoUrl} className="w-full rounded-lg shadow-md">
              Your browser does not support the video tag.
            </video>
          </div>
        )}
      </div>

      <ToastContainer />
    </div>
  );
};

export default App;
