import { FormControl } from "@angular/forms";

export type ControlsOf<T> = {
  [K in keyof T]: FormControl<T[K]>;
};