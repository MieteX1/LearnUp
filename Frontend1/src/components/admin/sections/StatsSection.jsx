import React from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from "../LoadingSpinner.jsx";

const formatTime = (timeString) => {
  // Split the time string and take only hours and minutes
  const [hours, minutes] = timeString.split(':');
  const totalHours = parseInt(hours);
  const mins = parseInt(minutes);

  // Calculate days and remaining hours if total hours > 24
  if (totalHours >= 24) {
    const days = Math.floor(totalHours / 24);
    const remainingHours = totalHours % 24;

    // Build the string based on whether there are remaining hours
    return remainingHours > 0
      ? `${days}d ${remainingHours}h ${mins}min`
      : `${days}d ${mins}min`;
  }

  // For less than 24 hours, return the original format
  return `${totalHours}h ${mins}min`;
};

const StatsSection = ({ stats, isLoading }) => {
  if (isLoading) return <LoadingSpinner message="Ładowanie statystyk..." />;

  // Sort stats by total time in descending order
  const sortedStats = [...stats].sort((a, b) => {
    const [hoursA, minutesA] = a.total_time.split(':');
    const [hoursB, minutesB] = b.total_time.split(':');
    const totalMinutesA = parseInt(hoursA) * 60 + parseInt(minutesA);
    const totalMinutesB = parseInt(hoursB) * 60 + parseInt(minutesB);
    return totalMinutesB - totalMinutesA;
  });

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 bg-[#69DC9E] rounded-t-lg">
          <h3 className="font-semibold">
            Czas spędzony przez użytkowników na stronie ({stats.length})
          </h3>
        </div>
        <div className="p-4">
          <table className="w-full">
            <thead>
              <tr className="bg-[#69DC9E]">
                <th className="px-6 py-3 text-center">Login</th>
                <th className="px-6 py-3 text-center">Całkowity czas</th>
              </tr>
            </thead>
            <tbody>
              {sortedStats.map((stat, index) => (
                <tr
                  key={stat.user_id}
                  className={index % 2 === 0 ? 'bg-[#69DC9E]/10' : 'bg-white'}
                >
                  <td className="px-6 py-4 text-center">
                    <Link
                      to={`/profile/${stat.user_id}`}
                      className="text-blue-500 hover:underline"
                    >
                      {stat.login}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-center">{formatTime(stat.total_time)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StatsSection;