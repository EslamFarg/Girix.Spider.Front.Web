/** Backend validates PageSize in the range 0–100 (inclusive). */
export const API_MAX_PAGE_SIZE = 100;

/** Default page size for grid screens that hide pagination UI but still page on the API. */
export const API_GRID_PAGE_SIZE = API_MAX_PAGE_SIZE;
