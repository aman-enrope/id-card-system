/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { 
  CreditCard, 
  LayoutGrid, 
  Plus, 
  Sparkles,
  School,
  Settings as SettingsIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from './store/useStore';
import BulkUpload from './components/BulkUpload';
import ManualAdd from './components/ManualAdd';
import StudentCardList from './components/StudentCardList';
import Settings from './components/Settings';

export default function App() {
  const { fetchStudents, fetchSettings, settings, students } = useStore();
  const [activeTab, setActiveTab] = useState<'view' | 'add' | 'settings'>('view');

  useEffect(() => {
    console.log('[APP] Initializing app, fetching students and settings...');
    fetchStudents();
    fetchSettings();
  }, [fetchStudents, fetchSettings]);

  useEffect(() => {
    console.log('[APP] Current settings loaded:', settings);
    console.log('[APP] Current students count:', students.length);
  }, [settings, students]);

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#11365c] rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-900/20">
            <CreditCard className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-[#11365c] tracking-tight text-lg leading-none">ID MASTER</span>
            <span className="text-[8px] font-black text-slate-400 uppercase mt-1 tracking-widest leading-none">Open Access</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-4 mt-2">Management</div>
          
          <SidebarButton 
            active={activeTab === 'view'} 
            onClick={() => setActiveTab('view')} 
            icon={<LayoutGrid className="w-4 h-4" />} 
            label="ID Collection" 
          />
          <SidebarButton 
            active={activeTab === 'add'} 
            onClick={() => setActiveTab('add')} 
            icon={<Plus className="w-4 h-4" />} 
            label="Import & Add" 
          />

          <div className="pt-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-4">Branding</div>
          <SidebarButton 
            active={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')} 
            icon={<SettingsIcon className="w-4 h-4" />} 
            label="School Branding" 
          />
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200">
          <div className="flex items-center gap-3 px-2">
            <div className="flex-1 min-w-0 text-center">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Enrope Solutions</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              {activeTab === 'view' ? 'Student ID Collection' : activeTab === 'add' ? 'Import Card Data' : 'Institution Branding'}
            </h1>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mt-0.5">
              {settings.name} <span className="mx-2 text-slate-200">|</span> {settings.session}
            </p>
          </div>
          
          <div className="flex gap-3">
             {students.length > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold uppercase tracking-tight">{students.length} Cards Synced</span>
                </div>
             )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === 'add' ? (
              <motion.div 
                key="add"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="grid grid-cols-1 xl:grid-cols-3 gap-8"
              >
                <div className="xl:col-span-2">
                  <BulkUpload />
                </div>
                <div>
                  <ManualAdd />
                </div>
              </motion.div>
            ) : activeTab === 'view' ? (
              <motion.div 
                key="view"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
              >
                {students.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-[2.5rem] p-24 text-center max-w-2xl mx-auto mt-12 shadow-sm">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                      <SchoolIcon className="w-12 h-12 text-slate-300" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">No ID cards generated yet</h3>
                    <p className="text-slate-500 mb-10 max-w-sm mx-auto leading-relaxed">
                      Initialize your card database by uploading an Excel sheet or adding individual students. 
                      Standardized CR80 format will be generated automatically.
                    </p>
                    <button 
                      onClick={() => setActiveTab('add')}
                      className="inline-flex items-center gap-3 px-10 py-4 bg-[#11365c] text-white rounded-2xl font-bold hover:bg-[#0d2a48] transition-all shadow-xl shadow-blue-900/20"
                    >
                      <Plus className="w-5 h-5 text-blue-200" />
                      Initialize Database
                    </button>
                  </div>
                ) : (
                  <StudentCardList />
                )}
              </motion.div>
            ) : (
              <motion.div
                key="settings"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
              >
                <Settings />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function SchoolIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 22v-4a2 2 0 1 0-4 0v4" />
      <path d="m18 10 3.447 1.724a1 1 0 0 1 .553.894V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V12.618a1 1 0 0 1 .553-.894L6 10" />
      <path d="M6 5h12v5H6z" />
      <path d="M9 21v-4a2 2 0 1 1 4 0v4" />
      <path d="M22 10h-2" />
      <path d="M2 10h2" />
    </svg>
  );
}

function SidebarButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${
        active 
        ? 'bg-slate-50 text-[#11365c] border border-slate-200 shadow-sm' 
        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      <div className={`p-1.5 rounded-lg transition-colors ${active ? 'bg-white shadow-sm text-blue-600' : ''}`}>
        {icon}
      </div>
      {label}
    </button>
  );
}
