import React from 'react';
import { CloseIcon } from './icons/CloseIcon';

interface AboutModalProps {
  onClose: () => void;
  theme: 'light' | 'dark';
}

export const AboutModal: React.FC<AboutModalProps> = ({ onClose, theme }) => {
    
  const themeClasses = {
      dark: 'bg-[#161b22]/80 text-gray-200 border-white/10',
      light: 'bg-white/80 text-gray-800 border-black/10'
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-title"
    >
      <div 
        className={`rounded-lg shadow-2xl p-6 w-full max-w-md border backdrop-blur-xl relative ${themeClasses[theme]}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-100 transition-colors"
          aria-label="Close"
        >
          <CloseIcon />
        </button>
        <h2 id="about-title" className="text-xl font-bold mb-4">About Mavis</h2>
        <div className="space-y-4 text-sm">
          <p>
            This application is designed to enhance and translate your plain text prompts into a perfect, structured XML format using the power of the Gemini API.
          </p>
          <p>
            Activate <strong className="text-blue-400">'Mavis Thinking'</strong> for a deeper reasoning process when tackling your most complex queries. It also leverages a built-in knowledge base, like the 'Lovable Prompt Directory', to ensure high accuracy and relevance.
          </p>
          <p>
            Simply type your idea, and let Mavis craft the ideal prompt for you.
          </p>
        </div>
      </div>
    </div>
  );
};