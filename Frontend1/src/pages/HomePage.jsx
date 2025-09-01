import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DailyQuote from '../components/DailyQuote';
import WelcomePopup from '../components/WelcomePopup';
import TaskCollections from '../components/Task/TaskCollections.jsx';

const HomePage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      setIsLoggedIn(true);
      navigate('/dashboard'); 
      return; 
    }
  }, [navigate]);


  return (
    <div>
      <WelcomePopup />
      <DailyQuote />
      <TaskCollections isLoggedIn={false} />
    </div>
  );
};

export default HomePage;
