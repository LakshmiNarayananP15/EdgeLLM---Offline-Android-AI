# EdgeLLM - On-Device Offline AI for Android & Web

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646cff.svg?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38bdf8.svg?logo=tailwindcss)](https://tailwindcss.com/)
[![Privacy](https://img.shields.io/badge/Privacy-100%25_Air--Gapped-3ddc84.svg)](https://github.com)

**EdgeLLM** is an ultra-fast, air-gapped on-device artificial intelligence runner engineered for mobile (Android) and modern browsers. It executes quantized Small Language Models (SLMs) locally on hardware compute cores with **zero cloud dependencies**, **zero latency**, and **absolute data privacy**.

---

## 🚀 Key Features

- **100% Air-Gapped & Offline**: Zero network requests for prompt processing. Conversations, weights, KV caches, and memories stay strictly in your device's local storage.
- **Quantized Edge SLM Support**: Runs 4-bit (`q4_k_m`), INT4, and 8-bit (`q8_0`) quantized weights with low perplexity degradation.
- **Real-Time Token Streaming**: High-throughput token generation with live streaming and visual cursors.
- **On-Device Telemetry**: Real-time measurement of **Time-To-First-Token (TTFT)** in milliseconds, **Tokens-Per-Second (tok/s)**, context token count, and memory allocation.
- **Reasoning Thought Traces**: Supports chain-of-thought models (e.g., DeepSeek-R1 Distill Qwen) with collapsible on-device reasoning blocks.
- **System Persona & Prompt Tuning**: Switch between pre-configured system personas (Concise Assistant, Android Kotlin Specialist, STEM Tutor) or set your own custom system prompts.
- **Inference Parameter Controls**: Fine-tune generation parameters on the fly, including Temperature ($0.1 - 1.5$), Top-P Nucleus Sampling, Context Length ($2048 - 16384$), and Max Output Tokens.
- **Android & Mobile-Optimized Interface**: Engineered with safe-area insets, fluid responsive scaling, dock navigation, and glassmorphism obsidian themes.

---

## 🧠 Supported Edge Models Catalog

| Model Name | Parameters | Quantization | Size on Disk | Benchmark Speed |
| :--- | :--- | :--- | :--- | :--- |
| **Meta Llama 3.2 Instruct** | 1.2B | `q4_k_m` (4-bit) | 710 MB | ~32 tok/s |
| **Meta Llama 3.2 Instruct** | 3.2B | `q4_k_m` (4-bit) | 1,820 MB | ~18 tok/s |
| **Google Gemma 2** | 2.6B | `q4_k_m` (4-bit) | 1,540 MB | ~22 tok/s |
| **Alibaba Qwen 2.5** | 0.5B | `q4_k_m` (4-bit) | 390 MB | ~65 tok/s |
| **Alibaba Qwen 2.5** | 1.5B | `q4_k_m` (4-bit) | 980 MB | ~28 tok/s |
| **Hugging Face SmolLM2** | 360M | `q8_0` (8-bit) | 380 MB | ~48 tok/s |
| **DeepSeek-R1 Distill Qwen** | 1.5B | `q4_k_m` (4-bit) | 1,120 MB | ~24 tok/s |

---

## 📁 Project Architecture & File Structure

```text
├── public/
│   ├── favicon.svg             # App vector favicon
│   └── logo.svg                # High-res Android Edge AI SVG brand asset
├── src/
│   ├── App.tsx                 # Root application shell & tab routing
│   ├── main.tsx                # React DOM client entry point
│   ├── index.css               # Global Tailwind CSS & custom design tokens
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatInterface.tsx    # Primary message stream & composer
│   │   │   ├── ChatMessageItem.tsx  # Message bubble, markdown, and metrics
│   │   │   └── ThoughtTrace.tsx     # Collapsible reasoning stream
│   │   ├── common/
│   │   │   ├── AppLogo.tsx          # Scalable vector logo component
│   │   │   ├── TopBar.tsx           # Sticky header with quick model picker
│   │   │   └── BottomNav.tsx        # Mobile-friendly dock navigation
│   │   ├── history/
│   │   │   └── HistoryInterface.tsx # Conversation history & session manager
│   │   ├── models/
│   │   │   └── ModelsInterface.tsx  # On-device model manager & weight cache
│   │   └── settings/
│   │       └── EdgeSettingsModal.tsx# Inference parameters & persona editor
│   ├── context/
│   │   └── EdgeAppContext.tsx       # Global state (chat, settings, models)
│   ├── data/
│   │   └── defaultModels.ts         # Pre-configured model repository list
│   ├── services/
│   │   ├── edgeEngine.ts            # Local inference orchestration engine
│   │   └── storageService.ts        # IndexedDB & LocalStorage persistence
│   └── types/
│       └── index.ts                 # TypeScript interfaces & types
├── index.html                  # HTML entry point with viewport configuration
├── package.json                # Project dependencies & build scripts
├── tsconfig.json               # TypeScript compiler configuration
└── vite.config.ts              # Vite build tool configuration
```

---

## 🛠️ Tech Stack

- **Frontend Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [Motion](https://motion.dev/) (Framer Motion)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Markdown & Code Highlighting**: `react-markdown`, `remark-gfm`, `prismjs`
- **Local Persistence**: `IndexedDB` & `LocalStorage`

---

## ⚡ Quick Start & Development

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0 or newer)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/) or [bun](https://bun.sh/)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/edgellm-android.git
cd edgellm-android
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000`.

### 4. Build for Production
```bash
npm run build
```
The optimized bundle will be created in the `dist/` directory.

---

## 🔒 Privacy & Security Model

1. **Air-Gapped Operation**: No prompts, chat outputs, or embeddings are transmitted to any third-party cloud API.
2. **Zero Telemetry/Tracking**: No analytics or remote error trackers are initialized.
3. **Local Sandboxing**: Chat sessions and model weights are retained strictly within browser IndexedDB/LocalStorage.
4. **Instant Wipe**: Users can delete individual chats or purge all on-device cached models with a single click.

---

## 📄 License

This project is licensed under the [Apache-2.0 License](LICENSE).
