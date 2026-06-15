import { AfterViewInit, Component, effect, ElementRef, inject, signal, viewChild } from '@angular/core';
import { ImgFallback } from '@/directives/img-fallback';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { BaseComponent } from '@/components/base-component/base-component';
import headerIcons from './header-icons';
import { MenuItem } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { ProgressBarModule, ProgressBar } from 'primeng/progressbar';
import { LayoutService } from '@/layouts/services/layout-service';
import { MessageModule } from 'primeng/message';
import { Role } from '@/core';
import { AllowedRolesDirective } from '@/directives/allowed-roles';
import { filter } from 'rxjs';

export interface IMainNavItem {
    labelKey: string;
    imgUrl: string;
    action?: string;
    routerLink: string;
    children?: ISubNavItem[];
    isLink?: boolean;
    roles: number[];
}

export interface ISubNavItem {
    labelKey: string;
    imgUrl: string;
    routerLink: string;
    subLinks?: string[];
    roles: number[];
}

@Component({
    selector: 'app-header',
    imports: [ImgFallback, RouterLink, Menu, ProgressBar, MessageModule, AllowedRolesDirective],
    templateUrl: './header.html',
    styleUrl: './header.css',
})
export class Header extends BaseComponent implements AfterViewInit {
    header = viewChild<ElementRef<HTMLElement>>('header');
    nav = viewChild<ElementRef<HTMLElement>>('nav');
    navItemsContainer = viewChild<ElementRef<HTMLElement>>('navItemsContainer');

    userDetails = this.authService.userDetails;
    popUpMenuItems: MenuItem[] = [
        {
            label: 'تسجيل الخروج',
            icon: 'pi pi-sign-out',
            command: (event) => this.onLogoutClick(event.originalEvent!),
        },
        // {
        //   // label: 'الاجاراءات',
        //   items: [
        //     {
        //       label: 'تسجيل الخروج',
        //       icon: 'pi pi-sign-out',
        //       command: (event) => this.onLogoutClick(event.originalEvent!),
        //     },
        //   ],
        // },
    ];

