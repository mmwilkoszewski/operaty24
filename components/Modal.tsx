import React, { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'md' | 'lg' | 'xl' | '2xl';
  zIndex?: number;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md', zIndex = 1050 }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-5xl',
  };
  
  const modalWidthClass = sizeClasses[size] || sizeClasses.md;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4"
      style={{ zIndex }}
    >
      <div className={`bg-white rounded-lg shadow-xl w-full ${modalWidthClass} max-h-[90vh] flex flex-col`}>
        <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
        </div>
        <div className="p-6 overflow-y-auto flex-grow">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;