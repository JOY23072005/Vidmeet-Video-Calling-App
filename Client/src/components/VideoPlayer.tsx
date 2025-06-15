import React, { useEffect, useRef, useState } from 'react';
import Alert from '../components/Alerts.tsx'

interface VideoPlayerProps {
  stream: MediaStream | null;
  isLocal: boolean;
  title: string;
  className?: string;
  handleCallEnd:()=>void;
  onError?: (error: Error) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = React.memo(({ 
  stream, 
  isLocal, 
  title, 
  className = '',
  handleCallEnd,
  onError
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);

  const [alertMessage, setAlertMessage] = useState('');
  // const navigate = useNavigate();

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !stream) return;

    console.log(`[${title}] Setting up video with ${stream.getTracks().length} tracks`);

    // Cleanup previous stream
    videoElement.srcObject = null;
    setIsPlaying(false);
    setHasError(false);

    const handleLoadedMetadata = () => {
      videoElement.play()
        .then(() => {
          console.log(`[${title}] Video started playing`);
          setIsPlaying(true);
        })
        .catch(err => {
          console.error(`[${title}] Play error:`, err);
          onError?.(err);
          if (!isLocal) {
            videoElement.muted = true;
            videoElement.play().catch(e => {
              console.error(`[${title}] Muted play failed:`, e);
              onError?.(e);
            });
          }
        });
    };

    const handleError = (event: Event) => {
      const error = (event.target as HTMLVideoElement).error;
      console.error(`[${title}] Video error:`, error);
      setHasError(true);
      onError?.(new Error(error?.message || 'Unknown video error'));
    };

    // Small delay to ensure clean state
    const timeoutId = setTimeout(() => {
      videoElement.srcObject = stream;
      videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.addEventListener('error', handleError);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.removeEventListener('error', handleError);
      videoElement.srcObject = null;
      
      // Don't stop tracks here - parent component manages stream lifecycle
    };
  }, [stream, isLocal, title, onError]);

  useEffect(()=>{
     let timeoutId:number;

      if (!isPlaying) {
        timeoutId = setTimeout(() => {
          setAlertMessage("User Disconnected, Ending Call");
          setTimeout(()=>{
            handleCallEnd();
          },3000)
        }, 8000); // Wait 10s before triggering navigation
      }

      // Cleanup: if isPlaying becomes true or component unmounts
      return () => clearTimeout(timeoutId);
  },[isPlaying])
  return (
    <div className={`relative ${className}`}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        className="w-full h-full object-cover bg-black rounded-xl border border-gray-500/100"
        style={{
          minHeight: isLocal ? '150px' : '300px'
        }}
      />
      
      {/* Status overlays */}
      {!isPlaying && !hasError && (
        <>
        <Alert 
            message={alertMessage} 
            onClose={() => setAlertMessage('')}
            type="warning"
          />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white bg-black bg-opacity-70 px-2 py-1 rounded text-sm">
          Loading {title}...
        </div>
        </>
      )}
      
      {hasError && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-red-500 bg-black bg-opacity-70 px-2 py-1 rounded text-sm">
          {title} Video Error
        </div>
      )}
    </div>
  );
});

VideoPlayer.displayName = 'VideoPlayer'; // For better debugging

export default VideoPlayer;