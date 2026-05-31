import { create } from 'zustand';
import { Block, BlockSettings, BlockType, Module, ModuleMetadata, QuizConfig } from '../types';
import { BLOCK_REGISTRY } from '../components/blocks/registry';

// Helper to deeply clone objects
const clone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

interface ModuleStoreState {
  // Current active module data
  moduleId: string;
  title: string;
  description: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
  };
  metadata: ModuleMetadata;
  blocks: Block[];
  quizConfig: QuizConfig;

  // Selection state
  selectedBlockId: string | null;

  // History stacks (max 50)
  past: Omit<Module, 'past' | 'future'>[];
  future: Omit<Module, 'past' | 'future'>[];

  // Core Actions
  setModule: (module: Partial<Module>) => void;
  updateMetadata: (metadata: Partial<ModuleMetadata>) => void;
  updateQuizConfig: (config: Partial<QuizConfig>) => void;

  // Block Mutations
  addBlock: (type: BlockType, index?: number) => void;
  updateBlockContent: (id: string, content: any, skipHistory?: boolean) => void;
  updateBlockSettings: (id: string, settings: Partial<BlockSettings>) => void;
  deleteBlock: (id: string) => void;
  duplicateBlock: (id: string) => void;
  moveBlock: (id: string, direction: 'up' | 'down') => void;
  reorderBlocks: (blocks: Block[]) => void;
  setSelectedBlockId: (id: string | null) => void;

  // Authentication State (smart feature limiting)
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;

  // History operations
  saveToHistory: () => void;
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;
}

const DEFAULT_MODULE = {
  moduleId: 'eduforge-module-default',
  title: 'Introduction to Compound Interest & Savings',
  description: 'Learn the fundamentals of compound interest, EMI calculations, and systematic savings to build robust wealth.',
  version: '1.0.0',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  author: {
    id: 'author-default',
    name: 'Senior Finance Instructor',
  },
  metadata: {
    estimatedDuration: 15,
    difficulty: 'beginner' as const,
    tags: ['savings', 'compounding', 'emi', 'sip'],
    thumbnail: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80',
  },
  blocks: [
    {
      id: 'block-rich-text-intro',
      type: 'rich-text' as const,
      order: 0,
      content: {
        html: '<h2>Welcome to Financial Literacy 101</h2><p>Understanding compound interest is the first major step toward financial independence. In this module, we will explore compound interest, calculate loan payments using an <strong>EMI calculator</strong>, and visualize systematic plans with a <strong>SIP calculator</strong>.</p>',
      },
      settings: { isVisible: true, isLocked: false },
    },
    {
      id: 'block-callout-tip',
      type: 'callout' as const,
      order: 1,
      content: {
        type: 'tip',
        content: 'Rule of 72 Tip: Divide 72 by your expected annual interest rate. The result is the approximate number of years it will take for your money to double under compounding!',
      },
      settings: { isVisible: true, isLocked: false },
    },
  ],
  quizConfig: {
    feedbackMode: 'immediate' as const,
    passingScore: 70,
    showScoreOnCompletion: true,
  },
};

const DRAFT_KEY = 'eduforge-module-draft-backup';

