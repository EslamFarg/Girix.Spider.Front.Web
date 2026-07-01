export interface productModel{
  id?: number,
  code: string,
  nameAr: string,
  nameEn: string,
  name: string,
  productType: number,
  productTypeId: number,
  categoryId: number,
  groupId: number,
  vat: number,
  selectiveVat: number,
  isScaleItem: true,
  vatCode: string,
  taxExemptionReasonCode: string,
  taxExemptionReason: string,
  vatRate?: number,
  selectiveTaxRate?: number,
  productCards: [
    {
      id: number,
      unitOfMeasureId: number,
      isBaseUnit: true,
      smallerUnitId: number,
      conversionFactor: number,
      purchasePrice: number,
      retailPrice: number,
      wholesalePrice: number,
      barcode1: string,
      barcode2: string,
      isDefaultSellingUnit: true
    }
  ]

}