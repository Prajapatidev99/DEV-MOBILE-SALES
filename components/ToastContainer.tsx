
import * as React from 'react';
import Toast, { ToastProps } from './Toast';

interface ToastContainerProps {
  toasts: (ToastProps & { id: number })[];
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts }) => {
  return (
    <div className="fixed top-20 right-4 z-50">
      {toasts.map(toast => (
        <Toast key={toast.id} message={toast.message} type={toast.type} />
      ))}
    </div>
  );
};

export default ToastContainer;