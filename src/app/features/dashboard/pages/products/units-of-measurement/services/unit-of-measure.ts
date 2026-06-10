import { Injectable } from '@angular/core';
import { BasehttpService } from '../../../../../../shared/services/basehttp-service';

@Injectable({
  providedIn: 'root',
})
export class UnitOfMeasure  extends BasehttpService{


  constructor(){
    super('',
      {
        "create":'api/UnitOfMeasure',
        "getAll":'api/UnitOfMeasure',
        "getById":'/api/UnitOfMeasure',
        "update":'api/UnitOfMeasure',
        "delete":'/api/UnitOfMeasure',
        'search':'api/UnitOfMeasure/Search'
      }
    )

  }
}
