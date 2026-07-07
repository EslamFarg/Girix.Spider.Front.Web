import { Injectable } from '@angular/core';
import { BasehttpService } from '../../../../../../shared/services/basehttp-service';

@Injectable({
  providedIn: 'root',
})
export class AllowancesService extends BasehttpService{
    constructor() {
    super('',{
      'create':'api/Allowance/Create',
      'update':'api/Allowance/Update',
      'getAll':'api/Allowance/GetAll',
      'getById':'api/Allowance/GetById',
      'delete':'api/Allowance/Delete',
      'search':'api/Allowance/Search'
    });
  }
}
