import React from 'react';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';

const CollectionTypesTable = ({
  types,
  onEdit,
  onDelete,
  openActionId,
  onToggleActions
}) => {
  return (
    <div className="bg-white rounded-lg overflow-y-visible">
      <table className="w-full">
        <thead>
          <tr className="bg-[#69DC9E]">
            <th className="px-6 py-3 text-center">ID</th>
            <th className="px-6 py-3 text-center">Nazwa</th>
            <th className="px-6 py-3 text-center">Akcje</th>
          </tr>
        </thead>
        <tbody>
          {types.map((type, index) => (
            <tr
              key={type.id}
              className={index % 2 === 0 ? 'bg-[#69DC9E]/10' : 'bg-white'}
            >
              <td className="px-6 py-4 text-center">{type.id}</td>
              <td className="px-6 py-4 text-center">{type.name}</td>
              <td className="px-6 py-4 text-center">
                <div className="relative inline-block">
                  <button
                    onClick={() => onToggleActions(type.id)}
                    className="p-1 rounded-full hover:bg-[#69DC9E]/20 dropdown-trigger"
                  >
                    <MoreVertical size={20} className="text-gray-600" />
                  </button>

                  {openActionId === type.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10 dropdown-menu">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(type);
                        }}
                          className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-[#69DC9E]/10"
                      >
                        <Edit size={16} />
                        Edytuj typ
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(type.id,type.name);
                        }}
                        className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-[#69DC9E]/10 text-red-500"
                      >
                        <Trash2 size={16} />
                        Usuń typ
                      </button>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CollectionTypesTable;