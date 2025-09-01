import React, { useEffect, useState } from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import axios from 'axios';
import TaskList from '../components/Task/TaskList.jsx';
import AnswerHandler from '../components/Task/AnswerHandler.jsx';
import CardHandler from '../components/CardHandler'; // Import komponentu dla "card"
import { useAuth } from '../context/AuthContext.jsx';
const TaskDetails = () => {
  const { id, type } = useParams(); // Pobranie id i typu zadania z URL
  const [taskDetails, setTaskDetails] = useState(null);
  const [additionalData, setAdditionalData] = useState(null); // Dane z dodatkowego endpointu
  const [loading, setLoading] = useState(true);
  const [additionalLoading, setAdditionalLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fisher-Yates Shuffle do losowego mieszania tablicy
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  useEffect(() => {
    const fetchTaskDetails = async () => {
      setLoading(true);

      try {
        // Sprawdzenie, czy typ zadania to "card"
        const endpoint = type === 'card' 
          ? `http://localhost:3000/api/card/${id}` 
          : `http://localhost:3000/api/task-${type}/${id}`;
        
        const response = await axios.get(endpoint);
        if (response.data) {
          setTaskDetails(response.data);

          // Sprawdzenie dostępu do kolekcji
          const collectionAuthor = await axios.get(`http://localhost:3000/api/task-collection/${response.data.collection_id}`);
          const haveAccess = await axios.get(`http://localhost:3000/api/subscription/check/collection/${response.data.collection_id}`);

          if (!(collectionAuthor.data.author_id === user.id) && !haveAccess.data) {
            console.log('Brak dostępu do kolekcji');
            console.log(collectionAuthor.data.author_id, user.id, haveAccess.data);
            navigate('/403');
            return;
          }

          // Fetch additional data tylko jeśli typ nie jest "card"
          if (type !== 'card') {
            await fetchAdditionalData(response.data.id, type);
          }
        } else {
          console.error('Nie znaleziono zadania.');
        }
      } catch (error) {
        console.error(`Błąd podczas pobierania szczegółów zadania:`, error);
      }
      setLoading(false);
    };

    const fetchAdditionalData = async (taskId, taskType) => {
      setAdditionalLoading(true);

      try {
        const endpoint = `http://localhost:3000/api/${taskType}-option/${taskId}`;
        const response = await axios.get(endpoint);
        if (response.data) {
          const shuffledData = shuffleArray(response.data); // Mieszanie danych
          setAdditionalData(shuffledData);
        } else {
          console.error('Nie znaleziono dodatkowych danych.');
        }
      } catch (error) {
        console.error(`Błąd podczas pobierania dodatkowych danych:`, error);
      }
      setAdditionalLoading(false);
    };

    fetchTaskDetails();
  }, [id, type, user, navigate]);

  if (loading) {
    return <div>Ładowanie szczegółów zadania...</div>;
  }

  if (!taskDetails) {
    return <div>Nie znaleziono zadania.</div>;
  }

  return (
    <>
      <div className="flex gap-6 mt-20">
        {/* Kolumna lewa */}
        <div className="flex flex-col gap-4 w-1/2 ml-[25%] mt-24">
          {/* Sekcja opisu z tłem */}
          {type !== 'gap' && type !== 'card' && ( // Ukrycie opisu, jeśli typ to "card"
            <div className="bg-white bg-opacity-90 p-4 rounded-md">
              <p className="text-center text-xl">{taskDetails.description}</p>
            </div>
          )}

          {/* Renderowanie AnswerHandler lub CardHandler w zależności od typu */}
          {type === 'card' ? (
            <CardHandler
              collectionId={taskDetails.collection_id}
              name={taskDetails.name}
            />
          ) : (
            <AnswerHandler
              taskDetails={taskDetails}
              additionalData={additionalData}
            />
          )}
        </div>

        {/* Kolumna prawa */}
        <div className="w-1/5 ml-[1.5%] text-sm">
          <TaskList collectionId={taskDetails.collection_id} viewType="progress" />
        </div>
      </div>
    </>
  );
};

export default TaskDetails;