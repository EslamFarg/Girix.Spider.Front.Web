import { Route } from "@angular/router";
import { Profile } from "@/features/app-info/pages/profile/profile";
import { Restaurant } from "@/features/app-info/pages/restaurant/restaurant";


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