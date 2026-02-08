import React from 'react';
import { Download } from 'lucide-react';

const ExportButton = ({ onClick, label }) => (
  <button
    onClick={onClick}
    className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 dark:border-white/10 px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition"
  >
    <Download size={14} />
    {label}
  </button>
);

export default ExportButton;
