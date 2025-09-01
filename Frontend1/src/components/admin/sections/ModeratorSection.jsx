import LoadingSpinner from "../LoadingSpinner.jsx";
import { Plus } from "lucide-react";
import ModeratorsTable from "../tables/ModeratorsTable.jsx";
import UsersTable from "../tables/UsersTable.jsx";

export const ModeratorSection = ({
  moderators,
  isLoading,
  onDemote,
  onDelete,
  onBan,
  onUnBan,
  openActionId,
  onToggleActions,
  onCreateNew
}) => {
  if (isLoading) return <LoadingSpinner message="Ładowanie moderatorów..." />;

  return (
      <div className="space-y-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 bg-[#69DC9E] rounded-t-lg flex justify-between items-center">
            <h3 className="font-semibold">
              Aktualni moderatorzy ({moderators.filter(moderator => !moderator.ban_date).length})
            </h3>
            <button
                className="bg-[#69DC9E] hover:bg-[#50B97E] text-black px-4 py-2 rounded-lg flex items-center gap-2"
                onClick={onCreateNew}
            >
              <Plus size={20}/>
              Stwórz nowe konto
            </button>
          </div>
          <div className="p-4">
            <ModeratorsTable
                moderators={moderators.filter(moderator => !moderator.ban_date)}
                onDemote={onDemote}
                onDelete={onDelete}
                onBan={onBan}
                openActionId={openActionId}
                onToggleActions={onToggleActions}
            />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 bg-[#69DC9E] rounded-t-lg flex justify-between items-center">
            <h3 className="font-semibold">
              Zbanowani moderatorzy ({moderators.filter(moderator => moderator.ban_date).length})
            </h3>
          </div>
          <div className="p-4">
            <ModeratorsTable
                moderators={moderators.filter(moderator => moderator.ban_date)}
                onDemote={onDemote}
                onDelete={onDelete}
                onBan={onBan}
                onUnBan={onUnBan}
                openActionId={openActionId}
                onToggleActions={onToggleActions}
            />
          </div>
        </div>
      </div>
  );
};

export default ModeratorSection;