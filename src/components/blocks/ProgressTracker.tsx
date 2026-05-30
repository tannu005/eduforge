import React from 'react';
import { ProgressContent, ProgressStep } from '../../types';
import { useModuleStore } from '../../store/useModuleStore';
import { Milestone, Plus, Trash2, HelpCircle } from 'lucide-react';

interface ProgressTrackerProps {
  id: string;
  content: ProgressContent;
  isLocked: boolean;
  isPreview?: boolean;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  id,
  content,
  isLocked,
  isPreview = false,
}) => {
  const updateBlockContent = useModuleStore((state) => state.updateBlockContent);
  const activeStep = content.currentStep || 0;

  const handleStepClick = (idx: number) => {
    if (!isPreview) return;
    
    // Linear check: can only navigate to completed, next, or if non-linear branching is true
    if (!content.isBranching && idx > activeStep + 1) return;
    
    updateBlockContent(id, { currentStep: idx }, true);
  };

  // Editor Actions
  const handleUpdateStepLabel = (stepIdx: number, newLabel: string) => {
    const updated = [...content.steps];
    updated[stepIdx] = { label: newLabel };
    updateBlockContent(id, { steps: updated });
  };

  const handleAddStep = () => {
    updateBlockContent(id, {
      steps: [...content.steps, { label: `New step ${content.steps.length + 1}` }],
    });
  };

  const handleRemoveStep = (stepIdx: number) => {
    if (content.steps.length <= 2) return; // Minimum 2 steps A13.2
    const updated = content.steps.filter((_, idx) => idx !== stepIdx);
    updateBlockContent(id, {
      steps: updated,
      currentStep: Math.min(activeStep, updated.length - 1)
    });
  };

  const toggleBranching = () => {
    updateBlockContent(id, { isBranching: !content.isBranching });
  };

  if (isPreview) {
    return (
      <div 
        className="flex flex-col gap-4 p-5 border border-emerald-950/80 bg-[#041208]/20 rounded-2xl shadow-xl w-full select-text"
        role="progressbar"
        aria-valuenow={activeStep + 1}
        aria-valuemin={1}
        aria-valuemax={content.steps.length}
      >
        <div className="flex items-center justify-between border-b border-emerald-950 pb-2 select-none">
          <div className="flex items-center gap-2 text-slate-400">
            <Milestone className="h-4 w-4 text-[#d4af37]" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Step {activeStep + 1} of {content.steps.length}: {content.steps[activeStep]?.label}
            </span>
          </div>
          <span className="text-[10px] font-bold text-slate-500 uppercase">
            {content.isBranching ? 'Branching' : 'Sequential'}
          </span>
        </div>

        {/* Visual Progress Nodes */}
        <div className="flex items-center justify-between w-full relative py-4 select-none">
          {/* Horizontal Connector Line */}
          <div className="absolute top-[35px] left-4 right-4 h-1 bg-[#030a06] rounded z-0" />
          <div 
            className="absolute top-[35px] left-4 h-1 bg-[#d4af37] rounded transition-all duration-300 z-0" 
            style={{ width: `${(activeStep / (content.steps.length - 1)) * 92}%` }}
          />

          {content.steps.map((step, idx) => {
            const isCompleted = idx < activeStep;
            const isActive = idx === activeStep;
            const isSelectable = content.isBranching || idx <= activeStep + 1;

            let circleClass = "w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all duration-200 z-10 focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:ring-offset-2 ";
            
            if (isActive) {
              circleClass += "bg-[#d4af37] border-[#e5c158] text-black scale-110 shadow-lg shadow-emerald-500/20";
            } else if (isCompleted) {
              circleClass += "bg-[#030a06] border-emerald-800 text-emerald-400";
            } else {
              circleClass += "bg-[#020805] border-emerald-950 text-slate-650";
            }

            return (
              <button
                key={idx}
                onClick={() => handleStepClick(idx)}
                disabled={!isSelectable}
                className={`${circleClass} ${isSelectable ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                title={step.label}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {/* Selected step details */}
        <div className="p-3 border border-emerald-950 bg-[#020805]/45 rounded-xl leading-relaxed">
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
            Milestone Focus
          </span>
          <p className="text-xs font-bold text-slate-250 mt-0.5">
            {content.steps[activeStep]?.label}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-4 p-4 border border-emerald-950 bg-[#041208]/25 rounded-xl select-none ${isLocked ? 'opacity-80' : ''}`}>
      <div className="flex items-center justify-between gap-4 border-b border-emerald-950 pb-2.5">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
          <Milestone className="h-4 w-4 text-[#d4af37]" />
          <span>Progress Tracker Settings</span>
        </div>
        {!isLocked && (
          <button
            onClick={toggleBranching}
            className={`px-2.5 py-1 text-xs font-bold border rounded-lg cursor-pointer transition-colors ${
              content.isBranching ? 'bg-[#d4af37] border-[#e5c158] text-black' : 'bg-[#030a06] border-emerald-950 text-slate-500'
            }`}
          >
            Mode: {content.isBranching ? 'Non-Linear (Branching)' : 'Linear'}
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Milestone Steps List
          </label>
          <div className="flex flex-col gap-2.5">
            {content.steps.map((step, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-500 px-2 py-1 bg-[#030a06] border border-emerald-950 rounded">
                  S{idx + 1}
                </span>
                
                <input
                  type="text"
                  value={step.label}
                  onChange={(e) => handleUpdateStepLabel(idx, e.target.value)}
                  disabled={isLocked}
                  placeholder={`Step ${idx + 1} milestone label...`}
                  className="w-full px-3 py-1.5 text-xs bg-[#030a06]/65 border border-emerald-950 focus:border-[#d4af37] rounded-lg text-slate-200 outline-none select-text"
                />

                {!isLocked && content.steps.length > 2 && (
                  <button
                    onClick={() => handleRemoveStep(idx)}
                    className="p-1.5 text-rose-500 hover:text-rose-400 bg-[#020805] border border-emerald-950 hover:border-emerald-900 rounded-lg cursor-pointer"
                    title="Remove Milestone Step"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {!isLocked && (
            <button
              onClick={handleAddStep}
              className="flex items-center justify-center gap-1.5 self-start px-3 py-1.5 bg-[#d4af37]/20 hover:bg-[#d4af37]/35 border border-[#d4af37]/30 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer mt-1"
            >
              <Plus className="h-3.5 w-3.5 text-white" />
              <span className="text-white">Add Milestone Step</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
