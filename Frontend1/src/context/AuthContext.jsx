import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:3000';
axios.defaults.withCredentials = true;

const AuthContext = createContext(null);

// eslint-disable-next-line react/prop-types
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(() =>
    localStorage.getItem('accessToken')
  );
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    if (accessToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [accessToken]);

useEffect(() => {
  let refreshTimeout;
  const interceptor = axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Skip token refresh logic for login failures
      if (originalRequest.url?.includes('/api/auth/login')) {
        return Promise.reject(error);
      }

      // Prevent infinite loop and only attempt refresh if:
      // 1. It's a 401 error
      // 2. It's not already a refresh request
      // 3. It hasn't been retried yet
      // 4. We have a user logged in
      if (
        error.response?.status === 401 &&
        !originalRequest.url?.includes('/refresh') &&
        !originalRequest._retry &&
        user !== null
      ) {
        originalRequest._retry = true;

        try {
          const response = await axios.post('/api/auth/refresh', {},{withCredentials: true});
          const newAccessToken = response.data.access_token;

          setAccessToken(newAccessToken);
          localStorage.setItem('accessToken', newAccessToken);
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

          return axios(originalRequest);
        } catch (refreshError) {
          // If refresh fails, logout after a short delay
          clearTimeout(refreshTimeout);
          refreshTimeout = setTimeout(() => {
            logout();
          }, 100);
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    }
  );

  return () => {
    clearTimeout(refreshTimeout);
    axios.interceptors.response.eject(interceptor);
  };
}, [user]); // Added user dependency

  const updateUserProfile = async (userId, profileData) => {
    try {
      const response = await axios.put(`/api/user/${userId}`, profileData);
      setUser(prevUser => ({
        ...prevUser,
        ...response.data
      }));
      return response.data;
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  };

    useEffect(() => {
    const initializeAuth = async () => {
      if (accessToken) {
        try {
          const response = await axios.get('/api/auth/verify');
          setUser(response.data.user);
        } catch (error) {
          // Jeśli wystąpi błąd 401, próbuj odświeżyć token i ponownie zweryfikować
          if (error.response?.status === 401) {
            try {
              // Próba odświeżenia tokenu
              const refreshResponse = await axios.post('/api/auth/refresh', {}, { withCredentials: true });
              const newAccessToken = refreshResponse.data.access_token;

              // Aktualizacja tokenu w localStorage i w state
              setAccessToken(newAccessToken);
              localStorage.setItem('accessToken', newAccessToken);

              // Ponowna próba weryfikacji z nowym tokenem
              try {
                const verifyResponse = await axios.get('/api/auth/verify');
                setUser(verifyResponse.data.user);
              } catch (verifyError) {
                console.error('Token verification failed after refresh:', verifyError);
                setUser(null);
                setAccessToken(null);
                localStorage.removeItem('accessToken');
              }
            } catch (refreshError) {
              console.error('Token refresh failed:', refreshError);
              setUser(null);
              setAccessToken(null);
              localStorage.removeItem('accessToken');
            }
          } else {
            console.error('Token verification failed:', error);
            setUser(null);
            setAccessToken(null);
            localStorage.removeItem('accessToken');
          }
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, [accessToken]);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', {
        email,
        password,
      });

      const { access_token, payload } = response.data;
      setAccessToken(access_token);
      localStorage.setItem('accessToken', access_token);
      setUser({ id: payload.sub });

      return response.data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem('accessToken');
      window.location.href = '/';
    }
  };

  const value = {
    user,
    accessToken,
    isLoading,
    login,
    logout,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};