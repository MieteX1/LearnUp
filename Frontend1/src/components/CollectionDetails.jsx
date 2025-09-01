import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const getImageForType = (typeId) => {
    switch (typeId) {
        case 1:
            return '/images/default-task-type/math.png';
        case 2:
            return '/images/default-task-type/IT.png';
        case 3:
            return '/images/default-task-type/physics.png';
        case 4:
            return '/images/default-task-type/chemistry.png';
        default:
            return '/images/placeholder-photo.jpg';
    }
};

const CollectionDetails = ({ collectionId }) => {
    const { data: collectionDetails, isLoading, error } = useQuery({
        queryKey: ['collection', collectionId],
        queryFn: async () => {
            try {
                const response = await axios.get(`http://localhost:3000/api/task-collection/${collectionId}`);
                return response.data;
            } catch (err) {
                console.error('Błąd podczas pobierania szczegółów kolekcji:', err);
                throw new Error(err.response?.data?.message || err.message);
            }
        }
    });

    if (error) {
        return (
            <div className="text-center text-lg text-red-500">
                Wystąpił błąd podczas pobierania danych: {error.message}
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="text-center text-lg text-gray-500">
                Ładowanie szczegółów kolekcji...
            </div>
        );
    }

    const { name, type_id, photo_id, avgRank, _count } = collectionDetails;

    return (
        <div
            onClick={() => {
                window.location.href = `/task-collection/${collectionId}`;
            }}
            className="md:w-1/2 w-[90%] max-w-lg mx-auto mt-6 cursor-pointer">
            <div className="rounded-[25px] bg-gradient-to-br from-[#69DC9E] to-[#F9CB40] p-[4px] hover:opacity-95 transition-opacity">
                <div className="rounded-[25px] bg-[#F5F5F5] bg-opacity-80 hover:bg-opacity-95 transition-colors p-[20px] pt-[15px] pb-[5px]">
                    <img
                        src={photo_id ? `http://localhost:3000/api/uploads/${photo_id}` : getImageForType(type_id)}
                        alt="Placeholder"
                        className="w-full h-36 object-cover rounded-[25px]"
                    />
                    <h3 className="text-base sm:text-lg lg:text-xl text-center font-semibold mb-4 mt-2">
                        {name}
                    </h3>

                    <div className="flex justify-between items-center text-sm sm:text-base">
                        <span className="font-medium">Ocena:</span>
                        <span>{avgRank || 0}/5.0⭐</span>
                    </div>

                    <div className="flex justify-between items-center text-sm sm:text-base mb-2">
                        <span className="font-medium">Liczba ocen:</span>
                        <span>{_count?.rank || 0}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CollectionDetails;