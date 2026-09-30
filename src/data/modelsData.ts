import { EdgeModel } from '../types';

export const INITIAL_EDGE_MODELS: EdgeModel[] = [
  {
    id: 'llama-3.2-1b-instruct-q4',
    name: 'Llama 3.2 1B Instruct',
    family: 'llama',
    version: '3.2',
    parameters: '1.2B',
    quantization: 'q4f16 (4-bit)',
    fileSizeMb: 780,
    recommendedRamGb: 3,
    contextWindow: 8192,
    tokensPerSecBenchmark: 32.4,
    description: 'Meta\'s ultra-compact, high-speed edge model optimized specifically for mobile processors and edge devices with instant response times.',
    bestFor: 'Rapid mobile chats, summarizing notes, low battery drain',
    status: 'ready',
    isDefault: true,
    accentColor: '#3b82f6', // Blue
    tags: ['Ultra-Fast', 'Low RAM', 'Meta', 'Mobile Native']
  },
  {
    id: 'llama-3.2-3b-instruct-q4',
    name: 'Llama 3.2 3B Instruct',
    family: 'llama',
    version: '3.2',
    parameters: '3.2B',
    quantization: 'q4_K_M (4-bit)',
    fileSizeMb: 1950,
    recommendedRamGb: 5,
    contextWindow: 8192,
    tokensPerSecBenchmark: 22.1,
    description: 'High-capability mobile powerhouse with strong reasoning, instruction following, and multilingual support on mid-tier Android devices.',
    bestFor: 'Complex instructions, deep writing, logical analysis',
    status: 'cached',
    accentColor: '#60a5fa', // Light Blue
    tags: ['High Reasoning', 'Balanced', 'Meta', 'Flagship']
  },
  {
    id: 'gemma-2-2b-it-q4',
    name: 'Gemma 2 2B Instruct',
    family: 'gemma',
    version: '2.0',
    parameters: '2.6B',
    quantization: 'q4f32 (INT4)',
    fileSizeMb: 1450,
    recommendedRamGb: 4,
    contextWindow: 8192,
    tokensPerSecBenchmark: 26.8,
    description: 'Google\'s state-of-the-art lightweight architecture built from Gemini research, delivering best-in-class reasoning per parameter.',
    bestFor: 'Code generation, math problem solving, factual comprehension',
    status: 'cached',
    accentColor: '#10b981', // Emerald/Google green
    tags: ['Google DeepMind', 'Math & Code', 'High Accuracy']
  },
  {
    id: 'gemma-2-9b-it-q4',
    name: 'Gemma 2 9B Instruct',
    family: 'gemma',
    version: '2.0',
    parameters: '9.2B',
    quantization: 'q4_0 (4-bit)',
    fileSizeMb: 5200,
    recommendedRamGb: 8,
    contextWindow: 8192,
    tokensPerSecBenchmark: 11.4,
    description: 'Google\'s flagship compact model competing with 20B+ models. Recommended for flagship Android devices with 8GB+ RAM.',
    bestFor: 'Advanced coding, in-depth academic reasoning, creative prose',
    status: 'not_cached',
    accentColor: '#059669', // Dark Emerald
    tags: ['Flagship Heavy', 'Deep Research', 'Google DeepMind']
  },
  {
    id: 'qwen-2.5-0.5b-instruct-q8',
    name: 'Qwen 2.5 0.5B Instruct',
    family: 'qwen',
    version: '2.5',
    parameters: '0.49B',
    quantization: 'q8_0 (8-bit)',
    fileSizeMb: 420,
    recommendedRamGb: 2,
    contextWindow: 4096,
    tokensPerSecBenchmark: 42.0,
    description: 'Alibaba Cloud\'s featherweight conversational model with remarkably high 8-bit precision retention at under 450MB storage.',
    bestFor: 'Zero latency instant replies, extreme battery preservation, budget devices',
    status: 'cached',
    accentColor: '#8b5cf6', // Purple/Violet
    tags: ['Featherweight', '40+ tok/s', 'Qwen', 'Battery Saver']
  },
  {
    id: 'qwen-2.5-1.5b-instruct-q4',
    name: 'Qwen 2.5 1.5B Instruct',
    family: 'qwen',
    version: '2.5',
    parameters: '1.54B',
    quantization: 'q4_K_M (4-bit)',
    fileSizeMb: 980,
    recommendedRamGb: 3,
    contextWindow: 8192,
    tokensPerSecBenchmark: 30.2,
    description: 'Exceptional multilingual and coding compact model with native 29+ languages support and structured JSON capabilities.',
    bestFor: 'Multilingual queries, code snippets, structured JSON tasks',
    status: 'ready',
    accentColor: '#a855f7', // Purple
    tags: ['Multilingual (29+)', 'Code Assistant', 'Qwen']
  },
  {
    id: 'qwen-2.5-3b-instruct-q4',
    name: 'Qwen 2.5 3B Instruct',
    family: 'qwen',
    version: '2.5',
    parameters: '3.09B',
    quantization: 'q4_K_M (4-bit)',
    fileSizeMb: 1880,
    recommendedRamGb: 5,
    contextWindow: 8192,
    tokensPerSecBenchmark: 23.5,
    description: 'Top-tier 3B model achieving benchmark scores rivaling older 7B models across STEM, coding, and roleplay on-device.',
    bestFor: 'STEM reasoning, algorithms, creative workflows',
    status: 'not_cached',
    accentColor: '#7c3aed', // Deep Violet
    tags: ['STEM Specialist', '3B Leader', 'Qwen']
  },
  {
    id: 'smollm2-360m-instruct-q8',
    name: 'SmolLM2 360M Instruct',
    family: 'smollm',
    version: '2.0',
    parameters: '360M',
    quantization: 'q8_0 (8-bit)',
    fileSizeMb: 365,
    recommendedRamGb: 1.5,
    contextWindow: 4096,
    tokensPerSecBenchmark: 48.0,
    description: 'Hugging Face\'s ultra-compact model trained on Cosmopedia v2. Blazingly fast token generation on almost any mobile CPU.',
    bestFor: 'Micro tasks, grammar checks, instant offline definitions',
    status: 'cached',
    accentColor: '#f59e0b', // Amber
    tags: ['Micro Model', '48 tok/s', 'HuggingFace', 'WASM Native']
  }
];
