import React, { useState, useRef, useMemo } from 'react';
import {useParams, useNavigate, Link, Navigate} from 'react-router-dom';
import { MoreVertical, Trash2, UserX } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import ReportUserPopup from '../components/Reports/ReportUser.jsx';
import {useAlert} from "../components/ui/Alert.jsx";
const UserProfile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Local state
  const [showDropdown, setShowDropdown] = useState(false);
  const [showUserPopup, setShowUserPopup] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const {addAlert} = useAlert();
  const isModeratorOrAdmin = currentUser?.role === 'moderator' || currentUser?.role === 'admin';
  const isOwnProfile = !id || currentUser?.id === parseInt(id,10);
  const targetId = parseInt(id, 10) || currentUser?.id;

  // Queries
  const { data: profileData, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['userProfile', targetId],
    queryFn: async () => {
      if (!targetId) {
        navigate('/login');
        return null;
      }
      try {
        const response = await axios.get(`/api/user/${targetId}`);
        return response.data;
      } catch (error) {
        if (error.response?.status === 404) {
          return { error: 404 };
        }
        if (error.response?.status === 403) {
          return { error: 403 };
        }
        throw error;
      }
    },
    enabled: !!targetId
  });

  const { data: allCollections, isLoading: isLoadingCollections } = useQuery({
    queryKey: ['userCollections', targetId],
    queryFn: async () => {
      const response = await axios.post(
        'http://localhost:3000/api/task-collection/filter/',
        { author: targetId, best_first: true }
      );
      return response.data.filter(collection => {
        if (currentUser?.id === targetId) return true;
        return collection.is_public;
      });
    },
    enabled: !!targetId
  });

  const { data: authorStats, isLoading: isLoadingStats } = useQuery({
  queryKey: ['authorStats', targetId],
  queryFn: async () => {
    const response = await axios.get(`http://localhost:3000/api/task-collection/author/${targetId}`);
    return response.data;
  }
});
  const { data: totalTimeData } = useQuery({
    queryKey: ['totalTime', targetId],
    queryFn: async () => {
      const response = await axios.get('http://localhost:3000/api/user/total-times/');
      return response.data.find(user => user.user_id === targetId);
    },
    enabled: isOwnProfile
  });

  // Mutations
  const banUserMutation = useMutation({
    mutationFn: async (userId) => {
      await axios.post(
        `http://localhost:3000/api/user/ban/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );
    },
    onSuccess: () => {
      addAlert('Użytkownik został zbanowany','success');
      setShowDropdown(false);
      queryClient.invalidateQueries(['userProfile', targetId]);
    },
    onError: (error) => {
      console.error('Error banning user:', error);
      addAlert('Wystąpił błąd podczas banowania użytkownika','error');
    }
  });
  const formatTime = (timeString) => {
    if (!timeString) return "0 min";

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


  // Filtered collections based on search term
  const filteredCollections = useMemo(() => {
    if (!allCollections) return [];
    return allCollections.filter(collection =>
      collection.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allCollections, searchTerm]);

  // Handlers
  const handleBanUser = () => {
    banUserMutation.mutate(targetId);
  };

  const getImageForType = (typeId) => {
    switch (typeId) {
      case 1: return '/images/default-task-type/math.png';
      case 2: return '/images/default-task-type/IT.png';
      case 3: return '/images/default-task-type/physics.png';
      case 4: return '/images/default-task-type/chemistry.png';
      default: return '/images/placeholder-photo.jpg';
    }
  };

  const achievementStars = Array(10).fill(null);

  if (isLoadingProfile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#69DC9E]"></div>
      </div>
    );
  }

  if (!profileData || profileData.error) {
    return <Navigate to={`/${profileData?.error || 404}`} />;
  }


  return (
    <div className="max-w-4xl mx-auto mt-8 p-4 md:p-6">
      <div className="bg-white rounded-3xl border-2 border-[#69DC9E] p-4 md:p-6">
        <div className="border-b-2 border-[#69DC9E] py-4 md:py-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold flex-grow text-center mb-4">
              {(!id && currentUser?.id) || currentUser?.id === parseInt(id)
                ? 'Mój Profil'
                : `Profil użytkownika ${profileData?.login}`}
            </h1>
            {!isOwnProfile && (
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="p-1 rounded-full hover:bg-[#69DC9E]/20"
              >
                <MoreVertical size={20} className="text-gray-600"/>
              </button>
            )}
            {!isOwnProfile && showDropdown && (
              <div className="relative inline-block" ref={dropdownRef}>
                <div className="absolute border-2 mb-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10">
                  <button
                    className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-[#69DC9E]/10"
                  >
                    <UserX size={16}/>
                    Zaobserwuj użytkownika
                  </button>
                  {isModeratorOrAdmin ? (
                    <button
                      onClick={handleBanUser}
                      disabled={banUserMutation.isPending}
                      className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-[#69DC9E]/10 text-red-500"
                    >
                      <Trash2 size={16}/>
                      {banUserMutation.isPending ? 'Banowanie...' : 'Zbanuj użytkownika'}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setShowUserPopup(true);
                        setShowDropdown(false);
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-[#69DC9E]/10 text-red-500"
                    >
                      <Trash2 size={16}/>
                      Zgłoś użytkownika
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex items-start gap-16 mb-8">
            <img
                src={profileData?.avatar_id
                    ? `http://localhost:3000/api/uploads/${profileData.avatar_id}`
                    : (profileData?.profile_picture || "/images/profilePicture.png")}
                alt="Profile"
                className="w-[128px] rounded-full aspect-square object-cover my-auto"
            />
            <div className="flex flex-wrap gap-12 mt-8 justify-center items-center">
              {isOwnProfile && totalTimeData && (
                  <div className="text-center">
                    <p className="text-3xl font-bold">
                      {formatTime(totalTimeData.total_time)}
                    </p>
                    <p className="text-sm mt-2">Spędzony czas</p>
                  </div>
              )}
              <div className="text-center">
                <p className="text-3xl font-bold">
                  {isLoadingStats ? "..." : (authorStats?.statistics.average_rating || 0).toFixed(2)}/5⭐
                </p>
                <p className="text-sm mt-2">Ocena nauczyciela</p>
              </div>

              <div className="text-center">
                <p className="text-3xl font-bold">
                  {isLoadingStats ? "..." : authorStats?.statistics.total_subscribers || 0}
                </p>
                <p className="text-sm mt-2">Uczestników kursu</p>
              </div>

              <div className="text-center">
                <p className="text-3xl font-bold">
                  {isLoadingStats ? "..." : authorStats?.statistics.total_collections || 0}
                </p>
                <p className="text-sm mt-2">Liczba kursów</p>
              </div>

              <div className="text-center">
                <p className="text-3xl font-bold">
                  {isLoadingStats ? "..." : new Date(authorStats?.author.created_at).getFullYear()}r.
                </p>
                <p className="text-sm mt-2">Dołączył</p>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements Section */}
        <div className="border-b-2 border-[#69DC9E] py-4 md:py-6">
          <h2 className="text-lg font-semibold mb-7 text-center">Gablota</h2>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
            <img src="/images/badge.png" alt="Badge" className="w-[128px] h-[100px] my-auto"/>
            <div className="grid grid-cols-6 md:grid-cols-6 gap-2 m-auto">
              {achievementStars.map((_, i) => (
                  <img key={i} src="/images/badge.png" alt="Badge" className="w-[90px] h-[]"/>
              ))}
            </div>
          </div>
        </div>

        {/* Collections Section */}
        <div className="py-4 md:py-6">
          <h3 className="text-lg font-semibold mb-7 text-center">
            {isOwnProfile ? 'Moja Biblioteka' : 'Biblioteka'}
          </h3>

          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto mb-6">
          <input
              type="text"
              placeholder="Wyszukaj zbiór zadań..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 rounded-full border-2 border-[#69DC9E] focus:outline-none focus:border-[#5bc78d] transition-colors placeholder-gray-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}
          </div>

          {/* Collections Grid */}
          {filteredCollections.length === 0 ? (
            <p className="text-center text-gray-500">Brak zbiorów zadań do wyświetlenia.</p>
          ) : (
            <div className="space-y-4">
              {filteredCollections.slice(0, displayLimit).map((collection) => (
                <div key={collection.id} className="bg-white rounded-xl p-6 shadow-lg border border-[#69DC9E]">
                  <Link to={`/task-collection/${collection.id}`} className="block">
                    <div className="flex flex-col gap-4">
                      <div className="flex gap-6">
                        <img
                          src={getImageForType(collection.type_id)}
                          alt={collection.name}
                          className="w-60 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="text-xl font-medium mb-4">{collection.name}</h4>
                          <p className="text-sm">{collection.description}</p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-sm border-t pt-4">
                        <div className="flex items-center gap-2">
                          <span>{collection._count?.subscribers || 0} zapisanych użytkowników</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
              {filteredCollections.length > displayLimit && (
                <div className="text-center mt-6">
                  <button
                    onClick={() => setDisplayLimit(prev => prev + 15)}
                    className="bg-[#69DC9E] text-black px-6 py-2 rounded-full hover:bg-[#5bc78d] transition-colors"
                  >
                    Pokaż więcej
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Report User Popup */}
      {showUserPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <ReportUserPopup
            onClose={() => setShowUserPopup(false)}
            disturberId={parseInt(id, 10)}
            onSubmit={() => {
              addAlert('Zgłoszenie wysłane!', 'success');
              setShowUserPopup(false);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default UserProfile;