// FIX: Implement the TopBar component to resolve module errors caused by placeholder content.
import React from 'react';
import { PlusIcon } from './icons/PlusIcon';
import { HistoryIcon } from './icons/HistoryIcon';
import { InfoIcon } from './icons/InfoIcon';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';

interface TopBarProps {
  onNewChat: () => void;
  onToggleHistory: () => void;
  onToggleAbout: () => void;
  onToggleSettings: () => void;
  theme: 'light' | 'dark';
}

export const TopBar: React.FC<TopBarProps> = ({ onNewChat, onToggleHistory, onToggleAbout, onToggleSettings, theme }) => {
  const themeClasses = {
    dark: {
      bar: 'bg-gray-900/50 border-white/10 text-gray-300',
      button: 'hover:bg-white/10 text-gray-400 hover:text-white',
      logo: 'text-white'
    },
    light: {
      bar: 'bg-white/50 border-black/10 text-gray-800',
      button: 'hover:bg-black/10 text-gray-600 hover:text-black',
      logo: 'text-black'
    }
  };

  return (
    <header className={`sticky top-0 left-0 right-0 z-50 p-2 backdrop-blur-md border-b ${themeClasses[theme].bar}`}>
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <button onClick={onNewChat} className={`flex items-center gap-2 p-2 rounded-md transition-colors ${themeClasses[theme].button}`} aria-label="New Chat">
            <PlusIcon />
            <span className="text-sm font-medium hidden sm:inline">New Chat</span>
          </button>
        </div>
        
        <h1 className={`text-xl font-bold tracking-wider ${themeClasses[theme].logo}`}>MAVIS</h1>

        <div className="flex items-center gap-1 sm:gap-2">
          <button onClick={onToggleHistory} className={`p-2 rounded-full transition-colors ${themeClasses[theme].button}`} aria-label="Toggle History">
            <HistoryIcon />
          </button>
          <button onClick={onToggleAbout} className={`p-2 rounded-full transition-colors ${themeClasses[theme].button}`} aria-label="About Mavis">
            <InfoIcon />
          </button>
          <button onClick={onToggleSettings} className={`p-2 rounded-full transition-colors ${themeClasses[theme].button}`} aria-label="Toggle Theme">
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </div>
    </header>
  );
};
