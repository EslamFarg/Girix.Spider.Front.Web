import { BaseComponent } from '@/components/base-component/base-component';
import { Component, ElementRef, viewChild } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { InputErrorMessageHandler } from '@/components/input-error-message-handler/input-error-message-handler';
import { InputTextModule } from 'primeng/inputtext';
import { ImgFallback } from "@/directives/img-fallback";

export interface IMenuItem {
  id: number;
  label: string;
  category: {
    id: number;
    label: string;
  };
  price: number;
  imageUrl: string;
}

@Component({
  selector: 'app-menu',
  imports: [ReactiveFormsModule, InputErrorMessageHandler, InputTextModule, ImgFallback],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
export class Menu extends BaseComponent {
  initialSearchFormValue = {
    text: this.fb.control<string>('', [Validators.required]),
    categoryId: this.fb.control<number>(0, [Validators.required]),
  };
  fg = this.fb.group(this.initialSearchFormValue);

  filterCategories = [
    {
      id: 1,
      label: 'بيتزا',
    },
    {
      id: 2,
      label: 'أطباق ماكرونه',
    },
    {
      id: 3,
      label: 'كريبات',
    },
    {
      id: 4,
      label: 'برجر',
    },
    {
      id: 5,
      label: 'شوربه',
    },
    {
      id: 6,
      label: 'مشروبات ',
    },
  ];

  menuItems: IMenuItem[] = [
    {
      id: 1,
      label: 'بيتزا',
      category: {
        id: 1,
        label: 'بيتزا',
      },
      price: 20,
      imageUrl: '',
    },
    {
      id: 2,
      label: 'أطباق ماكرونه',
      category: {
        id: 2,
        label: 'أطباق ماكرونه',
      },
      price: 20,
      imageUrl: '',
    },
    {
      id: 3,
      label: 'كريبات',
      category: {
        id: 3,
        label: 'كريبات',
      },
      price: 20,
      imageUrl: '',
    },
    {
      id: 4,
      label: 'برجر',
      category: {
        id: 4,
        label: 'برجر',
      },
      price: 20,
      imageUrl: '',
    },
    {
      id: 1,
      label: 'بيتزا',
      category: {
        id: 1,
        label: 'بيتزا',
      },
      price: 20,
      imageUrl: '',
    },
    {
      id: 2,
      label: 'أطباق ماكرونه',
      category: {
        id: 2,
        label: 'أطباق ماكرونه',
      },
      price: 20,
      imageUrl: '',
    },
    {
      id: 3,
      label: 'كريبات',
      category: {
        id: 3,
        label: 'كريبات',
      },
      price: 20,
      imageUrl: '',
    },
    {
      id: 4,
      label: 'برجر',
      category: {
        id: 4,
        label: 'برجر',
      },
      price: 20,
      imageUrl: '',
    },
    {
      id: 1,
      label: 'بيتزا',
      category: {
        id: 1,
        label: 'بيتزا',
      },
      price: 20,
      imageUrl: '',
    },
    {
      id: 2,
      label: 'أطباق ماكرونه',
      category: {
        id: 2,
        label: 'أطباق ماكرونه',
      },
      price: 20,
      imageUrl: '',
    },
    {
      id: 3,
      label: 'كريبات',
      category: {
        id: 3,
        label: 'كريبات',
      },
      price: 20,
      imageUrl: '',
    },
    {
      id: 4,
      label: 'برجر',
      category: {
        id: 4,
        label: 'برجر',
      },
      price: 20,
      imageUrl: '',
    },
    {
      id: 1,
      label: 'بيتزا',
      category: {
        id: 1,
        label: 'بيتزا',
      },
      price: 20,
      imageUrl: '',
    },
    {
      id: 2,
      label: 'أطباق ماكرونه',
      category: {
        id: 2,
        label: 'أطباق ماكرونه',
      },
      price: 20,
      imageUrl: '',
    },
    {
      id: 3,
      label: 'كريبات',
      category: {
        id: 3,
        label: 'كريبات',
      },
      price: 20,
      imageUrl: '',
    },
    {
      id: 4,
      label: 'برجر',
      category: {
        id: 4,
        label: 'برجر',
      },
      price: 20,
      imageUrl: '',
    },
    {
      id: 1,
      label: 'بيتزا',
      category: {
        id: 1,
        label: 'بيتزا',
      },
      price: 20,
      imageUrl: '',
    },
    {
      id: 2,
      label: 'أطباق ماكرونه',
      category: {
        id: 2,
        label: 'أطباق ماكرونه',
      },
      price: 20,
      imageUrl: '',
    },
    {
      id: 3,
      label: 'كريبات',
      category: {
        id: 3,
        label: 'كريبات',
      },
      price: 20,
      imageUrl: '',
    },
    {
      id: 4,
      label: 'برجر',
      category: {
        id: 4,
        label: 'برجر',
      },
      price: 20,
      imageUrl: '',
    },
  ];

  selectCategory(categoryId: number) {
    this.fg.get('categoryId')?.setValue(+categoryId);
  }


  //
  nav=viewChild<ElementRef<HTMLElement>>('nav')
  form=viewChild<ElementRef<HTMLElement>>('form')
  itemsContainer=viewChild<ElementRef<HTMLElement>>('itemsContainer')
  ngAfterViewInit(){
    const navHeight = +(this.nav()?.nativeElement.offsetHeight ?? 0);
    const formHeight = +(this.form()?.nativeElement.offsetHeight ?? 0);
    const itemsContainerHeight = `calc(100% - ${(navHeight + formHeight )}px)` ;
    this.itemsContainer()!.nativeElement.style.height = `${itemsContainerHeight}px`;
  }

  onSubmit(){

  }
}
