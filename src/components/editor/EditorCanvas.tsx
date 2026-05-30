import React, { useState, useEffect } from 'react';
import { useModuleStore } from '../../store/useModuleStore';
import { useToastStore } from '../../store/useToastStore';
import { BlockWrapper } from './BlockWrapper';
import { SlashCommandMenu } from './SlashCommandMenu';
import { BlockType, Block } from '../../types';
import { 
  DndContext, closestCenter, KeyboardSensor, 
  PointerSensor, useSensor, useSensors, DragEndEvent 
} from '@dnd-kit/core';
import { 
  arrayMove, SortableContext, sortableKeyboardCoordinates, 
  verticalListSortingStrategy 
} from '@dnd-kit/sortable';
import { 
  FileEdit, BookOpen, AlertCircle, HelpCircle, 
  FolderPlus, PlusCircle, Hammer 
} from 'lucide-react';

// Import all block components
import { RichTextBlock } from '../blocks/RichTextBlock';
import { ImageBlock } from '../blocks/ImageBlock';
import { VideoBlock } from '../blocks/VideoBlock';
import { QuizMcqBlock } from '../blocks/QuizMcqBlock';
import { QuizTfBlock } from '../blocks/QuizTfBlock';
import { EmiCalculator } from '../blocks/EmiCalculator';
import { SipCalculator } from '../blocks/SipCalculator';
import { CompoundInterest } from '../blocks/CompoundInterest';
import { CalloutBlock } from '../blocks/CalloutBlock';
import { DividerBlock } from '../blocks/DividerBlock';
import { AccordionBlock } from '../blocks/AccordionBlock';
import { ProgressTracker } from '../blocks/ProgressTracker';
import { AchievementBadge } from '../blocks/AchievementBadge';
import { CodeSnippetBlock } from '../blocks/CodeSnippetBlock';
import { ConceptExplainer } from '../blocks/ConceptExplainer';

