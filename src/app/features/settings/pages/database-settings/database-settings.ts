import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { BaseComponent, SectionWrapper } from '@/components';
import { Button, ButtonDirective } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { MessageModule } from 'primeng/message';
import { Password } from 'primeng/password';
import { ReactiveFormsModule } from '@angular/forms';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { labeledRequiredValidator } from '@/yn-ng/utils/text-validators';
import { LoadingDisabledDirective } from '@/directives/loading-disabled';
import { MaintenanceService } from '../../services/maintenance-service';
import {
  MAINTENANCE_ACTION_OPTIONS,
  MaintenanceActionEnum,
  MaintenanceActionOption,
} from '../../types/maintenance.types';
import { AppInfoNav } from '../../components/app-info-nav/app-info-nav';

@Component({
  selector: 'app-database-settings',
  imports: [
    SectionWrapper,
    ButtonDirective,
    Button,
    Dialog,
    MessageModule,
    Password,
    ReactiveFormsModule,
    InputErrorMessageHandler,
    LoadingDisabledDirective,
    AppInfoNav,
  ],
  templateUrl: './database-settings.html',
  styleUrl: './database-settings.css',
})
export class DatabaseSettings extends BaseComponent {
  private maintenanceService = inject(MaintenanceService);

  passwordField = viewChild<Password>('passwordField');

  actionOptions = MAINTENANCE_ACTION_OPTIONS;
  selectedActions = signal<Set<MaintenanceActionEnum>>(new Set());
  confirmDialogVisible = signal(false);

  passwordFg = this.fb.group({
    password: this.fb.control('', [
      labeledRequiredValidator('يرجى إدخال كلمة المرور الحالية', 'Please enter your current password'),
    ]),
  });

  hasSelection = computed(() => this.selectedActions().size > 0);

  get canExecute(): boolean {
    const password = this.passwordFg.get('password')?.value?.trim() ?? '';
    return this.hasSelection() && password.length > 0;
  }

  selectedActionItems = computed(() =>
    this.actionOptions.filter((option) => this.selectedActions().has(option.enum)),
  );

  contextualWarnings = computed(() => {
    const selected = this.selectedActions();
    const warnings: string[] = [];

    if (selected.has('transactions')) {
      warnings.push(
        'تصفير الحركات يؤثر على العمليات الجارية المرتبطة بالطاولات والغرف والأكواخ. يُنصح بمراجعة الإجراءات المرتبطة قبل التنفيذ.',
      );
    }

    if (selected.has('catalog')) {
      warnings.push('تصفير الأصناف قد يحذف أو يعيد تعيين بيانات الأصناف والوجبات والمجموعات.');
    }

    if (selected.has('initializeSystem')) {
      warnings.push(
        'تحذير شديد: تصفير تهيئة النظام يعيد ضبط إعدادات النظام إلى القيم الافتراضية ولا يمكن التراجع عنه.',
      );
    }

    const placeActions: MaintenanceActionEnum[] = ['tables', 'rooms', 'huts'];
    const selectedPlaceActions = placeActions.filter((action) => selected.has(action));
    if (selected.has('transactions') && selectedPlaceActions.length > 0) {
      warnings.push(
        `تم اختيار تصفير الحركات مع (${selectedPlaceActions.map((a) => this.getActionLabel(a)).join('، ')}) — تأكد أن هذا هو المطلوب.`,
      );
    }

    return warnings;
  });

  dependencyHints = computed(() => {
    const selected = this.selectedActions();
    const hints: string[] = [];

    for (const option of this.actionOptions) {
      if (!option.dependsOn?.length || !selected.has(option.enum)) {
        continue;
      }

      const missingDeps = option.dependsOn.filter((dep) => !selected.has(dep));
      if (missingDeps.length > 0) {
        hints.push(
          `${option.name}: يُفضّل اختيار (${missingDeps.map((dep) => this.getActionLabel(dep)).join('، ')}) مع هذا الإجراء.`,
        );
      }
    }

    return hints;
  });

  isSelected(option: MaintenanceActionOption) {
    return this.selectedActions().has(option.enum);
  }

  toggleAction(option: MaintenanceActionOption) {
    this.selectedActions.update((current) => {
      const next = new Set(current);
      if (next.has(option.enum)) {
        next.delete(option.enum);
      } else {
        next.add(option.enum);
      }
      return next;
    });
  }

  openConfirmDialog() {
    if (!this.hasSelection()) {
      return;
    }

    this.resetPasswordForm();
    this.confirmDialogVisible.set(true);
    this.focusPasswordField();
  }

  onConfirmDialogVisibleChange(visible: boolean) {
    this.confirmDialogVisible.set(visible);
    if (!visible) {
      this.resetPasswordForm();
    }
  }

  executeActions() {
    const passwordControl = this.passwordFg.get('password');
    const password = passwordControl?.value?.trim() ?? '';

    if (!password) {
      passwordControl?.markAsTouched();
      this.focusPasswordField();
      return;
    }

    if (!this.hasSelection()) {
      return;
    }

    this.maintenanceService.runActions(this.selectedActions(), password).subscribe({
      next: () => {
        this.confirmDialogVisible.set(false);
        this.resetPasswordForm();
        this.selectedActions.set(new Set());
      },
      error: (err: unknown) => {
        // Temporary diagnostics — full backend ProblemDetails payload
        console.error('[Maintenance run-actions] HTTP error', err);
        this.resetPasswordForm();
        this.focusPasswordField();
      },
    });
  }

  private resetPasswordForm() {
    this.passwordFg.reset({ password: '' });
    this.passwordFg.markAsUntouched();
  }

  private focusPasswordField() {
    setTimeout(() => {
      this.passwordField()?.input?.nativeElement?.focus();
    });
  }

  private getActionLabel(action: MaintenanceActionEnum) {
    return this.actionOptions.find((option) => option.enum === action)?.name ?? action;
  }
}
