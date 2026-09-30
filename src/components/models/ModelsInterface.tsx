import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cpu, 
  Download, 
  Check, 
  Trash2, 
  Zap, 
  ShieldCheck, 
  Layers, 
  HardDrive, 
  Sliders, 
  Info, 
  Sparkles,
  ArrowRight,
  Battery,
  Flame,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { useEdgeApp } from '../../context/EdgeAppContext';
import { EdgeModel, ModelFamily } from '../../types';

export const ModelsInterface: React.FC = () => {
  const {
    models,
    activeModelId,
    selectModel,
    downloadModel,
    deleteModelCache,
    setDefaultModel,
    setActiveTab,
    settings,
    createNewChat
  } = useEdgeApp();

  const [familyFilter, setFamilyFilter] = useState<'all' | ModelFamily | 'lightweight'>('all');
  const [selectedSpecModel, setSelectedSpecModel] = useState<EdgeModel | null>(null);

  const filteredModels = useMemo(() => {
    return models.filter(m => {
      if (familyFilter === 'all') return true;
      if (familyFilter === 'lightweight') return m.fileSizeMb < 1000;
      return m.family === familyFilter;
    });
  }, [models, familyFilter]);

  const handleLoadAndChat = (model: EdgeModel) => {
    selectModel(model.id);
    createNewChat(model.id);
    setActiveTab('chat');
  };

  const totalCachedSize = models
    .filter(m => m.status === 'ready' || m.status === 'cached')
    .reduce((acc, m) => acc + m.fileSizeMb, 0);

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto px-4 py-4 pb-4 max-w-4xl mx-auto w-full">
      {/* Device Hardware Acceleration & Diagnostics Card */}
      <div className="p-4 rounded-2xl glass-panel-light dark:glass-panel-dark border border-slate-200/80 dark:border-slate-800 shadow-sm mb-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                On-Device Edge Engine
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </h3>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                Direct hardware quantization & zero cloud offloading
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-mono font-semibold uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              {settings.hardwareBackend.toUpperCase()} ACCELERATED
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-center">
          <div className="p-2 rounded-xl bg-slate-100/60 dark:bg-slate-900/60">
            <div className="text-[10px] text-slate-400">Active Backend</div>
            <div className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200 mt-0.5">
              {settings.hardwareBackend === 'wasm_simd' ? 'WASM SIMD' : settings.hardwareBackend.toUpperCase()}
            </div>
          </div>

          <div className="p-2 rounded-xl bg-slate-100/60 dark:bg-slate-900/60">
            <div className="text-[10px] text-slate-400">Cached Weights</div>
            <div className="text-xs font-bold font-mono text-blue-600 dark:text-blue-400 mt-0.5">
              {totalCachedSize > 1000 ? `${(totalCachedSize / 1024).toFixed(1)} GB` : `${totalCachedSize} MB`}
            </div>
          </div>

          <div className="p-2 rounded-xl bg-slate-100/60 dark:bg-slate-900/60">
            <div className="text-[10px] text-slate-400">Data Isolation</div>
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              100% Offline
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-4 scrollbar-none">
        {[
          { id: 'all', label: 'All Models' },
          { id: 'llama', label: 'Meta Llama' },
          { id: 'gemma', label: 'Google Gemma' },
          { id: 'qwen', label: 'Alibaba Qwen' },
          { id: 'lightweight', label: 'Featherweight (<1GB)' }
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFamilyFilter(f.id as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              familyFilter === f.id
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Models Cards Grid */}
      <div className="space-y-3.5">
        {filteredModels.map(model => {
          const isActive = model.id === activeModelId;
          const isReady = model.status === 'ready' || model.status === 'cached';
          const isDownloading = model.status === 'downloading';

          return (
            <div
              key={model.id}
              className={`p-4 rounded-2xl glass-card-light dark:glass-card-dark transition-all border ${
                isActive
                  ? 'border-blue-500/50 bg-blue-50/20 dark:bg-blue-950/20 shadow-md'
                  : 'hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-xs shadow-sm"
                    style={{ backgroundColor: model.accentColor }}
                  >
                    {model.family === 'llama' ? '🦙' : model.family === 'gemma' ? '💎' : model.family === 'qwen' ? '⚡' : '✨'}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {model.name}
                      </h4>
                      {model.isDefault && (
                        <span className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                          Default
                        </span>
                      )}
                      {isActive && (
                        <span className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          Active
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      <span>{model.parameters} params</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">{model.quantization}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">{model.fileSizeMb} MB</span>
                    </div>
                  </div>
                </div>

                {/* Inspect specs trigger */}
                <button
                  onClick={() => setSelectedSpecModel(model)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="View technical model specs"
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>

              {/* Description & Best For */}
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-2.5">
                {model.description}
              </p>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-3 bg-slate-100/70 dark:bg-slate-900/70 p-2 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                <strong className="text-slate-700 dark:text-slate-300">Optimal Use:</strong> {model.bestFor}
              </div>

              {/* Download Progress Bar */}
              {isDownloading && (
                <div className="mb-3 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Caching Quantized Weights to IndexedDB...
                    </span>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                      {model.downloadProgress || 0}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-150 rounded-full"
                      style={{ width: `${model.downloadProgress || 0}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Specs Badges & Actions */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex-wrap">
                {/* Speed & RAM Requirements */}
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    ~{model.tokensPerSecBenchmark} tok/s
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                    {model.recommendedRamGb}GB+ RAM req
                  </span>
                </div>

                {/* Primary Action Button */}
                <div className="flex items-center gap-2">
                  {isReady ? (
                    <>
                      {!model.isDefault && (
                        <button
                          onClick={() => setDefaultModel(model.id)}
                          className="px-2.5 py-1.5 rounded-xl text-[11px] font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          Set Default
                        </button>
                      )}

                      <button
                        onClick={() => handleLoadAndChat(model)}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95 shadow-sm ${
                          isActive
                            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20'
                            : 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90'
                        }`}
                      >
                        <span>{isActive ? 'Chat Now' : 'Load & Chat'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : isDownloading ? (
                    <button
                      disabled
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Downloading...
                    </button>
                  ) : (
                    <button
                      onClick={() => downloadModel(model.id)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-sm shadow-blue-500/20 transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Cache Model ({model.fileSizeMb}MB)</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Model Spec Sheet / Modal */}
      <AnimatePresence>
        {selectedSpecModel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl glass-panel-light dark:glass-panel-dark p-5 shadow-2xl border border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs"
                    style={{ backgroundColor: selectedSpecModel.accentColor }}
                  >
                    {selectedSpecModel.family === 'llama' ? '🦙' : selectedSpecModel.family === 'gemma' ? '💎' : selectedSpecModel.family === 'qwen' ? '⚡' : '✨'}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {selectedSpecModel.name}
                    </h3>
                    <div className="text-[10px] text-slate-400">Architecture & Technical Invariants</div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedSpecModel(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2 text-xs mb-5">
                <div className="flex justify-between py-1.5 border-b border-slate-200/60 dark:border-slate-800/60">
                  <span className="text-slate-500 dark:text-slate-400">Family & Base Model</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 uppercase">
                    {selectedSpecModel.family} {selectedSpecModel.version}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-200/60 dark:border-slate-800/60">
                  <span className="text-slate-500 dark:text-slate-400">Parameters</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">
                    {selectedSpecModel.parameters}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-200/60 dark:border-slate-800/60">
                  <span className="text-slate-500 dark:text-slate-400">Quantization Precision</span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                    {selectedSpecModel.quantization}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-200/60 dark:border-slate-800/60">
                  <span className="text-slate-500 dark:text-slate-400">Context Window</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">
                    {selectedSpecModel.contextWindow.toLocaleString()} tokens
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-200/60 dark:border-slate-800/60">
                  <span className="text-slate-500 dark:text-slate-400">Inference Throughput</span>
                  <span className="font-mono text-amber-500 font-bold">
                    ~{selectedSpecModel.tokensPerSecBenchmark} tok/s
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-200/60 dark:border-slate-800/60">
                  <span className="text-slate-500 dark:text-slate-400">Recommended RAM</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">
                    {selectedSpecModel.recommendedRamGb} GB LPDDR5
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500 dark:text-slate-400">Network Dependency</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    0% (Fully Air-Gapped)
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                {selectedSpecModel.status === 'ready' || selectedSpecModel.status === 'cached' ? (
                  <>
                    <button
                      onClick={() => {
                        deleteModelCache(selectedSpecModel.id);
                        setSelectedSpecModel(null);
                      }}
                      className="py-2 px-3 rounded-xl border border-red-500/30 text-red-500 hover:bg-red-500/10 text-xs font-semibold transition-colors"
                    >
                      Delete Weights
                    </button>
                    <button
                      onClick={() => {
                        handleLoadAndChat(selectedSpecModel);
                        setSelectedSpecModel(null);
                      }}
                      className="flex-1 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Load & Start Chat
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      downloadModel(selectedSpecModel.id);
                      setSelectedSpecModel(null);
                    }}
                    className="w-full py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download & Cache Model
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
