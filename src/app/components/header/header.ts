import { Component, ElementRef, viewChild } from '@angular/core';
import { ImgFallback } from '@/directives/img-fallback';
import { RouterLink } from '@angular/router';
import { BaseComponent } from '@/components/base-component/base-component';
import headerIcons from './header-icons';
import { MenuItem } from 'primeng/api';
import { Menu } from 'primeng/menu';

export interface IMainNavItem {
  label: string;
  imgUrl: string;
  action?: string;
  routerLink: string;
  children?: ISubNavItem[];
}

export interface ISubNavItem {
  label: string;
  imgUrl: string;
  routerLink: string;
  subLinks?: string[];
}

@Component({
  selector: 'app-header',
  imports: [ImgFallback, RouterLink, Menu],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header extends BaseComponent {
  header = viewChild<ElementRef<HTMLElement>>('header');

  menuItems: MenuItem[] = [
    {
      label: 'الاجاراءات',
      items: [
        {
          label: 'تسجيل الخروج',
          icon: 'pi pi-sign-out',
          command: (event) => this.onLogoutClick(event.originalEvent!),
        },
      ],
    },
  ];

  navItems: IMainNavItem[] = [
    {
      label: 'الرئيسية',
      imgUrl: headerIcons.home.imgUrl,
      routerLink: '/',
    },
    {
      label: 'الفواتير',
      imgUrl: headerIcons.invoices.imgUrl,
      routerLink: '/invoices',
      children: [
        {
          label: 'الطلبات',
          imgUrl: headerIcons.invoices.children.orders,
          routerLink: '/invoices/orders',
        },
        {
          label: 'المرتجعات',
          imgUrl: headerIcons.invoices.children.refunds,
          routerLink: '/invoices/refunds',
        },
      ],
    },
    {
      label: 'الأصناف',
      imgUrl: headerIcons.classes.imgUrl,
      routerLink: '/classes',
      children: [
        {
          label: 'المنتجات',
          imgUrl: headerIcons.classes.children.products,
          routerLink: '/classes/products',
        },
        {
          label: 'الوجبات',
          imgUrl: headerIcons.classes.children.meals,
          routerLink: '/classes/meals',
        },
        {
          label: 'المجموعات',
          imgUrl: headerIcons.classes.children.groups,
          routerLink: '/classes/groups',
        },
      ],
    },
    {
      label: 'المطعم',
      imgUrl: headerIcons.restaurant.imgUrl,
      routerLink: '/restaurant',
      children: [
        {
          label: 'الطاولات',
          imgUrl: headerIcons.restaurant.children.tables,
          routerLink: '/restaurant/tables',
        },
        {
          label: 'الاكواخ',
          imgUrl: headerIcons.restaurant.children.cabins,
          routerLink: '/restaurant/cabins',
        },
        {
          label: 'الغرفه',
          imgUrl: headerIcons.restaurant.children.rooms,
          routerLink: '/restaurant/rooms',
        },
      ],
    },
    {
      label: 'العملاء',
      imgUrl: headerIcons.customers.imgUrl,
      routerLink: '/customers',
      children: [
        {
          label: 'إضافه عميل',
          imgUrl: headerIcons.customers.children.add,
          routerLink: '/customers/add',
        },
      ],
    },
    {
      label: 'المخزون',
      imgUrl: headerIcons.storage.imgUrl,
      routerLink: '/storage',
      children: [
        {
          label: 'الارصده الافتتاحيه',
          imgUrl: headerIcons.storage.children.openingBalances,
          routerLink: '/storage/opening-balances',
        },
        {
          label: 'المشتريات',
          imgUrl: headerIcons.storage.children.purchases,
          routerLink: '/storage/purchases',
        },
        {
          label: 'مرتجعات مشتريات',
          imgUrl: headerIcons.storage.children.purchasesReturns,
          routerLink: '/storage/purchases-refunds',
        },
        {
          label: 'تسويه جرديه',
          imgUrl: headerIcons.storage.children.inventory,
          routerLink: '/storage/inventory',
        },
      ],
    },
    {
      label: 'التبديلات',
      imgUrl: headerIcons.replacements.imgUrl,
      routerLink: '/replacements',
      children: [
        {
          label: 'غرف',
          imgUrl: headerIcons.replacements.children.rooms,
          routerLink: '/replacements/rooms',
        },
        {
          label: 'اكواخ',
          imgUrl: headerIcons.replacements.children.cabins,
          routerLink: '/replacements/cabins',
        },
        {
          label: 'طاولات',
          imgUrl: headerIcons.replacements.children.tables,
          routerLink: '/replacements/tables',
        },
        {
          label: 'ديليفري',
          imgUrl: headerIcons.replacements.children.deliveries,
          routerLink: '/replacements/deliveries',
        },
      ],
    },
    {
      label: 'التحصيلات',
      imgUrl: headerIcons.collections.imgUrl,
      routerLink: '/collections',
      children: [
        {
          label: 'الكل',
          imgUrl: headerIcons.collections.children.all,
          routerLink: '/collections/all',
        },
        {
          label: 'الطاولات',
          imgUrl: headerIcons.collections.children.tables,
          routerLink: '/collections/tables',
        },
        {
          label: 'غرف',
          imgUrl: headerIcons.collections.children.rooms,
          routerLink: '/collections/rooms',
        },
        {
          label: 'أكواخ',
          imgUrl: headerIcons.collections.children.cabins,
          routerLink: '/collections/cabins',
        },
        {
          label: 'ديليفري',
          imgUrl: headerIcons.collections.children.deliveries,
          routerLink: '/collections/deliveries',
        },
      ],
    },
    {
      label: 'الحسابات',
      imgUrl: headerIcons.accounts.imgUrl,
      routerLink: '/accounts',
      children: [
        {
          label: 'القيود',
          imgUrl: headerIcons.accounts.children.journals,
          routerLink: '/accounts/journals',
        },
        {
          label: 'سند قبض مجمع',
          imgUrl: headerIcons.accounts.children.collectiveReceipts,
          routerLink: '/accounts/collective-receipts',
        },
        {
          label: 'سند صرف مجمع',
          imgUrl: headerIcons.accounts.children.collectivePayments,
          routerLink: '/accounts/collective-payments',
        },
        {
          label: 'شجره الحسابات',
          imgUrl: headerIcons.accounts.children.accountsTree,
          routerLink: '/accounts/accounts-tree',
        },
      ],
    },
    {
      label: 'الديليفري',
      imgUrl: headerIcons.deliveries.imgUrl,
      routerLink: '/deliveries',
      children: [
        {
          label: 'بيانات الديليفري',
          imgUrl: headerIcons.deliveries.children.deliveryMen,
          routerLink: '/deliveries/delivery-men',
        },
      ],
    },
    {
      label: 'المستخدمين',
      imgUrl: headerIcons.users.imgUrl,
      routerLink: '/users',
      children: [
        {
          label: 'إضافه مستخدم',
          imgUrl: headerIcons.users.children.add,
          routerLink: '/users/add',
        },
      ],
    },
    {
      label: 'الإعدادات',
      imgUrl: headerIcons.settings.imgUrl,
      routerLink: '/settings',
      children: [
        {
          label: 'إعدادات البرنامج',
          imgUrl: headerIcons.settings.children.program,
          routerLink: '/settings/program',
          subLinks: ['/settings/program/language', '/settings/program/support', '/settings/program/about'],
        },
        {
          label: 'إعدادات الماليه',
          imgUrl: headerIcons.settings.children.financial,
          routerLink: '/settings/financial',
        },
        {
          label: 'إداره فتح/ غلق اليوميه',
          imgUrl: headerIcons.settings.children.dailyOpeningClosing,
          routerLink: '/settings/daily-opening-closing',
        },
        {
          label: 'طابعه ال QR',
          imgUrl: headerIcons.settings.children.qr,
          routerLink: '/settings/qr',
        },
        {
          label: 'إعدادات الحسابات الإفتراضيه',
          imgUrl: headerIcons.settings.children.defaultAccounts,
          routerLink: '/settings/default-accounts',
        },
        {
          label: 'إضافه طابعه',
          imgUrl: headerIcons.settings.children.addPrinter,
          routerLink: '/settings/add-printer',
        },
        {
          label: 'اعدادات الطابعه',
          imgUrl: headerIcons.settings.children.printerSettings,
          routerLink: '/settings/printer',
        },
      ],
    },
    {
      label: 'بيانات البرنامج',
      imgUrl: headerIcons.appSettings.imgUrl,
      routerLink: '/app-settings',
      children: [
        {
          label: 'الملف الشخصي',
          imgUrl: headerIcons.appSettings.children.profile,
          routerLink: '/app-settings/profile',
        },
        {
          label: 'بيانات المطعم',
          imgUrl: headerIcons.appSettings.children.restaurant,
          routerLink: '/app-settings/restaurant',
        },
      ],
    },
  ];
  activeLink: string = '/';
  prevActiveLink: string = '/';
  isShowingMenu = true;
  ngOnInit() {
    this.activeLink = this.router.url;
  }

  isParent(route: string) {
    return this.navItems.some((i) => i.routerLink === route);
  }

  toggleActiveLink(link: string) {
    // console.log('link', link);
    const isParent = this.isParent(link);
    const isPrevious = link === this.prevActiveLink;
    const isPreviousParent = this.isParent(this.prevActiveLink);
    if (link === '/') {
      if (this.prevActiveLink === '/' || isPreviousParent) {
        this.activeLink = '/';
      } else {
        this.prevActiveLink = link;
      }
      this.isShowingMenu = true;
    } else if (isParent) {
      this.prevActiveLink = link;
      this.activeLink = link;
      this.isShowingMenu = !this.isShowingMenu;
      // } else if (isParent && isPrevious) {
      //   this.prevActiveLink = '/';
      //   this.isShowingMenu = true;
    } else if (!isParent) {
      this.prevActiveLink = link;
      this.activeLink = link;
      this.isShowingMenu = false;
    } else if (link === this.prevActiveLink) {
      this.prevActiveLink = '/';
      this.isShowingMenu = true;
    }

    // console.log(this.activeLink);
  }

  isChildActive(parentLink: string) {
    const parent = this.navItems.find((item) => item.routerLink === parentLink);
    const isChildActive = parent?.children?.some((child) => child.routerLink === this.activeLink);
    return isChildActive;
  }

  isParentActive(parentLink: string) {
    return parentLink === this.activeLink || this.isChildActive(parentLink);
    // return this.navItems.some((item) => item.routerLink === parentLink);
  }

  isAnyChildSubLinksActive(parentLink: string) {
    const parent = this.navItems.find((item) => item.routerLink === parentLink);
    return parent?.children?.some((child) => child.subLinks?.some((subLink) => subLink === this.activeLink));
  }

  isAnySubLinksActive(parentLink: string, childLink: string) {
    const parent = this.navItems.find((item) => item.routerLink === parentLink);
    const child = parent?.children?.find((item) => item.routerLink === childLink);
    if (!child) return false;
    if (!child.subLinks) return false;
    return child.subLinks.some((subLink) => subLink === this.activeLink);
  }

  // get height() {
  //   let height = 152//Math.round(+(this.header()?.nativeElement?.clientHeight ?? 0));
  //   this.header()!.nativeElement.style.height = `${height}px`;
  //   return height
  // }

  // log() {
  //   console.log(this.height);
  // }

  onLogoutClick(event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'هل تريد تسجيل الخروج؟',
      header: 'تسجيل الخروج',
      icon: 'pi pi-info-circle',
      rejectLabel: 'الغاء',
      rejectButtonProps: {
        label: 'الغاء',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'تسجيل الخروج',
        severity: 'danger',
      },

      accept: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'تم تسجيل الخروج',
          detail: 'لقد قمت بتسجيل الخروج بنجاح',
        });
        this.authService.logout();
      },
      reject: () => {
        this.messageService.add({ severity: 'error', summary: 'تم الالغاء', detail: 'لقد قمت بالغاء الخروج' });
      },
    });
  }
}
