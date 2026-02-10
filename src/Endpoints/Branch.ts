const BASE_URL = import.meta.env.VITE_API_URL;

export const BranchApi = {
  // GET /branches/
  fetchBranches: `${BASE_URL}branches/`,

  // POST /branches/
  createBranch: `${BASE_URL}branches/`,

  // GET /branches/{id}/
  getBranch: (id: number | string) => `${BASE_URL}branches/${id}/`,

  // PUT /branches/{id}/
  updateBranch: (id: number | string) => `${BASE_URL}branches/${id}/`,

  // PATCH /branches/{id}/
  patchBranch: (id: number | string) => `${BASE_URL}branches/${id}/`,

  // DELETE /branches/{id}/
  deleteBranch: (id: number | string) => `${BASE_URL}branches/${id}/`,
};
