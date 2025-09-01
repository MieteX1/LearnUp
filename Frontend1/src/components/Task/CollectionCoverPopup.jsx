import React from 'react';
import DefaultPopup from '../ui/DefaultPopup';
import CollectionCoverUploader from './CollectionCoverUploader';

const CollectionCoverPopup = ({ isOpen, onClose, collectionId, onSkip }) => {
  return (
    <DefaultPopup
      isOpen={isOpen}
      onClose={onClose}
      title="Dodaj okładkę do zbioru"
      maxWidth="sm"
      showCloseButton={false}
      actions={
        <>
          <button
            onClick={onSkip}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-full"
          >
            Pomiń
          </button>
          <CollectionCoverUploader
            collectionId={collectionId}
            onSuccess={() => {
              onClose();
              onSkip();
            }}
          />
        </>
      }
    >
      <div className="text-center">
        <div className="mb-6">
          <img
            src="/images/placeholder-photo.jpg"
            alt="Placeholder"
            className="w-48 h-48 mx-auto rounded-lg object-cover mb-4"
          />
          <p className="text-lg">
            Czy chcesz dodać własną okładkę do swojego zbioru zadań?
          </p>
        </div>
        <p className="text-gray-600">
          Możesz to zrobić teraz lub później w szczegółach zbioru.
        </p>
      </div>
    </DefaultPopup>
  );
};

export default CollectionCoverPopup;