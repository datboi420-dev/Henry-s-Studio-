
import React, { useState, useEffect } from 'react';
import { AppState, BackgroundPreset, AspectRatio, HistoryItem } from './types';
import CameraView from './components/CameraView';
import PreviewEditor from './components/PreviewEditor';
import ResultView from './components/ResultView';
import HistoryView from './components/HistoryView';
import { generateProductImage, isolateProduct } from './services/geminiService';
import { SparklesIcon, ClockIcon, CameraIcon } from './components/Icons';
import { APP_NAME } from './constants';

const HISTORY_STORAGE_KEY = 'henrys_studio_history';
const MAX_HISTORY_ITEMS = 10; // Limit to prevent localStorage overflow

const App = () => {
  // 'HOME' is now the Landing/Get Started screen
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

  // Action: Start App from Landing
  const handleStart = () => {
    setAppState('CAMERA');
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
    setAppState('CAMERA');
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
  
  // Transition: Go to Camera
  const handleGoToCamera = () => {
      setAppState('CAMERA');
      setCapturedImage(null);
      setProcessedImage(null);
  }

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
    <div className="h-full w-full max-w-md mx-auto relative bg-black shadow-2xl overflow-hidden flex flex-col" style={{ minHeight: '100vh', height: '100%' }}>
      
      {/* Landing Page */}
      {appState === 'HOME' && (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden" style={{ 
          minHeight: '100%', 
          width: '100%',
          background: 'linear-gradient(to bottom right, #111827, #000000)'
        }}>
          
          {/* Decorative Elements */}
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '256px',
            height: '256px',
            background: 'rgba(99, 102, 241, 0.1)',
            borderRadius: '50%',
            filter: 'blur(64px)',
            transform: 'translate(50%, -50%)'
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '256px',
            height: '256px',
            background: 'rgba(168, 85, 247, 0.1)',
            borderRadius: '50%',
            filter: 'blur(64px)',
            transform: 'translate(-50%, 50%)'
          }}></div>

          <div className="z-10 flex flex-col items-center" style={{ position: 'relative', zIndex: 10 }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(to top right, #6366f1, #a855f7)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              transform: 'rotate(3deg)'
            }}>
              <CameraIcon className="w-10 h-10 text-white" />
            </div>
            
            <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: 'white', marginBottom: '8px', letterSpacing: '-0.025em' }}>{APP_NAME}</h1>
            <p style={{ color: '#9ca3af', fontSize: '18px', marginBottom: '40px', maxWidth: '320px', lineHeight: '1.625' }}>
              Turn your products into professional studio shots in seconds.
            </p>

            <button 
              onClick={handleStart}
              style={{
                width: '100%',
                maxWidth: '320px',
                padding: '16px',
                background: 'white',
                color: 'black',
                fontWeight: 'bold',
                fontSize: '18px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 10px 15px -3px rgba(255, 255, 255, 0.1)'
              }}
            >
              Start Creating
            </button>
            
            {history.length > 0 && (
                <button 
                    onClick={() => setAppState('HISTORY')}
                    style={{
                      marginTop: '24px',
                      color: '#6b7280',
                      fontSize: '14px',
                      fontWeight: '500',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                >
                    View Gallery ({history.length})
                </button>
            )}
          </div>
          
          <div style={{ position: 'absolute', bottom: '32px', color: '#4b5563', fontSize: '12px' }}>
             Powered by Gemini AI
          </div>
        </div>
      )}

      {/* Camera & History Interface */}
      {appState === 'CAMERA' && (
        <>
          {/* Main Camera Area */}
          <div className="flex-1 relative rounded-b-[2.5rem] overflow-hidden z-10 shadow-2xl bg-gray-900 border-b border-gray-800">
            <CameraView onCapture={handleCapture} />
            
            {/* App Title Overlay */}
            <div className="absolute top-6 left-0 right-0 text-center pointer-events-none">
              <span className="bg-black/40 backdrop-blur-md text-white/90 text-xs font-bold tracking-wider uppercase px-4 py-1.5 rounded-full shadow-sm">
                Live Studio
              </span>
            </div>

            <button 
              onClick={handleHome}
              className="absolute top-6 left-4 z-20 bg-black/40 backdrop-blur-md text-white p-2 rounded-full"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
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
                 <p className="text-gray-600 text-xs">No photos yet.</p>
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
          onHome={handleGoToCamera}
          onRegenerate={handleRegenerate}
        />
      )}

      {appState === 'HISTORY' && (
        <HistoryView 
          history={history}
          onBack={handleGoToCamera}
          onSelect={handleSelectHistoryItem}
          onClear={handleClearHistory}
        />
      )}
    </div>
  );
};

// Simple Chevron for local use
const ChevronLeftIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
  </svg>
);

export default App;
