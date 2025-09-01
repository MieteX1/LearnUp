const TabButton = ({ isActive, onClick, icon: Icon, children }) => (
  <button
    className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
      isActive ? 'bg-[#69DC9E]' : 'bg-gray-200'
    }`}
    onClick={onClick}
  >
    <Icon size={20} />
    {children}
  </button>
);

export default TabButton;