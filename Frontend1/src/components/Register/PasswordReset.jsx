import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const PasswordReset = () => {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Hasła muszą być takie same');
      return;
    }

    if (!token) {
      setError('Token resetowania hasła jest wymagany');
      return;
    }

    try {
      setStatus('submitting');
      await axios.post(`/api/auth/reset-password?token=${token}`, { password });
      setStatus('success');
      setTimeout(() => {
        navigate('/login', { state: { passwordReset: true } });
      }, 3000);
    } catch (err) {
      setStatus('error');
      setError(err.response?.data?.message || 'Błąd resetowania hasła');
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-[#F5F5F5] p-8 rounded-[40px] shadow-lg border-[3px] border-[#69DC9E] w-full max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">Hasło zostało zmienione!</h2>
          <p className="mb-6">Za chwilę zostaniesz przekierowany do strony logowania.</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#69DC9E] mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-[#F5F5F5] p-8 rounded-[40px] shadow-lg border-[3px] border-[#69DC9E] w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Resetowanie hasła</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="password" className="block text-lg font-medium">
              Nowe hasło
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-3xl bg-[#F5F5F5] border-2 border-[#D9D9D9] shadow-lg"
              placeholder="Wpisz nowe hasło"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-lg font-medium">
              Potwierdź hasło
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-3xl bg-[#F5F5F5] border-2 border-[#D9D9D9] shadow-lg"
              placeholder="Potwierdź nowe hasło"
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
              {status === 'submitting' ? 'Resetowanie...' : 'Zresetuj hasło'}
            </button>

            <Link
              to="/login"
              className="text-[#555555] hover:text-gray-800"
            >
              Wróć do logowania
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordReset;