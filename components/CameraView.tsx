import React, { useRef, useEffect, useState } from 'react';
import { CameraIcon } from './Icons';

interface CameraViewProps {
  onCapture: (imageData: string) => void;
}

const CameraView: React.FC<CameraViewProps> = ({ onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment', // Prefer rear camera
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera access denied or failed", err);
        setError("Unable to access camera. Please check permissions.");
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas to match video dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw the current video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to base64
        const imageData = canvas.toDataURL('image/jpeg', 0.9);
        onCapture(imageData);
      }
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-gray-900">
        <p className="text-red-400 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-white text-black rounded-lg font-medium"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full bg-black">
      {/* Hidden Canvas for Capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Video Feed */}
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted 
        className="h-full w-full object-cover"
      />

      {/* Grid Overlay / Hint */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="border border-white/30 w-64 h-64 rounded-xl relative">
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white"></div>
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white"></div>
          <p className="absolute -top-10 w-full text-center text-white/80 font-medium text-sm bg-black/40 py-1 rounded-full">
            Place product here
          </p>
        </div>
      </div>

      {/* Capture Controls */}
      <div className="absolute bottom-0 left-0 w-full p-8 pb-12 flex justify-center items-center bg-gradient-to-t from-black/80 to-transparent">
        <button 
          onClick={handleCapture}
          className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-white/20 active:bg-white/50 transition-all duration-150 transform active:scale-95"
          aria-label="Capture Photo"
        >
          <div className="w-16 h-16 bg-white rounded-full"></div>
        </button>
      </div>
    </div>
  );
};

export default CameraView;
