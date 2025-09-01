import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { state: { alreadyLoggedIn: true } });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (location.state?.registered) {
      setSuccessMessage('Rejestracja zakończona pomyślnie! Sprawdź swoją skrzynkę email, aby zweryfikować konto.');
      setTimeout(() => setSuccessMessage(''), 5000);
    } else if (location.state?.verificationSuccess) {
      setSuccessMessage(location.state.message);
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  }, [location.state]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value,
    }));
    setErrorMessage('');
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.data?.message?.includes('nie zostało zweryfikowane')) {
        setErrorMessage('Konto nie zostało zweryfikowane. Sprawdź swoją skrzynkę email.');
      } else {
        setErrorMessage(err.response?.data?.message || 'Błąd logowania');
      }
    }
  };

  return (
    <div className="min-h-screen p-4 flex flex-col items-center justify-start">
      <h1 className="text-4xl md:text-5xl mt-16 md:mt-20 mb-6">
        Logowanie
      </h1>

      {successMessage && (
        <div className="fixed top-4 mt-24 left-1/2 z-10 md:w-1/5 text-center w-3/5 transform -translate-x-1/2 bg-white border border-black text-black px-6 py-4 rounded shadow-md text-lg">
          {successMessage}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md md:max-w-lg mt-16 md:mt-20 px-4 md:px-0 space-y-6"
      >
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-base md:text-lg font-medium"
          >
            E-mail
          </label>
          <input
            type="email"
            id="email"
            placeholder="Wpisz e-mail"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 rounded-3xl bg-[#F5F5F5] border-2 border-[#D9D9D9] shadow-lg focus:outline-none focus:ring-2 focus:ring-neutral-950"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="block text-base md:text-lg font-medium"
          >
            Hasło
          </label>
          <input
            type="password"
            id="password"
            placeholder="Wpisz hasło"
            value={formData.password}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 rounded-3xl bg-[#F5F5F5] border-2 border-[#D9D9D9] shadow-lg focus:outline-none focus:ring-2 focus:ring-neutral-950"
          />
        </div>

        {errorMessage && (
          <div className="text-red-500 text-sm md:text-base text-center">
            {errorMessage}
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <Link
            to="/register"
            className="w-full md:w-auto"
          >
            <button
              type="button"
              className="w-full md:w-auto px-6 py-2 text-lg md:text-xl bg-[#69DC9E] text-gray-900 rounded-3xl hover:bg-[#5bc78d] transition-colors"
            >
              Stwórz nowe konto
            </button>
          </Link>

          <button
            type="submit"
            className="w-full md:w-auto px-6 py-2 text-lg md:text-xl bg-[#69DC9E] text-gray-900 rounded-3xl hover:bg-[#5bc78d] transition-colors"
          >
            Zaloguj się
          </button>
        </div>
      </form>

      <div className="w-full max-w-md md:max-w-lg md:px-1 mt-4 text-center md:text-right">
        <Link
          to="/forgot-password"
          className="text-[#555555] hover:text-gray-800 text-sm md:text-base"
        >
          Przypomnij hasło
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;