import axios from "axios";

const apiClient = axios.create({
<<<<<<< HEAD
  baseURL: import.meta.env.VITE_API_BASE_URL,
=======
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1",
>>>>>>> 9ffea8ff169f00442db9aa4aee7a3f298b906656
  timeout: 10000,
  withCredentials: true, // REQUIRED: Enable cookies to be sent/received
  headers: {
    "Content-Type": "application/json",
  },
});

// No need to manually add token - backend uses cookie automatically
// Backend sets 'jwt' cookie on login/signup, browser sends it automatically
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect if not already on login or signup page
      const currentPath = window.location.pathname;
      if (
        currentPath !== "/login" &&
        currentPath !== "/signup" &&
        !currentPath.startsWith("/reset-password")
      ) {
        // Backend clears cookie automatically
        // Just redirect to login
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
