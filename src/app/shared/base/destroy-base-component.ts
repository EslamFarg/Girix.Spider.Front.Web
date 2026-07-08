import { Directive, OnDestroy, inject } from '@angular/core';
import { SharedStateServices } from '../services/shared-state-services';

@Directive()
export abstract class DestroyBaseComponent implements OnDestroy {

  protected readonly _sharedStateService = inject(SharedStateServices);

  ngOnDestroy(): void {
    this._sharedStateService.clearSelectedId();
  }
}