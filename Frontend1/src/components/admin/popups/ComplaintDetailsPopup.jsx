import React, { useState } from 'react';
import DefaultPopup from '../../ui/DefaultPopup.jsx';
import { Link } from 'react-router-dom';
import { useBanUser, useResolveComplaint } from '../../../api/admin.js';
import { useAlert } from '../../ui/Alert';
import ActionConfirmationPopup from './ActionConfirmationPopup';

const ComplaintDetailsPopup = ({ complaint, onClose }) => {
  const banUser = useBanUser();
  const resolveComplaint = useResolveComplaint();
  const { addAlert } = useAlert();
  const [confirmAction, setConfirmAction] = useState({
    show: false,
    type: null,
    userId: null,
    userName: null
  });

  const getComplaintType = (complaint) => {
    if ('task_collection' in complaint) return 'collection';
    if ('comment' in complaint) return 'comment';
    if ('disturber' in complaint) return 'user';
    return null;
  };

  const type = getComplaintType(complaint);

  const handleBanUser = async () => {
    if (banUser.isLoading) return;

    try {
      await banUser.mutateAsync(confirmAction.userId);
      addAlert(`Użytkownik ${confirmAction.userName} został zbanowany`, 'success');
      setConfirmAction({ show: false, type: null, userId: null, userName: null });
    } catch (error) {
      console.error('Error banning user:', error);
      addAlert('Wystąpił błąd podczas banowania użytkownika', 'error');
    }
  };

  const handleResolveComplaint = async () => {
    if (resolveComplaint.isLoading) return;

    try {
      await resolveComplaint.mutateAsync({
        type,
        id: complaint.id
      });
      addAlert('Zgłoszenie zostało rozwiązane', 'success');
      setConfirmAction({ show: false, type: null, userId: null, userName: null });
      onClose();
    } catch (error) {
      console.error('Error resolving complaint:', error);
      addAlert('Wystąpił błąd podczas rozwiązywania zgłoszenia', 'error');
    }
  };

  const getConfirmationConfig = () => {
    switch (confirmAction.type) {
      case 'ban':
        return {
          title: 'Potwierdź banowanie',
          message: `Czy na pewno chcesz zbanować użytkownika ${confirmAction.userName}?`,
          confirmText: 'Zbanuj',
          confirmClass: 'bg-red-500 text-white hover:bg-red-600',
          onConfirm: handleBanUser
        };
      case 'resolve':
        return {
          title: 'Potwierdź rozwiązanie',
          message: 'Czy na pewno chcesz rozwiązać to zgłoszenie?',
          confirmText: 'Rozwiąż',
          onConfirm: handleResolveComplaint
        };
      default:
        return {};
    }
  };

  const formatSelectedReasons = (justification) => {
    const match = justification.match(/SelectedReasons: (.*)/);
    if (match) {
      return match[1].split(', ').map(reason => (
        <span key={reason} className="inline-block bg-gray-100 rounded-full px-2 py-1 text-xs mr-1 mb-1">
          {reason}
        </span>
      ));
    }
    return null;
  };

  const formatJustification = (justification) => {
    if (!justification) return null;
    const mainText = justification.split('SelectedReasons:')[0];
    const reasons = formatSelectedReasons(justification);

    return (
      <div>
        <div className="mb-2">{mainText}</div>
        <div className="flex flex-wrap">{reasons}</div>
      </div>
    );
  };

  const getComplaintTypeName = (type) => {
    switch (type) {
      case 'collection':
        return 'zbioru zadań';
      case 'comment':
        return 'komentarza';
      case 'user':
        return 'użytkownika';
      default:
        return '';
    }
  };

  const getDisturbedUserData = () => {
    if (type === 'collection') {
      return {
        id: complaint.task_collection.author.id,
        name: complaint.task_collection.author.login
      };
    }
    if (type === 'comment') {
      return {
        id: complaint.comment.user_id,
        name: complaint.comment.user.login
      };
    }
    if (type === 'user') {
      return {
        id: complaint.disturber_id,
        name: complaint.disturber.login
      };
    }
    return null;
  };

  const getSubjectContent = () => {
    if (type === 'collection') {
      return {
        id: complaint.collection_id,
        content: complaint.task_collection.name
      };
    }
    if (type === 'comment') {
      return {
        id: complaint.evaluation_id,
        content: complaint.comment.comment
      };
    }
    if (type === 'user') {
      return {
        id: complaint.disturber_id,
        content: complaint.disturber.login
      };
    }
    return null;
  };

  const disturberData = getDisturbedUserData();
  const subjectData = getSubjectContent();

  const isLoading = banUser.isLoading || resolveComplaint.isLoading;

  return (
    <>
      <DefaultPopup
        isOpen={true}
        onClose={onClose}
        title={`Szczegóły zgłoszenia ${getComplaintTypeName(type)}`}
        maxWidth="2xl"
        actions={
          <>
            {!complaint.solved_at && (
              <div className="flex gap-2">
                {type === 'user' && (
                  <button
                    onClick={() => setConfirmAction({
                      show: true,
                      type: 'ban',
                      userId: complaint.disturber_id,
                      userName: complaint.disturber.login
                    })}
                    disabled={isLoading}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                  >
                    {banUser.isLoading ? 'Banowanie...' : 'Zbanuj zgłoszonego'}
                  </button>
                )}

                {type === 'collection' && (
                  <button
                    onClick={() => setConfirmAction({
                      show: true,
                      type: 'ban',
                      userId: complaint.task_collection.author.id,
                      userName: complaint.task_collection.author.login
                    })}
                    disabled={isLoading}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                  >
                    {banUser.isLoading ? 'Banowanie...' : 'Zbanuj autora'}
                  </button>
                )}

                {type === 'comment' && (
                  <button
                    onClick={() => setConfirmAction({
                      show: true,
                      type: 'ban',
                      userId: complaint.comment.user_id,
                      userName: complaint.comment.user.login
                    })}
                    disabled={isLoading}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                  >
                    {banUser.isLoading ? 'Banowanie...' : 'Zbanuj autora'}
                  </button>
                )}

                <button
                  onClick={() => setConfirmAction({
                    show: true,
                    type: 'ban',
                    userId: complaint.appliciant_id,
                    userName: complaint.appliciant.login
                  })}
                  disabled={isLoading}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
                >
                  {banUser.isLoading ? 'Banowanie...' : 'Zbanuj zgłaszającego'}
                </button>

                <button
                  onClick={() => setConfirmAction({
                    show: true,
                    type: 'resolve'
                  })}
                  disabled={isLoading}
                  className="px-4 py-2 bg-[#69DC9E] text-black rounded-lg hover:bg-[#5bc78d] disabled:opacity-50"
                >
                  {resolveComplaint.isLoading ? 'Rozwiązywanie...' : 'Rozwiąż zgłoszenie'}
                </button>
              </div>
            )}
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Szczegóły zgłoszenia:</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p><strong>ID zgłoszenia:</strong> {complaint.id}</p>
              <p><strong>Data zgłoszenia:</strong> {new Date(complaint.created_at).toLocaleString()}</p>
              <p><strong>Status:</strong> {complaint.solved_at ? 'Rozwiązane' : 'W toku'}</p>
              {complaint.solved_at && (
                <p><strong>Data rozwiązania:</strong> {new Date(complaint.solved_at).toLocaleString()}</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Zgłaszający:</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <Link
                to={`/profile/${complaint.appliciant_id}`}
                className="text-blue-500 hover:underline"
              >
                {complaint.appliciant.login}
              </Link>
            </div>
          </div>

          {type === 'user' && (
            <div>
              <h3 className="font-semibold mb-2">Zgłoszony użytkownik:</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <Link
                  to={`/profile/${disturberData.id}`}
                  className="text-blue-500 hover:underline"
                >
                  {disturberData.name}
                </Link>
              </div>
            </div>
          )}

          {type === 'collection' && (
            <div>
              <h3 className="font-semibold mb-2">Zgłoszony zbiór:</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <strong>Tytuł:</strong>{' '}
                <Link
                  to={`/task-collection/${subjectData.id}`}
                  className="text-blue-500 hover:underline"
                >
                  {subjectData.content}
                </Link>
                <p className="mt-2">
                  <strong>Autor:</strong>{' '}
                  <Link
                    to={`/profile/${disturberData.id}`}
                    className="text-blue-500 hover:underline"
                  >
                    {disturberData.name}
                  </Link>
                </p>
              </div>
            </div>
          )}

          {type === 'comment' && (
            <div>
              <h3 className="font-semibold mb-2">Zgłoszony komentarz:</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <strong>Treść:</strong>{' '}
                <Link
                  to={`/task-collection/${complaint.comment.collection_id}`}
                  className="text-blue-500 hover:underline break-keep">
                  {subjectData.content}
                </Link>
                <p className="mt-2">
                  <strong>Autor:</strong>{' '}
                  <Link
                    to={`/profile/${disturberData.id}`}
                    className="text-blue-500 hover:underline"
                  >
                    {disturberData.name}
                  </Link>
                </p>
              </div>
            </div>
          )}

          <div>
            <h3 className="font-semibold mb-2">Uzasadnienie:</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              {formatJustification(complaint.justification)}
            </div>
          </div>
        </div>
      </DefaultPopup>

      {confirmAction.show && (
        <ActionConfirmationPopup
          isOpen={true}
          onClose={() => setConfirmAction({ show: false, type: null, userId: null, userName: null })}
          {...getConfirmationConfig()}
        />
      )}
    </>
  );
};

export default ComplaintDetailsPopup;