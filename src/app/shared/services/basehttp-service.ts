import { HttpClient } from '@angular/common/http';
import { Inject, inject, Injectable, InjectionToken } from '@angular/core';
import { environment } from '../../../environments/environment.development';

export const API_ROUTE = new InjectionToken<string>('API_ROUTE');
export const API_CUSTOM_ENDPOINTS = new InjectionToken<any>('API_CUSTOM_ENDPOINTS');
// 👉 هو مفتاح (Key) بتستخدمه عشان تخزن أو تجيب قيمة من الـ DI (Dependency Injection)
// قيمة عادية (String / URL)
// ❌ مش Service أو Class
@Injectable({
  providedIn: 'root',
})
export class BasehttpService {

  protected http:HttpClient=inject(HttpClient);
  protected baseUrl:string=environment.baseUrl;
  protected endPoints={
    'create':'create',
    'getAll':'getAll',
    'getById':'getById',
    'update':'update',
    'delete':'delete',
    'search':'search',
  }



  constructor(@Inject(API_ROUTE) private route:string,@Inject(API_CUSTOM_ENDPOINTS) private customEndpoints?:Partial<typeof this.endPoints>) {
    this.baseUrl+=this.route;
    if(this.customEndpoints){
      this.endPoints={
        ...this.endPoints,
        ...this.customEndpoints
      }
    }
  }


private buildUrl(endpoint: string): string {
  if (!endpoint) {
    return this.baseUrl;
  }
  return `${this.baseUrl}/${endpoint}`;
}

  create<T>(data:T,headers?:any){
    return this.http.post<T>(this.buildUrl(this.endPoints.create),data,{
      headers:{
        ...headers ?? ''
      }
    });
  }

  getAllSendInBody<T>(pagination?:T){
    return this.http.post<T>(`${this.baseUrl}/${this.endPoints.getAll}`,pagination);

  }
  getAllSendInQuery<T>(pageIndex?:number,pageSize?:number){
    return this.http.get<T>(`${this.baseUrl}/${this.endPoints.getAll}?PageIndex=${pageIndex}&PageSize=${pageSize}`);

  }
  getAllWithoutPagination<T>(){
    return this.http.get<T>(`${this.baseUrl}/${this.endPoints.getAll}`);

  }





  getById<T>(id:T){
    return this.http.get<T>(`${this.baseUrl}/${this.endPoints.getById}/${id}`);
  }
  update<T>(data:T,id?:string | number ,headers?:any){

    return this.http.put<T>(`${this.baseUrl}/${this.endPoints.update}/${id}`,data,{
      headers:{
        ...headers ?? ''
      }
    });
  }
  delete<T>(id:T){
    return this.http.delete<T>(`${this.baseUrl}/${this.endPoints.delete}/${id}`);
  }

  search<T>(data:T){
    return this.http.post(`${this.baseUrl}/${this.endPoints.search}`,data,{
      headers:{
           'skip-loading': 'true'
      }
    });
  }
}
