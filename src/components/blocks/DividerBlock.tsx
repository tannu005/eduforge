import React from 'react';
import { DividerContent } from '../../types';
import { useModuleStore } from '../../store/useModuleStore';

interface DividerBlockProps {
  id: string;
  content: DividerContent;
  isLocked: boolean;
  isPreview?: boolean;
}

export const DividerBlock: React.FC<DividerBlockProps> = ({
  id,
  content,
  isLocked,
  isPreview = false,
}) => {
  const updateBlockContent = useModuleStore((state) => state.updateBlockContent);

  const getSpacingClass = (spacing: DividerContent['spacing']) => {
    switch (spacing) {
      case 'compact': return 'my-2';
      case 'normal': return 'my-6';
      case 'spacious': return 'my-12';
    }
  };

  const getLineStyleClass = (style: DividerContent['style']) => {
    switch (style) {
      case 'solid': return 'border-t border-[#082212]/80';
      case 'dashed': return 'border-t border-dashed border-[#082212]/80';
      case 'dotted': return 'border-t border-dotted border-emerald-900';
      case 'decorative': return 'h-[2px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent';
    }
  };

  const spacingClass = getSpacingClass(content.spacing);
  const styleClass = getLineStyleClass(content.style);

  if (isPreview) {
    return (
      <div className={`w-full ${spacingClass}`} role="separator">
        <div className={styleClass} />
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-3 p-4 border border-[#082212]/80 bg-[#030a06]/30 rounded-xl select-none ${isLocked ? 'opacity-80' : ''}`}>
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider whitespace-nowrap flex-shrink-0">
          Divider Line Settings
        </span>
        
        {!isLocked && (
          <div className="flex flex-wrap items-center gap-2">
            {/* Style Selector */}
            <div className="flex flex-wrap items-center gap-1 bg-[#030e07] border border-emerald-950/50 p-0.5 rounded-lg">
              {(['solid', 'dashed', 'dotted', 'decorative'] as const).map((style) => (
                <button
                  key={style}
                  onClick={() => updateBlockContent(id, { style })}
                  className={`px-2 py-1 text-xs font-bold capitalize rounded transition-colors focus:ring-1 focus:ring-[#d4af37] cursor-pointer ${
                    content.style === style 
                      ? 'bg-[#d4af37] text-black font-semibold' 
                      : 'text-emerald-700 hover:text-emerald-400'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>

            {/* Spacing Selector */}
            <div className="flex flex-wrap items-center gap-1 bg-[#030e07] border border-emerald-950/50 p-0.5 rounded-lg">
              {(['compact', 'normal', 'spacious'] as const).map((spacing) => (
                <button
                  key={spacing}
                  onClick={() => updateBlockContent(id, { spacing })}
                  className={`px-2 py-1 text-xs font-bold capitalize rounded transition-colors focus:ring-1 focus:ring-[#d4af37] cursor-pointer ${
                    content.spacing === spacing 
                      ? 'bg-[#d4af37] text-black font-semibold' 
                      : 'text-emerald-700 hover:text-emerald-400'
                  }`}
                >
                  {spacing}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Render line sample inside editor */}
      <div className={`w-full ${spacingClass}`}>
        <div className={styleClass} />
      </div>
    </div>
  );
};
