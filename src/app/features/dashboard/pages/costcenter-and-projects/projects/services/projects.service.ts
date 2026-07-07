import { Injectable } from "@angular/core";
import { BasehttpService } from "../../../../../../shared/services/basehttp-service";

@Injectable({
    providedIn: 'root'
})

export class ProjectsService extends BasehttpService {
    constructor() {
    super('',{
      'create':'api/Project/Create',
      'update':'api/Project/Update',
      'getAll':'api/Project/GetAll',
      'getById':'api/Project/GetById',
      'delete':'api/Project/Delete',
      'search':'api/Project/Search'
    });
  }
}