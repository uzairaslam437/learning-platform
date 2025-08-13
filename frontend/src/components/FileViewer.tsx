import React, { useState, useRef, useEffect } from 'react';
import { X, Play, Pause, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';
import type { CourseMaterial } from '../types/course';
import './FileViewer.css';

interface FileViewerProps {
  material: CourseMaterial;
  isOpen: boolean;
  onClose: () => void;
}

export const FileViewer: React.FC<FileViewerProps> = ({ material, isOpen, onClose }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const getFileType = (fileType: string) => {
    if (fileType.startsWith('video/')) return 'video';
    if (fileType.startsWith('image/')) return 'image';
    if (fileType.includes('pdf')) return 'pdf';
    if (fileType.includes('document') || fileType.includes('word') || fileType.includes('text') || 
        fileType.includes('msword') || fileType.includes('vnd.openxmlformats-officedocument.wordprocessingml')) return 'document';
    if (fileType.includes('spreadsheet') || fileType.includes('excel') || fileType.includes('vnd.ms-excel') ||
        fileType.includes('vnd.openxmlformats-officedocument.spreadsheetml')) return 'spreadsheet';
    if (fileType.includes('presentation') || fileType.includes('powerpoint') || fileType.includes('vnd.ms-powerpoint') ||
        fileType.includes('vnd.openxmlformats-officedocument.presentationml')) return 'presentation';
    return 'other';
  };

  const fileType = getFileType(material.file_type);

  // Reset states when opening
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(false);
      setIsLoading(true);
      setHasError(false);
      setBlobUrl(null);
      setLoadingProgress(0);
      
      // Start loading the file
      loadFileAsBlob();
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, material.download_url]);

  // Cleanup blob URL
  useEffect(() => {
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [blobUrl]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
      if (event.key === ' ' && fileType === 'video') {
        event.preventDefault();
        togglePlay();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, fileType]);

  const loadFileAsBlob = async () => {
    if (!material.download_url) {
      setHasError(true);
      setIsLoading(false);
      return;
    }

    try {
      console.log(`Loading ${fileType} as blob from:`, material.download_url);
      setIsLoading(true);
      setHasError(false);
      
      // Use fetch with proper headers
      const response = await fetch(material.download_url, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Accept': fileType === 'video' ? 'video/*' : 
                   fileType === 'image' ? 'image/*' :
                   fileType === 'pdf' ? 'application/pdf' : '*/*',
        },
      });

      console.log('Fetch response status:', response.status);
      console.log('Fetch response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get content length for progress tracking
      const contentLength = response.headers.get('Content-Length');
      const totalSize = contentLength ? parseInt(contentLength, 10) : 0;

      if (!response.body) {
        throw new Error('Response body is null');
      }

      // Read the response as a stream to track progress
      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let receivedLength = 0;

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        chunks.push(value);
        receivedLength += value.length;
        
        if (totalSize > 0) {
          const progress = (receivedLength / totalSize) * 100;
          setLoadingProgress(progress);
        }
      }

      // Combine chunks into a single Uint8Array
      const fullData = new Uint8Array(receivedLength);
      let position = 0;
      for (const chunk of chunks) {
        fullData.set(chunk, position);
        position += chunk.length;
      }

      // Create blob with proper MIME type
      const blob = new Blob([fullData], { type: material.file_type });
      console.log('Blob created, size:', blob.size, 'type:', blob.type);

      const url = URL.createObjectURL(blob);
      console.log('Blob URL created:', url);

      setBlobUrl(url);
      setIsLoading(false);
      setLoadingProgress(100);
    } catch (error) {
      console.error(`Error loading ${fileType} as blob:`, error);
      setHasError(true);
      setIsLoading(false);
      setLoadingProgress(0);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const target = e.target as HTMLVideoElement;
    console.error('Video error:', e);
    console.error('Video error details:', target.error);
    setHasError(true);
  };

  const handleClose = () => {
    setIsLoading(false);
    setHasError(false);
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
      setBlobUrl(null);
    }
    onClose();
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600 mb-2">Loading {fileType}...</p>
            {loadingProgress > 0 && (
              <div className="w-64 bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${loadingProgress}%` }}
                ></div>
              </div>
            )}
            <p className="text-sm text-gray-500">
              {loadingProgress > 0 ? `${Math.round(loadingProgress)}%` : 'Please wait...'}
            </p>
          </div>
        </div>
      );
    }

    if (hasError) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-6xl text-red-400 mb-4">❌</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {material.original_filename}
            </h3>
            <p className="text-gray-500 mb-4">
              {fileType.charAt(0).toUpperCase() + fileType.slice(1)} could not be loaded. The signed URL may have expired.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setHasError(false);
                  setIsLoading(true);
                  loadFileAsBlob();
                }}
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
              >
                Retry Loading
              </button>
              <a
                href={material.download_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm"
              >
                Open in New Tab
              </a>
            </div>
          </div>
        </div>
      );
    }

    if (!blobUrl) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-6xl text-gray-400 mb-4">📁</div>
            <p className="text-gray-500">No content available</p>
          </div>
        </div>
      );
    }

    switch (fileType) {
      case 'video':
        return (
          <div className="relative h-full">
            <video
              ref={videoRef}
              className="w-full h-full object-contain"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
              onError={handleVideoError}
              controls={false}
              preload="metadata"
              playsInline
              src={blobUrl}
            />
            
            {/* Video Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={togglePlay}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </button>
                
                <div className="flex-1">
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer file-viewer-slider"
                  />
                </div>
                
                <span className="text-sm min-w-[80px] text-center">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
                
                <button
                  onClick={toggleMute}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </button>
                
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-2 rounded-lg appearance-none cursor-pointer file-viewer-slider"
                />
              </div>
            </div>
          </div>
        );

      case 'image':
        return (
          <div className="relative w-full h-full">
            <img
              src={blobUrl}
              alt={material.original_filename}
              className="w-full h-full object-contain"
            />
          </div>
        );

      case 'pdf':
        return (
          <div className="relative w-full h-full">
            <iframe
              src={`${blobUrl}#toolbar=1&navpanes=1&scrollbar=1`}
              className="w-full h-full border-0"
              title={material.original_filename}
            />
          </div>
        );

      case 'document':
      case 'spreadsheet':
      case 'presentation':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-6xl text-gray-400 mb-4">
                {fileType === 'document' ? '📄' : fileType === 'spreadsheet' ? '📊' : '📽️'}
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {material.original_filename}
              </h3>
              <p className="text-gray-500 mb-4">
                This {fileType} cannot be previewed directly in the browser.
              </p>
              <p className="text-sm text-gray-400 mb-4">
                File has been loaded successfully but requires a compatible application to view.
              </p>
              <a
                href={blobUrl}
                download={material.original_filename}
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
              >
                Download File
              </a>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-6xl text-gray-400 mb-4">📁</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {material.original_filename}
              </h3>
              <p className="text-gray-500 mb-4">
                This file type cannot be previewed.
              </p>
              <a
                href={blobUrl}
                download={material.original_filename}
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
              >
                Download File
              </a>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
      <div
        ref={containerRef}
        className="relative w-full h-full max-w-7xl max-h-[90vh] bg-white rounded-lg overflow-hidden"
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-white bg-opacity-95 backdrop-blur-sm border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-gray-900 truncate">
                {material.original_filename}
              </h2>
              <p className="text-sm text-gray-500">
                {(material.file_size / (1024 * 1024)).toFixed(2)} MB • {material.file_type}
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              {fileType === 'video' && !isLoading && !hasError && (
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                  title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                >
                  {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                </button>
              )}
              
              <button
                onClick={handleClose}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="pt-20 h-full">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};