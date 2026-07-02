
export interface RowSectionModel {
  isSuccess: boolean
  data: Data
}

export interface Data {
  rows: Row[]
  paginationInfo: PaginationInfo
}

export interface Row {
  id: number
  nameAr: string
  nameEn: string
}

export interface PaginationInfo {
  totalRowsCount: number
  totalPagesCount: number
}