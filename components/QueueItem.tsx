
import React, { useState, memo } from 'react';
import { QueueItem as QueueItemType, AppMode } from '../types';
import { Copy, Check, X, RefreshCw, AlertCircle, FileText, Download, ClipboardCopy } from 'lucide-react';

interface QueueItemProps {
  item: QueueItemType;
  onRemove: (id: string) => void;
  onDownloadEPS?: (item: QueueItemType) => void;
  onRetry?: () => void;
  appMode: AppMode;
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const CopyButton = ({ text, label, minimal = false }: { text: string; label?: string, minimal?: boolean }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (minimal) {
      return (
        <button 
            onClick={handleCopy}
            className="p-1 text-gray-500 hover:text-cyan-400 transition-colors rounded"
            title="Copy"
        >
            {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      );
  }

  return (
    <button 
      onClick={handleCopy}
      className="text-xs flex items-center text-cyan-500 hover:text-cyan-300 transition-colors"
      title="Copy to clipboard"
    >
      {copied ? <Check size={14} className="mr-1" /> : <Copy size={14} className="mr-1" />}
      {copied ? 'Copied' : label || 'Copy'}
    </button>
  );
};

const QueueItem: React.FC<QueueItemProps> = ({ item, onRemove, onDownloadEPS, onRetry, appMode }) => {
  
  const isEPS = item.file.name.toLowerCase().endsWith('.eps');
  const isVideo = item.file.type.startsWith('video/');
  const hasPreview = !!item.previewUrl;
  const isSuccess = item.status === 'success';
  const isError = item.status === 'error';
  const isProcessing = item.status === 'processing';
  const [allCopied, setAllCopied] = useState(false);

  const handleCopyAll = () => {
      if(!item.result) return;
      const text = `Title: ${item.result.title}\n\nDescription: ${item.result.description}\n\nKeywords: ${item.result.keywords.join(', ')}`;
      navigator.clipboard.writeText(text);
      setAllCopied(true);
      setTimeout(() => setAllCopied(false), 2000);
  };

  return (
    <div className={`relative bg-[#1F2937] border rounded-xl flex flex-col shadow-lg overflow-hidden h-full min-h-[380px] transition-all duration-300
        ${isSuccess ? 'border-cyan-500/30 shadow-cyan-500/5' : 'border-gray-700'}
        ${isProcessing ? 'border-purple-500/50 shadow-purple-500/10 ring-1 ring-purple-500/30' : ''}
    `}>
        
        {/* Top Actions */}
        <button 
            onClick={() => onRemove(item.id)} 
            className="absolute top-2 right-2 z-10 p-1 bg-black/40 hover:bg-red-900/80 text-white/70 hover:text-white rounded-full transition-colors backdrop-blur-sm"
        >
            <X size={14} />
        </button>

        {/* Image/Video Preview Area */}
        <div className={`relative w-full bg-black/20 border-b border-gray-800 overflow-hidden flex items-center justify-center flex-shrink-0
            ${isSuccess ? 'h-32' : 'h-48'} transition-all duration-500 ease-in-out
        `}>
            {hasPreview ? (
                <>
                    {isVideo ? (
                        <video 
                            src={item.previewUrl} 
                            className="w-full h-full object-contain" 
                            muted 
                            loop 
                            onMouseOver={(e) => e.currentTarget.play()} 
                            onMouseOut={(e) => e.currentTarget.pause()}
                        />
                    ) : (
                        <img 
                            src={item.previewUrl} 
                            alt="preview" 
                            className="w-full h-full object-contain p-2" 
                        />
                    )}
                    
                    {isEPS && (
                        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[8px] font-bold px-1.5 py-0.5 backdrop-blur-sm rounded border border-white/10">EPS</div>
                    )}
                    {isVideo && (
                         <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[8px] font-bold px-1.5 py-0.5 backdrop-blur-sm rounded border border-white/10">VIDEO</div>
                    )}
                </>
            ) : (
                <div className="flex flex-col items-center justify-center text-gray-600">
                    <FileText size={32} />
                    <span className="text-[10px] font-bold mt-2 opacity-50">NO PREVIEW</span>
                </div>
            )}

            {/* Status Overlays */}
            {isProcessing && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex flex-col items-center justify-center text-purple-400">
                    <RefreshCw size={24} className="animate-spin mb-2" />
                    <span className="text-xs font-bold tracking-widest uppercase">Processing</span>
                </div>
            )}
            {isError && (
                <div className="absolute inset-0 bg-red-900/80 backdrop-blur-[1px] flex flex-col items-center justify-center text-white p-4 text-center">
                    <AlertCircle size={24} className="mb-2" />
                    <span className="text-xs font-bold mb-1">FAILED</span>
                    <span className="text-[10px] opacity-80 line-clamp-2">{item.error}</span>
                    {onRetry && (
                        <button onClick={onRetry} className="mt-2 bg-white text-red-900 text-[10px] font-bold px-3 py-1 rounded-full">Retry</button>
                    )}
                </div>
            )}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-3 flex flex-col gap-2 overflow-hidden">
            
            {/* File Info (Always Visible but smaller on success) */}
            <div className="flex justify-between items-start">
                <div className="min-w-0">
                     <h4 className="text-xs font-medium text-gray-300 truncate" title={item.file.name}>{item.file.name}</h4>
                     <p className="text-[10px] text-gray-600">{formatFileSize(item.file.size)}</p>
                </div>
                <div className="flex gap-1">
                    {isSuccess && item.result && appMode === AppMode.Metadata && (
                        <button
                            onClick={handleCopyAll}
                            className={`text-xs px-2 py-0.5 rounded transition-colors border ${allCopied ? 'bg-green-900/30 border-green-600 text-green-400' : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'}`}
                            title="Copy All Data"
                        >
                             {allCopied ? <Check size={12} /> : <ClipboardCopy size={12} />}
                        </button>
                    )}
                    {isSuccess && appMode === AppMode.Metadata && isEPS && onDownloadEPS && (
                        <button 
                        onClick={() => onDownloadEPS(item)} 
                        className="text-cyan-400 hover:text-cyan-300 transition-colors"
                        title="Download EPS with Metadata"
                        >
                            <Download size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Success Content */}
            {isSuccess && item.result && (
                <div className="flex-1 flex flex-col gap-2 mt-1 animate-fade-in">
                    {appMode === AppMode.ImageToPrompt ? (
                        <div className="flex-1 bg-[#0B0E14] rounded p-2 border border-gray-800 flex flex-col min-h-0">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] font-bold text-purple-400 uppercase">Prompt</span>
                                <CopyButton text={item.result.prompt || ''} minimal />
                            </div>
                            <p className="text-[11px] text-gray-400 leading-relaxed overflow-y-auto custom-scrollbar pr-1 font-mono">
                                {item.result.prompt}
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Title */}
                            <div className="bg-[#0B0E14] rounded p-2 border border-gray-800 relative group">
                                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-[#0B0E14]">
                                    <CopyButton text={item.result.title} minimal />
                                </div>
                                <div className="text-[10px] font-bold text-gray-500 mb-0.5 uppercase">Title</div>
                                <p className="text-[11px] text-gray-200 leading-snug line-clamp-2" title={item.result.title}>
                                    {item.result.title}
                                </p>
                            </div>

                            {/* Description */}
                            <div className="bg-[#0B0E14] rounded p-2 border border-gray-800 relative group flex-1 min-h-[60px]">
                                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-[#0B0E14]">
                                    <CopyButton text={item.result.description} minimal />
                                </div>
                                <div className="text-[10px] font-bold text-gray-500 mb-0.5 uppercase">Description</div>
                                <p className="text-[11px] text-gray-300 leading-snug line-clamp-3" title={item.result.description}>
                                    {item.result.description}
                                </p>
                            </div>

                            {/* Keywords */}
                            <div className="bg-[#0B0E14] rounded p-2 border border-gray-800 relative group">
                                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-[#0B0E14]">
                                    <CopyButton text={item.result.keywords.join(', ')} minimal />
                                </div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase">Keywords</span>
                                    <span className="bg-gray-800 text-gray-400 text-[9px] px-1.5 py-0.5 rounded-full">{item.result.keywords.length}</span>
                                </div>
                                <div className="flex flex-wrap gap-1 h-[42px] overflow-hidden">
                                    {item.result.keywords.slice(0, 8).map((k, i) => (
                                        <span key={i} className="bg-gray-800 text-[9px] text-gray-400 px-1.5 py-0.5 rounded border border-gray-700 whitespace-nowrap">
                                            {k}
                                        </span>
                                    ))}
                                    {item.result.keywords.length > 8 && (
                                        <span className="text-[9px] text-gray-500 px-1 py-0.5 self-center">
                                            +{item.result.keywords.length - 8}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Idle State Placeholder */}
            {!isSuccess && !isError && (
                <div className="flex-1 flex items-center justify-center text-gray-700 text-xs uppercase font-medium tracking-wider border-t border-dashed border-gray-800 mt-2">
                    Ready to Process
                </div>
            )}

        </div>
    </div>
  );
};

export default memo(QueueItem);
