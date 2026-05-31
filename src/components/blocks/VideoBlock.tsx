import React, { useState } from 'react';
import { VideoContent } from '../../types';
import { useModuleStore } from '../../store/useModuleStore';
import { Video, Play, AlertCircle } from 'lucide-react';

interface VideoBlockProps {
  id: string;
  content: VideoContent;
  isLocked: boolean;
  isPreview?: boolean;
}

export const VideoBlock: React.FC<VideoBlockProps> = ({
  id,
  content,
  isLocked,
  isPreview = false,
}) => {
  const updateBlockContent = useModuleStore((state) => state.updateBlockContent);
  const [isPlaying, setIsPlaying] = useState(false);

  // Simple parser for YouTube and Vimeo URLs
  const parseVideoUrl = (url: string) => {
    let provider: VideoContent['provider'] = null;
    let videoId: string | null = null;

    if (!url) return { provider, videoId };

    const ytMatch = url.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
    );
    if (ytMatch) {
      provider = 'youtube';
      videoId = ytMatch[1];
    } else {
      const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?([0-9]+)/i);
      if (vimeoMatch) {
        provider = 'vimeo';
        videoId = vimeoMatch[1];
      }
    }

    return { provider, videoId };
  };

  const handleUrlChange = (newUrl: string) => {
    const { provider, videoId } = parseVideoUrl(newUrl);
    updateBlockContent(id, { url: newUrl, provider, videoId });
    setIsPlaying(false);
  };

  const getEmbedUrl = () => {
    if (content.provider === 'youtube') {
      return `https://www.youtube.com/embed/${content.videoId}?autoplay=1`;
    }
    if (content.provider === 'vimeo') {
      return `https://player.vimeo.com/video/${content.videoId}?autoplay=1`;
    }
    return '';
  };

  const getThumbnailUrl = () => {
    if (content.provider === 'youtube') {
      return `https://img.youtube.com/vi/${content.videoId}/hqdefault.jpg`;
    }
    // Static placeholder for vimeo if needed, or fallback
    return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80';
  };

  const videoRender = (
    <div className="w-full relative rounded-xl overflow-hidden shadow-2xl bg-[#020805] border border-[#082212]/80 aspect-video max-w-2xl">
      {!content.videoId ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-emerald-800 p-6 text-center select-none">
          <AlertCircle className="h-6 w-6 text-emerald-900" />
          <span className="text-xs font-semibold text-emerald-700">Unsupported Video URL</span>
          <span className="text-[10px] text-emerald-900">Please provide a valid YouTube or Vimeo URL.</span>
        </div>
      ) : isPlaying || !isPreview ? (
        // Iframe is only played in live interactive mode (PR-003 / Section A5.1)
        // In the editor view, we show the static thumbnail layout to keep performance slick and avoid jank!
        isPreview && isPlaying ? (
          <iframe
            src={getEmbedUrl()}
            title="Video Player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full border-none"
          />
        ) : (
          <div className="absolute inset-0 w-full h-full group">
            <img
              src={getThumbnailUrl()}
              alt="Video Preview"
              className="w-full h-full object-cover filter brightness-[0.6] group-hover:scale-[1.02] transition-transform duration-500"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={() => isPreview && setIsPlaying(true)}
                className={`p-4 bg-[#d4af37] hover:bg-[#c29e2e] text-black rounded-full shadow-2xl transition-all scale-100 hover:scale-110 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:ring-offset-2 focus:ring-offset-black ${
                  isPreview ? 'cursor-pointer' : 'cursor-default opacity-80'
                }`}
                aria-label="Play video"
              >
                <Play className="h-6 w-6 fill-black ml-0.5" />
              </button>
            </div>
            {/* Display provider indicator in bottom right */}
            <div className="absolute bottom-3 right-3 select-none text-[10px] font-bold text-emerald-600 bg-[#020805]/80 border border-[#082212] px-2 py-0.5 rounded uppercase font-mono tracking-wider">
              {content.provider} Preview
            </div>
          </div>
        )
      ) : (
        <div className="absolute inset-0 bg-[#030a06] flex items-center justify-center">
          <button
            onClick={() => setIsPlaying(true)}
            className="p-4 bg-[#d4af37] hover:bg-[#c29e2e] text-black rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105"
            aria-label="Start video"
          >
            <Play className="h-6 w-6 fill-black ml-0.5" />
          </button>
        </div>
      )}
    </div>
  );

  if (isPreview) {
    return <div className="w-full flex justify-center select-text">{videoRender}</div>;
  }

  return (
    <div className={`flex flex-col gap-4 p-4 border border-[#082212]/80 bg-[#030a06]/30 rounded-xl select-none ${isLocked ? 'opacity-80' : ''}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
          <Video className="h-4 w-4 text-[#d4af37]" />
          <span>Video Embed Settings</span>
        </div>
      </div>

      {!isLocked ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col justify-center gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-emerald-400/80 uppercase tracking-wider">
                Video URL (YouTube or Vimeo)
              </label>
              <input
                type="text"
                value={content.url}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="px-3 py-2 text-xs bg-[#030e07]/60 border border-[#082212]/80 focus:border-[#d4af37] rounded-lg text-slate-200 outline-none select-text"
              />
            </div>
            <div className="text-[10px] leading-relaxed text-emerald-700 select-text bg-[#030e07]/20 p-2.5 rounded-lg border border-[#04140a]">
              <span className="font-bold text-emerald-500">Supported Formats:</span>
              <ul className="list-disc pl-4 mt-1 flex flex-col gap-0.5">
                <li>youtube.com/watch?v=VIDEO_ID</li>
                <li>youtu.be/VIDEO_ID</li>
                <li>vimeo.com/VIDEO_ID</li>
              </ul>
            </div>
          </div>

          <div className="flex items-center justify-center bg-[#030e07]/30 border border-[#082212]/80 rounded-xl overflow-hidden p-2 min-h-[160px]">
            {videoRender}
          </div>
        </div>
      ) : (
        <div className="flex justify-center">{videoRender}</div>
      )}
    </div>
  );
};
