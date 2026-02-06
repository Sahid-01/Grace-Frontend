const BASE_URL = import.meta.env.VITE_API_URL;

export const ManualEvaluationsApi = {
  fetchManualEvaluations: `${BASE_URL}manual-evaluations/`,
  createManualEvaluation: `${BASE_URL}manual-evaluations/`,
  getManualEvaluation: (id: number | string) =>
    `${BASE_URL}manual-evaluations/${id}/`,
  updateManualEvaluation: (id: number | string) =>
    `${BASE_URL}manual-evaluations/${id}/`,
  patchManualEvaluation: (id: number | string) =>
    `${BASE_URL}manual-evaluations/${id}/`,
  deleteManualEvaluation: (id: number | string) =>
    `${BASE_URL}manual-evaluations/${id}/`,
};
