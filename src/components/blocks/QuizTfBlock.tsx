import React, { useEffect, useState } from 'react';
import { QuizTfContent } from '../../types';
import { useModuleStore } from '../../store/useModuleStore';
import { useQuizStore } from '../../store/useQuizStore';
import { HelpCircle, RefreshCw, Timer, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuizTfBlockProps {
  id: string;
  content: QuizTfContent;
  isLocked: boolean;
  isPreview?: boolean;
}

export const QuizTfBlock: React.FC<QuizTfBlockProps> = ({
  id,
  content,
  isLocked,
  isPreview = false,
}) => {
  const updateBlockContent = useModuleStore((state) => state.updateBlockContent);
  const quizConfig = useModuleStore((state) => state.quizConfig);

  // Student states
  const { quizzes, selectOption, submitAnswer, resetQuiz } = useQuizStore();
  const quizState = quizzes[id] || { selectedOptions: [], isSubmitted: false, isCorrect: null, attempts: 0, score: 0, timeSpent: 0 };

  // Timer states
  const [timeLeft, setTimeLeft] = useState(content.timerSeconds || 30);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    if (isPreview && content.hasTimer && !quizState.isSubmitted && timerActive) {
      if (timeLeft <= 0) {
        setTimerActive(false);
        handleAnswerSubmit();
        return;
      }
      const interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timeLeft, isPreview, content.hasTimer, quizState.isSubmitted, timerActive]);

  useEffect(() => {
    setTimeLeft(content.timerSeconds || 30);
    setTimerActive(isPreview && content.hasTimer && !quizState.isSubmitted);
  }, [id, isPreview, content.hasTimer, quizState.isSubmitted]);

  const correctIndex = content.isTrueCorrect ? 0 : 1; // 0 for True, 1 for False

  const handleOptionSelect = (idx: number) => {
    if (quizState.isSubmitted) return;
    selectOption(id, idx, false); // Single select
  };

  const handleAnswerSubmit = () => {
    if (quizState.selectedOptions.length === 0) return;
    submitAnswer(id, [correctIndex], content.points || 10, false);
    setTimerActive(false);
  };

  const handleResetQuiz = () => {
    resetQuiz(id);
    setTimeLeft(content.timerSeconds || 30);
    setTimerActive(isPreview && content.hasTimer);
  };

  if (isPreview) {
    const showFeedback = quizConfig.feedbackMode === 'immediate' && quizState.isSubmitted;
    
    return (
      <div 
        className="flex flex-col gap-4 p-5 border border-emerald-950/80 bg-[#041208]/20 rounded-2xl shadow-xl w-full select-text"
        role="group"
        aria-label="True or False Quiz Block"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-950 pb-2.5 select-none">
          <div className="flex items-center gap-2 text-slate-300">
            <HelpCircle className="h-4 w-4 text-[#d4af37]" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Quiz: True or False
            </span>
          </div>

          <div className="flex items-center gap-3">
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

        {/* True / False Buttons */}
        <div className="grid grid-cols-2 gap-4 select-none">
          {['True', 'False'].map((label, idx) => {
            const isSelected = quizState.selectedOptions.includes(idx);
            const isOptCorrect = idx === correctIndex;
            
            let btnClass = "w-full text-center py-3 rounded-xl border font-bold text-sm leading-normal transition-all duration-150 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#d4af37] flex items-center justify-center gap-2 ";

            if (showFeedback) {
              if (isOptCorrect) {
                btnClass += "border-emerald-500 bg-emerald-950/25 text-emerald-300";
              } else if (isSelected) {
                btnClass += "border-rose-500 bg-rose-950/25 text-rose-300";
              } else {
                btnClass += "border-emerald-950 bg-[#020805]/45 text-slate-600 opacity-60";
              }
            } else {
              if (isSelected) {
                btnClass += "border-[#d4af37] bg-[#d4af37]/10 text-[#d4af37] shadow-inner";
              } else {
                btnClass += "border-emerald-950/80 bg-[#041208]/30 text-slate-400 hover:bg-[#06140b]/40 hover:border-emerald-800/60 hover:text-slate-200";
              }
            }

            return (
              <motion.button
                key={label}
                whileHover={quizState.isSubmitted ? {} : { scale: 1.02 }}
                whileTap={quizState.isSubmitted ? {} : { scale: 0.98 }}
                onClick={() => handleOptionSelect(idx)}
                disabled={quizState.isSubmitted}
                className={btnClass}
              >
                <span>{label}</span>
                {showFeedback && isOptCorrect && <Check className="h-4 w-4 text-emerald-400 flex-shrink-0" />}
              </motion.button>
            );
          })}
        </div>

        {/* Feedback Expanation */}
        {showFeedback && content.explanation && (
          <div className="p-3 border border-emerald-950 bg-[#020805]/45 rounded-xl leading-relaxed">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Explanation
            </span>
            <p className="text-xs text-slate-300 mt-1">
              {content.explanation}
            </p>
          </div>
        )}

        {/* Action Button */}
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
          <span>True / False Quiz Settings</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {/* Question Text */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Statement / Question
          </label>
          <textarea
            value={content.question}
            onChange={(e) => updateBlockContent(id, { question: e.target.value })}
            disabled={isLocked}
            placeholder="Enter statement to evaluate..."
            className="px-3 py-2 text-xs bg-[#030a06]/65 border border-emerald-950 focus:border-[#d4af37] rounded-lg text-slate-200 outline-none select-text resize-none"
            rows={2}
          />
        </div>

        {/* Configs */}
        {!isLocked && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-[#041208]/20 border border-emerald-950 p-2.5 rounded-xl">
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold text-slate-500 uppercase">Correct Value</label>
              <button
                onClick={() => updateBlockContent(id, { isTrueCorrect: !content.isTrueCorrect })}
                className={`py-1 text-xs font-bold border rounded-lg cursor-pointer ${
                  content.isTrueCorrect ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-450' : 'bg-rose-600/20 border-rose-500/40 text-rose-450'
                }`}
              >
                {content.isTrueCorrect ? 'True is Correct' : 'False is Correct'}
              </button>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold text-slate-505 uppercase">Points</label>
              <input
                type="number"
                value={content.points}
                onChange={(e) => updateBlockContent(id, { points: parseInt(e.target.value) || 1 })}
                className="px-2 py-1 text-xs bg-[#030a06] border border-emerald-950 focus:border-[#d4af37] rounded-lg text-slate-200 outline-none select-text"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold text-slate-505 uppercase">Quiz Timer</label>
              <button
                onClick={() => updateBlockContent(id, { hasTimer: !content.hasTimer })}
                className={`py-1 text-xs font-bold border rounded-lg cursor-pointer ${
                  content.hasTimer ? 'bg-amber-600/20 border-amber-500/40 text-[#d4af37]' : 'bg-[#030a06] border-emerald-950 text-slate-500'
                }`}
              >
                {content.hasTimer ? 'Enabled' : 'Disabled'}
              </button>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold text-slate-505 uppercase">Timer Seconds</label>
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

        {/* Explanation Text */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Explanation Text
          </label>
          <input
            type="text"
            value={content.explanation}
            onChange={(e) => updateBlockContent(id, { explanation: e.target.value })}
            disabled={isLocked}
            placeholder="Why is this True or False?..."
            className="px-3 py-1.5 text-xs bg-[#030a06]/65 border border-emerald-950 focus:border-[#d4af37] rounded-lg text-slate-200 outline-none select-text"
          />
        </div>
      </div>
    </div>
  );
};
