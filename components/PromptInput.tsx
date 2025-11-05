import React from 'react';
import { SendIcon } from './icons/SendIcon';

type ConversationState = 'INITIAL' | 'AWAITING_FEEDBACK' | 'AWAITING_CONFIRMATION';

interface PromptInputProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  model: 'flash' | 'pro';
  setModel: (model: 'flash' | 'pro') => void;
  onSubmit: () => void;
  isLoading: boolean;
  theme: 'light' | 'dark';
  ideas: string[];
  isFetchingIdeas: boolean;
  onExploreIdeas: () => void;
  onIdeaClick: (idea: string) => void;
  conversationState: ConversationState;
}

export const PromptInput: React.FC<PromptInputProps> = ({ prompt, setPrompt, model, setModel, onSubmit, isLoading, theme, ideas, isFetchingIdeas, onExploreIdeas, onIdeaClick, conversationState }) => {
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading) {
        onSubmit();
      }
    }
  };
  
  const getPlaceholder = () => {
    switch (conversationState) {
      case 'AWAITING_FEEDBACK':
        return 'Describe the changes you would like to make, or type a new prompt...';
      case 'AWAITING_CONFIRMATION':
        return 'Is the summary of your changes correct? (yes/no)';
      default:
        return 'Ask anything you want...';
    }
  };

  const themeClasses = {
      dark: {
          container: 'bg-gray-900/50 border-white/10',
          textarea: 'text-white placeholder-gray-500',
          iconButton: 'text-gray-400 hover:text-white',
          sendButton: 'bg-white text-black hover:bg-gray-200',
          modelButton: 'bg-white/5 text-gray-500 hover:bg-white/10',
          modelButtonActive: 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30',
          exploreButton: 'bg-blue-800/50 text-blue-300 hover:bg-blue-800/70',
          ideaButton: 'bg-gray-800/60 hover:bg-gray-700/80 text-gray-300'
      },
      light: {
          container: 'bg-white/50 border-black/10',
          textarea: 'text-black placeholder-gray-500',
          iconButton: 'text-gray-600 hover:text-black',
          sendButton: 'bg-black text-white hover:bg-gray-800',
          modelButton: 'bg-black/5 text-gray-500 hover:bg-black/10',
          modelButtonActive: 'bg-blue-500/20 text-blue-600 hover:bg-blue-500/30',
          exploreButton: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
          ideaButton: 'bg-gray-200/80 hover:bg-gray-300/90 text-gray-700'
      }
  }

  return (
    <div className="w-full">
      <div className={`relative border rounded-2xl shadow-xl backdrop-blur-xl p-2 ${themeClasses[theme].container}`}>
          <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={getPlaceholder()}
              className={`w-full h-24 bg-transparent focus:outline-none resize-none p-2 pl-4 text-base ${themeClasses[theme].textarea}`}
              disabled={isLoading}
          />
          <div className="flex justify-between items-center p-2">
                <div className="flex items-center gap-2">
                     <button 
                        onClick={() => setModel(model === 'flash' ? 'pro' : 'flash')}
                        className={`text-[10px] font-bold uppercase tracking-widest rounded-md py-1 px-2 cursor-pointer focus:outline-none transition-colors ${model === 'pro' ? themeClasses[theme].modelButtonActive : themeClasses[theme].modelButton}`}
                    >
                        Mavis Thinking
                    </button>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                      onClick={onSubmit}
                      className={`h-8 w-8 flex items-center justify-center rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${themeClasses[theme].sendButton}`}
                      disabled={isLoading}
                      aria-label="Submit prompt"
                  >
                      <SendIcon />
                  </button>
              </div>
          </div>
      </div>

      {conversationState === 'INITIAL' && (
        <>
          <div className="mt-4 text-center">
            <button
              onClick={onExploreIdeas}
              disabled={isFetchingIdeas}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-wait ${themeClasses[theme].exploreButton}`}
            >
              {isFetchingIdeas ? 'Exploring...' : 'Explore ideas'}
            </button>
          </div>
          
          {ideas.length > 0 && (
            <div className="mt-4 w-full animate-fade-in">
              <p className={`text-sm text-center mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Click an idea to start a chat:
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {ideas.map((idea, index) => (
                  <button
                    key={index}
                    onClick={() => onIdeaClick(idea)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${themeClasses[theme].ideaButton}`}
                  >
                    {idea}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};