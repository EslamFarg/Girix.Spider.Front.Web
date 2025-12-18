import { Route } from '@angular/router';
import { Products } from '@/features/classes/pages/products/products';
import { Meals } from '@/features/classes/pages/meals/meals';
import { Groups } from '@/features/classes/pages/groups/groups';
 import { AddProduct } from '@/features/classes/pages/add-product/add-product';
import { EditProduct } from '@/features/classes/pages/edit-product/edit-product';
import { AddMeal } from './add-meal/add-meal';
 import { AddGroup } from './add-group/add-group';
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
    path: 'groups/:id/edit',
    component: EditGroup,
  },
] satisfies Route[];
