import React, { useEffect, useState } from 'react';

interface JoinRoomNotificationProps {
  message: string;
  onResponse: (response: boolean) => void;
  roomName: string;
  autoClose?: number | false;
}

const JoinRoomNotification: React.FC<JoinRoomNotificationProps> = ({
  message,
  onResponse,
  roomName,
  autoClose = 5000,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        handleResponse(false); // Auto-decline if no response
      }, autoClose);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose]);

  const handleResponse = (response: boolean) => {
    setIsVisible(false);
    onResponse(response);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className={`
        relative bg-gradient-to-r from-purple-500 to-blue-600 
        dark:from-purple-700 dark:to-blue-800
        text-white p-6 rounded-xl shadow-2xl max-w-md w-full mx-4
        animate-fadeIn
      `}>
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-bold">Join Room Request</h3>
            <button
              onClick={() => handleResponse(false)}
              className="text-white hover:text-gray-200 transition-colors focus:outline-none"
              aria-label="Close notification"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <p>{message}</p>
          <p className="font-semibold">Room: <span className="font-normal">{roomName}</span></p>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              onClick={() => handleResponse(false)}
              className={`
                px-4 py-2 rounded-lg border border-white/30
                hover:bg-white/10 transition-colors
                focus:outline-none focus:ring-2 focus:ring-white/50
              `}
            >
              Decline
            </button>
            <button
              onClick={() => handleResponse(true)}
              className={`
                px-4 py-2 rounded-lg bg-white text-purple-600
                dark:text-purple-800 font-medium
                hover:bg-gray-100 transition-colors
                focus:outline-none focus:ring-2 focus:ring-white
              `}
            >
              Join Room
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinRoomNotification;