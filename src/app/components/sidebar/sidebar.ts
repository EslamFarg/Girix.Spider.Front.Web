import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { PanelMenu } from 'primeng/panelmenu';
import { BadgeModule } from 'primeng/badge';
import { Ripple } from 'primeng/ripple';
import { CommonModule } from '@angular/common';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-sidebar',
  imports: [PanelMenu, BadgeModule, Ripple, CommonModule, RouterLink],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  items: MenuItem[] = [];

  ngOnInit() {
    this.items = [
      {
        label: 'Products',
        icon: 'pi pi-objects-column',
        badge: '',
        items: [
          {
            label: 'All Products',
            icon: 'pi pi-list',
            routerLink: '/products',
            // url: '/products',
          },
          {
            label: 'Inbox',
            icon: 'pi pi-inbox',
            badge: '5',
          },
          {
            label: 'Sent',
            icon: 'pi pi-send',
            shortcut: '⌘+S',
          },
          {
            label: 'Trash',
            icon: 'pi pi-trash',
            shortcut: '⌘+T',
          },
        ],
      },
      {
        label: 'Reports',
        icon: 'pi pi-chart-bar',
        shortcut: '⌘+R',
        items: [
          {
            label: 'Sales',
            icon: 'pi pi-chart-line',
            badge: '3',
          },
          {
            label: 'Products',
            icon: 'pi pi-list',
            badge: '6',
          },
        ],
      },
      {
        label: 'Profile',
        icon: 'pi pi-user',
        shortcut: '⌘+W',
        items: [
          {
            label: 'Settings',
            icon: 'pi pi-cog',
            shortcut: '⌘+O',
          },
          {
            label: 'Privacy',
            icon: 'pi pi-shield',
            shortcut: '⌘+P',
          },
        ],
      },
    ];
  }

  toggleAll() {
    const expanded = !this.areAllItemsExpanded();
    this.items = this.toggleAllRecursive(this.items, expanded);
  }

  private toggleAllRecursive(items: MenuItem[], expanded: boolean): MenuItem[] {
    return items.map((menuItem) => {
      menuItem.expanded = expanded;
      if (menuItem.items) {
        menuItem.items = this.toggleAllRecursive(menuItem.items, expanded);
      }
      return menuItem;
    });
  }

  private areAllItemsExpanded(): boolean {
    return this.items.every((menuItem) => menuItem.expanded);
  }
}
