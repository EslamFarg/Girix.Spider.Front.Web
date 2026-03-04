import { Route } from '@angular/router';
import { Login } from '@/features/auth/pages/login/login';
import { ForgotPassword } from '@/features/auth/pages/forgot-password/forgot-password';
import { OtpVerification } from '@/features/auth/pages/otp-verification/otp-verification';
import { ResetPassword } from '@/features/auth/pages/reset-password/reset-password';
import { CrmLogin } from '@/features/auth/pages/crm-login/crm-login';
import { CrmOtpValidation } from '@/features/auth/pages/crm-otp-validation/crm-otp-validation';

export default [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: Login,
  },
  {
    path: 'forgot-password',
    component: ForgotPassword,
  },
  {
    path: 'otp-verification',
    component: OtpVerification,
  },
  {
    path: 'reset-password',
    component: ResetPassword,
  },
  {
    path: 'crm-login',
    component: CrmLogin,
  },
  {
    path: 'crm-otp-validation',
    component: CrmOtpValidation,
  },
] satisfies Route[];
