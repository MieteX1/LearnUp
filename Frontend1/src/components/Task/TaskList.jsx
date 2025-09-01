import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const TaskList = ({ collectionId, viewType }) => {
    const [tasks, setTasks] = useState([]);
    const [error, setError] = useState(null);
    let previousCategory = "";
    let previousOrder = null;

    useEffect(() => {
        const fetchTasks = async () => {
        try {
            const response = await axios.get(
            `http://localhost:3000/api/task-collection/progress/${collectionId}`
            );
            const sortedTasks = response.data.tasks.sort(
            (a, b) => a.order_ - b.order_
            );
            setTasks(sortedTasks);
        } catch (err) {
            console.error("Błąd podczas pobierania zadań:", err);
            setError(err.response?.data?.message || err.message);
        }
        };

        fetchTasks();
    }, [collectionId]);

    if (error) {
        return <p className="text-red-500">Błąd: {error}</p>;
    }

    return (
        <div>
        {tasks.length > 0 ? (
            <ul className="text-left ml-4">
             {tasks.map((task, index) => {
                const taskCategory = task.category || "Bez kategorii";
                let categoryToShow = null;

                if (taskCategory !== previousCategory) {
                categoryToShow = taskCategory;
                previousCategory = taskCategory;
                }

                let taskToShow = null;
                if (task.order_ !== previousOrder) {
                taskToShow = task.name;
                previousOrder = task.order_;
                }

                return (
                    <li key={`${task.id}-${index}`}>
                        {/* Wyświetlanie kategorii */}
                        {categoryToShow && (
                            <div
                                className="font-bold py-2 px-4 underline"
                                style={{backgroundColor: "#B5B5B5"}}
                            >
                                {categoryToShow}
                            </div>
                        )}

                        {/* Wyświetlanie zadania */}
                        {taskToShow &&
                            (viewType === "progress" ? (
                                <Link

                                    to={`/${task.task_type}/${task.id}`}
                                    className="flex items-center justify-between py-2 px-4"
                                    style={{
                                        backgroundColor: "#DDDDDD",
                                        marginLeft: "30px",
                                        width: "calc(100% - 30px)",
                                    }}
                                >
                                    {taskToShow}
                                    {task.is_answered && (
                                        <span className="ml-2 text-green-600 font-bold">✔</span>
                                    )}
                                </Link>
                            ) : (
                                <div
                                    className="py-2 px-4"
                                    style={{
                                        backgroundColor: "#DDDDDD",
                                        marginLeft: "30px",
                                        width: "calc(100% - 30px)",
                                    }}
                                >
                                    {taskToShow}
                                </div>
                            ))}
                    </li>
                );
             })}
            </ul>
        ) : (
            <p className="text-gray-500">Brak zadań w tej kolekcji.</p>
        )}
        </div>
    );
};

export default TaskList;
