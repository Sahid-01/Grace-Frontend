const BASE_URL = import.meta.env.VITE_API_URL;
export const authAPI = {
  login: `${BASE_URL}login/`,
  logout: `${BASE_URL}logout/`,
  self: `${BASE_URL}self/`,
};
