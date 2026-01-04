import React from 'react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
}

const sizeMap = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-20 h-20',
}

const textSizeMap = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
}

export function Logo({ size = 'md', showText = false }: LogoProps) {
  return (
    <div className="flex items-center gap-2">
      <svg
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
        className={`${sizeMap[size]} flex-shrink-0`}
        style={{ overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="catGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFB366" stopOpacity="1" />
            <stop offset="100%" stopColor="#FF9944" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="noseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF6B9D" stopOpacity="1" />
            <stop offset="100%" stopColor="#FF4081" stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* Head */}
        <circle cx="100" cy="110" r="55" fill="url(#catGradient)" stroke="#FF8855" strokeWidth="2" />

        {/* Left Ear */}
        <path d="M 60 65 Q 45 35 50 50 Q 55 65 65 70 Z" fill="url(#catGradient)" stroke="#FF8855" strokeWidth="2" />
        <path d="M 60 65 Q 52 48 55 60 Q 58 68 62 68 Z" fill="#FFD9B3" />

        {/* Right Ear */}
        <path d="M 140 65 Q 155 35 150 50 Q 145 65 135 70 Z" fill="url(#catGradient)" stroke="#FF8855" strokeWidth="2" />
        <path d="M 140 65 Q 148 48 145 60 Q 142 68 138 68 Z" fill="#FFD9B3" />

        {/* Left Eye */}
        <ellipse cx="85" cy="100" rx="7" ry="10" fill="white" stroke="#FF8855" strokeWidth="1.5" />
        <ellipse cx="85" cy="102" rx="4" ry="6" fill="#333333" />
        <circle cx="86" cy="100" r="2" fill="white" />

        {/* Right Eye */}
        <ellipse cx="115" cy="100" rx="7" ry="10" fill="white" stroke="#FF8855" strokeWidth="1.5" />
        <ellipse cx="115" cy="102" rx="4" ry="6" fill="#333333" />
        <circle cx="116" cy="100" r="2" fill="white" />

        {/* Nose */}
        <path d="M 100 115 L 96 123 L 104 123 Z" fill="url(#noseGradient)" />

        {/* Mouth */}
        <path d="M 100 123 Q 95 128 90 126" stroke="#FF6B9D" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M 100 123 Q 105 128 110 126" stroke="#FF6B9D" strokeWidth="2" fill="none" strokeLinecap="round" />

        {/* Left Whisker */}
        <line x1="65" y1="108" x2="40" y2="105" stroke="#FF8855" strokeWidth="2" strokeLinecap="round" />

        {/* Right Whisker */}
        <line x1="135" y1="108" x2="160" y2="105" stroke="#FF8855" strokeWidth="2" strokeLinecap="round" />

        {/* Blush Left */}
        <circle cx="65" cy="120" r="6" fill="#FFB3D9" opacity="0.6" />

        {/* Blush Right */}
        <circle cx="135" cy="120" r="6" fill="#FFB3D9" opacity="0.6" />

        {/* Happy Badge/Star on Forehead */}
        <circle cx="100" cy="75" r="8" fill="#FFD700" stroke="#FFC107" strokeWidth="1.5" />
        <text x="100" y="80" fontSize="12" fontWeight="bold" textAnchor="middle" fill="#FF8855">
          ✓
        </text>
      </svg>

      {showText && (
        <span className={`font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent ${textSizeMap[size]}`}>
          Purrfect
        </span>
      )}
    </div>
  )
}
