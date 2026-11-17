import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#17130F]/50"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative z-10 w-full ${maxWidth} bg-white border border-[#E6E2DC] max-h-[90vh] flex flex-col animate-toast-enter`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E6E2DC]">
          <h2 className="text-lg font-semibold text-[#17130F]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 text-[#625D57] hover:text-[#17130F] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
