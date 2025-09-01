import React, { useState } from "react";
import { X } from "lucide-react";
import DefaultPopup from "../../ui/DefaultPopup.jsx";
import axios from "axios";
import {useAlert} from "../../ui/Alert.jsx";
import md5 from "blueimp-md5";

const ModeratorPopup = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [isConfirmationPopupOpen, setIsConfirmationPopupOpen] = useState(false);
  const [error, setError] = useState("");
  const { addAlert } = useAlert();


  const handleSendLink = async () => {
    if (email !== confirmEmail) {
      setError("Adresy e-mail nie są zgodne.");
      return;
    }
    const emailHash = md5(email.trim().toLowerCase());
    const defaultAvatarUrl = `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${emailHash}`;

    try {
      const response = await axios.post('http://localhost:3000/api/auth/create-moderator', {
        email: email,
        profile_picture: defaultAvatarUrl
      });

      if (response.status === 201) {
        setIsConfirmationPopupOpen(true);
        setError("");
        addAlert(`Link do dokończenia rejestracji został wysłany na adres e-mail: ${email}`, "success");
      }
      else {
        const data = await response.json();
        setError(data.message || "Wystąpił błąd podczas wysyłania linku.");
      }
    } catch (err) {
       if (err.status === 409) {
      setError("Adres e-mail jest już zarejestrowany.");
      addAlert(`Ten Adres e-mail: ${email} jest już zarejestrowany`, "error");

    } else {
         setError("Wystąpił błąd podczas połączenia z serwerem." + err);
         addAlert(`Wystąpił błąd podczas połączenia z serwerem. ${err}`, "error");

       }
    }
  };

  const handleConfirmationClose = () => {
    setIsConfirmationPopupOpen(false);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="p-8 bg-[#69DC9E] rounded-3xl w-[500px] relative">
          <button onClick={onClose} className="absolute right-4 top-4">
            <X size={24} />
          </button>

          <h2 className="text-2xl mb-6">Tworzenie nowego konta moderatora</h2>

          <p className="mb-4 text-sm">
            Wprowadź Adres e-mail użytkownika na który zostanie przesłany link z dokończeniem rejestracji
          </p>

          {error && (
            <p className="text-red-600 text-sm mb-4">{error}</p>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block mb-2 font-semibold">Adres e-mail</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 border rounded-xl text-sm"
                placeholder="Wprowadź adres e-mail"
              />
            </div>
            <div>
              <label htmlFor="confirmEmail" className="block mb-2 font-semibold">Powtórz adres e-mail</label>
              <input
                type="email"
                id="confirmEmail"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                className="w-full p-4 border rounded-xl text-sm"
                placeholder="Powtórz adres e-mail"
              />
            </div>
          </div>

          <button
            onClick={handleSendLink}
            className="mt-6 px-6 py-2 bg-[#FF3B3B] text-white rounded-full float-right"
          >
            Wyślij link
          </button>
        </div>
      </div>

      {isConfirmationPopupOpen && (
        <DefaultPopup
          isOpen={isConfirmationPopupOpen}
          onClose={handleConfirmationClose}
          title="Link wysłany!"
          actions={
            <button
              onClick={handleConfirmationClose}
              className="px-6 py-2 bg-[#69DC9E] text-white rounded-full"
            >
              Zamknij
            </button>
          }
        >
          <p className="text-center text-sm">
            Link do dokończenia rejestracji został wysłany na adres e-mail: <strong>{email}</strong>.
          </p>
        </DefaultPopup>
      )}
    </>
  );
};

export default ModeratorPopup;