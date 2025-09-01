import LoadingSpinner from "../LoadingSpinner.jsx";
import ComplaintsTable from "../tables/ComplaintsTable.jsx";

export const ComplaintsSection = ({
  complaints,
  isLoading,
  showResolvedComplaints,
  onToggleResolved,
  onViewDetails
}) => {
  if (isLoading) return <LoadingSpinner message="Ładowanie zgłoszeń..."/>;

  return (
    <div className="space-y-8">
      <ComplaintsTable
        title="Zgłoszone zbiory zadań"
        complaints={complaints.collections}
        onViewDetails={onViewDetails}
        showResolved={showResolvedComplaints.collections}
        onToggleResolved={() => onToggleResolved(prev => ({
          ...prev,
          collections: !prev.collections
        }))}
      />

      <ComplaintsTable
        title="Zgłoszone komentarze"
        complaints={complaints.comments}
        onViewDetails={onViewDetails}
        showResolved={showResolvedComplaints.comments}
        onToggleResolved={() => onToggleResolved(prev => ({
          ...prev,
          comments: !prev.comments
        }))}
      />

      <ComplaintsTable
        title="Zgłoszeni użytkownicy"
        complaints={complaints.users}
        onViewDetails={onViewDetails}
        showResolved={showResolvedComplaints.users}
        onToggleResolved={() => onToggleResolved(prev => ({
          ...prev,
          users: !prev.users
        }))}
      />
    </div>
  );
};
export default ComplaintsSection;