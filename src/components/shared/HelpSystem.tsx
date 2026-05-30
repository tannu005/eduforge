import React, { useState } from 'react';
import { HelpCircle, X, Keyboard, ArrowRight, ArrowLeft } from 'lucide-react';

interface HelpSystemProps {
  onStartTour?: () => void;
}

export const HelpSystem: React.FC<HelpSystemProps> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  const keyboardShortcuts = [
    { keys: 'Ctrl + Z', desc: 'Undo the last action' },
    { keys: 'Ctrl + Shift + Z / Ctrl + Y', desc: 'Redo the last undone action' },
    { keys: 'Alt + Up Arrow', desc: 'Move active block one slot up' },
    { keys: 'Alt + Down Arrow', desc: 'Move active block one slot down' },
    { keys: 'Ctrl + D', desc: 'Duplicate selected block' },
    { keys: 'Ctrl + Backspace', desc: 'Delete selected block' },
    { keys: 'Ctrl + L', desc: 'Lock / unlock selected block' },
    { keys: 'Ctrl + Shift + H', desc: 'Toggle visibility of selected block' },
    { keys: 'Ctrl + /', desc: 'Open advanced layout settings' },
    { keys: '/', desc: 'Trigger slash command menu in text blocks' },
  ];

  const tourSteps = [
    {
      title: 'Welcome to EduForge Module Builder!',
      desc: 'Let’s walk through how to build interactive, self-service financial guides in under 2 minutes.',
    },
    {
      title: 'Interactive Editing Canvas',
      desc: 'The center board is your visual canvas. Click titles, edit rich texts, or slide inputs to build content immediately.',
    },
    {
      title: 'Adding Blocks & Slash commands',
      desc: 'Click block cards in the sidebar to append them, or type "/" inside the canvas to filter and insert 15+ rich block types instantly.',
    },
    {
      title: '10 Actions Block Toolbar',
      desc: 'Hover or click any block to display the toolbar: handle reordering, duplicate, delete, lock editing, or hide blocks.',
    },
    {
      title: 'Live Responsive Previews',
      desc: 'Toggle mobile, tablet, desktop buttons on the right to test calculations and score quizzes with isolated scoping!',
    },
  ];

  const handleNextStep = () => {
    if (tourStep < tourSteps.length - 1) {
      setTourStep(tourStep + 1);
    } else {
      setShowTour(false);
      setTourStep(0);
    }
  };

  const handlePrevStep = () => {
    if (tourStep > 0) {
      setTourStep(tourStep - 1);
    }
  };

  return (
    <div className="relative select-none print:hidden">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer focus:outline-none"
        title="Open Help & Shortcuts"
        aria-label="Open help center"
      >
        <HelpCircle className="h-4 w-4" />
        <span>Help Center</span>
      </button>

      {/* Main Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div 
            className="w-full max-w-lg bg-[#020805] border border-emerald-950 shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[500px]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="help-modal-title"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-emerald-950 bg-emerald-950/20">
              <h3 id="help-modal-title" className="font-extrabold text-sm text-slate-100 flex items-center gap-2 font-display">
                <Keyboard className="h-4.5 w-4.5 text-[#d4af37]" />
                <span>EduForge Creator Hub</span>
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-500 hover:text-slate-350 cursor-pointer focus:outline-none"
                aria-label="Close help modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content Tabs */}
            <div className="p-5 overflow-y-auto flex-grow flex flex-col gap-4">
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowTour(true); setIsOpen(false); }}
                  className="w-full py-2.5 bg-[#d4af37] hover:bg-[#e5c158] text-black font-bold text-xs rounded-xl shadow-lg transition-colors cursor-pointer text-center"
                >
                  Launch Guided Creator Tour
                </button>
              </div>

              <div className="flex flex-col gap-2.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono border-b border-slate-900 pb-1.5">
                  Keyboard Shortcuts Cheat-sheet
                </span>
                
                <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
                  {keyboardShortcuts.map((shortcut) => (
                    <div key={shortcut.keys} className="flex justify-between items-center gap-4 text-xs">
                      <span className="text-slate-400 font-medium leading-relaxed">
                        {shortcut.desc}
                      </span>
                      <kbd className="px-2 py-0.5 border border-slate-800 bg-slate-900 rounded text-slate-300 font-bold font-mono text-[10px] shadow-sm flex-shrink-0 select-none">
                        {shortcut.keys}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="px-5 py-3 border-t border-slate-900 bg-slate-950/80 flex justify-between items-center text-[10px] text-slate-500 select-none font-medium">
              <span>WCAG 2.1 AA Compliant</span>
              <span>EduForge Technologies</span>
            </div>
          </div>
        </div>
      )}      {/* Guided Tooltip Tour Popups Overlay */}
      {showTour && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div 
            className="w-full max-w-sm bg-[#020805] border border-[#d4af37]/35 shadow-2xl rounded-2xl overflow-hidden p-5 flex flex-col gap-4 relative"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#d4af37] uppercase tracking-widest font-mono">
                Tour Step {tourStep + 1} of {tourSteps.length}
              </span>
              <button
                onClick={() => setShowTour(false)}
                className="text-slate-500 hover:text-slate-350 cursor-pointer focus:outline-none"
                aria-label="Skip tour"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-col gap-1.5 select-text">
              <h4 className="font-extrabold text-sm text-slate-100 font-display">
                {tourSteps[tourStep].title}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                {tourSteps[tourStep].desc}
              </p>
            </div>

            <div className="flex items-center justify-between mt-2 select-none">
              <button
                onClick={() => setShowTour(false)}
                className="text-xs text-slate-500 hover:text-[#d4af37] cursor-pointer focus:outline-none"
              >
                Skip Tour
              </button>

              <div className="flex items-center gap-2">
                {tourStep > 0 && (
                  <button
                    onClick={handlePrevStep}
                    className="p-1 text-slate-500 hover:text-slate-300 bg-slate-900 border border-slate-800 rounded-lg cursor-pointer"
                    aria-label="Previous step"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  onClick={handleNextStep}
                  className="flex items-center gap-1 px-3 py-1.5 bg-[#d4af37] hover:bg-[#e5c158] text-black font-bold text-[10px] rounded-lg shadow-md cursor-pointer"
                >
                  <span className="text-black">{tourStep === tourSteps.length - 1 ? 'Finish' : 'Next'}</span>
                  <ArrowRight className="h-3 w-3 text-black" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
