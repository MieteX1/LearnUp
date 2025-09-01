import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying');
  const [error, setError] = useState('');
  const token = searchParams.get('token');
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setError('Token weryfikacyjny jest wymagany');
        return;
      }

      try {
        const response = await axios.get(`/api/auth/verify-email?token=${token}`);
        setStatus('success');

        // Po sukcesie przekieruj do logowania
        setTimeout(() => {
          navigate('/login', {
            state: {
              verificationSuccess: true,
              message: 'Konto zostało pomyślnie zweryfikowane! Możesz się teraz zalogować.'
            }
          });
        }, 3000);
      } catch (err) {
        if (err.response?.data?.message?.includes('już zweryfikowane')) {
          // Jeśli konto jest już zweryfikowane, przekieruj do logowania
          setTimeout(() => {
            navigate('/login', {
              state: {
                verificationSuccess: true,
                message: 'Konto zostało już wcześniej zweryfikowane! Możesz się zalogować.'
              }
            });
          }, 3000);
        } else {
          setStatus('error');
          setError(err.response?.data?.message || 'Błąd weryfikacji emaila');
        }
        setStatus(err.response?.data?.message?.includes('już zweryfikowane') ? 'success' : 'error');
        setError(err.response?.data?.message || 'Błąd weryfikacji emaila');
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-[#F5F5F5] p-8 rounded-[40px] shadow-lg border-[3px] border-[#69DC9E] w-full max-w-md text-center">
        {status === 'verifying' && (
          <>
            <h2 className="text-2xl font-bold mb-4">Weryfikacja emaila</h2>
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#69DC9E]"></div>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <h2 className="text-2xl font-bold mb-4 text-[#69DC9E]">
              {error?.includes('już zweryfikowane')
                ? 'Konto zostało już wcześniej zweryfikowane!'
                : 'Email został pomyślnie zweryfikowany!'}
            </h2>
            <p className="mb-6">Za chwilę zostaniesz przekierowany do strony logowania.</p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#69DC9E] mx-auto"></div>
          </>
        )}

        {status === 'error' && (
          <>
            <h2 className="text-2xl font-bold mb-4 text-red-500">Błąd weryfikacji</h2>
            <p className="mb-6">{error}</p>
            <button
              onClick={() => navigate('/login')}
              className="bg-[#69DC9E] text-black px-6 py-2 rounded-3xl hover:bg-[#5bc78d] transition-colors"
            >
              Wróć do logowania
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;