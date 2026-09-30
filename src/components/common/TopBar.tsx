import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, 
  Plus, 
  ChevronDown, 
  ShieldCheck, 
  Check,
  Cpu,
  Sparkles,
  Activity
} from 'lucide-react';
import { useEdgeApp } from '../../context/EdgeAppContext';
import { AppLogo } from './AppLogo';

export const TopBar: React.FC = () => {
  const { 
    activeModel, 
    models, 
    selectModel, 
    createNewChat, 
    activeTab, 
    setActiveTab,
    setIsSettingsOpen,
    isGenerating,
    settings
  } = useEdgeApp();

  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 w-full shrink-0 border-b border-white/[0.08] bg-[#060913]/90 backdrop-blur-2xl">
      <div className="w-full max-w-4xl mx-auto px-3 h-13 flex items-center justify-between gap-1.5">
        {/* Left: Brand + Air-gapped Offline Indicator */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button 
            onClick={() => setActiveTab('chat')}
            className="flex items-center gap-1.5 text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 rounded-xl p-1 -ml-1 transition-opacity active:opacity-75 group"
          >
            <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0 shadow-md shadow-emerald-500/20 ring-1 ring-white/20">
              <AppLogo className="w-full h-full" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight text-white">
                EdgeLLM
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 tracking-wider shadow-xs shadow-emerald-500/10 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="hidden xs:inline sm:inline">OFFLINE</span>
              </span>
            </div>
          </button>
        </div>

        {/* Center: Quick Model Selector (Only on Chat Tab) */}
        {activeTab === 'chat' && (
          <div className="relative min-w-0 flex-1 max-w-[130px] xs:max-w-[160px] sm:max-w-[220px] mx-auto">
            <button
              onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
              className="w-full flex items-center justify-between gap-1 px-2 py-1.5 rounded-xl text-xs font-medium transition-all glass-pill-dark text-slate-200 truncate hover:border-blue-500/40 active:scale-95"
              title="Switch active edge model"
            >
              <div className="flex items-center gap-1.5 min-w-0 truncate">
                <span 
                  className="w-2 h-2 rounded-full shrink-0 ring-1 ring-white/20 shadow-xs" 
                  style={{ backgroundColor: activeModel.accentColor }} 
                />
                <span className="truncate text-[11px] sm:text-xs font-semibold">{activeModel.name}</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 shrink-0 text-slate-400 transition-transform duration-200 ${isModelDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Model Switcher Popover */}
            <AnimatePresence>
              {isModelDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsModelDropdownOpen(false)} 
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-64 xs:w-72 max-h-80 overflow-y-auto z-50 rounded-2xl p-2 glass-panel-dark shadow-2xl border border-white/10"
                  >
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Loaded On-Device Models
                    </div>

                    <div className="space-y-1">
                      {models.map(m => {
                        const isSelected = m.id === activeModel.id;
                        return (
                          <button
                            key={m.id}
                            onClick={() => {
                              selectModel(m.id);
                              setIsModelDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-all ${
                              isSelected
                                ? 'bg-blue-500/20 text-blue-400 font-semibold border border-blue-500/30'
                                : 'hover:bg-slate-800/60 text-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate pr-2">
                              <span
                                className="w-2 h-2 rounded-full shrink-0 shadow-xs"
                                style={{ backgroundColor: m.accentColor }}
                              />
                              <div className="truncate">
                                <div className="truncate font-medium">{m.name}</div>
                                <div className="text-[10px] text-slate-400">
                                  {m.quantization} · {m.fileSizeMb}MB
                                </div>
                              </div>
                            </div>
                            {isSelected && <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-2 pt-2 border-t border-white/10">
                      <button
                        onClick={() => {
                          setIsModelDropdownOpen(false);
                          setActiveTab('models');
                        }}
                        className="w-full py-1.5 px-3 rounded-lg text-center text-xs font-semibold text-blue-400 hover:bg-blue-950/40 transition-colors"
                      >
                        Manage & Download Models →
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Right: Actions (Guaranteed visible with shrink-0) */}
        <div className="flex items-center gap-1 shrink-0 ml-auto z-10">
          {/* Hardware Engine Badge */}
          <div className="hidden md:flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900/80 border border-white/10 text-[10px] font-mono text-slate-400">
            <Cpu className="w-3 h-3 text-emerald-400" />
            <span className="uppercase">{settings.hardwareBackend}</span>
          </div>

          {/* New Chat Button */}
          {activeTab === 'chat' && (
            <button
              onClick={() => createNewChat()}
              disabled={isGenerating}
              className="p-1.5 sm:p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 active:scale-90 transition-all disabled:opacity-50"
              title="New Chat"
              aria-label="New Chat"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}

          {/* Settings Trigger */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-1.5 sm:p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 active:scale-90 transition-all"
            title="Edge Engine Settings"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
