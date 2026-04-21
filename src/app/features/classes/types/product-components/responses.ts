export interface IComponentReadResponse {
  id: number;
  menuItemId: number;
  menuItemName: string;
  componentId: number;
  componentName: string;
  unitId: number;
  unitName: string;
  quantity: number;
  price: number;
}

export interface IProductComponentsReadResponse {
  menuItemId: number
  components: IProductComponents[]
}

export interface IProductComponents {
  id: number
  componentId: number
  componentName: string
  unitId: number
  unitName: string
  quantity: number
  price: number
}