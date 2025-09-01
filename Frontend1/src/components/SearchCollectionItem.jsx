import React, { useEffect, useState } from "react"; 
import { Link } from "react-router-dom";
import axios from "axios";

const SearchCollectionItem = ({ item }) => {
    const [author, setAuthor] = useState("");
    const [collectionTypeName, setCollectionTypeName] = useState("Ładowanie...");

    // Obliczanie średniej oceny i liczby ocen
    const totalRatings = item.rank?.length || 0;
    const averageRank = totalRatings > 0 
        ? (item.rank.reduce((sum, r) => sum + r.points, 0) / totalRatings).toFixed(1) 
        : "Brak ocen";

    const getImageForType = (type_id) => {
        switch (type_id) {
            case 1: return '/images/default-task-type/math.png';
            case 2: return '/images/default-task-type/IT.png';
            case 3: return '/images/default-task-type/physics.png';
            case 4: return '/images/default-task-type/chemistry.png';
            default: return '/images/placeholder-photo.jpg';
        }
    };

    useEffect(() => {
        const fetchAuthor = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/api/user/${item.author_id}`);
                setAuthor(response.data); // Cały obiekt użytkownika
            } catch (error) {
                console.error("Błąd pobierania danych autora:", error);
            }
        };
    
        if (item.author_id) {
            fetchAuthor();
        }
    }, [item.author_id]);

    useEffect(() => {
        const fetchCollectionType = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/api/collection-type/${item.type_id}`);
                setCollectionTypeName(response.data.name);
            } catch (error) {
                console.error("Błąd pobierania nazwy typu kolekcji:", error);
                setCollectionTypeName("Nieznany typ");
            }
        };

        if (item.type_id) {
            fetchCollectionType();
        }
    }, [item.type_id]);

    return (
        <li className="border p-4 mt-2 rounded-[25px] shadow-md flex items-center justify-between bg-white bg-opacity-90 w-full">
            {/* Lewa strona - Zdjęcie kolekcji */}
            <div className="flex items-center gap-4">
                <img
                    src={item.photo_id ? `http://localhost:3000/api/uploads/${item.photo_id}` : getImageForType(item.type_id)} 
                    alt={item.name}
                    className="w-24 h-24 object-cover ml-1 rounded"
                />                

                {/* Środek - Nazwa, Typ, Autor */}
                <div>
                    <h2 className="text-lg font-semibold">{item.name}</h2>
                    <p className="text-gray-600 text-sm">Kategoria: {collectionTypeName}</p>
                    <div className="flex items-center gap-2 mt-4">
                    <img
                        src={author?.avatar_id 
                            ? `http://localhost:3000/api/uploads/${author.avatar_id}` 
                            : (author?.profile_picture || "/images/profilePicture.png")
                        }
                        alt={author?.login || "Avatar autora"}
                        className="w-8 h-8 rounded-full"
                    />
                        <p className="text-gray-600 text-sm">{author.login || "Ładowanie loginu..."}</p>
                    </div>
                </div>
            </div>

            {/* Prawa strona - Subskrybenci, Ocena, Przycisk */}
            <div className="flex items-center gap-6">
                <p className="text-gray-600 text-sm">Zapisanych użytkowników: {item.subscribers?.length || 0}</p>
                <p className="text-gray-600 text-sm">
                    Średnia ocena: {totalRatings > 0 ? `${averageRank}/5⭐ (${totalRatings} ocen)` : "Brak ocen"}
                </p>
                <Link 
                    to={`/task-collection/${item.id}`} 
                    className="text-white px-4 py-2 rounded-[25px] bg-[#69DC9E] hover:bg-[#5bc78d] transition"
                >
                    Zobacz kolekcję
                </Link>
            </div>
        </li>
    );
};

export default SearchCollectionItem;
