import React, { useState, useCallback, useEffect } from 'react';
import { TopBar } from './components/TopBar';
import { PromptInput } from './components/PromptInput';
import { ChatLog, ChatMessage } from './components/ChatLog';
import { XmlBlock } from './components/XmlBlock';
import { AboutModal } from './components/AboutModal';
import { HistoryPanel } from './components/HistoryPanel';
import { enhanceAndTranslatePrompt, getStartupIdeas, getConfirmationMessage, refineXml } from './services/geminiService';

export interface Chat {
  prompt: string;
  result: string;
  model: 'flash' | 'pro';
  log: ChatMessage[];
}

type Theme = 'dark' | 'light';
type ConversationState = 'INITIAL' | 'AWAITING_FEEDBACK' | 'AWAITING_CONFIRMATION';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [conversationLog, setConversationLog] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [model, setModel] = useState<'flash' | 'pro'>('flash');
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme>('dark');
  const [showAboutModal, setShowAboutModal] = useState<boolean>(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState<boolean>(false);
  const [history, setHistory] = useState<Chat[]>([]);
  const [ideas, setIdeas] = useState<string[]>([]);
  const [isFetchingIdeas, setIsFetchingIdeas] = useState<boolean>(false);
  
  const [conversationState, setConversationState] = useState<ConversationState>('INITIAL');
  const [currentXml, setCurrentXml] = useState<string>('');
  const [requestedEdits, setRequestedEdits] = useState<string>('');

  const handleSubmit = useCallback(async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    const currentPrompt = prompt;
    
    const userMessage: ChatMessage = { sender: 'user', content: currentPrompt, type: 'text' };
    setConversationLog(prev => [...prev, userMessage]);
    
    setPrompt('');

    try {
      if (conversationState === 'INITIAL') {
        setIdeas([]);
        const xml = await enhanceAndTranslatePrompt(currentPrompt, model);
        setCurrentXml(xml);
        const xmlMessage: ChatMessage = { sender: 'mavis', content: xml, type: 'xml' };
        const followupMessage: ChatMessage = { sender: 'mavis', content: "Want to make some changes? Describe them in the chat.", type: 'text' };
        setConversationLog(prev => [...prev, xmlMessage, followupMessage]);
        setConversationState('AWAITING_FEEDBACK');
      } else if (conversationState === 'AWAITING_FEEDBACK') {
        setRequestedEdits(currentPrompt);
        const confirmationMsg = await getConfirmationMessage(currentPrompt);
        const mavisMessage: ChatMessage = { sender: 'mavis', content: confirmationMsg, type: 'text' };
        setConversationLog(prev => [...prev, mavisMessage]);
        setConversationState('AWAITING_CONFIRMATION');
      } else if (conversationState === 'AWAITING_CONFIRMATION') {
        const confirmation = currentPrompt.toLowerCase().trim();
        if (['yes', 'yep', 'correct', 'ok', 'yeah', 'proceed'].includes(confirmation)) {
          const newXml = await refineXml(currentXml, requestedEdits);
          setCurrentXml(newXml);
          const xmlMessage: ChatMessage = { sender: 'mavis', content: newXml, type: 'xml' };
          const followupMessage: ChatMessage = { sender: 'mavis', content: "Anything else you'd like to change?", type: 'text' };
          setConversationLog(prev => [...prev, xmlMessage, followupMessage]);
          setConversationState('AWAITING_FEEDBACK');
        } else {
          const tryAgainMessage: ChatMessage = { sender: 'mavis', content: "No problem. How would you like to change the original prompt?", type: 'text' };
          setConversationLog(prev => [...prev, tryAgainMessage]);
          setConversationState('AWAITING_FEEDBACK');
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
      const errorBotMessage: ChatMessage = { sender: 'mavis', content: `Sorry, an error occurred: ${errorMessage}`, type: 'text' };
      setConversationLog(prev => [...prev, errorBotMessage]);
      setConversationState('INITIAL'); // Reset on error
    } finally {
      setIsLoading(false);
    }
  }, [prompt, model, conversationState, currentXml, requestedEdits]);
  
  useEffect(() => {
    if (!isLoading && conversationState === 'AWAITING_FEEDBACK' && conversationLog.length > 0) {
      const lastLogEntry = conversationLog[conversationLog.length - 1];
      const secondLastLogEntry = conversationLog[conversationLog.length - 2];
      
      const promptText = secondLastLogEntry?.sender === 'user' ? secondLastLogEntry.content : (conversationLog.find(m => m.sender === 'user')?.content || '');
      const resultText = lastLogEntry.type === 'xml' ? lastLogEntry.content : (conversationLog.find(m => m.type === 'xml')?.content || '');

      if(promptText && resultText) {
          const newHistoryEntry: Chat = {
              prompt: promptText,
              result: resultText,
              model,
              log: conversationLog
          };
          // Avoid duplicates
          if (!history.some(h => h.log.length === newHistoryEntry.log.length)) {
             setHistory(prev => [...prev, newHistoryEntry]);
          }
      }
    }
  }, [isLoading, conversationState, conversationLog, model, history]);


  const handleNewChat = () => {
    setPrompt('');
    setError(null);
    setShowHistoryPanel(false);
    setIdeas([]);
    setConversationState('INITIAL');
    setCurrentXml('');
    setRequestedEdits('');
    setConversationLog([]);
  };

  const handleSelectChat = (chat: Chat) => {
    setConversationLog(chat.log);
    setModel(chat.model);
    setCurrentXml(chat.result);
    setConversationState('AWAITING_FEEDBACK');
    setError(null);
    setShowHistoryPanel(false);
    setIdeas([]);
  };

  const handleExploreIdeas = async () => {
    setIsFetchingIdeas(true);
    setError(null);
    setIdeas([]);
    try {
        const ideasText = await getStartupIdeas();
        const parsedIdeas = ideasText
            .split('\n')
            .map(line => line.trim().replace(/^\d+\.\s*/, ''))
            .filter(line => line.length > 0);
        setIdeas(parsedIdeas);
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not fetch ideas.');
    } finally {
        setIsFetchingIdeas(false);
    }
  };

  const handleIdeaClick = (idea: string) => {
    setPrompt(idea);
    setIdeas([]);
  };
  
  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const themeClasses = {
    dark: 'bg-[#0b0f19] text-gray-300',
    light: 'bg-gray-100 text-gray-800'
  };

  return (
    <div className={`min-h-screen font-sans flex flex-col relative overflow-hidden ${themeClasses[theme]}`}>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        {conversationLog.length === 0 && (
            <div className="w-[50vw] h-[50vw] max-w-[550px] max-h-[550px] bg-blue-900/40 blur-[140px] rounded-full"></div>
        )}
      </div>
      
      <TopBar 
        onNewChat={handleNewChat}
        onToggleHistory={() => setShowHistoryPanel(p => !p)}
        onToggleAbout={() => setShowAboutModal(p => !p)}
        onToggleSettings={toggleTheme}
        theme={theme}
      />
      
      {showAboutModal && <AboutModal onClose={() => setShowAboutModal(false)} theme={theme} />}
      {showHistoryPanel && <HistoryPanel history={history} onSelectChat={handleSelectChat} onClose={() => setShowHistoryPanel(false)} theme={theme} />}

      <main className="flex-1 px-4 sm:px-6 lg:px-8 flex flex-col w-full z-10 overflow-hidden">
        <div className="w-full max-w-3xl mx-auto flex flex-col flex-grow h-full">
          {conversationLog.length === 0 ? (
             <div className="flex flex-col items-center justify-center flex-grow py-8 text-center">
              <h1 className={`text-4xl md:text-5xl font-bold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'} mb-8`}>What Can Mavis Help You With Today?</h1>
              <PromptInput
                prompt={prompt} setPrompt={setPrompt} model={model} setModel={setModel} onSubmit={handleSubmit}
                isLoading={isLoading} theme={theme} ideas={ideas} isFetchingIdeas={isFetchingIdeas}
                onExploreIdeas={handleExploreIdeas} onIdeaClick={handleIdeaClick} conversationState={conversationState}
              />
            </div>
          ) : (
            <>
              <ChatLog log={conversationLog} isLoading={isLoading} theme={theme} />
              <div className="mt-auto pt-4 pb-8">
                <PromptInput
                  prompt={prompt} setPrompt={setPrompt} model={model} setModel={setModel} onSubmit={handleSubmit}
                  isLoading={isLoading} theme={theme} ideas={ideas} isFetchingIdeas={isFetchingIdeas}
                  onExploreIdeas={handleExploreIdeas} onIdeaClick={handleIdeaClick} conversationState={conversationState}
                />
              </div>
            </>
          )}
        </div>
      </main>
      {conversationLog.length === 0 && (
        <footer className={`text-center py-4 text-xs ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>
          Mavis can make mistakes. Check important info.
        </footer>
      )}
    </div>
  );
};

export default App;