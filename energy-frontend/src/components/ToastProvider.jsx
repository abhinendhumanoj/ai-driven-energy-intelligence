import React from 'react';
import { Toaster } from 'react-hot-toast';

const ToastProvider = () => (
  <Toaster
    position="top-right"
    toastOptions={{
      duration: 3000,
      style: {
        borderRadius: '12px',
        border: '1px solid rgba(148,163,184,0.25)',
        background: '#111827',
        color: '#E5E7EB'
      }
    }}
  />
);

export default ToastProvider;
