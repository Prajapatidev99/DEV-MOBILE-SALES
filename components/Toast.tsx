
import * as React from 'react';

export interface ToastProps {
  message: string;
  type: 'success' | 'error';
}

const Toast: React.FC<ToastProps> = ({ message, type }) => {
  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  
  return (
    <div className={`${bgColor} text-white py-2 px-4 rounded-md shadow-lg mb-2 animate-toast-in-right`}>
      {message}
    </div>
  );
};

export default Toast;