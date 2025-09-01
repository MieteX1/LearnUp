import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const TaskLibrary = () => {
  const [displayLimit, setDisplayLimit] = useState(15);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch user collections
  const { data: collectionsData, isLoading } = useQuery({
    queryKey: ['userCollections'],
    queryFn: async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/task-collection/user-collections', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        return response.data;
      } catch (err) {
        console.error('Error fetching collections:', err);
        throw err;
      }
    }
  });

  // Subscribe mutation
  const queryClient = useQueryClient();
  const subscribeMutation = useMutation({
    mutationFn: async (collectionId) => {
      await axios.post('http://localhost:3000/api/subscription/', {
        collection_id: collectionId,
        notification: false
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userCollections']);
    }
  });

  // Filter collections based on search term
  const filteredOwnedCollections = useMemo(() => {
    if (!collectionsData?.owned) return [];
    return collectionsData.owned.filter(collection =>
      collection.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [collectionsData?.owned, searchTerm]);

  const filteredSubscribedCollections = useMemo(() => {
    if (!collectionsData?.subscribed) return [];
    return collectionsData.subscribed.filter(collection =>
      collection.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [collectionsData?.subscribed, searchTerm]);

  const getImageForType = (typeId) => {
    switch (typeId) {
      case 1: return '/images/default-task-type/math.png';
      case 2: return '/images/default-task-type/IT.png';
      case 3: return '/images/default-task-type/physics.png';
      case 4: return '/images/default-task-type/chemistry.png';
      default: return '/images/placeholder-photo.jpg';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#69DC9E]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[90%] mx-auto p-6">
      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative max-w-xl mx-auto">
          <input
            type="text"
            placeholder="Wyszukaj zbiór zadań..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 rounded-full border-2 border-[#69DC9E] focus:outline-none focus:border-[#5bc78d] transition-colors placeholder-gray-400"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Owned Collections */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center">Twoje Zbiory Zadań</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredOwnedCollections.length > 0 ? (
            filteredOwnedCollections.slice(0, displayLimit).map((collection) => (
              <Link
                key={collection.id}
                to={`/task-collection/${collection.id}`}
                className="block"
              >
                <div className="rounded-[25px] bg-gradient-to-br from-[#69DC9E] to-[#F9CB40] p-[4px] hover:opacity-95 transition-opacity">
                  <div className="rounded-[25px] bg-[#F5F5F5] bg-opacity-80 hover:bg-opacity-95 transition-colors p-6">
                    <img
                      src={getImageForType(collection.type_id)}
                      alt={collection.name}
                      className="w-full h-48 object-cover rounded-[25px] mb-4"
                    />
                    <h3 className="text-xl font-semibold mb-2">{collection.name}</h3>
                    <div className="flex justify-between text-sm">
                      <span>⭐ {(collection.avgRank || 0).toFixed(1)}/5</span>
                      <span>{collection._count.subscribers} zapisanych</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500">
              Nie posiadasz jeszcze żadnych zbiorów zadań
            </div>
          )}
        </div>
        {filteredOwnedCollections.length > displayLimit && (
          <div className="text-center mt-6">
            <button
              onClick={() => setDisplayLimit(prev => prev + 15)}
              className="bg-[#69DC9E] text-black px-6 py-2 rounded-full hover:bg-[#5bc78d] transition-colors"
            >
              Pokaż więcej
            </button>
          </div>
        )}
      </div>

      {/* Subscribed Collections */}
      <div>
        <h2 className="text-2xl font-bold mb-6 text-center">Zapisane Zbiory Zadań</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredSubscribedCollections.length > 0 ? (
            filteredSubscribedCollections.slice(0, displayLimit).map((collection) => (
              <Link
                key={collection.id}
                to={`/task-collection/${collection.id}`}
                className="block"
              >
                <div className="rounded-[25px] bg-gradient-to-br from-[#69DC9E] to-[#F9CB40] p-[4px] hover:opacity-95 transition-opacity">
                  <div className="rounded-[25px] bg-[#F5F5F5] bg-opacity-80 hover:bg-opacity-95 transition-colors p-6">
                    <img
                      src={getImageForType(collection.type_id)}
                      alt={collection.name}
                      className="w-full h-48 object-cover rounded-[25px] mb-4"
                    />
                    <h3 className="text-xl font-semibold mb-2">{collection.name}</h3>
                    <div className="flex justify-between text-sm">
                      <span>⭐ {collection.avgRank || 0}/5</span>
                      <span>{collection._count.subscribers} zapisanych</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500">
              Nie zapisałeś się jeszcze do żadnych zbiorów zadań
            </div>
          )}
        </div>
        {filteredSubscribedCollections.length > displayLimit && (
          <div className="text-center mt-6">
            <button
              onClick={() => setDisplayLimit(prev => prev + 15)}
              className="bg-[#69DC9E] text-black px-6 py-2 rounded-full hover:bg-[#5bc78d] transition-colors"
            >
              Pokaż więcej
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskLibrary;