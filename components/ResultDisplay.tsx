import React from 'react';
import { GeneratedMetadata } from '../types';
import { Copy, Check, X } from 'lucide-react';

interface ResultDisplayProps {
  data: GeneratedMetadata;
  onClose: () => void;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ data, onClose }) => {
  const [copied, setCopied] = React.useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-[#0F1623] border border-gray-800 rounded-xl p-6 mt-4 shadow-2xl relative">
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">
        <X size={20} />
      </button>
      
      <h2 className="text-xl font-bold text-cyan-400 mb-6">Generated Metadata</h2>

      <div className="space-y-6">
        {/* Title */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Title</span>
            <button 
              onClick={() => copyToClipboard(data.title, 'title')}
              className="text-xs flex items-center text-cyan-500 hover:text-cyan-300 transition-colors"
            >
              {copied === 'title' ? <Check size={14} className="mr-1"/> : <Copy size={14} className="mr-1"/>}
              {copied === 'title' ? 'Copied' : 'Copy'}
            </button>
          </div>
          <div className="bg-[#0B0E14] p-3 rounded border border-gray-800 text-gray-200 text-sm">
            {data.title}
          </div>
        </div>

        {/* Description */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Description</span>
            <button 
              onClick={() => copyToClipboard(data.description, 'desc')}
              className="text-xs flex items-center text-cyan-500 hover:text-cyan-300 transition-colors"
            >
              {copied === 'desc' ? <Check size={14} className="mr-1"/> : <Copy size={14} className="mr-1"/>}
              {copied === 'desc' ? 'Copied' : 'Copy'}
            </button>
          </div>
          <div className="bg-[#0B0E14] p-3 rounded border border-gray-800 text-gray-200 text-sm">
            {data.description}
          </div>
        </div>

        {/* Keywords */}
        <div>
          <div className="flex justify-between items-center mb-2">
             <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Keywords</span>
                <span className="bg-gray-800 text-gray-300 text-[10px] px-2 py-0.5 rounded-full">{data.keywords.length}</span>
             </div>
            <button 
              onClick={() => copyToClipboard(data.keywords.join(', '), 'tags')}
              className="text-xs flex items-center text-cyan-500 hover:text-cyan-300 transition-colors"
            >
              {copied === 'tags' ? <Check size={14} className="mr-1"/> : <Copy size={14} className="mr-1"/>}
              {copied === 'tags' ? 'Copied' : 'Copy'}
            </button>
          </div>
          <div className="bg-[#0B0E14] p-3 rounded border border-gray-800 text-gray-200 text-sm flex flex-wrap gap-2">
            {data.keywords.map((k, i) => (
              <span key={i} className="bg-gray-800 px-2 py-1 rounded text-xs text-gray-300 border border-gray-700">
                {k}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultDisplay;