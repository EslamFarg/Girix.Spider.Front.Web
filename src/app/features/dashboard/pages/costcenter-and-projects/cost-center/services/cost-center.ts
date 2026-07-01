import { Injectable } from '@angular/core';
import { BasehttpService } from '../../../../../../shared/services/basehttp-service';

@Injectable({
  providedIn: 'root',
})
export class CostCenterService extends BasehttpService{

   constructor() {
    super('',{
      'create':'api/CostCenter/Create',
      'update':'api/CostCenter/Update',
      'getAll':'api/CostCenter/GetAll',
      'getById':'api/CostCenter/GetById',
      'delete':'api/CostCenter/Delete',
      'search':'api/CostCenter/Search'
    });
  }
}
