import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { Key, Eye, EyeOff, Copy, Infinity, LogOut } from 'lucide-react';

interface ProfileMenuProps {
  user: User;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
  onLogout: () => void;
}

const ProfileMenu: React.FC<ProfileMenuProps> = ({ user, apiKey, onSaveApiKey, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localKey, setLocalKey] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Sync local state if prop changes
  useEffect(() => {
    setLocalKey(apiKey);
  }, [apiKey]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  const handleSave = () => {
    onSaveApiKey(localKey);
    setIsOpen(false); // Optional: close on save
    alert("API Key Saved Successfully!");
  };

  const handleClear = () => {
    setLocalKey('');
    onSaveApiKey('');
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg border-2 border-transparent hover:border-white transition-all shadow-lg
          bg-gradient-to-br from-pink-500 to-rose-600
        `}
      >
        {getInitials(user.name || user.email)}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-4 w-80 bg-[#0F1623] border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in">
          
          {/* User Info Header */}
          <div className="p-5 border-b border-gray-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 bg-pink-600">
              {getInitials(user.name || user.email)}
            </div>
            <div className="overflow-hidden flex-1">
              <h3 className="text-white font-bold text-sm truncate" title={user.email}>{user.name}</h3>
              <p className="text-gray-400 text-xs truncate">{user.email}</p>
            </div>
          </div>

          <div className="p-5 space-y-5">
            
            {/* Credits Card */}
            <div>
              <div className="text-gray-400 text-xs font-bold mb-2">Credits Remaining</div>
              <div className="bg-[#151e2e] border border-gray-700 rounded-lg p-3 flex items-center justify-between">
                <span className="text-cyan-400 font-bold text-lg">{user.credits}</span>
                <Infinity className="text-pink-500" size={20} />
              </div>
            </div>

            {/* API Key Management */}
            <div>
              <div className="text-gray-400 text-xs font-bold mb-2">API Key Management</div>
              
              <div className="relative mb-3">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Key size={14} className="text-gray-500" />
                </div>
                <input 
                  type={showKey ? "text" : "password"}
                  value={localKey}
                  onChange={(e) => setLocalKey(e.target.value)}
                  placeholder="Enter your API Key"
                  className="w-full bg-[#1F2937] border border-gray-700 rounded-lg py-2 pl-9 pr-20 text-xs text-white focus:border-cyan-500 focus:outline-none"
                />
                <div className="absolute inset-y-0 right-2 flex items-center space-x-1">
                   <button onClick={() => setShowKey(!showKey)} className="p-1 text-gray-400 hover:text-white">
                     {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                   </button>
                   <button className="p-1 text-gray-400 hover:text-white">
                     <Copy size={14} />
                   </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={handleSave}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-bold py-2 rounded transition-colors"
                >
                  Save Key
                </button>
                <button 
                  onClick={handleClear}
                  className="bg-pink-600 hover:bg-pink-500 text-white text-[10px] font-bold py-2 rounded transition-colors"
                >
                  Clear
                </button>
                <button 
                   onClick={() => window.open('https://aistudio.google.com/app/apikey', '_blank')}
                   className="bg-gray-700 hover:bg-gray-600 text-white text-[10px] font-bold py-2 rounded transition-colors"
                >
                  Get New Key
                </button>
              </div>
            </div>
            
            {/* Logout */}
            <button 
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 py-2 mt-2 border border-red-900/30 text-red-400 hover:bg-red-900/20 rounded-lg text-xs font-bold transition-colors"
            >
                <LogOut size={14} /> Sign Out
            </button>

          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;