import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X } from 'lucide-react';

// Konfiguracje dla różnych typów
const CROP_CONFIGS = {
  avatar: {
    aspect: 1,
    cropShape: 'round',
    showGrid: false,
    title: 'Dostosuj zdjęcie profilowe',
    containerStyles: 'h-[300px]'
  },
  cover: {
    aspect: 4 / 3,
    cropShape: 'rect',
    showGrid: true,
    title: 'Dostosuj okładkę zbioru',
    containerStyles: 'h-[400px]'
  }
};

const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });

const getCroppedImg = async (imageSrc, pixelCrop, type = 'avatar') => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const COVER_WIDTH = 800;
  const COVER_HEIGHT = 600;

  if (type === 'cover') {
    canvas.width = COVER_WIDTH;
    canvas.height = COVER_HEIGHT;
  } else {
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
  }

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (type === 'cover') {
    // Obliczamy skalę, aby zachować proporcje i wypełnić cały obszar
    const scale = Math.max(COVER_WIDTH / pixelCrop.width, COVER_HEIGHT / pixelCrop.height);

    // Obliczamy nowe wymiary po przeskalowaniu
    const scaledWidth = pixelCrop.width * scale;
    const scaledHeight = pixelCrop.height * scale;

    // Obliczamy przesunięcie, aby wycentrować obraz
    const x = (COVER_WIDTH - scaledWidth) / 2;
    const y = (COVER_HEIGHT - scaledHeight) / 2;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      x,
      y,
      scaledWidth,
      scaledHeight
    );
  } else {
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      canvas.width,
      canvas.height
    );
  }

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/jpeg', 0.90);
  });
};

const ImageCropper = ({ image, onCropComplete, onClose, type = 'avatar' }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const config = CROP_CONFIGS[type];

  const handleCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = useCallback(async () => {
    try {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels, type);
      onCropComplete(croppedImage);
    } catch (e) {
      console.error(e);
    }
  }, [croppedAreaPixels, image, onCropComplete, type]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-4 w-[90%] max-w-lg relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>

        <h2 className="text-xl font-semibold mb-4 text-center">{config.title}</h2>

        <div className={`relative w-full mb-4 ${config.containerStyles}`}>
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={config.aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
            cropShape={config.cropShape}
            showGrid={config.showGrid}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Przybliżenie
          </label>
          <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-full hover:bg-gray-300"
          >
            Anuluj
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-[#69DC9E] text-black rounded-full hover:bg-[#5bc78d]"
          >
            Zapisz
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;