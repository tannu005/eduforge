import React, { useState, useRef, useCallback } from 'react';
import { AccordionContent, AccordionItem } from '../../types';
import { useModuleStore } from '../../store/useModuleStore';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Plus, Trash2, HelpCircle } from 'lucide-react';
import gsap from 'gsap';

interface AccordionBlockProps {
  id: string;
  content: AccordionContent;
  isLocked: boolean;
  isPreview?: boolean;
}

export const AccordionBlock: React.FC<AccordionBlockProps> = ({
  id,
  content,
  isLocked,
  isPreview = false,
}) => {
  const updateBlockContent = useModuleStore((state) => state.updateBlockContent);
  const [activeIndices, setActiveIndices] = useState<number[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const toggleItem = (idx: number) => {
    setActiveIndices((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  // Keyboard navigation for headers (A12.1 Accordion block)
  const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      toggleItem(idx);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIdx = (idx + 1) % content.items.length;
      document.getElementById(`accordion-header-${id}-${nextIdx}`)?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIdx = (idx - 1 + content.items.length) % content.items.length;
      document.getElementById(`accordion-header-${id}-${prevIdx}`)?.focus();
    }
  };

  // Editor Actions
  const handleUpdateItem = (idx: number, fields: Partial<AccordionItem>) => {
    const updated = [...content.items];
    updated[idx] = { ...updated[idx], ...fields };
    updateBlockContent(id, { items: updated });
  };

  const handleAddItem = () => {
    updateBlockContent(id, {
      items: [...content.items, { title: 'New FAQ Question', content: 'New FAQ Answer text...' }],
    });
  };

  const handleRemoveItem = (idx: number) => {
    if (content.items.length <= 1) return;
    const updated = content.items.filter((_, index) => index !== idx);
    updateBlockContent(id, { items: updated });
  };

  if (isPreview) {
    return (
      <div 
        className="flex flex-col gap-3 w-full select-text"
        role="region"
        aria-label="FAQ Accordion"
      >
        {content.items.map((item, idx) => {
          const isOpen = activeIndices.includes(idx);
          return (
            <div 
              key={idx} 
              className="border border-[#082212]/80 bg-[#030a06]/10 rounded-xl overflow-hidden shadow-sm glass-deep"
            >
              <button
                id={`accordion-header-${id}-${idx}`}
                onClick={() => toggleItem(idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                onFocus={() => setFocusedIndex(idx)}
                onBlur={() => setFocusedIndex(null)}
                aria-expanded={isOpen}
                aria-controls={`accordion-panel-${id}-${idx}`}
                className="w-full flex items-center justify-between px-4 py-3.5 text-left text-slate-200 font-bold text-xs hover:bg-[#082212]/20 focus:outline-none transition-colors cursor-pointer select-none"
              >
                <span>{item.title}</span>
                {isOpen ? <ChevronUp className="h-4 w-4 text-[#d4af37]" /> : <ChevronDown className="h-4 w-4 text-emerald-700" />}
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={`accordion-panel-${id}-${idx}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1.0] }}
                    className="overflow-hidden border-t border-[#04140a]"
                    role="region"
                    aria-labelledby={`accordion-header-${id}-${idx}`}
                  >
                    <div className="p-4 text-xs text-slate-350 font-medium leading-relaxed">
                      {item.content}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-4 p-4 border border-[#082212]/80 bg-[#030a06]/30 rounded-xl select-none ${isLocked ? 'opacity-80' : ''}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#04140a] pb-2.5">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
          <HelpCircle className="h-4 w-4 text-[#d4af37]" />
          <span>Accordion / FAQ Settings</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {content.items.map((item, idx) => (
          <div key={idx} className="flex flex-col gap-2 p-3 bg-[#010603]/40 border border-[#04140a] rounded-xl">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={item.title}
                onChange={(e) => handleUpdateItem(idx, { title: e.target.value })}
                disabled={isLocked}
                placeholder="Question / Header..."
                className="w-full px-3 py-1.5 text-xs font-bold bg-[#030e07]/60 border border-[#082212]/80 focus:border-[#d4af37] rounded-lg text-slate-200 outline-none select-text"
              />
              
              {!isLocked && content.items.length > 1 && (
                <button
                  onClick={() => handleRemoveItem(idx)}
                  className="p-1.5 text-rose-500 hover:text-rose-400 bg-[#030e07] border border-emerald-950/50 hover:border-[#082212] rounded-lg cursor-pointer"
                  title="Remove Accordion Item"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <textarea
              value={item.content}
              onChange={(e) => handleUpdateItem(idx, { content: e.target.value })}
              disabled={isLocked}
              placeholder="Answer / Expanded content..."
              className="w-full px-3 py-1.5 text-xs bg-[#030e07]/30 border border-[#04140a]/60 focus:border-[#d4af37] rounded-lg text-slate-350 outline-none select-text resize-none"
              rows={2}
            />
          </div>
        ))}

        {!isLocked && (
          <button
            onClick={handleAddItem}
            className="flex items-center justify-center gap-1.5 self-start px-3 py-1.5 bg-[#d4af37]/20 hover:bg-[#d4af37]/30 border border-[#d4af37]/30 text-[#d4af37] text-xs font-semibold rounded-lg transition-colors cursor-pointer mt-1"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Accordion Item</span>
          </button>
        )}
      </div>
    </div>
  );
};
