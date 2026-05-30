import React, { useState, useRef } from 'react';
import { useModuleStore } from './store/useModuleStore';
import { useToastStore } from './store/useToastStore';
import { EditorCanvas } from './components/editor/EditorCanvas';
import { BlockPalette } from './components/editor/BlockPalette';
import { LivePreviewPanel } from './components/preview/LivePreviewPanel';
import { HelpSystem } from './components/shared/HelpSystem';
import { ToastContainer } from './components/shared/Toast';
import { exportModuleToJSON, importModuleFromJSON } from './utils/serialization';
import { validateModuleJSON, ValidationError } from './utils/validation';
import { motion } from 'framer-motion';
import { 
  Undo2, Redo2, Download, Upload, AlertCircle, 
  Sparkles, CheckCircle2, ChevronRight, Hammer, HelpCircle, X
} from 'lucide-react';

export default function App() {
  const { 
    past, future, undo, redo, title, description,
    version, createdAt, author, metadata, blocks,
    quizConfig, setModule, clearHistory
  } = useModuleStore();

  const { showToast } = useToastStore();

  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
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

  return (
    <div className="relative flex flex-col h-screen w-screen overflow-hidden bg-[#020805] text-[#f1f5f9] font-sans print:h-auto print:overflow-visible">
      {/* Visual Glowing Ambient Orbs */}
      <div className="absolute top-[-20%] left-[-20%] w-[700px] h-[700px] rounded-full bg-emerald-750/6 blur-[160px] pointer-events-none z-0" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[700px] h-[700px] rounded-full bg-amber-500/6 blur-[160px] pointer-events-none z-0" />
      <div className="absolute top-[20%] left-[30%] w-[500px] h-[500px] rounded-full bg-emerald-600/4 blur-[140px] pointer-events-none z-0" />

      {/* 1. GLASS CONTROL NAVIGATION BAR */}
      <header className="relative flex items-center justify-between px-6 py-3 border-b border-emerald-950/45 bg-[#030c06]/85 backdrop-blur-2xl shadow-xl z-40 flex-shrink-0 select-none print:hidden">
        {/* Startup Brand Logo */}
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

        {/* Undo/Redo & Serialization buttons */}
        <div className="flex items-center gap-5">
          {/* History control slice */}
          <div className="flex items-center gap-1 p-0.5 bg-[#030a05] border border-emerald-950/60 rounded-xl shadow-inner">
            <button
              onClick={undo}
              disabled={past.length === 0}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#06140b] disabled:text-slate-700 disabled:hover:bg-transparent transition-all cursor-pointer disabled:cursor-not-allowed focus:outline-none"
              title={past.length > 0 ? `Undo Last Action (${past.length} steps)` : 'Nothing to Undo (Ctrl+Z)'}
            >
              <Undo2 className="h-4 w-4" />
            </button>
            <button
              onClick={redo}
              disabled={future.length === 0}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#06140b] disabled:text-slate-700 disabled:hover:bg-transparent transition-all cursor-pointer disabled:cursor-not-allowed focus:outline-none"
              title={future.length > 0 ? `Redo Next Action (${future.length} steps)` : 'Nothing to Redo (Ctrl+Shift+Z)'}
            >
              <Redo2 className="h-4 w-4" />
            </button>
          </div>

          <div className="h-4 w-[1px] bg-emerald-950/60" />

          {/* Serialization buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleImportClick}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#030a05] hover:bg-[#06140b] border border-emerald-950 hover:border-emerald-900 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer focus:outline-none shadow-md"
              title="Import JSON Module Guide File"
            >
              <Upload className="h-3.5 w-3.5 text-[#d4af37]" />
              <span>Import .JSON</span>
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
              title="Validate Schema and Export Module"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Guide</span>
            </button>
          </div>

          <div className="h-4 w-[1px] bg-emerald-950/60" />

          {/* Onboarding Help Center */}
          <HelpSystem />
        </div>
      </header>

      {/* 2. THREE-PANEL GRID splitscreen workspace */}
      <main className="relative flex-grow flex w-full overflow-hidden z-10 print:overflow-visible print:h-auto">
        {/* Panel A: Side select block palette */}
        <motion.section 
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 18 }}
          className="w-72 bg-[#030a06]/35 border-r border-emerald-950/60 backdrop-blur-md flex-shrink-0 print:hidden"
        >
          <BlockPalette />
        </motion.section>

        {/* Panel B: Center visual visual editor canvas */}
        <motion.section 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 90, damping: 20, delay: 0.1 }}
          className="flex-grow bg-[#020805]/20 overflow-y-auto print:hidden"
        >
          <div className="max-w-3xl mx-auto py-6">
            <EditorCanvas />
          </div>
        </motion.section>

        {/* Panel C: Isolated active Live Simulator Preview */}
        <motion.section 
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 18, delay: 0.2 }}
          className="w-[500px] xl:w-[600px] border-l border-emerald-950 bg-[#030a06]/35 backdrop-blur-md flex-shrink-0 flex flex-col print:w-full print:border-none print:h-auto print:overflow-visible"
        >
          <LivePreviewPanel />
        </motion.section>
      </main>

      {/* Validation schema Error modal dialog overlay */}
      {showValidationModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
          <div 
            className="w-full max-w-lg bg-[#030a06] border border-emerald-900/30 shadow-2xl rounded-3xl overflow-hidden flex flex-col max-h-[500px]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="validation-modal-title"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-emerald-950 bg-emerald-950/20">
              <h3 id="validation-modal-title" className="font-extrabold text-sm text-slate-100 flex items-center gap-2.5 font-display">
                <AlertCircle className="h-5 w-5 text-rose-500 animate-pulse" />
                <span>Module Schema Diagnostics Report</span>
              </h3>
              <button
                onClick={() => setShowValidationModal(false)}
                className="text-slate-500 hover:text-slate-350 cursor-pointer focus:outline-none"
                aria-label="Close report"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* List */}
            <div className="p-5 overflow-y-auto flex-grow flex flex-col gap-3">
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
                    <AlertCircle className="h-4.5 w-4.5 flex-shrink-0 mt-0.5" />
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

            {/* Footer */}
            <div className="px-5 py-4 border-t border-emerald-950 bg-[#020805]/95 flex justify-end select-none">
              <button
                onClick={() => setShowValidationModal(false)}
                className="px-4 py-2.5 bg-[#d4af37] hover:bg-[#e5c158] text-black font-extrabold text-xs rounded-xl shadow-lg hover:shadow-emerald-500/10 transition-all cursor-pointer focus:outline-none"
              >
                Acknowledge and Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global animated toasts drawer */}
      <ToastContainer />
    </div>
  );
}
