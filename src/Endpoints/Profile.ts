const BASE_URL = import.meta.env.VITE_API_URL;

// User Profile endpoints
export const userProfileAPI = {
  list: `${BASE_URL}user-profiles/`,
  detail: (id: number) => `${BASE_URL}user-profiles/${id}/`,
  create: `${BASE_URL}user-profiles/`,
  myProfile: `${BASE_URL}user-profiles/my_profile/`,
  createOwn: `${BASE_URL}user-profiles/create_own_profile/`,
  update: (id: number) => `${BASE_URL}user-profiles/${id}/`,
  delete: (id: number) => `${BASE_URL}user-profiles/${id}/`,
};

// Student Profile endpoints
export const studentProfileAPI = {
  list: `${BASE_URL}student-profiles/`,
  detail: (id: number) => `${BASE_URL}student-profiles/${id}/`,
  create: `${BASE_URL}student-profiles/`,
  myProfile: `${BASE_URL}student-profiles/my_profile/`,
  createOwn: `${BASE_URL}student-profiles/create_own_profile/`,
  update: (id: number) => `${BASE_URL}student-profiles/${id}/`,
  delete: (id: number) => `${BASE_URL}student-profiles/${id}/`,
  byGrade: (grade: string) =>
    `${BASE_URL}student-profiles/by_grade/?grade=${grade}`,
};

// Teacher Profile endpoints
export const teacherProfileAPI = {
  list: `${BASE_URL}teacher-profiles/`,
  detail: (id: number) => `${BASE_URL}teacher-profiles/${id}/`,
  create: `${BASE_URL}teacher-profiles/`,
  myProfile: `${BASE_URL}teacher-profiles/my_profile/`,
  createOwn: `${BASE_URL}teacher-profiles/create_own_profile/`,
  update: (id: number) => `${BASE_URL}teacher-profiles/${id}/`,
  delete: (id: number) => `${BASE_URL}teacher-profiles/${id}/`,
  bySubject: (subject: string) =>
    `${BASE_URL}teacher-profiles/by_subject/?subject=${subject}`,
};
