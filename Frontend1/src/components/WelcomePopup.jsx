import React from 'react';
import { Link } from 'react-router-dom';

const WelcomePopup = () => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-7 overflow-y-auto">
      <div className="relative bg-white rounded-[40px] w-full max-w-5xl shadow-lg border-[5px] border-[#69DC9E]">

        {/* Content container */}
        <div className="p-5 md:p-10">
          {/* Header with logo */}
          <div className="flex items-center justify-center mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-semibold">Witaj na platformie</h2>
            <img src="/images/logo.svg" alt="LearnUp Logo" className="h-8 md:h-10 -mt-2" />
            <h2 className="text-xl md:text-2xl font-semibold">!🚀</h2>
          </div>

          {/* Main content */}
          <div className="text-base md:text-lg space-y-4 md:space-y-6">
            <p>Dołącz do społeczności LearnUp i odkryj nowe możliwości nauki! 📚</p>
            <div>
              <p className="mb-2">Załóż konto, aby:</p>
              <ul className="list-disc pl-8 md:pl-12 space-y-2">
                <li>Rozwiązywać zadania zebrane przez innych użytkowników i doskonalić swoje umiejętności,</li>
                <li>Tworzyć własne zbiory zadań i dzielić się nimi z innymi,</li>
                <li>Śledzić swoje postępy dzięki szczegółowym statystykom,</li>
                <li>Rywalizować z innymi i piąć się na szczyt rankingu!</li>
              </ul>
            </div>
            <p>Dołącz teraz i ucz się w swoim tempie, zdobywaj punkty, a przy tym baw się dobrze! ✨</p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0 mt-6 md:mt-8">
            <div>
              <Link
                to="/contact"
                className="w-full md:w-auto px-5 py-2 bg-[#F9CB40] hover:bg-[#E1B83A] text-black rounded-full text-base md:text-lg transition-colors text-center"
              >
                Kontakt
              </Link>
            </div>

            <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4 w-full md:w-auto">
              <Link
                to="/login"
                className="w-full md:w-auto px-5 py-2 bg-[#69DC9E] hover:bg-[#50B97E] text-black rounded-full text-base md:text-lg transition-colors text-center"
              >
                Zaloguj się
              </Link>
              <Link
                to="/register"
                className="w-full md:w-auto px-5 py-2 bg-[#69DC9E] hover:bg-[#50B97E] text-black rounded-full text-base md:text-lg transition-colors underline text-center"
              >
                Zarejestruj się
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePopup;