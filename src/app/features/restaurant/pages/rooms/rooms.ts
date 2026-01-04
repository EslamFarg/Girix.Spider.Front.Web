import { BaseComponent } from '@/components/base-component/base-component';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from "primeng/button";
import { InputErrorMessageHandler } from "@/components/input-error-message-handler/input-error-message-handler";
import { InputGroupAddon } from "primeng/inputgroupaddon";
import { Select } from "primeng/select";
import { InputTextModule } from 'primeng/inputtext';
import { SectionWrapper } from "@/components/section-wrapper/section-wrapper";
import { Paginator, PaginatorState } from "primeng/paginator";
import { IRoomRowResponse, RoomService } from '../../services/room-service';

@Component({
  selector: 'app-rooms',
  imports: [Button, ReactiveFormsModule, InputErrorMessageHandler, InputGroupAddon, Select, InputTextModule, SectionWrapper, Paginator],
  templateUrl: './rooms.html',
  styleUrl: './rooms.css',
})
export class Rooms extends BaseComponent<IRoomRowResponse>{
initialSearchFormValue = {
    text: this.fb.control<string>('', [Validators.required]),
    categoryId: this.fb.control<number>(0, [Validators.required]),
  };
  fg = this.fb.group(this.initialSearchFormValue);

  periodOptions=[
    {label:'اليوم',value:1},
    {label:'الاسبوع',value:2},
    {label:'الشهر',value:3},
    {label:'السنة',value:4},
  ]

  roomService=inject(RoomService);

  constructor() {
    super();

    this.roomService.resetSearchRequestModel();

    //get page 1 of 10 orders
    this.roomService.search().subscribe({
      next: (res) => {
        this.items.set(res.value.rows);
      },
    });
  }

  onSubmit() {}


  first = 0;
  rows = 10;
   onPageChange(event: PaginatorState) {
    console.log(event);
    this.roomService.search({ pageIndex: event.page! + 1 }).subscribe({
      next: (res) => {
        this.items.set(res.value.rows);
      },
    });
  }
}
