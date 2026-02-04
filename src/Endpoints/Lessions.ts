const BASE_URL = import.meta.env.VITE_API_URL;

export const LessonApi = {
  // GET /lesson/
  fetchLessons: `${BASE_URL}lesson/`,

  // POST /lesson/
  createLesson: `${BASE_URL}lesson/`,

  // GET /lesson/{id}/
  getLesson: (id: number | string) => `${BASE_URL}lesson/${id}/`,

  // PUT /lesson/{id}/
  updateLesson: (id: number | string) => `${BASE_URL}lesson/${id}/`,

  // PATCH /lesson/{id}/
  patchLesson: (id: number | string) => `${BASE_URL}lesson/${id}/`,

  // DELETE /lesson/{id}/
  deleteLesson: (id: number | string) => `${BASE_URL}lesson/${id}/`,
};
