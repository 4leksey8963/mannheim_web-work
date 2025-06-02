import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, //.env*
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Интерцептор для обработки ошибок 401 (например, для попытки refresh токена)
// Это более сложная логика, пока можно опустить или добавить позже
// apiClient.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;
//     if (error.response.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;
//       try {
//         const refreshToken = localStorage.getItem('refreshToken');
//         if (!refreshToken) return Promise.reject(error); // Нет refresh токена

//         const { data } = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/refresh`, {
//           refresh_token: refreshToken,
//         });

//         localStorage.setItem('accessToken', data.access_token);
//         if (data.refresh_token) { // Если сервер вернул новый refresh токен
//            localStorage.setItem('refreshToken', data.refresh_token);
//         }
//         apiClient.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`;
//         originalRequest.headers['Authorization'] = `Bearer ${data.access_token}`;
//         return apiClient(originalRequest);
//       } catch (refreshError) {
//         // Ошибка при обновлении токена, разлогиниваем
//         localStorage.removeItem('accessToken');
//         localStorage.removeItem('refreshToken');
//         // TODO: Перенаправить на логин или вызвать функцию logout из AuthContext
//         console.error("Refresh token failed", refreshError);
//         return Promise.reject(refreshError);
//       }
//     }
//     return Promise.reject(error);
//   }
// );

export default apiClient;