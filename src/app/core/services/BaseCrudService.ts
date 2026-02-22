import { Observable, tap } from 'rxjs';
import BaseService from './BaseService';


export class BaseCrudService<ICreateDto = any, IUpdateDto = any, IGetByIdDto = any> extends BaseService {
  create<IDefaultCreateDto = ICreateDto>(createDto: IDefaultCreateDto | FormData) {
    return this.http.post<number>(`${this.apiUrl}/${this.endpoints.create}`, createDto).pipe(
      tap({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'تم الحفظ', detail: 'لقد قمت بالحفظ بنجاح' });
        },
      }),
    );
  }

  put<IDefaultUpdateDto = IUpdateDto>(createDto: IDefaultUpdateDto | FormData) {
    return this.http.put<number>(`${this.apiUrl}/${this.endpoints.update}`, createDto).pipe(
      tap({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'تم الحفظ', detail: 'لقد قمت بالحفظ بنجاح' });
        },
      }),
    );
  }

  patch<IDefaultUpdateDto = IUpdateDto>(createDto: IDefaultUpdateDto | FormData) {
    return this.http.patch<number>(`${this.apiUrl}/Update`, createDto).pipe(
      tap({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'تم الحفظ', detail: 'لقد قمت بالحفظ بنجاح' });
        },
      }),
    );
  }

  delete(id: number) {
    return this.http.delete<boolean>(`${this.apiUrl}/${this.endpoints.delete}${id}`).pipe(
      tap({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'تم الحذف', detail: 'لقد قمت بالحذف بنجاح' });
        },
      }),
    );
  }

  getById = (id: number) => this.http.get<IGetByIdDto>(`${this.apiUrl}/${this.endpoints.getById}${id}`);
}
