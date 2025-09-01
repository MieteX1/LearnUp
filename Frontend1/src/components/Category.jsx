import React from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import Task from './Task/Task.jsx';

const Category = ({ category, index, onAddTask, onEditTask, onRemoveTask, onRemoveCategory }) => (
    <Draggable draggableId={String(category.id)} index={index}>
        {(provided) => (
        <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className="relative w-[95%] md:w-[48%] lg:w-[23%] bg-[#F5F5F5] bg-opacity-70 text-center"
        >
            <div {...provided.dragHandleProps} className="cursor-grab">
            <input
                type="text"
                value={category.name}
                onChange={(e) => onEditCategoryName(category.id, e.target.value)}
                placeholder="Nazwa kategorii"
                className="w-full mb-2 p-2 bg-transparent font-bold text-center"
            />
            </div>
            {onRemoveCategory && (
            <button
                onClick={() => onRemoveCategory(category.id)}
                className="absolute top-2 right-2 text-red-500 w-6 h-6 flex items-center justify-center"
            >
                X
            </button>
            )}
            <Droppable droppableId={String(category.id)} type="task">
            {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                {category.tasks.map((task, taskIndex) => (
                    <Task
                    key={task.id}
                    task={task}
                    index={taskIndex}
                    onEditTask={(task) => onEditTask(task, category.id)}
                    onRemoveTask={() => onRemoveTask(category.id, task.id)}
                    />
                ))}
                {provided.placeholder}
                </div>
            )}
            </Droppable>
            <button
            onClick={() => onAddTask(category.id)}
            className="px-4 py-2 mb-1 bg-transparent text-[#888888] border-2 border-[#D9D9D9] border-dashed w-full"
            >
            Kliknij, aby dodać nowe zadanie
            </button>
        </div>
        )}
    </Draggable>
);

export default Category;
