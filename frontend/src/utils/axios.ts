import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://api.rento.world',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    console.log('Request interceptor - Tokens:', { accessToken, refreshToken });

    if (accessToken) {
      config.headers['AccessToken'] = accessToken;
    }
    if (refreshToken) {
      config.headers['RefreshToken'] = refreshToken;
    }

    // CORS 관련 헤더 추가
    config.headers['Access-Control-Allow-Origin'] = '*';
    config.headers['Access-Control-Allow-Methods'] = '*';
    config.headers['Access-Control-Allow-Headers'] = '*';

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // 토큰 갱신 요청
        const response = await axios.post('/api/auth/refresh', null, {
          headers: {
            'RefreshToken': refreshToken
          },
          withCredentials: true
        });

        const newAccessToken = response.headers['AccessToken'];
        const newRefreshToken = response.headers['RefreshToken'];

        if (newAccessToken && newRefreshToken) {
          localStorage.setItem('accessToken', newAccessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          // 원래 요청 재시도
          originalRequest.headers['AccessToken'] = newAccessToken;
          originalRequest.headers['RefreshToken'] = newRefreshToken;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/manager-login';
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance; 