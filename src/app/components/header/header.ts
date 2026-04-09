import { AfterViewInit, Component, effect, ElementRef, inject, signal, viewChild } from '@angular/core';
import { ImgFallback } from '@/directives/img-fallback';
import { RouterLink } from '@angular/router';
import { BaseComponent } from '@/components/base-component/base-component';
import headerIcons from './header-icons';
import { MenuItem } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { ProgressBarModule, ProgressBar } from 'primeng/progressbar';
import { LayoutService } from '@/layouts/services/layout-service';
import { MessageModule } from 'primeng/message';
import { ApiUrlOverrideDialog } from '@/components/api-url-override-dialog/api-url-override-dialog';
import { ApiUrlOverrideService } from '@/core/services/api-url-override-service';
export interface IMainNavItem {
  labelKey: string;
  imgUrl: string;
  action?: string;
  routerLink: string;
  children?: ISubNavItem[];
  isLink?: boolean;
}

export interface ISubNavItem {
  labelKey: string;
  imgUrl: string;
  routerLink: string;
  subLinks?: string[];
}

@Component({
  selector: 'app-header',
  imports: [
    ImgFallback,
    RouterLink,
    Menu,
    ProgressBar,
    MessageModule,
    ApiUrlOverrideDialog,
  ],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header extends BaseComponent implements AfterViewInit {
  header = viewChild<ElementRef<HTMLElement>>('header');
  nav = viewChild<ElementRef<HTMLElement>>('nav');
  navItemsContainer = viewChild<ElementRef<HTMLElement>>('navItemsContainer');

  userDetails = this.authService.userDetails;
  apiUrlOverrideService = inject(ApiUrlOverrideService);

  popUpMenuItems: MenuItem[] = [
    {
      label: 'الاجاراءات',
      items: [
        {
          label: 'API URL',
          icon: 'pi pi-link',
          command: () => this.apiUrlOverrideService.openDialog(),
        },
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
      labelKey: 'HOME',
      imgUrl: headerIcons.home.imgUrl,
      routerLink: '/',
      isLink: true,
    },
    {
      labelKey: 'DAILY_JOURNAL',
      imgUrl: headerIcons.dailyJournal.imgUrl,
      routerLink: '/daily-journal',
      isLink: true,
    },
    {
      labelKey: 'INVOICES',
      imgUrl: headerIcons.invoices.imgUrl,
      routerLink: '/invoices',
      children: [
        {
          labelKey: 'ORDERS',
          imgUrl: headerIcons.invoices.children.orders,
          routerLink: '/invoices/orders',
        },
        {
          labelKey: 'REFUNDS',
          imgUrl: headerIcons.invoices.children.refunds,
          routerLink: '/invoices/refunds',
        },
      ],
    },
    {
      labelKey: 'CLASSES',
      imgUrl: headerIcons.classes.imgUrl,
      routerLink: '/classes',
      children: [
        {
          labelKey: 'PRODUCTS',
          imgUrl: headerIcons.classes.children.products,
          routerLink: '/classes/products',
        },
        {
          labelKey: 'MEALS',
          imgUrl: headerIcons.classes.children.meals,
          routerLink: '/classes/meals',
        },
        {
          labelKey: 'GROUPS',
          imgUrl: headerIcons.classes.children.groups,
          routerLink: '/classes/groups',
        },
      ],
    },
    {
      labelKey: 'RESTAURANT',
      imgUrl: headerIcons.restaurant.imgUrl,
      routerLink: '/restaurant',
      children: [
        {
          labelKey: 'TABLES',
          imgUrl: headerIcons.restaurant.children.tables,
          routerLink: '/restaurant/tables',
        },
        {
          labelKey: 'HUTS',
          imgUrl: headerIcons.restaurant.children.huts,
          routerLink: '/restaurant/huts',
        },
        {
          labelKey: 'ROOMS',
          imgUrl: headerIcons.restaurant.children.rooms,
          routerLink: '/restaurant/rooms',
        },
      ],
    },
    {
      labelKey: 'CUSTOMERS',
      imgUrl: headerIcons.customers.imgUrl,
      routerLink: '/customers',
      children: [
        {
          labelKey: 'ADDCUSTOMER',
          imgUrl: headerIcons.customers.children.add,
          routerLink: '/customers/add',
        },
      ],
    },
    {
      labelKey: 'STORAGE',
      imgUrl: headerIcons.storage.imgUrl,
      routerLink: '/storage',
      children: [
        {
          labelKey: 'OPENING_BALANCES',
          imgUrl: headerIcons.storage.children.openingBalances,
          routerLink: '/storage/opening-balances',
        },
        {
          labelKey: 'PURCHASES',
          imgUrl: headerIcons.storage.children.purchases,
          routerLink: '/storage/purchases',
        },
        {
          labelKey: 'PURCHASES_REFUNDS',
          imgUrl: headerIcons.storage.children.purchasesRefunds,
          routerLink: '/storage/purchases-returns',
        },
        {
          labelKey: 'INVENTORY',
          imgUrl: headerIcons.storage.children.inventory,
          routerLink: '/storage/inventory',
        },
      ],
    },
    {
      labelKey: 'REPLACEMENTS',
      imgUrl: headerIcons.replacements.imgUrl,
      routerLink: '/replacements',
      children: [
        {
          labelKey: 'ROOMS',
          imgUrl: headerIcons.replacements.children.rooms,
          routerLink: '/replacements/rooms',
        },
        {
          labelKey: 'HUTS',
          imgUrl: headerIcons.replacements.children.huts,
          routerLink: '/replacements/huts',
        },
        {
          labelKey: 'TABLES',
          imgUrl: headerIcons.replacements.children.tables,
          routerLink: '/replacements/tables',
        },
      ],
    },
    {
      labelKey: 'COLLECTIONS',
      imgUrl: headerIcons.collections.imgUrl,
      routerLink: '/collections',
      children: [
        {
          labelKey: 'ALL',
          imgUrl: headerIcons.collections.children.all,
          routerLink: '/collections/all',
        },
        {
          labelKey: 'TABLES',
          imgUrl: headerIcons.collections.children.tables,
          routerLink: '/collections/tables',
        },
        {
          labelKey: 'ROOMS',
          imgUrl: headerIcons.collections.children.rooms,
          routerLink: '/collections/rooms',
        },
        {
          labelKey: 'HUTS',
          imgUrl: headerIcons.collections.children.huts,
          routerLink: '/collections/huts',
        },
        {
          labelKey: 'DELIVERIES',
          imgUrl: headerIcons.collections.children.deliveries,
          routerLink: '/collections/deliveries',
        },
        {
          labelKey: 'COMPANIES',
          imgUrl: headerIcons.collections.children.deliveries,
          routerLink: '/collections/company-deliveries',
        },
      ],
    },
    {
      labelKey: 'ACCOUNTS',
      imgUrl: headerIcons.accounts.imgUrl,
      routerLink: '/accounts',
      children: [
        {
          labelKey: 'JOURNALS',
          imgUrl: headerIcons.accounts.children.journals,
          routerLink: '/accounts/journals',
        },
        {
          labelKey: 'COLLECTIVE_RECEIPTS',
          imgUrl: headerIcons.accounts.children.collectiveReceipts,
          routerLink: '/accounts/collective-receipts',
        },
        {
          labelKey: 'COLLECTIVE_PAYMENTS',
          imgUrl: headerIcons.accounts.children.collectivePayments,
          routerLink: '/accounts/collective-payments',
        },
        {
          labelKey: 'ACCOUNTS_TREE',
          imgUrl: headerIcons.accounts.children.accountsTree,
          routerLink: '/accounts/accounts-tree',
        },
      ],
    },
    {
      labelKey: 'DELIVERY',
      imgUrl: headerIcons.deliveries.imgUrl,
      routerLink: '/deliveries',
      children: [
        {
          labelKey: 'DELIVERY_MEN',
          imgUrl: headerIcons.deliveries.children.deliveryMen,
          routerLink: '/deliveries/delivery-men',
        },
      ],
    },
    {
      labelKey: 'USERS',
      imgUrl: headerIcons.users.imgUrl,
      routerLink: '/users',
      children: [
        {
          labelKey: 'ADD_USER',
          imgUrl: headerIcons.users.children.add,
          routerLink: '/users/add',
        },
      ],
    },
    {
      labelKey: 'SETTINGS',
      imgUrl: headerIcons.settings.imgUrl,
      routerLink: '/settings',
      children: [
        {
          labelKey: 'PROGRAM',
          imgUrl: headerIcons.settings.children.program,
          routerLink: '/settings/program',
          subLinks: ['/settings/program/language', '/settings/program/support', '/settings/program/about'],
        },
        {
          labelKey: 'FINANCIAL',
          imgUrl: headerIcons.settings.children.financial,
          routerLink: '/settings/financial',
        },
        {
          labelKey: 'DAILY_JOURNAL',
          imgUrl: headerIcons.settings.children.dailyJournal,
          routerLink: '/settings/manage-daily-journal',
        },
        {
          labelKey: 'QR',
          imgUrl: headerIcons.settings.children.qr,
          routerLink: '/settings/qr',
        },
        {
          labelKey: 'DEFAULT_ACCOUNTS',
          imgUrl: headerIcons.settings.children.defaultAccounts,
          routerLink: '/settings/default-accounts',
        },
        {
          labelKey: 'ADD_PRINTER',
          imgUrl: headerIcons.settings.children.addPrinter,
          routerLink: '/settings/add-printer',
        },
        {
          labelKey: 'PRINTER',
          imgUrl: headerIcons.settings.children.printerSettings,
          routerLink: '/settings/printer',
        },
      ],
    },
    {
      labelKey: 'APP_INFO',
      imgUrl: headerIcons.appInfo.imgUrl,
      routerLink: '/app-info',
      children: [
        {
          labelKey: 'PROFILE',
          imgUrl: headerIcons.appInfo.children.profile,
          routerLink: '/app-info/profile',
        },
        {
          labelKey: 'RESTAURANT',
          imgUrl: headerIcons.appInfo.children.restaurant,
          routerLink: '/app-info/restaurant',
        },
      ],
    },
  ];
  activeLink = signal<string>('/');
  prevActiveLink = signal<string>('/');
  isShowingMenu = signal(true);

  ngAfterViewInit(): void {
    // setTimeout(() => {
    // this.activeLink = this.router.url;
    // this.prevActiveLink = this.router.url;
    const parentRoute = this.getParent(this.router.url) ?? this.router.url;
    const el = document.getElementById(`header-link-wrapper-${parentRoute}`);
    // console.log(parentRoute, this.router.url, el);
    this.toggleActiveLink({ routerLink: parentRoute, isLink: true }, el!);
    // this.changeDetectionRef.markForCheck();
    this.toggleActiveLink({ routerLink: this.router.url }, el!);
    // this.changeDetectionRef.markForCheck();
    // }, 1000);
  }

  /**
   *
   */
  constructor() {
    super();
    // effect(() => {
    //   console.log('activeLink (s): ', this.activeLink());
    // });
  }

  getParent(childRoute: string) {
    return this.navItems.find((p) => p.children?.some((c) => c.routerLink === childRoute))?.routerLink;
  }

  isParent(route: string) {
    return this.navItems.some((i) => i.routerLink === route);
  }

  toggleActiveLink(opts: { routerLink: string; isLink?: boolean }, el: HTMLElement) {
    //toggle overflow hidden for exact 1 second to avoid unwanted scroll
    const link = opts.routerLink;
    const navItemsContainer = this.navItemsContainer()?.nativeElement;
    if (!navItemsContainer || !el) return;
    const nav = this.nav()!.nativeElement;
    const containerRight = navItemsContainer.getBoundingClientRect().right;
    const rect = el.getBoundingClientRect();
    const offsetFromRight = containerRight - rect.right;
    nav.style.overflow = 'hidden';

    // this.nav()!.nativeElement.scrollLeft = 0;
    // setTimeout(() => {
    //   this.nav()!.nativeElement.style.overflow = 'auto';
    // }, 500);

    const moveNav = () => (navItemsContainer.style.translate = `${offsetFromRight - 10}px 0`);
    const resetNav = () => (navItemsContainer.style.translate = `0 0`);

    const isParent = this.isParent(link);
    const isPreviousParent = this.isParent(this.prevActiveLink());
    const isSameParentLink = link === this.prevActiveLink() && isParent;

    // console.log(link, isParent, isPreviousParent, isSameParentLink);

    if (isParent && opts.isLink) {
      this.isShowingMenu.set(true);
      if (this.prevActiveLink() === '/' || isPreviousParent) {
        this.activeLink.set(link);
        resetNav();
      } else {
        this.prevActiveLink.set(link);
      }
    } else if (isParent) {
      // console.log('is parent');
      if (isSameParentLink || this.isAnyChildActive(link)) {
        resetNav();
        // console.log('reset translate');
        this.isShowingMenu.set(true);
        this.prevActiveLink.set('');
      } else {
        moveNav();
        // console.log('move translate');
        this.isShowingMenu.set(false);
        this.prevActiveLink.set(link);
      }
      this.activeLink.set(link);
    } else if (!isParent) {
      this.prevActiveLink.set(link);
      this.activeLink.set(link);
      this.isShowingMenu.set(false);
    }

    // this.changeDetectionRef.markForCheck();
  }

  isAnyChildActive(parentLink: string) {
    const parent = this.navItems.find((item) => item.routerLink === parentLink);
    const isChildActive = parent?.children?.some((child) => child.routerLink === this.activeLink());
    return isChildActive;
  }

  isParentActive(parentLink: string) {
    return parentLink === this.activeLink() || this.isAnyChildActive(parentLink);
    // return this.navItems.some((item) => item.routerLink === parentLink);
  }

  isAnyChildSubLinksActive(parentLink: string) {
    const parent = this.navItems.find((item) => item.routerLink === parentLink);
    return parent?.children?.some((child) => child.subLinks?.some((subLink) => subLink === this.activeLink()));
  }

  isAnySubLinksActive(parentLink: string, childLink: string) {
    const parent = this.navItems.find((item) => item.routerLink === parentLink);
    const child = parent?.children?.find((item) => item.routerLink === childLink);
    if (!child) return false;
    if (!child.subLinks) return false;
    return child.subLinks.some((subLink) => subLink === this.activeLink());
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
