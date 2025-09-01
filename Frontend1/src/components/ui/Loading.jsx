import React from 'react';

const Loading = ({ className = '' }) => {
  return (
    <div className={`w-full flex flex-col justify-center items-center min-h-[200px] ${className}`}>
      <h3 className="text-2xl font-semibold mb-4 text-[#69DC9E] text-center">Ładowanie</h3>
      <div className="relative w-12 h-12">
        {/* Main spinner */}
        <div className="w-12 h-12 rounded-full absolute border-4 border-solid border-[#69DC9E] opacity-20"></div>
        <div className="w-12 h-12 rounded-full animate-spin absolute border-4 border-solid border-[#69DC9E] border-t-transparent"></div>

        {/* Inner spinner */}
        <div className="w-8 h-8 rounded-full absolute border-4 border-solid border-[#F9CB40] opacity-20"
             style={{ left: 'calc(50% - 1rem)', top: 'calc(50% - 1rem)' }}></div>
        <div className="w-8 h-8 rounded-full animate-spin absolute border-4 border-solid border-[#F9CB40] border-t-transparent"
             style={{ left: 'calc(50% - 1rem)', top: 'calc(50% - 1rem)' }}></div>
      </div>
    </div>
  );
};

export default Loading;