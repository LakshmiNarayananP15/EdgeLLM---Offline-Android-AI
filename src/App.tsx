/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { EdgeAppProvider, useEdgeApp } from './context/EdgeAppContext';
import { TopBar } from './components/common/TopBar';
import { BottomNav } from './components/common/BottomNav';
import { ChatInterface } from './components/chat/ChatInterface';
import { HistoryInterface } from './components/history/HistoryInterface';
import { ModelsInterface } from './components/models/ModelsInterface';
import { EdgeSettingsModal } from './components/settings/EdgeSettingsModal';

const MainLayout: React.FC = () => {
  const { activeTab } = useEdgeApp();

  return (
    <div className="flex flex-col h-full h-dvh w-full overflow-hidden ambient-mesh text-slate-100 selection:bg-blue-500/30">
      {/* Top App Bar */}
      <TopBar />

      {/* Main View Area */}
      <main className="flex-1 min-h-0 flex flex-col overflow-hidden relative w-full">
        <AnimatePresence mode="wait">
          {activeTab === 'chat' && (
            <motion.div
              key="chat-view"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 min-h-0 flex flex-col h-full overflow-hidden w-full"
            >
              <ChatInterface />
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              key="history-view"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 min-h-0 flex flex-col h-full overflow-hidden w-full"
            >
              <HistoryInterface />
            </motion.div>
          )}

          {activeTab === 'models' && (
            <motion.div
              key="models-view"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 min-h-0 flex flex-col h-full overflow-hidden w-full"
            >
              <ModelsInterface />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation Dock */}
      <BottomNav />

      {/* Settings Modal */}
      <EdgeSettingsModal />
    </div>
  );
};

export default function App() {
  return (
    <EdgeAppProvider>
      <MainLayout />
    </EdgeAppProvider>
  );
}
