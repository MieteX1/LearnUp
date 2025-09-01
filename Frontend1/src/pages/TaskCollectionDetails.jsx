import React, { useState } from 'react';
import { useParams, useNavigate, Navigate, Link } from 'react-router-dom';
import { Flag, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

// Komponenty
import CollectionDetails from '../components/CollectionDetails';
import AuthorDetails from '../components/AuthorDetails';
import FeedbackSection from '../components/comment/FeedbackSection.jsx';
import ReportTaskSetPopup from "../components/Reports/ReportTaskSet.jsx";
import TaskList from '../components/Task/TaskList.jsx';
import DefaultPopup from '../components/ui/DefaultPopup.jsx';
import { useAlert } from '../components/ui/Alert.jsx';
import Loading from '../components/ui/Loading';
import CollectionCoverUploader from "../components/Task/CollectionCoverUploader.jsx";
import RatingComponent from "../components/Task/RatingComponent.jsx";
const getImageForType = (typeId) => {
  switch (typeId) {
    case 1: return '/images/default-task-type/math.png';
    case 2: return '/images/default-task-type/IT.png';
    case 3: return '/images/default-task-type/physics.png';
    case 4: return '/images/default-task-type/chemistry.png';
    default: return '/images/placeholder-photo.jpg';
  }
};

const TaskCollectionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { addAlert } = useAlert();

  // Local state
  const [showReportTaskSet, setShowReportTaskSet] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);


  // Queries
  const { data: collection, isLoading: isLoadingCollection } = useQuery({
    queryKey: ['collection', id],
    queryFn: async () => {
      try {
        const { data } = await axios.get(`http://localhost:3000/api/task-collection/${id}`,{headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }});
        return data;
      } catch (error) {
        if (error.response?.status === 404) {
          return { error: 404 };
        }
        if (error.response?.status === 403) {
          return { error: 403 };
        }
        throw error;
      }
    }
  });
  const { data: collectionType } = useQuery({
    queryKey: ['collectionType', collection?.type_id],
    queryFn: async () => {
        try {
            const { data } = await axios.get(`http://localhost:3000/api/collection-type/${collection.type_id}`,{headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }});
            return data;
        } catch (error) {
            // W przypadku błędu 404, zwracamy domyślny obiekt typu
            if (error.response?.status === 404) {
                return {
                    id: collection.type_id,
                    name: 'Nieznany typ'
                };
            }
            throw error;
        }
    },
    enabled: !!collection?.type_id,
    // Dodajemy retry: false, aby nie próbować ponownie w przypadku 404
    retry: false
});

  const { data: userRating } = useQuery({
  queryKey: ['userRating', id, user?.id],
  queryFn: async () => {
    if (!user?.id) return null;
    try {
      const { data } = await axios.get(
        `http://localhost:3000/api/task-collection/rank/${id}/user/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );
      return data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },
  enabled: !!user?.id
});

  const { data: author } = useQuery({
    queryKey: ['author', collection?.author_id],
    queryFn: async () => {
      const { data } = await axios.get(`http://localhost:3000/api/user/${collection.author_id}`,{headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }});
      return data;
    },
    enabled: !!collection?.author_id
  });

  const { data: otherCollections } = useQuery({
    queryKey: ['authorCollections', collection?.author_id],
    queryFn: async () => {
      const { data } = await axios.post(
        'http://localhost:3000/api/task-collection/filter',{
          author: collection.author_id,
          limit: 3,
          best_first: true},
        {
            headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );
      return data.filter(c => c.id !== parseInt(id, 10)).slice(0, 2);
    },
    enabled: !!collection?.author_id
  });

  const { data: isSubscribed } = useQuery({
    queryKey: ['subscription', id],
    queryFn: async () => {
      const { data } = await axios.get(
        `http://localhost:3000/api/subscription/check/collection/${id}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        }
      );
      return data;
    }
  });

  const { data: participantCount } = useQuery({
    queryKey: ['participants', id],
    queryFn: async () => {
      const { data } = await axios.get(`http://localhost:3000/api/subscription/collection/${id}`,{headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }});
      return data.length;
    }
  });

  // Mutations
  const subscribeMutation = useMutation({
    mutationFn: async () => {
      await axios.post('http://localhost:3000/api/subscription', {
        collection_id: parseInt(id, 10),
        notification: true,
      },{headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }});
    },
    onSuccess: () => {
      setSuccess(true);
      queryClient.invalidateQueries(['subscription', id]);
      queryClient.invalidateQueries(['participants', id]);
      navigate(`/collection/progress/${id}`);
    },
    onError: (err) => {
      setError('Wystąpił błąd podczas zapisywania do kolekcji zadań.');
      setTimeout(() => setError(null), 3000);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await axios.patch(
        `http://localhost:3000/api/task-collection/delete/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        }
      );
    },
    onSuccess: () => {
      navigate('/');
    },
    onError: (error) => {
      console.error('Error deleting collection:', error);
    }
  });

  // Handlers
  const handleSubscribe = () => {
    subscribeMutation.mutate();
  };

  const handleDelete = () => {
        addAlert('Usunięcie zbioru jest nieodwracalne', 'warning');
        setShowDeleteConfirm(true);
    };

    const confirmDelete = () => {
        deleteMutation.mutate(undefined, {
            onSuccess: () => {
                addAlert('Zbiór zadań został pomyślnie usunięty.', 'success');
                setShowDeleteConfirm(false);
                navigate('/');
            },
            onError: (error) => {
                addAlert('Wystąpił błąd podczas usuwania zbioru zadań.', 'error');
                console.error('Error deleting collection:', error);
            }
        });
    };

  const handleNavigateToProgress = () => {
    navigate(`/collection/progress/${id}`);
  };

  if (isLoadingCollection) {
  return <Loading className="min-h-screen" />;
  }

  if (!collection || collection.error) {
    return <Navigate to={`/${collection?.error || 404}`} />;
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pl-PL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <>
      {/* Główny blok */}
      <div className="md:w-2/3 mx-auto mt-6 p-6 border-[3px] border-[#F9CB40] rounded-[25px] text-center bg-white bg-opacity-80 w-[95%]  ">
        {/* Nagłówek z kategorią */}
        <div className="flex justify-between items-center">
          <div className="text-left">
            <span className="font-bold">Kategoria: </span>
            {collectionType?.name || 'Nieznany typ'}
          </div>
          <div className="flex-col ">
              {(user?.role === 'admin' || user?.role === 'moderator' || user?.id === collection?.author_id) ? (
                <button
                  onClick={handleDelete}
                  className="flex items-center font-bold hover:underline space-x-2 text-red-500 mb-4"
                >
                  <Trash2 className="inline-block"/>
                  <span>Usuń zbiór</span>
                </button>
              ) : (
                <button
                  className="flex items-center font-bold hover:underline space-x-2"
                  onClick={() => setShowReportTaskSet(true)}
                >
                  <Flag className="inline-block"/>
                  <span>Zgłoś</span>
                </button>
              )}
              {user?.id === author?.id && (
                <Link
                  to={`/edit/task-collection/${id}`}
                  className="bg-[#F9CB40] hover:bg-[#E1B83A] text-black px-4 py-1 rounded-md transition-colors"
                >
                  Edytuj
                </Link>
              )}
          </div>
        </div>

        {/* Tytuł */}
        <h1 className="text-3xl font-bold my-4">{collection.name}</h1>

        {/* Podział na dwie kolumny */}
        <div className="flex justify-between">
          {/* Lewa kolumna */}
            <div className="w-7/10 pr-4 pl-8 space-y-2 text-left">
                {isSubscribed && (
                <div className="mt-4 flex items-center justify-between">
                    <div>
                        <span className="font-bold mr-2">Oceń zbiór: </span>
                        <RatingComponent
                          collectionId={collection.id}
                          isSubscribed={isSubscribed}
                          currentRating={userRating?.points}
                        />
                    </div>
                </div>
                )}
                <p>
                    <span className="font-bold">Średnia ocena: </span> {collection.avgRank || 0}/5.0⭐
                </p>
                <p>
                    <span className="font-bold">Liczba ocen: </span> {collection._count?.rank || 0}
                </p>
                <p>
                    <span className="font-bold">Liczba uczestników: </span> {participantCount}
                </p>
                <p>
                    <span className="font-bold">Autor: </span> {author?.login}
                </p>
                <p>
                    <span className="font-bold">Ostatnia aktualizacja: </span> {formatDate(collection.updated_at)}
                </p>
            </div>

            {/* Prawa kolumna */}
            <div className="w-3/10 flex flex-col justify-center items-center">
                <img
                    src={collection.photo_id
                        ? `http://localhost:3000/api/uploads/${collection.photo_id}`
                        : getImageForType(collection.type_id)}
                    alt="Obraz typu kolekcji"
                    className="w-full max-w-sm rounded-lg mb-4"
                />
                {user?.id === collection.author_id && (
                <CollectionCoverUploader
                  collectionId={id}
                  onSuccess={() => {
                    addAlert('Okładka została pomyślnie zaktualizowana', 'success');
                  }}
                />
              )}
              {user?.id === author?.id ? (
                  <button
                    onClick={handleNavigateToProgress}
                    className="w-full md:w-auto px-5 py-2 bg-[#F9CB40] hover:bg-[#E1B83A] text-black rounded-full text-base md:text-lg transition-colors text-center mt-4"
                  >
                    Przejdź do rozwiązywania zadań
                  </button>
                ) : isSubscribed ? (
                  <button
                    onClick={handleNavigateToProgress}
                    className="w-full md:w-auto px-5 py-2 bg-[#F9CB40] hover:bg-[#E1B83A] text-black rounded-full text-base md:text-lg transition-colors text-center mt-4"
                  >
                    Przejdź do rozwiązywania zadań
                  </button>
                ) : (
                  <button
                    onClick={handleSubscribe}
                    disabled={subscribeMutation.isPending}
                    className="w-full md:w-auto px-5 py-2 bg-[#F9CB40] hover:bg-[#E1B83A] text-black rounded-full text-base md:text-lg transition-colors text-center mt-4 disabled:opacity-50"
                  >
                    {subscribeMutation.isPending ? 'Zapisywanie...' : 'Zapisz się'}
                  </button>
                )}
          </div>
        </div>
      </div>

      {/* Success/Error notifications */}
      {error && (
        <div className="fixed top-4 mt-24 left-1/2 z-10 md:w-1/5 text-center w-3/5 transform -translate-x-1/2 bg-red-500 text-white px-6 py-4 rounded shadow-md">
          {error}
        </div>
      )}
      {success && (
        <div className="fixed top-4 mt-24 left-1/2 z-10 md:w-1/5 text-center w-3/5 transform -translate-x-1/2 bg-[#333333] border border-[#69DC9E] text-[#69DC9E] px-6 py-4 rounded shadow-md text-lg">
          Zapisano się do zbioru zadań!
        </div>
      )}

      {/* Sekcja autora i spisu treści */}
      <div className="md:w-3/5 mx-auto mt-12 flex justify-between w-[95%]">
        <div className="w-1/2">
          {author?.id && <AuthorDetails author={author.id}/>}
          <h2 className="text-2xl font-bold mt-8 text-center">Więcej kursów tego autora</h2>
          <div className="md:flex flex-grow justify-around gap-4 ">
            {otherCollections?.length > 0 ? (
              otherCollections.map((collection) => (
                <CollectionDetails key={collection.id} collectionId={collection.id}/>
              ))
            ) : (
              <p className="text-gray-500">Brak innych kolekcji do wyświetlenia.</p>
            )}
          </div>
        </div>

        <div className="w-1/2 pl-4">
          <h2 className="text-2xl font-bold mb-4 text-center">Spis treści</h2>
          <TaskList collectionId={id} />
        </div>
      </div>

      {/* Sekcja komentarzy */}
      <FeedbackSection collectionId={id} />

      {/* Popup reportowania */}
      {showReportTaskSet && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <ReportTaskSetPopup
            onClose={() => setShowReportTaskSet(false)}
            collectionId={parseInt(id, 10)}
            onSubmit={() => {
              setShowReportTaskSet(false);
            }}
          />
        </div>
      )}
    {/* Popup potwierdzenia usunięcia kolekcji */}
      <DefaultPopup
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          title="Potwierdź usunięcie zbioru"
          actions={
              <>
                  <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-full"
                  >
                      Anuluj
                  </button>
                  <button
                      onClick={confirmDelete}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full"
                  >
                      Usuń zbiór
                  </button>
              </>
          }
      >
          <p className="text-center">Czy na pewno chcesz usunąć ten zbiór zadań?</p>
          <p className="text-center text-gray-500 mt-2">
              Ta akcja jest nieodwracalna i spowoduje usunięcie wszystkich
              powiązanych zadań i postępów użytkowników.
          </p>
      </DefaultPopup>
    </>
  );
};

export default TaskCollectionDetails;