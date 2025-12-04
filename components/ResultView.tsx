import React, { useState, useRef } from 'react';
import { ArrowDownTrayIcon, ChevronLeftIcon, SwatchIcon } from './Icons';
import { BackgroundPreset, AspectRatio } from '../types';
import { BACKGROUND_PRESETS } from '../constants';

interface ResultViewProps {
  processedImage: string;
  capturedImage: string;
  originalPreset: BackgroundPreset;
  currentAspectRatio: AspectRatio;
  onBack: () => void;
  onHome: () => void;
  onRegenerate: (preset: BackgroundPreset, customColor?: string) => Promise<void>;
}

const ResultView: React.FC<ResultViewProps> = ({ 
  processedImage, 
  capturedImage,
  originalPreset, 
  currentAspectRatio,
  onBack, 
  onHome,
  onRegenerate
}) => {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string>(originalPreset.id);
  const colorInputRef = useRef<HTMLInputElement>(null);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = processedImage;
    link.download = `henrys_studio_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePresetChange = async (preset: BackgroundPreset) => {
    if (isRegenerating || preset.id === selectedPresetId) return;
    
    setSelectedPresetId(preset.id);
    setIsRegenerating(true);
    try {
      await onRegenerate(preset);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleCustomColorChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setSelectedPresetId('custom');
    setIsRegenerating(true);
    try {
      const customPreset: BackgroundPreset = {
        id: 'custom',
        name: 'Custom',
        color: color,
        promptDescription: 'solid color background',
        textColor: 'text-white'
      };
      await onRegenerate(customPreset, color);
    } finally {
      setIsRegenerating(false);
    }
  };

  const triggerColorPicker = () => {
    colorInputRef.current?.click();
  };

  return (
    <div className="flex flex-col h-full bg-black relative">
       {/* Hidden Color Input */}
       <input 
        type="color" 
        ref={colorInputRef} 
        className="absolute opacity-0 top-0 left-0 -z-10 w-1 h-1"
        onChange={handleCustomColorChange} 
      />

       {/* Header */}
       <div className="absolute top-0 left-0 right-0 z-10 p-4 pt-6 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
        <button onClick={onBack} className="pointer-events-auto text-white flex items-center gap-1 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-md">
          <ChevronLeftIcon className="w-5 h-5" />
          <span className="text-sm font-medium">Edit</span>
        </button>
        
        <button onClick={onHome} className="pointer-events-auto text-white text-sm font-medium bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-md">
          New Photo
        </button>
      </div>

      {/* Result Image Area */}
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-900 relative overflow-hidden">
        <div className="relative shadow-2xl overflow-hidden max-h-[65vh] w-full flex items-center justify-center">
          <img 
            src={processedImage} 
            alt="Processed Product" 
            className={`object-contain max-h-[65vh] max-w-full transition-opacity duration-300 ${isRegenerating ? 'opacity-50 blur-sm' : 'opacity-100'}`}
          />
          
          {/* Loading Overlay */}
          {isRegenerating && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
              <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2"></div>
              <p className="text-white font-bold drop-shadow-md">Updating...</p>
            </div>
          )}
        </div>
      </div>

      {/* Controls & Actions */}
      <div className="bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-20 flex flex-col">
        
        {/* Background Tweaking Section */}
        <div className="pt-5 pb-2 border-b border-gray-100">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider px-6 mb-3">Refine Background</p>
          <div className="flex gap-4 overflow-x-auto no-scrollbar px-6 pb-2 items-center">
            
            {/* Custom Picker Button */}
            <button 
              onClick={triggerColorPicker}
              className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all ${selectedPresetId === 'custom' ? 'ring-4 ring-indigo-500 bg-gray-100' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              <SwatchIcon className="w-6 h-6 text-gray-600" />
            </button>

            {/* Divider */}
            <div className="w-px h-8 bg-gray-300 mx-1 flex-shrink-0"></div>

            {/* Presets */}
            {BACKGROUND_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePresetChange(preset)}
                className={`flex-shrink-0 w-12 h-12 rounded-full border-2 transition-all relative ${selectedPresetId === preset.id ? 'border-indigo-500 scale-110 shadow-lg' : 'border-gray-200 hover:scale-105'}`}
                style={{ backgroundColor: preset.color }}
                title={preset.name}
              />
            ))}
          </div>
        </div>

        {/* Main Actions */}
        <div className="p-6 pt-4">
          <button 
            onClick={handleDownload}
            disabled={isRegenerating}
            className="w-full py-4 bg-indigo-600 text-white font-bold text-lg rounded-2xl flex items-center justify-center gap-2 active:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/30 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <ArrowDownTrayIcon className="w-6 h-6" />
            Save to Photos
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultView;