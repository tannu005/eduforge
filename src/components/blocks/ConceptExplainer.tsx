import React, { useState, useEffect } from 'react';
import { ExplainerContent, ExplainerStep } from '../../types';
import { useModuleStore } from '../../store/useModuleStore';
import { AnimatePresence, motion } from 'framer-motion';
import { Layers, ChevronLeft, ChevronRight, Play, Pause, Plus, Trash2, HelpCircle } from 'lucide-react';

interface ConceptExplainerProps {
  id: string;
  content: ExplainerContent;
  isLocked: boolean;
  isPreview?: boolean;
}

export const ConceptExplainer: React.FC<ConceptExplainerProps> = ({
  id,
  content,
  isLocked,
  isPreview = false,
}) => {
  const updateBlockContent = useModuleStore((state) => state.updateBlockContent);
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(content.autoPlay || false);

  // AutoPlay timer
  useEffect(() => {
    let interval: any | null = null;
    if (isPreview && isPlaying && content.steps.length > 0) {
      interval = setInterval(() => {
        setActiveStep((prev) => (prev + 1) % content.steps.length);
      }, (content.autoPlaySpeed || 5) * 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPreview, isPlaying, content.steps, content.autoPlaySpeed]);

  const handleNext = () => {
    setActiveStep((prev) => (prev + 1) % content.steps.length);
  };

  const handlePrev = () => {
    setActiveStep((prev) => (prev - 1 + content.steps.length) % content.steps.length);
  };

  const handleUpdateStep = (stepIdx: number, fields: Partial<ExplainerStep>) => {
    const updated = [...content.steps];
    updated[stepIdx] = { ...updated[stepIdx], ...fields };
    updateBlockContent(id, { steps: updated });
  };

  const handleAddStep = () => {
    if (content.steps.length >= 10) return; // A5.1 Limit
    updateBlockContent(id, {
      steps: [
        ...content.steps,
        { title: `New step ${content.steps.length + 1}`, description: 'New description text explaining the milestone detail...' }
      ]
    });
  };

  const handleRemoveStep = (stepIdx: number) => {
    if (content.steps.length <= 3) return; // Minimum 3 steps A13.2
    const updated = content.steps.filter((_, idx) => idx !== stepIdx);
    updateBlockContent(id, {
      steps: updated
    });
    setActiveStep(Math.min(activeStep, updated.length - 1));
  };

  if (isPreview) {
    const currentStepData = content.steps[activeStep] || { title: '', description: '' };
    return (
      <div 
        className="flex flex-col gap-4 p-5 border border-[#082212]/80 bg-[#030a06]/30 rounded-2xl shadow-xl w-full select-text"
        role="region"
        aria-label="Animated Concept Explainer"
      >
        <div className="flex items-center justify-between border-b border-[#04140a] pb-2.5 select-none">
          <div className="flex items-center gap-2 text-emerald-400">
            <Layers className="h-4 w-4 text-[#d4af37]" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Concept Explainer (Step {activeStep + 1} of {content.steps.length})
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`p-1 border rounded-lg transition-colors cursor-pointer ${
                isPlaying 
                  ? 'bg-[#d4af37]/20 border-[#d4af37]/40 text-[#d4af37]' 
                  : 'bg-[#030e07] border-[#082212]/80 text-emerald-600 hover:text-emerald-400'
              }`}
              title={isPlaying ? 'Pause Auto-Play' : 'Start Auto-Play'}
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {/* Dynamic Carousel Slide Frame */}
        <div className="min-h-[120px] py-2 flex flex-col justify-center relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-1.5"
            >
              <h4 className="font-extrabold text-sm text-slate-100 font-display">
                {currentStepData.title}
              </h4>
              <p className="text-xs text-slate-350 leading-relaxed font-medium">
                {currentStepData.description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Stepper indicators and navigation arrows */}
        <div className="flex items-center justify-between border-t border-[#04140a] pt-3 select-none">
          <div className="flex items-center gap-1.5">
            {content.steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveStep(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer focus:outline-none ${
                  idx === activeStep ? 'w-6 bg-[#d4af37]' : 'w-2 bg-[#082212] hover:bg-emerald-900'
                }`}
                aria-label={`Go to step ${idx + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrev}
              className="p-1 text-emerald-600 hover:text-emerald-400 bg-[#030e07] border border-[#082212]/80 rounded-lg cursor-pointer"
              aria-label="Previous step"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-1 text-emerald-600 hover:text-emerald-400 bg-[#030e07] border border-[#082212]/80 rounded-lg cursor-pointer"
              aria-label="Next step"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-4 p-4 border border-[#082212]/80 bg-[#030a06]/30 rounded-xl select-none ${isLocked ? 'opacity-80' : ''}`}>
      <div className="flex items-center justify-between gap-4 border-b border-[#04140a] pb-2.5">
        <div className="flex items-center gap-2 text-xs font-bold text-[#d4af37]">
          <Layers className="h-4 w-4 text-[#d4af37]" />
          <span>Animated Concept Explainer Settings</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {/* AutoPlay Configurations */}
        {!isLocked && (
          <div className="grid grid-cols-2 gap-3 bg-[#030e07]/20 border border-[#04140a] p-2.5 rounded-xl">
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold text-emerald-600 uppercase">Auto Play</label>
              <button
                onClick={() => updateBlockContent(id, { autoPlay: !content.autoPlay })}
                className={`py-1 text-xs font-bold border rounded-lg cursor-pointer ${
                  content.autoPlay ? 'bg-[#d4af37]/20 border-[#d4af37]/40 text-[#d4af37]' : 'bg-[#030e07] border-emerald-950/50 text-emerald-650'
                }`}
              >
                {content.autoPlay ? 'Auto-Play Enabled' : 'Manual only'}
              </button>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold text-emerald-600 uppercase">Slide Delay Speed (sec)</label>
              <input
                type="number"
                value={content.autoPlaySpeed}
                onChange={(e) => updateBlockContent(id, { autoPlaySpeed: parseInt(e.target.value) || 5 })}
                disabled={!content.autoPlay}
                className="px-2 py-1 text-xs bg-[#030e07] border border-[#082212]/80 focus:border-[#d4af37] rounded-lg text-slate-200 outline-none disabled:opacity-40 select-text"
              />
            </div>
          </div>
        )}

        {/* Steps List */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
            Step Carousel Details List (Minimum 3 steps)
          </label>
          <div className="flex flex-col gap-3">
            {content.steps.map((step, idx) => (
              <div key={idx} className="flex flex-col gap-2 p-3 bg-[#010603]/40 border border-[#04140a] rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-emerald-650">
                    Step {idx + 1}
                  </span>
                  
                  <input
                    type="text"
                    value={step.title}
                    onChange={(e) => handleUpdateStep(idx, { title: e.target.value })}
                    disabled={isLocked}
                    placeholder="Step header title..."
                    className="w-full px-3 py-1.5 text-xs font-bold bg-[#030e07]/60 border border-[#082212]/80 focus:border-[#d4af37] rounded-lg text-slate-200 outline-none select-text"
                  />

                  {!isLocked && content.steps.length > 3 && (
                    <button
                      onClick={() => handleRemoveStep(idx)}
                      className="p-1.5 text-rose-500 hover:text-rose-400 bg-[#030e07] border border-emerald-950/55 hover:border-[#082212] rounded-lg cursor-pointer"
                      title="Remove Explainer Step"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <textarea
                  value={step.description}
                  onChange={(e) => handleUpdateStep(idx, { description: e.target.value })}
                  disabled={isLocked}
                  placeholder="Detailed description explaining this step..."
                  className="w-full px-3 py-1.5 text-xs bg-[#030e07]/30 border border-[#04140a]/60 focus:border-[#d4af37] rounded-lg text-slate-350 outline-none select-text resize-none"
                  rows={2}
                />
              </div>
            ))}
          </div>

          {!isLocked && content.steps.length < 10 && (
            <button
              onClick={handleAddStep}
              className="flex items-center justify-center gap-1.5 self-start px-3 py-1.5 bg-[#d4af37]/20 hover:bg-[#d4af37]/30 border border-[#d4af37]/30 text-[#d4af37] text-xs font-semibold rounded-lg transition-colors cursor-pointer mt-1"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Step</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
