'use client'
import React, { CSSProperties, ReactNode, HTMLAttributes } from 'react'

type AnimationMode = 'auto-rotate' | 'rotate-on-hover'

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
  animationMode = 'rotate-on-hover',
  animationSpeed = 4,
  borderWidth = 1.5,
  borderRadius = 12,
  style = {},
  ...props
}) => {
  return (
    <div
      className={`ab-wrap ${animationMode === 'auto-rotate' ? 'ab-always' : 'ab-on-hover'} ${className}`}
      style={{
        position: 'relative',
        borderRadius: `${borderRadius}px`,
        padding: `${borderWidth}px`,
        background: 'rgba(255,255,255,0.06)',
        overflow: 'hidden',
        ...style,
      }}
      {...props}
    >
      <style>{`
        .ab-wrap {
          transition: background 0.3s ease;
        }
        .ab-wrap::before {
          content: '';
          position: absolute;
          inset: -100%;
          background: conic-gradient(
            from 0deg,
            transparent 0deg,
            transparent 270deg,
            #7ED321 300deg,
            #b8ff4d 330deg,
            #7ED321 360deg
          );
          z-index: 0;
          opacity: 0;
          transition: opacity 0.4s ease;
        }
        .ab-always::before {
          animation: ab-spin var(--ab-speed, 4s) linear infinite;
          opacity: 1;
        }
        .ab-on-hover::before {
          animation: ab-spin var(--ab-speed, 4s) linear infinite;
          animation-play-state: paused;
          opacity: 0;
        }
        .ab-on-hover:hover::before {
          opacity: 1;
          animation-play-state: running;
        }
        .ab-wrap > * {
          position: relative;
          z-index: 1;
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
