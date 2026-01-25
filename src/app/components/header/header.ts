import { Component, ElementRef, inject, viewChild } from '@angular/core';
import { ImgFallback } from '@/directives/img-fallback';
import { RouterLink } from '@angular/router';
import { BaseComponent } from '@/components/base-component/base-component';
import headerIcons from './header-icons';
import { MenuItem } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { ProgressBarModule, ProgressBar } from 'primeng/progressbar';
import { LayoutService } from '@/layouts/services/layout-service';
export interface IMainNavItem {
  labelKey: string;
  imgUrl: string;
  action?: string;
  routerLink: string;
  children?: ISubNavItem[];
}

export interface ISubNavItem {
  labelKey: string;
  imgUrl: string;
  routerLink: string;
  subLinks?: string[];
}

@Component({
  selector: 'app-header',
  imports: [ImgFallback, RouterLink, Menu, ProgressBar],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header extends BaseComponent {
  header = viewChild<ElementRef<HTMLElement>>('header');
  nav = viewChild<ElementRef<HTMLElement>>('nav');
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
      labelKey: 'home',
      imgUrl: headerIcons.home.imgUrl,
      routerLink: '/',
    },
    {
      labelKey: 'invoices',
      imgUrl: headerIcons.invoices.imgUrl,
      routerLink: '/invoices',
      children: [
        {
          labelKey: 'orders',
          imgUrl: headerIcons.invoices.children.orders,
          routerLink: '/invoices/orders',
        },
        {
          labelKey: 'refunds',
          imgUrl: headerIcons.invoices.children.refunds,
          routerLink: '/invoices/refunds',
        },
      ],
    },
    {
      labelKey: 'classes',
      imgUrl: headerIcons.classes.imgUrl,
      routerLink: '/classes',
      children: [
        {
          labelKey: 'products',
          imgUrl: headerIcons.classes.children.products,
          routerLink: '/classes/products',
        },
        {
          labelKey: 'meals',
          imgUrl: headerIcons.classes.children.meals,
          routerLink: '/classes/meals',
        },
        {
          labelKey: 'groups',
          imgUrl: headerIcons.classes.children.groups,
          routerLink: '/classes/groups',
        },
      ],
    },
    {
      labelKey: 'restaurant',
      imgUrl: headerIcons.restaurant.imgUrl,
      routerLink: '/restaurant',
      children: [
        {
          labelKey: 'tables',
          imgUrl: headerIcons.restaurant.children.tables,
          routerLink: '/restaurant/tables',
        },
        {
          labelKey: 'huts',
          imgUrl: headerIcons.restaurant.children.huts,
          routerLink: '/restaurant/huts',
        },
        {
          labelKey: 'rooms',
          imgUrl: headerIcons.restaurant.children.rooms,
          routerLink: '/restaurant/rooms',
        },
      ],
    },
    {
      labelKey: 'customers',
      imgUrl: headerIcons.customers.imgUrl,
      routerLink: '/customers',
      children: [
        {
          labelKey: 'addCustomer',
          imgUrl: headerIcons.customers.children.add,
          routerLink: '/customers/add',
        },
      ],
    },
    {
      labelKey: 'storage',
      imgUrl: headerIcons.storage.imgUrl,
      routerLink: '/storage',
      children: [
        {
          labelKey: 'openingBalances',
          imgUrl: headerIcons.storage.children.openingBalances,
          routerLink: '/storage/opening-balances',
        },
        {
          labelKey: 'purchases',
          imgUrl: headerIcons.storage.children.purchases,
          routerLink: '/storage/purchases',
        },
        {
          labelKey: 'purchasesRefunds',
          imgUrl: headerIcons.storage.children.purchasesRefunds,
          routerLink: '/storage/purchases-refunds',
        },
        {
          labelKey: 'inventory',
          imgUrl: headerIcons.storage.children.inventory,
          routerLink: '/storage/inventory',
        },
      ],
    },
    {
      labelKey: 'replacements',
      imgUrl: headerIcons.replacements.imgUrl,
      routerLink: '/replacements',
      children: [
        {
          labelKey: 'rooms',
          imgUrl: headerIcons.replacements.children.rooms,
          routerLink: '/replacements/rooms',
        },
        {
          labelKey: 'huts',
          imgUrl: headerIcons.replacements.children.huts,
          routerLink: '/replacements/huts',
        },
        {
          labelKey: 'tables',
          imgUrl: headerIcons.replacements.children.tables,
          routerLink: '/replacements/tables',
        },
        {
          labelKey: 'deliveries',
          imgUrl: headerIcons.replacements.children.deliveries,
          routerLink: '/replacements/deliveries',
        },
      ],
    },
    {
      labelKey: 'collections',
      imgUrl: headerIcons.collections.imgUrl,
      routerLink: '/collections',
      children: [
        {
          labelKey: 'all',
          imgUrl: headerIcons.collections.children.all,
          routerLink: '/collections/all',
        },
        {
          labelKey: 'tables',
          imgUrl: headerIcons.collections.children.tables,
          routerLink: '/collections/tables',
        },
        {
          labelKey: 'rooms',
          imgUrl: headerIcons.collections.children.rooms,
          routerLink: '/collections/rooms',
        },
        {
          labelKey: 'huts',
          imgUrl: headerIcons.collections.children.huts,
          routerLink: '/collections/huts',
        },
        {
          labelKey: 'deliveries',
          imgUrl: headerIcons.collections.children.deliveries,
          routerLink: '/collections/deliveries',
        },
      ],
    },
    {
      labelKey: 'accounts',
      imgUrl: headerIcons.accounts.imgUrl,
      routerLink: '/accounts',
      children: [
        {
          labelKey: 'journals',
          imgUrl: headerIcons.accounts.children.journals,
          routerLink: '/accounts/journals',
        },
        {
          labelKey: 'collectiveReceipts',
          imgUrl: headerIcons.accounts.children.collectiveReceipts,
          routerLink: '/accounts/collective-receipts',
        },
        {
          labelKey: 'collectivePayments',
          imgUrl: headerIcons.accounts.children.collectivePayments,
          routerLink: '/accounts/collective-payments',
        },
        {
          labelKey: 'accountsTree',
          imgUrl: headerIcons.accounts.children.accountsTree,
          routerLink: '/accounts/accounts-tree',
        },
      ],
    },
    {
      labelKey: 'delivery',
      imgUrl: headerIcons.deliveries.imgUrl,
      routerLink: '/deliveries',
      children: [
        {
          labelKey: 'deliveryMen',
          imgUrl: headerIcons.deliveries.children.deliveryMen,
          routerLink: '/deliveries/delivery-men',
        },
      ],
    },
    {
      labelKey: 'users',
      imgUrl: headerIcons.users.imgUrl,
      routerLink: '/users',
      children: [
        {
          labelKey: 'addUser',
          imgUrl: headerIcons.users.children.add,
          routerLink: '/users/add',
        },
      ],
    },
    {
      labelKey: 'settings',
      imgUrl: headerIcons.settings.imgUrl,
      routerLink: '/settings',
      children: [
        {
          labelKey: 'program',
          imgUrl: headerIcons.settings.children.program,
          routerLink: '/settings/program',
          subLinks: ['/settings/program/language', '/settings/program/support', '/settings/program/about'],
        },
        {
          labelKey: 'financial',
          imgUrl: headerIcons.settings.children.financial,
          routerLink: '/settings/financial',
        },
        {
          labelKey: 'dailyOpeningClosing',
          imgUrl: headerIcons.settings.children.dailyOpeningClosing,
          routerLink: '/settings/daily-opening-closing',
        },
        {
          labelKey: 'qr',
          imgUrl: headerIcons.settings.children.qr,
          routerLink: '/settings/qr',
        },
        {
          labelKey: 'defaultAccounts',
          imgUrl: headerIcons.settings.children.defaultAccounts,
          routerLink: '/settings/default-accounts',
        },
        {
          labelKey: 'addPrinter',
          imgUrl: headerIcons.settings.children.addPrinter,
          routerLink: '/settings/add-printer',
        },
        {
          labelKey: 'printer',
          imgUrl: headerIcons.settings.children.printerSettings,
          routerLink: '/settings/printer',
        },
      ],
    },
    {
      labelKey: 'appInfo',
      imgUrl: headerIcons.appInfo.imgUrl,
      routerLink: '/app-info',
      children: [
        {
          labelKey: "profile",
          imgUrl: headerIcons.appInfo.children.profile,
          routerLink: '/app-info/profile',
        },
        {
          labelKey: "restaurant",
          imgUrl: headerIcons.appInfo.children.restaurant,
          routerLink: '/app-info/restaurant',
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
    //toggle overflow hidden for exact 1 second to avoid unwanted scroll
    this.nav()!.nativeElement.style.overflow = 'hidden';
    this.nav()!.nativeElement.scrollLeft = 0;
    setTimeout(() => {
      this.nav()!.nativeElement.style.overflow = 'auto';
    }, 500);

    const isParent = this.isParent(link);
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
    } else if (!isParent) {
      this.prevActiveLink = link;
      this.activeLink = link;
      this.isShowingMenu = false;
    } else if (link === this.prevActiveLink) {
      this.prevActiveLink = '/';
      this.isShowingMenu = true;
    }
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
