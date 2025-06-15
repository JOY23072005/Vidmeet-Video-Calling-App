import React, { useEffect, useState } from 'react';

interface AlertProps {
  message: string;
  onClose?: () => void;
  onClick?: () =>void;
  type?: 'info' | 'success' | 'warning' | 'error';
  autoClose?: number | false;
}

const Alert: React.FC<AlertProps> = ({
  message,
  onClose,
  onClick,
  type = 'info',
  autoClose = 5000,
}) => {
  const [isVisible, setIsVisible] = useState(!!message);

  useEffect(() => {
    setIsVisible(!!message);
    
    if (message && autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, autoClose);
      
      return () => clearTimeout(timer);
    }
  }, [message, autoClose, onClose]);

  if (!isVisible) return null;

  // Colors for both light and dark themes
  const alertColors = {
    info: {
      light: 'from-blue-400 to-blue-600 text-white',
      dark: 'from-blue-500 to-blue-700 text-white'
    },
    success: {
      light: 'from-green-400 to-green-600 text-white',
      dark: 'from-green-500 to-green-700 text-white'
    },
    warning: {
      light: 'from-yellow-400 to-yellow-600 text-gray-800',
      dark: 'from-yellow-500 to-yellow-700 text-white'
    },
    error: {
      light: 'from-red-400 to-red-600 text-white',
      dark: 'from-red-500 to-red-700 text-white'
    },
  };

  return (
    <div className="fixed inset-0 flex items-start justify-end z-50 pointer-events-none">
      <div className={`
        relative bg-gradient-to-r p-4 rounded-lg shadow-xl 
        max-w-md w-full mx-4 pointer-events-auto animate-fadeIn
        dark:${alertColors[type].dark}
        ${alertColors[type].light}
      `}>
        <div className="flex items-start">
          <div className="flex-1 hover:cursor-pointer" title={onClick?'Click here':''} onClick={onClick}>
            {message}
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              onClose?.();
            }}
            className={`
              ml-4 transition-colors focus:outline-none
              ${type === 'warning' ? 'text-gray-800 dark:text-white' : 'text-white'}
              hover:opacity-80
            `}
            aria-label="Close alert"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Alert;