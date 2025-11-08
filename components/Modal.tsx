
import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'default' | 'large';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'default' }) => {
  if (!isOpen) return null;

  const maxWidthClass = size === 'large' ? 'max-w-3xl' : 'max-w-md';
  const paddingClass = size === 'large' ? 'p-4 sm:p-6' : 'p-4';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 overflow-y-auto">
      <div className={`bg-card border border-border rounded-lg shadow-xl w-full ${maxWidthClass} my-4 sm:my-8`}>
        <div className={`${paddingClass} border-b border-border flex items-center justify-between`}>
          <h3 className="text-lg sm:text-xl font-semibold text-foreground">{title}</h3>
          <button
            onClick={onClose}
            className="text-foreground/60 hover:text-foreground transition-colors p-1"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className={paddingClass}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
