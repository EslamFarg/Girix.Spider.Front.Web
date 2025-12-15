import { Component } from '@angular/core';
import { ImgFallback } from '@/directives/img-fallback';
import { RouterLink } from '@angular/router';

export interface IMainNavItem {
  label: string;
  iconUrl: string;
  action?: string;
  routerLink: string;
  children?: ISubNavItem[];
}

export interface ISubNavItem {
  label: string;
  iconUrl: string;
  routerLink: string;
}

@Component({
  selector: 'app-header',
  imports: [ImgFallback, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  navItems: IMainNavItem[] = [
    {
      label: 'الرئيسية',
      iconUrl: '/grg',
      routerLink: '/home',
    },
    {
      label: 'الفواتير',
      iconUrl: '/tttt',
      routerLink: '/invoices',
      children: [
        {
          label: 'الطلبات',
          iconUrl: '',
          routerLink: '/invoices/orders',
        },
        {
          label: 'المرتجعات',
          iconUrl: '',
          routerLink: '/invoices/refunds',
        },
      ],
    },
    {
      label: 'الأصناف',
      iconUrl: '',
      routerLink: '/classes',
      children: [
        {
          label: 'المنتجات',
          iconUrl: '',
          routerLink: '/classes/products',
        },
        {
          label: 'الوجبات',
          iconUrl: '',
          routerLink: '/classes/meals',
        },
        {
          label: 'المجموعات',
          iconUrl: '',
          routerLink: '/classes/groups',
        },
      ],
    },
    {
      label: 'المطعم',
      iconUrl: '',
      routerLink: '/restaurant',
      children: [
        {
          label: 'الطاولات',
          iconUrl: '',
          routerLink: '/restaurant/tables',
        },
        {
          label: 'الاكواخ',
          iconUrl: '',
          routerLink: '/restaurant/cabins',
        },
        {
          label: 'الغرفه',
          iconUrl: '',
          routerLink: '/restaurant/rooms',
        },
      ],
    },
    {
      label: 'المخزون',
      iconUrl: '',
      routerLink: '/storage',
      children: [
        {
          label: 'الارصده الافتتاحيه',
          iconUrl: '',
          routerLink: '/storage/opening-balances',
        },
        {
          label: 'المشتريات',
          iconUrl: '',
          routerLink: '/storage/purchases',
        },
        {
          label: 'مرتجعات مشتريات',
          iconUrl: '',
          routerLink: '/storage/purchases-refunds',
        },
        {
          label: 'تسويه جرديه',
          iconUrl: '',
          routerLink: '/storage/inventory',
        },
      ],
    },
    {
      label: 'التبديلات',
      iconUrl: '',
      routerLink: '/replacements',
      children: [
        {
          label: 'غرف',
          iconUrl: '',
          routerLink: '/replacements/rooms',
        },
        {
          label: 'اكواخ',
          iconUrl: '',
          routerLink: '/replacements/cabins',
        },
        {
          label: 'طاولات',
          iconUrl: '',
          routerLink: '/replacements/tables',
        },
        {
          label: 'ديليفري',
          iconUrl: '',
          routerLink: '/replacements/deliveries',
        },
      ],
    },
    {
      label: 'التحصيلات',
      iconUrl: '',
      routerLink: '/collections',
      children: [
        {
          label: 'الكل',
          iconUrl: '',
          routerLink: '/collections/all',
        },
        {
          label: 'الطاولات',
          iconUrl: '',
          routerLink: '/collections/tables',
        },
        {
          label: 'غرف',
          iconUrl: '',
          routerLink: '/collections/rooms',
        },
        {
          label: 'أكواخ',
          iconUrl: '',
          routerLink: '/collections/cabins',
        },
        {
          label: 'ديليفري',
          iconUrl: '',
          routerLink: '/collections/deliveries',
        },
      ],
    },
    {
      label: 'الحسابات',
      iconUrl: '',
      routerLink: '/accounts',
      children: [
        {
          label: 'القيود',
          iconUrl: '',
          routerLink: '/accounts/journals',
        },
        {
          label: 'سند قبض مجمع',
          iconUrl: '',
          routerLink: '/accounts/receipts',
        },
        {
          label: 'سند صرف مجمع',
          iconUrl: '',
          routerLink: '/accounts/payments',
        },
        {
          label: 'شجره الحسابات',
          iconUrl: '',
          routerLink: '/accounts/accounts-tree',
        },
      ],
    },
    {
      label: 'الديليفري',
      iconUrl: '',
      routerLink: '/deliveries',
      children: [
        {
          label: 'بيانات الديليفري',
          iconUrl: '',
          routerLink: '/deliveries/data',
        },
      ],
    },
    {
      label: 'المستخدمين',
      iconUrl: '',
      routerLink: '/users',
      children: [
        {
          label: 'إضافه مستخدم',
          iconUrl: '',
          routerLink: '/users/add',
        },
      ],
    },
    {
      label: 'العملاء',
      iconUrl: '',
      routerLink: '/customers',
      children: [
        {
          label: 'إضافه عميل',
          iconUrl: '',
          routerLink: '/customers/add',
        },
      ],
    },
    {
      label: 'الإعدادات',
      iconUrl: '',
      routerLink: '/settings',
      children: [
        {
          label: 'إعدادات البرنامج',
          iconUrl: '',
          routerLink: '/settings/program',
        },
        {
          label: 'إعدادات الماليه',
          iconUrl: '',
          routerLink: '/settings/financial',
        },
        {
          label: 'إداره فتح/ غلق اليوميه',
          iconUrl: '',
          routerLink: '/settings/transactions',
        },
        {
          label: 'طابعه ال QR',
          iconUrl: '',
          routerLink: '/settings/qr',
        },
        {
          label: 'إعدادات الحسابات الإفتراضيه',
          iconUrl: '',
          routerLink: '/settings/default-accounts',
        },
        {
          label: 'إضافه طابعه',
          iconUrl: '',
          routerLink: '/settings/add-printer',
        },
        {
          label: 'اعدادات الطابعه',
          iconUrl: '',
          routerLink: '/settings/printer',
        },
      ],
    },
    {
      label: 'بيانات البرنامج',
      iconUrl: '',
      routerLink: '/app-settings',
      children: [
        {
          label: 'الملف الشخصي',
          iconUrl: '',
          routerLink: '/app-settings/profile',
        },
        {
          label: 'بيانات المطعم',
          iconUrl: '/',
          routerLink: '/app-settings/restaurant',
        },
      ],
    },
  ];

  activeLink: string = '/home';

  toggleActiveLink(link: string) {
    console.log('link', link);
    if (this.navItems.find((i) => i.routerLink === link) && this.activeLink !== '/home') {
      this.activeLink = '/home';
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
}
