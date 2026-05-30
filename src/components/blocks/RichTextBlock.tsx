import React, { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { useModuleStore } from '../../store/useModuleStore';
import { RichTextContent } from '../../types';
import { 
  Bold, Italic, Strikethrough, Heading1, Heading2, Heading3, 
  List, ListOrdered, Quote, Link2, Unlink, Code 
} from 'lucide-react';

interface RichTextBlockProps {
  id: string;
  content: RichTextContent;
  isLocked: boolean;
  isPreview?: boolean;
}

export const RichTextBlock: React.FC<RichTextBlockProps> = ({
  id,
  content,
  isLocked,
  isPreview = false,
}) => {
  const updateBlockContent = useModuleStore((state) => state.updateBlockContent);
  const isUpdatingFromStore = useRef(false);
  const debounceTimer = useRef<any | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: true,
        autolink: true,
      }),
    ],
    content: content.html,
    editable: !isLocked && !isPreview,
    onUpdate: ({ editor }) => {
      if (isUpdatingFromStore.current) return;

      const html = editor.getHTML();
      
      // Real-time reactive preview (skipping undo stack commits)
      updateBlockContent(id, { html }, true);

      // Debounce the history-commit state update (UR-005 / UR-009)
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      debounceTimer.current = setTimeout(() => {
        // Commit the change to the actual Undo/Redo stack
        updateBlockContent(id, { html }, false);
      }, 800);
    },
  });

  // Synchronize store updates back to Editor (e.g. on Undo/Redo)
  useEffect(() => {
    if (editor && content.html !== editor.getHTML()) {
      isUpdatingFromStore.current = true;
      editor.commands.setContent(content.html);
      isUpdatingFromStore.current = false;
    }
  }, [content.html, editor]);

  // Sync edit mode locks
  useEffect(() => {
    if (editor) {
      editor.setEditable(!isLocked && !isPreview);
    }
  }, [isLocked, isPreview, editor]);

  // Clean up debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  if (isPreview) {
    return (
      <div 
        className="w-full text-slate-350 leading-relaxed text-base ProseMirror select-text"
        dangerouslySetInnerHTML={{ __html: content.html }}
      />
    );
  }

  if (!editor) return <div className="h-20 animate-pulse bg-[#030e07] rounded-lg" />;

  const addLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL:', previousUrl);
    
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const toolbarBtnClass = "p-1.5 rounded-lg text-emerald-500 hover:text-[#d4af37] hover:bg-[#030e07]/65 transition-all duration-200 cursor-pointer focus:outline-none";
  const activeToolbarBtnClass = "p-1.5 rounded-lg text-[#d4af37] bg-[#d4af37]/10 border border-[#d4af37]/25 shadow-[0_0_10px_rgba(212,175,55,0.15)]";

  return (
    <div className="w-full border border-emerald-950/40 bg-[#030a06]/15 rounded-2xl overflow-hidden focus-within:border-[#d4af37]/50 shadow-inner focus-within:shadow-[0_0_20px_rgba(212,175,55,0.05)] transition-all select-none">
      {/* Editor Top Toolbar */}
      {!isLocked && (
        <div className="flex flex-wrap items-center gap-1.5 px-3.5 py-2 bg-[#020805]/75 backdrop-blur-md border-b border-emerald-950/30">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? activeToolbarBtnClass : toolbarBtnClass}
            title="Bold (Ctrl+B)"
          >
            <Bold className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? activeToolbarBtnClass : toolbarBtnClass}
            title="Italic (Ctrl+I)"
          >
            <Italic className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={editor.isActive('strike') ? activeToolbarBtnClass : toolbarBtnClass}
            title="Strike"
          >
            <Strikethrough className="h-3.5 w-3.5" />
          </button>

          <div className="h-4 w-[1px] bg-[#082212] mx-1" />

          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={editor.isActive('heading', { level: 1 }) ? activeToolbarBtnClass : toolbarBtnClass}
            title="H1"
          >
            <Heading1 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={editor.isActive('heading', { level: 2 }) ? activeToolbarBtnClass : toolbarBtnClass}
            title="H2"
          >
            <Heading2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={editor.isActive('heading', { level: 3 }) ? activeToolbarBtnClass : toolbarBtnClass}
            title="H3"
          >
            <Heading3 className="h-3.5 w-3.5" />
          </button>

          <div className="h-4 w-[1px] bg-[#082212] mx-1" />

          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? activeToolbarBtnClass : toolbarBtnClass}
            title="Unordered List"
          >
            <List className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive('orderedList') ? activeToolbarBtnClass : toolbarBtnClass}
            title="Ordered List"
          >
            <ListOrdered className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={editor.isActive('blockquote') ? activeToolbarBtnClass : toolbarBtnClass}
            title="Quote"
          >
            <Quote className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={editor.isActive('code') ? activeToolbarBtnClass : toolbarBtnClass}
            title="Inline Code"
          >
            <Code className="h-3.5 w-3.5" />
          </button>

          <div className="h-4 w-[1px] bg-[#082212] mx-1" />

          <button
            onClick={addLink}
            className={editor.isActive('link') ? activeToolbarBtnClass : toolbarBtnClass}
            title="Add Link"
          >
            <Link2 className="h-3.5 w-3.5" />
          </button>
          {editor.isActive('link') && (
            <button
              onClick={() => editor.chain().focus().unsetLink().run()}
              className={toolbarBtnClass}
              title="Remove Link"
            >
              <Unlink className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Editor Typing Canvas */}
      <div className={`p-4 px-5 text-slate-250 ${isLocked ? 'opacity-70 bg-emerald-950/5' : ''}`}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};