    navItems: IMainNavItem[] = [
        // cashier
        {
            labelKey: 'CASHIER',
            imgUrl: headerIcons.home.imgUrl,
            routerLink: '/',
            isLink: true,
            roles: [Role.Admin, Role.Cashier, Role.Waiter],
        },
        // invoices and replacements
        {
            labelKey: 'INVOICES',
            imgUrl: headerIcons.invoices.imgUrl,
            routerLink: '/invoices',
            roles: [Role.Admin, Role.Cashier],
            children: [
                {
                    labelKey: 'ORDERS',
                    imgUrl: headerIcons.invoices.children.orders,
                    routerLink: '/invoices/orders',
                    roles: [Role.Admin, Role.Cashier],
                },
                {
                    labelKey: 'REFUNDS',
                    imgUrl: headerIcons.invoices.children.refunds,
                    routerLink: '/invoices/refunds',
                    roles: [Role.Admin, Role.Cashier],
                },
                {
                    labelKey: 'ROOMS',
                    imgUrl: headerIcons.replacements.children.rooms,
                    routerLink: '/invoices/replacements/rooms',
                    roles: [Role.Admin, Role.Cashier, Role.Waiter],
                },
                {
                    labelKey: 'HUTS',
                    imgUrl: headerIcons.replacements.children.huts,
                    routerLink: '/invoices/replacements/huts',
                    roles: [Role.Admin, Role.Cashier, Role.Waiter],
                },
                {
                    labelKey: 'TABLES',
                    imgUrl: headerIcons.replacements.children.tables,
                    routerLink: '/invoices/replacements/tables',
                    roles: [Role.Admin, Role.Cashier, Role.Waiter],
                },
            ],
        },
        // collections and daily journal
        {
            labelKey: 'COLLECTIONS',
            imgUrl: headerIcons.collections.imgUrl,
            routerLink: '/collections',
            roles: [Role.Admin, Role.Cashier, Role.Waiter],
            children: [
                // daily journal
                {
                    labelKey: 'DAILY_JOURNAL',
                    imgUrl: headerIcons.dailyJournal.imgUrl,
                    routerLink: '/daily-journal',
                    roles: [Role.Admin, Role.Cashier],
                },
                {
                    labelKey: 'ALL',
                    imgUrl: headerIcons.collections.children.all,
                    routerLink: '/collections/all',
                    roles: [Role.Admin, Role.Cashier, Role.Waiter],
                },
                {
                    labelKey: 'TABLES',
                    imgUrl: headerIcons.collections.children.tables,
                    routerLink: '/collections/tables',
                    roles: [Role.Admin, Role.Cashier],
                },
                {
                    labelKey: 'ROOMS',
                    imgUrl: headerIcons.collections.children.rooms,
                    routerLink: '/collections/rooms',
                    roles: [Role.Admin, Role.Cashier],
                },
                {
                    labelKey: 'HUTS',
                    imgUrl: headerIcons.collections.children.huts,
                    routerLink: '/collections/huts',
                    roles: [Role.Admin, Role.Cashier],
                },
                {
                    labelKey: 'DELIVERIES',
                    imgUrl: headerIcons.collections.children.deliveries,
                    routerLink: '/collections/deliveries',
                    roles: [Role.Admin, Role.Cashier],
                },
                {
                    labelKey: 'COMPANIES',
                    imgUrl: headerIcons.collections.children.deliveries,
                    routerLink: '/collections/company-deliveries',
                    roles: [Role.Admin, Role.Cashier],
                },
                {
                    labelKey: 'DELIVERY_SWAPPING',
                    imgUrl: headerIcons.collections.children.deliverySwapping,
                    routerLink: '/collections/delivery-swapping',
                    roles: [Role.Admin, Role.Cashier],
                },
            ],
        },
        // classes and tables
        {
            labelKey: 'CLASSES',
            imgUrl: headerIcons.classes.imgUrl,
            routerLink: '/classes',
            roles: [Role.Admin, Role.Cashier],
            children: [
                {
                    labelKey: 'GROUPS',
                    imgUrl: headerIcons.classes.children.groups,
                    routerLink: '/classes/groups',
                    roles: [Role.Admin, Role.Cashier],
                },
                {
                    labelKey: 'PRODUCTS',
                    imgUrl: headerIcons.classes.children.products,
                    routerLink: '/classes/products',
                    roles: [Role.Admin, Role.Cashier],
                },
                {
                    labelKey: 'MEALS',
                    imgUrl: headerIcons.classes.children.meals,
                    routerLink: '/classes/meals',
                    roles: [Role.Admin, Role.Cashier],
                },
                {
                    labelKey: 'COMPONENTS',
                    imgUrl: headerIcons.classes.children.components,
                    routerLink: '/classes/product-components',
                    roles: [Role.Admin, Role.Cashier],
                },
                {
                    labelKey: 'TABLES',
                    imgUrl: headerIcons.classes.children.tables,
                    routerLink: '/classes/tables',
                    roles: [Role.Admin, Role.Cashier],
                },
                {
                    labelKey: 'HUTS',
                    imgUrl: headerIcons.classes.children.huts,
                    routerLink: '/classes/huts',
                    roles: [Role.Admin, Role.Cashier],
                },
                {
                    labelKey: 'ROOMS',
                    imgUrl: headerIcons.classes.children.rooms,
                    routerLink: '/classes/rooms',
                    roles: [Role.Admin, Role.Cashier],
                },
                {
                    labelKey: 'DELIVERY_MEN',
                    imgUrl: headerIcons.classes.children.deliveryMen,
                    routerLink: '/classes/deliveries',
                    roles: [Role.Admin],
                },
            ],
        },
        // storage
        {
            labelKey: 'STORAGE',
            imgUrl: headerIcons.storage.imgUrl,
            routerLink: '/storage',
            roles: [Role.Admin, Role.Cashier],
            children: [
                {
                    labelKey: 'OPENING_BALANCES',
                    imgUrl: headerIcons.storage.children.openingBalances,
                    routerLink: '/storage/opening-balances',
                    roles: [Role.Admin, Role.Cashier],
                },
                {
                    labelKey: 'PURCHASES',
                    imgUrl: headerIcons.storage.children.purchases,
                    routerLink: '/storage/purchases',
                    roles: [Role.Admin, Role.Cashier],
                },
                {
                    labelKey: 'PURCHASES_REFUNDS',
                    imgUrl: headerIcons.storage.children.purchasesRefunds,
                    routerLink: '/storage/purchases-returns',
                    roles: [Role.Admin, Role.Cashier],
                },
                {
                    labelKey: 'INVENTORY',
                    imgUrl: headerIcons.storage.children.inventory,
                    routerLink: '/storage/inventory',
                    roles: [Role.Admin, Role.Cashier],
                },
            ],
        },
        // accounts
        {
            labelKey: 'ACCOUNTS',
            imgUrl: headerIcons.accounts.imgUrl,
            routerLink: '/accounts',
            roles: [Role.Admin],
            children: [
                {
                    labelKey: 'ACCOUNTS_TREE',
                    imgUrl: headerIcons.accounts.children.accountsTree,
                    routerLink: '/accounts/accounts-tree',
                    roles: [Role.Admin, Role.Cashier],
                },
                {
                    labelKey: 'ADD_CUSTOMER',
                    imgUrl: headerIcons.accounts.children.add,
                    routerLink: '/accounts/customers/add',
                    roles: [Role.Admin, Role.Cashier],
                },
                {
                    labelKey: 'ADD_SUPPLIER',
                    imgUrl: headerIcons.accounts.children.add,
                    routerLink: '/accounts/suppliers/add',
                    roles: [Role.Admin, Role.Cashier],
                },
                {
                    labelKey: 'JOURNALS',
                    imgUrl: headerIcons.accounts.children.journals,
                    routerLink: '/accounts/journals',
                    roles: [Role.Admin, Role.Cashier],
                },
                {
                    labelKey: 'COLLECTIVE_RECEIPTS',
                    imgUrl: headerIcons.accounts.children.collectiveReceipts,
                    routerLink: '/accounts/collective-receipts',
                    roles: [Role.Admin, Role.Cashier],
                },
                {
                    labelKey: 'COLLECTIVE_PAYMENTS',
                    imgUrl: headerIcons.accounts.children.collectivePayments,
                    routerLink: '/accounts/collective-payments',
                    roles: [Role.Admin, Role.Cashier],
                },
            ],
        },
        // settings
        {
            labelKey: 'SETTINGS',
            imgUrl: headerIcons.settings.imgUrl,
            routerLink: '/settings',
            roles: [Role.Admin, Role.Cashier, Role.Waiter],
            children: [
                {
                    labelKey: 'PROGRAM',
                    imgUrl: headerIcons.settings.children.program,
                    routerLink: '/settings/program',
                    subLinks: ['/settings/program/support', '/settings/program/language', '/settings/program/about'],
                    roles: [Role.Admin, Role.Cashier],
                },
                {
                    labelKey: 'FINANCIAL',
                    imgUrl: headerIcons.settings.children.financial,
                    routerLink: '/settings/financial',
                    roles: [Role.Admin, Role.Cashier],
                },
                {
                    labelKey: 'DAILY_JOURNAL',
                    imgUrl: headerIcons.settings.children.dailyJournal,
                    routerLink: '/settings/manage-daily-journal',
                    roles: [Role.Admin, Role.Cashier],
                },
                {
                    labelKey: 'QR',
                    imgUrl: headerIcons.settings.children.qr,
                    routerLink: '/settings/qr',
                    roles: [Role.Admin, Role.Cashier],
                },
                {
                    labelKey: 'DEFAULT_ACCOUNTS',
                    imgUrl: headerIcons.settings.children.defaultAccounts,
                    routerLink: '/settings/default-accounts',
                    roles: [Role.Admin, Role.Cashier],
                },
                {
                    labelKey: 'ADD_PRINTER',
                    imgUrl: headerIcons.settings.children.addPrinter,
                    routerLink: '/settings/add-printer',
                    roles: [Role.Admin, Role.Cashier],
                },
                {
                    labelKey: 'PRINTER',
                    imgUrl: headerIcons.settings.children.printerSettings,
                    routerLink: '/settings/printer',
                    roles: [Role.Admin, Role.Cashier],
                },
                {
                    labelKey: 'ADD_USER',
                    imgUrl: headerIcons.settings.children.add,
                    routerLink: '/settings/users/add',
                    roles: [Role.Admin],
                },
            ],
        },
        // app info
        {
            labelKey: 'APP_INFO',
            imgUrl: headerIcons.appInfo.imgUrl,
            routerLink: '/app-info',
            roles: [Role.Admin, Role.Cashier],
            children: [
                {
                    labelKey: 'PROFILE',
                    imgUrl: headerIcons.appInfo.children.profile,
                    routerLink: '/app-info/profile',
                    roles: [Role.Admin, Role.Cashier],
                },
                {
                    labelKey: 'CHANGE_PASSWORD',
                    imgUrl: headerIcons.appInfo.children.changePassword,
                    routerLink: '/app-info/change-password',
                    roles: [Role.Admin, Role.Cashier],
                },
                {
                    labelKey: 'RESTAURANT',
                    imgUrl: headerIcons.appInfo.children.restaurant,
                    routerLink: '/app-info/restaurant',
                    roles: [Role.Admin, Role.Cashier],
                },
            ],
        },
    ];
    activeLink = signal<string>('/');
    prevActiveLink = signal<string>('/');
    isShowingMenu = signal(true);

