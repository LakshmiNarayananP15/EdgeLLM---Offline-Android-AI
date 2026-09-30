import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Bot, 
  Copy, 
  Check, 
  RotateCcw, 
  ChevronDown, 
  Cpu, 
  Zap, 
  BrainCircuit, 
  Clock, 
  Layers
} from 'lucide-react';
import { Message, EdgeModel } from '../../types';
import { MarkdownContent } from './MarkdownContent';

interface ChatMessageItemProps {
  message: Message;
  model?: EdgeModel;
  isLastAssistant?: boolean;
  isStreaming?: boolean;
  onRegenerate?: () => void;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  model,
  isLastAssistant,
  isStreaming,
  onRegenerate
}) => {
  const [copied, setCopied] = useState(false);
  const [showReasoning, setShowReasoning] = useState(false);

  const isUser = message.role === 'user';
  const hasReasoning = !!message.reasoningContent && message.reasoningContent.trim().length > 0;

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} group mb-3.5`}
    >
      <div
        className={`max-w-[88%] sm:max-w-[82%] flex flex-col ${
          isUser ? 'items-end' : 'items-start'
        }`}
      >
        {/* Author / Model Header */}
        <div className="flex items-center gap-1.5 px-2 mb-1 text-[11px] font-medium text-slate-400 dark:text-slate-500">
          {isUser ? (
            <span>You</span>
          ) : (
            <div className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full ring-2 ring-white/10"
                style={{ backgroundColor: model?.accentColor || '#3b82f6' }}
              />
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {model?.name || 'Edge LLM'}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                {model?.quantization || '4-bit'}
              </span>
            </div>
          )}
        </div>

        {/* Message Bubble */}
        <div
          className={`relative rounded-2xl p-3.5 transition-all ${
            isUser
              ? 'bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-600 text-white rounded-tr-sm shadow-md shadow-blue-500/20 border border-blue-400/25'
              : 'glass-card-light dark:glass-card-dark text-slate-800 dark:text-slate-100 rounded-tl-sm'
          }`}
        >
          {/* Reasoning Process Drawer (for assistant messages with thinking chunks) */}
          {!isUser && hasReasoning && (
            <div className="mb-2.5 border-b border-slate-200/80 dark:border-slate-700/60 pb-2">
              <button
                onClick={() => setShowReasoning(!showReasoning)}
                className="flex items-center justify-between w-full text-left text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors py-0.5"
              >
                <div className="flex items-center gap-1.5">
                  <BrainCircuit className="w-3.5 h-3.5 text-purple-400" />
                  <span>On-Device Thought Trace</span>
                  {isStreaming && !message.content && (
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping ml-1" />
                  )}
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    showReasoning ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {(showReasoning || (isStreaming && !message.content)) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden mt-2"
                  >
                    <div className="p-2.5 rounded-xl bg-slate-950/40 dark:bg-slate-950/60 font-mono text-[11px] leading-relaxed text-purple-300 dark:text-purple-300/90 border border-purple-500/20 whitespace-pre-wrap">
                      {message.reasoningContent}
                      {isStreaming && !message.content && (
                        <span className="streaming-cursor bg-purple-400" />
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Body Content */}
          {isUser ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap font-normal">{message.content}</p>
          ) : (
            <div>
              {message.content ? (
                <MarkdownContent content={message.content} isStreaming={isStreaming} />
              ) : isStreaming ? (
                <div className="flex items-center gap-2 py-1 text-xs text-slate-400 dark:text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <span>Generating local edge tokens...</span>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Footer Metrics & Actions */}
        {!isUser && (
          <div className="flex items-center justify-between w-full px-2 mt-1.5 text-[10px] text-slate-400 dark:text-slate-500">
            {/* Edge Metrics */}
            <div className="flex items-center gap-2 flex-wrap">
              {message.metrics && (
                <>
                  <span className="flex items-center gap-1 font-mono">
                    <Zap className="w-3 h-3 text-amber-500" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {message.metrics.tokensPerSec}
                    </span>{' '}
                    tok/s
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-blue-400" />
                    <span>{message.metrics.timeToFirstTokenMs}ms TTFT</span>
                  </span>
                  <span>·</span>
                  <span className="font-mono">{message.metrics.tokensGenerated} tokens</span>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleCopy}
                className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                title="Copy Response"
                aria-label="Copy Response"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              {isLastAssistant && onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                  title="Regenerate on-device"
                  aria-label="Regenerate response"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
