import { Component, DestroyRef, HostListener, inject, ViewChild } from '@angular/core';
import { PageHeader } from '../../../../../shared/ui/page-header/page-header';
import { DatePicker } from 'primeng/datepicker';
import { NgSelectComponent } from '@ng-select/ng-select';
import { Dialog } from 'primeng/dialog';
import { AutoComplete, AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgClass } from '@angular/common';
import { BUTTON_CONFIG } from '../../../../../shared/config/button-cofig';
import { FormError } from '../../../../../shared/ui/form-error/form-error';
import { entityNameValidator } from '../../../../../shared/validations/entity-name-validator';
import { FormComponentBase } from '../../../../../shared/base/form-component-base';
import { GroupsServices } from '../groups/services/groups';
import { groupData, Row } from '../groups/models/group';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CategoriesServices } from '../categories/services/categories-services';
import { Categories } from '../categories/categories';
import { UnitOfMeasure } from '../units-of-measurement/services/unit-of-measure';
import { unitOfMeasure } from '../units-of-measurement/models/unit-of-meaure';
import { onlyNumberDirective } from '../../../../../shared/directives/only-number';
import { MessageService } from 'primeng/api';
import { Totals } from '../../../../../shared/services/calculations/totals';
import { ProductCardService } from './services/product-card';
import { productType } from '../../../../../shared/Enums/product-type.enum';
import { buildSearchPayload } from '../../../../../shared/config/search-config';
import { SearchableColumnEnum } from '../../../../../shared/Enums/enumSearch';
import { RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-product-card',
  imports: [
    PageHeader,
    DatePicker,
    NgSelectComponent,
    Dialog,
    AutoCompleteModule,
    FormsModule,
    NgClass,
    ReactiveFormsModule,
    FormError,
    onlyNumberDirective,
    RouterOutlet
],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
})
export class ProductCard  {
  
}
