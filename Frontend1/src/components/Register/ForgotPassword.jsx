import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    setError('');

    try {
      await axios.post('/api/auth/forgot-password', { email });
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError(err.response?.data?.message || 'Błąd wysyłania linku resetującego hasło');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-[#F5F5F5] p-8 rounded-[40px] shadow-lg border-[3px] border-[#69DC9E] w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Resetowanie hasła</h2>

        {status === 'success' ? (
          <div className="text-center">
            <p className="mb-6">
              Link do resetowania hasła został wysłany na podany adres email.
              Sprawdź swoją skrzynkę pocztową.
            </p>
            <Link
              to="/login"
              className="text-[#555555] hover:text-gray-800"
            >
              Wróć do logowania
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-lg font-medium">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-3xl bg-[#F5F5F5] border-2 border-[#D9D9D9] shadow-lg"
                placeholder="Wpisz swój email"
              />
            </div>

            {error && (
              <div className="text-red-500 text-center">{error}</div>
            )}

            <div className="flex flex-col items-center gap-4">
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full px-6 py-3 bg-[#69DC9E] text-black rounded-3xl hover:bg-[#5bc78d] transition-colors disabled:opacity-50"
              >
                {status === 'submitting' ? 'Wysyłanie...' : 'Wyślij link resetujący'}
              </button>

              <Link
                to="/login"
                className="text-[#555555] hover:text-gray-800"
              >
                Wróć do logowania
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;