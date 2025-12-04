
import React from 'react';
import { HistoryItem } from '../types';
import { ChevronLeftIcon, TrashIcon } from './Icons';

interface HistoryViewProps {
  history: HistoryItem[];
  onBack: () => void;
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ history, onBack, onSelect, onClear }) => {
  return (
    <div className="h-full w-full bg-black flex flex-col relative">
      {/* Header */}
      <div className="p-4 pt-6 flex justify-between items-center bg-gray-900 border-b border-gray-800">
        <button onClick={onBack} className="text-white flex items-center gap-1 bg-gray-800 px-3 py-1.5 rounded-full">
          <ChevronLeftIcon className="w-5 h-5" />
          <span className="text-sm font-medium">Home</span>
        </button>
        <h2 className="text-white font-bold text-lg">History</h2>
        <button 
          onClick={onClear}
          className="text-red-400 p-2 rounded-full hover:bg-gray-800 transition-colors"
          aria-label="Clear History"
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {history.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-2">
            <p>No photos yet.</p>
            <p className="text-xs">Your generated photos will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {history.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelect(item)}
                className="relative aspect-square rounded-xl overflow-hidden bg-gray-800 border border-gray-700 active:scale-95 transition-transform"
              >
                <img 
                  src={item.imageUrl} 
                  alt={item.presetName} 
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 pt-6">
                  <p className="text-white text-xs font-bold truncate">{item.presetName}</p>
                  <p className="text-gray-300 text-[10px]">{new Date(item.timestamp).toLocaleDateString()}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryView;