    reUpdateActiveLink() {
        const parentRoute = this.getParent(this.router.url);
        const isKnownRoute = parentRoute !== undefined || this.isParent(this.router.url);
        
        // Don't change anything for routes not in the nav tree
        if (!isKnownRoute) {
            return;
        }
        
        const effectiveParent = parentRoute ?? this.router.url;
        const el = document.getElementById(`header-link-wrapper-${effectiveParent}`);
        
        if (!el) {
            // Fallback: update signals directly when element not in DOM yet
            const isParent = this.isParent(this.router.url);
            if (isParent) {
                this.activeLink.set(this.router.url);
                this.prevActiveLink.set(this.router.url);
                this.isShowingMenu.set(true);
            } else {
                this.activeLink.set(effectiveParent);
                this.prevActiveLink.set(this.router.url);
                this.isShowingMenu.set(false);
            }
            return;
        }
        
        // Use requestAnimationFrame instead of setTimeout for reliable DOM readiness
        requestAnimationFrame(() => {
            // First: set parent as active to establish context
            this.toggleActiveLink({ routerLink: effectiveParent, isLink: true }, el);
            // Then: if current URL is a child, update to show children without nav movement
            if (this.router.url !== effectiveParent) {
                this.toggleActiveLink({ routerLink: this.router.url, skipNavMove: true }, el);
            }
        });
    }

    ngAfterViewInit(): void {
        const parentRoute = this.getParent(this.router.url);
        const isKnownRoute = parentRoute !== undefined || this.isParent(this.router.url);
        
        if (isKnownRoute) {
            const effectiveParent = parentRoute ?? this.router.url;
            const el = document.getElementById(`header-link-wrapper-${effectiveParent}`);
            if (el) {
                this.toggleActiveLink({ routerLink: effectiveParent, isLink: true }, el);
                this.toggleActiveLink({ routerLink: this.router.url }, el);
            }
        }
        
        this.reUpdateActiveLink();
    }


    constructor() {
        super();
        this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe((e) => {
            this.reUpdateActiveLink();
        });
    }

    getParent(childRoute: string) {
        return this.navItems.find((p) => p.children?.some((c) => c.routerLink === childRoute))?.routerLink;
    }

    isParent(route: string) {
        return this.navItems.some((i) => i.routerLink === route);
    }

    toggleActiveLink(opts: { routerLink: string; isLink?: boolean; skipNavMove?: boolean }, el: HTMLElement) {
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

        const moveNav = () => {
            if (opts.skipNavMove) return;
            navItemsContainer.style.translate = `${offsetFromRight - 10}px 0`;
        };
        const resetNav = () => {
            if (opts.skipNavMove) return;
            navItemsContainer.style.translate = `0 0`;
        };

        const isParent = this.isParent(link);
        const isPreviousParent = this.isParent(this.prevActiveLink());
        console.log(`
            isParent: ${isParent},
            isPreviousParent: ${isPreviousParent},
            isSameParentLink: ${link === this.prevActiveLink() && isParent}
            link: ${link},
            prevActiveLink: ${this.prevActiveLink()}

            `);
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