const getInitialModule = () => {
  if (typeof window !== 'undefined') {
    try {
      const backup = localStorage.getItem(DRAFT_KEY);
      if (backup) {
        const parsed = JSON.parse(backup);
        if (parsed && parsed.title && Array.isArray(parsed.blocks)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse draft backup:', e);
    }
  }
  return DEFAULT_MODULE;
};

export const useModuleStore = create<ModuleStoreState>((set, get) => {
  // Helper to extract the serializable module snapshot
  const getSnapshot = (): Omit<Module, 'past' | 'future'> => {
    const state = get();
    return {
      moduleId: state.moduleId,
      title: state.title,
      description: state.description,
      version: state.version,
      createdAt: state.createdAt,
      updatedAt: state.updatedAt,
      author: clone(state.author),
      metadata: clone(state.metadata),
      blocks: clone(state.blocks),
      quizConfig: clone(state.quizConfig),
    };
  };

  // Helper to save auto-save draft backup
  const saveDraftBackup = (snapshot: any) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(snapshot));
      } catch (e) {
        console.error('Failed to write draft backup:', e);
      }
    }
  };

  return {
    ...getInitialModule(),
    selectedBlockId: null,
    past: [],
    future: [],

    isAuthenticated: false,
    setIsAuthenticated: (auth) => set({ isAuthenticated: auth }),

    showLoginModal: false,
    setShowLoginModal: (show) => set({ showLoginModal: show }),

    saveToHistory: () => {
      const snapshot = getSnapshot();
      const past = clone(get().past);
      
      // Enforce circular buffer of max 50 entries
      if (past.length >= 50) {
        past.shift();
      }
      past.push(snapshot);

      // Auto-save backup draft for recovery
      saveDraftBackup(snapshot);

      set({
        past,
        future: [], // Branch pruning on new changes
        updatedAt: new Date().toISOString(),
      });
    },

    setModule: (moduleData) => {
      get().saveToHistory();
      set({
        ...moduleData,
        updatedAt: new Date().toISOString(),
      });
    },

    updateMetadata: (newMetadata) => {
      get().saveToHistory();
      set((state) => ({
        metadata: { ...state.metadata, ...newMetadata },
        updatedAt: new Date().toISOString(),
      }));
    },

    updateQuizConfig: (newConfig) => {
      get().saveToHistory();
      set((state) => ({
        quizConfig: { ...state.quizConfig, ...newConfig },
        updatedAt: new Date().toISOString(),
      }));
    },

    setSelectedBlockId: (id) => {
      set({ selectedBlockId: id });
    },

    addBlock: (type, index) => {
      get().saveToHistory();
      
      const newBlock: Block = {
        id: crypto.randomUUID(),
        type,
        order: get().blocks.length,
        content: clone(BLOCK_REGISTRY[type].defaultContent),
        settings: {
          isVisible: true,
          isLocked: false,
        },
      };

      set((state) => {
        const blocks = [...state.blocks];
        if (typeof index === 'number') {
          blocks.splice(index, 0, newBlock);
        } else {
          blocks.push(newBlock);
        }

        // Re-assign correct orders
        const reordered = blocks.map((block, idx) => ({ ...block, order: idx }));
        return {
          blocks: reordered,
          selectedBlockId: newBlock.id,
        };
      });
    },

    updateBlockContent: (id, newContent, skipHistory = false) => {
      if (!skipHistory) {
        get().saveToHistory();
      }

      set((state) => ({
        blocks: state.blocks.map((b) => {
          if (b.id !== id) return b;
          if (b.settings.isLocked) return b; // Locked block rejection
          return { ...b, content: { ...b.content, ...newContent } };
        }),
      }));
    },

    updateBlockSettings: (id, newSettings) => {
      get().saveToHistory();
      set((state) => ({
        blocks: state.blocks.map((b) => {
          if (b.id !== id) return b;
          return { ...b, settings: { ...b.settings, ...newSettings } };
        }),
      }));
    },

    deleteBlock: (id) => {
      const block = get().blocks.find((b) => b.id === id);
      if (block?.settings.isLocked) return; // Prevent deletion of locked blocks

      get().saveToHistory();

      set((state) => {
        const remaining = state.blocks.filter((b) => b.id !== id);
        const reordered = remaining.map((b, idx) => ({ ...b, order: idx }));
        return {
          blocks: reordered,
          selectedBlockId: state.selectedBlockId === id ? null : state.selectedBlockId,
        };
      });
    },

    duplicateBlock: (id) => {
      const blockIndex = get().blocks.findIndex((b) => b.id === id);
      if (blockIndex === -1) return;
      const sourceBlock = get().blocks[blockIndex];

      get().saveToHistory();

      const duplicated: Block = {
        id: crypto.randomUUID(),
        type: sourceBlock.type,
        order: blockIndex + 1,
        content: clone(sourceBlock.content),
        settings: {
          isVisible: sourceBlock.settings.isVisible,
          isLocked: false, // Duplicated blocks start unlocked
        },
      };

      set((state) => {
        const blocks = [...state.blocks];
        blocks.splice(blockIndex + 1, 0, duplicated);
        const reordered = blocks.map((b, idx) => ({ ...b, order: idx }));
        return {
          blocks: reordered,
          selectedBlockId: duplicated.id,
        };
      });
    },

    moveBlock: (id, direction) => {
      const idx = get().blocks.findIndex((b) => b.id === id);
      if (idx === -1) return;
      if (direction === 'up' && idx === 0) return;
      if (direction === 'down' && idx === get().blocks.length - 1) return;

      get().saveToHistory();

      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;

      set((state) => {
        const blocks = [...state.blocks];
        const temp = blocks[idx];
        blocks[idx] = blocks[targetIdx];
        blocks[targetIdx] = temp;

        const reordered = blocks.map((b, i) => ({ ...b, order: i }));
        return { blocks: reordered };
      });
    },

    reorderBlocks: (newBlocks) => {
      get().saveToHistory();
      set({
        blocks: newBlocks.map((b, i) => ({ ...b, order: i })),
      });
    },

    undo: () => {
      const past = [...get().past];
      if (past.length === 0) return;

      const previous = past.pop()!;
      const current = getSnapshot();

      set((state) => ({
        ...previous,
        past,
        future: [current, ...state.future],
      }));
    },

    redo: () => {
      const future = [...get().future];
      if (future.length === 0) return;

      const next = future.shift()!;
      const current = getSnapshot();

      set((state) => ({
        ...next,
        past: [...state.past, current],
        future,
      }));
    },

    clearHistory: () => {
      set({ past: [], future: [] });
    },
  };
});
