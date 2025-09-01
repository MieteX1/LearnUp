import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Upload } from 'lucide-react';
import axios from 'axios';
import ImageCropper from '../ImageCropper';

const CollectionCoverUploader = ({ collectionId, onSuccess }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  const handleImageSelect = (event) => {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target.result);
        setShowCropper(true);
      };
      reader.readAsDataURL(event.target.files[0]);
    }
  };

  const handleCropComplete = async (croppedImage) => {
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', croppedImage);

      await axios.post(
        `http://localhost:3000/api/uploads/CollectionCoverUploads/${collectionId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );

      queryClient.invalidateQueries(['collection', collectionId]);

      setShowCropper(false);
      setSelectedImage(null);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative">
      <input
        type="file"
        id="coverUpload"
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />
      <label
        htmlFor="coverUpload"
        className="flex items-center justify-center gap-2 px-4 py-2 bg-[#69DC9E] hover:bg-[#5bc78d] text-black rounded-full cursor-pointer transition-colors"
      >
        <Upload size={20} />
        {isUploading ? 'Przesyłanie...' : 'Zmień okładkę'}
      </label>

      {showCropper && selectedImage && (
        <ImageCropper
          image={selectedImage}
          onCropComplete={handleCropComplete}
          onClose={() => {
            setShowCropper(false);
            setSelectedImage(null);
          }}
          type="cover"
        />
      )}
    </div>
  );
};

export default CollectionCoverUploader;