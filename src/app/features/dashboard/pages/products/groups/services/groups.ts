import { Injectable } from '@angular/core';
import { BasehttpService } from '../../../../../../shared/services/basehttp-service';

@Injectable({
  providedIn: 'root',
})
export class GroupsServices extends BasehttpService {
  constructor() {
    super('',{
      'create':'api/ProductGroup/Create',
      'update':'api/ProductGroup/Update',
      'getAll':'api/ProductGroup/GetAll',
      'getById':'api/ProductGroup/GetById',
      'delete':'api/ProductGroup/Delete',
      'search':'api/ProductGroup/Search'
    });
  }
  
}
