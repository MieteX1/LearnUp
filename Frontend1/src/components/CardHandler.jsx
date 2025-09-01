import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CardHandler = ({ collectionId, name }) => {
    const [cards, setCards] = useState([]); // Przechowywanie kart
    const [currentCardIndex, setCurrentCardIndex] = useState(0); // Index bieżącej karty
    const [isFlipped, setIsFlipped] = useState(false); // Stan obrotu karty
    const [error, setError] = useState(null); // Obsługa błędów
    const [loading, setLoading] = useState(true); // Stan ładowania

    useEffect(() => {
        const fetchCards = async () => {
        try {
            const response = await axios.get(
            `http://localhost:3000/api/card/collection/${collectionId}`
            );
            const filteredCards = response.data.filter((card) => card.name === name);
            setCards(filteredCards); // Zapisanie przefiltrowanych kart
        } catch (err) {
            console.error('Błąd podczas pobierania danych:', err);
            setError(err.message); // Obsługa błędów
        } finally {
            setLoading(false); // Wyłączenie ładowania
        }
        };

        fetchCards();
    }, [collectionId, name]);

    if (loading) {
        return <div className="text-center">Ładowanie danych...</div>;
    }

    if (error) {
        return <div className="text-red-500">Błąd: {error}</div>;
    }

    if (cards.length === 0) {
        return (
        <div className="text-gray-500">
            Brak kart pasujących do nazwy "{name}".
        </div>
        );
    }

    const currentCard = cards[currentCardIndex];

    const handleCardFlip = () => {
        setIsFlipped(!isFlipped); // Zmiana stanu obrotu
    };

    const handleNextCard = () => {
        setIsFlipped(false); // Resetowanie obrotu
        setCurrentCardIndex((prevIndex) =>
        prevIndex === cards.length - 1 ? 0 : prevIndex + 1
        );
    };

    const handlePrevCard = () => {
        setIsFlipped(false); // Resetowanie obrotu
        setCurrentCardIndex((prevIndex) =>
        prevIndex === 0 ? cards.length - 1 : prevIndex - 1
        );
    };

    return (
        <div className="flex flex-col items-center justify-center">
            <div
                className="w-1/2 h-80 bg-white border border-gray-300 rounded-md flex items-center justify-center text-xl font-semibold cursor-pointer relative"
                onClick={handleCardFlip}
                style={{
                    perspective: '1000px',
                    transformStyle: 'preserve-3d',
                    transition: 'transform 0.4s',
                    transform: isFlipped ? 'rotateY(360deg)' : 'none',
                }}
            >
                {isFlipped
                ? (
                    <>
                        {currentCard.side2.split(' ').map((word, index) => (
                            <span
                                key={index}
                                className="inline-block px-2 text-blue-600"
                            >
                                {word}
                            </span>
                        ))}
                        <div className="absolute bottom-2 left-0 right-0 text-center text-gray-500 text-xs">
                            Karta {currentCardIndex + 1} z {cards.length}
                        </div>
                    </>
                )
                : (
                    <>
                        {currentCard.side1.split(' ').map((word, index) => (
                            <span
                                key={index}
                                className="inline-block px-2 text-gray-800"
                            >
                                {word}
                            </span>
                        ))}
                        <div className="absolute bottom-2 left-0 right-0 text-center text-gray-500 text-xs">
                            Karta {currentCardIndex + 1} z {cards.length}
                        </div>
                    </>
                )}
            </div>

            <div className="mt-4 flex justify-between w-1/2">
                <button
                    onClick={handlePrevCard}
                    className="px-4 py-2 bg-gray-800 text-white rounded-md"
                >
                    Poprzednia
                </button>
                <button
                    onClick={handleNextCard}
                    className="px-4 py-2 bg-gray-800 text-white rounded-md"
                >
                    Następna
                </button>
            </div>
        </div>
    );
};

export default CardHandler;
