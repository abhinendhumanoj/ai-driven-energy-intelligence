import React from 'react';

const ToastContainer = ({ toasts, onDismiss }) => (
  <div className="fixed top-4 right-4 z-50 space-y-3">
    {toasts.map((toast) => (
      <div
        key={toast.id}
        className={`glass-panel px-4 py-3 rounded-lg text-sm shadow-lg flex items-start gap-3 transition-opacity ${
          toast.type === 'error' ? 'text-red-300' : 'text-emerald-200'
        }`}
      >
        <span className="font-semibold">
          {toast.type === 'error' ? 'Error' : 'Success'}
        </span>
        <span className="text-slate-200 dark:text-slate-100">{toast.message}</span>
        <button
          onClick={() => onDismiss(toast.id)}
          className="ml-auto text-slate-400 hover:text-slate-200"
        >
          ✕
        </button>
      </div>
    ))}
  </div>
);

export default ToastContainer;
