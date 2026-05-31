import React, { useState } from 'react';
import { ImageContent } from '../../types';
import { useModuleStore } from '../../store/useModuleStore';
import { Image, AlignLeft, AlignCenter, AlignRight, Maximize2, AlertCircle } from 'lucide-react';

interface ImageBlockProps {
  id: string;
  content: ImageContent;
  isLocked: boolean;
  isPreview?: boolean;
}

export const ImageBlock: React.FC<ImageBlockProps> = ({
  id,
  content,
  isLocked,
  isPreview = false,
}) => {
  const updateBlockContent = useModuleStore((state) => state.updateBlockContent);
  const [hasError, setHasError] = useState(false);

  const getAlignmentClass = (align: ImageContent['alignment']) => {
    switch (align) {
      case 'left': return 'justify-start';
      case 'center': return 'justify-center';
      case 'right': return 'justify-end';
      case 'full-width': return 'w-full';
    }
  };

  const alignments = [
    { name: 'left', icon: AlignLeft },
    { name: 'center', icon: AlignCenter },
    { name: 'right', icon: AlignRight },
    { name: 'full-width', icon: Maximize2 },
  ] as const;

  const imageElement = (
    <div className="flex flex-col items-center gap-1.5 w-full">
      {hasError ? (
        <div 
          className="flex flex-col items-center justify-center gap-2 p-8 border border-dashed border-slate-800 bg-slate-950/40 rounded-xl text-slate-500 w-full min-h-[160px]"
          role="img"
          aria-label="Broken link placeholder"
        >
          <AlertCircle className="h-6 w-6 text-rose-500/70" />
          <span className="text-xs font-semibold text-slate-400">Image not found at provided URL</span>
          <span className="text-[10px] text-slate-600 line-clamp-1 max-w-[280px] font-mono">{content.url}</span>
        </div>
      ) : (
        <img
          src={content.url}
          alt={content.alt || 'Financial illustration'}
          loading="lazy"
          onError={() => setHasError(true)}
          onLoad={() => setHasError(false)}
          className={`rounded-xl object-cover max-h-[450px] shadow-2xl transition-transform ${
            content.alignment === 'full-width' ? 'w-full' : 'max-w-full'
          }`}
        />
      )}
      {content.caption && (
        <figcaption className="text-xs text-slate-500 italic font-medium select-text">
          {content.caption}
        </figcaption>
      )}
    </div>
  );

  if (isPreview) {
    return (
      <figure 
        className={`w-full flex select-text ${getAlignmentClass(content.alignment)}`}
      >
        {imageElement}
      </figure>
    );
  }

  return (
    <div className={`flex flex-col gap-4 p-4 border border-[#082212]/80 bg-[#030a06]/30 rounded-xl select-none ${isLocked ? 'opacity-80' : ''}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 whitespace-nowrap">
          <Image className="h-4 w-4 text-[#d4af37]" />
          <span>Image Block Settings</span>
        </div>
        
        {/* Alignment Toggles */}
        {!isLocked && (
          <div className="flex flex-wrap items-center gap-1.5 bg-[#030e07] border border-emerald-950/50 p-0.5 rounded-lg">
            {alignments.map((align) => {
              const AlignIcon = align.icon;
              return (
                <button
                  key={align.name}
                  onClick={() => updateBlockContent(id, { alignment: align.name })}
                  className={`p-1.5 rounded transition-colors focus:ring-1 focus:ring-[#d4af37] cursor-pointer ${
                    content.alignment === align.name 
                      ? 'bg-[#d4af37] text-black font-semibold' 
                      : 'text-emerald-700 hover:text-emerald-400'
                  }`}
                  title={`${align.name} alignment`}
                >
                  <AlignIcon className="h-3.5 w-3.5" />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {!isLocked ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-emerald-400/80 uppercase tracking-wider">
                Image URL
              </label>
              <input
                type="text"
                value={content.url}
                onChange={(e) => {
                  setHasError(false);
                  updateBlockContent(id, { url: e.target.value });
                }}
                placeholder="Enter image URL..."
                className="px-3 py-1.5 text-xs bg-[#030e07]/60 border border-[#082212]/80 focus:border-[#d4af37] rounded-lg text-slate-200 outline-none select-text"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-emerald-400/80 uppercase tracking-wider flex items-center gap-1.5">
                <span>Accessibility Alt Text</span>
                <span className="text-rose-500 font-extrabold select-none">*</span>
              </label>
              <input
                type="text"
                value={content.alt}
                onChange={(e) => updateBlockContent(id, { alt: e.target.value })}
                placeholder="Required for screen-readers..."
                className={`px-3 py-1.5 text-xs bg-[#030e07]/60 border focus:border-[#d4af37] rounded-lg text-slate-200 outline-none select-text ${
                  !content.alt || content.alt.trim() === '' ? 'border-amber-500/40 focus:border-amber-500' : 'border-[#082212]/80'
                }`}
              />
              {(!content.alt || content.alt.trim() === '') && (
                <span className="text-[10px] text-amber-400 font-medium">
                  Warning: Missing alt text will trigger a schema warning
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-emerald-400/80 uppercase tracking-wider">
                Caption
              </label>
              <input
                type="text"
                value={content.caption}
                onChange={(e) => updateBlockContent(id, { caption: e.target.value })}
                placeholder="Enter caption text (optional)..."
                className="px-3 py-1.5 text-xs bg-[#030e07]/60 border border-[#082212]/80 focus:border-[#d4af37] rounded-lg text-slate-200 outline-none select-text"
              />
            </div>
          </div>

          <div className="flex items-center justify-center bg-[#030e07]/30 border border-[#082212]/80 rounded-xl overflow-hidden p-2 min-h-[180px]">
            {imageElement}
          </div>
        </div>
      ) : (
        <div className="flex justify-center">{imageElement}</div>
      )}
    </div>
  );
};
