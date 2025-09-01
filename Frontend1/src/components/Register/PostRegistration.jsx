import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';

const PostRegistration = () => {
  const [resendStatus, setResendStatus] = useState('idle');
  const [error, setError] = useState('');
  const location = useLocation();
  const resendToken = location.state?.resendToken;

  const handleResendVerification = async () => {
    if (!resendToken) {
      setError('Brak tokenu do ponownego wysłania weryfikacji');
      return;
    }

    try {
      setResendStatus('sending');
      const config = {
        headers: { Authorization: `Bearer ${resendToken}` }
      };
      await axios.post('/api/auth/resend-verify-email', {}, config);
      setResendStatus('sent');
    } catch (err) {
      setResendStatus('error');
      setError(err.response?.data?.message || 'Błąd wysyłania emaila weryfikacyjnego');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-[#F5F5F5] p-8 rounded-[40px] shadow-lg border-[3px] border-[#69DC9E] w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-6">Zweryfikuj swój email</h2>

        <p className="mb-6">
          Na Twój adres email został wysłany link weryfikacyjny.
          Sprawdź swoją skrzynkę pocztową i kliknij w link, aby aktywować konto.
        </p>

        {resendStatus === 'sent' ? (
          <p className="text-green-600 mb-6">
            Email weryfikacyjny został wysłany ponownie!
          </p>
        ) : (
          <button
            onClick={handleResendVerification}
            disabled={resendStatus === 'sending'}
            className="mb-6 px-6 py-2 bg-[#69DC9E] text-black rounded-3xl hover:bg-[#5bc78d] transition-colors disabled:opacity-50"
          >
            {resendStatus === 'sending' ? 'Wysyłanie...' : 'Wyślij ponownie'}
          </button>
        )}

        {error && (
          <p className="text-red-500 mb-6">{error}</p>
        )}

        <Link
          to="/login"
          className="text-[#555555] hover:text-gray-800"
        >
          Przejdź do logowania
        </Link>
      </div>
    </div>
  );
};

export default PostRegistration;