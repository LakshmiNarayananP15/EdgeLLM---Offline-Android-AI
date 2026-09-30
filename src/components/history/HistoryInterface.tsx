import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Trash2, 
  Pin, 
  PinOff, 
  Edit3, 
  Download, 
  Plus, 
  MessageSquare, 
  ShieldCheck, 
  Zap, 
  HardDrive,
  Calendar,
  Check,
  X,
  FileText,
  FileCode,
  FileSpreadsheet
} from 'lucide-react';
import { useEdgeApp } from '../../context/EdgeAppContext';
import { ChatSession } from '../../types';

export const HistoryInterface: React.FC = () => {
  const {
    conversations,
    activeConversationId,
    selectConversation,
    deleteConversation,
    deleteAllConversations,
    togglePinConversation,
    renameConversation,
    createNewChat,
    models,
    storageStats
  } = useEdgeApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [familyFilter, setFamilyFilter] = useState<'all' | 'llama' | 'gemma' | 'qwen' | 'smollm'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [exportModalChat, setExportModalChat] = useState<ChatSession | null>(null);
  const [showClearAllModal, setShowClearAllModal] = useState(false);

  // Filter conversations
  const filteredConversations = useMemo(() => {
    return conversations.filter(c => {
      // Family filter
      const targetModel = models.find(m => m.id === c.modelId);
      if (familyFilter !== 'all' && targetModel?.family !== familyFilter) {
        return false;
      }

      // Search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchMessages = c.messages.some(m => m.content.toLowerCase().includes(q));
      return matchTitle || matchMessages;
    });
  }, [conversations, models, familyFilter, searchQuery]);

  // Group by date
  const groupedChats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterday = today - 86400000;
    const last7Days = today - 86400000 * 7;

    const pinned: ChatSession[] = [];
    const todayList: ChatSession[] = [];
    const yesterdayList: ChatSession[] = [];
    const last7DaysList: ChatSession[] = [];
    const olderList: ChatSession[] = [];

    filteredConversations.forEach(c => {
      if (c.pinned) {
        pinned.push(c);
        return;
      }
      const time = c.updatedAt || c.createdAt;
      if (time >= today) {
        todayList.push(c);
      } else if (time >= yesterday) {
        yesterdayList.push(c);
      } else if (time >= last7Days) {
        last7DaysList.push(c);
      } else {
        olderList.push(c);
      }
    });

    return {
      pinned,
      today: todayList,
      yesterday: yesterdayList,
      last7Days: last7DaysList,
      older: olderList
    };
  }, [filteredConversations]);

  const handleStartRename = (chat: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(chat.id);
    setEditTitle(chat.title);
  };

  const handleSaveRename = (id: string, e: React.FormEvent) => {
    e.preventDefault();
    if (editTitle.trim()) {
      renameConversation(id, editTitle);
    }
    setEditingId(null);
  };

  const handleExport = (chat: ChatSession, format: 'md' | 'json' | 'txt') => {
    let content = '';
    let filename = `${chat.title.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;

    if (format === 'json') {
      content = JSON.stringify(chat, null, 2);
      filename += '.json';
    } else if (format === 'md') {
      content = `# ${chat.title}\n*Model: ${chat.modelId}*\n*Date: ${new Date(chat.createdAt).toLocaleString()}*\n\n---\n\n`;
      chat.messages.forEach(m => {
        content += `### ${m.role === 'user' ? 'User' : 'Assistant'}\n${m.content}\n\n`;
      });
      filename += '.md';
    } else {
      content = `${chat.title}\n==============================\n\n`;
      chat.messages.forEach(m => {
        content += `[${m.role.toUpperCase()}]:\n${m.content}\n\n`;
      });
      filename += '.txt';
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setExportModalChat(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto px-4 py-4 pb-4 max-w-4xl mx-auto w-full">
      {/* Top Stats Overview Header */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="p-3.5 rounded-2xl glass-card-light dark:glass-card-dark flex flex-col justify-between">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Total Chats</div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            {conversations.length}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl glass-card-light dark:glass-card-dark flex flex-col justify-between">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Offline Tokens</div>
          <div className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400 mt-1">
            {storageStats.totalOfflineTokens.toLocaleString()}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl glass-card-light dark:glass-card-dark flex flex-col justify-between">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Local Cache</div>
          <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {storageStats.cachedModelsSizeMb > 1000
              ? `${(storageStats.cachedModelsSizeMb / 1024).toFixed(1)} GB`
              : `${storageStats.cachedModelsSizeMb} MB`}
          </div>
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="space-y-3 mb-5">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 rounded-xl text-sm bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-500/60"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => createNewChat()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-semibold shadow-sm shadow-blue-500/20 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Family Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: 'All Models' },
            { id: 'llama', label: 'Llama 3.2' },
            { id: 'gemma', label: 'Gemma 2' },
            { id: 'qwen', label: 'Qwen 2.5' },
            { id: 'smollm', label: 'SmolLM2' }
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

          {conversations.length > 0 && (
            <button
              onClick={() => setShowClearAllModal(true)}
              className="ml-auto text-xs text-red-500 hover:text-red-600 font-medium px-2 py-1 shrink-0"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Conversations Groups */}
      {filteredConversations.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 glass-card-light dark:glass-card-dark rounded-2xl my-6">
          <MessageSquare className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
            No conversations found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 max-w-xs">
            {searchQuery ? 'Try adjusting your search terms or filters.' : 'Start a private offline chat with your local models.'}
          </p>
          <button
            onClick={() => createNewChat()}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
          >
            Start New Edge Chat
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pinned Chats */}
          {groupedChats.pinned.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500 uppercase tracking-wider mb-2.5 px-1">
                <Pin className="w-3.5 h-3.5" />
                <span>Pinned Conversations</span>
              </div>
              <div className="space-y-2">
                {groupedChats.pinned.map(chat => (
                  <ChatCard
                    key={chat.id}
                    chat={chat}
                    isActive={chat.id === activeConversationId}
                    isEditing={editingId === chat.id}
                    editTitle={editTitle}
                    models={models}
                    onSelect={() => selectConversation(chat.id)}
                    onTogglePin={e => {
                      e.stopPropagation();
                      togglePinConversation(chat.id);
                    }}
                    onStartRename={e => handleStartRename(chat, e)}
                    onSaveRename={e => handleSaveRename(chat.id, e)}
                    onCancelRename={() => setEditingId(null)}
                    onChangeEditTitle={setEditTitle}
                    onDelete={e => {
                      e.stopPropagation();
                      deleteConversation(chat.id);
                    }}
                    onOpenExport={e => {
                      e.stopPropagation();
                      setExportModalChat(chat);
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Today */}
          {groupedChats.today.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2.5 px-1">
                Today
              </div>
              <div className="space-y-2">
                {groupedChats.today.map(chat => (
                  <ChatCard
                    key={chat.id}
                    chat={chat}
                    isActive={chat.id === activeConversationId}
                    isEditing={editingId === chat.id}
                    editTitle={editTitle}
                    models={models}
                    onSelect={() => selectConversation(chat.id)}
                    onTogglePin={e => {
                      e.stopPropagation();
                      togglePinConversation(chat.id);
                    }}
                    onStartRename={e => handleStartRename(chat, e)}
                    onSaveRename={e => handleSaveRename(chat.id, e)}
                    onCancelRename={() => setEditingId(null)}
                    onChangeEditTitle={setEditTitle}
                    onDelete={e => {
                      e.stopPropagation();
                      deleteConversation(chat.id);
                    }}
                    onOpenExport={e => {
                      e.stopPropagation();
                      setExportModalChat(chat);
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Yesterday */}
          {groupedChats.yesterday.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2.5 px-1">
                Yesterday
              </div>
              <div className="space-y-2">
                {groupedChats.yesterday.map(chat => (
                  <ChatCard
                    key={chat.id}
                    chat={chat}
                    isActive={chat.id === activeConversationId}
                    isEditing={editingId === chat.id}
                    editTitle={editTitle}
                    models={models}
                    onSelect={() => selectConversation(chat.id)}
                    onTogglePin={e => {
                      e.stopPropagation();
                      togglePinConversation(chat.id);
                    }}
                    onStartRename={e => handleStartRename(chat, e)}
                    onSaveRename={e => handleSaveRename(chat.id, e)}
                    onCancelRename={() => setEditingId(null)}
                    onChangeEditTitle={setEditTitle}
                    onDelete={e => {
                      e.stopPropagation();
                      deleteConversation(chat.id);
                    }}
                    onOpenExport={e => {
                      e.stopPropagation();
                      setExportModalChat(chat);
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Previous 7 Days */}
          {groupedChats.last7Days.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2.5 px-1">
                Previous 7 Days
              </div>
              <div className="space-y-2">
                {groupedChats.last7Days.map(chat => (
                  <ChatCard
                    key={chat.id}
                    chat={chat}
                    isActive={chat.id === activeConversationId}
                    isEditing={editingId === chat.id}
                    editTitle={editTitle}
                    models={models}
                    onSelect={() => selectConversation(chat.id)}
                    onTogglePin={e => {
                      e.stopPropagation();
                      togglePinConversation(chat.id);
                    }}
                    onStartRename={e => handleStartRename(chat, e)}
                    onSaveRename={e => handleSaveRename(chat.id, e)}
                    onCancelRename={() => setEditingId(null)}
                    onChangeEditTitle={setEditTitle}
                    onDelete={e => {
                      e.stopPropagation();
                      deleteConversation(chat.id);
                    }}
                    onOpenExport={e => {
                      e.stopPropagation();
                      setExportModalChat(chat);
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Older */}
          {groupedChats.older.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2.5 px-1">
                Older
              </div>
              <div className="space-y-2">
                {groupedChats.older.map(chat => (
                  <ChatCard
                    key={chat.id}
                    chat={chat}
                    isActive={chat.id === activeConversationId}
                    isEditing={editingId === chat.id}
                    editTitle={editTitle}
                    models={models}
                    onSelect={() => selectConversation(chat.id)}
                    onTogglePin={e => {
                      e.stopPropagation();
                      togglePinConversation(chat.id);
                    }}
                    onStartRename={e => handleStartRename(chat, e)}
                    onSaveRename={e => handleSaveRename(chat.id, e)}
                    onCancelRename={() => setEditingId(null)}
                    onChangeEditTitle={setEditTitle}
                    onDelete={e => {
                      e.stopPropagation();
                      deleteConversation(chat.id);
                    }}
                    onOpenExport={e => {
                      e.stopPropagation();
                      setExportModalChat(chat);
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Export Format Modal */}
      <AnimatePresence>
        {exportModalChat && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-sm rounded-2xl glass-panel-light dark:glass-panel-dark p-5 shadow-2xl border border-slate-200 dark:border-slate-800"
            >
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                Export Conversation
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Choose a format to save &ldquo;{exportModalChat.title}&rdquo; to your local storage:
              </p>

              <div className="space-y-2 mb-4">
                <button
                  onClick={() => handleExport(exportModalChat, 'md')}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-left transition-colors"
                >
                  <FileText className="w-5 h-5 text-blue-500" />
                  <div>
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Markdown (.md)
                    </div>
                    <div className="text-[10px] text-slate-400">Formatted with headings and code blocks</div>
                  </div>
                </button>

                <button
                  onClick={() => handleExport(exportModalChat, 'json')}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-left transition-colors"
                >
                  <FileCode className="w-5 h-5 text-purple-500" />
                  <div>
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Raw JSON (.json)
                    </div>
                    <div className="text-[10px] text-slate-400">Includes all message telemetry and timestamps</div>
                  </div>
                </button>

                <button
                  onClick={() => handleExport(exportModalChat, 'txt')}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-left transition-colors"
                >
                  <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
                  <div>
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Plain Text (.txt)
                    </div>
                    <div className="text-[10px] text-slate-400">Universal clean text readout</div>
                  </div>
                </button>
              </div>

              <button
                onClick={() => setExportModalChat(null)}
                className="w-full py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Clear All Confirmation Modal */}
      <AnimatePresence>
        {showClearAllModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-sm rounded-2xl glass-panel-light dark:glass-panel-dark p-5 shadow-2xl border border-slate-200 dark:border-slate-800 text-center"
            >
              <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-3">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                Delete All History?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
                This will permanently remove all offline chat records from your device&apos;s local storage. This action cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowClearAllModal(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    deleteAllConversations();
                    setShowClearAllModal(false);
                  }}
                  className="flex-1 py-2 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700"
                >
                  Delete All
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Chat Card sub-component
interface ChatCardProps {
  chat: ChatSession;
  isActive: boolean;
  isEditing: boolean;
  editTitle: string;
  models: any[];
  onSelect: () => void;
  onTogglePin: (e: React.MouseEvent) => void;
  onStartRename: (e: React.MouseEvent) => void;
  onSaveRename: (e: React.FormEvent) => void;
  onCancelRename: () => void;
  onChangeEditTitle: (val: string) => void;
  onDelete: (e: React.MouseEvent) => void;
  onOpenExport: (e: React.MouseEvent) => void;
}

const ChatCard: React.FC<ChatCardProps> = ({
  chat,
  isActive,
  isEditing,
  editTitle,
  models,
  onSelect,
  onTogglePin,
  onStartRename,
  onSaveRename,
  onCancelRename,
  onChangeEditTitle,
  onDelete,
  onOpenExport
}) => {
  const model = models.find(m => m.id === chat.modelId) || models[0];
  const lastMessage = chat.messages[chat.messages.length - 1]?.content || 'Empty conversation';
  const cleanSnippet = lastMessage.replace(/[#*`_]/g, '').slice(0, 90);

  return (
    <div
      onClick={onSelect}
      className={`p-3.5 rounded-2xl glass-card-light dark:glass-card-dark transition-all cursor-pointer group relative ${
        isActive
          ? 'border-blue-500/50 bg-blue-50/20 dark:bg-blue-950/20 shadow-sm'
          : 'hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        {/* Title / Rename form */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <form onSubmit={onSaveRename} onClick={e => e.stopPropagation()} className="flex items-center gap-1.5">
              <input
                type="text"
                value={editTitle}
                onChange={e => onChangeEditTitle(e.target.value)}
                autoFocus
                className="w-full px-2 py-1 rounded-lg text-xs bg-slate-100 dark:bg-slate-800 border border-blue-500 text-slate-900 dark:text-white focus:outline-none"
              />
              <button type="submit" className="p-1 text-emerald-500 hover:text-emerald-400">
                <Check className="w-3.5 h-3.5" />
              </button>
              <button type="button" onClick={onCancelRename} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: model?.accentColor || '#3b82f6' }}
              />
              <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {chat.title}
              </h4>
            </div>
          )}

          {/* Snippet */}
          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-1 leading-relaxed">
            {cleanSnippet}
          </p>

          {/* Unboxed Metadata (Model · Date · Message Count) */}
          <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-400 dark:text-slate-500">
            <span>{model?.name || 'Llama 3.2'}</span>
            <span aria-hidden="true">·</span>
            <span>{new Date(chat.updatedAt || chat.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
            <span aria-hidden="true">·</span>
            <span>{chat.messages.length} msgs</span>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            onClick={onTogglePin}
            className={`p-1.5 min-w-[28px] min-h-[28px] flex items-center justify-center rounded-lg transition-all active:scale-90 ${
              chat.pinned
                ? 'text-amber-500 bg-amber-500/10'
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title={chat.pinned ? 'Unpin' : 'Pin conversation'}
            aria-label="Pin Conversation"
          >
            {chat.pinned ? <Pin className="w-3.5 h-3.5 fill-amber-500" /> : <Pin className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onStartRename}
            className="p-1.5 min-w-[28px] min-h-[28px] flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-90"
            title="Rename"
            aria-label="Rename Conversation"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onOpenExport}
            className="p-1.5 min-w-[28px] min-h-[28px] flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-90"
            title="Export"
            aria-label="Export Conversation"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onDelete}
            className="p-1.5 min-w-[28px] min-h-[28px] flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all active:scale-90"
            title="Delete"
            aria-label="Delete Conversation"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
