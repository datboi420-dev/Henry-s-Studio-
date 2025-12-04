import React, { useState, useRef } from 'react';
import { BackgroundPreset, AspectRatio } from '../types';
import { BACKGROUND_PRESETS } from '../constants';
import { ChevronLeftIcon, SparklesIcon, CheckIcon, SwatchIcon, MagicWandIcon } from './Icons';

interface PreviewEditorProps {
  capturedImage: string;
  onRetake: () => void;
  onProcess: (preset: BackgroundPreset, ratio: AspectRatio, customColor?: string) => void;
  onIsolate: () => void;
  isIsolating: boolean;
}

const PreviewEditor: React.FC<PreviewEditorProps> = ({ 
  capturedImage, 
  onRetake, 
  onProcess,
  onIsolate,
  isIsolating
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(BACKGROUND_PRESETS[0].id);
  const [customColor, setCustomColor] = useState<string>("#3b82f6");
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>('1:1');
  const colorInputRef = useRef<HTMLInputElement>(null);

  const handleCustomClick = () => {
    setSelectedPresetId('custom');
    colorInputRef.current?.click();
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomColor(e.target.value);
    setSelectedPresetId('custom');
  };

  const handleGenerate = () => {
    if (selectedPresetId === 'custom') {
      const customPreset: BackgroundPreset = {
        id: 'custom',
        name: 'Custom',
        color: customColor,
        promptDescription: 'solid color background',
        textColor: 'text-white'
      };
      onProcess(customPreset, selectedRatio, customColor);
    } else {
      const preset = BACKGROUND_PRESETS.find(p => p.id === selectedPresetId);
      if (preset) {
        onProcess(preset, selectedRatio);
      }
    }
  };

  const renderRatioButton = (ratio: AspectRatio, label: string, widthClass: string, heightClass: string) => (
    <button
      onClick={() => setSelectedRatio(ratio)}
      className={`flex flex-col items-center gap-2 p-2 rounded-xl transition-all duration-200 ${
        selectedRatio === ratio ? 'bg-gray-700 text-white' : 'bg-transparent text-gray-500 hover:text-gray-300'
      }`}
    >
      <div 
        className={`border-2 rounded-sm ${selectedRatio === ratio ? 'border-indigo-500 bg-gray-800' : 'border-current'}`}
        style={{ width: widthClass, height: heightClass }}
      />
      <span className="text-xs font-medium">{label}</span>
    </button>
  );

  return (
    <div className="flex flex-col h-full bg-black relative">
      {/* Hidden Color Input */}
      <input 
        type="color" 
        ref={colorInputRef} 
        className="absolute opacity-0 top-0 left-0 -z-10 w-1 h-1"
        onChange={handleColorChange} 
        value={customColor}
      />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 pt-6 flex justify-between items-center bg-gradient-to-b from-black/70 to-transparent">
        <button onClick={onRetake} className="text-white flex items-center gap-1 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-md">
          <ChevronLeftIcon className="w-5 h-5" />
          <span className="text-sm font-medium">Retake</span>
        </button>
      </div>

      {/* Main Image Preview */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-gray-900">
        <img 
          src={capturedImage} 
          alt="Original Capture" 
          className="max-w-full max-h-full object-contain"
        />
        
        {/* Magic Isolate Button */}
        <button 
          onClick={onIsolate}
          disabled={isIsolating}
          className="absolute top-4 right-4 bg-white/90 text-indigo-600 px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 backdrop-blur-sm disabled:opacity-70 active:scale-95 transition-transform"
        >
          {isIsolating ? (
            <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <MagicWandIcon className="w-4 h-4" />
          )}
          <span className="text-xs font-bold">Smart Fix</span>
        </button>

        <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded text-xs text-white/80 backdrop-blur">
          Original
        </div>
      </div>

      {/* Editor Controls */}
      <div className="bg-gray-900 rounded-t-3xl p-6 pb-10 -mt-6 z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        
        {/* Aspect Ratio Selector */}
        <div className="mb-6">
          <h3 className="text-white font-semibold text-lg mb-3">Canvas Size</h3>
          <div className="flex items-end gap-2 overflow-x-auto no-scrollbar pb-2">
            {renderRatioButton('1:1', 'Square', '28px', '28px')}
            {renderRatioButton('4:3', 'Standard', '32px', '24px')}
            {renderRatioButton('16:9', 'Wide', '36px', '20px')}
            {renderRatioButton('9:16', 'Story', '20px', '36px')}
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-white font-semibold text-lg mb-1">Select Style</h3>
          <p className="text-gray-400 text-sm">Choose a background for your product.</p>
        </div>

        {/* Presets List */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 mb-6">
          {BACKGROUND_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => setSelectedPresetId(preset.id)}
              className={`
                relative flex-shrink-0 w-24 h-32 rounded-xl flex flex-col justify-end p-2 text-left transition-all duration-200 border-2 overflow-hidden
                ${selectedPresetId === preset.id ? 'border-blue-500 scale-105' : 'border-transparent opacity-80 hover:opacity-100'}
              `}
              style={{ backgroundColor: preset.color }}
            >
              {selectedPresetId === preset.id && (
                <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-0.5 z-10">
                  <CheckIcon className="w-3 h-3 text-white" />
                </div>
              )}
              <span className={`relative z-10 text-xs font-bold leading-tight ${preset.textColor}`}>
                {preset.name}
              </span>
            </button>
          ))}

          {/* Custom Color Button */}
          <button
            onClick={handleCustomClick}
            className={`
              relative flex-shrink-0 w-24 h-32 rounded-xl flex flex-col justify-end p-2 text-left transition-all duration-200 border-2 overflow-hidden
              ${selectedPresetId === 'custom' ? 'border-blue-500 scale-105' : 'border-transparent opacity-80 hover:opacity-100'}
            `}
          >
            {/* Background */}
            <div 
              className="absolute inset-0"
              style={{ 
                background: selectedPresetId === 'custom' 
                  ? customColor 
                  : 'linear-gradient(135deg, #fca5a5, #fcd34d, #86efac, #93c5fd, #c4b5fd)' 
              }}
            />
             <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

            {selectedPresetId === 'custom' && (
              <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-0.5 z-10">
                <CheckIcon className="w-3 h-3 text-white" />
              </div>
            )}
            
            <div className="relative z-10 mb-1">
               <SwatchIcon className="w-6 h-6 text-white mb-1" />
            </div>
            <span className="relative z-10 text-xs font-bold leading-tight text-white">
              Custom Color
            </span>
          </button>
        </div>

        {/* Generate Button */}
        <button 
          onClick={handleGenerate}
          className="w-full py-4 bg-white text-black font-bold text-lg rounded-2xl flex items-center justify-center gap-2 active:bg-gray-200 transition-colors shadow-lg shadow-white/10"
        >
          <SparklesIcon className="w-5 h-5 text-indigo-600" />
          Generate Studio Photo
        </button>
      </div>
    </div>
  );
};

export default PreviewEditor;