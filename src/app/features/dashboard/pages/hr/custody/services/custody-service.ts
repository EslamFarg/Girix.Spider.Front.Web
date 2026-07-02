import { Injectable } from '@angular/core';
import { BasehttpService } from '../../../../../../shared/services/basehttp-service';

@Injectable({
  providedIn: 'root',
})
export class CustodyService extends BasehttpService {

    constructor() {
    super('',{
      'create':'api/Custody/Create',
      'update':'api/Custody/Update',
      'getAll':'api/Custody/GetAll',
      'getById':'api/Custody/GetById',
      'delete':'api/Custody/Delete',
      'search':'api/Custody/Search'
    });
  }
}
