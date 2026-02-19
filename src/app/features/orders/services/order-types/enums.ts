import { SearchColumEnum } from "@/core";

export enum OrderSearchEnum {
  Id = SearchColumEnum.Id,
  OrderNumber = SearchColumEnum.OrderNumber,
  OrderType = SearchColumEnum.OrderType,
  CustomerName = SearchColumEnum.CustomerName,
  OrderPlace = SearchColumEnum.OrderPlace,
}
export enum OrderLocationType {
  DineIn = 1,
  Takeaway = 2,
  Delivery = 3,
}
export enum OrderPaymentType {
  Pending = 0,
  Paid = 1,
}
export enum OrderLocalType {
  Room = 1,
  Table = 2,
  Hut = 3,
}