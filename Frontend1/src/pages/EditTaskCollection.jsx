import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import PopupTaskEditor from "../components/Task/PopupTaskEditor";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const EditTaskCollection = () => {
    const [name, setName] = useState("");
    const [isPublic, setIsPublic] = useState(true);
    const [typeId, setTypeId] = useState("");
    const [collectionTypes, setCollectionTypes] = useState([]);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [categories, setCategories] = useState([]);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [currentTask, setCurrentTask] = useState(null);
    const [deletedTasks, setDeletedTasks] = useState([]);
    const { id } = useParams();
    const [editedTask, setEditedTask] = useState({
        name: "",
        type: "",
        content: "",
        singleCorrectAnswer: "",
        singleWrongAnswers: ["", "", ""],
        multipleCorrectAnswers: [""],
        multipleWrongAnswers: [""],
        leftPart: [""],
        rightPart: [""],
        difficulty: "",
        description: "",
    });
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
    const fetchData = async () => {
        try {
            const [collectionResponse, tasksResponse, typesResponse] = await Promise.all([
                axios.get(`http://localhost:3000/api/task-collection/${id}`),
                axios.get(`http://localhost:3000/api/task-collection/tasks/${id}`),
                axios.get('http://localhost:3000/api/collection-type')
            ]);
            if (collectionResponse.data.author_id !== user.id) {
                navigate('/403');
            }

            const collectionData = collectionResponse.data;
            let tasksData = tasksResponse.data;

            setName(collectionData.name);
            setIsPublic(collectionData.is_public);
            setTypeId(collectionData.type_id);
            setCollectionTypes(typesResponse.data);

            // Dodaj unikalne clientId do każdego zadania
            tasksData = tasksData.map(task => ({
                ...task,
                clientId: `${task.id}-${Math.random().toString(36).substring(2, 9)}`
            }));

            // Grupowanie zadań typu "card" według nazwy
            const cardTasks = tasksData.filter(task => task.type === "card");
            const groupedCards = cardTasks.reduce((acc, task) => {
                if (!acc[task.name]) {
                    acc[task.name] = {
                        ...task,
                        leftPart: [],
                        rightPart: [],
                        clientId: `card-${task.name}-${Math.random().toString(36).substring(2, 9)}`
                    };
                }
                acc[task.name].ids = [...(acc[task.name].ids || []), task.id]; // Lista ID
                return acc;
            }, {});

            await Promise.all(
                Object.values(groupedCards).map(async (card) => {
                    for (const id of card.ids) {
                        const response = await axios.get(`http://localhost:3000/api/card/${id}`);
                        card.leftPart.push(response.data.side1);
                        card.rightPart.push(response.data.side2);
                    }
                })
            );

            // Filtrujemy, aby zostawić tylko unikalne "card" i dodajemy je do innych kategorii
            const mergedTasks = Object.values(groupedCards);
            tasksData = [...tasksData.filter(task => task.type !== "card"), ...mergedTasks];

            // Organizowanie zadań według kategorii
            const organizedCategories = tasksData.reduce((acc, task) => {
                const categoryIndex = acc.findIndex(c => c.name === task.category);
                if (categoryIndex > -1) {
                    acc[categoryIndex].tasks.push(task);
                } else {
                    acc.push({
                        id: `category-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                        name: task.category,
                        tasks: [task]
                    });
                }
                return acc;
            }, []);

            setCategories(organizedCategories);
        } catch (err) {
            setError('Nie udało się pobrać danych zbioru.');
        }
    };

    fetchData();
}, [id]);


    const handleAddCategory = () => {
        setCategories([
        ...categories,
        { id: Date.now(), name: "", tasks: [] },
        ]);
    };

    const handleCategoryNameChange = (id, newName) => {
        setCategories(
        categories.map((category) =>
            category.id === id ? { ...category, name: newName } : category
        )
        );
    };

    const handleAddTask = (categoryId) => {
        const newTask = {
            id: Date.now(),
            isNew: true, // Nowa właściwość
            name: "Nowe zadanie",
            type: "Test jednokrotnego wyboru",
            content: "",
            singleCorrectAnswer: "",
            singleWrongAnswers: ["", "", ""],
            multipleCorrectAnswers: [""],
            multipleWrongAnswers: [""],
            leftPart: [""],
            rightPart: [""],
            difficulty: "easy",
            description: "",
        };

        setCategories((prevCategories) =>
        prevCategories.map((category) =>
            category.id === categoryId
            ? {
                ...category,
                tasks: [...category.tasks, newTask],
                }
            : category
        )
        );

        setCurrentTask({ ...newTask, categoryId });
        setEditedTask({ ...newTask });
        setIsPopupOpen(true);
    };

    const taskTypeMap = {
        test: "Test jednokrotnego wyboru",
        match: "Dopasowanie",
        open: "Otwarte",
        gap: "Uzupełnij lukę",
        card: "Fiszki",
    };

    const handleEditTask = async (task, categoryId) => {
        setCurrentTask({ ...task, categoryId });
        setEditedTask({
            name: task.name || "",
            type: taskTypeMap[task.type] || task.type || "",
            content: task.content || "",
            singleCorrectAnswer: task.singleCorrectAnswer || "",
            singleWrongAnswers: task.singleWrongAnswers || ["", "", ""],
            multipleCorrectAnswers: task.multipleCorrectAnswers || [""],
            multipleWrongAnswers: task.multipleWrongAnswers || [""],
            leftPart: task.leftPart || [""],
            rightPart: task.rightPart || [""],
            difficulty: task.difficulty || "",
            description: task.description || "",
        });

        try {
            // Pobranie opcji dla typów test, match, gap
            if (["test", "match", "gap"].includes(task.type)) {
                const response = await axios.get(`http://localhost:3000/api/${task.type}-option/${task.id}`);
                const options = response.data;

                if (task.type === "test") {
                    const correctAnswers = options.filter(opt => opt.is_answer).map(opt => opt.title);
                    const wrongAnswers = options.filter(opt => !opt.is_answer).map(opt => opt.title);

                    if (correctAnswers.length > 1) {
                        task.type = "Test wielokrotnego wyboru";
                        setEditedTask(prev => ({
                            ...prev,
                            type: "Test wielokrotnego wyboru",
                            multipleCorrectAnswers: correctAnswers.length ? correctAnswers : [""],
                            multipleWrongAnswers: wrongAnswers.length ? wrongAnswers : [""],
                        }));
                    } else {
                        setEditedTask(prev => ({
                            ...prev,
                            singleCorrectAnswer: correctAnswers[0] || "",
                            singleWrongAnswers: wrongAnswers.length ? wrongAnswers : ["", "", ""],
                        }));
                    }
                }

                if (task.type === "match") {
                    setEditedTask(prev => ({
                        ...prev,
                        leftPart: options.map(opt => opt.title) || [""],
                        rightPart: options.map(opt => opt.answer) || [""],
                    }));
                }

                if (task.type === "gap") {
                    setEditedTask(prev => ({
                        ...prev,
                        leftPart: options.map(opt => opt.title) || [""],
                        rightPart: options.map(opt => opt.answer) || [""],
                    }));
                }

                if (task.type === "card") {
                    const response = await axios.get(`http://localhost:3000/api/card/${task.id}`);
                    taskDescription = response.data.description;
                }

            }

            // Pobranie opisu zadania
            let taskDescription = "";
            if (task.type !== "card") {
                const response = await axios.get(`http://localhost:3000/api/task-${task.type}/${task.id}`);
                taskDescription = response.data.description;
            } else {
                const response = await axios.get(`http://localhost:3000/api/card/${task.id}`);
                taskDescription = response.data.description;
            }

            setEditedTask(prevTask => ({
                ...prevTask,
                content: taskDescription,
            }));
        } catch (err) {
            console.error("Error fetching task details:", err);
        }

        setIsPopupOpen(true);
    };

    const handlePopupClose = () => {
        setIsPopupOpen(false);
        setCurrentTask(null);
    };

    const handlePopupSave = () => {
        const updatedCategories = categories.map((category) =>
        category.id === currentTask.categoryId
            ? {
                ...category,
                tasks: category.tasks.map((task) =>
                task.id === currentTask.id
                    ? { ...task, ...editedTask }
                    : task
                ),
            }
            : category
        );
        setCategories(updatedCategories);
        handlePopupClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("accessToken");

        try {

            const uniqueDeletedTasks = Array.from(new Map(deletedTasks.map(task => [task.id, task])).values());

            await Promise.all(
                uniqueDeletedTasks.map(({ id, type }) => {
                    const endpoint = type === "card"
                        ? `http://localhost:3000/api/card/${id}`
                        : `http://localhost:3000/api/task-${type}/${id}`;

                    return axios.delete(endpoint, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                })
            );
            
        // Sprawdzenie, czy to aktualizacja, czy tworzenie nowego zbioru
        const collectionResponse = id
            ? await axios.patch(
                `http://localhost:3000/api/task-collection/${id}`,
                { name, is_public: isPublic, type_id: parseInt(typeId, 10) },
                { headers: { Authorization: `Bearer ${token}` } }
                )
            : await axios.post(
                "http://localhost:3000/api/task-collection",
                { name, is_public: isPublic, type_id: parseInt(typeId, 10) },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const collectionId = id || collectionResponse.data.id;

        // Globalny numer porządkowy dla wszystkich zadań
        let globalOrder = 1;

        // Iteracja przez kategorie i ich zadania
        for (const category of categories) {
            for (const task of category.tasks) {
                const taskPayload = {
                    collection_id: parseInt(collectionId, 10),
                    name: task.name,
                    description: task.content,
                    category: category.name,
                    difficulty: task.difficulty,
                    order_: globalOrder,
                    ...(task.type === "Uzupełnij lukę" && { text: task.content })
                };

            // Funkcja do mapowania wartości na klucz
            const getTaskTypeKey = (value) => {
                if (value === "Test jednokrotnego wyboru" || value === "Test wielokrotnego wyboru") {
                    return "test";
                }
                return Object.keys(taskTypeMap).find(key => taskTypeMap[key] === value) || value;
            };

            if (!task.isNew) {
                // Aktualizacja istniejącego zadania
                const updateEndpoint = task.type === "card"
                    ? `http://localhost:3000/api/card/${task.id}`
                    : `http://localhost:3000/api/task-${getTaskTypeKey(task.type)}/${task.id}`;

                await axios.patch(updateEndpoint, taskPayload, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Aktualizacja odpowiedzi dla testów, luk i dopasowań
                if (task.type === "Test jednokrotnego wyboru") {
                    const existingOptionsResponse = await axios.get(`http://localhost:3000/api/test-option/${task.id}`);
                    const existingOptions = existingOptionsResponse.data;

                    const updatedOptions = [
                        { title: task.singleCorrectAnswer, is_answer: true },
                        ...task.singleWrongAnswers.map((answer) => ({ title: answer, is_answer: false }))
                    ];

                    for (let i = 0; i < updatedOptions.length; i++) {
                        if (existingOptions[i]) {
                            await axios.patch(`http://localhost:3000/api/test-option/${existingOptions[i].id}`, {
                                test_id: task.id,
                                title: updatedOptions[i].title,
                                is_answer: updatedOptions[i].is_answer
                            }, { headers: { Authorization: `Bearer ${token}` } });
                        } else {
                            await axios.post(`http://localhost:3000/api/test-option`, {
                                test_id: task.id,
                                title: updatedOptions[i].title,
                                is_answer: updatedOptions[i].is_answer
                            }, { headers: { Authorization: `Bearer ${token}` } });
                        }
                    }
                } else if (task.type === "Test wielokrotnego wyboru") {
                    const existingOptionsResponse = await axios.get(`http://localhost:3000/api/test-option/${task.id}`);
                    const existingOptions = existingOptionsResponse.data;

                    const updatedOptions = [
                        ...task.multipleCorrectAnswers.map((answer) => ({ title: answer, is_answer: true })),
                        ...task.multipleWrongAnswers.map((answer) => ({ title: answer, is_answer: false }))
                    ];

                    for (let i = 0; i < updatedOptions.length; i++) {
                        if (existingOptions[i]) {
                            await axios.patch(`http://localhost:3000/api/test-option/${existingOptions[i].id}`, {
                                test_id: task.id,
                                title: updatedOptions[i].title,
                                is_answer: updatedOptions[i].is_answer
                            }, { headers: { Authorization: `Bearer ${token}` } });
                        } else {
                            await axios.post(`http://localhost:3000/api/test-option`, {
                                test_id: task.id,
                                title: updatedOptions[i].title,
                                is_answer: updatedOptions[i].is_answer
                            }, { headers: { Authorization: `Bearer ${token}` } });
                        }
                    }
                } else if (task.type === "Uzupełnij lukę") {
                    const existingOptionsResponse = await axios.get(`http://localhost:3000/api/gap-option/${task.id}`);
                    const existingOptions = existingOptionsResponse.data;

                    const gapOptions = task.rightPart.map((answer, index) => ({
                        answer,
                        position: index + 1
                    }));

                    for (let i = 0; i < gapOptions.length; i++) {
                        if (existingOptions[i]) {
                            await axios.patch(`http://localhost:3000/api/gap-option/${existingOptions[i].id}`, {
                                gap_id: task.id,
                                answer: gapOptions[i].answer,
                                position: gapOptions[i].position
                            }, { headers: { Authorization: `Bearer ${token}` } });
                        } else {
                            await axios.post(`http://localhost:3000/api/gap-option`, {
                                gap_id: task.id,
                                answer: gapOptions[i].answer,
                                position: gapOptions[i].position
                            }, { headers: { Authorization: `Bearer ${token}` } });
                        }
                    }
                } else if (task.type === "Dopasowanie") {
                    const existingOptionsResponse = await axios.get(`http://localhost:3000/api/match-option/${task.id}`);
                    const existingOptions = existingOptionsResponse.data;

                    const matchOptions = task.leftPart.map((title, index) => ({
                        title,
                        answer: task.rightPart[index]
                    }));

                    for (let i = 0; i < matchOptions.length; i++) {
                        if (existingOptions[i]) {
                            await axios.patch(`http://localhost:3000/api/match-option/${existingOptions[i].id}`, {
                                match_id: task.id,
                                title: matchOptions[i].title,
                                answer: matchOptions[i].answer
                            }, { headers: { Authorization: `Bearer ${token}` } });
                        } else {
                            await axios.post(`http://localhost:3000/api/match-option`, {
                                match_id: task.id,
                                title: matchOptions[i].title,
                                answer: matchOptions[i].answer
                            }, { headers: { Authorization: `Bearer ${token}` } });
                        }
                    }
                }
            } else {
               // Tworzenie nowego zadania (POST)
                const endpoint = task.type === "card"
                ? `http://localhost:3000/api/card`
                : `http://localhost:3000/api/task-${getTaskTypeKey(task.type)}`;

                const newTaskResponse = await axios.post(endpoint, taskPayload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                task.id = newTaskResponse.data.id; // Aktualizacja ID
                task.isNew = false; // Oznaczenie, że teraz już istnieje
            }

            globalOrder++; // Zwiększ globalny numer porządkowy
            }
        }

        setSuccess(true);
        setTimeout(() => {
            navigate(`/task-collection/${collectionId}`, { state: { success: true } });
        }, 1000);
        } catch (err) {
        setError(err.response?.data?.message || err.message);
        }
    };


    const handleRemoveCategory = (categoryId) => {
        setCategories((prevCategories) => {
            const categoryToRemove = prevCategories.find((category) => category.id === categoryId);
            if (!categoryToRemove) return prevCategories;
    
            // Zapamiętanie usuniętych zadań z danej kategorii
            const removedTasks = categoryToRemove.tasks.map((task) => ({
                id: task.id,
                type: task.type,
            }));
    
            setDeletedTasks((prevDeleted) => [...prevDeleted, ...removedTasks]);
    
            return prevCategories.filter((category) => category.id !== categoryId);
        });
    };

    const handleRemoveTask = (categoryId, taskId) => {
        setCategories((prevCategories) => 
            prevCategories.map((category) => {
                if (category.id === categoryId) {
                    const taskToRemove = category.tasks.find((task) => task.id === taskId);
                    if (taskToRemove) {
                        setDeletedTasks((prevDeleted) => [...prevDeleted, { id: taskToRemove.id, type: taskToRemove.type }]);
                    }
                    return {
                        ...category,
                        tasks: category.tasks.filter((task) => task.id !== taskId),
                    };
                }
                return category;
            })
        );
    };

    const handleDragEnd = (result) => {
        const { source, destination } = result;

        if (!destination) return;

        const sourceCategoryIndex = categories.findIndex(
        (cat) => String(cat.id) === source.droppableId
        );
        const destinationCategoryIndex = categories.findIndex(
        (cat) => String(cat.id) === destination.droppableId
        );

        if (sourceCategoryIndex === -1 || destinationCategoryIndex === -1) return;

        const sourceTasks = Array.from(categories[sourceCategoryIndex].tasks);
        const [movedTask] = sourceTasks.splice(source.index, 1);

        const updatedCategories = Array.from(categories);

        if (sourceCategoryIndex === destinationCategoryIndex) {
        // Przenoszenie wewnątrz tej samej kategorii
        sourceTasks.splice(destination.index, 0, movedTask);
        updatedCategories[sourceCategoryIndex] = {
            ...categories[sourceCategoryIndex],
            tasks: sourceTasks,
        };
        } else {
        // Przenoszenie między kategoriami
        const destinationTasks = Array.from(
            updatedCategories[destinationCategoryIndex].tasks
        );
        destinationTasks.splice(destination.index, 0, movedTask);

        updatedCategories[sourceCategoryIndex] = {
            ...categories[sourceCategoryIndex],
            tasks: sourceTasks,
        };
        updatedCategories[destinationCategoryIndex] = {
            ...categories[destinationCategoryIndex],
            tasks: destinationTasks,
        };
        }

        setCategories(updatedCategories);
    };

    const getTaskBackgroundColor = (difficulty) => {
        switch (difficulty) {
        case "easy":
            return "bg-[#69DC9E]";
        case "medium":
            return "bg-[#F9CB40]";
        case "hard":
            return "bg-[#FF2F2F]";
        default:
            return "bg-green-300";
        }
    };

    return (
        <div className="container mx-auto p-4">
        <h1 className="text-3xl md:text-4xl mt-6 md:mt-8 mb-4 md:mb-6 text-center">
            Dodaj nowy zbiór zadań
        </h1>
        {error && <p className="text-red-500">{error}</p>}
        {success && (
            <div className="fixed top-4 mt-24 left-1/2 z-10 md:w-1/5 text-center w-3/5 transform -translate-x-1/2 bg-white border border-black text-black px-6 py-4 rounded shadow-md text-lg">
            Zbiór zadań został pomyślnie dodany!
            </div>
        )}
        <form onSubmit={handleSubmit}>
        <div className="flex flex-wrap items-center justify-between mt-6 md:mt-8">
            <div className="flex items-center w-full md:w-2/3">
            <label
                htmlFor="name"
                className="font-medium mr-2 whitespace-nowrap"
            >
                Nazwa zbioru:
            </label>
            <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full border-2 border-[#D9D9D9] rounded-3xl bg-[#F5F5F5] px-4 shadow-lg focus:outline-none focus:ring-2 focus:ring-neutral-950"
            />
            </div>

            <div className="flex items-center w-1/2 md:w-1/5 md:mt-0 mt-5">
            <label
                htmlFor="typeId"
                className="font-medium mr-2 whitespace-nowrap"
            >
                Typ:
            </label>
            <select
                id="typeId"
                value={typeId}
                onChange={(e) => setTypeId(e.target.value)}
                required
                className="w-full border-2 border-[#D9D9D9] rounded-3xl bg-[#F5F5F5] px-4 shadow-lg"
            >
                <option value="" disabled>
                Wybierz typ
                </option>
                {collectionTypes.map((type) => (
                <option key={type.id} value={type.id}>
                    {type.name}
                </option>
                ))}
            </select>
            </div>

            <div className="flex items-center w-1/2 md:w-auto justify-center md:mt-0 mt-5">
            <label
                htmlFor="isPublic"
                className="font-medium mr-2 whitespace-nowrap"
            >
                Publiczny:
            </label>
            <input
                type="checkbox"
                id="isPublic"
                checked={isPublic}
                onChange={() => setIsPublic(!isPublic)}
                className="w-5 h-5"
            />
            </div>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="categories" type="category" direction="horizontal">
            {(provided) => (
                <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="flex flex-wrap justify-center items-center gap-8 relative mt-8 md:mt-10"
                >
                {categories.map((category, index) => (
                    <Draggable key={String(category.id)} draggableId={String(category.id)} index={index}>
                    {(provided) => (
                        <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="relative w-[95%] md:w-[48%] lg:w-[23%] bg-[#F5F5F5] bg-opacity-70 md:min-h-[54vh] min-h-[30vh] text-center"
                        >
                        <div {...provided.dragHandleProps} className="cursor-grab">
                            <input
                            type="text"
                            value={category.name}
                            onChange={(e) =>
                                handleCategoryNameChange(category.id, e.target.value)
                            }
                            placeholder="Nazwa kategorii"
                            className="w-full mb-2 p-2 bg-transparent font-bold text-center"
                            />
                        </div>
                        {categories.length > 1 && (
                            <button
                            onClick={() => handleRemoveCategory(category.id)}
                            className="absolute top-2 right-2 text-red-500 w-6 h-6 flex items-center justify-center"
                            >
                            X
                            </button>
                        )}
                        <Droppable droppableId={String(category.id)} type="task">
                            {(provided) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                            >
                                {category.tasks.map((task, taskIndex) => (
                                <Draggable key={String(task.id)} draggableId={String(task.id)} index={taskIndex}>
                                    {(provided) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className={`flex items-center justify-between px-2 mb-[2px] ${getTaskBackgroundColor(task.difficulty)}`}
                                    >
                                        <span>{task.name}</span>
                                        <div className="flex items-center">
                                        <button
                                            type="button"
                                            onClick={() => handleEditTask(task, category.id)}
                                            className="ml-2 px-4 py-2"
                                        >
                                            Edytuj
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTask(category.id, task.id)}
                                            className="text-black w-6 h-6 flex items-center justify-center"
                                        >
                                            X
                                        </button>
                                        </div>
                                    </div>
                                    )}
                                </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                            )}
                        </Droppable>
                        <button
                            onClick={() => handleAddTask(category.id)}
                            type="button"
                            className="px-4 py-2 mb-1 bg-transparent text-[#888888] border-2 border-[#D9D9D9] border-dashed w-full"
                        >
                            Kliknij, aby dodać nowe zadanie
                        </button>
                        </div>
                    )}
                    </Draggable>
                ))}
                {provided.placeholder}
                <button
                    type="button"
                    onClick={handleAddCategory}
                    className="px-2 bg-[#F5F5F5] bg-opacity-70 text-2xl"
                >
                    +
                </button>
                </div>
            )}
            </Droppable>
            </DragDropContext>
            <div className="flex flex-col md:flex-row items-center justify-between mt-5">
            <div className="text-center md:flex-grow md:ml-36 mb-4 md:mb-0">
                Przeciągnij, aby zmienić pozycję zadania
            </div>
            <button
                type="submit"
                className="px-6 py-2 bg-[#69DC9E] rounded-2xl hover:bg-[#5bc78d] transition-colors"
            >
                Zapisz zbiór
            </button>
            </div>
        </form>

        {isPopupOpen && (
            <PopupTaskEditor
            editedTask={editedTask}
            setEditedTask={setEditedTask}
            handlePopupSave={handlePopupSave}
            handlePopupClose={handlePopupClose}
            />
        )}
        </div>
    );
};

export default EditTaskCollection;
