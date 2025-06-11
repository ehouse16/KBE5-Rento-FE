import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: '', // 상대경로만 사용
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

        const response = await axios.post(
          '/api/auth/refresh', // baseURL 없이 상대경로로 요청
          null,
          {
            headers: { 'RefreshToken': refreshToken },
            withCredentials: true
          }
        );

        const newAccessToken = response.headers['AccessToken'];
        const newRefreshToken = response.headers['RefreshToken'];

        if (newAccessToken && newRefreshToken) {
          localStorage.setItem('accessToken', newAccessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          originalRequest.headers['AccessToken'] = newAccessToken;
          originalRequest.headers['RefreshToken'] = newRefreshToken;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
