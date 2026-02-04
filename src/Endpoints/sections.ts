const BASE_URL = import.meta.env.VITE_API_URL;

export const SectionApi = {
  // GET /sections/
  fetchSections: `${BASE_URL}sections/`,
  
  // POST /sections/
  createSection: `${BASE_URL}sections/`,
  
  // GET /sections/{id}/
  getSection: (id: number | string) => `${BASE_URL}sections/${id}/`,
  
  // PUT /sections/{id}/
  updateSection: (id: number | string) => `${BASE_URL}sections/${id}/`,
  
  // PATCH /sections/{id}/
  patchSection: (id: number | string) => `${BASE_URL}sections/${id}/`,
  
  // DELETE /sections/{id}/
  deleteSection: (id: number | string) => `${BASE_URL}sections/${id}/`,
};
