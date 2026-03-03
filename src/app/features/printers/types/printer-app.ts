import { IPrinterSearchRow } from "./printer-api";

export enum AppPrinterType {
  cashierPrinter = 'cashierPrinter',
  captionOrderPrinter = 'captionOrderPrinter',
  programPrinter = 'programPrinter',
}

export interface IAppPrinter extends IPrinterSearchRow {
  appPrinterType: AppPrinterType;
}