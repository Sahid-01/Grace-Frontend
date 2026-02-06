const BASE_URL = import.meta.env.VITE_API_URL;

export const LessonProgressApi = {
  // GET /lesson-progress/ - Fetch all progress
  fetchProgress: `${BASE_URL}lesson-progress/`,

  // POST /lesson-progress/ - Create progress
  createProgress: `${BASE_URL}lesson-progress/`,

  // GET /lesson-progress/{id}/ - Get specific progress
  getProgress: (id: number | string) => `${BASE_URL}lesson-progress/${id}/`,

  // PUT /lesson-progress/{id}/ - Update progress
  updateProgress: (id: number | string) => `${BASE_URL}lesson-progress/${id}/`,

  // PATCH /lesson-progress/{id}/ - Partially update progress
  patchProgress: (id: number | string) => `${BASE_URL}lesson-progress/${id}/`,

  // DELETE /lesson-progress/{id}/ - Delete progress
  deleteProgress: (id: number | string) => `${BASE_URL}lesson-progress/${id}/`,

  // POST /lesson-progress/update_progress/ - Update progress with lesson_id
  updateProgressByLesson: `${BASE_URL}lesson-progress/update_progress/`,
};
