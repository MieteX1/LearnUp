import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import md5 from 'blueimp-md5';


const RegisterPage = () => {
  const [formData, setFormData] = useState({
    login: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [showInfoSections, setShowInfoSections] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { state: { alreadyLoggedIn: true } });
    }
  }, [user, navigate]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Hasła muszą być takie same');
      return;
    }

    try {
      // Generate email hash for avatar
      const emailHash = md5(formData.email.trim().toLowerCase());
      const defaultAvatarUrl = `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${emailHash}`;
      const response = await axios.post('/api/auth/register', {
        login: formData.login,
        email: formData.email,
        password: formData.password,
        profile_picture: defaultAvatarUrl
      });
      navigate('/post-registration', {
        state: { resendToken: response.data.resendToken }
      });
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Błąd podczas rejestracji');
    }
};

  return (
    <div className="container mx-auto max-w-8xl px-6 md:px-0">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl mt-14 mb-2">Rejestracja</h1>
        <p className="text-xl md:text-2xl mb-2">
          Posiadasz już konto?{' '}
          <Link to="/login" className="text-black underline">
            Zaloguj się
          </Link>
        </p>
        <button
          onClick={() => setShowInfoSections(!showInfoSections)}
          className="text-lg font-normal underline cursor-pointer mb-20 px-4 md:px-0">
          Kliknij, aby zobaczyć, co zyskujesz rejestrując się
        </button>
      </div>

      <div className={`flex ${showInfoSections ? 'flex-col md:flex-row' : ''} flex-wrap justify-center gap-24`}>
        {/* Lewy panel informacyjny */}
        {showInfoSections && (
          <div className="w-full md:w-[20%]">
            <div className="bg-[rgba(245,245,245,0.8)] rounded-[40px] p-6 border-[3px] border-[#F9CB40]">
              <img src="images/register/collections.png" alt="Left Info" className="w-[60%] md:w-full rounded-[40px] mb-6 mx-auto" />
              <ul className="list-disc pl-4 space-y-2 text-sm md:text-base">
                <li>Tworzenie własnych zbiorów zadań</li>
                <li>Rozwiązywanie zbiorów zadań</li>
                <li>Biblioteka z zapisanymi zbiorami</li>
              </ul>
            </div>
          </div>
        )}

        {/* Formularz rejestracyjny */}
        <form onSubmit={handleSubmit} className="w-full md:w-[40%] space-y-4 order-3 md:order-none px-4 md:px-0">
          <div className="space-y-2">
            <label htmlFor="login" className="block text-lg md:text-xl">
              Login
            </label>
            <input
              type="text"
              id="login"
              placeholder="Wpisz login"
              value={formData.login}
              onChange={handleInputChange}
              required
              className="w-full rounded-3xl bg-[#F5F5F5] border-2 border-[#D9D9D9] px-6 py-3 text-base shadow-lg"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="block text-lg md:text-xl">
              E-mail
            </label>
            <input
              type="email"
              id="email"
              placeholder="Wpisz e-mail"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full rounded-3xl bg-[#F5F5F5] border-2 border-[#D9D9D9] px-6 py-3 text-base shadow-lg"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-lg md:text-xl">
              Hasło
            </label>
            <input
              type="password"
              id="password"
              placeholder="Wpisz hasło"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full rounded-3xl bg-[#F5F5F5] border-2 border-[#D9D9D9] px-6 py-3 text-base shadow-lg"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-lg md:text-xl">
              Powtórz hasło
            </label>
            <input
              type="password"
              id="confirmPassword"
              placeholder="Powtórz hasło"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              className="w-full rounded-3xl bg-[#F5F5F5] border-2 border-[#D9D9D9] px-6 py-3 text-base shadow-lg"
            />
          </div>

          <div className="w-full mt-4 text-center text-[#555555] text-sm md:text-base">
            Wymagane jest uzupełnienie wszystkich pól
          </div>

          {errorMessage && (
            <div className="text-red-500 text-left">{errorMessage}</div>
          )}

          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-[#69DC9E] text-black rounded-2xl px-24 py-3 text-lg md:text-xl mt-6"
            >
              Utwórz konto
            </button>
          </div>
        </form>

        {/* Prawy panel informacyjny */}
        {showInfoSections && (
          <div className="w-full md:w-[20%] space-y-4 order-2">
            <div className="bg-[rgba(245,245,245,0.8)] rounded-[40px] p-6 border-[3px] border-[#F9CB40]">
              <img src="/images/register/stats.png" alt="Right Info" className="w-[60%] md:w-full rounded-[40px] mb-4 mx-auto" />
              <ul className="list-disc pl-4 space-y-2 text-sm md:text-base">
                <li>Śledzenie swoich postępów dzięki szczegółowym statystykom</li>
                <li>Dołączanie do prywatnych zbiorów zadań</li>
                <li>Ocenianie i komentowanie zbiorów zadań</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>

  );
};

export default RegisterPage;
