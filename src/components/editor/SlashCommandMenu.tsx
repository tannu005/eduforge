import React, { useState, useEffect, useRef } from 'react';
import { BLOCK_REGISTRY, BlockDefinition } from '../blocks/registry';
import { BlockType } from '../../types';
import * as Icons from 'lucide-react';
import { motion } from 'framer-motion';

interface SlashCommandMenuProps {
  onSelect: (type: BlockType) => void;
  onClose: () => void;
  triggerPosition: { top: number; left: number } | null;
}

export const SlashCommandMenu: React.FC<SlashCommandMenuProps> = ({
  onSelect,
  onClose,
  triggerPosition,
}) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Convert registry to array
  const allBlocks = Object.values(BLOCK_REGISTRY);

  // Filter based on search input
  const filteredBlocks = allBlocks.filter(
    (block) =>
      block.name.toLowerCase().includes(search.toLowerCase()) ||
      block.description.toLowerCase().includes(search.toLowerCase()) ||
      block.category.toLowerCase().includes(search.toLowerCase())
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredBlocks.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredBlocks.length) % filteredBlocks.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredBlocks[selectedIndex]) {
          onSelect(filteredBlocks[selectedIndex].type);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, filteredBlocks, onSelect, onClose]);

  // Scroll active item into view
  useEffect(() => {
    if (containerRef.current) {
      const activeEl = containerRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  // Focus the search input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Helper to render dynamic lucide icons
  const renderIcon = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName];
    return IconComponent ? <IconComponent className="h-4 w-4" /> : <Icons.HelpCircle className="h-4 w-4" />;
  };

  const getCategoryColor = (category: BlockDefinition['category']) => {
    switch (category) {
      case 'content': return 'text-[#d4af37] bg-emerald-950/40 border-emerald-900/30';
      case 'interactive': return 'text-emerald-400 bg-emerald-950/40 border-emerald-800/30';
      case 'utility': return 'text-[#e5c158] bg-emerald-950/40 border-emerald-800/30';
      case 'gamification': return 'text-emerald-300 bg-emerald-950/40 border-emerald-800/30';
    }
  };

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 15, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 350, damping: 24 }}
      style={
        triggerPosition
          ? {
              position: 'absolute',
              top: `${triggerPosition.top}px`,
              left: `${triggerPosition.left}px`,
            }
          : {
              position: 'fixed',
              top: '30%',
              left: '35%',
            }
      }
      className="z-50 w-80 glass-panel shadow-2xl rounded-xl border border-emerald-950 overflow-hidden flex flex-col max-h-[350px]"
      role="listbox"
      aria-label="Slash command suggestions"
      aria-expanded="true"
    >
      <div className="flex items-center gap-2 px-3 py-2 bg-[#020805] border-b border-emerald-950 flex-shrink-0">
        <Icons.Command className="h-4 w-4 text-[#d4af37]" />
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setSelectedIndex(0);
          }}
          placeholder="Type to filter blocks..."
          className="w-full text-sm bg-transparent border-none outline-none text-slate-100 placeholder-slate-500 focus:ring-0 focus:outline-none"
          aria-label="Filter command menu"
        />
      </div>

      <div className="overflow-y-auto flex-grow p-1 flex flex-col gap-0.5">
        {filteredBlocks.length === 0 ? (
          <div className="px-4 py-6 text-center text-xs text-slate-500 font-medium">
            No matching blocks found
          </div>
        ) : (
          filteredBlocks.map((block, idx) => {
            const isActive = idx === selectedIndex;
            return (
              <button
                key={block.type}
                onClick={() => onSelect(block.type)}
                onMouseEnter={() => setSelectedIndex(idx)}
                data-active={isActive}
                className={`w-full text-left px-3 py-2 rounded-lg flex items-start gap-3 transition-colors ${
                  isActive ? 'bg-[#d4af37]/20 border border-[#d4af37]/35 text-[#fcf9f2]' : 'hover:bg-[#06140b] text-slate-350'
                }`}
                role="option"
                aria-selected={isActive}
                id={`slash-option-${block.type}`}
              >
                <div className={`mt-0.5 p-1.5 rounded-md border flex items-center justify-center ${
                  isActive ? 'bg-[#d4af37] border-[#e5c158] text-black' : getCategoryColor(block.category)
                }`}>
                  {renderIcon(block.icon)}
                </div>
                <div className="flex-grow flex flex-col overflow-hidden">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold truncate leading-tight">
                      {block.name}
                    </span>
                    <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded border border-transparent select-none flex-shrink-0 ${
                      isActive ? 'bg-[#d4af37]/40 text-[#fcf9f2]' : 'bg-[#020805]/45 text-slate-400'
                    }`}>
                      {block.category}
                    </span>
                  </div>
                  <span className={`text-xs mt-0.5 line-clamp-1 leading-normal ${
                    isActive ? 'text-[#cbd5e1]' : 'text-slate-500'
                  }`}>
                    {block.description}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>
      <div className="px-3 py-1.5 bg-[#020805]/60 border-t border-emerald-950 flex justify-between items-center text-[10px] text-slate-500 font-medium flex-shrink-0 select-none">
        <span>↑↓ to navigate</span>
        <span>Enter to insert</span>
        <span>Esc to close</span>
      </div>
    </motion.div>
  );
};
