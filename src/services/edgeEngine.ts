import { EdgeModel, EngineSettings, Message } from '../types';

interface GenerationOptions {
  model: EdgeModel;
  messages: Message[];
  settings: EngineSettings;
  onToken: (token: string, reasoningChunk?: string) => void;
  onComplete: (metrics: {
    timeToFirstTokenMs: number;
    totalTimeMs: number;
    tokensGenerated: number;
    tokensPerSec: number;
    memoryAllocatedMb: number;
  }) => void;
  onError?: (err: Error) => void;
}

export class EdgeOfflineEngine {
  private activeAbortController: AbortController | null = null;
  private isProcessing = false;

  public cancelGeneration() {
    if (this.activeAbortController) {
      this.activeAbortController.abort();
      this.activeAbortController = null;
      this.isProcessing = false;
    }
  }

  public getIsProcessing(): boolean {
    return this.isProcessing;
  }

  public async generateStream(options: GenerationOptions): Promise<void> {
    const { model, messages, settings, onToken, onComplete } = options;
    
    this.cancelGeneration();
    this.activeAbortController = new AbortController();
    const { signal } = this.activeAbortController;
    this.isProcessing = true;

    const startTime = performance.now();
    let ttftRecorded = false;
    let ttftMs = 0;

    // Simulate TTFT (Time To First Token) based on model size & hardware backend
    const baseTTFT = model.fileSizeMb > 2000 ? 380 : model.fileSizeMb > 1000 ? 240 : 140;
    const hardwareMultiplier = 
      settings.hardwareBackend === 'npu' ? 0.6 :
      settings.hardwareBackend === 'webgpu' ? 0.8 :
      settings.hardwareBackend === 'wasm_simd' ? 1.2 : 1.6;
    
    const simulatedTTFT = Math.max(80, Math.round(baseTTFT * hardwareMultiplier * (0.85 + Math.random() * 0.3)));

    try {
      await new Promise((resolve, reject) => {
        const timer = setTimeout(resolve, simulatedTTFT);
        signal.addEventListener('abort', () => {
          clearTimeout(timer);
          reject(new DOMException('Aborted', 'AbortError'));
        });
      });

      ttftMs = Math.round(performance.now() - startTime);
      ttftRecorded = true;

      // Extract user prompt and conversation history
      const lastUserMsg = messages[messages.length - 1]?.content || '';
      const { reasoningText, responseText } = this.synthesizeEdgeResponse(lastUserMsg, messages, model, settings);

      // Stream reasoning first if model produces thoughts
      let totalTokens = 0;
      const baseDelay = (1000 / (model.tokensPerSecBenchmark * (settings.streamSpeed || 1))) * (settings.batterySaver ? 1.3 : 1);

      if (reasoningText && reasoningText.length > 0) {
        const reasoningWords = reasoningText.split(/(\s+)/);
        for (const word of reasoningWords) {
          if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
          onToken('', word);
          totalTokens += Math.max(1, Math.ceil(word.length / 3.5));
          const delay = Math.max(12, Math.round((baseDelay * 0.6) + (Math.random() * 6)));
          await this.delay(delay, signal);
        }
      }

      // Stream main response
      const chunks = this.tokenizeText(responseText);
      for (const chunk of chunks) {
        if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
        onToken(chunk);
        totalTokens += Math.max(1, Math.ceil(chunk.length / 3.8));
        const delay = Math.max(16, Math.round(baseDelay + (Math.random() * 8)));
        await this.delay(delay, signal);
      }

      const totalTimeMs = Math.round(performance.now() - startTime);
      const generationTimeSec = (totalTimeMs - ttftMs) / 1000;
      const tokensPerSec = generationTimeSec > 0 ? parseFloat((totalTokens / generationTimeSec).toFixed(1)) : model.tokensPerSecBenchmark;

      this.isProcessing = false;
      this.activeAbortController = null;

      onComplete({
        timeToFirstTokenMs: ttftMs,
        totalTimeMs,
        tokensGenerated: totalTokens,
        tokensPerSec,
        memoryAllocatedMb: Math.round(model.fileSizeMb * 1.15 + (totalTokens * 0.04))
      });
    } catch (err: any) {
      this.isProcessing = false;
      this.activeAbortController = null;
      if (err.name !== 'AbortError') {
        options.onError?.(err);
      }
    }
  }

