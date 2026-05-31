import React, { useState, useEffect } from 'react';

export const CustomCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [trailPosition, setTrailPosition] = useState({ x: 0, y: 0 });
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Hide on touch devices
    if ('ontouchstart' in window) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
      // Trail follows with requestAnimationFrame for smoothness
      requestAnimationFrame(() => {
        setTrailPosition({ x: e.clientX, y: e.clientY });
      });
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.documentElement.addEventListener('mouseleave', handleMouseLeave);
    document.documentElement.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
      document.documentElement.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <>
      {/* Main cursor dot */}
      <div
        className="fixed pointer-events-none z-[99999] mix-blend-difference"
        style={{
          left: position.x - 4,
          top: position.y - 4,
          width: isClicking ? 6 : 8,
          height: isClicking ? 6 : 8,
          borderRadius: '50%',
          background: '#d4af37',
          transition: 'width 0.15s ease, height 0.15s ease',
          boxShadow: '0 0 10px rgba(212,175,55,0.4)',
        }}
      />
      {/* Trailing ring */}
      <div
        className="fixed pointer-events-none z-[99998]"
        style={{
          left: trailPosition.x - 16,
          top: trailPosition.y - 16,
          width: isClicking ? 24 : 32,
          height: isClicking ? 24 : 32,
          borderRadius: '50%',
          border: '1.5px solid rgba(16, 185, 129, 0.4)',
          transition: 'all 0.15s ease-out',
          background: 'transparent',
        }}
      />
    </>
  );
};
