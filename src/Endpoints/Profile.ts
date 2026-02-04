const BASE_URL = import.meta.env.VITE_API_URL;

export const UserProfileApi = {
  // GET /usersprofiles/
  fetchUserProfiles: `${BASE_URL}usersprofiles/`,

  // POST /usersprofiles/
  createUserProfile: `${BASE_URL}usersprofiles/`,

  // GET /usersprofiles/{id}/
  getUserProfile: (id: number | string) => `${BASE_URL}usersprofiles/${id}/`,

  // PUT /usersprofiles/{id}/
  updateUserProfile: (id: number | string) => `${BASE_URL}usersprofiles/${id}/`,

  // PATCH /usersprofiles/{id}/
  patchUserProfile: (id: number | string) => `${BASE_URL}usersprofiles/${id}/`,

  // DELETE /usersprofiles/{id}/
  deleteUserProfile: (id: number | string) => `${BASE_URL}usersprofiles/${id}/`,
};

export const TeacherProfileApi = {
  // GET /teachersprofile/
  fetchTeacherProfiles: `${BASE_URL}teachersprofile/`,

  // POST /teachersprofile/
  createTeacherProfile: `${BASE_URL}teachersprofile/`,

  // GET /teachersprofile/{id}/
  getTeacherProfile: (id: number | string) =>
    `${BASE_URL}teachersprofile/${id}/`,

  // PUT /teachersprofile/{id}/
  updateTeacherProfile: (id: number | string) =>
    `${BASE_URL}teachersprofile/${id}/`,

  // PATCH /teachersprofile/{id}/
  patchTeacherProfile: (id: number | string) =>
    `${BASE_URL}teachersprofile/${id}/`,

  // DELETE /teachersprofile/{id}/
  deleteTeacherProfile: (id: number | string) =>
    `${BASE_URL}teachersprofile/${id}/`,

  // GET /teachersprofile/by_subject/
  getTeachersBySubject: `${BASE_URL}teachersprofile/by_subject/`,
};

export const StudentProfileApi = {
  // GET /studentsprofile/
  fetchStudentProfiles: `${BASE_URL}studentsprofile/`,

  // POST /studentsprofile/
  createStudentProfile: `${BASE_URL}studentsprofile/`,

  // GET /studentsprofile/{id}/
  getStudentProfile: (id: number | string) =>
    `${BASE_URL}studentsprofile/${id}/`,

  // PUT /studentsprofile/{id}/
  updateStudentProfile: (id: number | string) =>
    `${BASE_URL}studentsprofile/${id}/`,

  // PATCH /studentsprofile/{id}/
  patchStudentProfile: (id: number | string) =>
    `${BASE_URL}studentsprofile/${id}/`,

  // DELETE /studentsprofile/{id}/
  deleteStudentProfile: (id: number | string) =>
    `${BASE_URL}studentsprofile/${id}/`,

  // GET /studentsprofile/by_grade/
  getStudentsByGrade: `${BASE_URL}studentsprofile/by_grade/`,
};
