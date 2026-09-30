import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { ActiveTab, ChatSession, EdgeModel, EngineSettings, Message } from '../types';
import { INITIAL_EDGE_MODELS } from '../data/modelsData';
import { edgeEngine } from '../services/edgeEngine';

interface EdgeAppContextType {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  setTheme: (t: 'dark' | 'light') => void;
  
  // Models
  models: EdgeModel[];
  activeModel: EdgeModel;
  activeModelId: string;
  selectModel: (modelId: string) => void;
  downloadModel: (modelId: string) => Promise<void>;
  deleteModelCache: (modelId: string) => void;
  setDefaultModel: (modelId: string) => void;
  
  // Conversations
  conversations: ChatSession[];
  activeConversation: ChatSession | null;
  activeConversationId: string | null;
  createNewChat: (modelId?: string) => string;
  selectConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  deleteAllConversations: () => void;
  togglePinConversation: (id: string) => void;
  renameConversation: (id: string, newTitle: string) => void;
  clearActiveConversation: () => void;
  
  // Chat Execution
  sendMessage: (content: string) => Promise<void>;
  stopGeneration: () => void;
  regenerateLastMessage: () => Promise<void>;
  isGenerating: boolean;
  streamingReasoning: string;
  
  // Settings & Hardware
  settings: EngineSettings;
  updateSettings: (newSettings: Partial<EngineSettings>) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  storageStats: {
    totalOfflineTokens: number;
    totalChatsCount: number;
    cachedModelsSizeMb: number;
  };
}

const DEFAULT_SETTINGS: EngineSettings = {
  hardwareBackend: 'webgpu',
  temperature: 0.7,
  topP: 0.9,
  maxTokens: 2048,
  contextLength: 8192,
  repetitionPenalty: 1.1,
  streamSpeed: 1,
  batterySaver: false,
  hapticFeedback: true,
  offlineEnforced: true,
  customSystemPrompt: ''
};

const EdgeAppContext = createContext<EdgeAppContextType | undefined>(undefined);

