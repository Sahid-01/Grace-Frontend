const BASE_URL = import.meta.env.VITE_API_URL;

export const CourseApi = {
  // GET /course/
  fetchCourses: `${BASE_URL}course/`,

  // POST /course/
  createCourse: `${BASE_URL}course/`,

  // GET /course/{id}/
  getCourse: (id: number | string) => `${BASE_URL}course/${id}/`,

  // PUT /course/{id}/
  updateCourse: (id: number | string) => `${BASE_URL}course/${id}/`,

  // PATCH /course/{id}/
  patchCourse: (id: number | string) => `${BASE_URL}course/${id}/`,

  // DELETE /course/{id}/
  deleteCourse: (id: number | string) => `${BASE_URL}course/${id}/`,
};
