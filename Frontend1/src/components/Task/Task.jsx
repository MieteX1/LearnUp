import React from 'react';
import { Draggable } from 'react-beautiful-dnd';

const Task = ({ task, index, onEditTask, onRemoveTask }) => (
    <Draggable draggableId={String(task.id)} index={index}>
        {(provided) => (
        <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`flex items-center justify-between px-2 mb-[2px] bg-[#69DC9E]`}
        >
            <span>{task.name}</span>
            <div className="flex items-center">
            <button onClick={() => onEditTask(task)} className="ml-2 px-4 py-2">
                Edytuj
            </button>
            <button onClick={onRemoveTask} className="text-black w-6 h-6 flex items-center justify-center">
                X
            </button>
            </div>
        </div>
        )}
    </Draggable>
);

export default Task;
