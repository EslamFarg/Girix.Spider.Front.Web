import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthServices } from "../../features/auth/services/auth-services";

export const guestGuard:CanActivateFn=(route,state)=>{
    const authServices=inject(AuthServices);
    const router = inject(Router);
    if(authServices.isLoggedIn()){
        // return false;
        return router.createUrlTree(['/home']);
    }
    return true;
}