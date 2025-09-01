import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import PopupTaskEditor from "../components/Task/PopupTaskEditor.jsx";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import CollectionCoverPopup from '../components/Task/CollectionCoverPopup';

const AddTaskCollection = () => {
  const [name, setName] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [typeId, setTypeId] = useState("");
  const [collectionTypes, setCollectionTypes] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [showCoverPopup, setShowCoverPopup] = useState(false);
  const [newCollectionId, setNewCollectionId] = useState(null);
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
    const CollectionTypes = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/collection-type");
        setCollectionTypes(response.data);
      } catch (err) {
        console.error("Error fetching collection types:", err);
      }
    };

    CollectionTypes();
  }, []);

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
  

  const handleEditTask = (task, categoryId) => {
    setCurrentTask({ ...task, categoryId });
    setEditedTask({
      name: task.name || "",
      type: task.type || "",
      content: task.content || "",
      singleCorrectAnswer: task.singleCorrectAnswer || "",
      singleWrongAnswers: task.singleWrongAnswers || ["", "", ""],
      multipleCorrectAnswers: task.multipleCorrectAnswers || [""],
      multipleWrongAnswers: task.multipleWrongAnswers || [""],
      leftPart: task.leftPart || [""],
      rightPart: task.rightPart ||[""],
      difficulty: task.difficulty || "",
      description: task.description || "",
      });
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
      // Tworzenie zbioru zadań
      const collectionResponse = await axios.post(
        "http://localhost:3000/api/task-collection",
        {
          name,
          is_public: isPublic,
          type_id: parseInt(typeId, 10),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      const collectionId = collectionResponse.data.id;
      setNewCollectionId(collectionId);
      // Globalny numer porządkowy dla wszystkich zadań
      let globalOrder = 1;
  
      // Iteracja przez kategorie i ich zadania
      for (const category of categories) {
        for (const task of category.tasks) {
          const taskPayload = {
            collection_id: collectionId,
            name: task.name,
            description: task.content,
            category: category.name,
            difficulty: task.difficulty,
            order_: globalOrder, // Ustawienie globalnego numeru porządkowego
          };
  
          if (task.type === "Test jednokrotnego wyboru") {
            const taskResponse = await axios.post(
              "http://localhost:3000/api/task-test",
              taskPayload,
              { headers: { Authorization: `Bearer ${token}` } }
            );
  
            const taskId = taskResponse.data.id;
  
            const options = [
              { title: task.singleCorrectAnswer, is_answer: true },
              ...task.singleWrongAnswers.map((answer) => ({
                title: answer,
                is_answer: false,
              })),
            ];
  
            for (const option of options) {
              await axios.post(
                "http://localhost:3000/api/test-option",
                { test_id: taskId, title: option.title, is_answer: option.is_answer },
                { headers: { Authorization: `Bearer ${token}` } }
              );
            }
          } else if (task.type === "Test wielokrotnego wyboru") {
            const taskResponse = await axios.post(
              "http://localhost:3000/api/task-test",
              taskPayload,
              { headers: { Authorization: `Bearer ${token}` } }
            );
  
            const taskId = taskResponse.data.id;
  
            const options = [
              ...task.multipleCorrectAnswers.map((answer) => ({
                title: answer,
                is_answer: true,
              })),
              ...task.multipleWrongAnswers.map((answer) => ({
                title: answer,
                is_answer: false,
              })),
            ];
  
            for (const option of options) {
              await axios.post(
                "http://localhost:3000/api/test-option",
                { test_id: taskId, title: option.title, is_answer: option.is_answer },
                { headers: { Authorization: `Bearer ${token}` } }
              );
            }
          } else if (task.type === "Otwarte") {
            await axios.post("http://localhost:3000/api/task-open", taskPayload, {
              headers: { Authorization: `Bearer ${token}` },
            });
          } else if (task.type === "Uzupełnij lukę") {
            const taskPayload = {
              collection_id: collectionId,
              name: task.name,
              description: task.content,
              category: category.name,
              difficulty: task.difficulty,
              order_: globalOrder,
              text: task.content,
            };

            const taskResponse = await axios.post(
              "http://localhost:3000/api/task-gap",
              taskPayload,
              { headers: { Authorization: `Bearer ${token}` } }
            );
  
            const taskId = taskResponse.data.id;
  
            const gapOptions = task.rightPart.map((answer, index) => ({
              answer,
              position: index + 1,
            }));
  
            for (const option of gapOptions) {
              await axios.post(
                "http://localhost:3000/api/gap-option",
                { gap_id: taskId, answer: option.answer, position: option.position },
                { headers: { Authorization: `Bearer ${token}` } }
              );
            }
          } else if (task.type === "Dopasowanie") {
            const taskResponse = await axios.post(
              "http://localhost:3000/api/task-match",
              taskPayload,
              { headers: { Authorization: `Bearer ${token}` } }
            );
  
            const taskId = taskResponse.data.id;
  
            const matchOptions = task.leftPart.map((title, index) => ({
              title,
              answer: task.rightPart[index],
            }));
  
            for (const option of matchOptions) {
              await axios.post(
                "http://localhost:3000/api/match-option",
                { match_id: taskId, title: option.title, answer: option.answer },
                { headers: { Authorization: `Bearer ${token}` } }
              );
            }
          } else if (task.type === "Fiszki") {
            for (let i = 0; i < task.leftPart.length; i++) {
              await axios.post(
                "http://localhost:3000/api/card",
                {
                  collection_id: collectionId,
                  name: task.name,
                  side1: task.leftPart[i],
                  side2: task.rightPart[i],
                  category: category.name,
                  difficulty: task.difficulty,
                  description: task.description,
                  order_: globalOrder, // Dodanie globalnego numeru porządkowego
                },
                { headers: { Authorization: `Bearer ${token}` } }
              );
            }
          }
  
          globalOrder++; // Zwiększ globalny numer porządkowy
        }
      }
  
      setSuccess(true);
      setShowCoverPopup(true);
  } catch (err) {
    setError(err.response?.data?.message || err.message);
  }
  };
  const handleSkipCover = () => {
  setShowCoverPopup(false);
  navigate(`/task-collection/${newCollectionId}`, { state: { success: true } });
};

  const handleRemoveCategory = (categoryId) => {
    setCategories(categories.filter((category) => category.id !== categoryId));
  };
  
  const handleRemoveTask = (categoryId, taskId) => {
    setCategories(
      categories.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              tasks: category.tasks.filter((task) => task.id !== taskId),
            }
          : category
      )
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
            Utwórz zbiór
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
      <CollectionCoverPopup
      isOpen={showCoverPopup}
      onClose={() => setShowCoverPopup(false)}
      collectionId={newCollectionId}
      onSkip={handleSkipCover}
    />
    </div>
  );
};

export default AddTaskCollection;
