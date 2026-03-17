import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

interface OptimizedVideoPlayerProps {
  src: string;
  fileType?: string;
}

export const OptimizedVideoPlayer = ({
  src,
  fileType = "mp4",
}: OptimizedVideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isBuffering, setIsBuffering] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleWaiting = () => setIsBuffering(true);
    const handleCanPlay = () => setIsBuffering(false);
    const handlePlaying = () => setIsBuffering(false);

    const handleProgress = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const duration = video.duration;
        if (duration > 0) {
          setLoadProgress((bufferedEnd / duration) * 100);
        }
      }
    };

    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("progress", handleProgress);

    return () => {
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("progress", handleProgress);
    };
  }, []);

  return (
    <div className="relative w-full aspect-video bg-black">
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-2" />
            <p className="text-white text-sm">Loading video...</p>
          </div>
        </div>
      )}

      <video
        ref={videoRef}
        controls
        controlsList="nodownload"
        className="w-full h-full object-contain"
        autoPlay
        preload="metadata"
        playsInline
        onContextMenu={(e) => e.preventDefault()}
      >
        <source src={src} type={`video/${fileType}`} />
        <source src={src} type="video/mp4" />
        <source src={src} type="video/webm" />
        <p className="text-white p-4">
          Your browser does not support the video tag.
        </p>
      </video>

      {loadProgress > 0 && loadProgress < 100 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${loadProgress}%` }}
          />
        </div>
      )}
    </div>
  );
};
