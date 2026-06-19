import { AfterViewInit, Component, computed, effect, ElementRef, inject, OnDestroy, signal, viewChild } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
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
    children?: ISubNavItem[];
    roles: number[];
}

@Component({
    selector: 'app-header',
    imports: [ImgFallback, RouterLink, Menu, ProgressBar, MessageModule, AllowedRolesDirective, NgTemplateOutlet],
    templateUrl: './header.html',
    styleUrl: './header.css',
})
export class Header extends BaseComponent implements AfterViewInit, OnDestroy {
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
        // Reports
        {
            labelKey: 'REPORTS',
            imgUrl: 'reports',
            routerLink: '/reports',
            roles: [Role.Admin, Role.Cashier, Role.Waiter],
            children: [
                // ── Inventory ──────────────────────────────────────────────
                {
                    labelKey: 'INVENTORY',
                    imgUrl: '../storage',
                    routerLink: '/reports/InventoryByItems',
                    roles: [Role.Admin, Role.Cashier],
                    children: [
                        {
                            labelKey: 'INVENTORY_BY_ITEMS',
                            imgUrl: '../storage',
                            routerLink: '/reports/InventoryByItems',
                            roles: [Role.Admin, Role.Cashier],
                        },
                        {
                            labelKey: 'INVENTORY_VALUE_BY_ITEMS',
                            imgUrl: '../storage',
                            routerLink: '/reports/InventoryValueByItems',
                            roles: [Role.Admin, Role.Cashier],
                        },
                        {
                            labelKey: 'INVENTORY_VALUE_BY_GROUPS',
                            imgUrl: '../storage',
                            routerLink: '/reports/InventoryValueByGroups',
                            roles: [Role.Admin, Role.Cashier],
                        },
                        {
                            labelKey: 'ITEM_MOVEMENT',
                            imgUrl: '../storage',
                            routerLink: '/reports/InventoryItemMovementFull',
                            roles: [Role.Admin, Role.Cashier],
                            children: [
                                {
                                    labelKey: 'ITEM_MOVEMENT_FULL',
                                    imgUrl: '../storage',
                                    routerLink: '/reports/InventoryItemMovementFull',
                                    roles: [Role.Admin, Role.Cashier],
                                },
                                {
                                    labelKey: 'ITEM_MOVEMENT_ACTUAL',
                                    imgUrl: '../storage',
                                    routerLink: '/reports/InventoryItemMovementActual',
                                    roles: [Role.Admin, Role.Cashier],
                                },
                            ],
                        },
                    ],
                },
                // ── Purchases ──────────────────────────────────────────────
                {
                    labelKey: 'PURCHASES',
                    imgUrl: '../storage',
                    routerLink: '/reports/PurchasesList',
                    roles: [Role.Admin, Role.Cashier],
                    children: [
                        {
                            labelKey: 'PURCHASES_LIST',
                            imgUrl: '../storage',
                            routerLink: '/reports/PurchasesList',
                            roles: [Role.Admin, Role.Cashier],
                        },
                        {
                            labelKey: 'PURCHASES_ITEMS_DETAILS',
                            imgUrl: '../storage',
                            routerLink: '/reports/PurchasesItemsDetails',
                            roles: [Role.Admin, Role.Cashier],
                        },
                        {
                            labelKey: 'PURCHASE_RETURNS_LIST',
                            imgUrl: '../storage',
                            routerLink: '/reports/PurchaseReturnsList',
                            roles: [Role.Admin, Role.Cashier],
                        },
                        {
                            labelKey: 'PURCHASE_RETURNS_ITEMS_DETAILS',
                            imgUrl: '../storage',
                            routerLink: '/reports/PurchaseReturnsItemsDetails',
                            roles: [Role.Admin, Role.Cashier],
                        },
                    ],
                },
                // ── Sales ──────────────────────────────────────────────────
                {
                    labelKey: 'SALES',
                    imgUrl: '../collections',
                    routerLink: '/reports/SalesList',
                    roles: [Role.Admin, Role.Cashier],
                    children: [
                        {
                            labelKey: 'SALES_LIST',
                            imgUrl: '../collections',
                            routerLink: '/reports/SalesList',
                            roles: [Role.Admin, Role.Cashier],
                        },
                        {
                            labelKey: 'SALES_ITEMS_DETAILS',
                            imgUrl: '../collections',
                            routerLink: '/reports/SalesItemsDetails',
                            roles: [Role.Admin, Role.Cashier],
                        },
                        {
                            labelKey: 'SALES_RETURNS_LIST',
                            imgUrl: '../collections',
                            routerLink: '/reports/SalesReturnsList',
                            roles: [Role.Admin, Role.Cashier],
                        },
                        {
                            labelKey: 'SALES_RETURNS_ITEMS_DETAILS',
                            imgUrl: '../collections',
                            routerLink: '/reports/SalesReturnsItemsDetails',
                            roles: [Role.Admin, Role.Cashier],
                        },
                        {
                            labelKey: 'SALES_Employees',
                            imgUrl: '../customers',
                            routerLink: '/reports/SalesCustomers',
                            roles: [Role.Admin, Role.Cashier],
                        },
                        {
                            labelKey: 'SALES_MINIITEMS',
                            imgUrl: '../collections',
                            routerLink: '/reports/SalesCashiers',
                            roles: [Role.Admin, Role.Cashier],
                        },
                        {
                            labelKey: 'SALES_DELIVERY',
                            imgUrl: '../collections',
                            routerLink: '/reports/SalesDelivery',
                            roles: [Role.Admin, Role.Cashier],
                        },
                        {
                            labelKey: 'DAILY_SALES_MOVEMENT',
                            imgUrl: '../collections',
                            routerLink: '/reports/DailySalesMovement',
                            roles: [Role.Admin, Role.Cashier],
                        },
                    ],
                },
                // ── Accounts ───────────────────────────────────────────────
                {
                    labelKey: 'ACCOUNTS',
                    imgUrl: '../accounts',
                    routerLink: '/reports/SupplierStatement',
                    roles: [Role.Admin],
                    children: [
                        {
                            labelKey: 'SUPPLIER_STATEMENT',
                            imgUrl: '../accounts',
                            routerLink: '/reports/SupplierStatement',
                            roles: [Role.Admin],
                        },
                        {
                            labelKey: 'CUSTOMER_STATEMENT',
                            imgUrl: '../accounts',
                            routerLink: '/reports/CustomerStatement',
                            roles: [Role.Admin],
                        },
                        {
                            labelKey: 'SingleItemProfit',
                            imgUrl: '../accounts',
                            routerLink: '/reports/SingleItemProfit',
                            roles: [Role.Admin],
                        },
                        {
                            labelKey: 'TrialBalance',
                            imgUrl: '../accounts',
                            routerLink: '/reports/TrialBalance',
                            roles: [Role.Admin],
                        },
                        {
                            labelKey: 'GroupedTrialBalance',
                            imgUrl: '../accounts',
                            routerLink: '/reports/GroupedTrialBalance',
                            roles: [Role.Admin],
                        },
                        {
                            labelKey: 'AccountGroupBalance',
                            imgUrl: '../accounts',
                            routerLink: '/reports/AccountGroupBalance',
                            roles: [Role.Admin],
                        },
                        {
                            labelKey: 'GeneralLedger',
                            imgUrl: '../accounts',
                            routerLink: '/reports/GeneralLedger',
                            roles: [Role.Admin],
                        },
                        {
                            labelKey: 'AccountStatement',
                            imgUrl: '../accounts',
                            routerLink: '/reports/AccountStatement',
                            roles: [Role.Admin],
                        },
                        {
                            labelKey: 'BalanceSheet',
                            imgUrl: '../accounts',
                            routerLink: '/reports/BalanceSheet',
                            roles: [Role.Admin],
                        },
                        {
                            labelKey: 'IncomeStatement',
                            imgUrl: '../accounts',
                            routerLink: '/reports/IncomeStatement',
                            roles: [Role.Admin],
                        },
                        {
                            labelKey: 'Customers',
                            imgUrl: '../customers',
                            routerLink: '/reports/Customers',
                            roles: [Role.Admin],
                        },
                        {
                            labelKey: 'Suppliers',
                            imgUrl: '../accounts',
                            routerLink: '/reports/Suppliers',
                            roles: [Role.Admin],
                        },
                        {
                            labelKey: 'DailyTransaction',
                            imgUrl: '../accounts',
                            routerLink: '/reports/DailyTransaction',
                            roles: [Role.Admin],
                        },
                        {
                            labelKey: 'MiniDailyJournal',
                            imgUrl: '../accounts',
                            routerLink: '/reports/MiniDailyJournal',
                            roles: [Role.Admin],
                        },
                        {
                            labelKey: 'Vat',
                            imgUrl: '../accounts',
                            routerLink: '/reports/Vat',
                            roles: [Role.Admin],
                        },
                        {
                            labelKey: 'SelectiveTax',
                            imgUrl: '../accounts',
                            routerLink: '/reports/SelectiveTax',
                            roles: [Role.Admin],
                        },
                        {
                            labelKey: 'FINANCIAL_STATEMENT',
                            imgUrl: '../accounts',
                            routerLink: '/reports/FinancialStatement',
                            roles: [Role.Admin],
                        },
                        {
                            labelKey: 'CategoryProfit',
                            imgUrl: '../accounts',
                            routerLink: '/reports/CategoryProfit',
                            roles: [Role.Admin],
                        },
                    ],
                },
            ],
        }
    ];

    activeLink = signal<string>('/');
    prevActiveLink = signal<string>('/');
    isShowingMenu = signal(true);
    private _overflowTimeout: number | undefined;

    // Track which nested items are expanded
    expandedLinks = signal<Set<string>>(new Set());

    isActiveLinkParent = computed(() => this.isParent(this.activeLink()));

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

        // When menu mode toggles, ensure nav overflow is restored
        effect(() => {
            const showing = this.isShowingMenu();
            if (showing) {
                // Collapse all nested children when returning to main menu
                this.expandedLinks.set(new Set());
            }
            const nav = this.nav()?.nativeElement;
            if (nav) {
                // Clear any pending overflow restore
                window.clearTimeout(this._overflowTimeout);
                // Small delay to let the transition start, then restore overflow
                this._overflowTimeout = window.setTimeout(() => {
                    nav.style.overflow = '';
                }, 100);
            }
        });
    }

    // ── Recursive Navigation Helpers ───────────────────────────────────────────

    getParent(childRoute: string): string | undefined {
        for (const parent of this.navItems) {
            const found = this._findParentInChildren(childRoute, parent.children);
            if (found) return parent.routerLink;
        }
        return undefined;
    }

    private _findParentInChildren(childRoute: string, children?: ISubNavItem[]): string | undefined {
        if (!children) return undefined;
        for (const child of children) {
            if (child.routerLink === childRoute) return child.routerLink;
            // Also check if this child is a parent of the target
            if (child.children) {
                const deeper = this._findParentInChildren(childRoute, child.children);
                if (deeper !== undefined) return child.routerLink;
            }
        }
        return undefined;
    }

    isParent(route: string): boolean {
        return this.navItems.some((i) => i.routerLink === route);
    }

    /** Check if any node in the tree (at any depth) matches the route */
    private _findNode(route: string, items?: ISubNavItem[]): ISubNavItem | undefined {
        if (!items) return undefined;
        for (const item of items) {
            if (item.routerLink === route) return item;
            if (item.children) {
                const found = this._findNode(route, item.children);
                if (found) return found;
            }
        }
        return undefined;
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

        // Restore scroll after transition completes (500ms matches CSS transition duration)
        const transitionDuration = 550;
        window.clearTimeout(this._overflowTimeout);
        this._overflowTimeout = window.setTimeout(() => {
            nav.style.overflow = '';
        }, transitionDuration);

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

        if (isParent && opts.isLink) {
            this.isShowingMenu.set(true);
            if (this.prevActiveLink() === '/' || isPreviousParent) {
                this.activeLink.set(link);
            } else {
                this.prevActiveLink.set(link);
            }
        } else if (isParent) {
            if (isSameParentLink || this.isAnyChildActive(link)) {
                this.isShowingMenu.set(true);
                this.prevActiveLink.set('');
            } else {
                this.isShowingMenu.set(false);
                this.prevActiveLink.set(link);
            }
            this.activeLink.set(link);
        } else if (!isParent) {
            this.prevActiveLink.set(link);
            this.activeLink.set(link);
            this.isShowingMenu.set(false);
        }
    }

    isAnyChildActive(parentLink: string): boolean {
        const parent = this.navItems.find((item) => item.routerLink === parentLink);
        if (!parent?.children) return false;
        return this._hasActiveDescendant(parent.children);
    }

    private _hasActiveDescendant(children: ISubNavItem[]): boolean {
        for (const child of children) {
            if (child.routerLink === this.activeLink()) return true;
            if (child.children && this._hasActiveDescendant(child.children)) return true;
            // Also check subLinks
            if (child.subLinks?.some((sl) => sl === this.activeLink())) return true;
        }
        return false;
    }

    isParentActive(parentLink: string): boolean {
        return parentLink === this.activeLink() || this.isAnyChildActive(parentLink);
    }

    isAnyChildSubLinksActive(parentLink: string): boolean {
        const parent = this.navItems.find((item) => item.routerLink === parentLink);
        if (!parent?.children) return false;
        return this._hasSubLinksActiveDescendant(parent.children);
    }

    private _hasSubLinksActiveDescendant(children: ISubNavItem[]): boolean {
        for (const child of children) {
            if (child.subLinks?.some((sl) => sl === this.activeLink())) return true;
            if (child.children && this._hasSubLinksActiveDescendant(child.children)) return true;
        }
        return false;
    }

    isAnySubLinksActive(parentLink: string, childLink: string): boolean {
        const parent = this.navItems.find((item) => item.routerLink === parentLink);
        const child = this._findChildRecursive(parent?.children, childLink);
        if (!child) return false;
        if (!child.subLinks) return false;
        return child.subLinks.some((subLink) => subLink === this.activeLink());
    }

    private _findChildRecursive(children: ISubNavItem[] | undefined, link: string): ISubNavItem | undefined {
        if (!children) return undefined;
        for (const child of children) {
            if (child.routerLink === link) return child;
            if (child.children) {
                const found = this._findChildRecursive(child.children, link);
                if (found) return found;
            }
        }
        return undefined;
    }

    /** Get all ancestor routerLinks for a given route (excluding the route itself) */
    private _getAncestorLinks(route: string): string[] {
        const result: string[] = [];
        for (const parent of this.navItems) {
            if (this._collectAncestors(route, parent.children, result, [parent.routerLink])) {
                return result;
            }
        }
        return result;
    }

    private _collectAncestors(route: string, items: ISubNavItem[] | undefined, result: string[], parentChain: string[] = []): boolean {
        if (!items) return false;
        for (const item of items) {
            if (item.routerLink === route) {
                result.push(...parentChain);
                return true;
            }
            if (item.children) {
                const found = this._collectAncestors(route, item.children, result, [...parentChain, item.routerLink]);
                if (found) return true;
            }
        }
        return false;
    }

    // ── Expand / Collapse for nested items ────────────────────────────────────

    isExpanded(link: string): boolean {
        return this.expandedLinks().has(link);
    }

    toggleExpanded(link: string, event?: Event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        this.expandedLinks.update((set) => {
            const next = new Set(set);
            if (next.has(link)) {
                next.delete(link);
            } else {
                // Get ancestors of the new item
                const ancestors = new Set(this._getAncestorLinks(link));
                // Keep only ancestors of the new item (they're part of the path),
                // remove siblings and unrelated branches
                for (const expanded of Array.from(next)) {
                    if (!ancestors.has(expanded)) {
                        next.delete(expanded);
                    }
                }
                next.add(link);
            }
            return next;
        });
    }

    /** Handle click on a child item that may have its own children */
    onChildClick(item: ISubNavItem, parentEl: HTMLElement, event: Event) {
        if (item.children && item.children.length > 0) {
            // Non-leaf: toggle expansion
            this.toggleExpanded(item.routerLink, event);
        } else {
            // Leaf: navigate
            const targetLink = item.subLinks ? item.subLinks[0] : item.routerLink;
            this.toggleActiveLink({ routerLink: targetLink, isLink: true }, parentEl);
        }
    }

    /** Get the effective router link for an item (first leaf if it has children) */
    getEffectiveLink(item: ISubNavItem): string {
        if (item.subLinks && item.subLinks.length > 0) return item.subLinks[0];
        if (item.children && item.children.length > 0) {
            return this.getEffectiveLink(item.children[0]);
        }
        return item.routerLink;
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
        });
    }

    override ngOnDestroy(): void {
        window.clearTimeout(this._overflowTimeout);
    }
}
