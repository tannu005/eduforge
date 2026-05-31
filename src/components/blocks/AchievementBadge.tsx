import React, { useEffect, useState } from 'react';
import { BadgeContent } from '../../types';
import { useModuleStore } from '../../store/useModuleStore';
import { useQuizStore } from '../../store/useQuizStore';
import { Award, Check, Lock, Unlock, ShieldAlert } from 'lucide-react';
import * as Icons from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';
import { Modal } from '../shared/Modal';

interface AchievementBadgeProps {
  id: string;
  content: BadgeContent;
  isLocked: boolean;
  isPreview?: boolean;
}

export const BADGE_ICONS = [
  'Award', 'TrendingUp', 'PiggyBank', 'Coins', 'Briefcase', 'Scale', 'DollarSign',
  'Activity', 'Bookmark', 'Shield', 'Sparkles', 'Star', 'Trophy', 'Zap', 'Target',
  'LineChart', 'PieChart', 'Percent', 'Calculator', 'Compass', 'BookOpen'
];

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  id,
  content,
  isLocked,
  isPreview = false,
}) => {
  const updateBlockContent = useModuleStore((state) => state.updateBlockContent);
  
  // Student preview unlock state
  const { unlockedBadgeIds, unlockBadge } = useQuizStore();
  const isUnlocked = isPreview ? unlockedBadgeIds.includes(id) : content.isUnlocked;

  const [showCelebrateModal, setShowCelebrateModal] = useState(false);

  const triggerConfetti = () => {
    // Elegant gold & mint emerald confetti spray (A5.1 Badge unlock confetti celebration)
    const duration = 1.5 * 1000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#d4af37', '#10b981', '#f59e0b', '#064e3b']
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#d4af37', '#10b981', '#f59e0b', '#064e3b']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  const handleUnlockToggle = () => {
    if (isPreview) {
      if (!isUnlocked) {
        unlockBadge(id);
        triggerConfetti();
        setShowCelebrateModal(true);
      }
    } else {
      const nextUnlockedState = !content.isUnlocked;
      updateBlockContent(id, { isUnlocked: nextUnlockedState });
      if (nextUnlockedState) {
        triggerConfetti();
        setShowCelebrateModal(true);
      }
    }
  };

  // Render selected lucide icon
  const renderIcon = (iconName: string, sizeClass = "h-8 w-8") => {
    const IconComponent = (Icons as any)[iconName];
    return IconComponent ? <IconComponent className={sizeClass} /> : <Award className={sizeClass} />;
  };

  if (isPreview) {
    return (
      <>
        <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 18 }}
        className={`relative flex items-center gap-4 p-5 border rounded-2xl transition-all duration-300 shadow-xl overflow-hidden select-text ${
          isUnlocked 
            ? 'border-[#d4af37]/35 bg-gradient-to-br from-[#020805] to-[#d4af37]/10 text-[#f3f4f6] shadow-[#d4af37]/5' 
            : 'border-emerald-950/40 bg-[#030a06]/40 text-emerald-800/60 opacity-60'
        }`}
        role="region"
        aria-label={`Achievement Badge: ${content.title}`}
      >
        {/* Unlock Confetti glow layer */}
        {isUnlocked && (
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/5 rounded-full blur-2xl -mr-10 -mt-10" />
        )}

        <motion.div 
          animate={isUnlocked ? { scale: [1, 1.2, 0.95, 1.05, 1], rotate: [0, 10, -10, 5, 0] } : {}}
          transition={{ type: "spring", stiffness: 140, damping: 12, delay: 0.1 }}
          className={`p-3 border rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
            isUnlocked 
              ? 'bg-[#d4af37]/20 border-[#d4af37]/30 text-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.15)]' 
              : 'bg-[#030e07] border-emerald-950 text-emerald-800'
          }`}
        >
          {renderIcon(content.icon || 'Award')}
        </motion.div>

        <div className="flex-grow flex flex-col">
          <div className="flex items-center gap-2">
            <h4 className="font-extrabold text-sm font-display tracking-tight text-slate-100">
              {content.title}
            </h4>
            {isUnlocked ? (
              <motion.span 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-0.5 text-[9px] font-bold text-[#d4af37] px-1.5 py-0.5 border border-[#d4af37]/25 bg-[#d4af37]/10 rounded uppercase"
              >
                Unlocked
              </motion.span>
            ) : (
              <span className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 px-1.5 py-0.5 border border-emerald-950 bg-[#030e07] rounded uppercase">
                Locked
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 font-medium leading-relaxed mt-0.5">
            {content.description}
          </p>
          <span className="text-[10px] text-emerald-600/80 font-medium font-mono leading-none mt-2">
            Unlock rule: {content.unlockCondition}
          </span>
        </div>

        {/* Manual simulation trigger for student testing */}
        {!isUnlocked && (
          <motion.button
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleUnlockToggle}
            className="flex-shrink-0 p-2 bg-[#030e07] hover:bg-[#082212] border border-[#082212] text-emerald-600 hover:text-[#d4af37] rounded-xl transition-all cursor-pointer focus:outline-none"
            title="Unlock Badge (Simulate)"
          >
            <Lock className="h-4 w-4" />
          </motion.button>
        )}
      </motion.div>

      <Modal
        isOpen={showCelebrateModal}
        onClose={() => setShowCelebrateModal(false)}
        title="🏆 Achievement Unlocked!"
        footer={
          <button
            onClick={() => setShowCelebrateModal(false)}
            className="px-4 py-2 bg-[#d4af37] hover:bg-[#e5c158] text-black font-extrabold text-xs rounded-xl shadow-lg transition-all cursor-pointer focus:outline-none"
          >
            Awesome!
          </button>
        }
      >
        <div className="flex flex-col items-center text-center gap-4 py-3 select-text animate-[fadeIn_0.2s_ease-out]">
          <motion.div 
            animate={{ scale: [1, 1.3, 0.9, 1.1, 1], rotate: [0, 15, -15, 10, 0] }}
            transition={{ type: "spring", stiffness: 140, damping: 10 }}
            className="p-5 bg-[#d4af37]/20 border border-[#d4af37]/30 text-[#d4af37] rounded-3xl shadow-[0_0_30px_rgba(212,175,55,0.25)] flex items-center justify-center"
          >
            {renderIcon(content.icon || 'Award', "h-14 w-14")}
          </motion.div>
          <div className="flex flex-col gap-1.5">
            <h3 className="text-lg font-extrabold font-display text-white">
              {content.title}
            </h3>
            <p className="text-xs text-slate-350 leading-relaxed font-semibold px-4">
              {content.description}
            </p>
          </div>
          <div className="px-3 py-1 bg-emerald-950/30 border border-emerald-900/30 rounded-xl mt-2 select-none">
            <span className="text-[10px] text-emerald-400 font-bold font-mono uppercase tracking-wider">
              Unlocked via: {content.unlockCondition}
            </span>
          </div>
        </div>
      </Modal>
    </>
  );
}

  return (
    <div className={`flex flex-col gap-4 p-4 border border-[#082212]/80 bg-[#030a06]/30 rounded-xl select-none ${isLocked ? 'opacity-80' : ''}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#04140a] pb-2.5">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
          <Award className="h-4 w-4 text-[#d4af37]" />
          <span>Achievement Badge Settings</span>
        </div>
        {!isLocked && (
          <button
            onClick={handleUnlockToggle}
            className={`px-2.5 py-1 text-xs font-bold border rounded-lg cursor-pointer transition-all flex items-center gap-1.5 ${
              content.isUnlocked 
                ? 'bg-[#d4af37] border-[#b8962f] text-black font-semibold hover:bg-[#c29e2e]' 
                : 'bg-[#030e07] border-[#082212]/80 text-emerald-600 hover:text-emerald-400'
            }`}
          >
            {content.isUnlocked ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
            <span>{content.isUnlocked ? 'Unlocked (Celebrated)' : 'Locked'}</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-emerald-400/80 uppercase tracking-wider">
              Badge Title
            </label>
            <input
              type="text"
              value={content.title}
              onChange={(e) => updateBlockContent(id, { title: e.target.value })}
              disabled={isLocked}
              placeholder=" Savvy Budgeter..."
              className="px-3 py-1.5 text-xs bg-[#030e07]/60 border border-[#082212]/80 focus:border-[#d4af37] rounded-lg text-slate-200 outline-none select-text"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-emerald-400/80 uppercase tracking-wider">
              Description
            </label>
            <input
              type="text"
              value={content.description}
              onChange={(e) => updateBlockContent(id, { description: e.target.value })}
              disabled={isLocked}
              placeholder="Unlock description..."
              className="px-3 py-1.5 text-xs bg-[#030e07]/60 border border-[#082212]/80 focus:border-[#d4af37] rounded-lg text-slate-200 outline-none select-text"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-emerald-400/80 uppercase tracking-wider">
              Unlock Trigger Condition
            </label>
            <input
              type="text"
              value={content.unlockCondition}
              onChange={(e) => updateBlockContent(id, { unlockCondition: e.target.value })}
              disabled={isLocked}
              placeholder="e.g. Solve Compound interest calculator..."
              className="px-3 py-1.5 text-xs bg-[#030e07]/60 border border-[#082212]/80 focus:border-[#d4af37] rounded-lg text-slate-200 outline-none select-text"
            />
          </div>
        </div>

        {/* Icon Grid Choice */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-emerald-400/80 uppercase tracking-wider">
            Select Badge Icon
          </label>
          {!isLocked ? (
            <div className="grid grid-cols-6 gap-1.5 p-2.5 bg-[#020a04]/30 border border-[#04140a] rounded-xl overflow-y-auto max-h-[140px]">
              {BADGE_ICONS.map((iconName) => (
                <button
                  key={iconName}
                  onClick={() => updateBlockContent(id, { icon: iconName })}
                  className={`p-2 rounded-lg border flex items-center justify-center cursor-pointer transition-colors focus:outline-none ${
                    content.icon === iconName 
                      ? 'bg-[#d4af37] border-[#b8962f] text-black hover:bg-[#c29e2e]' 
                      : 'bg-[#010603] border-emerald-950/50 text-emerald-600 hover:text-emerald-400 hover:border-[#d4af37]/35'
                  }`}
                  title={iconName}
                >
                  {renderIcon(iconName, "h-4 w-4")}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center p-8 bg-[#020a04]/25 border border-emerald-950/50 rounded-xl">
              <div className="p-3 bg-[#d4af37]/20 border border-[#d4af37]/20 text-[#d4af37] rounded-2xl">
                {renderIcon(content.icon || 'Award', "h-8 w-8")}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
