import { Route } from "@angular/router";
import { Profile } from "@/features/settings/pages/profile/profile";
import { Restaurant } from "@/features/settings/pages/restaurant/restaurant";
import { ChangePassword } from "@/features/settings/pages/change-password/change-password";
import { DatabaseSettings } from "@/features/settings/pages/database-settings/database-settings";


 export default [
  {
    path: 'profile',
    component: Profile
  },
  {
    path: 'change-password',
    component: ChangePassword
  },
  {
    path: 'restaurant',
    component: Restaurant
  },
  {
    path: 'database-settings',
    component: DatabaseSettings,
  },
] satisfies Route[];
