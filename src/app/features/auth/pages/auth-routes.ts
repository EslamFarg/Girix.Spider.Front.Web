import { Route } from "@angular/router";
import { Login } from "@/features/auth/pages/login/login";
import { ForgotPassword } from "./forgot-password/forgot-password";
import { OtpVerification } from "./otp-verification/otp-verification";
import { ResetPassword } from "./reset-password/reset-password";

 export default [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: Login
  },
  {
    path: 'forgot-password',
    component: ForgotPassword
  },
  {
    path: 'otp-verification',
    component: OtpVerification
  },
  {
    path: 'reset-password',
    component: ResetPassword
  },
] satisfies Route[]