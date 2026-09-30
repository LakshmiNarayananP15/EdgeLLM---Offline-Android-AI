import React from 'react';
import { motion } from 'motion/react';
import { MessageSquare, History, Cpu } from 'lucide-react';
import { useEdgeApp } from '../../context/EdgeAppContext';
import { ActiveTab } from '../../types';

interface TabItem {
  id: ActiveTab;
  label: string;
  icon: React.ElementType;
  badgeCount?: number;
}

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, conversations, models } = useEdgeApp();

  const tabs: TabItem[] = [
    {
      id: 'chat',
      label: 'Chat',
      icon: MessageSquare
    },
    {
      id: 'history',
      label: 'History',
      icon: History,
      badgeCount: conversations.length > 0 ? conversations.length : undefined
    },
    {
      id: 'models',
      label: 'Models',
      icon: Cpu,
      badgeCount: models.filter(m => m.status === 'ready' || m.status === 'cached').length
    }
  ];

  return (
    <nav 
      aria-label="Bottom Navigation"
      className="w-full shrink-0 z-30 pt-1 pb-2 px-3 bg-[#060913]/90 backdrop-blur-xl border-t border-white/[0.06]"
    >
      <div className="max-w-[280px] mx-auto">
        <div className="rounded-xl bg-[#0e1424]/90 border border-white/[0.1] shadow-lg shadow-black/60 p-1 flex items-center justify-around gap-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative flex-1 py-1 px-2 rounded-lg flex flex-col items-center justify-center min-h-[34px] transition-colors group focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
                aria-selected={isActive}
                role="tab"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabBubble"
                    className="absolute inset-0 bg-blue-500/20 rounded-lg border border-blue-400/40 shadow-xs shadow-blue-500/20"
                    transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                  />
                )}

                <div className="relative z-10 flex flex-col items-center">
                  <div className="relative">
                    <Icon
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isActive
                          ? 'text-blue-400 scale-105'
                          : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    />
                    {tab.badgeCount !== undefined && tab.badgeCount > 0 && (
                      <span className="absolute -top-1 -right-2 min-w-[12px] h-[12px] px-0.5 rounded-full bg-blue-950 border border-blue-400/40 text-[8px] font-semibold text-blue-300 flex items-center justify-center leading-none">
                        {tab.badgeCount}
                      </span>
                    )}
                  </div>

                  <span
                    className={`text-[9px] font-medium mt-0.5 tracking-tight transition-colors ${
                      isActive
                        ? 'text-blue-400 font-semibold'
                        : 'text-slate-400 group-hover:text-slate-300'
                    }`}
                  >
                    {tab.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
