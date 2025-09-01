import React, { useState, useEffect } from 'react';
import DefaultPopup from '../../ui/DefaultPopup.jsx';
import {useAlert} from "../../ui/Alert.jsx";
const CollectionTypePopup = ({ isOpen, onClose, onSubmit, editingType }) => {
  const [name, setName] = useState('');
  const { addAlert } = useAlert();

  useEffect(() => {
    if (editingType) {
      setName(editingType.name);
    } else {
      setName('');
    }
  }, [editingType]);

  const handleSubmit = () => {
    onSubmit({ name });
    setName('');
    onClose();
  };

  return (
    <DefaultPopup
      isOpen={isOpen}
      onClose={onClose}
      title={editingType ? 'Edytuj typ kolekcji' : 'Dodaj nowy typ kolekcji'}
      maxWidth="md"
      actions={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-black rounded-3xl hover:bg-gray-300"
          >
            Anuluj
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-[#69DC9E] text-black rounded-3xl hover:bg-[#5bc78d]"
          >
            {editingType ? 'Zapisz zmiany' : 'Dodaj typ'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Nazwa typu
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#69DC9E] focus:border-[#69DC9E]"
            placeholder="Wprowadź nazwę typu kolekcji"
          />
        </div>
      </div>
    </DefaultPopup>
  );
};

export default CollectionTypePopup;