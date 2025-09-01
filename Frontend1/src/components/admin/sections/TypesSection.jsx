import LoadingSpinner from "../LoadingSpinner.jsx";
import CollectionTypesTable from "../tables/CollectionTypesTable.jsx";
import { Plus } from "lucide-react";

export const TypesSection = ({
  types,
  isLoading,
  onCreateNew,
  onEdit,
  onDelete,
  openActionId,
  onToggleActions
}) => {
  if (isLoading) return <LoadingSpinner message="Ładowanie typów..." />;

  return (
      <div className="space-y-8">
        <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 bg-[#69DC9E] rounded-t-lg flex justify-between items-center">
                <h3 className="font-semibold">
                    Aktualne Typy zbiorów ({types.length})
                </h3>
                <button
                    className="bg-[#69DC9E] hover:bg-[#50B97E] text-black px-4 py-2 rounded-lg flex items-center gap-2"
                    onClick={onCreateNew}
                >
                    <Plus size={20}/>
                    Dodaj nowy typ
                </button>
            </div>
            <div className="p-4">
                <CollectionTypesTable
                    types={types}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    openActionId={openActionId}
                    onToggleActions={onToggleActions}
                />
          </div>
        </div>
      </div>
  );
};
export default TypesSection;