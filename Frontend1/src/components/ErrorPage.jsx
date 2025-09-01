import React from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import {ShieldAlert,ServerCrash } from 'lucide-react';

const ErrorPage = ({ code }) => {
  const navigate = useNavigate();

  const errorContent = {
    403: {
      title: 'Dostęp zabroniony',
      message: 'Nie masz uprawnień do wyświetlenia tej strony.',
      image: <ShieldAlert />,
      navigateValue: -3

    },
    404: {
      title: 'Strona nie znaleziona',
      message: 'Strona, której szukasz, nie istnieje lub została przeniesiona.',
      image: <ServerCrash />,
      navigateValue: -1
    }
  };

  const content = errorContent[code] || errorContent[404];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 ">
      <div className="max-w-4xl w-full text-center space-y-8 border-2 border-emerald-400  rounded-2xl p-10 bg-[#f5f5f5] bg-opacity-65 shadow-lg">
        {/* Error Code */}
        <div className="text-9xl font-bold text-[#69DC9E]">
          {code}
        </div>

        {/* Title and Message */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-gray-800">
            {content.title}
          </h1>
          <p className="text-xl text-gray-600">
            {content.message}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => navigate(content.navigateValue)}
            className="px-6 py-3 bg-[#69DC9E] text-black rounded-full hover:bg-[#5bc78d] transition-colors"
          >
            Wróć do poprzedniej strony
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-[#F9CB40] text-black rounded-full hover:bg-[#E1B83A] transition-colors"
          >
            Przejdź do strony głównej
          </button>
        </div>
      </div>
    </div>
  );
};

ErrorPage.propTypes = {
  code: PropTypes.oneOf([403, 404]).isRequired
};

export default ErrorPage;