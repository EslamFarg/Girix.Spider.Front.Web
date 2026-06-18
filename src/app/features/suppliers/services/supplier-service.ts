import BaseService from '@/core/services/BaseService';
import { Injectable } from '@angular/core';
import {
    ISupplierCreateRequest,
    ISupplierReadResponse,
    ISupplierSearchResponseValue,
    ISupplierUpdateRequest,
} from './supplier-types';
import { BaseCrudService } from '@/core/services/BaseCrudService';
import { BaseSearchAndCrudService, SearchColumEnum } from '@/core/services/BaseSearchAndCrudService';
//Supplier : Id,Name,PhoneNumber

export enum SupplierSearchEnum {
    Id = SearchColumEnum.Id,
    Name = SearchColumEnum.Name,
    PhoneNumber = SearchColumEnum.PhoneNumber,
}

@Injectable({
    providedIn: 'root',
})
export class SupplierService extends BaseSearchAndCrudService<
    ISupplierSearchResponseValue,
    SupplierSearchEnum,
    ISupplierCreateRequest,
    ISupplierUpdateRequest,
    ISupplierReadResponse
> {
    override apiRoute = 'Supplier';

    /**
     *
     */
    constructor() {
        super();
        this.patchEndpoints({
            put: 'Update',
        });
    }

    getDefaultSupplier() {
        return this.http.get<{
            id: number;
            name: string;
            supplierCode: string;
            phoneNumber: string;
            secondaryMobileNumber: string;
            city: string;
            district: string;
            street: string;
            buildingNumber: string;
            apartment: string;
            landmark: string;
            postalCode: string;
            commercialRegister: string;
            taxNumber: string;
            isCompany: boolean;
            numberOfFloor: number;
            financiallyAccountId: number;
        }>(`${this.apiRoute}/GetCashSupplierByAccount`);
    }
}
