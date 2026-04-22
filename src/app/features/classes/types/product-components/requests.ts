export interface IProductComponentCreateRequest {
  menuItemId: number
  components: IProductComponentCreateComponent[]
}

export interface IProductComponentCreateComponent {
  componentId: number
  unitId: number
  quantity: number
}

export interface IProductComponentUpdateRequest {
  menuItemId: number
  components: IProductComponentUpdateComponent[]
}

export interface IProductComponentUpdateComponent {
  componentId: number
  unitId: number
  quantity: number
}
