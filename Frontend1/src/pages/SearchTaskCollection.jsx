import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import SearchCollectionItem from "../components/SearchCollectionItem"

const SearchTaskCollection = () => {
    const { line } = useParams();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/api/task-collection/search/${line}`);
                setResults(response.data);
            } catch (error) {
                console.error("Błąd pobierania wyników:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [line]);

    return (
        <div className="p-4 flex flex-col items-center mt-8">
            <h1 className="text-2xl font-bold text-center mb-4">
                Wyniki wyszukiwania dla: "{line}"
            </h1>
            {loading ? (
                <p>Ładowanie wyników...</p>
            ) : results.length > 0 ? (
                <ul className="w-3/5 mx-auto">
                    {results.map((item) => (
                        <SearchCollectionItem key={item.id} item={item} />
                    ))}
                </ul>
            ) : (
                <p>Brak wyników.</p>
            )}
        </div>
    );
};

export default SearchTaskCollection;
