import { describe, it, expect, beforeEach } from 'vitest';
import { useModuleStore } from './useModuleStore';

describe('Zustand useModuleStore Unit Tests', () => {
  beforeEach(() => {
    // Reset store state before each test
    const store = useModuleStore.getState();
    store.clearHistory();
    useModuleStore.setState({
      moduleId: 'test-module',
      title: 'Test Title',
      description: 'Test Description',
      blocks: [],
    });
  });

  it('should initialize with default states', () => {
    const state = useModuleStore.getState();
    expect(state.title).toBe('Test Title');
    expect(state.blocks.length).toBe(0);
  });

  it('should add a block to the end of the canvas', () => {
    const store = useModuleStore.getState();
    store.addBlock('rich-text');
    
    const updated = useModuleStore.getState();
    expect(updated.blocks.length).toBe(1);
    expect(updated.blocks[0].type).toBe('rich-text');
    expect(updated.blocks[0].order).toBe(0);
  });

  it('should insert a block at a specific index', () => {
    const store = useModuleStore.getState();
    store.addBlock('rich-text'); // Index 0
    store.addBlock('callout');   // Index 1
    store.addBlock('divider', 1); // Insert divider at index 1

    const updated = useModuleStore.getState();
    expect(updated.blocks.length).toBe(3);
    expect(updated.blocks[1].type).toBe('divider');
    expect(updated.blocks[1].order).toBe(1);
    expect(updated.blocks[2].type).toBe('callout');
    expect(updated.blocks[2].order).toBe(2);
  });

  it('should reject content updates on locked blocks', () => {
    const store = useModuleStore.getState();
    store.addBlock('rich-text');
    const blockId = useModuleStore.getState().blocks[0].id;

    // Lock the block
    store.updateBlockSettings(blockId, { isLocked: true });

    // Try to update content
    store.updateBlockContent(blockId, { html: '<p>Hacked</p>' });

    const updated = useModuleStore.getState();
    // Content should remain the default block content, not the hacked HTML
    expect(updated.blocks[0].content.html).not.toBe('<p>Hacked</p>');
  });

  it('should duplicate a block directly below the source', () => {
    const store = useModuleStore.getState();
    store.addBlock('rich-text');
    store.addBlock('callout');
    const richTextBlockId = useModuleStore.getState().blocks[0].id;

    store.duplicateBlock(richTextBlockId);

    const updated = useModuleStore.getState();
    expect(updated.blocks.length).toBe(3);
    expect(updated.blocks[1].type).toBe('rich-text'); // Duplicated block
    expect(updated.blocks[1].id).not.toBe(richTextBlockId); // Receives new UUID (IM-005)
    expect(updated.blocks[2].type).toBe('callout');
  });

  it('should move blocks up or down to reorder', () => {
    const store = useModuleStore.getState();
    store.addBlock('rich-text'); // 0
    store.addBlock('callout');   // 1
    const calloutId = useModuleStore.getState().blocks[1].id;

    // Move callout up
    store.moveBlock(calloutId, 'up');

    const updated = useModuleStore.getState();
    expect(updated.blocks[0].type).toBe('callout');
    expect(updated.blocks[1].type).toBe('rich-text');
  });

  describe('Undo/Redo History System', () => {
    it('should push snapshots to past stack on mutations and undo them', () => {
      const store = useModuleStore.getState();
      store.addBlock('rich-text'); // 1st state mutation
      expect(useModuleStore.getState().past.length).toBe(1);

      store.addBlock('callout');   // 2nd state mutation
      expect(useModuleStore.getState().past.length).toBe(2);

      // Undo last action (removes callout block)
      store.undo();
      
      const undone = useModuleStore.getState();
      expect(undone.blocks.length).toBe(1);
      expect(undone.blocks[0].type).toBe('rich-text');
      expect(undone.past.length).toBe(1);
      expect(undone.future.length).toBe(1); // callout state stored in future
    });

    it('should redo an undone action', () => {
      const store = useModuleStore.getState();
      store.addBlock('rich-text');
      const richTextId = useModuleStore.getState().blocks[0].id;
      
      // Mutate content
      store.updateBlockContent(richTextId, { html: '<p>Version 2</p>' });
      
      // Undo the content update
      store.undo();
      expect(useModuleStore.getState().blocks[0].content.html).not.toBe('<p>Version 2</p>');

      // Redo the content update
      store.redo();
      expect(useModuleStore.getState().blocks[0].content.html).toBe('<p>Version 2</p>');
    });

    it('should enforce circular buffer limit of 50', () => {
      const store = useModuleStore.getState();
      
      // Trigger 55 state changes
      for (let i = 0; i < 55; i++) {
        store.addBlock('divider');
      }

      const updated = useModuleStore.getState();
      expect(updated.past.length).toBe(50); // Older elements are pruned correctly (UR-003)
    });

    it('should prune future branches when new mutation occurs after undo', () => {
      const store = useModuleStore.getState();
      store.addBlock('rich-text'); // past: 1
      store.addBlock('callout');   // past: 2
      
      // Undo
      store.undo(); // past: 1, future: 1
      expect(useModuleStore.getState().future.length).toBe(1);

      // Mutate new block instead of redo (Branch Pruning UR-004)
      store.addBlock('divider'); // past: 2, future: 0
      
      const pruned = useModuleStore.getState();
      expect(pruned.future.length).toBe(0);
    });
  });
});
