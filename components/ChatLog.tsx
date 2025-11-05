import React, { useEffect, useRef } from 'react';
import { XmlBlock } from './XmlBlock';

export interface ChatMessage {
  sender: 'user' | 'mavis';
  content: string;
  type: 'text' | 'xml';
}

interface ChatLogProps {
  log: ChatMessage[];
  isLoading: boolean;
  theme: 'light' | 'dark';
}

export const ChatLog: React.FC<ChatLogProps> = ({ log, isLoading, theme }) => {
  const endOfMessagesRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log, isLoading]);

  const themeClasses = {
    dark: {
      userBubble: 'bg-blue-800/50 text-blue-100',
      mavisBubble: 'bg-gray-800/60 text-gray-300',
    },
    light: {
      userBubble: 'bg-blue-100 text-blue-900',
      mavisBubble: 'bg-gray-200 text-gray-800',
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      {log.map((message, index) => (
        <div key={index} className={`flex items-start gap-3 ${message.sender === 'user' ? 'justify-end' : ''}`}>
          {message.sender === 'mavis' && (
             <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${themeClasses[theme].mavisBubble}`}>M</div>
          )}
           <div className={`max-w-xl animate-fade-in ${message.sender === 'user' ? 'order-1' : ''}`}>
             {message.type === 'xml' ? (
                <XmlBlock xmlContent={message.content} theme={theme} />
             ) : (
                <div className={`px-4 py-2 rounded-lg whitespace-pre-wrap ${message.sender === 'user' ? themeClasses[theme].userBubble : themeClasses[theme].mavisBubble}`}>
                    {message.content}
                </div>
             )}
          </div>
        </div>
      ))}
      {isLoading && (
        <div className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${themeClasses[theme].mavisBubble}`}>M</div>
            <div className={`px-4 py-2 rounded-lg ${themeClasses[theme].mavisBubble}`}>
                <span className="animate-pulse">Mavis is typing...</span>
            </div>
        </div>
      )}
      <div ref={endOfMessagesRef} />
    </div>
  );
};
