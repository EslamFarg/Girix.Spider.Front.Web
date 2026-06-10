import { Component } from '@angular/core';
import { NgSelectComponent } from "@ng-select/ng-select";
import { TreeProject } from "../../../../../shared/ui/tree-project/tree-project";

@Component({
  selector: 'app-cost-center',
  imports: [NgSelectComponent, TreeProject],
  templateUrl: './cost-center.html',
  styleUrl: './cost-center.scss',
})
export class CostCenter {

  treeCost:any=[
    {
      label:'مشروع الطاقه الشمسيه',
      expanded:false,
      children:[
        {
          label:'اداره المشتريات',
          expanded:false,
          children:[]
        },
        {
          label:'اداره الماليه',
          expanded:false,
          children:[]
        },
        {
          label:'الاستثمارات',
          expanded:false,
          children:[]
        },
        {
          label:'راس المال',
          expanded:false,
          children:[
            {
              label:'نقديه',
              expanded:false,
              isLeaf: true
            },
            {
              label:'ائتمان',
              expanded:false,
              isLeaf: true
            },
            {
              label:'نقديه',
              expanded:false,
              isLeaf: true
            },
          ]
        }
      ]

    },
    {
      label:' 2 مشروع الطاقه الشمسيه',
      children:[
        {
          label:'اداره المشتريات',
          children:[]
        },
        {
          label:'اداره الماليه',
          children:[]
        },
        {
          label:'الاستثمارات',
          children:[]
        },
        {
          label:'راس المال',
          children:[
            {
              label:'نقديه',
                isLeaf: true
            },
            {
              label:'ائتمان',
                isLeaf: true
            },
            {
              label:'نقديه',
                isLeaf: true
            },
          ]
        }
      ]

    },
    


  ]
}
