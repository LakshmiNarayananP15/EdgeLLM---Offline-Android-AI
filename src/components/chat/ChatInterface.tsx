import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Square, 
  Trash2, 
  ShieldCheck, 
  Sliders, 
  ArrowDown
} from 'lucide-react';
import { useEdgeApp } from '../../context/EdgeAppContext';
import { ChatMessageItem } from './ChatMessageItem';

export const ChatInterface: React.FC = () => {
  const {
    activeConversation,
    activeModel,
    sendMessage,
    isGenerating,
    stopGeneration,
    regenerateLastMessage,
    clearActiveConversation,
    settings,
    updateSettings
  } = useEdgeApp();

  const [input, setInput] = useState('');
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [showQuickSettings, setShowQuickSettings] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const messages = activeConversation?.messages || [];

  // Auto-scroll on new tokens
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom(isGenerating ? 'auto' : 'smooth');
  }, [messages.length, isGenerating, messages[messages.length - 1]?.content]);

  // Handle scroll listener to show scroll-to-bottom button
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 80;
    setShowScrollBottom(!isAtBottom);
  };

  // Adjust textarea height dynamically
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  // Send message
  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;
    const text = input;
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    await sendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col h-full overflow-hidden relative">
      {/* Scrollable Message Feed */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 overflow-y-auto px-3 py-2 space-y-2 max-w-3xl mx-auto w-full"
      >
        {/* Model Spec Badge at Top of Chat */}
        <div className="py-1 mb-1 text-center">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900/80 border border-white/[0.08] shadow-xs text-xs text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate max-w-[200px] sm:max-w-none">
              <strong className="text-slate-200">{activeModel.name}</strong> · {activeModel.quantization}
            </span>
            <span className="text-slate-700">|</span>
            <span className="font-mono text-[10px] text-blue-400 font-semibold shrink-0">
              ~{activeModel.tokensPerSecBenchmark} tok/s
            </span>
          </div>
        </div>

        {/* Message List */}
        {messages.map((msg, index) => {
          const isLastAssistant =
            msg.role === 'assistant' &&
            index === messages.length - 1 &&
            !isGenerating;
          const isCurrentlyStreaming =
            isGenerating &&
            msg.role === 'assistant' &&
            index === messages.length - 1;

          return (
            <ChatMessageItem
              key={msg.id}
              message={msg}
              model={activeModel}
              isLastAssistant={isLastAssistant}
              isStreaming={isCurrentlyStreaming}
              onRegenerate={regenerateLastMessage}
            />
          );
        })}

        <div ref={messagesEndRef} className="h-2" />
      </div>

      {/* Floating Scroll To Bottom Button */}
      <AnimatePresence>
        {showScrollBottom && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => scrollToBottom('smooth')}
            className="absolute right-4 bottom-20 z-20 p-2 rounded-full bg-blue-600 text-white shadow-xl shadow-blue-500/30 hover:bg-blue-500 active:scale-90 transition-all border border-white/20"
            aria-label="Scroll to bottom"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Quick Settings Drawer Popover */}
      <AnimatePresence>
        {showQuickSettings && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="absolute bottom-16 left-3 right-3 max-w-md mx-auto z-30 p-3.5 rounded-2xl glass-panel-dark shadow-2xl border border-white/10"
          >
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-blue-400" />
                Quick Inference Parameters
              </span>
              <button
                onClick={() => setShowQuickSettings(false)}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                Close
              </button>
            </div>

            <div className="space-y-2.5">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Temperature (Creativity)</span>
                  <span className="font-mono text-blue-400 font-semibold">{settings.temperature}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.5"
                  step="0.1"
                  value={settings.temperature}
                  onChange={e => updateSettings({ temperature: parseFloat(e.target.value) })}
                  className="w-full accent-blue-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Docked Bottom Input Area */}
      <div className="w-full max-w-3xl mx-auto px-3 py-1 shrink-0 z-20">
        <div className="rounded-2xl p-1.5 sm:p-2 glass-panel-dark shadow-xl border border-white/[0.09]">
          {/* Action Row */}
          <div className="flex items-center justify-between px-1.5 pb-1 text-[10px] sm:text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowQuickSettings(!showQuickSettings)}
                className="flex items-center gap-1 hover:text-blue-400 transition-colors py-0.5"
                title="Adjust generation parameters"
              >
                <Sliders className="w-3 h-3 text-blue-400" />
                <span>T: {settings.temperature}</span>
              </button>
              <span className="text-slate-700">·</span>
              <span className="font-mono text-[10px] text-slate-500">
                {input.length > 0 ? `${Math.ceil(input.length / 3.8)} tokens` : '0 tokens'}
              </span>
            </div>

            {messages.length > 1 && (
              <button
                onClick={clearActiveConversation}
                className="flex items-center gap-1 text-slate-500 hover:text-red-400 transition-colors"
                title="Clear current conversation"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
          </div>

          {/* Input Box */}
          <div className="flex items-center gap-2 bg-[#090d18]/90 rounded-xl px-2.5 py-1 border border-white/[0.08] focus-within:border-blue-500/60 focus-within:shadow-xs focus-within:shadow-blue-500/20 transition-all">
            {/* Expanding Textarea */}
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask Query..."
              rows={1}
              className="flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-500/80 focus:outline-none resize-none py-1 px-1 max-h-28 leading-relaxed overflow-y-auto"
              style={{ scrollbarWidth: 'none' }}
              aria-label="Ask Query..."
            />

            {/* Send or Stop Generation Button */}
            {isGenerating ? (
              <button
                onClick={stopGeneration}
                className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 active:scale-90 transition-all shadow-md shadow-red-500/25 shrink-0"
                title="Stop generation"
                aria-label="Stop generation"
              >
                <Square className="w-3.5 h-3.5 fill-white" />
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 active:scale-90 transition-all disabled:opacity-30 disabled:pointer-events-none shadow-md shadow-blue-500/25 border border-blue-400/20 shrink-0"
                title="Send Prompt"
                aria-label="Send Prompt"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
