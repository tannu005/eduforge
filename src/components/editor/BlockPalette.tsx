import React, { useState } from 'react';
import { BLOCK_REGISTRY, BlockDefinition } from '../blocks/registry';
import { BlockType } from '../../types';
import { useModuleStore } from '../../store/useModuleStore';
import { useToastStore } from '../../store/useToastStore';
import * as Icons from 'lucide-react';

export const BlockPalette: React.FC = () => {
  const addBlock = useModuleStore((state) => state.addBlock);
  const isAuthenticated = useModuleStore((state) => state.isAuthenticated);
  const { showToast } = useToastStore();
  const [search, setSearch] = useState('');

  const allBlocks = Object.values(BLOCK_REGISTRY);

  const filteredBlocks = allBlocks.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.description.toLowerCase().includes(search.toLowerCase())
  );

  const categories = ['content', 'interactive', 'utility', 'gamification'] as const;

  const handleBlockAdd = (type: BlockType) => {
    const category = BLOCK_REGISTRY[type].category;
    if (!isAuthenticated && (category === 'interactive' || category === 'gamification')) {
      useModuleStore.getState().setShowLoginModal(true);
      showToast(`🔒 Secure Hub Connection Required. Connect via Security Hub to unlock ${BLOCK_REGISTRY[type].name} simulations!`, 'warning', 4500);
      return;
    }
    addBlock(type);
    showToast(`Added new ${BLOCK_REGISTRY[type].name} block.`, 'success');
  };

  const renderIcon = (iconName: string, category: BlockDefinition['category']) => {
    const IconComponent = (Icons as any)[iconName];
    const baseClass = "h-4 w-4 flex-shrink-0";
    
    switch (category) {
      case 'content':
        return IconComponent ? <IconComponent className={`${baseClass} text-[#d4af37]`} /> : <Icons.Type className={baseClass} />;
      case 'interactive':
        return IconComponent ? <IconComponent className={`${baseClass} text-[#10b981]`} /> : <Icons.Calculator className={baseClass} />;
      case 'utility':
        return IconComponent ? <IconComponent className={`${baseClass} text-[#e5c158]`} /> : <Icons.Minus className={baseClass} />;
      case 'gamification':
        return IconComponent ? <IconComponent className={`${baseClass} text-emerald-400`} /> : <Icons.Award className={baseClass} />;
    }
  };

  const getCategoryHeaderColor = (category: string) => {
    switch (category) {
      case 'content': return 'text-[#d4af37]/80';
      case 'interactive': return 'text-[#10b981]/80';
      case 'utility': return 'text-[#e5c158]/80';
      case 'gamification': return 'text-emerald-500/80';
      default: return 'text-slate-505';
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full h-full p-4 select-none">
      <div className="flex flex-col gap-1.5 border-b border-emerald-950/65 pb-3">
        <h3 className="font-extrabold text-sm font-display tracking-wide text-white flex items-center gap-2">
          <Icons.PlusSquare className="h-4.5 w-4.5 text-[#d4af37]" />
          <span>Insert Blocks Registry</span>
        </h3>
        <span className="text-[10px] text-emerald-300/60 font-semibold leading-normal">
          Click any card type below to instantly append it to your educational canvas.
        </span>
      </div>

      {/* Search Filter */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#030a06]/75 border border-emerald-950/65 rounded-xl flex-shrink-0 focus-within:border-[#d4af37]/50 transition-all shadow-inner">
        <Icons.Search className="h-3.5 w-3.5 text-emerald-400/50" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search block types..."
          className="w-full text-xs bg-transparent border-none outline-none text-slate-200 placeholder-emerald-300/40 focus:ring-0 focus:outline-none font-medium"
        />
      </div>

      {/* Grouped Category Stack */}
      <div className="flex-grow overflow-y-auto pr-1 flex flex-col gap-5">
        {categories.map((category) => {
          const categoryBlocks = filteredBlocks.filter((b) => b.category === category);
          if (categoryBlocks.length === 0) return null;

          return (
            <div key={category} className="flex flex-col gap-2.5">
              <span className={`text-[9px] font-extrabold uppercase tracking-wider leading-none font-mono ${getCategoryHeaderColor(category)}`}>
                {category} Elements
              </span>
              <div className="grid grid-cols-1 gap-2">
                {categoryBlocks.map((block) => {
                  const isRestricted = !isAuthenticated && (block.category === 'interactive' || block.category === 'gamification');
                  return (
                    <button
                      key={block.type}
                      onClick={() => handleBlockAdd(block.type)}
                      className={`palette-card w-full text-left p-3 rounded-2xl border border-emerald-950/20 bg-[#041208]/30 hover:bg-[#082210]/40 flex gap-3 select-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#d4af37] group/card ${
                        isRestricted ? 'opacity-60 border-amber-500/10 hover:border-amber-500/20' : ''
                      }`}
                    >
                      <div className="mt-0.5 p-2 rounded-xl bg-[#020805] border border-[#082212] flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover/card:scale-110 group-hover/card:shadow-lg group-hover/card:shadow-[#d4af37]/10">
                        {renderIcon(block.icon, block.category)}
                      </div>
                      <div className="flex flex-col overflow-hidden w-full">
                        <span className="text-xs font-bold text-slate-200 tracking-tight leading-snug flex items-center justify-between w-full">
                          <span>{block.name}</span>
                          {isRestricted && <Icons.Lock className="h-3 w-3 text-[#d4af37]/85 flex-shrink-0" />}
                        </span>
                        <span className="text-[10px] text-emerald-300/40 font-semibold leading-normal mt-1 line-clamp-2">
                          {block.description}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {filteredBlocks.length === 0 && (
          <div className="text-center py-8 text-xs text-emerald-400/40 font-bold select-none">
            No matching blocks found
          </div>
        )}
      </div>
    </div>
  );
};
