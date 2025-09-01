const LoadingSpinner = ({ message }) => (
  <div className="flex items-center justify-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#69DC9E]"></div>
    <span className="ml-2">{message}</span>
  </div>
);

export default LoadingSpinner;