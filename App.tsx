import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import PlatformSelector from './components/PlatformSelector';
import UploadArea from './components/UploadArea';
import QueueItem from './components/QueueItem';
import Pricing from './components/Pricing';
import ProfileMenu from './components/ProfileMenu';
import ContactMenu from './components/ContactMenu';
import Login from './components/Login';
import { DEFAULT_SETTINGS, MetadataSettings, Platform, QueueItem as QueueItemType, UploadMode, AppMode, AppView, User } from './types';
import { generateMetadata, generateImagePrompt } from './services/geminiService';
import { Play, Trash2, Plus, FileSpreadsheet, FileText, Sparkles, AlertTriangle, Pause, Square } from 'lucide-react';

// --- RESEARCHED PRESETS FOR MICROSTOCK PLATFORMS ---
const PLATFORM_PRESETS: Record<Platform, Partial<MetadataSettings>> = {
  [Platform.AdobeStock]: {
    minTitleWords: 5,
    maxTitleWords: 15,
    minDescWords: 5,
    maxDescWords: 25,
    minKeywords: 15,
    maxKeywords: 49, 
    singleWordKeywords: true
  },
  [Platform.Shutterstock]: {
    minTitleWords: 5,
    maxTitleWords: 15, 
    minDescWords: 5,
    maxDescWords: 25, 
    minKeywords: 25,
    maxKeywords: 50,
    singleWordKeywords: false 
  },
  [Platform.Freepik]: {
    minTitleWords: 5,
    maxTitleWords: 20,
    minDescWords: 5,
    maxDescWords: 25,
    minKeywords: 20,
    maxKeywords: 50,
    singleWordKeywords: true
  },
  [Platform.Vecteezy]: {
    minTitleWords: 5,
    maxTitleWords: 15,
    minDescWords: 10,
    maxDescWords: 25,
    minKeywords: 10,
    maxKeywords: 49,
    singleWordKeywords: true
  },
  [Platform.Depositphotos]: {
    minTitleWords: 5,
    maxTitleWords: 20,
    minDescWords: 5,
    maxDescWords: 25,
    minKeywords: 20,
    maxKeywords: 50,
    singleWordKeywords: false
  },
  [Platform.RF123]: {
    minTitleWords: 5,
    maxTitleWords: 20,
    minDescWords: 5,
    maxDescWords: 25,
    minKeywords: 20,
    maxKeywords: 50,
    singleWordKeywords: false
  },
  [Platform.Dreamstime]: {
    minTitleWords: 5,
    maxTitleWords: 20,
    minDescWords: 5,
    maxDescWords: 25,
    minKeywords: 15,
    maxKeywords: 50,
    singleWordKeywords: true
  },
  [Platform.General]: {
    ...DEFAULT_SETTINGS,
    maxDescWords: 25
  }
};

// Helper to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

// Helper to extract embedded JPG preview from EPS (Adobe format)
const extractEPSPreview = async (file: File): Promise<string | null> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    const blob = file.slice(0, 2 * 1024 * 1024);
    reader.readAsText(blob);
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) { resolve(null); return; }

      const thumbnailIndex = text.indexOf('%AI7_Thumbnail');
      if (thumbnailIndex === -1) { resolve(null); return; }

      const startMarker = '%%BeginData:';
      const endMarker = '%%EndData';

      const startIndex = text.indexOf(startMarker, thumbnailIndex);
      const endIndex = text.indexOf(endMarker, startIndex);

      if (startIndex !== -1 && endIndex !== -1) {
        let dataBlock = text.substring(startIndex + startMarker.length, endIndex);
        const lines = dataBlock.split('\n');
        let hexData = '';
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('%')) {
             hexData += trimmed.substring(1);
          } else {
             if (trimmed.length > 0) hexData += trimmed;
          }
        }
        hexData = hexData.replace(/\s/g, '');
        const jpegStart = hexData.indexOf('FFD8');
        if (jpegStart !== -1) {
           hexData = hexData.substring(jpegStart);
        }
        try {
          const byteArray = new Uint8Array(hexData.length / 2);
          for (let i = 0; i < hexData.length; i += 2) {
            byteArray[i / 2] = parseInt(hexData.substring(i, i + 2), 16);
          }
          const imageBlob = new Blob([byteArray], { type: 'image/jpeg' });
          resolve(URL.createObjectURL(imageBlob));
        } catch (err) {
          resolve(null);
        }
      } else {
        resolve(null);
      }
    };
    reader.onerror = () => resolve(null);
  });
};

export default function App() {
  // User Authentication State
  const [user, setUser] = useState<User | null>(null);
  
  const [settings, setSettings] = useState<MetadataSettings>(DEFAULT_SETTINGS);
  const [platform, setPlatform] = useState<Platform>(Platform.AdobeStock);
  const [queue, setQueue] = useState<QueueItemType[]>([]);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [uploadMode, setUploadMode] = useState<UploadMode>(UploadMode.Images);
  const [appMode, setAppMode] = useState<AppMode>(AppMode.Metadata);
  const [view, setView] = useState<AppView>(AppView.Tool);
  
  // Refs for control flow
  const stopProcessingRef = useRef(false);
  const isPausedRef = useRef(false);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('gtrik_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user session");
        localStorage.removeItem('gtrik_user');
      }
    }
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem('gtrik_user', JSON.stringify(loggedInUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('gtrik_user');
    setView(AppView.Tool);
  };

  // Keep ref in sync with state for use in async loop
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // API Key State
  const [apiKey, setApiKey] = useState(() => {
    try {
      return localStorage.getItem('gtrik_api_key') || '';
    } catch (e) {
      return '';
    }
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sorting Logic: Success -> Processing -> Idle -> Error
  const sortedQueue = useMemo(() => {
    return [...queue].sort((a, b) => {
      const score = (s: string) => {
        if (s === 'success') return 0;
        if (s === 'processing') return 1;
        if (s === 'idle') return 2;
        return 3; // error
      };
      return score(a.status) - score(b.status);
    });
  }, [queue]);

  // Auto-scroll to keep processing files visible
  useEffect(() => {
    if (isBatchProcessing) {
      const processingElement = document.querySelector('[data-status="processing"]');
      if (processingElement) {
        processingElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [queue, isBatchProcessing]);

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    try {
      if (key) {
        localStorage.setItem('gtrik_api_key', key);
      } else {
        localStorage.removeItem('gtrik_api_key');
      }
    } catch (e) {
      console.error("Failed to save API key", e);
    }
  };

  // When platform changes, automatically apply the researched presets
  const handlePlatformSelect = (newPlatform: Platform) => {
    setPlatform(newPlatform);
    const preset = PLATFORM_PRESETS[newPlatform];
    if (preset) {
      setSettings(prev => ({
        ...prev,
        ...preset
      }));
    }
  };

  const handleAppModeChange = (mode: AppMode) => {
      if(queue.length > 0 && !window.confirm("Changing mode will clear the current queue. Continue?")) {
          return;
      }
      clearAll();
      setAppMode(mode);
  };

  const handleFilesAdd = async (files: File[]) => {
    const initialItems: QueueItemType[] = files.map(file => ({
      id: Math.random().toString(36).substring(2) + Date.now().toString(36) + Math.random(),
      file,
      previewUrl: '', 
      status: 'idle'
    }));

    setQueue(prev => [...prev, ...initialItems]);

    const generatePreviews = async () => {
       const isVectors = files[0].name.toLowerCase().endsWith('.eps');
       
       if (!isVectors) {
           setQueue(currentQueue => {
               return currentQueue.map(item => {
                   if (initialItems.find(i => i.id === item.id) && !item.previewUrl) {
                       return { ...item, previewUrl: URL.createObjectURL(item.file) };
                   }
                   return item;
               });
           });
           return;
       }

       for (const item of initialItems) {
           const preview = await extractEPSPreview(item.file);
           if (preview) {
               setQueue(prev => prev.map(q => q.id === item.id ? { ...q, previewUrl: preview } : q));
           }
           await new Promise(r => setTimeout(r, 10)); 
       }
    };

    generatePreviews();
  };

  // Optimized with useCallback to prevent QueueItem re-renders
  const removeItem = useCallback((id: string) => {
    setQueue(prev => {
      const item = prev.find(i => i.id === id);
      if (item && item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      return prev.filter(i => i.id !== id);
    });
  }, []);

  const clearAll = () => {
    if (isBatchProcessing) return;
    queue.forEach(item => {
        if(item.previewUrl) URL.revokeObjectURL(item.previewUrl)
    });
    setQueue([]);
  };

  const handleStop = () => {
    stopProcessingRef.current = true;
    setIsPaused(false);
  };

  // Optimized with useCallback
  const handleRetry = useCallback((id: string) => {
    setQueue(prev => prev.map(item => 
        item.id === id ? { ...item, status: 'idle', error: undefined } : item
    ));
  }, []);

  const processQueue = async () => {
    if (!apiKey) {
        alert("Please enter and save your API Key in the profile menu to process files.");
        return;
    }
    if (isBatchProcessing) return;

    setIsBatchProcessing(true);
    stopProcessingRef.current = false;
    setIsPaused(false);
    isPausedRef.current = false;

    const itemsToProcess = queue.filter(item => item.status === 'idle' || item.status === 'error');
    
    // Batch Size of 5 (Chunks)
    const BATCH_SIZE = 5;

    // Helper to process a single item
    const processItem = async (item: QueueItemType) => {
        if (stopProcessingRef.current) return;

        setQueue(prev => prev.map(qItem => qItem.id === item.id ? { ...qItem, status: 'processing', error: undefined } : qItem));

        try {
            const base64 = await fileToBase64(item.file);
            const isEPS = item.file.name.toLowerCase().endsWith('.eps');
            
            if (stopProcessingRef.current) {
                 setQueue(prev => prev.map(qItem => qItem.id === item.id ? { ...qItem, status: 'idle' } : qItem));
                 return;
            }

            let resultData: any;
            if (appMode === AppMode.Metadata) {
                resultData = await generateMetadata(base64, settings, platform, isEPS, apiKey);
            } else {
                const prompt = await generateImagePrompt(base64, isEPS, apiKey);
                resultData = { title: '', description: '', keywords: [], prompt }; 
            }

            if (stopProcessingRef.current) {
                 setQueue(prev => prev.map(qItem => qItem.id === item.id ? { ...qItem, status: 'idle' } : qItem));
                 return;
            }
            
            setQueue(prev => prev.map(qItem => qItem.id === item.id ? { ...qItem, status: 'success', result: resultData } : qItem));
        } catch (err: any) {
            if (stopProcessingRef.current) {
                 setQueue(prev => prev.map(qItem => qItem.id === item.id ? { ...qItem, status: 'idle' } : qItem));
                 return;
            }
            console.error(`Error processing ${item.file.name}:`, err);
            setQueue(prev => prev.map(qItem => qItem.id === item.id ? { ...qItem, status: 'error', error: err.message || 'Failed' } : qItem));
        }
    };

    // Loop in batches
    for (let i = 0; i < itemsToProcess.length; i += BATCH_SIZE) {
        if (stopProcessingRef.current) break;

        // Check for pause before starting a new batch
        while (isPausedRef.current && !stopProcessingRef.current) {
             await new Promise(resolve => setTimeout(resolve, 200));
        }
        if (stopProcessingRef.current) break;

        const batch = itemsToProcess.slice(i, i + BATCH_SIZE);
        
        // Process the entire batch concurrently
        await Promise.all(batch.map(item => processItem(item)));
        
        // Small delay between batches to let UI breathe
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    setIsBatchProcessing(false);
    setIsPaused(false);
    stopProcessingRef.current = false;
  };

  // Optimized with useCallback
  const handleDownloadEPS = useCallback((item: QueueItemType) => {
    if (!item.result || appMode !== AppMode.Metadata) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === 'string') {
        const xmp = `
<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <rdf:Description rdf:about=""
        xmlns:dc="http://purl.org/dc/elements/1.1/">
      <dc:title>
        <rdf:Alt>
          <rdf:li xml:lang="x-default">${item.result!.title}</rdf:li>
        </rdf:Alt>
      </dc:title>
      <dc:description>
        <rdf:Alt>
          <rdf:li xml:lang="x-default">${item.result!.description}</rdf:li>
        </rdf:Alt>
      </dc:description>
      <dc:subject>
        <rdf:Bag>
          ${item.result!.keywords.map(k => `<rdf:li>${k}</rdf:li>`).join('\n          ')}
        </rdf:Bag>
      </dc:subject>
    </rdf:Description>
  </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`;

        let newContent = content;
        const startMatch = content.indexOf('<?xpacket begin=');
        const endMatch = content.indexOf('<?xpacket end="w"?>');

        if (startMatch !== -1 && endMatch !== -1) {
            newContent = content.substring(0, startMatch) + xmp + content.substring(endMatch + 19);
        } else {
            const eofIndex = content.lastIndexOf('%%EOF');
            if (eofIndex !== -1) {
                newContent = content.substring(0, eofIndex) + '\n' + xmp + '\n' + content.substring(eofIndex);
            } else {
                newContent = content + '\n' + xmp;
            }
        }

        const blob = new Blob([newContent], { type: 'application/postscript' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = item.file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    };
    reader.readAsText(item.file);
  }, [appMode]);

  const exportCSV = () => {
    const completedItems = queue.filter(i => i.status === 'success' && i.result);
    if (completedItems.length === 0) return;

    const headers = ['Filename', 'Title', 'Description', 'Keywords'];
    const rows = completedItems.map(item => {
      const r = item.result!;
      const safeTitle = `"${r.title.replace(/"/g, '""')}"`;
      const safeDesc = `"${r.description.replace(/"/g, '""')}"`;
      const safeKeywords = `"${r.keywords.join(', ').replace(/"/g, '""')}"`;
      return [item.file.name, safeTitle, safeDesc, safeKeywords].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const timestamp = new Date().getTime();
    link.setAttribute('download', `${platform}_metadata_export_${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportTXT = () => {
    const completedItems = queue.filter(i => i.status === 'success' && i.result && i.result.prompt);
    if (completedItems.length === 0) return;

    const textContent = completedItems.map(item => {
        return `[FILENAME]: ${item.file.name}\n[PROMPT]:\n${item.result!.prompt}\n${'-'.repeat(40)}\n`;
    }).join('\n');

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `prompts_export_${new Date().getTime()}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const pendingCount = queue.filter(i => i.status === 'idle' || i.status === 'error').length;
  const completedCount = queue.filter(i => i.status === 'success').length;

  // If no user is logged in, show Login screen
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen w-full bg-background text-white overflow-hidden">
      {/* Left Sidebar */}
      {view === AppView.Tool && (
        <Sidebar 
            settings={settings} 
            setSettings={setSettings} 
            appMode={appMode}
            setAppMode={handleAppModeChange}
            user={user}
        />
      )}

      {/* Main Content - SCROLLABLE CONTAINER (Forced Scroll on Right Edge) */}
      <div className="flex-1 flex flex-col h-full bg-[#0B0E14] relative overflow-y-scroll custom-scrollbar" id="main-scroll-container">
        
        {/* Header - STICKY */}
        <header className="sticky top-0 right-0 left-0 z-40 bg-background/90 backdrop-blur-md border-b border-gray-800 flex justify-end items-center p-6 space-x-4">
          
          <button 
             className="bg-cyan-500 text-black font-semibold text-xs py-2 px-4 rounded shadow-lg hover:bg-cyan-400 transition-colors"
             title="Watch Tutorial"
             onClick={() => alert("Tutorial video coming soon!")}
          >
            Tutorial
          </button>
          
          {/* Contact Dropdown */}
          <ContactMenu />

          <button 
            onClick={() => setView(AppView.Pricing)}
            className={`font-semibold text-xs py-2 px-4 rounded shadow-lg transition-colors
                ${view === AppView.Pricing ? 'bg-white text-black' : 'bg-cyan-500 text-black hover:bg-cyan-400'}`}
          >
            Pricing
          </button>
          
          {/* User Profile Menu */}
          <ProfileMenu 
             user={user} 
             apiKey={apiKey}
             onSaveApiKey={handleSaveApiKey}
             onLogout={handleLogout}
          />
        </header>

        {/* Scrollable Content Area */}
        <main className="w-full max-w-[1800px] mx-auto px-8 pt-6 pb-32 flex-1 flex flex-col min-h-0">
            
            {view === AppView.Pricing ? (
               <Pricing onGoBack={() => setView(AppView.Tool)} />
            ) : (
               <>
                  {/* API Key Warning */}
                  {!apiKey && (
                      <div className="w-full max-w-3xl mx-auto mb-6 animate-fade-in flex-shrink-0">
                          <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4 flex items-center gap-4">
                              <div className="p-2 bg-yellow-800/30 rounded-full">
                                  <AlertTriangle className="text-yellow-500" size={24} />
                              </div>
                              <div>
                                  <h3 className="text-yellow-500 font-bold text-sm">API Key Required</h3>
                                  <p className="text-yellow-400/80 text-xs mt-1">
                                      To start processing images, please click your profile icon and add your API Key.
                                  </p>
                              </div>
                          </div>
                      </div>
                  )}

                  {/* Only show Platform selector in Metadata Mode */}
                  {appMode === AppMode.Metadata && (
                      <PlatformSelector selected={platform} onSelect={handlePlatformSelect} />
                  )}
                  
                  {appMode === AppMode.ImageToPrompt && (
                      <div className="flex flex-col items-center mb-8 animate-fade-in flex-shrink-0">
                          <h2 className="text-xl font-bold text-purple-400 mb-1 tracking-wider uppercase flex items-center">
                          <Sparkles size={20} className="mr-2" /> Image to Prompt
                          </h2>
                          <div className="w-full max-w-4xl h-[1px] bg-gradient-to-r from-transparent via-purple-900 to-transparent mt-6"></div>
                      </div>
                  )}

                  <div className="flex-1 flex flex-col items-center w-full min-h-0">
                      
                      {/* Initial Upload Area */}
                      {queue.length === 0 ? (
                      <div className="flex-1 flex items-center justify-center w-full my-auto">
                          <UploadArea 
                              onFilesSelect={handleFilesAdd} 
                              isProcessing={isBatchProcessing}
                              mode={uploadMode}
                              setMode={setUploadMode}
                          />
                      </div>
                      ) : (
                      <div className="w-full flex flex-col animate-fade-in">
                          
                          {/* Action Bar - Sticky below Header */}
                          <div className="flex flex-wrap justify-between items-center mb-4 gap-4 bg-[#0F1623] p-4 rounded-xl border border-gray-800 flex-shrink-0 sticky top-[82px] z-30 shadow-xl">
                          <div className="flex items-center gap-4">
                              <h2 className="text-lg font-bold text-white">
                                  {appMode === AppMode.Metadata ? "Generated Data" : "Generated Prompts"}
                              </h2>
                              <span className="bg-gray-800 text-xs px-2 py-1 rounded text-gray-400 border border-gray-700">
                              {completedCount} / {queue.length} Processed
                              </span>
                              <span className="text-xs text-gray-500 uppercase font-bold tracking-wider border border-gray-700 px-2 py-1 rounded">
                              Mode: {appMode === AppMode.Metadata ? uploadMode : 'Prompt Gen'}
                              </span>
                          </div>

                          <div className="flex gap-3">
                              <input 
                              type="file" 
                              multiple 
                              className="hidden" 
                              ref={fileInputRef} 
                              accept={uploadMode === UploadMode.Vectors ? ".eps" : (uploadMode === UploadMode.Videos ? "video/*" : "image/*")} 
                              onChange={(e) => {
                                  if (e.target.files && e.target.files.length > 0) {
                                  handleFilesAdd(Array.from(e.target.files));
                                  e.target.value = '';
                                  }
                              }} 
                              />
                              <button 
                              onClick={() => fileInputRef.current?.click()}
                              disabled={isBatchProcessing}
                              className="flex items-center px-4 py-2 bg-gray-800 hover:bg-gray-700 text-cyan-400 rounded-lg text-sm font-medium transition-colors border border-gray-700"
                              >
                              <Plus size={16} className="mr-2" /> Add Files
                              </button>

                              {/* PROCESS / PAUSE / RESUME */}
                              {pendingCount > 0 && (
                              <div className="flex gap-2">
                                  {isBatchProcessing && (
                                      <button 
                                          onClick={handleStop}
                                          className="flex items-center px-4 py-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 rounded-lg text-sm font-bold transition-colors border border-red-900/30"
                                      >
                                          <Square size={16} className="mr-2 fill-current" /> Stop
                                      </button>
                                  )}

                                  <button 
                                      onClick={isBatchProcessing ? () => setIsPaused(!isPaused) : processQueue}
                                      disabled={isBatchProcessing && !isPaused && !stopProcessingRef.current && !isBatchProcessing}
                                      className={`flex items-center px-6 py-2 rounded-lg text-sm font-bold transition-all shadow-lg min-w-[140px] justify-center
                                      ${isBatchProcessing
                                          ? isPaused 
                                              ? 'bg-yellow-600 hover:bg-yellow-500 text-white' 
                                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                          : !apiKey 
                                              ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                                              : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-cyan-500/25'
                                      }`}
                                  >
                                      {isBatchProcessing ? (
                                          isPaused ? (
                                              <><Play size={16} className="mr-2 fill-current" /> Resume</>
                                          ) : (
                                              <><Pause size={16} className="mr-2 fill-current" /> Pause</>
                                          )
                                      ) : (
                                          <><Play size={16} className="mr-2 fill-current" /> Process All</>
                                      )}
                                  </button>
                              </div>
                              )}
                              
                              <button 
                              onClick={clearAll}
                              disabled={isBatchProcessing}
                              className="flex items-center px-4 py-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 rounded-lg text-sm font-medium transition-colors border border-red-900/30"
                              >
                              <Trash2 size={16} className="mr-2" /> Clear All
                              </button>
                          </div>
                          </div>

                          {/* Grid List */}
                          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-10">
                              {sortedQueue.map((item) => (
                                  <div 
                                    key={item.id} 
                                    data-status={item.status}
                                  >
                                      <QueueItem 
                                          item={item} 
                                          onRemove={removeItem} 
                                          onDownloadEPS={uploadMode === UploadMode.Vectors ? handleDownloadEPS : undefined}
                                          onRetry={() => handleRetry(item.id)}
                                          appMode={appMode}
                                      />
                                  </div>
                              ))}
                          </div>
                      </div>
                      )}

                  </div>
               </>
            )}
        </main>

        {/* Footer Export - FIXED at Bottom */}
        {view === AppView.Tool && queue.length > 0 && completedCount > 0 && (
            <div className="fixed bottom-0 right-0 left-80 z-30 bg-[#0B0E14] border-t border-gray-800 py-4 flex justify-center shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
                {appMode === AppMode.Metadata ? (
                    <button 
                        onClick={exportCSV}
                        className="flex items-center px-8 py-3 bg-green-600 hover:bg-green-500 text-white rounded-full font-bold shadow-lg hover:shadow-green-500/30 transition-all transform hover:-translate-y-1"
                    >
                        <FileSpreadsheet size={20} className="mr-2" /> Export CSV
                    </button>
                ) : (
                    <button 
                        onClick={exportTXT}
                        className="flex items-center px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-full font-bold shadow-lg hover:shadow-purple-500/30 transition-all transform hover:-translate-y-1"
                    >
                        <FileText size={20} className="mr-2" /> Export Prompts (.txt)
                    </button>
                )}
            </div>
        )}

      </div>
    </div>
  );
}