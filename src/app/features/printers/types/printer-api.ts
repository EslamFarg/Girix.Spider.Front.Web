export interface IPrinterCreateRequest {
  name: string;
  ipAddressOrMacAddress: string;
  port: number;
  comPort: number;
  type: number;
}

export interface IPrinterUpdateRequest {
  id: number;
  name: string;
  ipAddressOrMacAddress: string;
  comPort: number;
  port: number;
  type: number;
}

export enum PrinterType{
  Network = 1,
  Bluetooth = 2
}

export interface IPrinterReadResponse {
  id: number;
  name: string;
  ipAddressOrMacAddress: string;
  comPort: number;
  port: number;
  type: PrinterType;
}



export interface IPrinterSearchRow {
  id: number;
  name: string;
  ipAddressOrMacAddress: string;
  comPort: number;
  port: number;
  type: number;
}

export interface IPrinterSearchResponseValue {
  rows: IPrinterSearchRow[];
  paginationInfo: {
    totalRowsCount: number;
    totalPagesCount: number;
    currentPageIndex: number;
  };
}