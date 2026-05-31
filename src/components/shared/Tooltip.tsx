import React, { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => setIsVisible(true), 300);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const positionClasses: Record<string, string> = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses: Record<string, string> = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-[#082212]',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-[#082212]',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-[#082212]',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-[#082212]',
  };

  return (
    <div className="relative inline-flex" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {children}
      {isVisible && (
        <div
          className={`absolute z-[200] px-3 py-2 bg-[#020805]/95 border border-[#082212] rounded-xl text-xs text-slate-300 font-medium whitespace-nowrap shadow-xl shadow-black/40 backdrop-blur-md select-none animate-[fadeIn_0.15s_ease-out] ${positionClasses[position]}`}
          role="tooltip"
        >
          {content}
          <div className={`absolute w-0 h-0 border-4 border-transparent ${arrowClasses[position]}`} />
        </div>
      )}
    </div>
  );
};
