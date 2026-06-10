import { Component, inject } from '@angular/core';
import { ToastrServices } from './services/toastr';

@Component({
  selector: 'app-toastr',
  imports: [],
  templateUrl: './toastr.html',
  styleUrl: './toastr.scss',
})
export class Toastr {
  toaster:ToastrServices=inject(ToastrServices);
}
