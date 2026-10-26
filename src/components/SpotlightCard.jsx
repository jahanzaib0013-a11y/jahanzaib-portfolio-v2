import { useRef, useState } from 'react';

/**
 * GetLayers-inspired SpotlightCard:
 * Dynamic radial gradient border-glow following cursor coordinates.
 */
export const SpotlightCard = ({
  children,
  className = '',
  spotlightColor = 'rgba(145, 94, 255, 0.12)',
  borderColor = 'rgba(145, 94, 255, 0.55)',
  ...props
}) => {
  const divRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseEnter = () => {
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative rounded-2xl border border-black/[0.06] bg-white shadow-card overflow-hidden transition-all duration-300 ${className}`}
      {...props}
    >
      {/* Dynamic Cursor Spotlight Background */}
      <div
        className='pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300'
        style={{
          opacity,
          background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 70%)`,
        }}
      />

      {/* Dynamic Cursor Border Highlight */}
      <div
        className='pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300'
        style={{
          opacity,
          border: `1px solid ${borderColor}`,
          maskImage: `radial-gradient(200px circle at ${position.x}px ${position.y}px, black 30%, transparent 80%)`,
          WebkitMaskImage: `radial-gradient(200px circle at ${position.x}px ${position.y}px, black 30%, transparent 80%)`,
        }}
      />

      <div className='relative z-10'>{children}</div>
    </div>
  );
};

export default SpotlightCard;
