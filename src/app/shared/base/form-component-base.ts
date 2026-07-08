import { inject } from "@angular/core";
import { BUTTON_CONFIG } from "../config/button-cofig";
import { SharedStateServices } from "../services/shared-state-services";
import { DestroyBaseComponent } from "./destroy-base-component";
// type ActionType = 'save' | 'reset' | 'delete' | 'print' | 'string';
export abstract class FormComponentBase{

   protected readonly _sharedStateService = inject(SharedStateServices);

  
  
    isEditMode: boolean = false;
  //  actions = [
  //   { label: 'حفظ', type: 'primary', action: 'save' },
  //   { label: 'جديد', action: 'reset' },
  //   { label: 'حذف', action: 'delete' },
  //   { label: 'طباعه', action: 'print' },
  // ];
   actions: any[] = [];
    idUpdate: number = 0;
    get buttonConfig() {
        return this.isEditMode ? BUTTON_CONFIG.edit : BUTTON_CONFIG.create;
    }

    get buttonLabel(): string {
        return this.buttonConfig.label;
    }

    get buttonClass(): string {
        return this.buttonConfig.class;
    }

    refreshActions() {
    this.actions = [
      { label: this.buttonLabel, type: this.buttonClass, action: 'save' },
      { label: 'جديد', action: 'reset' },
    ];
    if (this.idUpdate > 0) {
      this.actions.push({ label: 'حذف', action: 'delete' }, { label: 'طباعه', action: 'print' });
    }
  }

    
  handleAction(action: string) {
    switch (action) {
      case 'save':
        this.save();
        break;
      case 'reset':
        this.reset();
        break;
      case 'delete':
        this.delete();
        break;
      case 'print':
        this.print();
        break;
      default:
         console.warn('Unknown action:', action);
    }
  }

abstract save(): void;
abstract reset(): void;
abstract delete(): void;
abstract print(): void;
changeButtonState(idNumber: number, isEditMode: boolean) {
  this.idUpdate=idNumber;
  this.isEditMode=isEditMode;
  this.refreshActions();
}




}