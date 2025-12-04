
export type AppState = 'HOME' | 'CAMERA' | 'PREVIEW' | 'PROCESSING' | 'RESULT' | 'HISTORY';

export type AspectRatio = '1:1' | '4:3' | '16:9' | '9:16';

export interface BackgroundPreset {
  id: string;
  name: string;
  color: string; // Hex for UI preview
  promptDescription: string; // Description for Gemini
  textColor: string; // For the label in UI
}

export interface ProcessingConfig {
  image: string; // Base64
  preset: BackgroundPreset;
  customColor?: string;
  aspectRatio: AspectRatio;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  imageUrl: string;
  presetName: string;
  presetColor: string;
}
