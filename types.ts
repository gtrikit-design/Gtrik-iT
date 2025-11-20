
export enum Platform {
  AdobeStock = 'AdobeStock',
  Freepik = 'Freepik',
  Shutterstock = 'Shutterstock',
  Vecteezy = 'Vecteezy',
  Depositphotos = 'Depositphotos',
  RF123 = '123RF',
  Dreamstime = 'Dreamstime',
  General = 'General'
}

export enum UploadMode {
  Images = 'Images',
  Vectors = 'Vectors',
  Videos = 'Videos'
}

export enum AppMode {
  Metadata = 'Metadata',
  ImageToPrompt = 'ImageToPrompt'
}

export enum AppView {
  Tool = 'Tool',
  Pricing = 'Pricing'
}

export interface User {
  email: string;
  name: string;
  plan: string;
  credits: string; // 'Unlimited' or number
  role: 'developer' | 'student';
}

export interface MetadataSettings {
  minTitleWords: number;
  maxTitleWords: number;
  minKeywords: number;
  maxKeywords: number;
  minDescWords: number;
  maxDescWords: number;
  singleWordKeywords: boolean;
  silhouette: boolean;
  customPrompt: boolean;
  transparentBackground: boolean;
  prohibitedWords: boolean;
}

export interface GeneratedMetadata {
  title: string;
  description: string;
  keywords: string[];
  prompt?: string; // Added for Image to Prompt mode
}

export type ProcessStatus = 'idle' | 'processing' | 'success' | 'error';

export interface QueueItem {
  id: string;
  file: File;
  previewUrl: string;
  status: ProcessStatus;
  result?: GeneratedMetadata;
  error?: string;
}

export const DEFAULT_SETTINGS: MetadataSettings = {
  minTitleWords: 8,
  maxTitleWords: 22,
  minKeywords: 40,
  maxKeywords: 50,
  minDescWords: 12,
  maxDescWords: 30,
  singleWordKeywords: true,
  silhouette: false,
  customPrompt: false,
  transparentBackground: false,
  prohibitedWords: true,
};
