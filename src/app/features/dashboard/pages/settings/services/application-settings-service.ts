import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BasehttpService } from '../../../../../shared/services/basehttp-service';
import {
  ApplicationSettingsByBranchResponse,
  ApplicationSettingsListResponse,
  ApplicationSettingsModel,
  ApplicationSettingsMutationResponse,
} from '../models/application-settings';

@Injectable({
  providedIn: 'root',
})
export class ApplicationSettingsService extends BasehttpService {
  private readonly upsertEndpoint = 'api/ApplicationSettings/Upsert';
  private readonly getAllEndpoint = 'api/ApplicationSettings/GetAll';
  private readonly getByBranchEndpoint = 'api/ApplicationSettings/GetByBranch';
  private readonly resetMovementsEndpoint = 'api/ApplicationSettings/ResetMovements';
  private readonly resetMovementsAndProductsEndpoint =
    'api/ApplicationSettings/ResetMovementsAndProducts';
  private readonly resetAllDataEndpoint = 'api/ApplicationSettings/ResetAllData';

  constructor() {
    super('', {});
  }

  getAll(): Observable<ApplicationSettingsListResponse> {
    return this.http.get<ApplicationSettingsListResponse>(
      `${this.baseUrl}/${this.getAllEndpoint}`
    );
  }

  getByBranch(branchId: number): Observable<ApplicationSettingsByBranchResponse> {
    return this.http.get<ApplicationSettingsByBranchResponse>(
      `${this.baseUrl}/${this.getByBranchEndpoint}?branchId=${branchId}`
    );
  }

  upsert(data: ApplicationSettingsModel): Observable<ApplicationSettingsMutationResponse> {
    return this.http.put<ApplicationSettingsMutationResponse>(
      `${this.baseUrl}/${this.upsertEndpoint}`,
      data
    );
  }

  resetMovements(): Observable<ApplicationSettingsMutationResponse> {
    return this.http.post<ApplicationSettingsMutationResponse>(
      `${this.baseUrl}/${this.resetMovementsEndpoint}`,
      {}
    );
  }

  resetMovementsAndProducts(): Observable<ApplicationSettingsMutationResponse> {
    return this.http.post<ApplicationSettingsMutationResponse>(
      `${this.baseUrl}/${this.resetMovementsAndProductsEndpoint}`,
      {}
    );
  }

  resetAllData(): Observable<ApplicationSettingsMutationResponse> {
    return this.http.post<ApplicationSettingsMutationResponse>(
      `${this.baseUrl}/${this.resetAllDataEndpoint}`,
      {}
    );
  }
}
