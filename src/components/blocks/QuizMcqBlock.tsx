import React, { useEffect, useState } from 'react';
import { QuizMcqContent } from '../../types';
import { useModuleStore } from '../../store/useModuleStore';
import { useQuizStore } from '../../store/useQuizStore';
import { HelpCircle, Trash2, Plus, Check, Play, Square, Timer, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuizMcqBlockProps {
  id: string;
  content: QuizMcqContent;
  isLocked: boolean;
  isPreview?: boolean;
}

export const QuizMcqBlock: React.FC<QuizMcqBlockProps> = ({
  id,
  content,
  isLocked,
  isPreview = false,
}) => {
  const updateBlockContent = useModuleStore((state) => state.updateBlockContent);
  const quizConfig = useModuleStore((state) => state.quizConfig);

  // Student preview states
  const { quizzes, selectOption, submitAnswer, resetQuiz } = useQuizStore();
  const quizState = quizzes[id] || { selectedOptions: [], isSubmitted: false, isCorrect: null, attempts: 0, score: 0, timeSpent: 0 };

  // Timer states (active only in preview if content hasTimer is true)
  const [timeLeft, setTimeLeft] = useState(content.timerSeconds || 30);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    if (isPreview && content.hasTimer && !quizState.isSubmitted && timerActive) {
      if (timeLeft <= 0) {
        setTimerActive(false);
        // Force submit current selections
        handleAnswerSubmit();
        return;
      }
      const interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timeLeft, isPreview, content.hasTimer, quizState.isSubmitted, timerActive]);

  // Reset timer on load or reset
  useEffect(() => {
    setTimeLeft(content.timerSeconds || 30);
    setTimerActive(isPreview && content.hasTimer && !quizState.isSubmitted);
  }, [id, isPreview, content.hasTimer, quizState.isSubmitted]);

  // Correct options mapping
  const correctIndices = content.options
    .map((o, idx) => (o.isCorrect ? idx : -1))
    .filter((idx) => idx !== -1);

  const handleOptionSelect = (idx: number) => {
    if (quizState.isSubmitted) return;
    const isMultiSelect = correctIndices.length > 1;
    selectOption(id, idx, isMultiSelect);
  };

  const handleAnswerSubmit = () => {
    if (quizState.selectedOptions.length === 0) return;
    const isMultiSelect = correctIndices.length > 1;
    submitAnswer(id, correctIndices, content.points || 10, isMultiSelect); // Multi-select gets partial scoring A5.4
    setTimerActive(false);
  };

  const handleResetQuiz = () => {
    resetQuiz(id);
    setTimeLeft(content.timerSeconds || 30);
    setTimerActive(isPreview && content.hasTimer);
  };

  // Editor Actions
  const handleUpdateOption = (optIdx: number, fields: any) => {
    const updatedOptions = [...content.options];
    updatedOptions[optIdx] = { ...updatedOptions[optIdx], ...fields };
    updateBlockContent(id, { options: updatedOptions });
  };

  const handleAddOption = () => {
    if (content.options.length >= 6) return; // A5.4 Limit
    updateBlockContent(id, {
      options: [
        ...content.options,
        { text: `Option ${content.options.length + 1}`, isCorrect: false, explanation: '' }
      ]
    });
  };

  const handleRemoveOption = (optIdx: number) => {
    if (content.options.length <= 2) return; // Minimum 2 options A5.4
    const updated = content.options.filter((_, idx) => idx !== optIdx);
    updateBlockContent(id, { options: updated });
  };

  if (isPreview) {
    const showFeedback = quizConfig.feedbackMode === 'immediate' && quizState.isSubmitted;
    const correctAnswersCount = correctIndices.length;

    return (
      <div 
        className="flex flex-col gap-4 p-5 border border-emerald-950/80 bg-[#041208]/20 rounded-2xl shadow-xl w-full select-text"
        role="group"
        aria-label="Multiple Choice Quiz Block"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-950 pb-2.5 select-none">
          <div className="flex items-center gap-2 text-slate-300">
            <HelpCircle className="h-4 w-4 text-[#d4af37]" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Quiz: Choose {correctAnswersCount > 1 ? 'all correct answers' : 'the correct answer'}
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Timer countdown animation */}
            {content.hasTimer && !quizState.isSubmitted && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 border border-amber-500/20 bg-amber-950/20 text-[#d4af37] rounded-lg text-xs font-bold font-mono">
                <Timer className="h-3.5 w-3.5 animate-pulse" />
                <span>{timeLeft}s</span>
              </div>
            )}
            <span className="text-xs font-bold text-slate-400 bg-[#030a06] border border-emerald-950 px-2 py-0.5 rounded">
              {content.points || 10} Points
            </span>
          </div>
        </div>

        {/* Question Text */}
        <p className="text-sm font-semibold text-slate-100 leading-relaxed font-display">
          {content.question}
        </p>

        {/* Options Stack */}
        <div className="flex flex-col gap-2.5">
          {content.options.map((opt, idx) => {
            const isSelected = quizState.selectedOptions.includes(idx);
            const isOptCorrect = opt.isCorrect;
            
            let btnClass = "w-full text-left px-4 py-3 rounded-xl border font-medium text-xs leading-normal transition-all duration-150 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#d4af37] flex items-center justify-between ";
            let iconElement = null;

            if (showFeedback) {
              if (isOptCorrect) {
                btnClass += "border-emerald-500 bg-emerald-950/20 text-emerald-200";
                iconElement = <Check className="h-4 w-4 text-emerald-400 flex-shrink-0" />;
              } else if (isSelected) {
                btnClass += "border-rose-500 bg-rose-950/20 text-rose-200";
                iconElement = <span className="text-rose-400 text-sm font-bold flex-shrink-0">✕</span>;
              } else {
                btnClass += "border-emerald-950 bg-emerald-950/10 text-slate-505 opacity-60";
              }
            } else {
              if (isSelected) {
                btnClass += "border-[#d4af37] bg-[#d4af37]/10 text-[#d4af37] font-semibold shadow-inner";
              } else {
                btnClass += "border-emerald-950/80 bg-[#041208]/30 text-slate-300 hover:bg-[#06140b]/40 hover:border-emerald-800/60";
              }
            }

            return (
              <div key={idx} className="flex flex-col gap-1.5 w-full">
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.08 }}
                  whileHover={quizState.isSubmitted ? {} : { scale: 1.015, x: 2 }}
                  whileTap={quizState.isSubmitted ? {} : { scale: 0.985 }}
                  onClick={() => handleOptionSelect(idx)}
                  disabled={quizState.isSubmitted}
                  className={btnClass}
                >
                  <span className="pr-4">{opt.text}</span>
                  {iconElement}
                </motion.button>
                {showFeedback && (isSelected || isOptCorrect) && opt.explanation && (
                  <motion.p 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className={`text-[10px] pl-4 leading-normal ${
                      isOptCorrect ? 'text-emerald-400/90 font-medium' : 'text-rose-400/90 font-medium'
                    }`}
                  >
                    {opt.explanation}
                  </motion.p>
                )}
              </div>
            );
          })}
        </div>

        {/* Action button */}
        {!quizState.isSubmitted ? (
          <button
            onClick={handleAnswerSubmit}
            disabled={quizState.selectedOptions.length === 0}
            className="w-full py-2 bg-[#d4af37] hover:bg-[#e5c158] disabled:bg-[#041208]/20 disabled:text-slate-500 border border-[#d4af37]/20 text-black font-bold text-xs rounded-xl shadow-lg transition-colors cursor-pointer disabled:cursor-not-allowed focus:outline-none"
          >
            Submit Answer
          </button>
        ) : (
          <div className="flex flex-col gap-3 mt-2 border-t border-emerald-950 pt-3">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className={quizState.isCorrect ? 'text-emerald-400' : 'text-rose-400'}>
                {quizState.isCorrect ? '✓ Correct Answer!' : '✕ Incorrect Answer'}
              </span>
              <span className="text-slate-400">
                Score: {quizState.score} / {content.points}
              </span>
            </div>
            {/* Retry Button if Unlimited or below limits */}
            {(content.attemptLimit === 0 || quizState.attempts < content.attemptLimit) && (
              <button
                onClick={handleResetQuiz}
                className="flex items-center justify-center gap-1.5 self-end px-3 py-1 bg-[#030a06] border border-emerald-950 hover:bg-[#06140b] hover:text-white rounded-lg text-[10px] text-slate-400 transition-colors cursor-pointer"
              >
                <RefreshCw className="h-3 w-3 text-slate-450" />
                <span>Retry (Attempt {quizState.attempts} of {content.attemptLimit === 0 ? '∞' : content.attemptLimit})</span>
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-4 p-4 border border-emerald-950 bg-[#041208]/20 rounded-xl select-none ${isLocked ? 'opacity-80' : ''}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-950 pb-2.5">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
          <HelpCircle className="h-4 w-4 text-[#d4af37]" />
          <span>Multiple Choice Quiz (MCQ) Settings</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {/* Question Input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Question Text
          </label>
          <textarea
            value={content.question}
            onChange={(e) => updateBlockContent(id, { question: e.target.value })}
            disabled={isLocked}
            placeholder="Enter quiz question here..."
            className="px-3 py-2 text-xs bg-[#030a06]/65 border border-emerald-950 focus:border-[#d4af37] rounded-lg text-slate-200 outline-none select-text resize-none"
            rows={2}
          />
        </div>

        {/* Score & Limit Configs */}
        {!isLocked && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-[#041208]/20 border border-emerald-950 p-2.5 rounded-xl">
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold text-slate-500 uppercase">Points</label>
              <input
                type="number"
                value={content.points}
                onChange={(e) => updateBlockContent(id, { points: parseInt(e.target.value) || 1 })}
                className="px-2 py-1 text-xs bg-[#030a06] border border-emerald-950 focus:border-[#d4af37] rounded-lg text-slate-200 outline-none select-text"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold text-slate-500 uppercase">Attempt Limit (0=unlimited)</label>
              <input
                type="number"
                value={content.attemptLimit}
                onChange={(e) => updateBlockContent(id, { attemptLimit: parseInt(e.target.value) || 0 })}
                className="px-2 py-1 text-xs bg-[#030a06] border border-emerald-950 focus:border-[#d4af37] rounded-lg text-slate-200 outline-none select-text"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold text-slate-500 uppercase">Quiz Timer</label>
              <button
                onClick={() => updateBlockContent(id, { hasTimer: !content.hasTimer })}
                className={`py-1 text-xs font-bold border rounded-lg cursor-pointer ${
                  content.hasTimer ? 'bg-[#d4af37]/20 border-[#d4af37]/40 text-[#d4af37]' : 'bg-[#030a06] border-emerald-950 text-slate-500'
                }`}
              >
                {content.hasTimer ? 'Enabled' : 'Disabled'}
              </button>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold text-slate-500 uppercase">Timer Seconds</label>
              <input
                type="number"
                value={content.timerSeconds}
                onChange={(e) => updateBlockContent(id, { timerSeconds: parseInt(e.target.value) || 30 })}
                disabled={!content.hasTimer}
                className="px-2 py-1 text-xs bg-[#030a06] border border-emerald-950 focus:border-[#d4af37] rounded-lg text-slate-200 outline-none disabled:opacity-40 select-text"
              />
            </div>
          </div>
        )}

        {/* Options List */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Options (Mark correct checkmarks)
          </label>
          <div className="flex flex-col gap-2.5">
            {content.options.map((opt, oIdx) => (
              <div key={oIdx} className="flex flex-col gap-1.5 p-2 bg-[#020805]/45 border border-emerald-950 rounded-xl">
                <div className="flex items-center gap-2">
                  {/* Correct Toggle */}
                  <button
                    onClick={() => !isLocked && handleUpdateOption(oIdx, { isCorrect: !opt.isCorrect })}
                    disabled={isLocked}
                    className={`p-1.5 border rounded-lg flex items-center justify-center cursor-pointer focus:outline-none ${
                      opt.isCorrect 
                        ? 'bg-emerald-600 border-emerald-500 text-white' 
                        : 'bg-[#030a06] border-emerald-950 text-slate-500 hover:text-slate-400'
                    }`}
                    title="Toggle correct option"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>

                  <input
                    type="text"
                    value={opt.text}
                    onChange={(e) => handleUpdateOption(oIdx, { text: e.target.value })}
                    disabled={isLocked}
                    placeholder={`Option ${oIdx + 1} text...`}
                    className="w-full px-2.5 py-1 text-xs bg-[#030a06]/65 border border-emerald-950 focus:border-[#d4af37] rounded-lg text-slate-200 outline-none select-text"
                  />

                  {/* Remove Button */}
                  {!isLocked && content.options.length > 2 && (
                    <button
                      onClick={() => handleRemoveOption(oIdx)}
                      className="p-1.5 text-rose-500 hover:text-rose-400 bg-[#030a06] hover:bg-[#06140b] border border-emerald-950 rounded-lg cursor-pointer"
                      title="Delete Option"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                
                {/* Explanation */}
                <input
                  type="text"
                  value={opt.explanation || ''}
                  onChange={(e) => handleUpdateOption(oIdx, { explanation: e.target.value })}
                  disabled={isLocked}
                  placeholder={`Explanation on click (optional)...`}
                  className="px-2 py-1 text-[10px] bg-[#030a06]/35 border border-emerald-950/60 focus:border-[#d4af37] rounded-lg text-slate-400 outline-none select-text"
                />
              </div>
            ))}
          </div>

          {!isLocked && content.options.length < 6 && (
            <button
              onClick={handleAddOption}
              className="flex items-center justify-center gap-1.5 self-start px-3 py-1.5 bg-[#d4af37]/20 hover:bg-[#d4af37]/35 border border-[#d4af37]/30 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer mt-1"
            >
              <Plus className="h-3.5 w-3.5 text-white" />
              <span className="text-white">Add Option</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
