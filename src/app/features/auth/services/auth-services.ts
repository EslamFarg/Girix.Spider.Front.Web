import { inject, Injectable } from '@angular/core';
import { BasehttpService } from '../../../shared/services/basehttp-service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';
import { authModel } from '../models/auth';
import { Router } from '@angular/router';

import { jwtDecode } from 'jwt-decode';


@Injectable({
  providedIn: 'root',
})
export class AuthServices {

 http:HttpClient=inject(HttpClient);
 baseUrl=environment.baseUrl;
  router: Router = inject(Router);

 login(data:authModel){
  return this.http.post(`${this.baseUrl}/api/Auth/Login`,data);
 }


 getSession() {
  const localData = localStorage.getItem('erp_auth');

  if (localData) {
    return JSON.parse(localData);
  }

  const sessionData = sessionStorage.getItem('erp_auth');

  if (sessionData) {
    return JSON.parse(sessionData);
  }

  return null;
}

 getToken(){
  return this.getSession()?.token || null;
 }


 isLoggedIn():boolean{
  const token = this.getToken();
    if (!token) return false;
    // علشان نقلب العمليه بقا 
    // !true = false
    // !false = true
    return !this.isTokenExpired(token);
 }

isTokenExpired(token: string): boolean {
  try {
    const decoded: any = jwtDecode(token);
    // لو الحالي اكبر هتبقي بترو  انما هو بيتشك طول مهو اصغر هتبقي بفولس طب لو بقا اكبر هتبقي بترو
    return Date.now() >= decoded.exp * 1000;
  } catch {
    return true;
  }
}

 logout() {
    localStorage.removeItem('erp_auth');
    sessionStorage.removeItem('erp_auth');
    this.router.navigate(['/auth']);
  }
}
