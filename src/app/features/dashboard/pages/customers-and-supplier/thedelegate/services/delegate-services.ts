import { Injectable } from '@angular/core';
import { BasehttpService } from '../../../../../../shared/services/basehttp-service';

@Injectable({
  providedIn: 'root',
})
export class DelegateServices extends BasehttpService {


  constructor() {
    super('',{
      'create':'api/Delegates/Create',
      'getAll':'api/Delegates/GetAll',
      'getById':'api/Delegates/GetById',
      'update':'api/Delegates/Update',
      'delete':'api/Delegates/Delete',
      'search':'api/Delegates/Search',
    });
  }
}
