import React, { useEffect, useState } from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import axios from 'axios';
import CircularProgress from '../components/CircularProgress';
import TaskList from '../components/Task/TaskList.jsx';
import {useAuth} from "../context/AuthContext.jsx";
const CollectionTaskProgress = () => {
  const { id } = useParams(); // Pobranie id kolekcji z URL
  const [collection, setCollection] = useState(null);
  const [collectionTypeName, setCollectionTypeName] = useState('');
  const [answeredPercent, setAnsweredPercent] = useState(0); // Zmieniona nazwa zmiennej
  const [tasks, setTasks] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCollectionDetails = async () => {
      try {
        // Pobranie szczegółów kolekcji


        const response = await axios.get(`http://localhost:3000/api/task-collection/${id}`);
        setCollection(response.data);

        const haveAccess = await axios.get (`http://localhost:3000/api/subscription/check/collection/${id}`);
        if (!response.data.author_id===user.id && !haveAccess.data) {
            console.log('Brak dostępu do kolekcji');
            navigate('/403');
        }

        const typeResponse = await axios.get(`http://localhost:3000/api/collection-type/${response.data.type_id}`);
        setCollectionTypeName(typeResponse.data.name);
      } catch (err) {
        console.error('Błąd podczas pobierania danych:', err);
      }
    };

    const fetchProgress = async () => {
      try {
        const progressResponse = await axios.get(`http://localhost:3000/api/task-collection/progress/${id}`);
        
        // Ustawienie wartości answered_percent, jeśli istnieje w odpowiedzi
        if (progressResponse.data && typeof progressResponse.data.answered_percent === 'number') {
          setAnsweredPercent(parseFloat(progressResponse.data.answered_percent.toFixed(2)));
        }
      } catch (err) {
        console.error('Błąd podczas pobierania postępu:', err);
      }
    };

    fetchCollectionDetails();
    fetchProgress();
  }, [id]);

  if (!collection) {
    return <div>Ładowanie...</div>;
  }

  return (
    <>
      {/* Główny blok */}
      <div className="w-2/3 mx-auto mt-6 p-6 rounded-[25px] text-center bg-white bg-opacity-60">
        {/* Nagłówek z kategorią */}
        <div className="flex justify-between items-center">
          <div className="text-left">
            <span className="font-bold">Kategoria: </span>
            {collectionTypeName}
          </div>
        </div>

        {/* Tytuł */}
        <h1 className="text-3xl font-bold my-4">{collection.name}</h1>

        {/* Podział na trzy kolumny */}
        <div className="flex mt-10">
          {/* Pierwsza kolumna */}
          <CircularProgress percentage={answeredPercent} />
          
          {/* Druga kolumna */}
          <div className="w-1/4 pr-4 pl-4 space-y-4 text-left">
            <p>
              <span className="font-bold">Ostatnio rozwiązywano: </span> ____________________
            </p>
            <p>
              <span className="font-bold">Ostatnio wykonane zadanie: </span> ____________________
            </p>
            <p>
              <span className="font-bold">Następne zadanie: </span> ____________________
            </p>
            {/* Przycisk "Następne zadanie" */}
            <div className="flex flex-col items-center">
              <button
                className="bg-[#69DC9E] text-black font-semibold py-2 px-16 rounded-[20px] hover:bg-[#5bc78d] transition mt-6"
              >
                Następne zadanie
              </button>
              {/* Tekst pod przyciskiem */}
              <p className="text-sm text-[#333333] mt-2">
                lub wybierz inne zadanie z listy
              </p>
            </div>
          </div>

          {/* Trzecia kolumna - Spis treści */}
          <div className="w-1/2 pl-4">
            <h2 className="text-xl font-bold mb-4 text-center">Lista zadań zbioru</h2>
            <TaskList collectionId={id} viewType="progress" />
          </div>
        </div>
      </div>
    </>
  );
};

export default CollectionTaskProgress;
