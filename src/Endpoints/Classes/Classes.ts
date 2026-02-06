const BASE_URL = import.meta.env.VITE_API_URL;

export const ClassesApi = {
  // GET /classes/ - Fetch all classes (students can read)
  fetchClasses: `${BASE_URL}classes/`,

  // POST /classes/ - Create a new class (admin only)
  createClass: `${BASE_URL}classes/`,

  // GET /classes/{id}/ - Get a specific class
  getClass: (id: number | string) => `${BASE_URL}classes/${id}/`,

  // PUT /classes/{id}/ - Update a class (admin only)
  updateClass: (id: number | string) => `${BASE_URL}classes/${id}/`,

  // PATCH /classes/{id}/ - Partially update a class (admin only)
  patchClass: (id: number | string) => `${BASE_URL}classes/${id}/`,

  // DELETE /classes/{id}/ - Delete a class (admin only)
  deleteClass: (id: number | string) => `${BASE_URL}classes/${id}/`,
};
