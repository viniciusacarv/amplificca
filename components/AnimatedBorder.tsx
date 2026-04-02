'use client'
import React, { CSSProperties, ReactNode, HTMLAttributes } from 'react'

type AnimationMode = 'auto-rotate' | 'rotate-on-hover' | 'stop-rotate-on-hover'

interface AnimatedBorderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className'> {
  children: ReactNode
  className?: string
  animationMode?: AnimationMode
  animationSpeed?: number
  borderWidth?: number
  borderRadius?: number
  style?: CSSProperties
}

const AnimatedBorder: React.FC<AnimatedBorderProps> = ({
  children,
  className = '',
  animationMode = 'auto-rotate',
  animationSpeed = 4,
  borderWidth = 1.5,
  borderRadius = 12,
  style = {},
  ...props
}) => {
  const animClass =
    animationMode === 'auto-rotate' ? 'ab-auto' :
    animationMode === 'rotate-on-hover' ? 'ab-hover' : 'ab-stop-hover'

  const combined: CSSProperties = {
    '--ab-speed': `${animationSpeed}s`,
    '--ab-width': `${borderWidth}px`,
    '--ab-radius': `${borderRadius}px`,
    '--ab-primary': '#7ED321',
    '--ab-secondary': '#5fa818',
    '--ab-accent': '#b8ff4d',
    '--ab-bg': '#0d0d0d',
    position: 'relative',
    borderRadius: `${borderRadius}px`,
    ...style,
  } as CSSProperties

  return (
    <div className={`ab-root ${animClass} ${className}`} style={combined} {...props}>
      <style>{`
        .ab-root {
          isolation: isolate;
        }
        .ab-root::before {
          content: '';
          position: absolute;
          inset: calc(var(--ab-width) * -1);
          border-radius: calc(var(--ab-radius) + var(--ab-width));
          background: conic-gradient(
            from 0deg,
            var(--ab-primary),
            var(--ab-accent),
            transparent 40%,
            transparent 60%,
            var(--ab-secondary),
            var(--ab-primary)
          );
          z-index: -1;
          opacity: 0;
          transition: opacity 0.4s ease;
        }
        .ab-root::after {
          content: '';
          position: absolute;
          inset: var(--ab-width);
          border-radius: calc(var(--ab-radius) - var(--ab-width) / 2);
          background: var(--ab-bg);
          z-index: -1;
        }

        /* auto-rotate */
        .ab-auto::before {
          opacity: 1;
          animation: ab-spin var(--ab-speed) linear infinite;
        }

        /* rotate-on-hover */
        .ab-hover::before {
          opacity: 0;
          animation: ab-spin var(--ab-speed) linear infinite;
          animation-play-state: paused;
        }
        .ab-hover:hover::before {
          opacity: 1;
          animation-play-state: running;
        }

        /* stop-rotate-on-hover */
        .ab-stop-hover::before {
          opacity: 1;
          animation: ab-spin var(--ab-speed) linear infinite;
        }
        .ab-stop-hover:hover::before {
          animation-play-state: paused;
          opacity: 1;
        }

        @keyframes ab-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
      {children}
    </div>
  )
}

export default AnimatedBorder
