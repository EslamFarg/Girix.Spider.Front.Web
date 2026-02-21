import { Route } from '@angular/router';
import { Products } from '@/features/classes/pages/products/products';
import { Meals } from '@/features/classes/pages/meals/meals';
import { Groups } from '@/features/classes/pages/groups/groups';
import { AddProduct } from '@/features/classes/pages/add-product/add-product';
import { EditProduct } from '@/features/classes/pages/edit-product/edit-product';
import { AddMeal } from '@/features/classes/pages/add-meal/add-meal';
import { AddGroup } from '@/features/classes/pages/add-group/add-group';
import { EditGroup } from '@/features/classes/pages/edit-group/edit-group';
import { ProductsLayout } from '@/features/classes/layouts/products-layout/products-layout';
import { MealsLayout } from '@/features/classes/layouts/meals-layout/meals-layout';
import { GroupsLayout } from '@/features/classes/layouts/groups-layout/groups-layout';
import { EditMeal } from '@/features/classes/pages/edit-meal/edit-meal';

export default [
  //products
  {
    path: 'products',
    component: ProductsLayout,
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: Products,
      },
      {
        path: 'add',
        component: AddProduct,
      },

      {
        path: ':id/edit',
        component: EditProduct,
      },
    ],
  },
  //melas
  {
    path: 'meals',
    component: MealsLayout,
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: Meals,
      },
      {
        path: 'add',
        component: AddMeal,
      },

      {
        path: ':id/edit',
        component: EditMeal,
      },
    ],
  },
  //groups
  {
    path: 'groups',
    component: GroupsLayout,
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: Groups,
      },
      {
        path: 'add',
        component: AddGroup,
      },

      {
        path: ':id/edit',
        component: EditGroup,
      },
    ],
  },
] satisfies Route[];
