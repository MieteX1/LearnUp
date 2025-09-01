import DefaultPopup from "../../ui/DefaultPopup.jsx";

const ActionConfirmationPopup = ({ isOpen, onClose, onConfirm, title, message, confirmText, confirmClass = "bg-[#69DC9E] text-black hover:bg-[#5bc78d]" }) => (
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
          className={`px-4 py-2 rounded-3xl ${confirmClass}`}
        >
          {confirmText}
        </button>
      </>
    }
  >
    <p className="text-center">{message}</p>
  </DefaultPopup>
);

export default ActionConfirmationPopup;