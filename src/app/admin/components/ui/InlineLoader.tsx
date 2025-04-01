import React from 'react';

interface InlineLoaderProps {
  className?: string;
}

const InlineLoader: React.FC<InlineLoaderProps> = ({ className = '' }) => {
  return (
    <div className={`inline-flex items-center ${className}`}>
      <div className="flex space-x-1">
        <div className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="h-2 w-2 bg-current rounded-full animate-bounce"></div>
      </div>
    </div>
  );
};

export default InlineLoader; 