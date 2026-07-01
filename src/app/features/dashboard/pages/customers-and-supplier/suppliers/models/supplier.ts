export interface SupplierModel {
  id: number
  code: string,
  name: string
  phoneNumber: string
  phoneCountryCode: string
  createAt: string
  customerType: number
  custAndSupType: number
  status: boolean
  idNumber: string
  taxNumber: string
  email: string
  creditLimit: number
  creditWarningLimit: number
}