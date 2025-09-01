import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
const AnswerHandler = ({ taskDetails, additionalData }) => {
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [userAnswerOptionIds, setUserAnswerOptionIds] = useState([]); // Zaznaczone odpowiedzi użytkownika
    const [allOptions, setAllOptions] = useState([]);
    const [selectedTitles, setSelectedTitles] = useState([]); // Indeksy zaznaczonych opcji
    const [correctAnswers, setCorrectAnswers] = useState([]); // Lista poprawnych odpowiedzi
    const [multiSelectEnabled, setMultiSelectEnabled] = useState(false); // Czy możliwy jest wybór wielu opcji
    const [openAnswer, setOpenAnswer] = useState(''); // Odpowiedź użytkownika dla typu open
    const [userTextAnswer, setUserTextAnswer] = useState(''); // Przechowuje istniejącą odpowiedź tekstową z bazy danych
    const [gapAnswer, setGapAnswer] = useState(''); // Odpowiedź użytkownika dla typu gap
    const [userGapAnswer, setUserGapAnswer] = useState(''); // Istniejąca odpowiedź w bazie danych
    const [matchPairs, setMatchPairs] = useState([]); // Obsługa par dla typu "match"
    const [shuffledRightColumn, setShuffledRightColumn] = useState([]);
    const [selectedPairs, setSelectedPairs] = useState([]); // Wybrane pary w zadaniu "match"
    const [selectedLeft, setSelectedLeft] = useState(null);
    const [selectedRight, setSelectedRight] = useState(null);
    const [userMatchAnswers, setUserMatchAnswers] = useState([]);
    const navigate = useNavigate();

    const getRandomColor = () =>
        `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Pobranie odpowiedzi użytkownika
                const userAnswerResponse = await axios.get(
                    `http://localhost:3000/api/answer/task?task=${taskDetails.id}&type=${taskDetails.type}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                        },
                    }
                );

                if (taskDetails.type === 'gap') {
                    const gapOptionsResponse = await axios.get(
                        `http://localhost:3000/api/gap-option/${taskDetails.id}`,
                        {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                            },
                        }
                    );
                
                    const correctAnswersList = gapOptionsResponse.data
                        .sort((a, b) => a.position - b.position)
                        .map((option) => option.answer);
                
                    setCorrectAnswers(correctAnswersList);
                
                    // Jeśli odpowiedzi użytkownika są dostępne
                        if (userAnswerResponse.data.length > 0) {
                            const gapAnswers = Array(correctAnswersList.length).fill('');
                            userAnswerResponse.data.forEach((answer) => {
                                gapAnswers[answer.position - 1] = answer.answer;
                            });
                            setUserGapAnswer(gapAnswers);
                        }

                        if (taskDetails.type === 'gap' && userAnswerResponse.data.length > 0) {
                            // Stwórz tablicę pustych odpowiedzi (tyle luk, ile jest w zadaniu)
                            const gapAnswers = Array(taskDetails.description.split('_').length - 1).fill('');
                            
                            // Wypełnij tablicę odpowiedzi użytkownika
                            userAnswerResponse.data.forEach((answer) => {
                                gapAnswers[answer.option_id - 1] = answer.answer; // `option_id` jest indeksowane od 1
                            });
                        
                            setUserGapAnswer(gapAnswers); // Ustaw odpowiedzi użytkownika w stanie
                        }
                }

                 // Pobranie wszystkich opcji odpowiedzi dla zadania typu "match"
            const optionsResponse = await axios.get(
                `http://localhost:3000/api/match-option/${taskDetails.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                }
            );

            const pairs = optionsResponse.data.map((match) => ({
                id: match.id,
                left: match.title,
                right: match.answer,
                color: getRandomColor(), // Dodanie losowego koloru do każdej pary
            }));
        
            // Mieszanie kolumny "Right"
            const shuffledPairs = [...pairs];
            for (let i = shuffledPairs.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffledPairs[i], shuffledPairs[j]] = [shuffledPairs[j], shuffledPairs[i]];
            }
        
            setMatchPairs(pairs); // Oryginalne pary do kolumny Left
            setShuffledRightColumn(shuffledPairs); // Pary z przetasowaną kolumną Right
        
        
            // Pobierz odpowiedzi dla każdej opcji w "match"
            const userAnswersPromises = pairs.map((pair) =>
                axios.get(
                    `http://localhost:3000/api/answer/task?task=${pair.id}&type=${taskDetails.type}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                        },
                    }
                )
            );
            const userAnswersResponses = await Promise.all(userAnswersPromises);
            const userAnswers = userAnswersResponses.map((response) => response.data);
            
            // Przetwórz odpowiedzi użytkownika
            const matchAnswers = userAnswers.flat().map((answer) => ({
                optionId: answer.option_id,
                matchId: answer.match_id,
            }));
            setUserMatchAnswers(matchAnswers);
                // Jeśli odpowiedź jest tekstowa (typu "open"), ustaw ją
                if (taskDetails.type === 'open' && userAnswerResponse.data.length > 0) {
                    setUserTextAnswer(userAnswerResponse.data[0]?.answer || '');
                }
                if (taskDetails.type === 'match' && userAnswerResponse.data.length > 0) {
                    setUserMatchAnswers(userAnswerResponse.data); // Przechowaj istniejące odpowiedzi
                }
                const userAnswers2 = userAnswerResponse.data.map((answer) => answer.option_id);
                setUserAnswerOptionIds(userAnswers2);
                // Pobranie wszystkich opcji odpowiedzi (jeśli dotyczy)
                if (taskDetails.type !== 'open' && taskDetails.type !== 'gap') {
                    const optionsResponse = await axios.get(
                        `http://localhost:3000/api/${taskDetails.type}-option/${taskDetails.id}`,
                        {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                            },
                        }
                    );
                    setAllOptions(optionsResponse.data || []);
                    if (taskDetails.type === 'match') {
                        // Obsługa danych dla typu "match"
                        const pairs = optionsResponse.data.map((match) => ({
                            id: match.id,
                            left: match.title,
                            right: match.answer,
                        }));
                        setMatchPairs(pairs);
                    } else {
                        const correctAnswersList = optionsResponse.data
                            .filter((match) => match.is_answer)
                            .map((match) => match.id);
                        setCorrectAnswers(correctAnswersList);
                        setMultiSelectEnabled(correctAnswersList.length > 1);
                    }
                }
            } catch (error) {
                console.error('Błąd podczas pobierania danych:', error);
            }
        };
        fetchData();
    }, [taskDetails.id, taskDetails.type]);

    const handleSelect = (id, column) => {
        if (column === 'left') {
            // Check if this left item already has a pair
            const existingPair = selectedPairs.find((pair) => pair.left === id);
    
            if (existingPair) {
                // Reset the pair if it exists
                setSelectedPairs((prev) =>
                    prev.filter((pair) => pair.left !== id) // Remove the pair
                );
            } else {
                // If no pair exists, select this left item
                if (selectedRight) {
                    const rightPair = shuffledRightColumn.find((pair) => pair.id === selectedRight);
                    // Ensure color is assigned correctly
                    setSelectedPairs((prev) => [
                        ...prev,
                        { left: id, right: selectedRight, color: rightPair?.color || 'defaultColor' },
                    ]);
                    setSelectedRight(null); // Reset the right selection
                } else {
                    setSelectedLeft(id); // Select this left item
                }
            }
        } else if (column === 'right') {
            // Check if this right item already has a pair
            const existingPair = selectedPairs.find((pair) => pair.right === id);
            const rightPair = shuffledRightColumn.find((pair) => pair.id === id);
    
            if (existingPair) {
                // Reset the pair if it exists
                setSelectedPairs((prev) =>
                    prev.filter((pair) => pair.right !== id) // Remove the pair
                );
            } else {
                // If no pair exists, select this right item
                if (selectedLeft) {
                    const leftPair = matchPairs.find((pair) => pair.id === selectedLeft);
                    // Ensure color is assigned correctly
                    setSelectedPairs((prev) => [
                        ...prev,
                        { left: selectedLeft, right: id, color: rightPair?.color || 'defaultColor' },
                    ]);
                    setSelectedLeft(null); // Reset the left selection
                } else {
                    setSelectedRight(id); // Select this right item
                }
            }
        }
    };
    
    // Obsługa zaznaczania i odznaczania opcji
    const toggleSelection = (index) => {
        if (multiSelectEnabled) {
            setSelectedTitles((prevSelected) =>
                prevSelected.includes(index)
                    ? prevSelected.filter((i) => i !== index) // Usuń zaznaczenie
                    : [...prevSelected, index] // Dodaj zaznaczenie
            );
        } else {
            setSelectedTitles([index]); // Jeśli wybór pojedynczy, tylko jedna opcja może być zaznaczona
        }
    };
    const toggleMatchPairSelection = (pairId) => {
        setSelectedPairs((prevSelected) =>
            prevSelected.includes(pairId)
                ? prevSelected.filter((id) => id !== pairId)
                : [...prevSelected, pairId]
        );
    };
    // Obsługa przesyłania odpowiedzi
    const handleAnswerSubmit = async (goNext = false) => {
        if (taskDetails.type === 'open' && !openAnswer.trim()) {
            setErrorMessage('Wpisz odpowiedź przed przesłaniem.');
            setTimeout(() => setErrorMessage(''), 5000);
            return;
        } else if (taskDetails.type === 'gap' && gapAnswer.some((answer) => !answer || !answer.trim())) {
            setErrorMessage('Wpisz odpowiedź przed przesłaniem.');
            setTimeout(() => setErrorMessage(''), 5000);
            return;
        } else if (
            taskDetails.type === 'match' &&
            selectedPairs.length === 0
        ) {
            setErrorMessage('Wybierz wszystkie pary przed przesłaniem odpowiedzi.');
            setTimeout(() => setErrorMessage(''), 5000);
            return;
        } else if (
            taskDetails.type !== 'open' &&
            taskDetails.type !== 'gap' &&
            taskDetails.type !== 'match' &&
            selectedTitles.length === 0
        ) {
            setErrorMessage('Wybierz co najmniej jedną opcję przed przesłaniem odpowiedzi.');
            setTimeout(() => setErrorMessage(''), 5000);
            return;
        }
        try {
            if (taskDetails.type === 'open') {
                const answerData = {
                    collection_id: taskDetails.collection_id,
                    answer: openAnswer, // Zmieniono z `answer_text` na `answer`
                    open_id: taskDetails.id,
                    type: taskDetails.type,
                    category: taskDetails.category,
                    name: taskDetails.name,
                };
                await axios.post('http://localhost:3000/api/answer/', answerData, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                });
                setUserTextAnswer(openAnswer); // Zapisanie odpowiedzi w stanie po przesłaniu
            } else if (taskDetails.type === 'gap') {
                // Iterujemy przez odpowiedzi w lukach
                for (let i = 0; i < gapAnswer.length; i++) {
                    const answerData = {
                        collection_id: taskDetails.collection_id,
                        gap_id: taskDetails.id,
                        option_id: i + 1, // Pozycja luki (indeks + 1)
                        answer: gapAnswer[i] || '', // Odpowiedź dla tej luki
                        type: taskDetails.type,
                        category: taskDetails.category,
                        name: taskDetails.name,
                    };
            
                    // Wysyłamy każdą odpowiedź jako osobny rekord
                    await axios.post('http://localhost:3000/api/answer/', answerData, {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                        },
                    });
                }
            
                setUserGapAnswer(gapAnswer); // Zapisanie odpowiedzi w stanie po przesłaniu
            } else if (taskDetails.type === 'match') {
                for (const pair of selectedPairs) {
                    await axios.post(
                        'http://localhost:3000/api/answer/',
                        {
                            collection_id: taskDetails.collection_id,
                            match_id: taskDetails.id,
                            answer_id: pair.left, 
                            option_id: pair.right, 
                            type: taskDetails.type,
                        },
                        {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                            },
                        }
                    );
                }
                setUserMatchAnswers(selectedPairs); // Zapisz wybrane odpowiedzi
            } else {
                for (const index of selectedTitles) {
                    const answerData = {
                        collection_id: taskDetails.collection_id,
                        option_id: additionalData[index].id,
                        test_id: taskDetails.id,
                        type: taskDetails.type,
                        category: taskDetails.category,
                        name: taskDetails.name,
                    };
                    await axios.post('http://localhost:3000/api/answer/', answerData, {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                        },
                        
                    });
                }
            }
            setSuccessMessage('Odpowiedzi zostały pomyślnie przesłane!');
            setTimeout(() => setSuccessMessage(''), 3000);
            if (goNext) {
                navigate(`/task-collection/${taskDetails.collection_id}`);
            } else {
                window.location.reload();
            }
        } catch (error) {
            console.error('Błąd podczas przesyłania odpowiedzi:', error);
            setErrorMessage('Wystąpił problem z przesłaniem odpowiedzi. Spróbuj ponownie.');
            setTimeout(() => setErrorMessage(''), 5000);
        }
    };
    return (
        <>
            {successMessage && (
                <div className="fixed top-28 left-1/2 transform -translate-x-1/2 bg-green-100 border border-green-500 text-green-700 px-6 py-4 rounded shadow-md text-center">
                    {successMessage}
                </div>
            )}
            {errorMessage && (
                <div className="fixed top-28 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-500 text-red-700 px-6 py-4 rounded shadow-md text-center">
                    {errorMessage}
                </div>
            )}

            {/* Wyświetlanie opcji odpowiedzi lub odpowiedzi tekstowej */}
                {taskDetails.type === 'open' ? (
                    userTextAnswer ? (
                        <div className="flex flex-col items-center mt-16 p-4 bg-gray-100 rounded-md border border-gray-300">
                            <p className="text-lg font-semibold">Twoja odpowiedź:</p>
                            <p className="mt-2 text-gray-700">{userTextAnswer}</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center mt-16">
                            <textarea
                                value={openAnswer}
                                onChange={(e) => setOpenAnswer(e.target.value)}
                                className="w-3/4 h-32 p-4 border border-gray-300 rounded-md"
                                placeholder="Wpisz swoją odpowiedź tutaj..."
                            />
                        </div>
                    )
                ) : taskDetails.type === 'gap' ? (
                    userGapAnswer ? (
                        <div className="flex flex-wrap items-center mt-16 gap-2 text-xl bg-white bg-opacity-90 p-4 rounded-md">
                            {taskDetails.description.split('_').map((part, index, array) => (
                                <React.Fragment key={index}>
                                    {part}
                                    {index < array.length - 1 && (
                                        <span className="flex items-center gap-2">
                                            {userGapAnswer[index] === correctAnswers[index] ? (
                                                <span className="font-semibold text-green-500">
                                                    {userGapAnswer[index] || 'Brak odpowiedzi'}
                                                </span>
                                            ) : (
                                                <>
                                                    <span className="font-semibold text-red-500 line-through">
                                                        {userGapAnswer[index] || 'Brak odpowiedzi'}
                                                    </span>
                                                    <span className="font-semibold text-green-500">
                                                        {correctAnswers[index] || 'Brak poprawnej odpowiedzi'}
                                                    </span>
                                                </>
                                            )}
                                        </span>
                                    )}
                                </React.Fragment>
                            ))}

                        </div>
                    ) : (
                        <div className="text-xl bg-white bg-opacity-90 p-4 rounded-md">
                            {taskDetails.description.split("|").map((line, lineIndex) => (
                                <div key={lineIndex} className="mb-4"> {/* Każda linia w nowym divie */}
                                {line.split("_").map((part, index, array) => (
                                    <React.Fragment key={index}>
                                    {part}
                                    {index < array.length - 1 && (
                                        <input
                                        type="text"
                                        value={gapAnswer[index] || ""}
                                        onChange={(e) => {
                                            const newAnswers = [...gapAnswer];
                                            newAnswers[index] = e.target.value;
                                            setGapAnswer(newAnswers);
                                        }}
                                        className="border border-gray-300 rounded-md p-2 w-40 mt-1"
                                        />
                                    )}
                                    </React.Fragment>
                                ))}
                                </div>
                            ))}
                        </div>
                    )
                ) : taskDetails.type === 'match' && matchPairs.length > 0 ? (
                    userMatchAnswers.length > 0 ? (
                        <div className="flex flex-col items-center mt-16 p-4">
                            {userMatchAnswers.map((answer, index) => {
                                const leftText = matchPairs.find((p) => p.id === answer.answer_id)?.left || 'Nieznane';
                                const userRightText = shuffledRightColumn.find((p) => p.id === answer.option_id)?.right || 'Nieznane';
                                const correctRightText = matchPairs.find((p) => p.id === answer.answer_id)?.right || 'Nieznane';
                                
                                const isCorrect = userRightText === correctRightText;
                
                                return (
                                    <div
                                        key={index}
                                        className={`p-2 rounded-md mb-2 border ${
                                            isCorrect ? 'bg-green-200 border-green-500' : 'bg-red-200 border-red-500'
                                        }`}
                                    >
                                        <p>
                                            {leftText} ➡️ {userRightText}
                                        </p>
                                        {!isCorrect && (
                                            <p className="text-sm text-gray-700">
                                                Poprawna odpowiedź: {correctRightText}
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center mt-16">
                            {/* Wyświetlanie kolumn */}
                            <div className="grid grid-cols-2 gap-8 w-3/4">
                                {/* Kolumna left */}
                                <div>
                                    {matchPairs.map((pair) => {
                                        const isMatched = selectedPairs.some((p) => p.left === pair.id);
                                        const matchedPair = selectedPairs.find((p) => p.left === pair.id);

                                        return (
                                            <div
                                                key={`left-${pair.id}`}
                                                onClick={() => handleSelect(pair.id, 'left')}
                                                className={`p-4 mb-2 border rounded-md text-center cursor-pointer ${
                                                    selectedLeft === pair.id ? 'bg-yellow-200' : 'bg-white'
                                                }`}
                                                style={{
                                                    borderColor: isMatched ? matchedPair?.color : 'gray',
                                                    borderWidth: isMatched ? '4px' : '2px', // Increase border size for matched items
                                                    color: isMatched ? matchedPair?.color : 'black',
                                                }}
                                            >
                                                {pair.left}
                                            </div>
                                        );
                                    })}
                                </div>

                                <div>
                                    {shuffledRightColumn.map((pair) => {
                                        const isMatched = selectedPairs.some((p) => p.right === pair.id);
                                        const matchedPair = selectedPairs.find((p) => p.right === pair.id);

                                        return (
                                            <div
                                                key={`right-${pair.id}`}
                                                onClick={() => handleSelect(pair.id, 'right')}
                                                className={`p-4 mb-2 border rounded-md text-center cursor-pointer ${
                                                    selectedRight === pair.id ? 'bg-yellow-200' : 'bg-white'
                                                }`}
                                                style={{
                                                    borderColor: isMatched ? matchedPair?.color : 'gray',
                                                    borderWidth: isMatched ? '4px' : '2px', // Increase border size for matched items
                                                    color: isMatched ? matchedPair?.color : 'black',
                                                }}
                                            >
                                                {pair.right}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                
                            {/* Wyświetlanie wybranych par */}
                            {/* <div className="mt-8">
                                <h3 className="text-lg font-semibold mb-4">Dopasowane pary:</h3>
                                <ul className="list-disc pl-6">
                                    {selectedPairs.map((pair, index) => {
                                        const leftPair = matchPairs.find((p) => p.id === pair.left);
                                        const rightPair = shuffledRightColumn.find((p) => p.id === pair.right);
                                        return (
                                            <li key={index} style={{ color: pair.color }}>
                                                {leftPair?.left} ➡️ {rightPair?.right}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div> */}
                        </div>
                    )
                ) : userAnswerOptionIds.length > 0 ? (
                    <div className="flex justify-center gap-8 mt-16 text-lg">
                        {allOptions.map((option) => (
                            <div
                                key={option.id}
                                className={`px-8 py-4 rounded-md ${
                                    correctAnswers.includes(option.id)
                                        ? 'bg-green-200 border-green-500'
                                        : userAnswerOptionIds.includes(option.id)
                                        ? 'bg-red-200 border-red-500'
                                        : 'bg-white border-gray-300'
                                } border`}
                            >
                                {option.title}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex justify-center gap-8 mt-16 text-lg">
                        {additionalData?.map((data, index) => (
                            <button
                                key={index}
                                onClick={() => toggleSelection(index)}
                                className={`px-8 py-4 rounded-md ${
                                    selectedTitles.includes(index)
                                        ? 'bg-yellow-200 border-yellow-400'
                                        : 'bg-white border-gray-300'
                                }`}
                            >
                                {data.title}
                            </button>
                        ))}
                    </div>
                )}

           {/* Przesyłanie odpowiedzi */}
                {!userTextAnswer && userAnswerOptionIds.length === 0 && userMatchAnswers.length === 0 && userGapAnswer.length === 0 && (
                    <div className="flex flex-col gap-4 mt-8">
                        <button
                            onClick={() => handleAnswerSubmit(false)}
                            className="bg-blue-500 text-white px-6 py-3 rounded-md"
                        >
                            Prześlij odpowiedź
                        </button>
                        <button
                            onClick={() => handleAnswerSubmit(true)}
                            className="bg-green-500 text-white px-6 py-3 rounded-md"
                        >
                            Prześlij odpowiedź i przejdź dalej
                        </button>
                    </div>
                )}

                {(userTextAnswer || userAnswerOptionIds.length > 0 || userMatchAnswers.length > 0 || userGapAnswer.length > 0) && (
                    <div>
                        <p className="text-center text-gray-500">
                            Odpowiedź została już przesłana.
                        </p>
                        <button 
                            onClick={() => navigate(`/collection/progress/${taskDetails.collection_id}`)}
                            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Zobacz postęp
                        </button>
                    </div>
                )}
            {/* <button 
                onClick={() => navigate(`/collection/progress/${taskDetails.collection_id}`)}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
                Zobacz postęp
            </button> */}
        </>
    );
};

export default AnswerHandler;