import React, { useState } from 'react';
import { CodeContent } from '../../types';
import { useModuleStore } from '../../store/useModuleStore';
import { Copy, Check, Terminal } from 'lucide-react';

interface CodeSnippetBlockProps {
  id: string;
  content: CodeContent;
  isLocked: boolean;
  isPreview?: boolean;
}

export const CodeSnippetBlock: React.FC<CodeSnippetBlockProps> = ({
  id,
  content,
  isLocked,
  isPreview = false,
}) => {
  const updateBlockContent = useModuleStore((state) => state.updateBlockContent);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code snippet:', err);
    }
  };

  const languages = ['javascript', 'python', 'json', 'sql'] as const;

  if (isPreview) {
    return (
      <div 
        className="w-full bg-[#030a06]/40 border border-[#082212]/80 rounded-xl overflow-hidden shadow-xl select-text"
        role="region"
        aria-label={`Code Snippet in ${content.language}`}
      >
        <div className="flex items-center justify-between px-4 py-2 bg-[#020805]/90 border-b border-emerald-950 select-none">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 font-mono">
            <Terminal className="h-3.5 w-3.5 text-[#d4af37]" />
            <span>{content.language}</span>
          </div>
          <button
            onClick={handleCopy}
            className="p-1 text-emerald-500 hover:text-[#d4af37] rounded hover:bg-[#030e07] transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#d4af37]"
            title="Copy Code"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-[#10b981]" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
        <pre className="p-4 overflow-x-auto text-xs text-emerald-300 font-mono leading-relaxed max-w-full">
          <code>{content.code}</code>
        </pre>
      </div>
    );
  }

  return (
    <div className={`w-full bg-[#030a06]/40 border border-[#082212]/80 rounded-xl overflow-hidden shadow-lg select-none ${isLocked ? 'opacity-80' : ''}`}>
      <div className="flex items-center justify-between px-4 py-2 bg-[#020805]/90 border-b border-emerald-950 select-none">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 font-mono">
          <Terminal className="h-3.5 w-3.5 text-[#d4af37]" />
          {!isLocked ? (
            <select
              value={content.language}
              onChange={(e) => updateBlockContent(id, { language: e.target.value as any })}
              className="bg-transparent border-none outline-none text-[#d4af37] font-bold focus:ring-0 focus:outline-none py-0 select-none cursor-pointer"
            >
              {languages.map((lang) => (
                <option key={lang} value={lang} className="bg-[#020805] text-[#d4af37] font-semibold">
                  {lang}
                </option>
              ))}
            </select>
          ) : (
            <span className="capitalize">{content.language}</span>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="p-1 text-emerald-500 hover:text-[#d4af37] rounded hover:bg-[#030e07] transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#d4af37]"
          title="Copy Code"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-[#10b981]" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
      
      <div className="p-4 flex font-mono text-xs">
        {/* Simple mock line numbers */}
        <div className="text-emerald-900 text-right pr-3 border-r border-[#082212]/80 mr-3 select-none leading-relaxed flex flex-col items-end">
          {content.code.split('\n').map((_, index) => (
            <span key={index}>{index + 1}</span>
          ))}
        </div>

        <textarea
          value={content.code}
          onChange={(e) => updateBlockContent(id, { code: e.target.value })}
          disabled={isLocked}
          placeholder="// Paste or write algorithm here..."
          className="w-full text-emerald-300 bg-transparent border-none outline-none resize-none focus:ring-0 focus:outline-none leading-relaxed font-mono select-text"
          rows={Math.max(4, content.code.split('\n').length)}
        />
      </div>
    </div>
  );
};
