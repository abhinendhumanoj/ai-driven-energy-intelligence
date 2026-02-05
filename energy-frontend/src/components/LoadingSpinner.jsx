import React from 'react';

const LoadingSpinner = ({ size = 20, className = '' }) => (
  <div
    className={`spinner border-2 border-emerald-300 border-t-transparent rounded-full ${className}`}
    style={{ width: size, height: size }}
  />
);

export default LoadingSpinner;
