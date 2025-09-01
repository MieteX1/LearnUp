import {useCallback, useState} from 'react';
import { useSearchParams } from 'react-router-dom';
import { Flag, Users, FolderInput, Shield,Timer  } from 'lucide-react';
import  TabButton from '../components/admin/tables/TabButton.jsx';
import DeleteConfirmationPopup from "../components/admin/popups/DeleteConfirmationPopup.jsx";
import RoleChangePopup from "../components/admin/popups/RoleChangePopup.jsx";
import ModeratorPopup from "../components/admin/popups/ModeratorPopup.jsx";
import ComplaintDetailsPopup from '../components/admin/popups/ComplaintDetailsPopup.jsx';
import CollectionTypePopup from '../components/admin/popups/CollectionTypePopup.jsx';
import StatsSection from '../components/admin/sections/StatsSection';
import { useAlert } from '../components/ui/Alert';
import { useAuth } from '../context/AuthContext';
import {
  useModeratorsList,
  useCollectionTypesList,
  useComplaintsList,
  useUsersList,
  useUnverifiedUsers,
  useCreateCollectionType,
  useUpdateCollectionType,
  useDeleteCollectionType,
  useUpdateUserRole,
  useSendVerificationEmail,
  useBanUser,
  useUnBanUser,
  useAdminDelete,
  useUserStats,
} from '../api/admin';
import ComplaintsSection from "../components/admin/sections/ComplaintsSection.jsx";
import UsersSection from "../components/admin/sections/UsersSection.jsx";
import ModeratorSection from "../components/admin/sections/ModeratorSection.jsx";
import TypesSection from "../components/admin/sections/TypesSection.jsx";
import useClickOutside from "../hooks/useClickOutside.js";
import BanConfirmationPopup from "../components/admin/popups/BanConfirmationPopup.jsx";
import UnBanConfirmationPopup from "../components/admin/popups/UnBanConfirmationPopup.jsx";

const TABS = {
  MODERATORS: 'moderators',
  COMPLAINTS: 'complaints',
  USERS: 'users',
  TYPES: 'types',
  STATS: 'stats'
};

