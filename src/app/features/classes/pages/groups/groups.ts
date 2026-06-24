import { BaseComponent, FormMode } from '@/components/base-component/base-component';
import { Component, inject, signal } from '@angular/core';
import { IGroupSearchRow, GroupSearchEnum, GroupService } from '../../services/group-service';
import { TranslatePipe } from '@ngx-translate/core';
import { LoadingDisabledDirective } from '@/directives/loading-disabled';
import { TooltipModule } from 'primeng/tooltip';
import { GroupForm } from '../../components/group-form/group-form';

@Component({
  selector: 'app-groups',
  imports: [
    TranslatePipe,
    LoadingDisabledDirective,
    TooltipModule,
    GroupForm,
  ],
  templateUrl: './groups.html',
  styleUrl: './groups.css',
})
export class Groups extends BaseComponent {
  groupService = inject(GroupService);

  groups = signal<IGroupSearchRow[]>([]);

  /** Currently selected row id — drives the embedded form mode */
  selectedGroupId = signal<number>(0);

  constructor() {
    super();
    this.searchGroups();
  }

  searchGroups() {
    this.groupService
      .search({
        paginationInfo: {
          pageIndex: 1,
          pageSize: 100,
        },
        searchFilters: [
          {
            column: GroupSearchEnum.Name,
            values: [''],
          },
        ],
        fromDate: null,
      })
      .subscribe({
        next: (res) => {
          this.groups.set(res.value.rows);
        },
      });
  }

  /** Select a row — loads the group into the embedded form */
  onRowSelect(item: IGroupSearchRow) {
    this.selectedGroupId.set(item.id);
  }

  /** Form emitted afterSave — refresh table and reset to create mode */
  onGroupSaved() {
    this.selectedGroupId.set(0);
    this.searchGroups();
  }

  /** Form emitted afterReset — clear selection */
  onGroupReset() {
    this.selectedGroupId.set(0);
  }

  /** Get effective form mode based on selection */
  get embeddedFormMode(): FormMode {
    return this.selectedGroupId() > 0 ? FormMode.Update : FormMode.Create;
  }

  /** Delete from table action column — uses confirmation dialog */
  deleteGroupFromTable(id: number, event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'هل انت متاكد من حذف المجموعة',
      header: 'حذف المجموعة',
      icon: 'pi pi-info-circle',
      rejectLabel: 'الغاء',
      rejectButtonProps: { label: 'الغاء', severity: 'secondary', outlined: true },
      acceptButtonProps: { label: 'حذف', severity: 'danger' },
      accept: () =>
        this.groupService.delete(id).subscribe({
          next: () => {
            if (this.selectedGroupId() === id) this.selectedGroupId.set(0);
            this.searchGroups();
          },
        }),
    });
  }
}
