import { FormControl } from "@angular/forms";
export interface InventoriesType {
  isSuccess: boolean
  data: Data
}

export interface Data {
  rows: Row[]
  paginationInfo: PaginationInfo
}

export interface Row {
  id: number
  name: string
}

export interface PaginationInfo {
  totalRowsCount: number
  totalPagesCount: number
}