const AdminPanel = () => {
  const { user } = useAuth();
  const { addAlert } = useAlert();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || (user?.role === 'moderator' ? TABS.COMPLAINTS : TABS.MODERATORS);
  const [openActionId, setOpenActionId] = useState(null);
  const [popupState, setPopupState] = useState({
    moderator: false,
    type: false,
    delete: false,
    demote: false,
    promote: false,
    complaintDetails: false,
    ban: false,
    unban: false
  });
  const [selectedItem, setSelectedItem] = useState(null);
  const [showResolvedComplaints, setShowResolvedComplaints] = useState({
    collections: false,
    comments: false,
    users: false
  });

  // Query hooks
  const { data: moderators = [], isLoading: isLoadingModerators } = useModeratorsList();
  const { data: collectionTypes = [], isLoading: isLoadingTypes } = useCollectionTypesList();
  const { data: complaints = { collections: [], comments: [], users: [] }, isLoading: isLoadingComplaints } = useComplaintsList();
  const { data: users = [], isLoading: isLoadingUsers } = useUsersList();
  const { data: unverifiedUsers = [], isLoading: isLoadingUnverified } = useUnverifiedUsers();
  const { data: userStats = [], isLoading: isLoadingStats } = useUserStats();


  // Mutation hooks
  const createType = useCreateCollectionType();
  const updateType = useUpdateCollectionType();
  const deleteType = useDeleteCollectionType();
  const updateRole = useUpdateUserRole();
  const banUser = useBanUser();
  const unbanUser = useUnBanUser();
  const sendVerificationEmail = useSendVerificationEmail();
  const adminDelete = useAdminDelete();


  const hasAccess = (tab) => {
    if (user?.role === 'admin') return true;
    if (user?.role === 'moderator') {
      return [TABS.COMPLAINTS, TABS.USERS].includes(tab);
    }
    return false;
  };

  const closeAllPopups = () => {
    setPopupState({
      moderator: false,
      type: false,
      delete: false,
      demote: false,
      promote: false,
      complaintDetails: false,
      ban: false,
      unban: false
    });
    setSelectedItem(null);
  };


  const dropdownRef = useClickOutside(() => {
  if (openActionId !== null) {
    setOpenActionId(null);
  }
});

  const handleToggleActions = useCallback((id) => {
    setOpenActionId(currentId => currentId === id ? null : id);
  }, []);
  const handleSectionClick = (e) => {
    // Sprawdzamy, czy kliknięcie nie jest w przycisk lub dropdown
    if (!e.target.closest('.dropdown-trigger') && !e.target.closest('.dropdown-menu')) {
      setOpenActionId(null);
    }
  };

  const handleTabChange = (tab) => {
      setSearchParams({ tab: tab });
      setOpenActionId(null);
    };
  const handleTypeAction = async (action, data) => {
    try {
      if (action === 'create') {
        await createType.mutateAsync(data);
        addAlert('Nowy typ kolekcji został dodany', 'success');
      } else if (action === 'update') {
        await updateType.mutateAsync({ id: selectedItem.id, ...data });
        addAlert('Typ kolekcji został zaktualizowany', 'success');
      } else if (action === 'delete') {
        await deleteType.mutateAsync(selectedItem.id);
        addAlert('Typ kolekcji został usunięty', 'success');
      }
      closeAllPopups();
    } catch (error) {
      console.error(`Error ${action}ing type:`, error);
        addAlert('Wystąpił błąd podczas operacji na typie kolekcji', 'error');
    }
  };

  const handleUserAction = async (action) => {
    try {
      if (action === 'promote') {
        await updateRole.mutateAsync({ userId: selectedItem.id, role: 'moderator' });
        addAlert('Użytkownik został awansowany na moderatora', 'success');
      } else if (action === 'demote') {
        await updateRole.mutateAsync({ userId: selectedItem.id, role: 'user' });
        addAlert('Moderator został zdegradowany do roli zwykłego użytkownika', 'success');
      } else if (action === 'ban') {
        await banUser.mutateAsync(selectedItem.id);
        addAlert('Użytkownik został zbanowany', 'success');
      } else if (action === 'unban') {
        await unbanUser.mutateAsync(selectedItem.id);
        addAlert('Użytkownik został odbanowany', 'success');
      }
      else if (action === 'delete') {
        await adminDelete.mutateAsync(selectedItem.id);
        addAlert('Użytkownik został usunięty', 'success');
      }
      closeAllPopups();
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
      addAlert('Wystąpił błąd podczas operacji na użytkowniku', 'error');
    }
  };
   const handleSendVerificationEmail = async (userId, userEmail) => {
    try {
      await sendVerificationEmail.mutateAsync(userEmail);
      addAlert('Email weryfikacyjny został wysłany', 'success');
    } catch (error) {
      console.error('Error sending verification email:', error);
      addAlert('Wystąpił błąd podczas wysyłania emaila weryfikacyjnego', 'error');
    }
  };

  const handleSendVerificationToAll = async (users) => {
    try {
      const unverifiedCount = users.filter(user => !user.is_verified).length;
      let successCount = 0;
      for (const user of users.filter(u => !u.is_verified)) {
        try {
          await sendVerificationEmail.mutateAsync(user.email);
          successCount++;
        } catch (error) {
          console.error(`Failed to send verification email to ${user.email}:`, error);
        }
      }

      addAlert(`Wysłano ${successCount} z ${unverifiedCount} emaili weryfikacyjnych`, 'success');
      return successCount;
    } catch (error) {
      console.error('Error sending verification emails:', error);
      addAlert('Wystąpił błąd podczas wysyłania emaili weryfikacyjnych', 'error');
      return 0;
    }
  };


  const renderContent = () => {
    if (activeTab === TABS.MODERATORS && hasAccess(TABS.MODERATORS)) {
      return (
          <div onClick={handleSectionClick}>
            <ModeratorSection
                moderators={moderators}
                isLoading={isLoadingModerators}
                onCreateNew={() => setPopupState({...popupState, moderator: true})}
                onDemote={(id,login) => {
                  setSelectedItem({id,login});
                  setPopupState({...popupState, demote: true});
                }}
               onDelete={(id,login) => {
                  setSelectedItem({id,login});
                  setPopupState({...popupState, delete: true});
                }}
                onBan={(id,login) => {
                  setSelectedItem({id,login});
                  setPopupState({...popupState, ban: true});
                }}
                onUnBan={(id,login) => {
                  setSelectedItem({id,login});
                  setPopupState({...popupState, unban: true});
                }}
                openActionId={openActionId}
                onToggleActions={handleToggleActions}
            />
          </div>
      );
    }

    if (activeTab === TABS.COMPLAINTS && hasAccess(TABS.COMPLAINTS)) {
      return (
          <ComplaintsSection
              complaints={complaints}
              isLoading={isLoadingComplaints}
              showResolvedComplaints={showResolvedComplaints}
              onToggleResolved={setShowResolvedComplaints}
              onViewDetails={(complaint) => {
                setSelectedItem(complaint);
                setPopupState({...popupState, complaintDetails: true});
              }}
          />
      );
    }

    if (activeTab === TABS.USERS && hasAccess(TABS.USERS)) {
      return (
          <div onClick={handleSectionClick}>
            <UsersSection
                users={users}
                unverifiedUsers={unverifiedUsers}
                isLoading={isLoadingUsers || isLoadingUnverified}
                onPromote={(id,login,role) => {
                  setSelectedItem({id,login,role});
                  setPopupState({...popupState, promote: true});
                }}
                onDelete={(id,login) => {
                  setSelectedItem({id,login});
                  setPopupState({...popupState, delete: true});
                }}
                onDemote={(id, login) => {
                  setSelectedItem({id,login});
                  setPopupState({...popupState, demote: true});
                }}
                onBan={(id, login) => {
                  setSelectedItem({id,login});
                  setPopupState({...popupState, ban: true});
                }}
                onUnBan={(id, login) => {
                  setSelectedItem({id,login});
                  setPopupState({...popupState, unban: true});
                }}
                onVerify={handleSendVerificationEmail}
                openActionId={openActionId}
                onToggleActions={handleToggleActions}
                onSendVerificationToAll={handleSendVerificationToAll}
            />
          </div>
      );
    }

    if (activeTab === TABS.TYPES && hasAccess(TABS.TYPES)) {
      return (
          <div onClick={handleSectionClick}>
            <TypesSection
                types={collectionTypes}
                isLoading={isLoadingTypes}
                onCreateNew={() => setPopupState({...popupState, type: true})}
                onEdit={(type) => {
                  setSelectedItem(type);
                  setPopupState({...popupState, type: true});
                }}
                onDelete={(id,name) => {
                  setSelectedItem({id,name});
                  setPopupState({...popupState, delete: true});
                }}
                openActionId={openActionId}
                onToggleActions={handleToggleActions}
            />
          </div>
      );
    }
      if (activeTab === TABS.STATS && hasAccess(TABS.STATS)) {
    return (
      <StatsSection
        stats={userStats}
        isLoading={isLoadingStats}
      />
    );
  }
  };

  return (
      <div className="p-8">
        <div className="lg:max-w-[90%] xl:max-w-[80%] max-w-full  mx-auto" ref={dropdownRef}>
          <div className="mb-6 flex gap-4 flex-wrap">
            {Object.entries({
              [TABS.MODERATORS]: {icon: Shield, label: 'Moderatorzy'},
              [TABS.COMPLAINTS]: {icon: Flag, label: 'Zgłoszenia'},
              [TABS.USERS]: {icon: Users, label: 'Użytkownicy'},
              [TABS.TYPES]: {icon: FolderInput, label: 'Typy zbiorów'},
              [TABS.STATS]: {icon: Timer, label: 'Statystyki'}
            }).map(([tab, {icon, label}]) => (
                hasAccess(tab) && (
                    <TabButton
                        key={tab}
                isActive={activeTab === tab}
                onClick={() => handleTabChange(tab)}
                icon={icon}
              >
                {label}
              </TabButton>
            )
          ))}
        </div>

        {renderContent()}

        {/* Popups */}
        <DeleteConfirmationPopup
          isOpen={popupState.delete}
          onClose={closeAllPopups}
          onConfirm={() =>
            activeTab === TABS.TYPES
              ? handleTypeAction('delete')
              : handleUserAction('delete')
          }
          title="Potwierdź usunięcie"
          message={
            activeTab === TABS.TYPES
              ? `Czy na pewno chcesz usunąć ten: ${selectedItem?.name} typ kolekcji?`
              : `Czy na pewno chcesz usunąć tego użytkownika ${selectedItem?.login}  ?`
          }
        />
          <BanConfirmationPopup
          isOpen={popupState.ban}
          onClose={closeAllPopups}
          onConfirm={() => handleUserAction('ban')}
          title="Potwierdź Zbanowanie"
          message={`Czy na pewno chcesz zbanować użytkownika ${selectedItem?.login || ''}?`
          }
        />
          <UnBanConfirmationPopup
          isOpen={popupState.unban}
          onClose={closeAllPopups}
          onConfirm={() => handleUserAction('unban')}
          title="Potwierdź Zbanowanie"
          message={`Czy na pewno chcesz odbanować użytkownika ${selectedItem?.login || ''}?`
          }
        />


        <RoleChangePopup
          isOpen={popupState.demote}
          onClose={closeAllPopups}
          onConfirm={() => handleUserAction('demote')}
          title="Potwierdź degradację"
          message={`Czy na pewno chcesz zdegradować ${selectedItem?.login || ''} do roli zwykłego użytkownika?`}
          confirmText="Zdegraduj"
        />

        <RoleChangePopup
          isOpen={popupState.promote}
          onClose={closeAllPopups}
          onConfirm={() => handleUserAction('promote')}
          title={selectedItem?.role === 'admin' ? 'Potwierdź degradację' : 'Potwierdź awans'}
          message={
            selectedItem?.role === 'admin'
              ? `Czy na pewno chcesz zdegradować ${selectedItem?.login || ''} do roli moderatora?`
              : `Czy na pewno chcesz awansować ${selectedItem?.login || ''} do roli moderatora?`
          }
          confirmText={selectedItem?.role === 'admin' ? 'Zdegraduj' : 'Awansuj'}

        />

        {popupState.moderator && (
          <ModeratorPopup onClose={closeAllPopups} />
        )}

        {popupState.complaintDetails && selectedItem && (
          <ComplaintDetailsPopup
            complaint={selectedItem}
            onClose={closeAllPopups}
          />
        )}

        <CollectionTypePopup
          isOpen={popupState.type}
          onClose={closeAllPopups}
          onSubmit={(data) => handleTypeAction(selectedItem ? 'update' : 'create', data)}
          editingType={selectedItem}
        />
      </div>
    </div>
  );
};

export default AdminPanel;