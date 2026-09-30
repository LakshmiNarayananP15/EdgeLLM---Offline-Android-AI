import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Sliders, 
  Sparkles, 
  RotateCcw, 
  Terminal, 
  Check, 
  HardDrive
} from 'lucide-react';
import { useEdgeApp } from '../../context/EdgeAppContext';
import { AppLogo } from '../common/AppLogo';

export const EdgeSettingsModal: React.FC = () => {
  const { 
    isSettingsOpen, 
    setIsSettingsOpen, 
    settings, 
    updateSettings, 
    storageStats 
  } = useEdgeApp();

  const [activeSubTab, setActiveSubTab] = useState<'inference' | 'system_prompt' | 'about'>('inference');

  if (!isSettingsOpen) return null;

  const presets = [
    {
      name: 'Concise Edge Assistant',
      prompt: 'You are a concise, high-speed local AI assistant running directly on an Android device. Provide direct, direct-to-the-point answers with clear bullet points.'
    },
    {
      name: 'Android Kotlin Specialist',
      prompt: 'You are an expert Android developer specializing in modern Kotlin, Jetpack Compose, Room database, Coroutines, and on-device machine learning optimization.'
    },
    {
      name: 'Math & STEM Tutor',
      prompt: 'You are a rigorous STEM and mathematics tutor. Break down calculations step-by-step with clear derivations and explanations.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg rounded-2xl glass-panel-light dark:glass-panel-dark shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Edge Engine Settings
              </h3>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                On-device runtime & inference parameters
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sub-navigation tabs */}
        <div className="flex items-center px-4 pt-3 border-b border-slate-200/60 dark:border-slate-800/60 gap-2 overflow-x-auto scrollbar-none">
          {[
            { id: 'inference', label: 'Inference' },
            { id: 'system_prompt', label: 'System Prompt' },
            { id: 'about', label: 'About & Edge' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`pb-2.5 px-3 text-xs font-semibold whitespace-nowrap transition-colors relative ${
                activeSubTab === tab.id
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5 text-xs">
          {activeSubTab === 'inference' && (
            <div className="space-y-4">
              {/* Temperature */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="font-semibold text-slate-800 dark:text-slate-200">
                    Temperature ({settings.temperature})
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {settings.temperature < 0.4 ? 'Strict & Precise' : settings.temperature > 1.0 ? 'Highly Creative' : 'Balanced'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.5"
                  step="0.05"
                  value={settings.temperature}
                  onChange={e => updateSettings({ temperature: parseFloat(e.target.value) })}
                  className="w-full accent-blue-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
              </div>

              {/* Top-P */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="font-semibold text-slate-800 dark:text-slate-200">
                    Top-P Nucleus Sampling ({settings.topP})
                  </label>
                  <span className="font-mono text-[11px] text-slate-400">{settings.topP}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={settings.topP}
                  onChange={e => updateSettings({ topP: parseFloat(e.target.value) })}
                  className="w-full accent-blue-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
              </div>

              {/* Max Tokens */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="font-semibold text-slate-800 dark:text-slate-200">
                    Max Output Tokens ({settings.maxTokens})
                  </label>
                  <span className="font-mono text-[11px] text-slate-400">{settings.maxTokens} tokens</span>
                </div>
                <input
                  type="range"
                  min="256"
                  max="4096"
                  step="256"
                  value={settings.maxTokens}
                  onChange={e => updateSettings({ maxTokens: parseInt(e.target.value) })}
                  className="w-full accent-blue-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
              </div>

              {/* Context Length */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="font-semibold text-slate-800 dark:text-slate-200">
                    Context Window Budget ({settings.contextLength})
                  </label>
                  <span className="font-mono text-[11px] text-slate-400">{settings.contextLength} tokens</span>
                </div>
                <input
                  type="range"
                  min="2048"
                  max="16384"
                  step="2048"
                  value={settings.contextLength}
                  onChange={e => updateSettings({ contextLength: parseInt(e.target.value) })}
                  className="w-full accent-blue-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          )}

          {activeSubTab === 'system_prompt' && (
            <div className="space-y-3">
              <div>
                <label className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">
                  Custom System Prompt
                </label>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                  Injected at the start of on-device LLM context windows to steer assistant behavior.
                </p>
                <textarea
                  rows={4}
                  value={settings.customSystemPrompt}
                  onChange={e => updateSettings({ customSystemPrompt: e.target.value })}
                  placeholder="E.g., You are an expert AI assistant on Android..."
                  className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-mono resize-none"
                />
              </div>

              {/* Preset selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Quick Preset System Personas
                  </span>
                  <button
                    onClick={() => updateSettings({ customSystemPrompt: 'You are a helpful, respectful, and honest local edge AI assistant running directly on an Android device.' })}
                    className="text-[10px] text-blue-500 hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-2.5 h-2.5" /> Reset Default
                  </button>
                </div>
                <div className="space-y-1.5">
                  {presets.map(p => (
                    <button
                      key={p.name}
                      onClick={() => updateSettings({ customSystemPrompt: p.prompt })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 bg-slate-50/50 dark:bg-slate-900/50 text-left transition-all active:scale-[0.99]"
                    >
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {p.name}
                      </div>
                      <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                        {p.prompt}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'about' && (
            <div className="space-y-3 text-slate-300 leading-relaxed">
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 flex items-center gap-3.5 shadow-md">
                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 shadow-lg shadow-emerald-500/20 ring-1 ring-white/20">
                  <AppLogo className="w-full h-full" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">
                    EdgeLLM Architecture for Android
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Zero-latency, private, and air-gapped on-device edge intelligence.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span><strong>Supported Model Families:</strong> Meta Llama 3.2 (1B, 3B), Google Gemma 2 (2B, 9B), Alibaba Qwen 2.5 (0.5B, 1.5B, 3B), and SmolLM2.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span><strong>Quantization Formats:</strong> 4-bit (q4f16, q4_K_M), INT4, 8-bit (q8_0) with low perplexity loss.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span><strong>Privacy Guarantee:</strong> All weights, KV cache, and chat histories reside strictly in your local device sandbox.</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Offline Edge v2.4.0
          </span>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="px-4 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
};
