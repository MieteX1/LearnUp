import React from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import {Link} from "react-router-dom";

const AuthorDetails = ({ author }) => {
    const { data: authorData, isLoading: isLoadingStats, error } = useQuery({
        queryKey: ['authorStats', author],
        queryFn: async () => {
            const response = await axios.get(`http://localhost:3000/api/task-collection/author/${author}`);
            return response.data;
        }
    });

    if (isLoadingStats) {
        return <p className="text-gray-500">Ładowanie danych autora...</p>;
    }

    if (error) {
        return <p className="text-red-500">Failed to load author data</p>;
    }

    if (!authorData) {
        return <p className="text-gray-500">Brak informacji o autorze.</p>;
    }

    return (
        <div>
            <h2 className="text-2xl font-bold mb-8 text-center">O autorze</h2>
            <div className="flex">
                {/* Avatar section */}
                <div className="w-3/10">
                    <Link to={`/profile/${author}`}>
                        {authorData.author.avatar_id ? (
                            <img
                                src={`http://localhost:3000/api/uploads/${authorData.author.avatar_id}`}
                                alt="Avatar autora"
                                className="w-32 h-32 rounded-full hover:opacity-80 transition-opacity"
                            />
                        ) : authorData.author.profile_picture ? (
                            <img
                                src={authorData.author.profile_picture}
                                alt="Avatar autora"
                                className="w-32 h-32 rounded-full hover:opacity-80 transition-opacity"
                            />
                        ) : (
                            <div className="w-32 h-32 bg-gray-300 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity">
                                <span className="text-gray-400">Brak avatara</span>
                            </div>
                        )}
                    </Link>
                </div>
                {/* Info section */}
                <div className="w-7/10 pl-4 mt-1">
                    <p>
                        <span className="font-bold text-right">Nazwa: </span>{' '}
                        <Link to={`/profile/${author}`} className="text-blue-500 hover:underline">
                            {authorData.author.login || 'Nieznany'}
                        </Link>
                    </p>
                    <p>
                        <span className="font-bold">Ocena twórcy: </span>{' '}
                        {authorData.statistics.average_rating.toFixed(1) || 'Brak ocen'}/5.0⭐
                    </p>
                    <p>
                        <span className="font-bold">Uczestników kursów: </span>{' '}
                        {authorData.statistics.total_subscribers}
                    </p>
                    <p>
                        <span className="font-bold">Liczba kursów: </span>{' '}
                        {authorData.statistics.total_collections}
                    </p>
                    <p>
                        <span className="font-bold">Dołączył: </span>{' '}
                        {new Date(authorData.author.created_at).getFullYear() || 'Nieznany'}r.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthorDetails;