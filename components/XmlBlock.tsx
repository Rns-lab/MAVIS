import React, { useState } from 'react';

interface XmlBlockProps {
  xmlContent: string;
  theme: 'light' | 'dark';
}

export const XmlBlock: React.FC<XmlBlockProps> = ({ xmlContent, theme }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(xmlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const themeClasses = {
      dark: {
          container: 'bg-gray-900/50 border-white/10',
          header: 'border-white/10 text-gray-300',
          button: 'bg-blue-600 hover:bg-blue-700 text-white',
          code: 'text-gray-200',
      },
      light: {
          container: 'bg-white/50 border-black/10',
          header: 'border-black/10 text-gray-700',
          button: 'bg-blue-600 hover:bg-blue-700 text-white',
          code: 'text-gray-800',
      }
  }

  return (
    <div className={`border rounded-xl shadow-lg backdrop-blur-md w-full max-w-4xl mx-auto ${themeClasses[theme].container}`}>
      <div className={`flex justify-between items-center px-4 py-2 border-b ${themeClasses[theme].header}`}>
        <h3 className="text-sm font-semibold">Generated Prompt XML</h3>
        <button 
          onClick={handleCopy}
          className={`px-3 py-1 text-xs rounded-md transition-colors ${themeClasses[theme].button}`}
        >
          {copied ? 'Copied!' : 'Copy XML'}
        </button>
      </div>
      <pre className="p-4 text-sm overflow-x-auto">
        <code className={`language-xml ${themeClasses[theme].code}`}>{xmlContent}</code>
      </pre>
    </div>
  );
};
