const BASE_URL = import.meta.env.VITE_API_URL;
export const UserApi = {
  // GET /users/
  fetchUsers: `${BASE_URL}users/`,

  // POST /users/
  createUser: `${BASE_URL}users/`,

  // GET /users/{id}/
  getUser: (id: number | string) => `${BASE_URL}users/${id}/`,

  // PUT /users/{id}/
  updateUser: (id: number | string) => `${BASE_URL}users/${id}/`,

  // PATCH /users/{id}/
  patchUser: (id: number | string) => `${BASE_URL}users/${id}/`,

  // DELETE /users/{id}/
  deleteUser: (id: number | string) => `${BASE_URL}users/${id}/`,

  // POST /users/{id}/activate/
  activateUser: (id: number | string) => `${BASE_URL}users/${id}/activate/`,

  // POST /users/{id}/deactivate/
  deactivateUser: (id: number | string) => `${BASE_URL}users/${id}/deactivate/`,

  // GET /users/by_role/
  getUsersByRole: `${BASE_URL}users/by_role/`,

  // POST /users/change_password/
  changePassword: `${BASE_URL}users/change_password/`,

  // POST /users/force_change_password/
  forceChangePassword: `${BASE_URL}users/force_change_password/`,
};

// Forgot Password API
export const ForgotPasswordApi = {
  // POST /forgot-password/request/
  requestOTP: `${BASE_URL}forgot-password/request/`,

  // POST /forgot-password/verify/
  verifyAndReset: `${BASE_URL}forgot-password/verify/`,
};
