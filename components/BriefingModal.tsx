
import React, { useState } from 'react';
import { XIcon, SparklesIcon, CheckCircleIcon } from './Icons';

interface BriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  isLoading: boolean;
}

const BriefingModal: React.FC<BriefingModalProps> = ({ isOpen, onClose, content, isLoading }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl animate-in zoom-in-95 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b flex items-center justify-between shrink-0">
          <h2 className="text-xl font-bold font-outfit flex items-center gap-2 text-slate-800">
            <SparklesIcon />
            Briefing Gerado por IA
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <XIcon />
          </button>
        </div>
        
        <div className="p-8 overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center text-center py-16">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-purple-500 animate-pulse mb-6">
                    <SparklesIcon />
                </div>
                <h3 className="text-xl font-bold text-slate-700">A gerar o seu briefing...</h3>
                <p className="text-slate-500 text-sm mt-2">Por favor, aguarde um momento.</p>
            </div>
          ) : (
            <div 
              className="prose prose-sm max-w-none prose-h3:font-bold prose-h3:text-purple-800 prose-headings:font-outfit"
              style={{ whiteSpace: 'pre-wrap' }}
            >
              {content.split('\n').map((line, index) => {
                if (line.startsWith('### ')) {
                  return <h3 key={index} className="text-lg font-bold text-purple-800 mt-4 mb-2">{line.replace('### ', '')}</h3>;
                }
                if (line.startsWith('**')) {
                  const parts = line.split('**');
                  return (
                    <p key={index} className="my-1">
                      {parts.map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part)}
                    </p>
                  );
                }
                if (line.startsWith('- ')) {
                  return <li key={index} className="ml-4 list-disc text-slate-600">{line.substring(2)}</li>
                }
                return <p key={index} className="text-slate-700 my-1">{line}</p>;
              })}
            </div>
          )}
        </div>

        <div className="p-6 bg-slate-50 border-t shrink-0">
          <button
            onClick={handleCopy}
            disabled={isLoading || copied}
            className="w-full flex items-center justify-center gap-2 bg-slate-800 text-white py-3 rounded-xl font-bold text-sm hover:bg-slate-700 transition-all disabled:opacity-50"
          >
            {copied ? <CheckCircleIcon /> : <SparklesIcon />}
            {copied ? 'Copiado!' : 'Copiar Briefing'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BriefingModal;
