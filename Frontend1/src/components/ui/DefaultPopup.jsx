import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const DefaultPopup = ({
  isOpen,
  onClose,
  title,
  children,
  showCloseButton = true,
  actions,
  maxWidth = 'md'
}) => {
  // Effect for scroll lock
  useEffect(() => {
    if (isOpen) {
      // Store current scroll position and lock scrolling
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      // Restore scrolling and scroll position
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, parseInt(scrollY || '0', 10) * -1);
    }

    return () => {
      // Cleanup: ensure scroll is restored when component unmounts
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    full: 'max-w-full'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
      <div
        className={`bg-[#F5F5F5] w-full ${maxWidthClasses[maxWidth]} m-4 rounded-[40px] border-[3px] border-[#69DC9E] shadow-xl`}
      >
        {/* Header */}
        <div className="relative px-6 py-4 border-b-2 border-[#69DC9E]">
          <h2 className="text-xl font-semibold text-center pr-8">{title}</h2>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-[#69DC9E]/20 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
          {children}
        </div>

        {/* Actions */}
        {actions && (
          <div className="px-6 py-4 border-t-2 border-[#69DC9E] flex justify-end gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default DefaultPopup;