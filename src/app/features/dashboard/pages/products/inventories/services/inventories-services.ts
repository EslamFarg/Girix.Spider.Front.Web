import { Injectable } from '@angular/core';
import { BasehttpService } from '../../../../../../shared/services/basehttp-service';

@Injectable({
  providedIn: 'root',
})
export class InventoriesServices extends BasehttpService{

  constructor(){
    super('',{
      'create':'api/Warehouse',
      'update':'api/Warehouse',
      'getAll':'api/Warehouse',
      'getById':'api/Warehouse',
      'delete':'api/Warehouse',
      'search':'api/Warehouse/Search'
    })
  }
}
