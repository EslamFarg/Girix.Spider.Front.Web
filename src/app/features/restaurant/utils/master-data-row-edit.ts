import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';

/** TEMP — root-cause verification logging. Remove after investigation. */
const VERIFY_TAG = '[ROW-SELECT-VERIFY]';

export type RowSelectSource = 'row' | 'edit';

/** Whether a table row matches the currently loaded entity. */
export function isMasterDataRowSelected(
  rowId: number,
  currentItem: { id?: number } | null | undefined,
): boolean {
  return !!currentItem?.id && currentItem.id === rowId;
}

/** TEMP — log click source before load. */
export function logRowSelectClick(
  item: { id: number; name: string },
  source: RowSelectSource,
  screen: string,
) {
  console.log(VERIFY_TAG, {
    screen,
    source,
    phase: 'row-click',
    clickedRowId: item.id,
    clickedRowName: item.name,
  });
}

/** Load an entity into the form and enter edit mode (row-click editing). */
export function selectMasterDataRow<T extends { id?: number; name?: string }>(
  id: number,
  getById: (id: number) => Observable<T>,
  form: FormGroup,
  setCurrentItem: (item: T) => void,
  extraPatch?: Record<string, unknown>,
  debug?: { screen: string; source: RowSelectSource },
) {
  console.log(VERIFY_TAG, {
    screen: debug?.screen,
    source: debug?.source,
    phase: 'before-getById',
    requestedId: id,
  });

  return getById(id).subscribe({
    next: (res) => {
      console.log(VERIFY_TAG, {
        screen: debug?.screen,
        source: debug?.source,
        phase: 'after-getById',
        requestedId: id,
        returnedId: res?.id,
        returnedName: res?.name,
        idMatch: res?.id === id,
      });

      form.patchValue({ ...(res as object), ...extraPatch });
      setCurrentItem(res);
    },
  });
}

/** Clear form and exit edit mode (New / reset). */
export function clearMasterDataEditMode(form: FormGroup, setCurrentItem: (item: null) => void) {
  form.reset();
  setCurrentItem(null);
}
