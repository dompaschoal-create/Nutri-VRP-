import React from 'react';

interface EkgHeartbeatLineProps {
  className?: string;
  width?: number;
  height?: number;
}

export const EkgHeartbeatLine: React.FC<EkgHeartbeatLineProps> = ({
  className = '',
  width = 160,
  height = 28,
}) => {
  return (
    <div className={`relative flex items-center justify-center overflow-hidden ${className}`}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 200 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-sm"
      >
        <defs>
          <linearGradient id="ekgGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.2" />
            <stop offset="35%" stopColor="#2563eb" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#f59e0b" stopOpacity="1" />
            <stop offset="65%" stopColor="#2563eb" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="glowDot" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>

        {/* Linha de base suave guia */}
        <path
          d="M 0 20 L 45 20 L 55 14 L 65 24 L 75 20 L 85 20 L 92 5 L 98 35 L 105 10 L 112 28 L 118 20 L 130 20 L 140 16 L 150 20 L 200 20"
          stroke="#94a3b8"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity="0.25"
        />

        {/* Linha animada do eletrocardiograma (ECG / EKG) */}
        <path
          d="M 0 20 L 45 20 L 55 14 L 65 24 L 75 20 L 85 20 L 92 5 L 98 35 L 105 10 L 112 28 L 118 20 L 130 20 L 140 16 L 150 20 L 200 20"
          stroke="url(#ekgGradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="ekg-active-line"
        />
      </svg>
    </div>
  );
};

