import React, { useState } from 'react';
import {MoreVertical, UserX, Trash2, User, Shield, Mail, Gavel} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
const UsersTable = ({
  users,
  onDelete,
  onPromote,
  onDemote,
  onVerify,
  onBan,
  onUnBan,
  openActionId,
  status,
  onToggleActions,
  showVerifyOption = false,
  onSendVerificationToAll
}) => {
  const [isSending, setIsSending] = useState(false);
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  const formatestatus = (status) => {
    return status ? 'Status' : 'Data Bana';
  };

  const handleSendToAll = async () => {
    if (isSending) return;
    setIsSending(true);
    try {
      const count = await onSendVerificationToAll(users);
      // Tutaj można dodać powiadomienie o sukcesie
      console.log(`Wysłano ${count} maili weryfikacyjnych`);
    } catch (error) {
      // Tutaj można dodać powiadomienie o błędzie
      console.error('Błąd podczas wysyłania maili:', error);
    } finally {
      setIsSending(false);
    }
  };

  const unverifiedCount = users.filter(user => !user.is_verified).length;

  return (
    <div className="bg-white rounded-lg overflow-visible">
      {showVerifyOption && unverifiedCount > 0 && (
        <div className="p-4 border-b flex justify-between items-center">
          <span className="hidden sm:flex  text-sm text-gray-600 ">
            Liczba niezweryfikowanych użytkowników: {unverifiedCount}
          </span>
          <button
            onClick={handleSendToAll}
            disabled={isSending}
            className="flex items-center gap-2 px-4 py-2 bg-[#69DC9E] text-black rounded-lg hover:bg-[#5bc78d] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Mail size={16} />
            {isSending ? 'Wysyłanie...' : 'Wyślij do wszystkich niezweryfikowanych'}
          </button>
        </div>
      )}
      <div className="">
        <table className="w-full">
          <thead>
            <tr className="bg-[#69DC9E]">
              <th className="px-6 py-3 text-center">Login</th>
              <th className="px-6 py-3 text-center">Email</th>
              <th className="px-6 py-3 text-center">Rola</th>
              <th className="px-6 py-3 text-center">Data utworzenia</th>
              <th className="px-6 py-3 text-center">Ostatnia aktywność</th>
              <th className="px-6 py-3 text-center">{formatestatus(status)}</th>
              <th className="px-6 py-3 text-center">Akcje</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr
                key={user.id}
                className={index % 2 === 0 ? 'bg-[#69DC9E]/10' : 'bg-white'}
              >
                <td className="px-6 py-4 text-center">
                  <Link to={`/profile/${user.id}`} className="text-blue-500 hover:underline">
                    {user.login}
                  </Link>
                </td>
                <td className="px-6 py-4 text-center">{user.email}</td>
                <td className="px-6 py-4 text-center capitalize">{user.role}</td>
                <td className="px-6 py-4 text-center">{formatDate(user.created_at)}</td>
                <td className="px-6 py-4 text-center">{formatDate(user.last_activity)}</td>
                <td className="px-6 py-4 text-center">
                  {user.ban_date ? formatDate(user.ban_date) : (
                    user.is_verified ? (
                      <span className="text-green-600">Zweryfikowany</span>
                    ) : (
                      <span className="text-yellow-600">Niezweryfikowany</span>
                    )
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="relative inline-block">
                    <button
                      onClick={() => onToggleActions(user.id)}
                      className="p-1 rounded-full hover:bg-[#69DC9E]/20 dropdown-trigger"
                    >
                      <MoreVertical size={20} className="text-gray-600" />
                    </button>

                    {openActionId === user.id && (
                        <div
                            className="absolute right-0 border-2 mb-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10 dropdown-menu">
                          {isAdmin && user.role !== 'moderator' && (
                              <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onPromote(user.id, user.login, user.role);
                                  }}
                                  className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-[#69DC9E]/10"
                              >{user.role === 'admin' ? (
                                  <>
                                    <UserX min-size={16}/> Zdegraduj na moderatora
                                  </>
                              ) : (
                                  <>
                                    <Shield min-size={16}/> Awansuj na moderatora
                                  </>
                              )}

                              </button>
                          )}
                          {isAdmin && user.role === 'moderator' && (
                            <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDemote(user.id, user.login);
                                }}
                                className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-[#69DC9E]/10"
                            >
                              <UserX min-size={16}/>
                              Zdegraduj do użytkownika
                            </button>
                          )}
                          {showVerifyOption && !user.is_verified && (
                              <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onVerify(user.id, user.email);
                                  }}
                                  className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-[#69DC9E]/10"
                              >
                                <User size={16}/>
                                Wyślij mail weryfikacyjny
                              </button>
                          )}
                          {!user.ban_date && (
                              <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onBan(user.id, user.login);
                                  }}
                                  className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-[#69DC9E]/10 text-red-500"
                              >
                                <Gavel min-size={16}/>
                                Zbanuj użytkownika
                              </button>
                          )}
                          {isAdmin && user.ban_date && (
                              <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onUnBan(user.id, user.login);
                                  }}
                                  className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-[#69DC9E]/10"
                              >
                                <User size={16}/>
                                Odbanuj użytkownika
                              </button>
                          )}
                           {isAdmin && (
                            <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDelete(user.id, user.login);
                                }}
                                className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-[#69DC9E]/10 text-red-500"
                            >
                              <Trash2 size={16}/>
                              Usuń użytkownika
                            </button>
                         )}
                        </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersTable;