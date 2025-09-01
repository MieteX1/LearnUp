import React from 'react';
import { Link } from 'react-router-dom';

const ComplaintsTable = ({
  title,
  complaints,
  onViewDetails,
  showResolved = false,
  onToggleResolved // New prop for handling checkbox change
}) => {
  const filteredComplaints = showResolved
    ? complaints
    : complaints.filter(complaint => !complaint.solved_at);

  const formatSelectedReasons = (justification) => {
    const match = justification.match(/SelectedReasons: (.*)/);
    if (match) {
      return match[1].split(', ').map(reason => (
        <span key={reason} className="inline-block bg-gray-100 rounded-full px-2 py-1 text-xs mr-1 mb-1">
          {reason}
        </span>
      ));
    }
    return justification;
  };

  const formatJustification = (justification) => {
    if (!justification) return null;
    const mainText = justification.split('SelectedReasons:')[0];
    const reasons = formatSelectedReasons(justification);

    return (
      <div>
        <div className="mb-1">{mainText}</div>
        <div className="flex flex-wrap">{reasons}</div>
      </div>
    );
  };

  const renderSubjectContent = (complaint) => {
    if ('task_collection' in complaint) {
      return (
        <Link
          to={`/task-collection/${complaint.collection_id}`}
          className="text-blue-500 hover:underline"
        >
          {complaint.task_collection.name}
        </Link>
      );
    }
    if ('comment' in complaint) {
      return (
        <Link to={`/task-collection/${complaint.comment.collection_id}`} className="text-blue-500 hover:underline">
          {complaint.comment.comment}
        </Link>
      );
    }
  };

  const getDisturbedUser = (complaint) => {
    if ('task_collection' in complaint) {
      return (
        <Link
          to={`/profile/${complaint.task_collection.author.id}`}
          className="text-blue-500 hover:underline"
        >
          {complaint.task_collection.author.login}
        </Link>
      );
    }
    if ('comment' in complaint) {
      return (
        <Link
          to={`/profile/${complaint.comment.user_id}`}
          className="text-blue-500 hover:underline"
        >
          {complaint.comment.user.login}
        </Link>
      );
    }
    if ('disturber' in complaint) {
      return (
        <Link
          to={`/profile/${complaint.disturber_id}`}
          className="text-blue-500 hover:underline"
        >
          {complaint.disturber.login}
        </Link>
      );
    }
    return 'Nieznany użytkownik';
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 bg-[#69DC9E] rounded-t-lg">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">
            {title} ({filteredComplaints.length})
          </h3>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showResolved}
                onChange={onToggleResolved}
                className="form-checkbox h-4 w-4"
              />
              Pokaż rozwiązane zgłoszenia
            </label>
          </div>
        </div>
      </div>
      <div className="p-4 overflow-x-auto">
        <table className="w-full min-w-max">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">Zgłaszający</th>
              <th className="px-4 py-2 text-left">Treść zgłoszenia</th>
              <th className="px-4 py-2 text-left">Zgłoszony użytkownik</th>
              <th className="px-4 py-2 text-left">Uzasadnienie</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-center">Akcje</th>
            </tr>
          </thead>
          <tbody>
            {filteredComplaints.map((complaint,index) => (
              <tr key={complaint.id} className={index % 2 === 0 ? 'bg-[#69DC9E]/10 hover:bg-[#69DC9E]/20' : 'bg-white hover:bg-gray-50'}>
                <td className="px-4 py-2">
                  <Link
                    to={`/profile/${complaint.appliciant_id}`}
                    className="text-blue-500 hover:underline"
                  >
                    {complaint.appliciant.login}
                  </Link>
                </td>
                <td className="px-4 py-2">
                  {renderSubjectContent(complaint)}
                </td>
                <td className="px-4 py-2">
                  {getDisturbedUser(complaint)}
                </td>
                <td className="px-4 py-2 max-w-md">
                  {formatJustification(complaint.justification)}
                </td>
                <td className="px-4 py-2">
                  {complaint.solved_at ? (
                    <span className="text-green-600">Rozwiązane</span>
                  ) : (
                    <span className="text-yellow-600">W toku</span>
                  )}
                </td>
                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() => onViewDetails(complaint)}
                    className="text-blue-500 hover:underline"
                  >
                    Szczegóły
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComplaintsTable;