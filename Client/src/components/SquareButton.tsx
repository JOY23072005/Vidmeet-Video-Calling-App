import React from 'react';
import * as LucideIcons from 'lucide-react';

interface SquareButtonProps {
  icon: keyof typeof LucideIcons;
  bgColor?: string;
  size?: number;
  onClick?: () => void;
  title?: string;
}

const SquareButton: React.FC<SquareButtonProps> = ({
  icon,
  bgColor = '#3b82f6', // Default blue color
  size = 40, // Default size
  title="click here",
  onClick
}) => {
  const LucideIcon = LucideIcons[icon] as React.ComponentType<{
    size?: number;
    color?: string;
  }>;

  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        backgroundColor: bgColor,
        width: `${size}px`,
        height: `${size}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        padding: '0',
        margin: '4px',
        transition: 'transform 0.2s, opacity 0.2s'
      }}
      className="hover:scale-105 active:scale-95 active:opacity-80"
    >
      {LucideIcon && (
        <LucideIcon 
          size={size * 0.6} // Icon is 60% of button size
          color="white" // Default white icon color
        />
      )}
    </button>
  );
};

export default SquareButton;