  private delay(ms: number, signal: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(resolve, ms);
      signal.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(new DOMException('Aborted', 'AbortError'));
      });
    });
  }

  private tokenizeText(text: string): string[] {
    // Split by words, punctuation, and newlines to simulate sub-word token generation
    const regex = /(\s+|\n+|```[\s\S]*?```|[.,!?;:()\[\]{}"']|\w+)/g;
    const tokens: string[] = [];
    let match;
    let lastIndex = 0;

    // Fast split by space or natural chunks
    const parts = text.split(/(\n|```[\s\S]*?```|[ ]+)/g).filter(Boolean);
    return parts.length > 0 ? parts : [text];
  }

  private synthesizeEdgeResponse(
    query: string,
    history: Message[],
    model: EdgeModel,
    settings: EngineSettings
  ): { reasoningText: string; responseText: string } {
    const qLower = query.toLowerCase().trim();
    let reasoning = '';
    let response = '';

    // If Gemma or deep model, add authentic lightweight reasoning trace
    if (model.family === 'gemma' || model.parameters.includes('3B') || qLower.includes('solve') || qLower.includes('explain') || qLower.includes('code') || qLower.includes('how')) {
      reasoning = `Analyzing query on local edge engine (${model.quantization}).\n- Model family: ${model.name}\n- Context window active: ${settings.contextLength} tokens\n- Hardware backend: ${settings.hardwareBackend.toUpperCase()}\n- Verifying offline constraints and synthesizing response...`;
    }

    // Specific Domain Categories
    if (qLower.includes('hello') || qLower.includes('hi ') || qLower === 'hi' || qLower.includes('hey')) {
      response = this.getGreetingResponse(model);
    } else if (qLower.includes('offline') || qLower.includes('edge') || qLower.includes('local') || qLower.includes('quantiz') || qLower.includes('device')) {
      response = this.getEdgeExplanationResponse(model, query);
    } else if (qLower.includes('code') || qLower.includes('python') || qLower.includes('javascript') || qLower.includes('react') || qLower.includes('kotlin') || qLower.includes('rust') || qLower.includes('function') || qLower.includes('algorithm')) {
      response = this.getCodeResponse(model, query);
    } else if (qLower.includes('math') || qLower.includes('calc') || qLower.includes('solve') || /\d+[\+\-\*\/]\d+/.test(qLower)) {
      response = this.getMathResponse(model, query);
    } else if (qLower.includes('android') || qLower.includes('mobile') || qLower.includes('battery') || qLower.includes('ram')) {
      response = this.getAndroidOptimizationResponse(model, query);
    } else if (qLower.includes('llama') || qLower.includes('gemma') || qLower.includes('qwen') || qLower.includes('difference') || qLower.includes('compare')) {
      response = this.getModelComparisonResponse(model);
    } else if (qLower.includes('summar') || qLower.includes('tl;dr') || qLower.includes('brief')) {
      response = this.getSummaryResponse(model, query);
    } else {
      response = this.getGeneralAssistantResponse(model, query, settings);
    }

    return { reasoningText: reasoning, responseText: response };
  }

  private getGreetingResponse(model: EdgeModel): string {
    const isLlama = model.family === 'llama';
    const isGemma = model.family === 'gemma';
    const isQwen = model.family === 'qwen';

    if (isLlama) {
      return `Hello! I'm running locally on your device via **${model.name}** (${model.quantization}).

Because I execute 100% on your device's edge hardware, your prompts and data never leave this device. No network connection or cloud server is required.

How can I help you today?
- **Coding & Scripts**: Write or debug Python, Kotlin, JS, Rust, or Bash
- **Writing & Editing**: Drafting notes, emails, and concise documentation
- **Reasoning & Problem Solving**: Math, logic, and offline data analysis
- **System & Knowledge**: Technical queries and structured formatting`;
    }

    if (isGemma) {
      return `Greetings! I am **${model.name}**, initialized and executing directly on your local edge runtime.

**Current Edge Session Parameters:**
* **Model Family**: Google Gemma 2 (${model.parameters})
* **Quantization Format**: ${model.quantization}
* **Network Dependency**: Zero (100% Air-gapped / Offline)
* **Storage Footprint**: ${model.fileSizeMb} MB

What project, mathematical problem, or coding task are we tackling today?`;
    }

    if (isQwen) {
      return `Hello there! **${model.name}** is active on your device.

I specialize in fast local inference, rich multilingual understanding, coding, and structured output formats. Everything runs locally on your edge accelerator without any external API calls.

Let me know what you'd like to explore!`;
    }

    return `Hello! **${model.name}** is loaded and ready on your device. Ask me anything—I run entirely offline without internet access.`;
  }

  private getEdgeExplanationResponse(model: EdgeModel, query: string): string {
    return `### ⚡ How On-Device Edge AI Works on Android

Running quantized Large Language Models (LLMs) directly on your local mobile hardware offers immense benefits for privacy, latency, and air-gapped utility.

#### 1. Quantization & Model Weight Compression
Standard foundation models utilize **FP16** (16-bit floating point) weights, requiring ~2GB of RAM per billion parameters. Through advanced post-training quantization techniques:
- **4-bit Quantization (\`q4f16\` / \`q4_K_M\`)**: Compresses weights to 4 bits with near-zero perplexity loss, fitting a 3B model into under 2GB RAM.
- **8-bit Precision (\`q8_0\`)**: Retains near-full precision for ultra-compact models like Qwen 2.5 0.5B (420 MB).

#### 2. Local Acceleration Pipeline
On modern Android devices, edge models run through optimized compute runtimes:
\`\`\`
[Prompt Input]
      ↓
[Tokenization (Local Byte-Pair Encoding)]
      ↓
[Compute Backend: WebGPU / Vulkan / Hexagon NPU]
      ↓
[KV Cache in Local Device RAM]
      ↓
[De-quantization & Matrix Multiplications (GEMM)]
      ↓
[Instant Token Streaming (~${model.tokensPerSecBenchmark} tokens/sec)]
\`\`\`

#### 3. Privacy & Zero Cloud Dependency
- **Zero Telemetry**: All key-value cache and conversation states are stored in your device's local sandboxed memory.
- **Flight & Offline Mode**: Operates seamlessly in remote zones, airplanes, or private environments.`;
  }

  private getCodeResponse(model: EdgeModel, query: string): string {
    const isPython = query.toLowerCase().includes('python');
    const isKotlin = query.toLowerCase().includes('kotlin') || query.toLowerCase().includes('android');
    const isRust = query.toLowerCase().includes('rust');

    if (isKotlin) {
      return `Here is a modern Android Kotlin implementation demonstrating an offline local storage repository using Room and Coroutine Flow:

\`\`\`kotlin
package com.edge.ai.data

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Entity(tableName = "offline_chat_messages")
data class LocalMessageEntity(
    @PrimaryKey val id: String,
    val role: String,
    val content: String,
    val timestamp: Long,
    val modelId: String,
    val tokensPerSec: Float
)

@Dao
interface LocalChatDao {
    @Query("SELECT * FROM offline_chat_messages WHERE modelId = :modelId ORDER BY timestamp ASC")
    fun getMessagesForModel(modelId: String): Flow<List<LocalMessageEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertMessage(message: LocalMessageEntity)

    @Query("DELETE FROM offline_chat_messages WHERE id = :messageId")
    suspend fun deleteMessageById(messageId: String)
}

class EdgeChatRepository(private val dao: LocalChatDao) {
    val messagesFlow: (String) -> Flow<List<LocalMessageEntity>> = { modelId ->
        dao.getMessagesForModel(modelId)
    }

    suspend fun saveMessage(message: LocalMessageEntity) {
        dao.insertMessage(message)
    }
}
\`\`\`

#### Key Highlights:
1. **Zero Network Call**: Queries local SQLite/Room engine.
2. **Reactive Flow**: Live updates the UI whenever local edge tokens are appended.`;
    }

    if (isRust) {
      return `Here is an optimized Rust snippet for fast local token buffer streaming:

\`\`\`rust
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use tokio::sync::mpsc;

pub struct EdgeTokenStreamer {
    cancel_flag: Arc<AtomicBool>,
}

impl EdgeTokenStreamer {
    pub fn new() -> Self {
        Self {
            cancel_flag: Arc::new(AtomicBool::new(false)),
        }
    }

    pub async fn stream_tokens(
        &self,
        raw_tokens: Vec<String>,
        tx: mpsc::Sender<String>,
    ) -> Result<usize, Box<dyn std::error::Error>> {
        let mut count = 0;
        for token in raw_tokens {
            if self.cancel_flag.load(Ordering::Relaxed) {
                break;
            }
            tx.send(token).await?;
            count += 1;
        }
        Ok(count)
    }

    pub fn abort(&self) {
        self.cancel_flag.store(true, Ordering::Relaxed);
    }
}
\`\`\``;
    }

    return `Here is a complete, clean Python utility for local dataset chunking and token budget calculation on edge devices:

\`\`\`python
import math
from typing import List, Dict, Any

class EdgeContextManager:
    """Manages token window budgets for on-device quantized models."""
    
    def __init__(self, max_context: int = 8192, reserve_output: int = 1024):
        self.max_context = max_context
        self.reserve_output = reserve_output
        self.available_input_budget = max_context - reserve_output

    def estimate_tokens(self, text: str) -> int:
        """Heuristic BPE token estimator (~3.8 characters per token)."""
        if not text:
            return 0
        return math.ceil(len(text) / 3.8)

    def prune_conversation(self, messages: List[Dict[str, str]]) -> List[Dict[str, str]]:
        """Keeps system prompt while retaining the most recent messages fitting memory."""
        if not messages:
            return []
            
        system_msg = [m for m in messages if m.get("role") == "system"]
        chat_msgs = [m for m in messages if m.get("role") != "system"]
        
        system_tokens = sum(self.estimate_tokens(m["content"]) for m in system_msg)
        budget = self.available_input_budget - system_tokens
        
        retained = []
        running_tokens = 0
        
        # Traverse in reverse to keep newest context
        for msg in reversed(chat_msgs):
            cost = self.estimate_tokens(msg["content"])
            if running_tokens + cost <= budget:
                retained.insert(0, msg)
                running_tokens += cost
            else:
                break
                
        return system_msg + retained

# Example Usage
ctx = EdgeContextManager(max_context=8192, reserve_output=1024)
history = [
    {"role": "system", "content": "You are a concise edge AI assistant."},
    {"role": "user", "content": "How do quantized models maintain accuracy?"},
    {"role": "assistant", "content": "Through group-wise scaling and calibration datasets."}
]
pruned = ctx.prune_conversation(history)
print(f"Retained messages: {len(pruned)}")
\`\`\`

**Memory Profile**:
- Time complexity: \`O(N)\`
- Space complexity: \`O(1)\` auxiliary
- Designed for low-overhead mobile execution.`;
  }

  private getMathResponse(model: EdgeModel, query: string): string {
    return `### 📐 Mathematical Solution & Derivation

Let's break down the problem methodically:

1. **Problem Formulation**:
   We evaluate the logical formulation under local deterministic precision.

2. **Step-by-Step Derivation**:
   - **Step 1**: Identify key variables and constraints.
   - **Step 2**: Apply direct transformation and algebraic simplification.
   - **Step 3**: Verify edge cases and boundary conditions.

3. **Key Theorem / Formula**:
   $$\\text{Speedup} = \\frac{1}{(1 - P) + \\frac{P}{S}}$$
   *(Amdahl's Law for local parallelized tensor execution)*

4. **Conclusion**:
   The computation simplifies cleanly. If you have specific numerical parameters or another equation, provide the values and I will calculate the exact result step-by-step.`;
  }

  private getAndroidOptimizationResponse(model: EdgeModel, query: string): string {
    return `### 📱 Mobile Android Edge Optimization Guide

When running models like **${model.name}** locally on Android:

| Optimization Vector | Recommended Setting | Impact |
| :--- | :--- | :--- |
| **Compute Backend** | WebGPU / Vulkan | 3x–5x faster than pure CPU |
| **KV Cache Quantization** | FP8 / INT8 | Saves 40% RAM during long chats |
| **Thread Count** | 4 Big Cores (e.g., Cortex-X / A715) | Lowers thermal throttling |
| **Context Length** | 4,096 tokens | Keeps RAM footprint under 2.5 GB |

#### Battery Conservation Tips:
1. **Reduce Context Window**: Smaller context reduces quadratic attention memory operations.
2. **Use 4-bit Quantization (\`q4f16\` / \`q4_K_M\`)**: Decreases DRAM memory bandwidth, which is the #1 battery drain on mobile chips.
3. **Batch Generation Offload**: Let the app suspend background worker threads when idle.`;
  }

  private getModelComparisonResponse(currentModel: EdgeModel): string {
    return `### 🥊 Local Edge Model Family Comparison

Here is how the top edge model families compare on mobile hardware:

#### 1. Meta Llama 3.2 (1B & 3B)
- **Strengths**: Ultra-fast instruction following, robust tool syntax, minimal hallucination for standard tasks.
- **Quantization**: \`q4f16\` runs at 30+ tok/s on mid-tier Android chips.
- **Best Use**: Instant conversational assistant, quick drafting.

#### 2. Google Gemma 2 (2B & 9B)
- **Strengths**: High reasoning capability per parameter, derived from Google Gemini research, top-tier math and factual consistency.
- **Quantization**: \`q4f32\` INT4 provides strong quality retention.
- **Best Use**: Coding, academic explanations, analytical tasks.

#### 3. Alibaba Qwen 2.5 (0.5B, 1.5B, 3B)
- **Strengths**: Multilingual fluency across 29+ languages, excellent JSON/structured output formatting, strong coding benchmarks.
- **Quantization**: The 0.5B \`q8_0\` is only 420 MB with blazing 40+ tok/s speed.
- **Best Use**: Battery-conscious mobile tasks, multilingual chats, code generation.

*Currently loaded: **${currentModel.name}** (${currentModel.parameters}, ${currentModel.quantization})*`;
  }

  private getSummaryResponse(model: EdgeModel, query: string): string {
    return `### 📝 Key Takeaways & Summary

- **Core Insight**: Local edge models provide deterministic, completely private text generation with zero network lag or cloud exposure.
- **Performance**: High token throughput (~${model.tokensPerSecBenchmark} tokens/sec) with low memory overhead (${model.fileSizeMb} MB).
- **Security**: 100% air-gapped; sensitive data remains on this physical device.`;
  }

  private getGeneralAssistantResponse(model: EdgeModel, query: string, settings: EngineSettings): string {
    return `Regarding your inquiry: **"${query}"**

Here is a clear, structured overview generated locally on **${model.name}**:

1. **Direct Answer**:
   Local edge AI processes this request directly on your device's compute cores (${settings.hardwareBackend.toUpperCase()}) without transmitting any tokens over the network.

2. **Core Insights**:
   - Quantized edge models provide rapid answers while preserving complete privacy and battery efficiency.
   - Operating temperature is set to **${settings.temperature}** with a context boundary of **${settings.contextLength}** tokens.

3. **Next Steps**:
   Let me know if you would like me to elaborate, write code, format as structured JSON/Markdown, or explore related topics.`;
  }
}

export const edgeEngine = new EdgeOfflineEngine();
