import React, { useState } from 'react';
import { Block, BlockSettings } from '../../types';
import { useModuleStore } from '../../store/useModuleStore';
import { useToastStore } from '../../store/useToastStore';
import { BlockErrorBoundary } from '../shared/ErrorBoundary';
import { FloatingToolbar } from './FloatingToolbar';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Lock, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BlockWrapperProps {
  block: Block;
  children: React.ReactNode;
}

export const BlockWrapper: React.FC<BlockWrapperProps> = ({ block, children }) => {
  const {
    updateBlockContent,
    updateBlockSettings,
    deleteBlock,
    duplicateBlock,
    moveBlock,
    selectedBlockId,
    setSelectedBlockId,
    blocks,
  } = useModuleStore();

  const { showToast } = useToastStore();
  const [showSettings, setShowSettings] = useState(false);

  // Set up sortable drag capabilities (dnd-kit)
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id, disabled: block.settings.isLocked });

  const dndStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  };

  const isSelected = selectedBlockId === block.id;

  // Handles 10 standard block actions (A6.4)
  const handleAddAbove = () => {
    const activeIdx = blocks.findIndex((b) => b.id === block.id);
    useModuleStore.getState().addBlock('rich-text', activeIdx);
    showToast('Created new rich text block above.', 'success');
  };

  const handleAddBelow = () => {
    const activeIdx = blocks.findIndex((b) => b.id === block.id);
    useModuleStore.getState().addBlock('rich-text', activeIdx + 1);
    showToast('Created new rich text block below.', 'success');
  };

  const handleDuplicate = () => {
    duplicateBlock(block.id);
    showToast('Block duplicated successfully.', 'success');
  };

  const handleDelete = () => {
    if (block.settings.isLocked) {
      showToast('Cannot delete a locked block!', 'error');
      return;
    }
    deleteBlock(block.id);
    showToast('Block deleted. Press Ctrl+Z to undo.', 'info');
  };

  const handleMoveUp = () => {
    moveBlock(block.id, 'up');
  };

  const handleMoveDown = () => {
    moveBlock(block.id, 'down');
  };

  const handleToggleLock = () => {
    const nextState = !block.settings.isLocked;
    updateBlockSettings(block.id, { isLocked: nextState });
    showToast(nextState ? 'Block locked. Editing disabled.' : 'Block unlocked.', 'info');
  };

  const handleToggleVisibility = () => {
    const nextState = !block.settings.isVisible;
    updateBlockSettings(block.id, { isVisible: nextState });
    showToast(nextState ? 'Block will be visible in preview.' : 'Block hidden in student preview.', 'info');
  };

  const handleToggleSettings = () => {
    setShowSettings(!showSettings);
  };

  // Keyboard navigation Alt+Up/Down (A12.1 Keyboard Navigation)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.altKey && e.key === 'ArrowUp') {
      e.preventDefault();
      handleMoveUp();
      showToast(`Moved block up to index`, 'info', 1000);
    } else if (e.altKey && e.key === 'ArrowDown') {
      e.preventDefault();
      handleMoveDown();
      showToast(`Moved block down to index`, 'info', 1000);
    } else if (e.ctrlKey && e.key === 'd') {
      e.preventDefault();
      handleDuplicate();
    } else if (e.ctrlKey && e.key === 'l') {
      e.preventDefault();
      handleToggleLock();
    } else if (e.ctrlKey && e.key === 'Backspace') {
      e.preventDefault();
      handleDelete();
    } else if (e.ctrlKey && e.key === '/') {
      e.preventDefault();
      handleToggleSettings();
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={dndStyle}
      onKeyDown={handleKeyDown}
      onClick={() => setSelectedBlockId(block.id)}
      tabIndex={0}
      className={`group relative p-4 border-2 rounded-2xl transition-all duration-300 transform outline-none ${
        isSelected 
          ? 'glow-border-selected -translate-y-0.5 scale-[1.01]' 
          : 'border-emerald-950/40 hover:border-emerald-900/60 bg-[#041208]/10 hover:bg-[#082210]/15'
      }`}
      role="group"
      aria-label={`${block.type} block, pos ${block.order + 1} of ${blocks.length}`}
    >
      {/* Visual locked and hidden overlays */}
      {block.settings.isLocked && (
        <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5 px-2 py-0.5 bg-amber-950/30 border border-amber-900/30 rounded text-amber-500 text-[10px] font-bold select-none uppercase font-mono">
          <Lock className="h-3 w-3" />
          <span>Locked</span>
        </div>
      )}

      {!block.settings.isVisible && (
        <div className="absolute top-2.5 right-20 z-20 flex items-center gap-1.5 px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-slate-400 text-[10px] font-bold select-none uppercase font-mono">
          <EyeOff className="h-3 w-3 text-rose-500" />
          <span>Hidden in Preview</span>
        </div>
      )}

      {/* Floating 10 actions toolbar */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="absolute left-1/2 -translate-x-1/2 -top-12 z-30 pointer-events-auto"
          >
            <FloatingToolbar
              block={block}
              onAddAbove={handleAddAbove}
              onAddBelow={handleAddBelow}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              onToggleLock={handleToggleLock}
              onToggleVisibility={handleToggleVisibility}
              onToggleSettings={handleToggleSettings}
              showSettings={showSettings}
              dragHandleListeners={attributes}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actual Block Renderer wrapped in localized component boundary */}
      <BlockErrorBoundary fallbackMessage={`Rendering block of type ${block.type} failed.`}>
        <div className={block.settings.isLocked ? 'pointer-events-none opacity-85' : ''}>
          {children}
        </div>
      </BlockErrorBoundary>

      {/* Advanced Settings expansion Panel */}
      <AnimatePresence>
        {showSettings && isSelected && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 22 }}
            className="mt-3 p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex flex-col gap-2 overflow-hidden"
          >
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Advanced Block Layout Settings
            </span>
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-bold text-slate-400">Custom CSS Rules</label>
              <input
                type="text"
                value={block.settings.customCss || ''}
                onChange={(e) => updateBlockSettings(block.id, { customCss: e.target.value })}
                placeholder="e.g. margin-top: 2rem; border-color: red;"
                className="px-2 py-1 text-xs font-mono bg-slate-950 border border-slate-800 rounded text-slate-300 outline-none select-text"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
