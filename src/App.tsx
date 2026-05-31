import React, { useState, useRef } from 'react';
import { useModuleStore } from './store/useModuleStore';
import { useToastStore } from './store/useToastStore';
import { EditorCanvas } from './components/editor/EditorCanvas';
import { BlockPalette } from './components/editor/BlockPalette';
import { LivePreviewPanel } from './components/preview/LivePreviewPanel';
import { HelpSystem } from './components/shared/HelpSystem';
import { ToastContainer } from './components/shared/Toast';
import { CustomCursor } from './components/shared/CustomCursor';
import { Modal } from './components/shared/Modal';
import { Tooltip } from './components/shared/Tooltip';
import { LoginHub } from './components/shared/LoginHub';
import { exportModuleToJSON, importModuleFromJSON } from './utils/serialization';
import { validateModuleJSON, ValidationError } from './utils/validation';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Undo2, Redo2, Download, Upload, AlertCircle, 
  Sparkles, CheckCircle2, ChevronRight, Hammer, HelpCircle, X,
  Sun, Moon, ChevronDown, BookOpen, Calculator, Trophy,
  LayoutGrid, Menu, XCircle
} from 'lucide-react';

export default function App() {
  const { 
    past, future, undo, redo, title, description,
    version, createdAt, author, metadata, blocks,
    quizConfig, setModule, clearHistory,
    isAuthenticated, setIsAuthenticated,
    showLoginModal, setShowLoginModal
  } = useModuleStore();

  const { showToast } = useToastStore();

  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Theme toggle state
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  // Navbar dropdown state
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Listen to Firebase Auth state
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });
    return () => unsubscribe();
  }, [setIsAuthenticated]);

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
    if (isDarkTheme) {
      document.documentElement.classList.add('theme-light');
    } else {
      document.documentElement.classList.remove('theme-light');
    }
    showToast(`Switched to ${isDarkTheme ? 'Light' : 'Dark'} theme`, 'info', 1500);
  };

  const handleDropdownToggle = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const handleExport = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      showToast('🔒 Please authenticate to export your module.', 'warning');
      return;
    }

    const rawModule = {
      moduleId: useModuleStore.getState().moduleId,
      title,
      description,
      version,
      createdAt,
      updatedAt: new Date().toISOString(),
      author,
      metadata,
      blocks,
      quizConfig
    };

    const errors = validateModuleJSON(rawModule);
    const blockingErrors = errors.filter(e => e.severity === 'Blocking');

    if (blockingErrors.length > 0) {
      setValidationErrors(errors);
      setShowValidationModal(true);
      showToast('Export failed. Please fix schema errors first.', 'error');
      return;
    }

    const { success } = exportModuleToJSON(rawModule);
    if (success) {
      showToast(`Exported module: ${title.slice(0, 24)}...`, 'success');
      if (errors.length > 0) {
        setValidationErrors(errors);
        setShowValidationModal(true);
      }
    }
  };

  const handleImportClick = () => {
    const confirmImport = window.confirm(
      "Are you sure you want to import a module? Any unsaved changes on the current canvas will be permanently overwritten."
    );
    if (confirmImport && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const jsonString = event.target?.result as string;
      const { success, module: importedModule, errors, warning } = importModuleFromJSON(jsonString);

      if (success && importedModule) {
        clearHistory();
        
        useModuleStore.setState({
          moduleId: importedModule.moduleId,
          title: importedModule.title,
          description: importedModule.description,
          version: importedModule.version,
          createdAt: importedModule.createdAt,
          updatedAt: importedModule.updatedAt,
          author: importedModule.author,
          metadata: importedModule.metadata,
          blocks: importedModule.blocks,
          quizConfig: importedModule.quizConfig,
          selectedBlockId: null,
          past: [],
          future: []
        });

        showToast('Module imported successfully!', 'success');
        
        if (warning) {
          showToast(warning, 'warning', 5000);
        }

        if (errors.length > 0) {
          setValidationErrors(errors);
          setShowValidationModal(true);
        }
      } else {
        setValidationErrors(errors);
        setShowValidationModal(true);
        showToast('Import failed. Invalid schema file.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Navbar dropdown items
  const navDropdowns = [
    {
      label: 'Modules',
      icon: BookOpen,
      items: [
        { label: 'Rich Text Block', desc: 'WYSIWYG formatted content' },
        { label: 'Image Block', desc: 'Responsive images with alt-text' },
        { label: 'Video Block', desc: 'YouTube & Vimeo embeds' },
        { label: 'Code Snippet', desc: 'Syntax-highlighted code' },
      ]
    },
    {
      label: 'Calculators',
      icon: Calculator,
      items: [
        { label: 'EMI Calculator', desc: 'Loan EMI with amortisation' },
        { label: 'SIP Calculator', desc: 'Systematic investment plan' },
        { label: 'Compound Interest', desc: 'Growth curve visualiser' },
      ]
    },
    {
      label: 'Gamification',
      icon: Trophy,
      items: [
        { label: 'Quiz MCQ', desc: 'Multiple-choice assessment' },
        { label: 'Quiz True/False', desc: 'Binary choice with streaks' },
        { label: 'Achievement Badge', desc: 'Unlockable confetti badges' },
        { label: 'Progress Tracker', desc: 'Milestone-based progress' },
      ]
    },
  ];

  return (
    <div className={`relative flex flex-col h-screen w-screen overflow-hidden text-[#f1f5f9] font-sans print:h-auto print:overflow-visible ${isDarkTheme ? 'bg-[#020805]' : 'bg-[#f8faf9]'}`}>
      {/* Custom Cursor Trail */}
      <CustomCursor />

      {/* Visual Glowing Ambient Orbs */}
      <div className="absolute top-[-20%] left-[-20%] w-[700px] h-[700px] rounded-full bg-emerald-750/6 blur-[160px] pointer-events-none z-0" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[700px] h-[700px] rounded-full bg-amber-500/6 blur-[160px] pointer-events-none z-0" />
      <div className="absolute top-[20%] left-[30%] w-[500px] h-[500px] rounded-full bg-emerald-600/4 blur-[140px] pointer-events-none z-0" />

      {/* ═══ NAVBAR — Bootstrap-Style with Dropdowns ═══ */}
      <nav className="relative flex items-center justify-between px-3 sm:px-6 py-2.5 border-b border-emerald-950/45 bg-[#030c06]/85 backdrop-blur-2xl shadow-xl z-40 flex-shrink-0 select-none print:hidden gap-2">
        {/* Brand */}
        <div className="flex items-center gap-3 group">
          <div className="p-2 rounded-xl bg-gradient-to-br from-[#d4af37] via-[#10b981] to-[#e5c158] text-black flex items-center justify-center shadow-lg shadow-emerald-950/20 group-hover:shadow-[#d4af37]/30 group-hover:scale-105 transition-all duration-300">
            <Hammer className="h-5 w-5 text-black group-hover:rotate-12 transition-transform duration-300" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-extrabold tracking-tight font-display text-white leading-none flex items-center gap-1.5">
              <span>EduForge</span>
              <span className="text-[10px] font-bold text-[#d4af37] bg-emerald-950/45 border border-emerald-900/30 px-1.5 py-0.5 rounded-full select-none leading-none font-sans">
                Series A
              </span>
            </h1>
            <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest mt-1 leading-none font-sans">
              Financial Tech Studio
            </span>
          </div>
        </div>

        {/* Center — Dropdown Navigation Links */}
        <div className="hidden lg:flex items-center gap-1">
          {navDropdowns.map((dropdown) => (
            <div key={dropdown.label} className="relative">
              <button
                onClick={() => handleDropdownToggle(dropdown.label)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer focus:outline-none ${
                  activeDropdown === dropdown.label
                    ? 'bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/20'
                    : 'text-slate-400 hover:text-white hover:bg-[#06140b]/50 border border-transparent'
                }`}
              >
                <dropdown.icon className="h-3.5 w-3.5" />
                <span>{dropdown.label}</span>
                <ChevronDown className={`h-3 w-3 transition-transform ${activeDropdown === dropdown.label ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Panel */}
              <AnimatePresence>
                {activeDropdown === dropdown.label && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-1.5 w-64 bg-[#030a06]/95 border border-[#082212]/60 rounded-2xl shadow-2xl shadow-black/50 backdrop-blur-2xl overflow-hidden z-50"
                  >
                    <div className="p-2">
                      {dropdown.items.map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveDropdown(null)}
                          className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-[#082212]/30 transition-colors cursor-pointer flex flex-col gap-0.5 focus:outline-none group"
                        >
                          <span className="text-xs font-bold text-slate-200 group-hover:text-[#d4af37] transition-colors">{item.label}</span>
                          <span className="text-[10px] text-slate-500 font-medium">{item.desc}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Right — Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3 flex-wrap justify-end">
          {/* Theme Toggle */}
          <Tooltip content={isDarkTheme ? 'Switch to Light Mode' : 'Switch to Dark Mode'} position="bottom">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-[#030a05] hover:bg-[#06140b] border border-emerald-950/60 text-slate-400 hover:text-[#d4af37] transition-all cursor-pointer focus:outline-none"
              aria-label="Toggle theme"
            >
              {isDarkTheme ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </Tooltip>

          {/* History controls */}
          <div className="hidden sm:flex items-center gap-1 p-0.5 bg-[#030a05] border border-emerald-950/60 rounded-xl shadow-inner">
            <Tooltip content={past.length > 0 ? `Undo (${past.length} steps)` : 'Nothing to undo'} position="bottom">
              <button
                onClick={undo}
                disabled={past.length === 0}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#06140b] disabled:text-slate-700 disabled:hover:bg-transparent transition-all cursor-pointer disabled:cursor-not-allowed focus:outline-none"
              >
                <Undo2 className="h-4 w-4" />
              </button>
            </Tooltip>
            <Tooltip content={future.length > 0 ? `Redo (${future.length} steps)` : 'Nothing to redo'} position="bottom">
              <button
                onClick={redo}
                disabled={future.length === 0}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#06140b] disabled:text-slate-700 disabled:hover:bg-transparent transition-all cursor-pointer disabled:cursor-not-allowed focus:outline-none"
              >
                <Redo2 className="h-4 w-4" />
              </button>
            </Tooltip>
          </div>

          <div className="hidden sm:block h-4 w-[1px] bg-emerald-950/60" />

          {/* Serialization */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={handleImportClick}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#030a05] hover:bg-[#06140b] border border-emerald-950 hover:border-emerald-900 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer focus:outline-none shadow-md"
              title="Import JSON Module Guide File"
            >
              <Upload className="h-3.5 w-3.5 text-[#d4af37]" />
              <span className="hidden xl:inline">Import .JSON</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />

            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#d4af37] to-[#10b981] hover:from-[#e5c158] hover:to-[#0d9f6e] border border-[#d4af37]/20 text-black rounded-xl text-xs font-extrabold shadow-lg shadow-emerald-950/20 hover:shadow-emerald-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer focus:outline-none"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Guide</span>
            </button>
          </div>

          <div className="hidden sm:block h-4 w-[1px] bg-emerald-950/60" />

          {/* Authentication */}
          {!isAuthenticated ? (
            <button
              onClick={() => setShowLoginModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#030a05] hover:bg-[#06140b] border border-[#d4af37]/30 hover:border-[#d4af37]/60 text-[#d4af37] rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer focus:outline-none"
            >
              <span>Login</span>
            </button>
          ) : (
            <button
              onClick={async () => {
                await signOut(auth);
                setIsAuthenticated(false);
                showToast('Logged out securely.', 'info');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#030a05] hover:bg-rose-950/20 border border-emerald-950 hover:border-rose-900/50 text-slate-400 hover:text-rose-400 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer focus:outline-none"
            >
              <span>Logout</span>
            </button>
          )}

          <div className="hidden lg:block h-4 w-[1px] bg-emerald-950/60" />

          {/* Help */}
          <HelpSystem />
        </div>
      </nav>

      {/* Close dropdown on outside click */}
      {activeDropdown && (
        <div className="fixed inset-0 z-30" onClick={() => setActiveDropdown(null)} />
      )}

      {/* ═══ THREE-PANEL GRID WORKSPACE ═══ */}
      <main className="relative flex-grow flex w-full overflow-hidden z-10 print:overflow-visible print:h-auto">
        {/* Panel A: Block Palette */}
        <motion.section 
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 18 }}
          className="hidden lg:block w-72 bg-[#030a06]/35 border-r border-emerald-950/60 backdrop-blur-md flex-shrink-0 overflow-y-auto print:hidden"
        >
          <BlockPalette />
        </motion.section>

        {/* Panel B: Editor Canvas */}
        <motion.section 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 90, damping: 20, delay: 0.1 }}
          className="flex-grow min-w-0 bg-[#020805]/20 overflow-y-auto print:hidden"
        >
          <div className="max-w-3xl mx-auto py-6">
            <EditorCanvas />
          </div>
        </motion.section>

        {/* Panel C: Live Preview */}
        <motion.section 
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 18, delay: 0.2 }}
          className="hidden md:flex w-[400px] lg:w-[500px] xl:w-[600px] border-l border-emerald-950 bg-[#030a06]/35 backdrop-blur-md flex-shrink-0 flex-col overflow-hidden print:w-full print:border-none print:h-auto print:overflow-visible print:flex"
        >
          <LivePreviewPanel />
        </motion.section>
      </main>

      {/* ═══ VALIDATION MODAL (using new Modal component) ═══ */}
      <Modal
        isOpen={showValidationModal}
        onClose={() => setShowValidationModal(false)}
        title="Module Schema Diagnostics Report"
        footer={
          <button
            onClick={() => setShowValidationModal(false)}
            className="px-4 py-2.5 bg-[#d4af37] hover:bg-[#e5c158] text-black font-extrabold text-xs rounded-xl shadow-lg hover:shadow-emerald-500/10 transition-all cursor-pointer focus:outline-none"
          >
            Acknowledge and Close
          </button>
        }
      >
        <div className="flex flex-col gap-3">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
            Found Errors and warnings details
          </span>
          <div className="flex flex-col gap-2.5">
            {validationErrors.map((err, idx) => (
              <div 
                key={idx} 
                className={`flex items-start gap-3 p-3.5 border rounded-2xl leading-normal select-text ${
                  err.severity === 'Blocking' 
                    ? 'border-rose-500/10 bg-rose-950/15 text-rose-200' 
                    : 'border-amber-500/10 bg-amber-950/15 text-amber-200'
                }`}
              >
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest font-mono">
                    {err.severity} Issue
                  </span>
                  <p className="text-xs text-slate-300 font-semibold leading-relaxed">
                    {err.message}
                  </p>
                  {err.field && (
                    <span className="text-[9px] font-mono text-slate-500 mt-1">
                      Field: {err.field}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* Login Hub Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <LoginHub 
            onSuccess={() => {
              setIsAuthenticated(true);
              setShowLoginModal(false);
              showToast('Security Session Established Successfully.', 'success');
            }} 
            onClose={() => setShowLoginModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Global animated toasts */}
      <ToastContainer />
    </div>
  );
}