export const EdgeAppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Pure Dark Theme
  const [theme] = useState<'dark'>('dark');

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('dark');
    root.classList.remove('light');
    localStorage.setItem('edgellm_theme', 'dark');
  }, []);

  const toggleTheme = () => {
    // Permanent dark theme
  };

  const setTheme = () => {
    // Permanent dark theme
  };

  // Active Tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');

  // Settings
  const [settings, setSettings] = useState<EngineSettings>(() => {
    const saved = localStorage.getItem('edgellm_settings');
    if (saved) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch (e) {
        console.error('Failed to parse saved settings', e);
      }
    }
    return DEFAULT_SETTINGS;
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const updateSettings = (newSettings: Partial<EngineSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('edgellm_settings', JSON.stringify(updated));
      return updated;
    });
  };

  // Models
  const [models, setModels] = useState<EdgeModel[]>(() => {
    const saved = localStorage.getItem('edgellm_models');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse models', e);
      }
    }
    return INITIAL_EDGE_MODELS;
  });

  useEffect(() => {
    localStorage.setItem('edgellm_models', JSON.stringify(models));
  }, [models]);

  const [activeModelId, setActiveModelId] = useState<string>(() => {
    const saved = localStorage.getItem('edgellm_active_model');
    if (saved && INITIAL_EDGE_MODELS.some(m => m.id === saved)) return saved;
    return 'llama-3.2-1b-instruct-q4';
  });

  useEffect(() => {
    localStorage.setItem('edgellm_active_model', activeModelId);
  }, [activeModelId]);

  const activeModel = useMemo(() => {
    return models.find(m => m.id === activeModelId) || models[0];
  }, [models, activeModelId]);

  const selectModel = (modelId: string) => {
    setActiveModelId(modelId);
  };

  const downloadModel = async (modelId: string) => {
    const targetModel = models.find(m => m.id === modelId);
    if (!targetModel) return;

    setModels(prev =>
      prev.map(m => (m.id === modelId ? { ...m, status: 'downloading', downloadProgress: 0 } : m))
    );

    // Simulate fast quantized chunk download to local IndexedDB/Cache
    for (let progress = 5; progress <= 100; progress += 10) {
      await new Promise(r => setTimeout(r, 120));
      setModels(prev =>
        prev.map(m => (m.id === modelId ? { ...m, downloadProgress: progress } : m))
      );
    }

    setModels(prev =>
      prev.map(m =>
        m.id === modelId ? { ...m, status: 'ready', downloadProgress: 100 } : m
      )
    );

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#3b82f6', '#10b981', '#8b5cf6']
      });
    } catch (e) {
      // ignore
    }
  };

  const deleteModelCache = (modelId: string) => {
    setModels(prev =>
      prev.map(m => (m.id === modelId ? { ...m, status: 'not_cached', downloadProgress: 0 } : m))
    );
  };

  const setDefaultModel = (modelId: string) => {
    setModels(prev =>
      prev.map(m => ({ ...m, isDefault: m.id === modelId }))
    );
    setActiveModelId(modelId);
  };

  // Conversations
  const [conversations, setConversations] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('edgellm_conversations');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Failed to parse conversations', e);
      }
    }
    
    // Initial welcome conversation
    const initialChat: ChatSession = {
      id: 'session-welcome',
      title: 'Welcome to Edge AI',
      modelId: 'llama-3.2-1b-instruct-q4',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      pinned: true,
      messages: [
        {
          id: 'msg-welcome-1',
          role: 'assistant',
          content: `Welcome to **EdgeLLM** — your local on-device AI assistant for Android.

### 🛡️ 100% Offline & Private
- **Zero Cloud Servers**: Computations run entirely on your device using quantized LLM weights.
- **Air-Gapped & Secure**: No prompts, chats, or data ever leave your phone.
- **Multi-Family Hub**: Switch seamlessly between **Llama 3.2**, **Gemma 2**, **Qwen 2.5**, and **SmolLM2**.

Try asking a question, generating code, or requesting a summary!`,
          timestamp: Date.now() - 3600000,
          modelId: 'llama-3.2-1b-instruct-q4',
          metrics: {
            timeToFirstTokenMs: 140,
            totalTimeMs: 980,
            tokensGenerated: 112,
            tokensPerSec: 32.4,
            memoryAllocatedMb: 890
          }
        }
      ]
    };
    return [initialChat];
  });

  useEffect(() => {
    localStorage.setItem('edgellm_conversations', JSON.stringify(conversations));
  }, [conversations]);

  const [activeConversationId, setActiveConversationId] = useState<string | null>(() => {
    return conversations[0]?.id || null;
  });

  const activeConversation = useMemo(() => {
    if (!activeConversationId) return conversations[0] || null;
    return conversations.find(c => c.id === activeConversationId) || conversations[0] || null;
  }, [conversations, activeConversationId]);

  const createNewChat = useCallback((modelId?: string): string => {
    const newId = `session-${Date.now()}`;
    const selectedMId = modelId || activeModelId;
    const targetM = models.find(m => m.id === selectedMId) || activeModel;

    const newChat: ChatSession = {
      id: newId,
      title: 'New Conversation',
      modelId: selectedMId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [
        {
          id: `msg-greet-${Date.now()}`,
          role: 'assistant',
          content: `Loaded **${targetM.name}** (${targetM.quantization}) on local runtime. Ready for offline inference.`,
          timestamp: Date.now(),
          modelId: selectedMId
        }
      ]
    };

    setConversations(prev => [newChat, ...prev]);
    setActiveConversationId(newId);
    setActiveTab('chat');
    return newId;
  }, [activeModelId, models, activeModel]);

  const selectConversation = (id: string) => {
    setActiveConversationId(id);
    const chat = conversations.find(c => c.id === id);
    if (chat) {
      setActiveModelId(chat.modelId);
    }
    setActiveTab('chat');
  };

  const deleteConversation = (id: string) => {
    setConversations(prev => {
      const filtered = prev.filter(c => c.id !== id);
      if (activeConversationId === id) {
        setActiveConversationId(filtered[0]?.id || null);
      }
      return filtered;
    });
  };

  const deleteAllConversations = () => {
    setConversations([]);
    setActiveConversationId(null);
  };

  const togglePinConversation = (id: string) => {
    setConversations(prev =>
      prev.map(c => (c.id === id ? { ...c, pinned: !c.pinned } : c))
    );
  };

  const renameConversation = (id: string, newTitle: string) => {
    setConversations(prev =>
      prev.map(c => (c.id === id ? { ...c, title: newTitle.trim() || 'Untitled' } : c))
    );
  };

  const clearActiveConversation = () => {
    if (!activeConversationId) return;
    setConversations(prev =>
      prev.map(c =>
        c.id === activeConversationId
          ? {
              ...c,
              messages: [
                {
                  id: `msg-init-${Date.now()}`,
                  role: 'assistant',
                  content: `Conversation reset. **${activeModel.name}** is active.`,
                  timestamp: Date.now(),
                  modelId: activeModelId
                }
              ],
              updatedAt: Date.now()
            }
          : c
      )
    );
  };

  // Generation execution state
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingReasoning, setStreamingReasoning] = useState('');

  const stopGeneration = () => {
    edgeEngine.cancelGeneration();
    setIsGenerating(false);
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || isGenerating) return;

    let currChat: ChatSession | null = activeConversation;
    let targetChatId = activeConversationId;

    if (!currChat || !targetChatId) {
      targetChatId = createNewChat();
      currChat = conversations.find(c => c.id === targetChatId) || null;
    }

    const userMsgId = `msg-user-${Date.now()}`;
    const assistantMsgId = `msg-asst-${Date.now() + 1}`;

    const userMsg: Message = {
      id: userMsgId,
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
      modelId: activeModelId
    };

    const assistantMsgPlaceholder: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      reasoningContent: '',
      timestamp: Date.now(),
      modelId: activeModelId
    };

    // Auto title if first user prompt
    const shouldUpdateTitle = (currChat?.messages.filter(m => m.role === 'user').length || 0) === 0;
    const dynamicTitle = shouldUpdateTitle
      ? content.slice(0, 32).replace(/[^\w\s]/gi, '') || 'New Conversation'
      : (currChat?.title || 'Conversation');

    setConversations(prev =>
      prev.map(c => {
        if (c.id === targetChatId) {
          return {
            ...c,
            title: dynamicTitle,
            updatedAt: Date.now(),
            messages: [...c.messages, userMsg, assistantMsgPlaceholder]
          };
        }
        return c;
      })
    );

    setIsGenerating(true);
    setStreamingReasoning('');

    const contextMessages = [
      ...(settings.customSystemPrompt
        ? [{ id: 'sys-prompt', role: 'system' as const, content: settings.customSystemPrompt, timestamp: Date.now() }]
        : []),
      ...(currChat?.messages || []),
      userMsg
    ];

    try {
      await edgeEngine.generateStream({
        model: activeModel,
        messages: contextMessages,
        settings,
        onToken: (token: string, reasoningChunk?: string) => {
          if (reasoningChunk) {
            setStreamingReasoning(prev => prev + reasoningChunk);
            setConversations(prev =>
              prev.map(c => {
                if (c.id === targetChatId) {
                  const msgs = [...c.messages];
                  const lastIdx = msgs.length - 1;
                  if (lastIdx >= 0 && msgs[lastIdx].id === assistantMsgId) {
                    msgs[lastIdx] = {
                      ...msgs[lastIdx],
                      reasoningContent: (msgs[lastIdx].reasoningContent || '') + reasoningChunk
                    };
                  }
                  return { ...c, messages: msgs };
                }
                return c;
              })
            );
          }
          if (token) {
            setConversations(prev =>
              prev.map(c => {
                if (c.id === targetChatId) {
                  const msgs = [...c.messages];
                  const lastIdx = msgs.length - 1;
                  if (lastIdx >= 0 && msgs[lastIdx].id === assistantMsgId) {
                    msgs[lastIdx] = {
                      ...msgs[lastIdx],
                      content: msgs[lastIdx].content + token
                    };
                  }
                  return { ...c, messages: msgs };
                }
                return c;
              })
            );
          }
        },
        onComplete: (metrics) => {
          setIsGenerating(false);
          setStreamingReasoning('');
          setConversations(prev =>
            prev.map(c => {
              if (c.id === targetChatId) {
                const msgs = [...c.messages];
                const lastIdx = msgs.length - 1;
                if (lastIdx >= 0 && msgs[lastIdx].id === assistantMsgId) {
                  msgs[lastIdx] = {
                    ...msgs[lastIdx],
                    metrics
                  };
                }
                return { ...c, messages: msgs, updatedAt: Date.now() };
              }
              return c;
            })
          );
        },
        onError: (err) => {
          setIsGenerating(false);
          setStreamingReasoning('');
          console.error('Edge stream error:', err);
        }
      });
    } catch (e) {
      setIsGenerating(false);
    }
  };

  const regenerateLastMessage = async () => {
    if (!activeConversation || isGenerating) return;
    const msgs = activeConversation.messages;
    if (msgs.length < 2) return;

    // Find last user message
    let lastUserIndex = -1;
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].role === 'user') {
        lastUserIndex = i;
        break;
      }
    }

    if (lastUserIndex === -1) return;
    const lastUserPrompt = msgs[lastUserIndex].content;

    // Remove everything after last user message (exclusive)
    setConversations(prev =>
      prev.map(c => {
        if (c.id === activeConversation.id) {
          return {
            ...c,
            messages: msgs.slice(0, lastUserIndex)
          };
        }
        return c;
      })
    );

    // Resend
    await sendMessage(lastUserPrompt);
  };

  // Storage and telemetry stats calculation
  const storageStats = useMemo(() => {
    let totalTokens = 0;
    conversations.forEach(c => {
      c.messages.forEach(m => {
        if (m.metrics?.tokensGenerated) {
          totalTokens += m.metrics.tokensGenerated;
        }
      });
    });

    const cachedModelsSizeMb = models
      .filter(m => m.status === 'ready' || m.status === 'cached')
      .reduce((sum, m) => sum + m.fileSizeMb, 0);

    return {
      totalOfflineTokens: totalTokens,
      totalChatsCount: conversations.length,
      cachedModelsSizeMb
    };
  }, [conversations, models]);

  return (
    <EdgeAppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        theme,
        toggleTheme,
        setTheme,
        models,
        activeModel,
        activeModelId,
        selectModel,
        downloadModel,
        deleteModelCache,
        setDefaultModel,
        conversations,
        activeConversation,
        activeConversationId,
        createNewChat,
        selectConversation,
        deleteConversation,
        deleteAllConversations,
        togglePinConversation,
        renameConversation,
        clearActiveConversation,
        sendMessage,
        stopGeneration,
        regenerateLastMessage,
        isGenerating,
        streamingReasoning,
        settings,
        updateSettings,
        isSettingsOpen,
        setIsSettingsOpen,
        storageStats
      }}
    >
      {children}
    </EdgeAppContext.Provider>
  );
};

export const useEdgeApp = () => {
  const context = useContext(EdgeAppContext);
  if (!context) {
    throw new Error('useEdgeApp must be used within an EdgeAppProvider');
  }
  return context;
};
