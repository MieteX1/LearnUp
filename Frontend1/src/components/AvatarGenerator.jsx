import React, { useState, useEffect, useRef } from 'react';
import { createAvatar } from '@dicebear/core';
import { botttsNeutral } from '@dicebear/collection';
import { Paintbrush } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BottsAvatarSelector = ({ onAvatarChange, onClose, currentAvatar }) => {
  const [activeTab, setActiveTab] = useState('eyes');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [customColor, setCustomColor] = useState('69DC9E');
  const [avatarOptions, setAvatarOptions] = useState({
    seed: Math.random().toString(36).substring(7),
    backgroundColor: ['5e35b1'],
    eyes: ['bulging'],
    mouth: ['smile01'],
    rotate: 0,
    scale: 100,
    size: 85,
    radius: 50
  });
  const [avatarSvg, setAvatarSvg] = useState('');
  const [isUsingCustomColor, setIsUsingCustomColor] = useState(false);
  const colorPickerRef = useRef(null);
  const { user, updateUserProfile } = useAuth();

  useEffect(() => {
    // Jeśli istnieje currentAvatar, spróbuj wyciągnąć z niego parametry
    if (currentAvatar) {
      try {
        const url = new URL(currentAvatar);
        const params = new URLSearchParams(url.search);

        setAvatarOptions({
          seed: params.get('seed') || Math.random().toString(36).substring(7),
          backgroundColor: [params.get('backgroundColor') || '5e35b1'],
          eyes: [params.get('eyes') || 'bulging'],
          mouth: [params.get('mouth') || 'smile01'],
          rotate: parseInt(params.get('rotate')) || 0,
          scale: parseInt(params.get('scale')) || 100,
          size: 85,
          radius: 50
        });
      } catch (error) {
        console.error('Error parsing current avatar URL:', error);
      }
    }
  }, [currentAvatar]);

  useEffect(() => {
    updateAvatar(avatarOptions);
  }, [avatarOptions]);



  // Handler do zamykania color pickera przy kliknięciu na zewnątrz
  useEffect(() => {
    function handleClickOutside(event) {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target)) {
        setShowColorPicker(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // ... (pozostałe stałe - tabs, eyeOptions, mouthOptions, backgroundColors)
  const tabs = [
    { id: 'background', label: 'Tło' },
    { id: 'eyes', label: 'Oczy' },
    { id: 'mouth', label: 'Usta' },
    { id: 'customize', label: 'Dostosuj' }
  ];

  const eyeOptions = [
    'bulging', 'dizzy', 'eva', 'frame1', 'frame2', 'glow',
    'happy', 'hearts', 'robocop', 'round', 'roundFrame01',
    'roundFrame02', 'sensor', 'shade01'
  ];

  const mouthOptions = [
    'bite', 'diagram', 'grill01', 'grill02', 'grill03',
    'smile01', 'smile02', 'square01', 'square02'
  ];

  const backgroundColors = [
    '00acc1', '1e88e5', '5e35b1', '6d4c41', '7cb342',
    '8e24aa', '039be5', '43a047', '546e7a'
  ];

  useEffect(() => {
    updateAvatar(avatarOptions);
  }, [avatarOptions]);

  const updateAvatar = (options) => {
    const avatar = createAvatar(botttsNeutral, {
      ...options,
      size: 180
    });
    const svg = avatar.toString();
    setAvatarSvg(svg);
  };

  const handleOptionChange = (key, value) => {
    const newValue = ['backgroundColor', 'eyes', 'mouth'].includes(key) ? [value] : value;
    setAvatarOptions(prev => ({
      ...prev,
      [key]: newValue
    }));

    // Jeśli wybieramy predefiniowany kolor, wyłączamy tryb koloru niestandardowego
    // i zamykamy color picker
    if (key === 'backgroundColor' && backgroundColors.includes(value)) {
      setIsUsingCustomColor(false);
      setShowColorPicker(false);
    }
  };

  const handleCustomColorChange = (e) => {
    const color = e.target.value.substring(1);
    setCustomColor(color);
    setIsUsingCustomColor(true);
    handleOptionChange('backgroundColor', color);
  };

  const toggleCustomColor = () => {
    if (showColorPicker) {
      // Jeśli zamykamy color picker, wracamy do ostatniego wybranego koloru predefiniowanego
      if (isUsingCustomColor) {
        setIsUsingCustomColor(false);
        // Znajdź pierwszy kolor predefiniowany lub użyj domyślnego
        const defaultColor = backgroundColors[0];
        handleOptionChange('backgroundColor', defaultColor);
      }
    } else {
      setIsUsingCustomColor(true);
      handleOptionChange('backgroundColor', customColor);
    }
    setShowColorPicker(!showColorPicker);
  };


  const handleSave = async () => {
    const baseUrl = 'https://api.dicebear.com/9.x/bottts-neutral/svg';
    const params = new URLSearchParams({
      seed: avatarOptions.seed,
      eyes: avatarOptions.eyes[0],
      mouth: avatarOptions.mouth[0],
      rotate: avatarOptions.rotate.toString(),
      scale: avatarOptions.scale.toString(),
      backgroundColor: avatarOptions.backgroundColor[0],
    });

    const diceBearUrl = `${baseUrl}?${params.toString()}`;

    try {
      // Update the profile picture in the backend
      await updateUserProfile(user.id, {
        profile_picture: diceBearUrl
      });

      // Call the onAvatarChange callback
      onAvatarChange?.(diceBearUrl);
      onClose?.();
    } catch (error) {
      console.error('Failed to update avatar:', error);
    }
  };

  const generateOptionPreview = (options) => {
    const avatar = createAvatar(botttsNeutral, {
      ...options,
    });
    return avatar.toString();
  };

  // Reszta komponentu pozostaje bez zmian do sekcji z color pickerem
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl flex flex-col h-[90vh]">
        {/* Stały nagłówek z podglądem awatara */}
        <div className="p-6 border-b-2 border-[#69DC9E]">
          <div className="flex justify-center">
            <div
              dangerouslySetInnerHTML={{ __html: avatarSvg }}
            />
          </div>
        </div>

        {/* Stałe zakładki */}
        <div className="px-6 border-b-2 border-[#69DC9E]">
          <div className="flex flex-nowrap justify-center gap-2 ">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`px-3 py-2 text-sm md:text-base rounded-t-lg transition-colors ${
                  activeTab === tab.id 
                    ? 'text-black bg-[#69DC9E] font-medium' 
                    : 'text-gray-600 hover:text-black hover:bg-[#69DC9E]/20'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Przewijalna sekcja opcji */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'background' && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 justify-items-center">
              {/* Custom color picker button */}
              <div className="relative" ref={colorPickerRef}>
                <button
                  onClick={toggleCustomColor}
                  className={`aspect-square w-fit p-2 rounded-lg transition-all hover:bg-[#69DC9E]/10 hover:scale-105 ${
                    isUsingCustomColor ? 'ring-2 ring-[#69DC9E] bg-[#69DC9E]/20' : ''
                  }`}
                >
                  <div
                    className="w-full h-full relative"
                    dangerouslySetInnerHTML={{
                      __html: generateOptionPreview({
                        ...avatarOptions,
                        backgroundColor: [customColor]
                      })
                    }}
                  />
                  <Paintbrush
                    className="absolute bottom-1 right-1 text-black/70"
                    size={16}
                  />
                </button>
                {showColorPicker && (
                  <div className="absolute top-full left-0 mt-2 z-50 bg-white p-2 rounded-lg shadow-lg">
                    <input
                      type="color"
                      value={`#${customColor}`}
                      onChange={handleCustomColorChange}
                      className="w-20 h-10 cursor-pointer"
                    />
                  </div>
                )}
              </div>

              {/* Preset colors */}
              {backgroundColors.map((color) => {
                const previewSvg = generateOptionPreview({
                  ...avatarOptions,
                  backgroundColor: [color]
                });
                return (
                  <button
                    key={color}
                    onClick={() => handleOptionChange('backgroundColor', color)}
                    className={`aspect-square w-fit p-2 rounded-lg transition-all hover:bg-[#69DC9E]/10 hover:scale-105 ${
                      avatarOptions.backgroundColor[0] === color && !isUsingCustomColor ? 'ring-2 ring-[#69DC9E] bg-[#69DC9E]/20' : ''
                    }`}
                  >
                    <div
                      className="w-full h-full"
                      dangerouslySetInnerHTML={{ __html: previewSvg }}
                    />
                  </button>
                );
              })}
            </div>
          )}

          {activeTab === 'eyes' && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 justify-items-center">
              {eyeOptions.map((eye) => {
                const previewSvg = generateOptionPreview({
                  ...avatarOptions,
                  eyes: [eye]
                });
                return (
                  <button
                    key={eye}
                    onClick={() => handleOptionChange('eyes', eye)}
                    className={`aspect-square w-fit p-2 rounded-lg transition-all hover:bg-[#69DC9E]/10 hover:scale-105 ${
                      avatarOptions.eyes[0] === eye ? 'ring-2 ring-[#69DC9E] bg-[#69DC9E]/20' : ''
                    }`}
                  >
                    <div
                      className="w-full h-full"
                      dangerouslySetInnerHTML={{ __html: previewSvg }}
                    />
                  </button>
                );
              })}
            </div>
          )}

          {activeTab === 'mouth' && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 justify-items-center">
              {mouthOptions.map((mouth) => {
                const previewSvg = generateOptionPreview({
                  ...avatarOptions,
                  mouth: [mouth]
                });
                return (
                  <button
                    key={mouth}
                    onClick={() => handleOptionChange('mouth', mouth)}
                    className={`aspect-square w-fit p-2 rounded-lg transition-all hover:bg-[#69DC9E]/10 hover:scale-105 ${
                      avatarOptions.mouth[0] === mouth ? 'ring-2 ring-[#69DC9E] bg-[#69DC9E]/20' : ''
                    }`}
                  >
                    <div
                      className="w-full h-full"
                      dangerouslySetInnerHTML={{ __html: previewSvg }}
                    />
                  </button>
                );
              })}
            </div>
          )}

          {activeTab === 'customize' && (
            <div className="space-y-6 px-4 max-w-lg mx-auto">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Obrót ({avatarOptions.rotate}°)</span>
                  <span className="text-[#69DC9E]">{avatarOptions.rotate}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={avatarOptions.rotate}
                  onChange={(e) => handleOptionChange('rotate', parseInt(e.target.value))}
                  className="w-full accent-[#69DC9E]"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Skala ({avatarOptions.scale}%)</span>
                  <span className="text-[#69DC9E]">{avatarOptions.scale}%</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="200"
                  value={avatarOptions.scale}
                  onChange={(e) => handleOptionChange('scale', parseInt(e.target.value))}
                  className="w-full accent-[#69DC9E]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Stałe przyciski akcji */}
        <div className="p-6 border-t-2 border-[#69DC9E]">
          <div className="flex justify-center gap-4">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-black rounded-3xl hover:bg-gray-300 transition-colors"
            >
              Anuluj
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-[#69DC9E] text-black rounded-3xl hover:bg-[#5bc78d] transition-colors"
            >
              Zapisz awatar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BottsAvatarSelector;