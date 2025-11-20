import React from 'react';
import { Platform } from '../types';
import { Crown, Camera, PenTool, Image as ImageIcon, Circle } from 'lucide-react';

interface PlatformSelectorProps {
  selected: Platform;
  onSelect: (p: Platform) => void;
}

const platforms = [
  { id: Platform.General, label: 'General', icon: Circle },
  { id: Platform.AdobeStock, label: 'AdobeStock', icon: 'St' },
  { id: Platform.Freepik, label: 'Freepik', icon: Crown },
  { id: Platform.Shutterstock, label: 'Shutterstock', icon: Camera },
  { id: Platform.Vecteezy, label: 'Vecteezy', icon: PenTool },
  { id: Platform.Depositphotos, label: 'Depositphotos', icon: ImageIcon },
  { id: Platform.RF123, label: '123RF', icon: ImageIcon },
  { id: Platform.Dreamstime, label: 'Dreamstime', icon: Circle },
];

const PlatformSelector: React.FC<PlatformSelectorProps> = ({ selected, onSelect }) => {
  return (
    <div className="flex flex-col items-center mb-8">
      <h2 className="text-xs text-cyan-500 mb-3 font-semibold tracking-wider">PLATFORMS</h2>
      <div className="flex flex-wrap justify-center gap-3">
        {platforms.map((p) => {
          const isActive = selected === p.id;
          const Icon = p.icon;
          return (
            <button
              key={p.id}
              onClick={() => onSelect(p.id)}
              className={`
                flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border
                ${isActive 
                  ? 'bg-[#2e1065] border-purple-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.5)]' 
                  : 'bg-[#111827] border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200'}
              `}
            >
               <span className={`mr-2 ${isActive ? 'text-purple-400' : 'text-gray-500'}`}>
                 {typeof Icon === 'string' ? <span className="font-serif font-bold text-lg">{Icon}</span> : <Icon size={16} />}
               </span>
               {p.label}
            </button>
          );
        })}
      </div>
      <div className="w-full max-w-4xl h-[1px] bg-gradient-to-r from-transparent via-cyan-900 to-transparent mt-6"></div>
    </div>
  );
};

export default PlatformSelector;