export const EditorCanvas: React.FC = () => {
  const { 
    blocks, title, description, reorderBlocks, addBlock, 
    setModule, selectedBlockId, setSelectedBlockId 
  } = useModuleStore();

  const { showToast } = useToastStore();

  // Slash Command Trigger state
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashMenuPos, setSlashMenuPos] = useState<{ top: number; left: number } | null>(null);

  // Set up sensors for Drag-and-Drop (dnd-kit)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Triggers drag after dragging 8px to prevent click conflicts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);

      const reordered = arrayMove(blocks, oldIndex, newIndex);
      reorderBlocks(reordered);
      showToast('Blocks reordered successfully.', 'success', 1500);
    }
  };

  // Keyboard shortcut listener for slash command '/' (A6.3)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !showSlashMenu) {
        // Only trigger if typing at the beginning of an empty block or focused canvas
        const activeEl = document.activeElement;
        const isInput = activeEl?.tagName === 'INPUT' || activeEl?.tagName === 'TEXTAREA' || activeEl?.classList.contains('ProseMirror');
        
        if (!isInput || (activeEl?.textContent === '' || activeEl?.textContent === '/')) {
          e.preventDefault();
          
          // Calculate approximate coordinates for the popup
          const rect = activeEl?.getBoundingClientRect();
          if (rect) {
            setSlashMenuPos({
              top: rect.top + window.scrollY + rect.height + 8,
              left: Math.min(rect.left + window.scrollX, window.innerWidth - 340),
            });
          } else {
            setSlashMenuPos(null);
          }
          setShowSlashMenu(true);
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [showSlashMenu]);

  const handleSlashMenuSelect = (type: BlockType) => {
    // If a block is currently selected, insert immediately below it. Otherwise append.
    const selectedIdx = blocks.findIndex((b) => b.id === selectedBlockId);
    if (selectedIdx !== -1) {
      addBlock(type, selectedIdx + 1);
    } else {
      addBlock(type);
    }
    setShowSlashMenu(false);
  };

  // Renders the specific interactive block component by type (A5.1)
  const renderBlockContent = (block: Block) => {
    const isLocked = block.settings.isLocked;
    switch (block.type) {
      case 'rich-text':
        return <RichTextBlock id={block.id} content={block.content} isLocked={isLocked} />;
      case 'image':
        return <ImageBlock id={block.id} content={block.content} isLocked={isLocked} />;
      case 'video':
        return <VideoBlock id={block.id} content={block.content} isLocked={isLocked} />;
      case 'quiz-mcq':
        return <QuizMcqBlock id={block.id} content={block.content} isLocked={isLocked} />;
      case 'quiz-tf':
        return <QuizTfBlock id={block.id} content={block.content} isLocked={isLocked} />;
      case 'emi-calc':
        return <EmiCalculator id={block.id} content={block.content} isLocked={isLocked} />;
      case 'sip-calc':
        return <SipCalculator id={block.id} content={block.content} isLocked={isLocked} />;
      case 'compound-calc':
        return <CompoundInterest id={block.id} content={block.content} isLocked={isLocked} />;
      case 'callout':
        return <CalloutBlock id={block.id} content={block.content} isLocked={isLocked} />;
      case 'divider':
        return <DividerBlock id={block.id} content={block.content} isLocked={isLocked} />;
      case 'accordion':
        return <AccordionBlock id={block.id} content={block.content} isLocked={isLocked} />;
      case 'progress':
        return <ProgressTracker id={block.id} content={block.content} isLocked={isLocked} />;
      case 'badge':
        return <AchievementBadge id={block.id} content={block.content} isLocked={isLocked} />;
      case 'code':
        return <CodeSnippetBlock id={block.id} content={block.content} isLocked={isLocked} />;
      case 'explainer':
        return <ConceptExplainer id={block.id} content={block.content} isLocked={isLocked} />;
      default:
        return (
          <div className="p-4 bg-slate-900 border border-slate-800 text-slate-500 rounded-xl flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>Undefined Block Type Loader</span>
          </div>
        );
    }
  };

  return (
    <div 
      className="flex flex-col gap-6 w-full h-full p-6 select-none"
      role="application"
      aria-label="Module Canvas Editor Workspace"
    >
      {/* Module Meta Headers */}
      <div className="flex flex-col gap-2.5 border-b border-emerald-950/30 pb-5">
        <div className="flex flex-col select-text p-5 rounded-2xl border border-emerald-950/45 bg-[#041208]/30 backdrop-blur-md shadow-lg border-l-4 border-l-[#d4af37]">
          <input
            type="text"
            value={title}
            onChange={(e) => setModule({ title: e.target.value })}
            placeholder="Untitled Financial Module"
            className="w-full text-xl font-extrabold text-white bg-transparent border-none outline-none font-display focus:ring-0 focus:outline-none p-0 placeholder-emerald-300/30"
            aria-label="Module Title Input"
          />
          <textarea
            value={description}
            onChange={(e) => setModule({ description: e.target.value })}
            placeholder="Enter a descriptive summary explaining what students will learn in this course..."
            className="w-full text-xs text-emerald-300/50 bg-transparent border-none outline-none resize-none font-semibold mt-2 focus:ring-0 focus:outline-none p-0 placeholder-emerald-300/20"
            rows={2}
            aria-label="Module Description Input"
          />
        </div>
      </div>

      {/* Empty State Canvas illustration (A10.3) */}
      {blocks.length === 0 ? (
        <div 
          className="flex-grow flex flex-col items-center justify-center gap-4 py-20 border border-dashed border-emerald-900/30 rounded-2xl bg-[#041208]/20 select-none text-center px-4"
          role="region"
          aria-label="Empty editor canvas state"
        >
          <div className="p-4 rounded-full bg-emerald-950/40 border border-emerald-900/30 text-[#d4af37]">
            <Hammer className="h-7 w-7 animate-bounce" />
          </div>
          <div className="flex flex-col gap-1 max-w-[280px]">
            <h4 className="font-extrabold text-sm text-[#f1f5f9] font-display">
              Assemble your Self-Service Module
            </h4>
            <p className="text-[10px] text-emerald-300/45 leading-relaxed font-semibold">
              Use the sidebar to add layouts, or type <kbd className="font-mono bg-slate-900 border border-slate-850 px-1 py-0.5 rounded text-[#d4af37]/60">/</kbd> to search block lists in real time.
            </p>
          </div>
          <button
            onClick={() => addBlock('rich-text')}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#d4af37] to-[#10b981] hover:from-[#e5c158] hover:to-[#0d9f6e] border border-[#d4af37]/20 text-black font-extrabold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
          >
            <PlusCircle className="h-4 w-4 text-black" />
            <span className="text-black">Create First Block</span>
          </button>
        </div>
      ) : (
        /* Drag-and-drop Sortable Context wrapping standard block stack */
        <DndContext 
          sensors={sensors} 
          collisionDetection={closestCenter} 
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={blocks.map((b) => b.id)} 
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-5 pr-1">
              {blocks.map((block) => (
                <BlockWrapper key={block.id} block={block}>
                  {renderBlockContent(block)}
                </BlockWrapper>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Slash command menu pop-up combobox */}
      {showSlashMenu && (
        <SlashCommandMenu
          onSelect={handleSlashMenuSelect}
          onClose={() => setShowSlashMenu(false)}
          triggerPosition={slashMenuPos}
        />
      )}
    </div>
  );
};
