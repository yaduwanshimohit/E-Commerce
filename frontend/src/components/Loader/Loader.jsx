import React from 'react';

const Loader = ({ size = 'medium', message = 'Loading...' }) => {
  const sizeClasses = {
    small: 'w-5 h-5 border-2',
    medium: 'w-10 h-10 border-3',
    large: 'w-16 h-16 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 min-h-[200px]">
      <div
        className={`${sizeClasses[size] || sizeClasses.medium} border-blue-600 border-t-transparent rounded-full animate-spin`}
      ></div>
      {message && <p className="mt-4 text-sm font-medium text-slate-600 animate-pulse">{message}</p>}
    </div>
  );
};

export default Loader;
