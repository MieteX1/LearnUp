import React from 'react';
import Slider from 'react-slick';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext.jsx';

import "../../pages/Dots_for_carousel.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const TaskCollections = ({ isLoggedIn }) => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  // Query for user collections (if logged in)
  const { data: userCollections } = useQuery({
    queryKey: ['userCollections'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:3000/api/task-collection/user-collections', {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        params: { limit: 12 }
      });
      return response.data;
    },
    enabled: isLoggedIn
  });

  // Query for top rated collections
  const { data: topRatedCollections } = useQuery({
    queryKey: ['collections', 'topRated'],
    queryFn: async () => {
      const response = await axios.post('http://localhost:3000/api/task-collection/filter', {
        is_public: true,
        best_first: true,
        limit: 12
      });
      return response.data;
    }
  });

  // Query for most participants
  const { data: mostParticipantsCollections } = useQuery({
    queryKey: ['collections', 'mostParticipants'],
    queryFn: async () => {
      const response = await axios.post('http://localhost:3000/api/task-collection/filter', {
        is_public: true,
        subscription_first: true,
        limit: 12
      });
      return response.data;
    }
  });

  // Query for newest collections
  const { data: newestCollections } = useQuery({
    queryKey: ['collections', 'newest'],
    queryFn: async () => {
      const response = await axios.post('http://localhost:3000/api/task-collection/filter', {
        is_public: true,
        new_first: true,
        limit: 12
      });
      return response.data;
    }
  });

  const getImageForType = (typeId) => {
    switch (typeId) {
      case 1: return '/images/default-task-type/math.png';
      case 2: return '/images/default-task-type/IT.png';
      case 3: return '/images/default-task-type/physics.png';
      case 4: return '/images/default-task-type/chemistry.png';
      default: return '/images/placeholder-photo.jpg';
    }
  };

  const getProgressColor = (progress) => {
    if (progress < 34) return '#FF4500';
    if (progress < 67) return '#FFA500';
    return '#006400';
  };

  const renderCollectionCard = (collection, sectionTitle, index) => (
    <div
      key={collection.id}
      className="p-6 cursor-pointer"
      onClick={() => navigate(`/task-collection/${collection.id}`)}
    >
      <div className="rounded-[25px] bg-gradient-to-br from-[#69DC9E] to-[#F9CB40] p-[4px] hover:opacity-95 transition-opacity">
        <div className="rounded-[25px] bg-[#F5F5F5] bg-opacity-80 hover:bg-opacity-95 transition-colors p-[25px] pt-[20px] pb-[5px]">
          <img
            src={collection?.photo_id ? `http://localhost:3000/api/uploads/${collection.photo_id}` : getImageForType(collection.type_id)}
            alt={`Zbiór ${collection.name}`}
            className="w-full h-48 object-cover rounded-[25px]"
          />
          <h3 className="text-base sm:text-lg lg:text-xl text-center mt-2 truncate">
            {collection.name}
          </h3>
          <p className="text-base text-left mt-2 flex items-center">
            <img
              src={sectionTitle === '📙 Własne zbiory'
                ? (currentUser?.avatar_id ? `http://localhost:3000/api/uploads/${currentUser.avatar_id}` : (currentUser?.profile_picture || "/images/profilePicture.png"))
                : (collection.author?.avatar_id ? `http://localhost:3000/api/uploads/${collection.author.avatar_id}` : (collection.author?.profile_picture || "/images/profilePicture.png"))}
              alt={`Profil ${sectionTitle === '📙 Własne zbiory' ? currentUser?.login : collection.author?.login}`}
              className="w-5 h-5 rounded-full mr-2"
            />
            {sectionTitle === '📙 Własne zbiory' ? currentUser?.login : (collection.author?.login || 'Nieznany')}
          </p>

          {((index === 0 && !isLoggedIn) || (index === 2 && isLoggedIn)) && (
            <div className="flex justify-between text-sm sm:text-base mt-12">
              <span>⭐ {collection.avg_rank}/5</span>
              <span>{collection._count?.rank || 0} ocen</span>
            </div>
          )}

          {((index === 1 && !isLoggedIn) || (index === 3 && isLoggedIn)) && (
            <div className="text-sm sm:text-base text-center mt-12">
              🔥 {collection._count?.subscribers || 0} zapisanych użytkowników
            </div>
          )}

          {((index === 2 && !isLoggedIn) || (index === 4 && isLoggedIn)) && (
            <div className="text-sm sm:text-base text-center mt-12">
              🥇 {collection._count?.subscribers || 0} zapisanych użytkowników
            </div>
          )}

          {(index === 0 || index === 1) && isLoggedIn && (
            <div className="mt-12 text-center">
              <span style={{ color: getProgressColor(collection.progress || 0) }}>
                📈 Postęp: {collection.progress || 0}%
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderSection = (section, index) => {
    if (!section.data || section.data.length === 0) {
      return section.emptyMessage ? (
        <div className="text-center text-gray-500 py-10">{section.emptyMessage}</div>
      ) : null;
    }

    return (
      <div className="w-[80%] mx-auto relative">
        {section.data.length ===1 ? (
          <div className="flex justify-center">
            {renderCollectionCard(section.data[0], section.title, index)}
          </div>
        ) : (
          <Slider {...sliderSettings}>
            {section.data.map(collection => renderCollectionCard(collection, section.title, index))}
          </Slider>
        )}
      </div>
    );
  };

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 4,
    slidesToScroll: 4,
    autoplay: true,
    autoplaySpeed: 7000,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
    appendDots: dots => (
      <div>
        <ul className="flex"> {dots} </ul>
      </div>
    ),
    customPaging: i => (
      <button>
        <span className="sr-only">Slajd {i + 1}</span>
      </button>
    ),
    dotsClass: 'slick-dots',
    responsive: [
      { breakpoint: 1436, settings: { slidesToShow: 3, slidesToScroll: 3 } },
      { breakpoint: 1090, settings: { slidesToShow: 2, slidesToScroll: 2 } },
      { breakpoint: 738, settings: { slidesToShow: 1, slidesToScroll: 1 } }
    ]
  };

  const sections = isLoggedIn
    ? [
        {
          title: '⌛ Ostatnio aktualizowane',
          data: userCollections?.subscribed || [],
          emptyMessage: 'Nie zasubskrybowałeś jeszcze zbiorów zadań'
        },
        {
          title: '📙 Własne zbiory',
          data: userCollections?.owned || [],
          emptyMessage: 'Nie masz jeszcze własnych zbiorów zadań'
        },
        { title: '⭐ Najwyżej oceniane', data: topRatedCollections || [] },
        { title: '🥇 Najwięcej użytkowników', data: mostParticipantsCollections || [] },
        { title: '🆕 Najnowsze', data: newestCollections || [] }
      ]
    : [
        { title: '⭐ Najwyżej oceniane', data: topRatedCollections || [] },
        { title: '🥇 Najwięcej użytkowników', data: mostParticipantsCollections || [] },
        { title: '🆕 Najnowsze', data: newestCollections || [] }
      ];

  return (
    <div>
      <h1 className="text-4xl md:text-5xl text-center mb-10 mt-10">Zbiory zadań</h1>

      {sections.map((section, index) => (
        <div key={index} className="w-full">
          <div className="flex flex-col sm:flex-row items-center text-center mb-10 mt-10 w-full sm:w-[90%] lg:w-[85%] mx-auto px-4 lg:px-0">
            <h2 className="text-xl sm:text-2xl sm:mr-3 mx-auto sm:mx-0 text-nowrap ">{section.title}</h2>
            <div className="flex-grow h-[5px] w-[80%] sm:w-[60%] mt-2 sm:mt-0 bg-gradient-to-r from-[#69DC9E] via-[#F9CB40] to-[#69DC9E]" />
          </div>
          {renderSection(section, index)}
        </div>
      ))}
    </div>
  );
};

function SampleNextArrow({ onClick }) {
  return (
    <div
      className="hidden lg:block absolute right-[-30px] xl:right-[-40px] top-1/2 -translate-y-1/2 text-[#F9CB40] hover:text-[#E1B83A] text-[40px] xl:text-[50px] cursor-pointer z-10 transition-colors"
      onClick={onClick}
    >
      &#10095;
    </div>
  );
}

function SamplePrevArrow({ onClick }) {
  return (
    <div
      className="hidden lg:block absolute left-[-30px] xl:left-[-40px] top-1/2 -translate-y-1/2 text-[#F9CB40] hover:text-[#E1B83A] text-[40px] xl:text-[50px] cursor-pointer z-10 transition-colors"
      onClick={onClick}
    >
      &#10094;
    </div>
  );
}

export default TaskCollections;