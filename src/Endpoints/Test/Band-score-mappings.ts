const BASE_URL = import.meta.env.VITE_API_URL;

export const Bandscore = {
  fetchBandScoreMappings: `${BASE_URL}band-score-mappings/`,
  createBandScoreMapping: `${BASE_URL}band-score-mappings/`,
  getBandScoreMapping: (id: number | string) =>
    `${BASE_URL}band-score-mappings/${id}/`,
  updateBandScoreMapping: (id: number | string) =>
    `${BASE_URL}band-score-mappings/${id}/`,
  patchBandScoreMapping: (id: number | string) =>
    `${BASE_URL}band-score-mappings/${id}/`,
  deleteBandScoreMapping: (id: number | string) =>
    `${BASE_URL}band-score-mappings/${id}/`,
};
