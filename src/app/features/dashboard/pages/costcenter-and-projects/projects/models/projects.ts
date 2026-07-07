export interface Root {
  isSuccess: boolean
  data: projectsModel
}

export interface projectsModel {
  rows: RowProjectModel[]
  paginationInfo: PaginationInfo
}

export interface RowProjectModel {
  id: number
  referenceNumber: string
  nameAr: string
  nameEn: string
  projectValue: number
  projectTax: number
  insuranceValue: number
  insurancePercentage: number
  date: string
  startDate: string
  endDate: string
  technicalSpecsAttachment: string
  legalDocsAttachment?: string
  statement: string
  costCenters: CostCenter[]
}

export interface CostCenter {
  costCenterId: number
  nameAr: string
  nameEn: string
}

export interface PaginationInfo {
  totalRowsCount: number
  totalPagesCount: number
}
