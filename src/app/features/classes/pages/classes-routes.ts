import { Route } from '@angular/router';
import { Products } from '@/features/classes/pages/products/products';
import { Meals } from '@/features/classes/pages/meals/meals';
import { Groups } from '@/features/classes/pages/groups/groups';
import { ViewProduct } from '@/features/classes/pages/view-product/view-product';
import { AddProduct } from '@/features/classes/pages/add-product/add-product';
import { EditProduct } from '@/features/classes/pages/edit-product/edit-product';
import { AddMeal } from './add-meal/add-meal';
import { ViewMeal } from './view-meal/view-meal';
import { AddGroup } from './add-group/add-group';
import { ViewGroup } from './view-group/view-group';
import { EditGroup } from './edit-group/edit-group';

export default [
  //products
  {
    path: 'products',
    component: Products,
  },
  {
    path: 'products/add',
    component: AddProduct,
  },
  {
    path: 'products/:id',
    component: ViewProduct,
  },
  {
    path: 'products/:id/edit',
    component: EditProduct,
  },
  //melas
  {
    path: 'meals',
    component: Meals,
  },
  {
    path: 'meals/add',
    component: AddMeal,
  },
  {
    path: 'meals/:id',
    component: ViewMeal,
  },
  {
    path: 'meals/:id/edit',
    component: EditProduct,
  },
  //groups
  {
    path: 'groups',
    component: Groups,
  },
  {
    path: 'groups/add',
    component: AddGroup,
  },
  {
    path: 'groups/:id',
    component: ViewGroup,
  },
  {
    path: 'groups/:id/edit',
    component: EditGroup,
  },
] satisfies Route[];
