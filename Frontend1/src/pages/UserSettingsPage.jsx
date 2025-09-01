import React, { useState,useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowDown } from 'lucide-react';
import BottsAvatarSelector from '../components/AvatarGenerator';
import DefaultPopup from '../components/ui/DefaultPopup.jsx';
import ImageCropper from '../components/ImageCropper.jsx';
import {useAlert} from "../components/ui/Alert.jsx";
import axios from 'axios';

const UserSettingsPage = () => {
  const { user, updateUserProfile, logout } = useAuth();
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showPrivacyDropdown, setShowPrivacyDropdown] = useState(false);
  const [isAvatarSelectorOpen, setIsAvatarSelectorOpen] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [showPasswordPopup, setShowPasswordPopup] = useState(false);
  const [showDeleteAccountPopup, setShowDeleteAccountPopup] = useState(false);
  const [showDeleteAvatarConfirm, setShowDeleteAvatarConfirm] = useState(false);
  const [deleteAvatarMessage, setDeleteAvatarMessage] = useState('');
  const [avatarId, setAvatarId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cropperImage, setCropperImage] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const {addAlert} = useAlert();

  useEffect(() => {
    const initializeAvatar = async () => {
      try {
        if (!user) return;

        const response = await axios.get(`http://localhost:3000/api/user/${user.id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        });

        if (response.data.avatar_id) {
          setAvatarId(response.data.avatar_id);
          setSelectedAvatar('');
        } else if (response.data.profile_picture) {
          setSelectedAvatar(response.data.profile_picture);
          setAvatarId(null);
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };

    initializeAvatar();
  }, [user]);

  const [formData, setFormData] = useState({
    username: user?.login || '',
    email: user?.email || '',
    accountType: 'Student',
    privacy: 'Publiczne'
  });

  // Stan dla formularza zmiany hasła
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  // Stan dla formularza usuwania konta
  const [deleteAccountPassword, setDeleteAccountPassword] = useState('');

  const accountTypes = ['Student', 'Nauczyciel'];
  const privacyOptions = ['Publiczne', 'Prywatne', 'Tylko dla znajomych'];


  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      setError('Nowe hasła nie są zgodne');
      return;
    }

    try {
      await axios.post('http://localhost:3000/api/auth/change-password', {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      setSuccess('Hasło zostało zmienione pomyślnie');
      addAlert('Hasło zostało zmienione pomyślnie', 'success');
      setPasswordForm({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
      setTimeout(() => setShowPasswordPopup(false), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Błąd podczas zmiany hasła');
      addAlert('Błąd podczas zmiany hasła', 'error');
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await axios.delete(`http://localhost:3000/api/user/${user.id}`, {
        data: { password: deleteAccountPassword },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      addAlert('Konto zostało usunięte', 'success');
      await logout();
    } catch (err) {
      setError(err.response?.data?.message || 'Błąd podczas usuwania konta');
      addAlert('Błąd podczas usuwania konta', 'error');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTypeSelect = (type) => {
    setFormData(prev => ({ ...prev, accountType: type }));
    setShowTypeDropdown(false);
  };

  const handlePrivacySelect = (privacy) => {
    setFormData(prev => ({ ...prev, privacy }));
    setShowPrivacyDropdown(false);
  };

  const handleAvatarChange = async (avatarUrl) => {
    try {
      setSelectedAvatar(avatarUrl);
      await updateUserProfile(user.id, {
        profile_picture: avatarUrl
      });

      // Wywołujemy handleDeleteAvatar tylko jeśli jest avatarId
      if (avatarId) {
        handleDeleteAvatar(true);
      }

      addAlert('Avatar został pomyślnie zaktualizowany', 'success');
    } catch (error) {
      console.error('Failed to update avatar:', error);
      addAlert('Nie udało się zaktualizować avatara', 'error');
    }
};
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Sprawdzanie typu pliku
    if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
      setError('Proszę wybrać plik obrazu (JPG, PNG). Pliki SVG nie są dozwolone.');
      addAlert('Proszę wybrać plik obrazu (JPG, PNG). Pliki SVG nie są dozwolone.', 'error');
      return;
    }

    // Sprawdzanie rozmiaru pliku (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Plik jest za duży. Maksymalny rozmiar to 10MB');
      addAlert('Plik jest za duży. Maksymalny rozmiar to 10MB', 'error');
      return;
    }

    // Utwórz URL dla wybranego pliku i pokaż cropper
    const imageUrl = URL.createObjectURL(file);
    setCropperImage(imageUrl);
    setShowCropper(true);
};

const handleCropComplete = async (croppedBlob) => {
    const formData = new FormData();
    formData.append('file', croppedBlob, 'avatar.jpg');

    try {
      const response = await axios.post('http://localhost:3000/api/uploads/avatarUploads',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );

      if (response.data.avatar_id) {
        setAvatarId(response.data.avatar_id);
        setSelectedAvatar(''); // Czyszczę selectedAvatar, bo teraz używamy avatar_id
        setSuccess('Avatar został pomyślnie zaktualizowany');
        setTimeout(() => setSuccess(''), 3000);
        window.location.reload(true);
        addAlert('Avatar został pomyślnie zaktualizowany', 'success');
      }
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      setError('Nie udało się przesłać avatara');
      addAlert('Nie udało się przesłać avatara', 'error');
      setTimeout(() => setError(''), 3000);
    }
};
  const handleDeleteAvatar = (isChanging = false) => {
    // Sprawdzamy czy jest co usuwać
    if (!avatarId) {
      // Jeśli nie ma avatarId, a próbujemy zmienić avatar, po prostu kontynuujemy bez popupu
      if (isChanging) {
        confirmDeleteAvatar();
        return;
      }
      // Jeśli nie ma co usunąć i nie zmieniamy avatara, pokazujemy alert
      addAlert('Nie ma zdjęcia profilowego do usunięcia', 'info');
      return;
    }

    setDeleteAvatarMessage(isChanging
      ? "Zmiana Avatara równa jest z usunięciem zdjęcia profilowego"
      : "Czy na pewno chcesz usunąć swoje zdjęcie profilowe?");
    setShowDeleteAvatarConfirm(true);
  };
  const confirmDeleteAvatar = async () => {
  if (!avatarId) return;

  try {
    await axios.delete(`http://localhost:3000/api/uploads/${avatarId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`
      }
    });

    setAvatarId(null);
    if (user?.profile_picture) {
      setSelectedAvatar(user.profile_picture);
    }
    setSuccess('zdjęcie profilowe zostało pomyślnie usunięte');
    addAlert('Avatar został pomyślnie usunięty', 'success');
    window.location.reload(true);
    setTimeout(() => setSuccess(''), 3000);
  } catch (error) {
    console.error('Failed to delete avatar:', error);
    addAlert('Nie udało się usunąć avatara', 'error');
    setError('Nie udało się usunąć avatara');
    setTimeout(() => setError(''), 3000);
  } finally {
    setShowDeleteAvatarConfirm(false);
  }
};

  return (
    <div className="max-w-4xl mx-auto mt-8 p-4 md:p-6">
      <div className="bg-white rounded-3xl border-2 border-[#69DC9E] p-4 md:p-6">
        <div className="border-b-2 border-[#69DC9E] pb-6">
          <h2 className="text-lg md:text-xl mb-6 text-center md:text-left">Zdjęcie profilowe</h2>
          <div className="p-4 flex flex-col items-center">

            <div className="mb-4">
              {avatarId ? (
                <img
                  src={`http://localhost:3000/api/uploads/${avatarId}`}
                  alt="Current avatar"
                  className="w-32 h-32 rounded-full object-cover"
                />
              ) : selectedAvatar ? (
                <img
                  src={selectedAvatar}
                  alt="Current avatar"
                  className="w-32 h-32 rounded-full object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">Brak avatara</span>
                </div>
              )}
            </div>
            <div className="flex  gap-2">
              <button
                  onClick={() => setIsAvatarSelectorOpen(true)}
                  className="px-4 py-2 bg-[#69DC9E] text-black rounded-lg hover:bg-[#5bc78d]"
              >
                Zmień avatara
              </button>
              <label className="px-4 py-2 bg-[#F9CB40] text-black rounded-lg hover:bg-[#E1B83A] cursor-pointer">
                <span>Prześlij zdjęcie</span>
                <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                />
              </label>
              {avatarId && (
                <button
                  onClick={handleDeleteAvatar}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Usuń zdjęcie
                </button>
              )}
            </div>
            {isAvatarSelectorOpen && (
                <BottsAvatarSelector
                    onAvatarChange={handleAvatarChange}
                    onClose={() => setIsAvatarSelectorOpen(false)}
                    currentAvatar={selectedAvatar}

                />
            )}
          </div>
        </div>

        <div className="border-b-2 border-[#69DC9E] py-4 md:py-6">
          <h2 className="text-lg md:text-xl mb-2 text-center md:text-left">Nazwa użytkownika</h2>
          <div className="flex flex-col md:flex-row justify-between items-center md:items-center gap-2">
            {isEditingUsername ? (
                <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="flex-1 p-2 border rounded-md w-full md:w-auto text-center md:text-left"
                />
            ) : (
                <span className="break-all text-center md:text-left w-full md:w-auto">{formData.username}</span>
            )}
            <button
                onClick={() => setIsEditingUsername(!isEditingUsername)}
              className="bg-[#69DC9E] text-black px-4 py-1 rounded-md hover:bg-[#5bc78d] transition-colors"
            >
              {isEditingUsername ? 'Zapisz' : 'Edytuj'}
            </button>
          </div>
        </div>

        <div className="border-b-2 border-[#69DC9E] py-4 md:py-6">
          <h2 className="text-lg md:text-xl mb-2 text-center md:text-left">E-mail</h2>
          <div className="flex flex-col md:flex-row justify-between items-center md:items-center gap-2">
            {isEditingEmail ? (
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="flex-1 p-2 border rounded-md w-full md:w-auto text-center md:text-left"
              />
            ) : (
              <span className="break-all text-center md:text-left w-full md:w-auto">{formData.email}</span>
            )}
            <button
              onClick={() => setIsEditingEmail(!isEditingEmail)}
              className="bg-[#69DC9E] text-black px-4 py-1 rounded-md hover:bg-[#5bc78d] transition-colors"
            >
              {isEditingEmail ? 'Zapisz' : 'Edytuj'}
            </button>
          </div>
        </div>

        <div className="border-b-2 border-[#69DC9E] py-4 md:py-6">
          <h2 className="text-lg md:text-xl mb-2 text-center md:text-left">Typ Konta</h2>
          <div className="flex flex-col md:flex-row justify-between items-center md:items-center gap-2">
            <span className="text-center md:text-left w-full md:w-auto">{formData.accountType}</span>
            <div className="relative">
              <button
                onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                className="bg-[#69DC9E] text-black px-4 py-1 rounded-md hover:bg-[#5bc78d] transition-colors flex items-center"
              >
                {formData.accountType}
                <ArrowDown className="w-4 h-4 ml-2" />
              </button>
              {showTypeDropdown && (
                <div className="absolute right-0 mt-1 bg-white border rounded-md shadow-lg z-10">
                  {accountTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => handleTypeSelect(type)}
                      className="block w-full text-left px-4 py-2 hover:bg-[#69DC9E]/20 transition-colors"
                    >
                      {type}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border-b-2 border-[#69DC9E] py-4 md:py-6">
          <h2 className="text-lg md:text-xl mb-2 text-center md:text-left">Prywatność konta</h2>
          <div className="flex flex-col md:flex-row justify-between items-center md:items-center gap-2">
            <span className="text-center md:text-left w-full md:w-auto">{formData.privacy}</span>
            <div className="relative">
              <button
                onClick={() => setShowPrivacyDropdown(!showPrivacyDropdown)}
                className="bg-[#69DC9E] text-black px-4 py-1 rounded-md hover:bg-[#5bc78d] transition-colors flex items-center"
              >
                {formData.privacy}
                <ArrowDown className="w-4 h-4 ml-2" />
              </button>
              {showPrivacyDropdown && (
                <div className="absolute right-0 mt-1 bg-white border rounded-md shadow-lg z-10">
                  {privacyOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => handlePrivacySelect(option)}
                      className="block w-full text-left px-4 py-2 hover:bg-[#69DC9E]/20 transition-colors"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Password Change Section */}
        <div className="border-b-2 border-[#69DC9E] py-4 md:py-6">
          <h2 className="text-lg md:text-xl mb-2 text-center md:text-left">Hasło</h2>
          <div className="flex flex-col md:flex-row justify-between items-center md:items-center gap-2">
            <span className="break-all text-center md:text-left w-full md:w-auto">••••••••</span>
            <button
              onClick={() => setShowPasswordPopup(true)}
              className="bg-[#69DC9E] text-black px-4 py-1 rounded-md hover:bg-[#5bc78d] transition-colors"
            >
              Zmień hasło
            </button>
          </div>
        </div>

        {/* Delete Account Section */}
        <div className="pt-4 md:pt-6">
          <h2 className="text-lg md:text-xl mb-2 text-center md:text-left text-red-500">Niebezpieczna strefa</h2>
          <div className="flex flex-col md:flex-row justify-between items-center md:items-center gap-2">
            <span className="text-center md:text-left w-full md:w-auto">Usunięcie konta jest nieodwracalne</span>
            <button
              onClick={() => setShowDeleteAccountPopup(true)}
              className="bg-red-500 text-white px-4 py-1 rounded-md hover:bg-red-600 transition-colors"
            >
              Usuń konto
            </button>
          </div>
        </div>
        {showCropper && (
          <ImageCropper
            image={cropperImage}
            onCropComplete={(croppedBlob) => {
              setShowCropper(false);
              handleCropComplete(croppedBlob);
              URL.revokeObjectURL(cropperImage);
            }}
            onClose={() => {
              setShowCropper(false);
              URL.revokeObjectURL(cropperImage);
            }}
            type="avatar" // możesz to pominąć, bo 'avatar' jest domyślny
          />
        )}

        {/* Password Change Popup */}
        <DefaultPopup
          isOpen={showPasswordPopup}
          onClose={() => setShowPasswordPopup(false)}
          title="Zmiana hasła"
          maxWidth="sm"
        >
          <form onSubmit={handlePasswordChange} className="space-y-4">
            {error && <p className="text-red-500 text-center">{error}</p>}
            {success && <p className="text-green-500 text-center">{success}</p>}
            <div>
              <label className="block text-sm font-medium text-gray-700">Aktualne hasło</label>
              <input
                type="password"
                value={passwordForm.oldPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, oldPassword: e.target.value }))}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nowe hasło</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Potwierdź nowe hasło</label>
              <input
                type="password"
                value={passwordForm.confirmNewPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmNewPassword: e.target.value }))}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowPasswordPopup(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Anuluj
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-black bg-[#69DC9E] rounded-md hover:bg-[#5bc78d]"
              >
                Zmień hasło
              </button>
            </div>
          </form>
        </DefaultPopup>

        {/* Delete Account Popup */}
        <DefaultPopup
          isOpen={showDeleteAccountPopup}
          onClose={() => setShowDeleteAccountPopup(false)}
          title="Usuń konto"
          maxWidth="sm"
        >
          <form onSubmit={handleDeleteAccount} className="space-y-4">
            {error && <p className="text-red-500 text-center">{error}</p>}
            <p className="text-center text-gray-600">
              Ta operacja jest nieodwracalna. Proszę wprowadź swoje hasło, aby potwierdzić usunięcie konta.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700">Hasło</label>
              <input
                type="password"
                value={deleteAccountPassword}
                onChange={(e) => setDeleteAccountPassword(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteAccountPopup(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Anuluj
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600"
              >
                Usuń konto
              </button>
            </div>
          </form>
        </DefaultPopup>
        <DefaultPopup
          isOpen={showDeleteAvatarConfirm}
          onClose={() => setShowDeleteAvatarConfirm(false)}
          title="Usuń zdjęcie profilowe"
          maxWidth="sm"
          actions={
            <>
              <button onClick={() => setShowDeleteAvatarConfirm(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                Anuluj
              </button>
              <button onClick={confirmDeleteAvatar}
              className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600">
                Usuń zdjęcie
              </button>
            </>
          }
        >
          <p className="text-center">{deleteAvatarMessage}</p>
          <p className="text-center text-gray-500 mt-2">
            Ta akcja jest nieodwracalna.
          </p>
        </DefaultPopup>
      </div>
    </div>
  );
};

export default UserSettingsPage;