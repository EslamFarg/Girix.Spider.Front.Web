import { Route } from "@angular/router";
import { Profile } from "./profile/profile";
import { Restaurant } from "./restaurant/restaurant";


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