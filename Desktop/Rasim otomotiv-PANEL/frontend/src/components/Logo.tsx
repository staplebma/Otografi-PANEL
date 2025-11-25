import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
  };

  return (
    <div className={`${sizes[size]} ${className}`}>
      {/* Otografi Logo - Hexagon with OT */}
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Hexagon background */}
        <path
          d="M50 5L90 27.5V72.5L50 95L10 72.5V27.5L50 5Z"
          fill="#4FD1C5"
          stroke="#3BBFB3"
          strokeWidth="2"
        />

        {/* O letter */}
        <path
          d="M35 35C42 35 47 40 47 47.5C47 55 42 60 35 60C28 60 23 55 23 47.5C23 40 28 35 35 35ZM35 40C31 40 28 43 28 47.5C28 52 31 55 35 55C39 55 42 52 42 47.5C42 43 39 40 35 40Z"
          fill="white"
          fontFamily="Arial, sans-serif"
          fontWeight="bold"
        />

        {/* T letter */}
        <path
          d="M50 35H77V40H66V60H61V40H50V35Z"
          fill="white"
          fontFamily="Arial, sans-serif"
          fontWeight="bold"
        />
      </svg>
    </div>
  );
};

export default Logo;
