import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import { useAlert } from '../ui/Alert';

const RatingComponent = ({ collectionId, isSubscribed, currentRating }) => {
  const [hoveredRating, setHoveredRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);

  // Efekt do aktualizacji selectedRating gdy zmienia się currentRating
  useEffect(() => {
    if (currentRating) {
      setSelectedRating(currentRating);
    }
  }, [currentRating]);
  const queryClient = useQueryClient();
  const { addAlert } = useAlert();

  const handleRating = async (rating) => {
    if (!isSubscribed) {
      addAlert('Musisz być zapisany do zbioru, aby móc go ocenić', 'warning');
      return;
    }

    try {
      await axios.post(
        `http://localhost:3000/api/task-collection/rank/${collectionId}`,
        { points: rating },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );

      setSelectedRating(rating);
      addAlert('Dziękujemy za ocenę!', 'success');

      // Invalidate queries to refresh the data
      queryClient.invalidateQueries(['collection', collectionId]);
    } catch (error) {
      addAlert('Wystąpił błąd podczas oceniania', 'error');
      console.error('Error rating collection:', error);
    }
  };

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          onMouseEnter={() => setHoveredRating(rating)}
          onMouseLeave={() => setHoveredRating(0)}
          onClick={() => handleRating(rating)}
          disabled={!isSubscribed}
          className={`transition-colors ${!isSubscribed ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
        >
          <Star
            size={24}
            className={`${
              rating <= (hoveredRating || selectedRating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-none text-gray-300'
            } transition-colors`}
          />
        </button>
      ))}
    </div>
  );
};

export default RatingComponent;