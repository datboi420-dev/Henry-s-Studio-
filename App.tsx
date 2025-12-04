
import React, { useState, useEffect } from 'react';
import { AppState, BackgroundPreset, AspectRatio, HistoryItem } from './types';
import CameraView from './components/CameraView';
import PreviewEditor from './components/PreviewEditor';
import ResultView from './components/ResultView';
import HistoryView from './components/HistoryView';
import { generateProductImage, isolateProduct } from './services/geminiService';
import { SparklesIcon, ClockIcon } from './components/Icons';
import { APP_NAME } from './constants';

const HISTORY_STORAGE_KEY = 'henrys_studio_history';
const MAX_HISTORY_ITEMS = 10; // Limit to prevent localStorage overflow

const App = () => {
  // 'HOME' now represents the Camera + History view
  const [appState, setAppState] = useState<AppState>('HOME');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<BackgroundPreset | null>(null);
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>('1:1');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isIsolating, setIsIsolating] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load History on Mount
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error("Failed to load history", e);
    }
  }, []);

  // Save History Helper
  const saveHistoryToStorage = (newHistory: HistoryItem[]) => {
    try {
      // Keep only recent items to avoid quota limit (base64 images are large)
      const trimmedHistory = newHistory.slice(0, MAX_HISTORY_ITEMS);
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(trimmedHistory));
      setHistory(trimmedHistory);
    } catch (e) {
      console.error("Storage quota exceeded", e);
      // Fallback: don't save if full, or try to save fewer items
    }
  };

  // Transition: Capture Photo
  const handleCapture = (imageData: string) => {
    setCapturedImage(imageData);
    setAppState('PREVIEW');
  };

  // Transition: Retake
  const handleRetake = () => {
    setCapturedImage(null);
    setProcessedImage(null);
    setAppState('HOME');
  };

  // Action: Isolate Product (Remove background/hands in preview)
  const handleIsolate = async () => {
    if (!capturedImage) return;
    setIsIsolating(true);
    try {
      const isolated = await isolateProduct(capturedImage);
      setCapturedImage(isolated); // Update the preview image with the isolated one
    } catch (error) {
      console.error(error);
      alert("Could not isolate product. Try capturing again with better lighting.");
    } finally {
      setIsIsolating(false);
    }
  };

  // Transition: Process Image with Gemini
  const handleProcess = async (preset: BackgroundPreset, ratio: AspectRatio, customColor?: string) => {
    if (!capturedImage) return;

    setSelectedPreset(preset);
    setSelectedRatio(ratio);
    setIsProcessing(true);
    setAppState('PROCESSING');

    try {
      const resultUrl = await generateProductImage({
        image: capturedImage,
        preset: preset,
        customColor: customColor,
        aspectRatio: ratio
      });
      setProcessedImage(resultUrl);
      
      // Auto-save to history on success
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        imageUrl: resultUrl,
        presetName: preset.name,
        presetColor: customColor || preset.color
      };
      
      const updatedHistory = [newItem, ...history];
      saveHistoryToStorage(updatedHistory);

      setAppState('RESULT');
    } catch (error) {
      console.error(error);
      alert("Failed to process image. Please try again.");
      setAppState('PREVIEW');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Regeneration from Result View (Tweak Background)
  const handleRegenerate = async (preset: BackgroundPreset, customColor?: string): Promise<void> => {
    if (!capturedImage) return;
    
    try {
      const resultUrl = await generateProductImage({
        image: capturedImage,
        preset: preset,
        customColor: customColor,
        aspectRatio: selectedRatio
      });
      setProcessedImage(resultUrl);
      setSelectedPreset(preset);

      // Add to history
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        imageUrl: resultUrl,
        presetName: preset.name,
        presetColor: customColor || preset.color
      };
      const updatedHistory = [newItem, ...history];
      saveHistoryToStorage(updatedHistory);

    } catch (error) {
      console.error(error);
      alert("Failed to update background. Please try again.");
    }
  };

  // Transition: Back from Result
  const handleBackToEdit = () => {
    setAppState('PREVIEW');
  };

  // Transition: Start Over
  const handleHome = () => {
    setAppState('HOME');
    setCapturedImage(null);
    setProcessedImage(null);
  };

  // History Actions
  const handleClearHistory = () => {
    if (confirm("Clear all history? This cannot be undone.")) {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
      setHistory([]);
    }
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setProcessedImage(item.imageUrl);
    setCapturedImage(item.imageUrl); // Use the history image as the "captured" source for further edits if needed
    setSelectedPreset({
      id: 'history_item',
      name: item.presetName,
      color: item.presetColor,
      promptDescription: '',
      textColor: 'text-black'
    });
    setSelectedRatio('1:1'); 
    setAppState('RESULT');
  };

  // View: Processing Overlay
  if (appState === 'PROCESSING') {
    return (
      <div className="h-full w-full bg-black flex flex-col items-center justify-center p-8 relative">
        {/* Background blurred capture */}
        {capturedImage && (
          <div className="absolute inset-0 opacity-20 filter blur-xl">
            <img src={capturedImage} className="w-full h-full object-cover" alt="blur" />
          </div>
        )}
        
        <div className="z-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-6"></div>
          <h2 className="text-2xl font-bold text-white mb-2">Refining Details...</h2>
          <p className="text-gray-400 text-sm animate-pulse">
            Applying {selectedPreset?.name || "Custom"} style...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full max-w-md mx-auto relative bg-black shadow-2xl overflow-hidden flex flex-col">
      {appState === 'HOME' && (
        <>
          {/* Main Camera Area */}
          <div className="flex-1 relative rounded-b-[2.5rem] overflow-hidden z-10 shadow-2xl bg-gray-900 border-b border-gray-800">
            <CameraView onCapture={handleCapture} />
            
            {/* App Title Overlay */}
            <div className="absolute top-6 left-0 right-0 text-center pointer-events-none">
              <span className="bg-black/40 backdrop-blur-md text-white/90 text-sm font-semibold px-4 py-1.5 rounded-full shadow-sm">
                {APP_NAME}
              </span>
            </div>
          </div>

          {/* History Strip */}
          <div className="h-40 bg-black flex flex-col pt-4 pb-6 px-4 z-0">
             <div className="flex justify-between items-end mb-3 px-2">
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-white font-bold text-sm tracking-wide">Recent Photos</h3>
                </div>
                {history.length > 0 && (
                  <button onClick={() => setAppState('HISTORY')} className="text-gray-500 text-xs hover:text-white transition-colors">
                    View All ({history.length})
                  </button>
                )}
             </div>
             
             {history.length === 0 ? (
               <div className="flex-1 flex items-center justify-center border border-dashed border-gray-800 rounded-xl">
                 <p className="text-gray-600 text-xs">No photos yet. Start capturing!</p>
               </div>
             ) : (
               <div className="flex gap-3 overflow-x-auto no-scrollbar items-center h-full">
                  {history.slice(0, 5).map((item) => (
                    <button 
                      key={item.id}
                      onClick={() => handleSelectHistoryItem(item)}
                      className="relative flex-shrink-0 h-20 w-20 rounded-xl overflow-hidden border border-gray-700 active:scale-95 transition-transform"
                    >
                      <img src={item.imageUrl} alt="History" className="w-full h-full object-cover" />
                    </button>
                  ))}
                  {history.length > 5 && (
                    <button 
                      onClick={() => setAppState('HISTORY')}
                      className="flex-shrink-0 h-20 w-12 rounded-xl bg-gray-900 flex items-center justify-center border border-gray-800"
                    >
                      <span className="text-gray-400 text-xs font-bold">+{history.length - 5}</span>
                    </button>
                  )}
               </div>
             )}
          </div>
        </>
      )}

      {appState === 'PREVIEW' && capturedImage && (
        <PreviewEditor 
          capturedImage={capturedImage}
          onRetake={handleRetake}
          onProcess={handleProcess}
          onIsolate={handleIsolate}
          isIsolating={isIsolating}
        />
      )}

      {appState === 'RESULT' && processedImage && selectedPreset && capturedImage && (
        <ResultView 
          processedImage={processedImage}
          capturedImage={capturedImage}
          originalPreset={selectedPreset}
          currentAspectRatio={selectedRatio}
          onBack={handleBackToEdit}
          onHome={handleHome}
          onRegenerate={handleRegenerate}
        />
      )}

      {appState === 'HISTORY' && (
        <HistoryView 
          history={history}
          onBack={handleHome}
          onSelect={handleSelectHistoryItem}
          onClear={handleClearHistory}
        />
      )}
    </div>
  );
};

export default App;
