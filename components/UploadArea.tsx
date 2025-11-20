
import React, { useState, DragEvent } from 'react';
import { Upload, Image as ImageIcon, PenTool, Video } from 'lucide-react';
import { UploadMode } from '../types';

interface UploadAreaProps {
  onFilesSelect: (files: File[]) => void;
  isProcessing: boolean;
  mode: UploadMode;
  setMode: (mode: UploadMode) => void;
}

const UploadArea: React.FC<UploadAreaProps> = ({ onFilesSelect, isProcessing, mode, setMode }) => {
  const [isDragging, setIsDragging] = useState(false);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelect(Array.from(e.target.files));
      // Reset value so same files can be selected again if needed
      e.target.value = '';
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isProcessing) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (isProcessing) return;

    const droppedFiles: File[] = Array.from(e.dataTransfer.files);
    if (droppedFiles.length === 0) return;

    // Filter files based on current mode
    const validFiles = droppedFiles.filter(file => {
      if (mode === UploadMode.Vectors) {
        return file.name.toLowerCase().endsWith('.eps');
      } else if (mode === UploadMode.Images) {
        return file.type.startsWith('image/');
      } else if (mode === UploadMode.Videos) {
        return file.type.startsWith('video/');
      }
      return false;
    });

    if (validFiles.length > 0) {
      onFilesSelect(validFiles);
    } else {
      // Optional: Alert user if they dropped wrong file type
      // alert(`Please drop ${mode === UploadMode.Vectors ? 'EPS' : 'Image'} files only.`);
    }
  };

  return (
    <div className="flex justify-center items-center w-full px-10">
      {/* Gradient Border Wrapper */}
      <div 
        className={`relative w-full max-w-3xl p-[1px] rounded-[30px] transition-all duration-300
          ${isDragging 
            ? 'bg-gradient-to-br from-white via-cyan-300 to-white scale-[1.02] shadow-[0_0_30px_rgba(6,182,212,0.4)]' 
            : 'bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500'
          }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        
        {/* Inner Dark Container */}
        <div className={`rounded-[29px] p-16 flex flex-col items-center justify-center text-center min-h-[400px] transition-colors duration-300
            ${isDragging ? 'bg-[#0F1623]/90' : 'bg-[#0F1623]'}
        `}>
          
          {/* Icon Circle */}
          <div className={`mb-6 w-16 h-16 rounded-full flex items-center justify-center border shadow-lg transition-all duration-300
             ${isDragging ? 'bg-cyan-900/30 border-cyan-400 scale-110' : 'bg-[#1F2937] border-gray-700'}
          `}>
            {isProcessing ? (
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-400"></div>
            ) : (
                <Upload className={isDragging ? "text-cyan-400" : "text-gray-400"} size={28} />
            )}
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">
            {isDragging ? `Drop ${mode} Here` : `Choose ${mode}`}
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            {isDragging ? "Release to upload" : "or drag and drop files here"}
          </p>

          {/* Buttons */}
          <div className={`flex gap-4 mb-8 ${isDragging ? 'pointer-events-none opacity-50' : ''}`}>
            {/* Images Button */}
            <label 
              onClick={() => setMode(UploadMode.Images)}
              className={`cursor-pointer py-2 px-6 rounded-full font-medium text-sm transition-colors flex items-center border
                ${mode === UploadMode.Images 
                  ? 'bg-cyan-600 hover:bg-cyan-500 text-white border-cyan-400' 
                  : 'bg-gray-800/50 text-gray-400 border-gray-700 hover:bg-gray-800'}`}
            >
               <ImageIcon size={16} className="mr-2"/> Images
               {mode === UploadMode.Images && (
                 <input 
                   type="file" 
                   multiple 
                   className="hidden" 
                   accept="image/*" 
                   onChange={handleInputChange} 
                   disabled={isProcessing} 
                 />
               )}
            </label>
            
            {/* Vectors Button */}
            <label 
              onClick={() => setMode(UploadMode.Vectors)}
              className={`cursor-pointer py-2 px-6 rounded-full font-medium text-sm transition-colors flex items-center border
                ${mode === UploadMode.Vectors 
                  ? 'bg-cyan-600 hover:bg-cyan-500 text-white border-cyan-400' 
                  : 'bg-cyan-800/30 text-cyan-400 border-cyan-800/50 hover:bg-cyan-900/50'}`}
            >
                <PenTool size={16} className="mr-2"/> Vectors
                {mode === UploadMode.Vectors && (
                 <input 
                   type="file" 
                   multiple 
                   className="hidden" 
                   accept=".eps" 
                   onChange={handleInputChange} 
                   disabled={isProcessing} 
                 />
               )}
            </label>
            
            {/* Videos Button - Enabled */}
            <label 
              onClick={() => setMode(UploadMode.Videos)}
              className={`cursor-pointer py-2 px-6 rounded-full font-medium text-sm transition-colors flex items-center border
                ${mode === UploadMode.Videos 
                  ? 'bg-cyan-600 hover:bg-cyan-500 text-white border-cyan-400' 
                  : 'bg-red-900/30 text-red-400 border-red-900/50 hover:bg-red-900/50'}`}
            >
                <Video size={16} className="mr-2"/> Videos
                {mode === UploadMode.Videos && (
                 <input 
                   type="file" 
                   multiple 
                   className="hidden" 
                   accept="video/*" 
                   onChange={handleInputChange} 
                   disabled={isProcessing} 
                 />
               )}
            </label>
          </div>

          <div className="text-gray-500 text-xs flex items-center mb-2">
             <span className="mr-1">🔒</span> Privacy Statement
          </div>
          <p className="text-gray-600 text-[10px] max-w-md mb-8">
            We process your files directly on your device (via API). All data is automatically removed after metadata extraction.
          </p>

          <div className="text-gray-300 font-medium">
            Process <span className="text-white">Unlimited {mode.toLowerCase()}</span> in a Single Action
          </div>

        </div>
      </div>
    </div>
  );
};

export default UploadArea;
