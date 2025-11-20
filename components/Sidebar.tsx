import React, { useState } from 'react';
import { MetadataSettings, AppMode, User } from '../types';
import { Settings, Image as ImageIcon, FileText, Info, Zap } from 'lucide-react';

interface SidebarProps {
  settings: MetadataSettings;
  setSettings: React.Dispatch<React.SetStateAction<MetadataSettings>>;
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
  user: User | null;
}

const SliderControl = ({ 
  label, 
  minVal, 
  maxVal, 
  minLimit, 
  maxLimit, 
  onChangeMin, 
  onChangeMax,
  disabled
}: { 
  label: string; 
  minVal: number; 
  maxVal: number; 
  minLimit: number; 
  maxLimit: number;
  onChangeMin: (val: number) => void;
  onChangeMax: (val: number) => void;
  disabled?: boolean;
}) => (
  <div className={`mb-6 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
    <div className="flex justify-between text-xs text-cyan-400 mb-2 font-medium">
      <span>{label}</span>
      <Info size={14} />
    </div>
    <div className="flex items-center space-x-2 mb-2">
       <input 
         type="number" 
         value={minVal} 
         onChange={(e) => onChangeMin(Number(e.target.value))}
         className="w-12 bg-gray-800 text-white text-xs p-1 rounded text-center border border-gray-700 focus:border-cyan-500 outline-none"
         disabled={disabled}
       />
       <span className="text-gray-500">-</span>
       <input 
         type="number" 
         value={maxVal} 
         onChange={(e) => onChangeMax(Number(e.target.value))}
         className="w-12 bg-gray-800 text-white text-xs p-1 rounded text-center border border-gray-700 focus:border-cyan-500 outline-none"
         disabled={disabled}
       />
    </div>
    <input
      type="range"
      min={minLimit}
      max={maxLimit}
      value={maxVal}
      onChange={(e) => onChangeMax(Number(e.target.value))}
      className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
      disabled={disabled}
    />
  </div>
);

const ToggleControl = ({ label, checked, onChange, disabled }: { label: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) => (
  <div className={`flex items-center justify-between mb-4 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
    <div className="flex items-center text-xs text-gray-300 font-medium">
      {label.toUpperCase()} 
      <Info size={12} className="ml-1 text-gray-500" />
    </div>
    <button 
      onClick={() => onChange(!checked)}
      disabled={disabled}
      className={`w-10 h-5 rounded-full flex items-center transition-colors duration-300 ${checked ? 'bg-cyan-500' : 'bg-gray-700'}`}
    >
      <div className={`w-3 h-3 rounded-full bg-white shadow-md transform transition-transform duration-300 ml-1 ${checked ? 'translate-x-5' : ''}`} />
    </button>
  </div>
);

const Sidebar: React.FC<SidebarProps> = ({ settings, setSettings, appMode, setAppMode, user }) => {
  const [logoError, setLogoError] = useState(false);

  const update = (key: keyof MetadataSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="w-80 bg-sidebar border-r border-gray-800 flex flex-col h-full overflow-y-auto no-scrollbar">
      {/* Logo Area */}
      <div className="p-6 border-b border-gray-800 flex justify-center items-center bg-[#0B0E14]">
        <div className="flex items-center gap-3 select-none">
            {/* Icon Logo (Custom Image or Styled Zap Fallback) */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 overflow-hidden">
                {!logoError ? (
                    <img 
                        src="logo.png" 
                        alt="GTRIK" 
                        className="w-full h-full object-cover"
                        onError={() => setLogoError(true)}
                    />
                ) : (
                    <Zap size={28} className="text-white fill-white" />
                )}
            </div>

            <div className="flex flex-col items-start">
                {/* Top Line: GTRIK iT */}
                <div className="flex items-center text-3xl font-black italic tracking-tighter leading-none">
                    <span className="text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.1)]">GTRIK</span>
                    <span className="text-cyan-400 ml-1 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]">iT</span>
                </div>
                
                {/* Bottom Line: Icon + METAGEN AI */}
                <div className="flex items-center mt-1">
                    <Zap size={12} className="text-cyan-400 mr-1.5 fill-current animate-pulse" />
                    <span className="text-[10px] font-bold text-cyan-400 tracking-[0.25em] uppercase">METAGEN AI</span>
                </div>
            </div>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="p-5 border-b border-gray-800">
        <h3 className="text-xs text-cyan-500 mb-3 font-semibold">Mode Selection</h3>
        <div className="flex space-x-2">
          <button 
            onClick={() => setAppMode(AppMode.Metadata)}
            className={`flex-1 py-2 px-3 rounded flex items-center justify-center text-sm font-medium transition-colors border
                ${appMode === AppMode.Metadata 
                    ? 'bg-cyan-900/30 border-cyan-500/50 text-cyan-400' 
                    : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:bg-gray-800'}`}
          >
            <FileText size={16} className="mr-2" /> Metadata
          </button>
          <button 
            onClick={() => setAppMode(AppMode.ImageToPrompt)}
            className={`flex-1 py-2 px-3 rounded flex items-center justify-center text-sm font-medium transition-colors border
                ${appMode === AppMode.ImageToPrompt
                    ? 'bg-cyan-900/30 border-cyan-500/50 text-cyan-400' 
                    : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:bg-gray-800'}`}
          >
            <ImageIcon size={16} className="mr-2" /> Image to Prompt
          </button>
        </div>
      </div>

      {/* Metadata Customization - Only show in Metadata Mode */}
      {appMode === AppMode.Metadata && (
        <div className="animate-fade-in relative">
            
            <div className="p-5 border-b border-gray-800">
                <h3 className="text-xs text-cyan-500 mb-4 font-semibold flex items-center justify-between">
                    Metadata Customization
                </h3>
                
                <SliderControl 
                  label="Min/Max Title Words" 
                  minVal={settings.minTitleWords} 
                  maxVal={settings.maxTitleWords}
                  minLimit={1} maxLimit={50}
                  onChangeMin={(v) => update('minTitleWords', v)}
                  onChangeMax={(v) => update('maxTitleWords', v)}
                />

                <SliderControl 
                  label="Min/Max Keywords" 
                  minVal={settings.minKeywords} 
                  maxVal={settings.maxKeywords}
                  minLimit={1} maxLimit={50}
                  onChangeMin={(v) => update('minKeywords', v)}
                  onChangeMax={(v) => update('maxKeywords', v)}
                />

                <SliderControl 
                  label="Min/Max Description Words" 
                  minVal={settings.minDescWords} 
                  maxVal={settings.maxDescWords}
                  minLimit={1} maxLimit={100}
                  onChangeMin={(v) => update('minDescWords', v)}
                  onChangeMax={(v) => update('maxDescWords', v)}
                />
            </div>

            {/* Settings */}
            <div className="p-5">
                <h3 className="text-xs text-cyan-500 mb-4 font-semibold flex items-center uppercase">
                <Settings size={14} className="mr-2" /> Settings
                </h3>

                <ToggleControl 
                    label="Single Word Keywords" 
                    checked={settings.singleWordKeywords} 
                    onChange={(v) => update('singleWordKeywords', v)} 
                />
                <ToggleControl 
                    label="Silhouette" 
                    checked={settings.silhouette} 
                    onChange={(v) => update('silhouette', v)} 
                />
                <ToggleControl 
                    label="Custom Prompt" 
                    checked={settings.customPrompt} 
                    onChange={(v) => update('customPrompt', v)} 
                />
                <ToggleControl 
                    label="Transparent Background" 
                    checked={settings.transparentBackground} 
                    onChange={(v) => update('transparentBackground', v)} 
                />
                <ToggleControl 
                    label="Prohibited Words" 
                    checked={settings.prohibitedWords} 
                    onChange={(v) => update('prohibitedWords', v)} 
                />
            </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;