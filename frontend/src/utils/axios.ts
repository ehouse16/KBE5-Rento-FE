import axios from 'axios';

const API_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.rento.world';

// 디버깅을 위한 로그 추가
console.log('API_URL:', API_URL);
console.log('Environment:', process.env.NODE_ENV);
console.log('REACT_APP_API_BASE_URL:', process.env.REACT_APP_API_BASE_URL);

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false // CORS 문제 해결을 위해 false로 설정
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // 로그인, 회원가입 등 토큰이 필요 없는 요청은 제외
    if (
      config.url?.includes('/api/managers/login') ||
      config.url?.includes('/api/managers/register') ||
      config.url?.includes('/api/managers/sign-up')
    ) {
      return config;
    }

    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

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
  (response) => {
    console.log('Response received:', response.status, response.data);
    return response;
  },
  async (error) => {
    console.error('Response error:', error.response?.status, error.response?.data);
    console.error('Error config:', error.config);
    
    const originalRequest = error.config;

    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      const errorMessage = error.response?.data?.message;
      originalRequest._retry = true;

      if (errorMessage === '액세스 토큰이 만료되었습니다.') {
        try {
          const refreshToken = localStorage.getItem('refreshToken');
          if (!refreshToken) throw new Error('No refresh token available');

          const response = await axios.post(
            `${API_URL}api/tokens/refresh`,
            null,
            {
              headers: { 'RefreshToken': refreshToken },
              withCredentials: false
            }
          );

          const newAccessToken = response.headers['accesstoken'];
          const newRefreshToken = response.headers['refreshtoken'];

          if (newAccessToken && newRefreshToken) {
            localStorage.setItem('accessToken', newAccessToken);
            localStorage.setItem('refreshToken', newRefreshToken);

            originalRequest.headers['AccessToken'] = newAccessToken;
            originalRequest.headers['RefreshToken'] = newRefreshToken;

            console.log('🔑 originalRequest AccessToken:', originalRequest.headers['AccessToken']);
            console.log('♻️ originalRequest RefreshToken:', originalRequest.headers['RefreshToken']);
            return axiosInstance(originalRequest);
          } else {
            throw new Error('New tokens not found in response');
          }
        } catch (refreshError: any) {
          const status = refreshError?.response?.status;
          const msg = refreshError?.response?.data?.message;

          if (status === 401 || status === 403 || msg === '리프레시 토큰이 만료되었습니다.') {
            alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/manager-login';
          }

          return Promise.reject(refreshError);
        }
      } else if (errorMessage === '리프레시 토큰이 만료되었습니다.') {
        alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/manager-login';
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;