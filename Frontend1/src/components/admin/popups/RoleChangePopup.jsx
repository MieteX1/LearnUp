import DefaultPopup from "../../ui/DefaultPopup.jsx";

const RoleChangePopup = ({ isOpen, onClose, onConfirm, title, message, confirmText }) => (
  <DefaultPopup
    isOpen={isOpen}
    onClose={onClose}
    title={title}
    maxWidth="sm"
    actions={
      <>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 text-black rounded-3xl hover:bg-gray-300"
        >
          Anuluj
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 bg-[#69DC9E] text-black rounded-3xl hover:bg-[#5bc78d]"
        >
          {confirmText}
        </button>
      </>
    }
  >
    <p className="text-center">{message}</p>
  </DefaultPopup>
);
export default RoleChangePopup;