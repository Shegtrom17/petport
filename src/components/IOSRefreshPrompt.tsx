import React from 'react';

interface RefreshPromptProps {
  onRefresh: () => void;
}

export const IOSRefreshPrompt = ({ onRefresh }: RefreshPromptProps) => {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  
  if (!isIOS) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-primary/90 text-white text-center py-2 px-4">
      <div className="flex items-center justify-between max-w-md mx-auto">
        <span className="text-sm">Content may be outdated</span>
        <button
          onClick={onRefresh}
          className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-sm transition-colors"
        >
          Refresh
        </button>
      </div>
    </div>
  );
};