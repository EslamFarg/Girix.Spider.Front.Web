import { Component, ElementRef, viewChild } from '@angular/core';
import { ImgFallback } from '@/directives/img-fallback';
import { RouterLink } from '@angular/router';
import { BaseComponent } from '@/components/base-component/base-component';

export interface IMainNavItem {
  label: string;
  icon: string;
  action?: string;
  routerLink: string;
  children?: ISubNavItem[];
}

export interface ISubNavItem {
  label: string;
  icon: string;
  routerLink: string;
}

@Component({
  selector: 'app-header',
  imports: [ImgFallback, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header extends BaseComponent {
  header = viewChild<ElementRef<HTMLElement>>('header');

  navItems: IMainNavItem[] = [
    {
      label: 'الرئيسية',
      icon: ``,
      routerLink: '/',
    },
    {
      label: 'الفواتير',
      icon: '/tttt',
      routerLink: '/invoices',
      children: [
        {
          label: 'الطلبات',
          icon: '',
          routerLink: '/invoices/orders',
        },
        {
          label: 'المرتجعات',
          icon: '',
          routerLink: '/invoices/refunds',
        },
      ],
    },
    {
      label: 'الأصناف',
      icon: '',
      routerLink: '/classes',
      children: [
        {
          label: 'المنتجات',
          icon: '',
          routerLink: '/classes/products',
        },
        {
          label: 'الوجبات',
          icon: '',
          routerLink: '/classes/meals',
        },
        {
          label: 'المجموعات',
          icon: '',
          routerLink: '/classes/groups',
        },
      ],
    },
    {
      label: 'المطعم',
      icon: '',
      routerLink: '/restaurant',
      children: [
        {
          label: 'الطاولات',
          icon: '',
          routerLink: '/restaurant/tables',
        },
        {
          label: 'الاكواخ',
          icon: '',
          routerLink: '/restaurant/cabins',
        },
        {
          label: 'الغرفه',
          icon: '',
          routerLink: '/restaurant/rooms',
        },
      ],
    },
    {
      label: 'العملاء',
      icon: '',
      routerLink: '/customers',
      children: [
        {
          label: 'إضافه عميل',
          icon: '',
          routerLink: '/customers/add',
        },
      ],
    },
    {
      label: 'المخزون',
      icon: '',
      routerLink: '/storage',
      children: [
        {
          label: 'الارصده الافتتاحيه',
          icon: '',
          routerLink: '/storage/opening-balances',
        },
        {
          label: 'المشتريات',
          icon: '',
          routerLink: '/storage/purchases',
        },
        {
          label: 'مرتجعات مشتريات',
          icon: '',
          routerLink: '/storage/purchases-refunds',
        },
        {
          label: 'تسويه جرديه',
          icon: '',
          routerLink: '/storage/inventory',
        },
      ],
    },
    {
      label: 'التبديلات',
      icon: '',
      routerLink: '/replacements',
      children: [
        {
          label: 'غرف',
          icon: '',
          routerLink: '/replacements/rooms',
        },
        {
          label: 'اكواخ',
          icon: '',
          routerLink: '/replacements/cabins',
        },
        {
          label: 'طاولات',
          icon: '',
          routerLink: '/replacements/tables',
        },
        {
          label: 'ديليفري',
          icon: '',
          routerLink: '/replacements/deliveries',
        },
      ],
    },
    {
      label: 'التحصيلات',
      icon: '',
      routerLink: '/collections',
      children: [
        {
          label: 'الكل',
          icon: '',
          routerLink: '/collections/all',
        },
        {
          label: 'الطاولات',
          icon: '',
          routerLink: '/collections/tables',
        },
        {
          label: 'غرف',
          icon: '',
          routerLink: '/collections/rooms',
        },
        {
          label: 'أكواخ',
          icon: '',
          routerLink: '/collections/cabins',
        },
        {
          label: 'ديليفري',
          icon: '',
          routerLink: '/collections/deliveries',
        },
      ],
    },
    {
      label: 'الحسابات',
      icon: '',
      routerLink: '/accounts',
      children: [
        {
          label: 'القيود',
          icon: '',
          routerLink: '/accounts/journals',
        },
        {
          label: 'سند قبض مجمع',
          icon: '',
          routerLink: '/accounts/receipts',
        },
        {
          label: 'سند صرف مجمع',
          icon: '',
          routerLink: '/accounts/payments',
        },
        {
          label: 'شجره الحسابات',
          icon: '',
          routerLink: '/accounts/accounts-tree',
        },
      ],
    },
    {
      label: 'الديليفري',
      icon: '',
      routerLink: '/deliveries',
      children: [
        {
          label: 'بيانات الديليفري',
          icon: '',
          routerLink: '/deliveries/data',
        },
      ],
    },
    {
      label: 'المستخدمين',
      icon: '',
      routerLink: '/users',
      children: [
        {
          label: 'إضافه مستخدم',
          icon: '',
          routerLink: '/users/add',
        },
      ],
    },
    
    {
      label: 'الإعدادات',
      icon: '',
      routerLink: '/settings',
      children: [
        {
          label: 'إعدادات البرنامج',
          icon: '',
          routerLink: '/settings/program',
        },
        {
          label: 'إعدادات الماليه',
          icon: '',
          routerLink: '/settings/financial',
        },
        {
          label: 'إداره فتح/ غلق اليوميه',
          icon: '',
          routerLink: '/settings/transactions',
        },
        {
          label: 'طابعه ال QR',
          icon: '',
          routerLink: '/settings/qr',
        },
        {
          label: 'إعدادات الحسابات الإفتراضيه',
          icon: '',
          routerLink: '/settings/default-accounts',
        },
        {
          label: 'إضافه طابعه',
          icon: '',
          routerLink: '/settings/add-printer',
        },
        {
          label: 'اعدادات الطابعه',
          icon: '',
          routerLink: '/settings/printer',
        },
      ],
    },
    {
      label: 'بيانات البرنامج',
      icon: '',
      routerLink: '/app-settings',
      children: [
        {
          label: 'الملف الشخصي',
          icon: '',
          routerLink: '/app-settings/profile',
        },
        {
          label: 'بيانات المطعم',
          icon: '/',
          routerLink: '/app-settings/restaurant',
        },
      ],
    },
  ];
  activeLink: string = '/';

  ngOnInit() {
      this.activeLink = this.router.url
  }


  toggleActiveLink(link: string) {
    console.log('link', link);
    if (this.navItems.find((i) => i.routerLink === link) && this.activeLink !== '/') {
      this.activeLink = '/';
    } else {
      this.activeLink = link;
    }
     
    console.log(this.activeLink);
  }

  isChildActive(parentLink: string) {
    return (
      this.navItems
        .find((item) => item.routerLink === parentLink)
        ?.children?.some((child) => child.routerLink === this.activeLink) ?? false
    );
  }

  isParentActive(parentLink: string) {
    return parentLink === this.activeLink || this.isChildActive(parentLink);
    // return this.navItems.some((item) => item.routerLink === parentLink);
  }

  get height() {
    let height = 152//Math.round(+(this.header()?.nativeElement?.clientHeight ?? 0));
    this.header()!.nativeElement.style.height = `${height}px`;
    return height
  }

  log() {
    console.log(this.height);
  }
}
