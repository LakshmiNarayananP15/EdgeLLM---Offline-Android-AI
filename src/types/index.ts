export type ModelFamily = 'llama' | 'gemma' | 'qwen' | 'smollm';

export interface EdgeModel {
  id: string;
  name: string;
  family: ModelFamily;
  version: string;
  parameters: string; // e.g. "1.1B", "2.6B", "0.5B"
  quantization: string; // e.g. "q4f16", "q4_K_M", "INT4", "q8_0"
  fileSizeMb: number; // e.g. 780
  recommendedRamGb: number; // e.g. 4
  contextWindow: number; // e.g. 8192
  tokensPerSecBenchmark: number; // e.g. 28.5
  description: string;
  bestFor: string;
  status: 'ready' | 'downloading' | 'cached' | 'not_cached';
  downloadProgress?: number; // 0 to 100
  isDefault?: boolean;
  accentColor: string; // Tailwind color or hex
  tags: string[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  reasoningContent?: string;
  timestamp: number;
  modelId?: string;
  metrics?: {
    timeToFirstTokenMs: number;
    totalTimeMs: number;
    tokensGenerated: number;
    tokensPerSec: number;
    memoryAllocatedMb: number;
  };
}

export interface ChatSession {
  id: string;
  title: string;
  modelId: string;
  createdAt: number;
  updatedAt: number;
  pinned?: boolean;
  systemPrompt?: string;
  messages: Message[];
  totalTokens?: number;
}

export interface EngineSettings {
  hardwareBackend: 'webgpu' | 'npu' | 'wasm_simd' | 'cpu';
  temperature: number;
  topP: number;
  maxTokens: number;
  contextLength: number;
  repetitionPenalty: number;
  streamSpeed: number; // 1x, 1.5x, 2x
  batterySaver: boolean;
  hapticFeedback: boolean;
  offlineEnforced: boolean;
  customSystemPrompt: string;
}

export type ActiveTab = 'chat' | 'history' | 'models';
