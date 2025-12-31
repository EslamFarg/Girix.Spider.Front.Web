export interface IPaginatedResponse<T> {
  rows: T[];
  paginationInfo: {
    totalRowsCount: number;
    totalPagesCount: number;
  };
}
