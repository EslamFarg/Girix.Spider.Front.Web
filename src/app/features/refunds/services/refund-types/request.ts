export interface IRefundCreateRequest {
  orderMasterId: number
  payingCash: number
  payingNetwork: number
  createAt: string
  idempotencyKey: string
  items: IRefundCreateItem[]
}

export interface IRefundCreateItem {
  orderDetailId: number
  quantity: number
  addons: IRefundCreateItemAddon[]
}

export interface IRefundCreateItemAddon {
  additionalOrderDetailsId: number
  quantity: number
}

//  Refund Update Request
export interface IRefundUpdateRequest {
  id: number
  paymentType: number
  payingCash: number
  payingNetwork: number
  items: IRefundUpdateItem[]
}

export interface IRefundUpdateItem {
  orderDetailId: number
  quantity: number
  addons: IRefundUpdateAddon[]
}

export interface IRefundUpdateAddon {
  additionalOrderDetailsId: number
  quantity: number
}

