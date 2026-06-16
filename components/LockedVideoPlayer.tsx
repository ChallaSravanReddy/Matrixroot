"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  Loader2 
} from "lucide-react";

interface LockedVideoPlayerProps {
  videoUrl: string;
  className?: string;
  autoPlay?: boolean;
  startSeconds?: number;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }
}

export default function LockedVideoPlayer({
  videoUrl,
  className = "",
  autoPlay = false,
  startSeconds = 0,
}: LockedVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const progressRef = useRef<HTMLInputElement>(null);

  // Video States
  const [isYoutube, setIsYoutube] = useState(false);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [apiReady, setApiReady] = useState(false);

  // YouTube Player Instance
  const ytPlayerRef = useRef<any>(null);
  const timeUpdateInterval = useRef<NodeJS.Timeout | null>(null);

  // 1. Detect video type and extract YouTube ID
  useEffect(() => {
    if (!videoUrl) return;

    let ytId: string | null = null;
    let isYt = false;

    if (videoUrl.includes("youtu.be/")) {
      ytId = videoUrl.split("youtu.be/")[1]?.split(/[?#]/)[0]?.split("/")[0] || null;
      isYt = true;
    } else if (videoUrl.includes("youtube.com/watch")) {
      const match = videoUrl.match(/[?&]v=([^&#]+)/);
      if (match) ytId = match[1];
      isYt = true;
    } else if (videoUrl.includes("youtube.com/shorts/")) {
      ytId = videoUrl.split("youtube.com/shorts/")[1]?.split(/[?#]/)[0]?.split("/")[0] || null;
      isYt = true;
    } else if (videoUrl.includes("youtube.com/embed/")) {
      ytId = videoUrl.split("youtube.com/embed/")[1]?.split(/[?#]/)[0] || null;
      isYt = true;
    }

    setIsYoutube(isYt);
    setVideoId(ytId);
    
    // Reset state on URL change
    setIsPlaying(false);
    setCurrentTime(startSeconds);
    setDuration(0);
    setIsBuffering(false);
  }, [videoUrl, startSeconds]);

  // 2. Load YouTube API if needed
  useEffect(() => {
    if (!isYoutube || !videoId) return;

    if (window.YT && window.YT.Player) {
      setApiReady(true);
      return;
    }

    // Load script
    const existingScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
    if (!existingScript) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const previousCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (previousCallback) previousCallback();
      setApiReady(true);
    };

    return () => {
      window.onYouTubeIframeAPIReady = previousCallback;
    };
  }, [isYoutube, videoId]);

  // 3. Initialize YouTube Player
  useEffect(() => {
    if (!isYoutube || !videoId || !apiReady || !iframeRef.current) return;

    // Destroy existing player if any
    if (ytPlayerRef.current) {
      try {
        ytPlayerRef.current.destroy();
      } catch (e) {
        console.error("Error destroying player:", e);
      }
      ytPlayerRef.current = null;
    }

    const initPlayer = () => {
      ytPlayerRef.current = new window.YT.Player(iframeRef.current, {
        events: {
          onReady: (event: any) => {
            const player = event.target;
            setDuration(player.getDuration() || 0);
            player.setVolume(volume);
            if (isMuted) player.mute();
            else player.unMute();

            // Seek to startSeconds initially
            if (startSeconds > 0) {
              player.seekTo(startSeconds, true);
              setCurrentTime(startSeconds);
            }

            if (autoPlay) {
              player.playVideo();
            }
          },
          onStateChange: (event: any) => {
            const state = event.data;
            if (state === 1) {
              setIsPlaying(true);
              setIsBuffering(false);
            } else if (state === 2) {
              setIsPlaying(false);
              setIsBuffering(false);
            } else if (state === 3) {
              setIsBuffering(true);
            } else if (state === 0) {
              setIsPlaying(false);
              setIsBuffering(false);
              if (ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === "function") {
                ytPlayerRef.current.seekTo(startSeconds, true);
              }
              setCurrentTime(startSeconds);
            }
          },
        },
      });
    };

    const timer = setTimeout(initPlayer, 100);
    return () => clearTimeout(timer);
  }, [isYoutube, videoId, apiReady, startSeconds, autoPlay]);

  // 4. Update Time Interval for YouTube
  useEffect(() => {
    if (!isYoutube) return;

    if (isPlaying) {
      timeUpdateInterval.current = setInterval(() => {
        if (ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === "function") {
          const rawTime = ytPlayerRef.current.getCurrentTime();
          // Force it not to go backward than startSeconds
          if (rawTime < startSeconds) {
            ytPlayerRef.current.seekTo(startSeconds, true);
            setCurrentTime(startSeconds);
          } else {
            setCurrentTime(rawTime);
          }
          // Update duration just in case it wasn't ready initially
          if (duration === 0) {
            setDuration(ytPlayerRef.current.getDuration() || 0);
          }
        }
      }, 250);
    } else {
      if (timeUpdateInterval.current) {
        clearInterval(timeUpdateInterval.current);
      }
    }

    return () => {
      if (timeUpdateInterval.current) {
        clearInterval(timeUpdateInterval.current);
      }
    };
  }, [isPlaying, isYoutube, duration, startSeconds]);

  // 5. Autoplay and initial seek for local HTML5 Video
  useEffect(() => {
    if (isYoutube || !videoRef.current) return;
    if (startSeconds > 0) {
      videoRef.current.currentTime = startSeconds;
      setCurrentTime(startSeconds);
    }
    if (autoPlay) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [isYoutube, startSeconds, autoPlay]);

  // 6. Track Fullscreen Change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Format seconds to MM:SS or HH:MM:SS
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds === null) return "0:00";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hrs > 0) {
      return `${hrs}:${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
    }
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Play/Pause Action
  const togglePlay = () => {
    if (isYoutube) {
      if (!ytPlayerRef.current) return;
      if (isPlaying) {
        ytPlayerRef.current.pauseVideo();
      } else {
        ytPlayerRef.current.playVideo();
      }
    } else {
      if (!videoRef.current) return;
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().then(() => setIsPlaying(true));
      }
    }
  };

  // Seek / Progress Action
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    let time = parseFloat(e.target.value);
    // Enforce lock startSeconds bounds
    if (time < startSeconds) {
      time = startSeconds;
    }
    setCurrentTime(time);

    if (isYoutube) {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === "function") {
        ytPlayerRef.current.seekTo(time, true);
      }
    } else {
      if (videoRef.current) {
        videoRef.current.currentTime = time;
      }
    }
  };

  // Volume Action
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseInt(e.target.value);
    setVolume(vol);
    setIsMuted(vol === 0);

    if (isYoutube) {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.setVolume === "function") {
        ytPlayerRef.current.setVolume(vol);
        if (vol === 0) ytPlayerRef.current.mute();
        else ytPlayerRef.current.unMute();
      }
    } else {
      if (videoRef.current) {
        videoRef.current.volume = vol / 100;
        videoRef.current.muted = vol === 0;
      }
    }
  };

  // Mute Toggle Action
  const toggleMute = () => {
    const newMute = !isMuted;
    setIsMuted(newMute);

    if (isYoutube) {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.mute === "function") {
        if (newMute) {
          ytPlayerRef.current.mute();
        } else {
          ytPlayerRef.current.unMute();
          ytPlayerRef.current.setVolume(volume);
        }
      }
    } else {
      if (videoRef.current) {
        videoRef.current.muted = newMute;
      }
    }
  };

  // Fullscreen Action
  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error("Fullscreen failed:", err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Local Video Events
  const handleLocalVideoTimeUpdate = () => {
    if (videoRef.current) {
      const rawTime = videoRef.current.currentTime;
      if (rawTime < startSeconds) {
        videoRef.current.currentTime = startSeconds;
        setCurrentTime(startSeconds);
      } else {
        setCurrentTime(rawTime);
      }
    }
  };

  const handleLocalVideoLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      if (videoRef.current.currentTime < startSeconds) {
        videoRef.current.currentTime = startSeconds;
        setCurrentTime(startSeconds);
      }
    }
  };

  // Build secure YouTube Iframe src url
  const secureEmbedUrl = useMemo(() => {
    if (!isYoutube || !videoId) return "";
    const params = new URLSearchParams({
      enablejsapi: "1",
      controls: "0",        // Hide default controls
      modestbranding: "1",  // Hide logo
      rel: "0",             // Related videos of same channel
      disablekb: "1",       // Disable keyboard shortcuts
      iv_load_policy: "3",  // Disable annotations
      fs: "0",              // Disable fullscreen button in YT player
      showinfo: "0",        // Deprecated but good legacy fallback
    });
    if (startSeconds > 0) {
      params.append("start", String(startSeconds));
    }
    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  }, [isYoutube, videoId, startSeconds]);

  // Calculate percentage of timeline filled relative to min/max range
  const timelinePercentage = useMemo(() => {
    if (!duration || duration <= startSeconds) return 0;
    const currentClamped = Math.max(currentTime, startSeconds);
    return ((currentClamped - startSeconds) / (duration - startSeconds)) * 100;
  }, [currentTime, duration, startSeconds]);

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative w-full h-full bg-black overflow-hidden select-none group flex items-center justify-center ${className}`}
    >
      {/* 
        THE VIDEO LAYER:
        Using `pointer-events-none` guarantees that clicks do NOT pass into the YouTube/Iframe player.
      */}
      {isYoutube ? (
        videoId ? (
          <iframe
            ref={iframeRef}
            src={secureEmbedUrl}
            className="w-full h-[118%] border-0 pointer-events-none absolute"
            style={{
              top: "-9%",
              left: 0,
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            sandbox="allow-scripts allow-same-origin allow-presentation"
          ></iframe>
        ) : (
          <div className="text-white text-xs">Invalid YouTube URL</div>
        )
      ) : (
        <video
          ref={videoRef}
          src={videoUrl}
          onTimeUpdate={handleLocalVideoTimeUpdate}
          onLoadedMetadata={handleLocalVideoLoadedMetadata}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          className="w-full h-full object-cover pointer-events-none"
        />
      )}

      {/* Buffering/Loading Indicator */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-20">
          <Loader2 className="w-12 h-12 text-[#8B5A2B] animate-spin" />
        </div>
      )}

      {/* Full screen click-to-toggle play */}
      <div 
        className="absolute inset-0 bg-transparent z-10 cursor-pointer"
        onClick={togglePlay}
      />

      {/* Big Play Overlay Button (Visible when paused) */}
      {!isPlaying && !isBuffering && (
        <button
          onClick={togglePlay}
          className="absolute z-20 p-5 bg-black/50 hover:bg-[#8B5A2B] text-white rounded-full transition-all duration-300 scale-100 hover:scale-110 shadow-xl border border-white/10"
        >
          <Play className="w-8 h-8 fill-current ml-1" />
        </button>
      )}

      {/* 
        BOTTOM CONTROL BAR:
        Fades in/out depending on mouse hover or playing state.
      */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent z-20 flex flex-col gap-2 transition-all duration-300 ${
          isHovered || !isPlaying ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
        }`}
      >
        {/* Timeline Progress Bar */}
        <div className="flex items-center gap-3 w-full group/timeline">
          <input
            ref={progressRef}
            type="range"
            min={startSeconds}
            max={duration || 100}
            value={Math.max(currentTime, startSeconds)}
            onChange={handleSeek}
            className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#8B5A2B] hover:h-1.5 transition-all outline-none"
            style={{
              background: `linear-gradient(to right, #8B5A2B 0%, #8B5A2B ${timelinePercentage}%, rgba(255,255,255,0.2) ${timelinePercentage}%, rgba(255,255,255,0.2) 100%)`,
            }}
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            {/* Play/Pause Button */}
            <button
              onClick={togglePlay}
              className="text-white/80 hover:text-white transition-colors p-1"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current" />
              )}
            </button>

            {/* Time Counter */}
            <div className="text-white/80 text-[11px] font-mono select-none">
              {formatTime(currentTime)} <span className="text-white/40">/</span> {formatTime(duration)}
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-2 group/volume">
              <button
                onClick={toggleMute}
                className="text-white/80 hover:text-white transition-colors p-1"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={100}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-0 group-hover/volume:w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white transition-all outline-none"
                style={{
                  background: `linear-gradient(to right, white 0%, white ${
                    isMuted ? 0 : volume
                  }%, rgba(255,255,255,0.2) ${
                    isMuted ? 0 : volume
                  }%, rgba(255,255,255,0.2) 100%)`,
                }}
              />
            </div>
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="text-white/80 hover:text-white transition-colors p-1"
          >
            {isFullscreen ? (
              <Minimize className="w-5 h-5" />
            ) : (
              <Maximize className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
