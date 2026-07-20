import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment.development';
import {
  FixedAccountListResponse,
  UpdateFixedAccountItem,
} from '../models/fixed-account';

@Injectable({
  providedIn: 'root',
})
export class FixedAccountService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${environment.baseUrl}/api/FixedAccount`;

  getAll(pageIndex = 0, pageSize = 100): Observable<FixedAccountListResponse> {
    return this.http.get<FixedAccountListResponse>(
      `${this.endpoint}?PageIndex=${pageIndex}&PageSize=${pageSize}`
    );
  }

  update(items: UpdateFixedAccountItem[]): Observable<unknown> {
    return this.http.put(this.endpoint, items);
  }
}
