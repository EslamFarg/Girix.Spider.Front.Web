import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgSelectComponent } from "@ng-select/ng-select";
import { TreePermissions } from "../../../../../shared/ui/tree-permissions/tree-permissions";
import { Dialog } from "primeng/dialog";

@Component({
  selector: 'app-permissions',
  imports: [RouterLink, NgSelectComponent, TreePermissions, Dialog],
  templateUrl: './permissions.html',
  styleUrl: './permissions.scss',
})
export class Permissions {

  visibleGroup = false;
  

  permissionsTree=[
    {
      label:'العملاء',
      isExpanded:false,
      children:[
        {
          label:'الفواتير',
          isExpanded:false,
          children:[
          {
              label:'أضافة',
            isLeaf: true
          },
          {
              label:'تعديل',
            isLeaf: true
          },
          {
              label:'حذف',
            isLeaf: true
          },
          ]
        },
        {
          label:'الفرانشيز',
          isExpanded:false,
          children:[
              {
              label:'أضافة',
            isLeaf: true
          },
          {
              label:'تعديل',
            isLeaf: true
          },
          {
              label:'حذف',
            isLeaf: true
          },
          ]
        }
      ]
    },
    {
      label:'الموظفين',
      isExpanded:false,
      children:[
        {
          label:'الفواتير',
          isExpanded:false,
          children:[
          {
              label:'أضافة',
            isLeaf: true
          },
          {
              label:'تعديل',
            isLeaf: true
          },
          {
              label:'حذف',
            isLeaf: true
          },
          ]
        },
        {
          label:'الفرانشيز',
          isExpanded:false,
          children:[
              {
              label:'أضافة',
            isLeaf: true
          },
          {
              label:'تعديل',
            isLeaf: true
          },
          {
              label:'حذف',
            isLeaf: true
          },
          ]
        }
      ]
    }
  ]
}
