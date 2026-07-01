import { Injectable } from '@angular/core';
import { BasehttpService } from '../../../../../../shared/services/basehttp-service';

@Injectable({
  providedIn: 'root',
})
export class ProductCardService extends BasehttpService {

   constructor() {
    super('',{
      'create':'api/Product/Create',
      'update':'api/Product/Update',
      'getAll':'api/Product/GetAll',
      'getById':'api/Product/GetById',
      'delete':'api/Product/Delete',
      'search':'api/Product/Search'
    });
  }
}
