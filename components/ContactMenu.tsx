import React, { useState, useRef, useEffect } from 'react';
import { Facebook, Youtube, Users } from 'lucide-react';

const ContactMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const links = [
    {
      label: 'Facebook Page',
      url: 'https://www.facebook.com/Gtrikitofficialpage',
      icon: <Facebook size={18} className="text-blue-500" />
    },
    {
      label: 'Facebook Group',
      url: 'https://www.facebook.com/groups/gtrikitofficialpublicgroup',
      icon: <Users size={18} className="text-blue-400" />
    },
    {
      label: 'YouTube',
      url: 'https://www.youtube.com/@GtrikitBD',
      icon: <Youtube size={18} className="text-red-500" />
    }
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-red-500 text-white font-semibold text-xs py-2 px-4 rounded shadow-lg hover:bg-red-600 transition-colors"
      >
        Contact
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-56 bg-[#0F1623] border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in">
          <div className="p-2 space-y-1">
            {links.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:bg-[#1F2937] hover:text-white rounded-lg transition-colors group"
                onClick={() => setIsOpen(false)}
              >
                <div className="group-hover:scale-110 transition-transform duration-200">
                    {link.icon}
                </div>
                <span className="font-medium">{link.label}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactMenu;