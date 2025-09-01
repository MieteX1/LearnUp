import DefaultPopup from "../../ui/DefaultPopup.jsx";

const BanConfirmationPopup = ({ isOpen, onClose, onConfirm, title, message }) => (
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
          className="px-4 py-2 bg-[#FF6961] text-white rounded-3xl hover:bg-[#FF5750]"
        >
          Odbanuj
        </button>
      </>
    }
  >
    <p className="text-center">{message}</p>
  </DefaultPopup>
);

export default BanConfirmationPopup;