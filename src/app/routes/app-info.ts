import { Route } from "@angular/router";
import { Profile } from "@/features/settings/pages/profile/profile";
import { Restaurant } from "@/features/settings/pages/restaurant/restaurant";


 export default [
  {
    path: 'profile',
    component: Profile
  },
  {
    path: 'restaurant',
    component: Restaurant
  }
] satisfies Route[]