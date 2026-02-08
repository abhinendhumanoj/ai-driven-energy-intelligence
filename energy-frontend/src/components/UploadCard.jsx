import React, { useMemo, useState } from 'react';
import { UploadCloud } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner.jsx';

const UploadCard = ({ onUpload, loading, onInvalidFile }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragging, setDragging] = useState(false);

  const fileSize = useMemo(() => {
    if (!selectedFile) return '';
    return `${(selectedFile.size / 1024).toFixed(1)} KB`;
  }, [selectedFile]);

  const handleFile = (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv')) {
      onInvalidFile?.();
      return;
    }
    setSelectedFile(file);
  };

  return (
    <div className="rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white dark:bg-[#111827] p-5 shadow-sm">
      <h2 className="text-base font-semibold mb-3">Upload CSV</h2>
      <label
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          handleFile(event.dataTransfer.files?.[0]);
        }}
        className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition ${
          dragging ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-900/20' : 'border-slate-300/70 dark:border-white/15'
        }`}
      >
        <UploadCloud className="text-emerald-500 mb-2" size={20} />
        <p className="text-sm">Drag & drop CSV or click to browse</p>
        <input type="file" accept=".csv" className="hidden" onChange={(event) => handleFile(event.target.files?.[0])} />
      </label>

      {selectedFile && (
        <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          <p>{selectedFile.name}</p>
          <p>{fileSize}</p>
        </div>
      )}

      {loading && <div className="mt-3 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden"><div className="h-full w-full bg-emerald-500 animate-pulse" /></div>}

      <button
        onClick={() => selectedFile && onUpload(selectedFile)}
        disabled={loading || !selectedFile}
        className="mt-4 w-full rounded-xl bg-emerald-500 text-white py-2.5 text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {loading ? <LoadingSpinner size={16} /> : 'Upload Data'}
      </button>
    </div>
  );
};

export default UploadCard;
