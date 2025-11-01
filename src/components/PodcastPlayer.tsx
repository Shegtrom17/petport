import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { AzureButton } from './ui/azure-button';
import { cn } from '@/lib/utils';
import { Progress } from './ui/progress';

interface PodcastPlayerProps {
  audioUrl: string;
  coverImage: string;
  episodeTitle: string;
}

export const PodcastPlayer: React.FC<PodcastPlayerProps> = ({
  audioUrl,
  coverImage,
  episodeTitle,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    const updateDuration = () => {
      setDuration(audio.duration);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    const newTime = (percentage / 100) * duration;

    audioRef.current.currentTime = newTime;
    setProgress(percentage);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-card rounded-lg shadow-lg p-6 border border-border">
      <audio ref={audioRef} src={audioUrl} />
      
      <div className="flex items-center gap-6">
        {/* Cover Image */}
        <img
          src={coverImage}
          alt={episodeTitle}
          className="w-24 h-24 rounded-md object-cover flex-shrink-0"
        />

        {/* Controls */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground mb-3 truncate">
            {episodeTitle}
          </h3>

          {/* Progress Bar */}
          <div 
            className="relative h-2 bg-secondary rounded-full cursor-pointer mb-2"
            onClick={handleProgressClick}
          >
            <div 
              className="absolute h-full bg-brand-primary rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Time Display */}
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3">
            <AzureButton
              onClick={togglePlay}
              size="sm"
              className="w-10 h-10 rounded-full p-0"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4 text-white" />
              ) : (
                <Play className="h-4 w-4 text-white ml-0.5" />
              )}
            </AzureButton>

            <button
              onClick={toggleMute}
              className="text-brand-primary hover:text-brand-primary/80 transition-colors"
            >
              {isMuted ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
