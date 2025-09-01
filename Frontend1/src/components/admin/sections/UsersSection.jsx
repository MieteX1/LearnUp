import LoadingSpinner from "../LoadingSpinner.jsx";
import UsersTable from "../tables/UsersTable.jsx";

export const UsersSection = ({
  users,
  unverifiedUsers,
  isLoading,
  onPromote,
  onDemote,
  onDelete,
  onBan,
  onUnBan,
  onVerify,
  openActionId,
  onToggleActions,
  onSendVerificationToAll
}) => {
  if (isLoading) return <LoadingSpinner message="Ładowanie użytkowników..." />;

  return (
      <div className="space-y-8">
        <div className="bg-white rounded-lg shadow">
          <h3 className="px-6 py-4 bg-[#69DC9E] rounded-t-lg font-semibold">
            Niezweryfikowani użytkownicy ({unverifiedUsers.length})
          </h3>
          <div className="p-4">
            <UsersTable
                users={unverifiedUsers}
                onDelete={onDelete}
                onPromote={onPromote}
                onVerify={onVerify}
                openActionId={openActionId}
                status={true}
                onToggleActions={onToggleActions}
                showVerifyOption={true}
                onSendVerificationToAll={onSendVerificationToAll}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <h3 className="px-6 py-4 bg-[#69DC9E] rounded-t-lg font-semibold">
            Wszyscy użytkownicy ({users.filter(user => !user.ban_date && user.is_verified).length})
          </h3>
          <div className="p-4">
            <UsersTable
                users={users.filter(user => !user.ban_date && user.is_verified)}
                onDelete={onDelete}
                onPromote={onPromote}
                onDemote={onDemote}
                status={true}
                onBan={onBan}
                openActionId={openActionId}
                onToggleActions={onToggleActions}
            />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow">
          <h3 className="px-6 py-4 bg-[#69DC9E] rounded-t-lg font-semibold">
            Wszyscy użytkownicy Zbanowani ({users.filter(user => user.ban_date).length})
          </h3>
          <div className="p-4">
            <UsersTable
                users={users.filter(user => user.ban_date)}
                onDelete={onDelete}
                onDemote={onDemote}
                onUnBan={onUnBan}
                status={false}
                openActionId={openActionId}
                onToggleActions={onToggleActions}
            />
          </div>
        </div>

      </div>
  );
};
export default UsersSection;