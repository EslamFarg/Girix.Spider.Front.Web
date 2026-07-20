import { DestroyRef, inject, Injectable, signal } from "@angular/core";
import { SupplierModel } from "../../features/dashboard/pages/customers-and-supplier/suppliers/models/supplier";
import { Suppliers } from "../../features/dashboard/pages/customers-and-supplier/suppliers/services/suppliers";
import { productModel } from "../../features/dashboard/pages/products/product-card/models/product-card";
import { ProductCardService } from "../../features/dashboard/pages/products/product-card/services/product-card";
import { UnitOfMeasure } from "../../features/dashboard/pages/products/units-of-measurement/services/unit-of-measure";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { InventoriesServices } from "../../features/dashboard/pages/products/inventories/services/inventories-services";
import { tap } from "rxjs";


@Injectable({
    providedIn: 'root'
})
export class LookupFacade {
    constructor() { }
    // !!! Services
      private supplierService = inject(Suppliers);
      private productService = inject(ProductCardService);
      private unitOfMeasureService = inject(UnitOfMeasure);
      private inventoriesService = inject(InventoriesServices);
      private destroyRef = inject(DestroyRef);
    
    // !!!! Properties
    suppliers = signal<SupplierModel[]>([]);
    products = signal<any[]>([]);
    unitOfMeasures = signal<any[]>([]);
    inventories = signal<any[]>([]);
    inventoriesWithPagination = signal<any[]>([]);
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


    loadInventories(){
        this.inventoriesService.getAllWithoutPagination().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((res:any)=>{
            this.inventories.set(res.data.rows);
        })
    }
    // loadInventoriesWithPagination(page: number, pageSize: number){
    //     this.inventoriesService.getAllSendInQuery(page, pageSize).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((res:any)=>{
    //         // this.inventories.set(res.data.rows);
    //         this.inventoriesWithPagination.set([
    //             ...this.inventories(),
    //             ...res.data.rows
    //           ]);
    //     })
    // }

    loadInventoriesWithPagination(page: number, pageSize: number) {
        return this.inventoriesService
          .getAllSendInQuery(page, pageSize)
          .pipe(
            tap((res: any) => {
              this.inventoriesWithPagination.set([
                ...this.inventoriesWithPagination(),
                ...res.data.rows
              ]);
            })
          );
      }
}