import React from 'react';
import { CalloutContent } from '../../types';
import { useModuleStore } from '../../store/useModuleStore';
import { Info, AlertTriangle, Lightbulb, ShieldAlert, AlertOctagon } from 'lucide-react';

interface CalloutBlockProps {
  id: string;
  content: CalloutContent;
  isLocked: boolean;
  isPreview?: boolean;
}

export const CalloutBlock: React.FC<CalloutBlockProps> = ({
  id,
  content,
  isLocked,
  isPreview = false,
}) => {
  const updateBlockContent = useModuleStore((state) => state.updateBlockContent);

  const types = [
    { name: 'info', icon: Info, color: 'border-[#d4af37]/45 bg-[#d4af37]/5 text-[#d4af37]' },
    { name: 'warning', icon: AlertTriangle, color: 'border-amber-500/45 bg-[#030a06]/40 text-amber-400' },
    { name: 'tip', icon: Lightbulb, color: 'border-[#10b981]/45 bg-[#030a06]/40 text-[#10b981]' },
    { name: 'important', icon: AlertOctagon, color: 'border-[#d4af37]/45 bg-[#020805]/80 text-[#f6ebd1]' },
    { name: 'danger', icon: ShieldAlert, color: 'border-rose-500/45 bg-[#020805]/80 text-rose-400' },
  ];

  const currentType = types.find((t) => t.name === content.type) || types[0];
  const IconComponent = currentType.icon;

  if (isPreview) {
    return (
      <div className={`flex gap-3.5 p-4 border rounded-xl leading-relaxed select-text ${currentType.color}`}>
        <IconComponent className="h-5 w-5 flex-shrink-0 mt-0.5" />
        <p className="text-sm font-medium">{content.content}</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-3.5 p-4 border rounded-xl transition-all ${currentType.color} ${isLocked ? 'opacity-80' : ''}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <IconComponent className="h-5 w-5 flex-shrink-0" />
          <span className="text-xs font-bold uppercase tracking-wider select-none opacity-85">
            {content.type} Callout
          </span>
        </div>
        
        {/* Callout type toggle selector */}
        {!isLocked && (
          <div className="flex items-center gap-1 bg-[#010603]/60 p-0.5 border border-emerald-950 rounded-lg select-none">
            {types.map((t) => {
              const TIcon = t.icon;
              return (
                <button
                  key={t.name}
                  onClick={() => updateBlockContent(id, { type: t.name as any })}
                  className={`p-1.5 rounded transition-colors focus:outline-none focus:ring-1 focus:ring-[#d4af37] cursor-pointer ${
                    content.type === t.name 
                      ? 'bg-[#d4af37] text-black font-semibold shadow-md' 
                      : 'text-emerald-700 hover:text-emerald-400 hover:bg-[#030e07]/40'
                  }`}
                  title={`${t.name} style`}
                >
                  <TIcon className="h-3.5 w-3.5" />
                </button>
              );
            })}
          </div>
        )}
      </div>

      <textarea
        value={content.content}
        onChange={(e) => updateBlockContent(id, { content: e.target.value })}
        disabled={isLocked}
        placeholder="Enter callout note text here..."
        className="w-full text-sm font-medium bg-transparent border-none outline-none resize-none focus:ring-0 focus:outline-none select-text placeholder-emerald-800"
        rows={2}
      />
    </div>
  );
};
