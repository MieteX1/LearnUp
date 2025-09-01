import React, { useEffect, useState,useCallback  } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import TaskCollections from '../components/Task/TaskCollections.jsx';
import DailyQuote from '../components/DailyQuote';
import { useAuth } from '../context/AuthContext';


const Dashboard = () => {
  const [welcomeMessage, setWelcomeMessage] = useState('Witaj,');
  const [backgroundColor, setBackgroundColor] = useState('bg-[#69DC9E]');
  const [showUserLogin, setShowUserLogin] = useState(true);
  const [showParagraphs, setShowParagraphs] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showLoggedInMessage, setShowLoggedInMessage] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

   const handleWelcomeTransition = useCallback(() => {
    setWelcomeMessage('Gotowy na naukę?');
    setBackgroundColor('bg-[#F5F5F5]');
    setShowUserLogin(false);
    setShowParagraphs(true);
  }, []);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (location.state?.success) {
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    }

    if (location.state?.alreadyLoggedIn) {
      setShowLoggedInMessage(true);
      setTimeout(() => setShowLoggedInMessage(false), 3000);
    }

    const animationTimeout = setTimeout(handleWelcomeTransition, 3000);

    return () => clearTimeout(animationTimeout);
  }, [navigate, location.state, user, handleWelcomeTransition]);

  if (!user) {
    return null;
  }

  return (
    <div className="dashboard-container p-6">
      {showSuccessMessage && (
        <div className="fixed top-4 mt-24 left-1/2 z-10 md:w-1/5 text-center w-3/5 transform -translate-x-1/2 bg-white border border-black text-black px-6 py-4 rounded shadow-md text-lg">
          Zbiór zadań został pomyślnie dodany!
        </div>
      )}
      {showLoggedInMessage && (
        <div className="fixed top-4 mt-24 left-1/2 z-10 md:w-1/5 text-center w-3/5 transform -translate-x-1/2 bg-white border border-black text-black px-6 py-4 rounded shadow-md text-lg">
          Jesteś już zalogowany!
        </div>
      )}
      <div
        className={`transition-all duration-700 ${backgroundColor} text-black md:text-base text-sm border-[3px] border-[#69DC9E] bg-opacity-70 py-4 px-6 mt-16 rounded-[20px] text-center mx-auto w-4/5 md:w-3/5`}
      >
        <span className="font-bold text-lg">{welcomeMessage}</span>
        {showUserLogin && <span className="font-bold text-lg">{user.login}!</span>}
        {showParagraphs && (
          <div className="mt-4 space-y-3 text-left text-sm md:text-base leading-relaxed">
            <p>
              <span className="text-xl">📅</span>{' '}
              <span className="font-semibold">
                To już <span className="text-[#69DC9E]">5 dni z rzędu</span> odkąd jesteś tutaj!
              </span>{' '}
              Regularne wizyty to klucz do sukcesu. <span className="italic">Wracaj codziennie</span>, a Twoja nauka będzie
              tylko przyspieszać!
            </p>
            <p>
              <span className="text-xl">📈</span>{' '}
              <span className="font-semibold">
                Masz <span className="text-[#69DC9E]">3 zbiory zadań</span>, które są dopiero na początku swojej drogi
                (mniej niż 30%).
              </span>{' '}
              Nie poddawaj się – zacznij dziś, a z czasem zobaczysz, jak szybko pojawią się efekty! 🚀
            </p>
            <p>
              <span className="text-xl">🏆</span>{' '}
              <span className="font-semibold">
                Brawo! <span className="text-[#69DC9E]">4 zbiory zadań</span> są już prawie ukończone! (więcej niż 80%)
              </span>{' '}
              Jesteś tak blisko! Jeszcze tylko trochę wysiłku, a opanujesz cały materiał! 💪
            </p>
          </div>
        )}
      </div>
      <DailyQuote />
      <TaskCollections isLoggedIn={true} />
    </div>
  );
};

export default Dashboard;