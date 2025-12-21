import { BaseComponent } from '@/components/base-component/base-component';
import { InputErrorMessageHandler } from '@/components/input-error-message-handler/input-error-message-handler';
import { Component } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';
import { ImgFallback } from "@/directives/img-fallback";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { ProductsNav } from "../../components/products-nav/products-nav";
import { SectionWrapper } from "@/components/section-wrapper/section-wrapper";

@Component({
  selector: 'app-products',
  imports: [ReactiveFormsModule, InputErrorMessageHandler, InputGroupAddon, InputTextModule, SelectModule, PaginatorModule, ImgFallback, RouterLink, RouterLinkActive, ProductsNav, SectionWrapper],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products extends BaseComponent {
  initialSearchFormValue = {
    text: this.fb.control<string>('', [Validators.required]),
    categoryId: this.fb.control<number>(0, [Validators.required]),
  };
  fg = this.fb.group(this.initialSearchFormValue);



  periodOptions=[
    {label:'اليوم',value:1},
    {label:'الاسبوع',value:2},
    {label:'الشهر',value:3},
    {label:'السنة',value:4},
  ]

  onSubmit() {}


  first = 0;
  rows = 10;
  onPageChange(event: any) {}

}
