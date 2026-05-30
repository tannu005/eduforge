import React from 'react';
import { 
  Plus, Copy, Trash2, ChevronUp, ChevronDown, 
  Lock, Unlock, Settings, Eye, EyeOff, GripVertical 
} from 'lucide-react';
import { Block, BlockSettings } from '../../types';

interface FloatingToolbarProps {
  block: Block;
  onAddAbove: () => void;
  onAddBelow: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggleLock: () => void;
  onToggleVisibility: () => void;
  onToggleSettings: () => void;
  showSettings: boolean;
  dragHandleListeners?: any;
}

export const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  block,
  onAddAbove,
  onAddBelow,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onToggleLock,
  onToggleVisibility,
  onToggleSettings,
  showSettings,
  dragHandleListeners,
}) => {
  const isLocked = block.settings.isLocked;
  const isVisible = block.settings.isVisible;

  const buttonClass = "p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none focus:ring-1 focus:ring-[#d4af37] cursor-pointer flex items-center justify-center";

  return (
    <div 
      className="absolute -top-10 left-2 z-30 flex items-center gap-1.5 px-2 py-1 border border-emerald-950 bg-[#041208]/90 shadow-xl rounded-lg select-none backdrop-blur-md"
      role="toolbar"
      aria-label="Block editing actions"
      onClick={(e) => e.stopPropagation()}
    >
      {/* 1. Drag Handle */}
      <div 
        {...dragHandleListeners}
        className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 cursor-grab active:cursor-grabbing flex items-center justify-center"
        title="Drag to Reorder (Alt+Up/Down)"
        role="button"
        aria-label="Drag block handle"
      >
        <GripVertical className="h-3.5 w-3.5" />
      </div>

      <div className="h-4 w-[1px] bg-slate-800" />

      {/* 2. Add above */}
      <button
        onClick={onAddAbove}
        className={buttonClass}
        title="Add Block Above (Ctrl+Shift+Enter)"
        aria-label="Add block above"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>

      {/* 3. Add below */}
      <button
        onClick={onAddBelow}
        className={buttonClass}
        title="Add Block Below (Ctrl+Enter)"
        aria-label="Add block below"
      >
        <div className="relative">
          <Plus className="h-3.5 w-3.5" />
          <div className="absolute -bottom-1 -right-1 w-1.5 h-1.5 bg-[#d4af37] rounded-full" />
        </div>
      </button>

      {/* 4. Duplicate */}
      <button
        onClick={onDuplicate}
        className={buttonClass}
        title="Duplicate Block (Ctrl+D)"
        aria-label="Duplicate block"
      >
        <Copy className="h-3.5 w-3.5" />
      </button>

      {/* 5. Move Up */}
      <button
        onClick={onMoveUp}
        className={buttonClass}
        title="Move Block Up (Alt+Up)"
        aria-label="Move block up"
      >
        <ChevronUp className="h-3.5 w-3.5" />
      </button>

      {/* 6. Move Down */}
      <button
        onClick={onMoveDown}
        className={buttonClass}
        title="Move Block Down (Alt+Down)"
        aria-label="Move block down"
      >
        <ChevronDown className="h-3.5 w-3.5" />
      </button>

      {/* 7. Lock / Unlock */}
      <button
        onClick={onToggleLock}
        className={`${buttonClass} ${isLocked ? 'text-amber-400 hover:text-amber-300' : ''}`}
        title={isLocked ? 'Unlock Block (Ctrl+L)' : 'Lock Block (Ctrl+L)'}
        aria-label={isLocked ? 'Unlock block' : 'Lock block'}
      >
        {isLocked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
      </button>

      {/* 8. Visibility */}
      <button
        onClick={onToggleVisibility}
        className={`${buttonClass} ${!isVisible ? 'text-rose-400 hover:text-rose-300' : ''}`}
        title={isVisible ? 'Hide Block in Preview (Ctrl+Shift+H)' : 'Show Block in Preview (Ctrl+Shift+H)'}
        aria-label={isVisible ? 'Hide block in preview' : 'Show block in preview'}
      >
        {isVisible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
      </button>

      {/* 9. Settings */}
      <button
        onClick={onToggleSettings}
        className={`${buttonClass} ${showSettings ? 'text-[#d4af37] hover:text-[#e5c158]' : ''}`}
        title="Advanced Settings (Ctrl+/)"
        aria-label="Toggle block advanced settings"
      >
        <Settings className="h-3.5 w-3.5" />
      </button>

      <div className="h-4 w-[1px] bg-slate-800" />

      {/* 10. Delete */}
      <button
        onClick={onDelete}
        className={`${buttonClass} text-rose-500 hover:text-rose-400 hover:bg-rose-950/30`}
        disabled={isLocked}
        title={isLocked ? 'Cannot delete locked block' : 'Delete Block (Ctrl+Backspace)'}
        aria-label="Delete block"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};
