import { Injectable } from '@angular/core';
import { BasehttpService } from '../../../../../../shared/services/basehttp-service';

@Injectable({
  providedIn: 'root',
})
export class PurchaseOrderService extends BasehttpService {

  constructor() {
    super('',{
      'create':'api/PurchaseRequest/Create',
      'update':'api/PurchaseRequest/Update',
      'getAll':'api/PurchaseRequest/GetAll',
      'getById':'api/PurchaseRequest/GetById',
      'delete':'api/PurchaseRequest/Delete',
      'search':'api/PurchaseRequest/Search'
    });
  }
}
