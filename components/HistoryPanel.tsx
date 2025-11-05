import React from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { Chat } from '../App';

interface HistoryPanelProps {
  history: Chat[];
  onSelectChat: (chat: Chat) => void;
  onClose: () => void;
  theme: 'light' | 'dark';
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onSelectChat, onClose, theme }) => {
    
  const themeClasses = {
      dark: {
          panel: 'bg-[#161b22]/80 border-white/10',
          text: 'text-white',
          item: 'bg-white/5 hover:bg-white/10',
          itemText: 'text-gray-300',
          emptyText: 'text-gray-500',
          closeButton: 'text-gray-400 hover:text-white',
      },
      light: {
          panel: 'bg-white/80 border-black/10',
          text: 'text-black',
          item: 'bg-black/5 hover:bg-black/10',
          itemText: 'text-gray-700',
          emptyText: 'text-gray-500',
          closeButton: 'text-gray-500 hover:text-black',
      }
  }

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/30 z-[60] md:hidden animate-fade-in-fast"
        onClick={onClose}
      ></div>
      <div className={`fixed top-0 left-0 h-full w-72 backdrop-blur-lg border-r z-[70] transform transition-transform duration-300 ease-in-out animate-slide-in ${themeClasses[theme].panel}`}>
        <div className="p-4 h-full flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-lg font-bold ${themeClasses[theme].text}`}>Chat History</h2>
            <button 
              onClick={onClose}
              className={`transition-colors ${themeClasses[theme].closeButton}`}
              aria-label="Close history"
            >
              <CloseIcon />
            </button>
          </div>
          <div className="flex-grow overflow-y-auto -mr-2 pr-2">
            {history.length === 0 ? (
              <p className={`text-sm text-center mt-8 ${themeClasses[theme].emptyText}`}>No chats yet.</p>
            ) : (
              <ul className="space-y-2">
                {history.slice().reverse().map((chat, index) => (
                  <li key={history.length - 1 - index}>
                    <button 
                      onClick={() => onSelectChat(chat)}
                      className={`w-full text-left p-2 rounded-md text-sm truncate transition-colors ${themeClasses[theme].item} ${themeClasses[theme].itemText}`}
                    >
                      {chat.prompt}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// Add CSS for animations
if (!document.querySelector('#animation-styles')) {
    const style = document.createElement('style');
    style.id = 'animation-styles';
    style.textContent = `
      @keyframes slide-in {
        from { transform: translateX(-100%); }
        to { transform: translateX(0); }
      }
      .animate-slide-in {
        animation: slide-in 0.3s cubic-bezier(0.25, 1, 0.5, 1);
      }
      @keyframes fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      .animate-fade-in {
        animation: fade-in 0.3s ease-in-out;
      }
      .animate-fade-in-fast {
        animation: fade-in 0.2s ease-in-out;
      }
    `;
    document.head.append(style);
}