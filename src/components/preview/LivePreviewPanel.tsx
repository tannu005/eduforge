import React, { useState } from 'react';
import { useModuleStore } from '../../store/useModuleStore';
import { useQuizStore } from '../../store/useQuizStore';
import { useToastStore } from '../../store/useToastStore';
import { formatIndianNumber } from '../../utils/financial';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Monitor, Tablet, Smartphone, Moon, Sun, 
  Printer, CheckCircle2, RotateCcw, Award 
} from 'lucide-react';

// Import preview renderers
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

export const LivePreviewPanel: React.FC = () => {
  const { blocks, title, description, quizConfig, metadata } = useModuleStore();
  const { quizzes, unlockedBadgeIds, resetAll, resetBadges } = useQuizStore();
  const { showToast } = useToastStore();

  // Responsive breakpoint toggles (A8.1)
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  
  // Independent preview dark mode (A8.2 PR-006)
  const [isPreviewDark, setIsPreviewDark] = useState(true);

  // Filter out invisible blocks for student preview (A6.4 Visibility)
  const visibleBlocks = blocks.filter((b) => b.settings.isVisible);

  // Score aggregations
  const scoreQuizzes = visibleBlocks.filter(b => b.type === 'quiz-mcq' || b.type === 'quiz-tf');
  const maxPossibleScore = scoreQuizzes.reduce((acc, curr) => acc + (curr.content.points || 10), 0);
  
  const currentScore = Object.entries(quizzes).reduce((acc, [blockId, qState]) => {
    // Only count score if block is a visible quiz
    const isQuizVisible = visibleBlocks.some(b => b.id === blockId);
    if (!isQuizVisible) return acc;
    return acc + qState.score;
  }, 0);

  const completedCount = Object.values(quizzes).filter(q => q.isSubmitted).length;
  const isModuleCompleted = scoreQuizzes.length > 0 && completedCount === scoreQuizzes.length;
  const isPassed = isModuleCompleted && (currentScore / maxPossibleScore) * 100 >= (quizConfig.passingScore || 70);

  const handleResetSimulation = () => {
    resetAll();
    resetBadges();
    showToast('Student simulation progress reset.', 'info');
  };

  const handlePrint = () => {
    window.print();
  };

  const renderPreviewBlock = (block: any) => {
    switch (block.type) {
      case 'rich-text':
        return <RichTextBlock id={block.id} content={block.content} isLocked={true} isPreview={true} />;
      case 'image':
        return <ImageBlock id={block.id} content={block.content} isLocked={true} isPreview={true} />;
      case 'video':
        return <VideoBlock id={block.id} content={block.content} isLocked={true} isPreview={true} />;
      case 'quiz-mcq':
        return <QuizMcqBlock id={block.id} content={block.content} isLocked={true} isPreview={true} />;
      case 'quiz-tf':
        return <QuizTfBlock id={block.id} content={block.content} isLocked={true} isPreview={true} />;
      case 'emi-calc':
        return <EmiCalculator id={block.id} content={block.content} isLocked={true} isPreview={true} />;
      case 'sip-calc':
        return <SipCalculator id={block.id} content={block.content} isLocked={true} isPreview={true} />;
      case 'compound-calc':
        return <CompoundInterest id={block.id} content={block.content} isLocked={true} isPreview={true} />;
      case 'callout':
        return <CalloutBlock id={block.id} content={block.content} isLocked={true} isPreview={true} />;
      case 'divider':
        return <DividerBlock id={block.id} content={block.content} isLocked={true} isPreview={true} />;
      case 'accordion':
        return <AccordionBlock id={block.id} content={block.content} isLocked={true} isPreview={true} />;
      case 'progress':
        return <ProgressTracker id={block.id} content={block.content} isLocked={true} isPreview={true} />;
      case 'badge':
        return <AchievementBadge id={block.id} content={block.content} isLocked={true} isPreview={true} />;
      case 'code':
        return <CodeSnippetBlock id={block.id} content={block.content} isLocked={true} isPreview={true} />;
      case 'explainer':
        return <ConceptExplainer id={block.id} content={block.content} isLocked={true} isPreview={true} />;
      default:
        return null;
    }
  };

  const getContainerWidthClass = () => {
    switch (device) {
      case 'mobile': return 'preview-container-mobile';
      case 'tablet': return 'preview-container-tablet';
      case 'desktop': return 'preview-container-desktop';
    }
  };

  const devicesList = [
    { name: 'desktop', icon: Monitor, label: 'Desktop (100%)' },
    { name: 'tablet', icon: Tablet, label: 'Tablet (768px)' },
    { name: 'mobile', icon: Smartphone, label: 'Mobile (375px)' },
  ] as const;

  return (
    <div className="flex flex-col h-full w-full select-none print:bg-white print:text-black">
      {/* PREVIEW CONTAINER HEADER BAR */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2 border-b border-slate-900 bg-slate-950/80 flex-shrink-0 select-none print:hidden">
        {/* Device breakpoint buttons */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-0.5 rounded-xl" role="radiogroup" aria-label="Preview Breakpoint Device">
          {devicesList.map((d) => {
            const DIcon = d.icon;
            return (
              <button
                key={d.name}
                onClick={() => setDevice(d.name)}
                className={`p-1.5 rounded-lg transition-colors focus:outline-none focus:ring-1 focus:ring-[#d4af37] cursor-pointer ${
                  device === d.name 
                    ? 'bg-[#d4af37] text-black' 
                    : 'text-slate-500 hover:text-slate-350'
                }`}
                title={d.label}
                role="radio"
                aria-checked={device === d.name}
              >
                <DIcon className="h-4 w-4" />
              </button>
            );
          })}
        </div>

        {/* Action icons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={() => setIsPreviewDark(!isPreviewDark)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-350 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all cursor-pointer focus:outline-none"
            title="Toggle Preview Theme"
          >
            {isPreviewDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
          </button>
          
          <button
            onClick={handlePrint}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-350 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all cursor-pointer focus:outline-none"
            title="Trigger Print Preview (Print Scoped Layouts)"
          >
            <Printer className="h-4 w-4" />
          </button>

          {(completedCount > 0 || unlockedBadgeIds.length > 0) && (
            <button
              onClick={handleResetSimulation}
              className="flex items-center gap-1.5 px-2.5 py-1 border border-slate-850 hover:border-slate-800 hover:text-white rounded-lg text-[10px] font-bold text-slate-400 bg-slate-900/60 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset Sim</span>
            </button>
          )}
        </div>
      </div>

      {/* DYNAMIC SCALING VIEWPORT CANVAS FRAME */}
      <div className="flex-grow overflow-y-auto p-4 flex justify-center items-start bg-slate-950/60 print:p-0 print:bg-white">
        <motion.div
          animate={{
            width: device === 'desktop' ? '100%' : device === 'tablet' ? 768 : 375,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={`flex flex-col h-full bg-[#020805] ${getContainerWidthClass()} relative overflow-hidden print:w-full print:max-w-full print:border-none print:shadow-none print:rounded-none ${
            device !== 'desktop' ? 'mock-device-bezel' : ''
          }`}
        >
          {device === 'mobile' && (
            <div className="device-camera-notch print:hidden" />
          )}
          <div 
            className={`w-full h-full overflow-y-auto p-6 flex flex-col gap-6 select-text transition-colors duration-300 ${
              isPreviewDark ? 'bg-[#020805] text-slate-300' : 'bg-slate-50 text-slate-700'
            } print:bg-white print:text-black`}
          >
            {/* Header info */}
            <div className="flex flex-col border-b border-emerald-950 pb-4 print:border-slate-300 select-text">
              <h2 className={`text-xl font-extrabold font-display leading-tight ${
                isPreviewDark ? 'text-white' : 'text-slate-900'
              } print:text-black`}>
                {(title || 'Untitled Financial Literacy Guide').split(' ').map((word, idx) => (
                  <span key={idx} className="text-reveal-word mr-1.5 inline-block">
                    {word}
                  </span>
                ))}
              </h2>
              <p className={`text-xs mt-1.5 leading-relaxed font-medium ${
                isPreviewDark ? 'text-slate-500' : 'text-slate-500'
              }`}>
                {description || 'No module description provided.'}
              </p>
              
              {/* Badge metadata */}
              <div className="flex flex-wrap items-center gap-3 mt-3 select-none print:hidden">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-950/40 border border-emerald-900/30 px-2 py-0.5 rounded text-[#d4af37]">
                  {metadata.difficulty} Level
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#020805] border border-emerald-950/40 px-2 py-0.5 rounded text-slate-400">
                  ⏱ {metadata.estimatedDuration || 10} Mins Course
                </span>
              </div>
            </div>

            {/* Scorecard completion panel */}
            {scoreQuizzes.length > 0 && (
              <div className={`p-3 sm:p-4 border rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 select-text print:hidden ${
                isModuleCompleted 
                  ? (isPassed ? 'border-emerald-500/20 bg-emerald-950/15' : 'border-rose-500/20 bg-rose-950/15')
                  : 'border-emerald-950/30 bg-[#041208]/30'
              }`}>
                <div className="flex items-center gap-3">
                  {isPassed ? (
                    <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                  ) : (
                    <Award className="h-6 w-6 text-[#d4af37]" />
                  )}
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-200">
                      {isModuleCompleted 
                        ? (isPassed ? 'Course Passed!' : 'Course Completed - Failed to Pass')
                        : 'Module Quiz Tracker'}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-0.5 font-medium">
                      {completedCount} of {scoreQuizzes.length} answered ({Math.round((completedCount/scoreQuizzes.length)*100)}%)
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <span className="text-sm font-extrabold text-white font-mono leading-none">
                    Score: {currentScore} / {maxPossibleScore}
                  </span>
                  <span className="text-[9px] font-bold text-slate-500 mt-1">
                    Passing: {quizConfig.passingScore || 70}%
                  </span>
                </div>
              </div>
            )}

            {/* Rendered Block components stack */}
            <div className="flex flex-col gap-6 pb-12">
              {visibleBlocks.length === 0 ? (
                <div className="text-center py-20 text-xs text-slate-650 font-bold select-none">
                  No visible blocks in student preview.
                </div>
              ) : (
                visibleBlocks.map((block) => (
                  <div key={block.id} className="w-full">
                    {renderPreviewBlock(block)}
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
