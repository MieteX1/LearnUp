import {MoreVertical, UserX, Trash2, X, Gavel, User} from 'lucide-react';
import React from "react";
import {Link} from "react-router-dom";

const ModeratorsTable = ({
  moderators,
  onDemote,
  onDelete,
  onBan,
  onUnBan,
  openActionId,
  onToggleActions
}) => {
  return (
    <div className="bg-white rounded-lg overflow-visible">
      <table className="w-full">
        <thead>
          <tr className="bg-[#69DC9E]">
            <th className="px-6 py-3 text-center">Nazwa</th>
            <th className="px-6 py-3 text-center">Email</th>
            <th className="px-6 py-3 text-center">Od</th>
            <th className="px-6 py-3 text-center">Do</th>
            <th className="px-6 py-3 text-center">Ostatnio Aktywny</th>
            <th className="px-6 py-3 text-center">Aktywny</th>
            <th className="px-6 py-3 text-center">Akcje</th>
          </tr>
        </thead>
        <tbody>
          {moderators.map((moderator, index) => (
            <tr
              key={moderator.id}
              className={index % 2 === 0 ? 'bg-[#69DC9E]/10' : 'bg-white'}
            >
              <td className="px-6 py-4 text-center">
                <Link to={`/profile/${moderator.id}`} className="text-blue-500 hover:underline">
                  {moderator.login}
                </Link>
              </td>
              <td className="px-6 py-4 text-center">{moderator.email}</td>
              <td className="px-6 py-4 text-center">
                {moderator.created_at ? new Date(moderator.created_at).toLocaleDateString() : 'Invalid Date'}
              </td>
              <td className="px-6 py-4 text-center">{!moderator.ban_date ? 'Aktualnie' : new Date(moderator.ban_date).toLocaleDateString()}</td>
              <td className="px-6 py-4 text-center">
                {moderator.last_activity ? new Date(moderator.last_activity).toLocaleDateString() : 'Invalid Date'}
              </td>
              <td className="px-6 py-4 text-center">
                <X size={20} className="inline text-red-500" />
              </td>
              <td className="px-6 py-4 text-center">
                <div className="relative inline-block">
                  <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleActions(moderator.id);
                      }}
                      className="p-1 rounded-full hover:bg-[#69DC9E]/20 dropdown-trigger"
                  >
                    <MoreVertical size={20} className="text-gray-600"/>
                  </button>

                  {openActionId === moderator.id && (
                      <div
                          className="absolute right-0 border-2 mb-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10 dropdown-menu">
                        <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDemote(moderator.id,moderator.login);
                            }}
                            className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-[#69DC9E]/10"
                        >
                          <UserX min-size={16}/>
                          Zdegraduj do użytkownika
                        </button>
                        {moderator.ban_date && (
                            <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onUnBan(moderator.id,moderator.login);
                                }}
                                className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-[#69DC9E]/10"
                            >
                              <User size={16}/>
                              Odbanuj użytkownika
                            </button>
                        )}
                        {!moderator.ban_date && (
                          <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onBan(moderator.id,moderator.login);
                              }}
                              className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-[#69DC9E]/10 text-red-500"
                          >
                            <Gavel min-size={16}/>
                            Zbanuj użytkownika
                          </button>
                        )}
                        <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(moderator.id,moderator.login);
                            }}
                            className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-[#69DC9E]/10 text-red-500"
                        >
                          <Trash2 min-size={16}/>
                          Usuń użytkownika
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

export default ModeratorsTable;