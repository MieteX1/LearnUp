import React, { useState } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext.jsx';
import {useAlert} from "../ui/Alert.jsx";

// eslint-disable-next-line react/prop-types
const ReportCommentPopup = ({ onClose, evaluationId }) => {
  const [selectedReasons, setSelectedReasons] = useState([]);
  const [description, setDescription] = useState('');
  const { user } = useAuth();
  const {addAlert} = useAlert();
  const handleSubmit = async () => {
    const token = localStorage.getItem("accessToken");
    try {
      await axios.post('http://localhost:3000/api/comment-complaint', {
        appliciant_id: user.id,
        evaluation_id: evaluationId,
        justification: `${description} SelectedReasons: ${selectedReasons.join(', ')}`
      },{ headers: { Authorization: `Bearer ${token}` } });
        addAlert('Zgłoszenie zostało wysłane', 'success');
      onClose();
    } catch (error) {
      console.error('Error submitting comment complaint:', error);
        addAlert('Wystąpił błąd podczas wysyłania zgłoszenia', 'error');
    }
  };

  return (
    <div className="p-8 bg-[#69DC9E] rounded-3xl w-[500px] relative">
      <button onClick={onClose} className="absolute right-4 top-4">
        <X size={24} />
      </button>

      <h2 className="text-2xl mb-6">Zgłoś komentarz</h2>

      <div className="space-y-2">
        {[
          { id: 'offensive', label: 'Obraźliwy komentarz', desc: '– Komentarz zawiera wulgarne lub obraźliwe treści.' },
          { id: 'spam', label: 'Spam lub komentarz bez związku', desc: '– Komentarz nie odnosi się do zbioru zadań.' },
          { id: 'misleading', label: 'Fałszywe informacje', desc: '– Komentarz zawiera nieprawdziwe informacje.' },
          { id: 'rating', label: 'Nieuzasadniona ocena', desc: '– Ocena w komentarzu nie wydaje się być powiązana z jakością.' },
          { id: 'ads', label: 'Reklama lub treści zewnętrzne', desc: '– Komentarz zawiera reklamy lub linki zewnętrzne.' },
          { id: 'unreadable', label: 'Nieczytelny komentarz', desc: '– Komentarz jest chaotyczny lub trudny do zrozumienia.' },
          { id: 'other', label: 'Inny powód', desc: '– Opisz go poniżej' }
        ].map(({ id, label, desc }) => (
          <label key={id} className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-1 min-w-4"
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedReasons([...selectedReasons, label]);
                } else {
                  setSelectedReasons(selectedReasons.filter(reason => reason !== label));
                }
              }}
            />
            <span>
              <strong>{label}</strong>
              {desc}
            </span>
          </label>
        ))}
      </div>

      <div className="mt-6">
        <p className="mb-2">Opisz powód lub wpisz inny powód</p>
        <textarea
          className="w-full h-32 rounded-xl p-4 text-sm"
          placeholder="Tu wpisz opis"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <button
        onClick={handleSubmit}
        className="mt-4 px-6 py-2 bg-[#FF3B3B] text-white rounded-full float-right"
      >
        Wyślij zgłoszenie
      </button>
    </div>
  );
};

export default ReportCommentPopup;