import { DestroyRef, inject, Injectable, signal } from "@angular/core";
import { SupplierModel } from "../../features/dashboard/pages/customers-and-supplier/suppliers/models/supplier";
import { Suppliers } from "../../features/dashboard/pages/customers-and-supplier/suppliers/services/suppliers";
import { productModel } from "../../features/dashboard/pages/products/product-card/models/product-card";
import { ProductCardService } from "../../features/dashboard/pages/products/product-card/services/product-card";
import { UnitOfMeasure } from "../../features/dashboard/pages/products/units-of-measurement/services/unit-of-measure";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";


@Injectable({
    providedIn: 'root'
})
export class LookupFacade {
    constructor() { }
    // !!! Services
      private supplierService = inject(Suppliers);
      private productService = inject(ProductCardService);
      private unitOfMeasureService = inject(UnitOfMeasure);
      private destroyRef = inject(DestroyRef);
    // !!!! Properties
    suppliers = signal<SupplierModel[]>([]);
    products = signal<productModel[]>([]);
    unitOfMeasures = signal<any[]>([]);

    // !!!! Methods
    loadSuppliers() : any {
        this.supplierService.getAllWithoutPagination().pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((res:any)=>{
            this.suppliers.set(res.data.rows);
        });
    }

    loadProduct() : any {
        this.productService.getAllWithoutPagination().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((res:any)=>{
            this.products.set(res.data.rows);
        })
    }

    loadUnitOfMeaguare() : any {
        this.unitOfMeasureService.getAllWithoutPagination().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((res:any)=>{
            this.unitOfMeasures.set(res.data.rows);
        })
    }
}