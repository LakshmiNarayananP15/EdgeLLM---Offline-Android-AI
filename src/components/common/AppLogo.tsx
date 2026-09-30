import React from 'react';

interface AppLogoProps {
  className?: string;
  size?: number | string;
}

export const AppLogo: React.FC<AppLogoProps> = ({ className = 'w-7 h-7', size }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 400"
      width={size || '100%'}
      height={size || '100%'}
      className={className}
      aria-label="EdgeLLM Android Logo"
    >
      <defs>
        {/* Android Green to Deep Tech Blue Gradient */}
        <linearGradient id="aiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3DDC84" />
          <stop offset="100%" stopColor="#1A73E8" />
        </linearGradient>

        {/* Neon Edge Glow Gradient */}
        <linearGradient id="edgeGlow" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00E5FF" />
          <stop offset="100%" stopColor="#9D4EDD" />
        </linearGradient>
      </defs>

      {/* App Icon Background */}
      <rect width="400" height="400" rx="80" fill="#0D1117" />

      {/* Outer Hexagon (Edge Node Representation) */}
      <polygon
        points="200,40 340,120 340,280 200,360 60,280 60,120"
        fill="none"
        stroke="url(#edgeGlow)"
        strokeWidth="6"
        opacity="0.7"
      />

      {/* Edge Data Pathways (Circuit lines pulling data from the edge) */}
      <path
        d="M 60 120 L 140 165 M 340 120 L 260 165 M 60 280 L 135 240 M 340 280 L 265 240 M 200 360 L 200 285"
        stroke="#3DDC84"
        strokeWidth="4"
        strokeDasharray="6 6"
        opacity="0.5"
      />

      {/* Android Dome (AI Brain Base) */}
      <path d="M 120 210 A 80 80 0 0 1 280 210 Z" fill="url(#aiGradient)" />

      {/* Stylized Circuit Antennae */}
      <line
        x1="145"
        y1="125"
        x2="165"
        y2="155"
        stroke="#3DDC84"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <line
        x1="255"
        y1="125"
        x2="235"
        y2="155"
        stroke="#1A73E8"
        strokeWidth="8"
        strokeLinecap="round"
      />

      {/* Neural Node Eyes */}
      <circle cx="165" cy="175" r="10" fill="#0D1117" />
      <circle cx="235" cy="175" r="10" fill="#0D1117" />
      <circle cx="165" cy="175" r="4" fill="#00E5FF" />
      <circle cx="235" cy="175" r="4" fill="#00E5FF" />

      {/* Lower Body Processor (Circuit Board Motif) */}
      <path
        d="M 120 220 H 280 V 260 A 20 20 0 0 1 260 280 H 140 A 20 20 0 0 1 120 260 Z"
        fill="none"
        stroke="url(#aiGradient)"
        strokeWidth="8"
      />

      {/* Core AI Processing Nodes */}
      <circle cx="160" cy="250" r="6" fill="#00E5FF" />
      <circle cx="200" cy="250" r="6" fill="#00E5FF" />
      <circle cx="240" cy="250" r="6" fill="#00E5FF" />

      {/* Core Connections */}
      <line x1="160" y1="250" x2="240" y2="250" stroke="#00E5FF" strokeWidth="3" />
      <line x1="200" y1="210" x2="200" y2="250" stroke="#00E5FF" strokeWidth="3" />
    </svg>
  );
};
